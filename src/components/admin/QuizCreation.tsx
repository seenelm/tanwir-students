import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { CourseService } from '../../services/courses/service/CourseService';
import { QuizQuestion, QuizOption } from '../../services/assignments/types/assignment';
import { useUserRole } from '../../context/UserRoleContext';
import { AuthService } from '../../services/auth';

interface QuizCreationProps {
  courseId?: string;
}

const QuizCreation: React.FC<QuizCreationProps> = ({ courseId }) => {
  const { role } = useUserRole();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(100);
  const [passingScore, setPassingScore] = useState<number | undefined>(undefined);
  
  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState<number>(10);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [currentOption, setCurrentOption] = useState<string>('');
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourseId) return;
      
      try {
        setLoading(true);
        const courseService = CourseService.getInstance();
        const course = await courseService.getCourseById(selectedCourseId);
        
        if (course) {
          setSelectedCourseName(course.Name || course.name || '');
          
          if (course && (course.subjects || course.Subjects)) {
            const courseSubjects = course.subjects || course.Subjects || [];
            setSubjects(courseSubjects);
          } else {
            setSubjects([]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [selectedCourseId]);

  const handleAddOption = () => {
    if (!currentOption.trim()) return;
    
    const newOption: QuizOption = {
      id: uuidv4(),
      text: currentOption,
      isCorrect: false
    };
    
    setOptions([...options, newOption]);
    setCurrentOption('');
  };

  const handleSetCorrectOption = (optionId: string) => {
    setSelectedCorrectOption(optionId);
    setOptions(options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    })));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.trim() || options.length < 2 || !selectedCorrectOption) {
      setError('Questions must have text, at least 2 options, and a correct answer selected');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: uuidv4(),
      text: currentQuestion,
      points: currentQuestionPoints,
      options: options,
      type: 'multiple-choice'
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion('');
    setCurrentQuestionPoints(10);
    setOptions([]);
    setSelectedCorrectOption(null);
    setError(null);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedCourseId || !selectedSubject || !dueDate || questions.length === 0) {
      setError('Please fill in all required fields and add at least one question');
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }
    
    // Validate each question has at least two options and one correct answer
    for (const question of questions) {
      if (question.options.length < 2) {
        setError(`Question "${question.text}" must have at least two options.`);
        return;
      }
      
      if (!question.options.some(option => option.isCorrect)) {
        setError(`Question "${question.text}" must have at least one correct answer.`);
        return;
      }
    }

    try {
      setLoading(true);
      
      if (!selectedCourseName) {
        setError('Course details not loaded properly.');
        setLoading(false);
        return;
      }
      
      const assignmentService = AssignmentService.getInstance();
      const authService = AuthService.getInstance();
      const user = authService.getCurrentUser();
      
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }
      
      // Create quiz assignment
      // Parse the datetime-local value into a proper Date object
      const [datePart, timePart] = dueDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      const dueDateObj = new Date(year, month - 1, day, hours, minutes);
      
      await assignmentService.createQuizAssignment({
        title,
        description,
        courseId: selectedCourseId,
        courseName: selectedCourseName,
        subject: selectedSubject,
        dueDate: dueDateObj,
        points: totalPoints,
        questions,
        passingScore,
        createdBy: user.uid
      });

      setSuccess(true);
      setError(null);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCourseId('');
      setSelectedSubject('');
      setDueDate('');
      setTotalPoints(100);
      setPassingScore(undefined);
      setQuestions([]);
      
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return <div className="unauthorized">You must be an admin to access this page.</div>;
  }

  return (
    <div className="quiz-creation">
      <h2>Create Quiz Assignment</h2>
      
      {success && (
        <div className="success-message">
          Quiz assignment created successfully!
          <button onClick={() => setSuccess(false)}>Create Another</button>
        </div>
      )}
      
      {!success && (
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-section">
            <h3>Assignment Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Course:</label>
              <div className="selected-course">
                {selectedCourseName || 'Loading course details...'}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Select a subject</option>
                {subjects && subjects.length > 0 ? subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                )) : <option value="" disabled>
                  {selectedCourseId ? 'No subjects available' : 'Loading subjects...'}
                </option>}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="datetime-local"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="totalPoints">Total Points:</label>
              <input
                type="number"
                id="totalPoints"
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="passingScore">Passing Score % (optional):</label>
              <input
                type="number"
                id="passingScore"
                value={passingScore || ''}
                onChange={(e) => setPassingScore(e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Questions</h3>
            
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <div className="question-header">
                    <h4>Question {index + 1} ({question.points} points)</h4>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                  <p>{question.text}</p>
                  <ul className="options-list">
                    {question.options.map((option) => (
                      <li key={option.id} className={option.isCorrect ? 'correct-option' : ''}>
                        {option.text} {option.isCorrect && '✓'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="add-question-form">
              <h4>Add New Question</h4>
              
              <div className="form-group">
                <label htmlFor="questionText">Question Text:</label>
                <textarea
                  id="questionText"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="questionPoints">Points:</label>
                <input
                  type="number"
                  id="questionPoints"
                  value={currentQuestionPoints}
                  onChange={(e) => setCurrentQuestionPoints(Number(e.target.value))}
                  min="1"
                />
              </div>
              
              <div className="options-section">
                <h5>Options</h5>
                
                <ul className="options-list">
                  {options.map((option) => (
                    <li key={option.id}>
                      <span>{option.text}</span>
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(option.id)}
                        className={option.isCorrect ? 'selected-correct' : ''}
                      >
                        {option.isCorrect ? 'Correct ✓' : 'Set as Correct'}
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="add-option-form">
                  <input
                    type="text"
                    value={currentOption}
                    onChange={(e) => setCurrentOption(e.target.value)}
                    placeholder="Enter option text"
                  />
                  <button type="button" onClick={handleAddOption}>
                    Add Option
                  </button>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddQuestion}
                className="add-question-btn"
              >
                Add Question
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuizCreation;
