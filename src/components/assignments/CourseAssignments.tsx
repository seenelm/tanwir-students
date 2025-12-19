import React, { useEffect, useState } from 'react';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { Assignment } from '../../services/assignments/types/assignment';
import { AssignmentCard } from './AssignmentCard';
// import { usePage } from '../../context/PageContext';
import { useUserRole } from '../../context/UserRoleContext';
import { GoogleFormAssignmentCreator } from './GoogleFormAssignmentCreator';
import { CourseService } from '../../services/courses/service/CourseService';

interface CourseAssignmentsProps {
  courseId: string;
}

export const CourseAssignments: React.FC<CourseAssignmentsProps> = ({ courseId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoogleFormCreator, setShowGoogleFormCreator] = useState(false);
  const [courseName, setCourseName] = useState('');
  // const { setCurrentPage, setQuizCourseId } = usePage();
  const { role } = useUserRole();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!courseId) return;
      
      try {
        const service = AssignmentService.getInstance();
        const courseAssignments = await service.getAssignmentsByCourseId(courseId);
        setAssignments(courseAssignments);
        
        // Get course name for Google Form creator
        const courseService = CourseService.getInstance();
        const course = await courseService.getCourseById(courseId);
        if (course) {
          setCourseName(course.Name || course.name || '');
        }
      } catch (error) {
        console.error('Error fetching course assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  // const handleCreateQuiz = () => {
  //   setQuizCourseId(courseId);
  //   setCurrentPage('CreateQuiz');
  // };

  const handleAssignmentCreated = async () => {
    // Refresh assignments list
    const service = AssignmentService.getInstance();
    const courseAssignments = await service.getAssignmentsByCourseId(courseId);
    setAssignments(courseAssignments);
    setShowGoogleFormCreator(false);
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="course-assignments">
        <div className="assignments-header">
          <h3>Assignments</h3>
          {isAdmin && (
            <div className="admin-buttons">
              <button 
                className="create-form-btn" 
                onClick={() => setShowGoogleFormCreator(!showGoogleFormCreator)}
              >
                {showGoogleFormCreator ? 'Cancel' : 'Add Google Form'}
              </button>
            </div>
          )}
        </div>
        
        {showGoogleFormCreator && (
          <GoogleFormAssignmentCreator
            courseId={courseId}
            courseName={courseName}
            onAssignmentCreated={handleAssignmentCreated}
          />
        )}
        
        {!showGoogleFormCreator && (
          <p className="empty">No assignments available yet.</p>
        )}
      </div>
    );
  }

  // Group assignments by subject
  const assignmentsBySubject: Record<string, Assignment[]> = {};
  
  // Add assignments to their respective subject groups
  assignments.forEach((assignment) => {
    const subject = assignment.Subject || 'Uncategorized';
    if (!assignmentsBySubject[subject]) {
      assignmentsBySubject[subject] = [];
    }
    assignmentsBySubject[subject].push(assignment);
  });

  // Sort subjects alphabetically
  const sortedSubjects = Object.keys(assignmentsBySubject).sort();

  return (
    <div className="course-assignments">
      <div className="assignments-header">
        <h3>Assignments</h3>
        {isAdmin && (
          <div className="admin-buttons">
            <button 
              className="create-form-btn" 
              onClick={() => setShowGoogleFormCreator(!showGoogleFormCreator)}
            >
              {showGoogleFormCreator ? 'Cancel' : 'Add Google Form'}
            </button>
          </div>
        )}
      </div>
      
      {showGoogleFormCreator && (
        <GoogleFormAssignmentCreator
          courseId={courseId}
          courseName={courseName}
          onAssignmentCreated={handleAssignmentCreated}
        />
      )}
      
      {sortedSubjects.map((subject) => (
        <div key={subject} className="subject-section">
          <h3 className="subject-title">{subject}</h3>
          <div className="assignments-grid small-cards">
            {assignmentsBySubject[subject].map((assignment) => (
              <AssignmentCard
                key={assignment.AssignmentId}
                id={assignment.AssignmentId}
                title={assignment.Title}
                course={assignment.CourseName || ''}
                description={assignment.Description}
                dueDate={assignment.DueDate ? new Date(assignment.DueDate).toLocaleDateString() : 'No due date'}
                totalPoints={assignment.Points || 0}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};