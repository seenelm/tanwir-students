import React, { useEffect, useState } from 'react';
import { Assignment, QuizAssignment, GoogleFormAssignment } from '../../services/assignments/types/assignment';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { usePage } from '../../context/PageContext';
import { auth } from '../../config/firebase';

type TabType = 'details' | 'attachments' | 'discussions' | 'questions' | 'form';

export const AssignmentDetail: React.FC = () => {
  const { assignmentId, setBreadcrumbs } = usePage();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [tabData, setTabData] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const service = AssignmentService.getInstance();
  const [existingResult, setExistingResult] = useState<QuizResult | null>(null);

  type QuizResult = {
    id?: string;
    userId: string;
    assignmentId: string;
    score: number;
    totalPoints: number;
    earnedPoints: number;
    answers: Record<string, string>;
    completed: boolean;
    passed?: boolean;
    submittedAt?: any; // Firestore Timestamp
  };

  useEffect(() => {
    if (!assignmentId) return;

    let cancelled = false;

    const fetchAssignmentAndResult = async () => {
      try {
        const result = await service.getAssignmentById(assignmentId);
        if (cancelled) return;

        if (result) {
          setBreadcrumbs(['Courses', result.CourseName, result.Title]);
        }
        setAssignment(result);
        setLoading(false);

        // If user is signed in and this is a quiz, load any existing submission
        const currentUser = auth.currentUser;
        
        // Check if this is a quiz assignment by looking for quiz-specific properties or questions
        let isQuizAssignmentCheck = result && ('passingScore' in result || 'timeLimit' in result);
        
        // If not identified as a quiz by properties, check if it has questions or if title contains "Quiz"
        if (!isQuizAssignmentCheck && result) {
          // Check if title contains "Quiz"
          if (result.Title && result.Title.toLowerCase().includes('quiz')) {
            isQuizAssignmentCheck = true;
          }
          
          // Also check if we have questions loaded for this assignment
          if (!isQuizAssignmentCheck) {
            const questions = await service.getQuestions(assignmentId);
            isQuizAssignmentCheck = questions && questions.length > 0;
          }
        }
        
        if (currentUser && isQuizAssignmentCheck) {
          const userRes = await service.getUserQuizResult(assignmentId, currentUser.uid);
          
          if (!cancelled && userRes) {
            setExistingResult(userRes as QuizResult);
            setSelectedAnswers(userRes.answers || {});
            setQuizSubmitted(!!userRes.completed);      // disables inputs & hides submit
            setQuizScore(
              typeof userRes.score === 'number' ? userRes.score : null
            );
            setSaveStatus('success');
          } else {
            console.log('No existing quiz result found. You can add a button to create a test result.');
          }
        }
      } catch (e) {
        console.error('Error loading assignment/result', e);
        setLoading(false);
      }
    };

    fetchAssignmentAndResult();
    return () => { cancelled = true; };
  }, [assignmentId, setBreadcrumbs]);

  useEffect(() => {
    if (!assignmentId || activeTab === 'details') return;
    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        let data = [];
        switch (activeTab) {
          case 'attachments':
            data = await service.getAttachments(assignmentId);
            break;
          case 'discussions':
            data = await service.getDiscussions(assignmentId);
            break;
          case 'questions':
            data = await service.getQuestions(assignmentId);
            break;
        }
        setTabData(data);
      } catch (error) {
        console.error(`Error loading ${activeTab}:`, error);
      } finally {
        setTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab, assignmentId]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleQuizSubmit = async () => {
    if (!tabData || tabData.length === 0 || !assignment) return;
    
    setSaveStatus('saving');
    let totalPoints = 0;
    let earnedPoints = 0;
    
    tabData.forEach(question => {
      const questionPoints = question.points || 0;
      totalPoints += questionPoints;
      
      // Find the selected option for this question
      const selectedOptionId = selectedAnswers[question.id];
      if (selectedOptionId) {
        // Find if the selected option is correct
        const selectedOption = question.options?.find((opt: any) => opt.id === selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          earnedPoints += questionPoints;
        }
      }
    });
    
    const score = Math.round((earnedPoints / totalPoints) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    // Save results to Firestore
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Check if assignment has passingScore (is a QuizAssignment)
        const quizAssignment = assignment as QuizAssignment;
        const passed = quizAssignment.passingScore ? score >= quizAssignment.passingScore : null;
        await service.saveQuizResult(assignmentId!, currentUser.uid, {
          score,
          totalPoints,
          earnedPoints,
          answers: selectedAnswers,
          completed: true,
          passed: passed ?? undefined
        });
        setSaveStatus('success');
      } else {
        console.error('No authenticated user found');
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      setSaveStatus('error');
    }
  };

  const renderContent = () => {
    if (tabLoading) return <p className="loading">Loading {activeTab}...</p>;

    if (activeTab === 'details' && assignment) {
      return (
        <div className="assignment-details">
          <h3>Assignment Details</h3>
          <div className="syllabus-content">
            <div className="overview-section">
              <h5>About this assignment</h5>
              <p>{assignment.Description}</p>
            </div>
            
            <div className="overview-section">
              <h5>Assignment Information</h5>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Course</span>
                  <span className="info-value">{assignment.CourseName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created By</span>
                  <span className="info-value">{assignment.CreatedBy}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Due Date</span>
                  <span className="info-value">{new Date(assignment.DueDate).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Points</span>
                  <span className="info-value">{assignment.Points}</span>
                </div>
                {assignment?.passingScore && (
                  <div className="info-item">
                    <span className="info-label">Passing Score</span>
                    <span className="info-value">{assignment.passingScore}%</span>
                  </div>
                )}
                {assignment?.timeLimit && (
                  <div className="info-item">
                    <span className="info-label">Time Limit</span>
                    <span className="info-value">{assignment.timeLimit} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'form' && assignment?.type === 'google-form') {
      const googleFormAssignment = assignment as GoogleFormAssignment;
      const embedUrl = googleFormAssignment.embedUrl || googleFormAssignment.formUrl;
      
      return (
        <div className="google-form-container">
          <iframe 
            src={embedUrl}
            width="100%" 
            height="800" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            title="Google Form"
            style={{ border: 'none', minHeight: '800px' }}
          >
            Loading…
          </iframe>
        </div>
      );
    }

    if (tabData.length === 0) {
      return <p className="empty">No {activeTab} available.</p>;
    }

    return (
      <div className="data-list">
        {activeTab === 'questions' && (
          <>
            {existingResult ? (
              <div className="quiz-container">
                <h3>Quiz Questions</h3>
                {tabData.map((item: any, index: number) => (
                  <div key={item.id || index} className="quiz-question">
                    <h4>Question {index + 1}: {item.text} ({item.points} pts)</h4>
                    <div className="quiz-options">
                      {item.options && item.options.map((option: any) => (
                        <div key={option.id} className="quiz-option">
                          <label className={`option-label ${existingResult.answers[item.id] === option.id ? 'selected' : ''} ${quizSubmitted && option.isCorrect ? 'correct-answer' : ''}`}>
                            <input 
                              type="radio" 
                              name={`question-${item.id}`} 
                              value={option.id}
                              checked={existingResult.answers[item.id] === option.id}
                              disabled
                            />
                            {option.text}
                            {quizSubmitted && option.isCorrect && <span className="correct-indicator"> ✓</span>}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="quiz-results">
                  <h3>Quiz Results</h3>
                  <p>Your score: {existingResult.score}%</p>
                  {assignment && assignment.passingScore && (
                    <p>
                      {existingResult.score >= assignment.passingScore 
                        ? `Congratulations! You passed the quiz.` 
                        : `You did not meet the passing score of ${assignment.passingScore}%.`}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="quiz-container">
                <h3>Quiz Questions</h3>
                {tabData.map((item: any, index: number) => (
                  <div key={item.id || index} className="quiz-question">
                    <h4>Question {index + 1}: {item.text} ({item.points} pts)</h4>
                    <div className="quiz-options">
                      {item.options && item.options.map((option: any) => (
                        <div key={option.id} className="quiz-option">
                          <label className={`option-label ${quizSubmitted && option.isCorrect ? 'correct-answer' : ''}`}>
                            <input 
                              type="radio" 
                              name={`question-${item.id}`} 
                              value={option.id}
                              checked={selectedAnswers[item.id] === option.id}
                              onChange={() => handleOptionSelect(item.id, option.id)}
                              disabled={quizSubmitted}
                            />
                            {option.text}
                            {quizSubmitted && option.isCorrect && <span className="correct-indicator"> ✓</span>}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {!quizSubmitted ? (
                  <button 
                    className="submit-quiz-btn" 
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length !== tabData.length}
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="quiz-results">
                    <h3>Quiz Results</h3>
                    <p>Your score: {quizScore}%</p>
                    {assignment && assignment.passingScore && (
                      <p>
                        {quizScore! >= assignment.passingScore 
                          ? `Congratulations! You passed the quiz.` 
                          : `You did not meet the passing score of ${assignment.passingScore}%.`}
                      </p>
                    )}
                    {saveStatus === 'saving' && <p>Saving your results...</p>}
                    {saveStatus === 'success' && <p className="success-message">Your results have been saved.</p>}
                    {saveStatus === 'error' && <p className="error-message">There was an error saving your results.</p>}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {activeTab !== 'questions' && (
          <ul>
            {tabData.map((item: any, index: number) => (
              <li key={item.id || index}>{item.name || item.message}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading assignment...</div>;
  if (!assignment) return <div>Assignment not found</div>;

  // Determine which tabs to show based on assignment type
  const availableTabs: TabType[] = ['details'];
  
  console.log('Assignment type:', assignment.type);
  console.log('Full assignment object:', assignment);
  
  if (assignment.type === 'google-form') {
    availableTabs.push('form');
  } else if (assignment.type === 'quiz' || activeTab === 'questions') {
    availableTabs.push('questions');
  }

  console.log('Available tabs:', availableTabs);

  return (
    <div className="assignment-container">
      <h2>{assignment.Title}</h2>
      {existingResult && (
        <div className="existing-result-indicator">
          <p>You have already submitted this quiz on {new Date(existingResult.submittedAt?.toDate()).toLocaleString()}</p>
          <p>Score: {existingResult.score}%</p>
        </div>
      )}
      <div className="tabs">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
};
