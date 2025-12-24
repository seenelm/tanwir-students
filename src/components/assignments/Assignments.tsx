import React from 'react';
import { AssignmentDisplay } from '../../services/assignments/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import confusedImage from '../../assets/confused.webp';
import { useAuth } from '../../context/AuthContext';
import { useUserRole } from '../../context/UserRoleContext';
import { useAssignments } from '../../queries/assignmentQueries';
import { useCourses } from '../../queries/courseQueries';

export const Assignments: React.FC = () => {
  const { user } = useAuth();
  const { role: userRole } = useUserRole();
  
  const { data: assignmentSummaries, isLoading: assignmentsLoading } = useAssignments();
  const { data: allCourses, isLoading: coursesLoading } = useCourses();
  
  const isLoading = assignmentsLoading || (userRole === 'student' && coursesLoading);
  
  // Filter and format assignments
  const assignments: AssignmentDisplay[] = React.useMemo(() => {
    if (!assignmentSummaries) return [];
    
    let filteredAssignments = assignmentSummaries;
    
    if (userRole === 'student' && user && allCourses) {
      // Get enrolled course IDs
      const enrolledIds = allCourses
        .filter(course => 
          course.Enrollments?.some(enrollment => 
            enrollment.EnrolleeId === user.uid
          )
        )
        .map(course => course.Id);
      
      // Filter assignments for enrolled courses
      filteredAssignments = assignmentSummaries.filter(summary => 
        enrolledIds.includes(summary.CourseId)
      );
    }
    
    return filteredAssignments.map(summary => ({
      id: summary.AssignmentId,
      title: summary.Title,
      courseId: summary.CourseId,
      course: summary.CourseName,
      description: '',
      dueDate: new Date(summary.DueDate).toLocaleDateString(),
      totalPoints: summary.Points,
    }));
  }, [assignmentSummaries, userRole, user, allCourses]);

  const groupByCourse = (assignments: AssignmentDisplay[]): Record<string, AssignmentDisplay[]> => {
    return assignments.reduce((groups: Record<string, AssignmentDisplay[]>, assignment) => {
      if (!groups[assignment.course]) {
        groups[assignment.course] = [];
      }
      groups[assignment.course].push(assignment);
      return groups;
    }, {});
  };

  const groupedAssignments = groupByCourse(assignments);

  if (isLoading) {
    return <div className="loading-container">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="no-assignments" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <img 
          src={confusedImage} 
          alt="Confused" 
          style={{
            width: '200px',
            height: 'auto',
            marginBottom: '1rem'
          }}
        />
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          marginTop: '1rem'
        }}>
          {userRole === 'student' 
            ? 'No assignments found for your enrolled courses'
            : 'No assignments found'}
        </p>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      {Object.entries(groupedAssignments).map(([course, assignments]) => (
        <div key={course} className="course-section">
          <div className="course-title">{course}</div>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              id={assignment.id}
              title={assignment.title}
              course={assignment.course}
              description={assignment.description}
              dueDate={assignment.dueDate}
              totalPoints={assignment.totalPoints}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
