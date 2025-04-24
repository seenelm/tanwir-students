import React, { useEffect, useState } from 'react';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { AssignmentDisplay } from '../../services/assignments/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { AuthService, UserRole } from '../../services/auth';
import { CourseService } from '../../services/courses/service/CourseService';
import confusedImage from '../../assets/confused.webp';

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const authService = AuthService.getInstance();
        const courseService = CourseService.getInstance();
        const assignmentService = AssignmentService.getInstance();

        // Get user role
        const role = await authService.getUserRole();
        setUserRole(role);

        // Get assignments
        const assignmentSummaries = await assignmentService.getAssignments();
        
        // Filter assignments based on role
        let filteredAssignments = assignmentSummaries;
        if (role === 'student') {
          // Get all courses and filter for enrolled ones
          const courses = await courseService.getCourses();
          const currentUser = authService.getCurrentUser();
          
          if (currentUser) {
            const enrolledIds = courses.course
              .filter(course => 
                course.Enrollments.some(enrollment => 
                  enrollment.EnrolleeId === currentUser.uid
                )
              )
              .map(course => course.Id);
            
            // Filter assignments for enrolled courses
            filteredAssignments = assignmentSummaries.filter(summary => 
              enrolledIds.includes(summary.CourseId)
            );
          }
        }
        
        const formattedAssignments = filteredAssignments.map(summary => ({
          id: summary.AssignmentId,
          title: summary.Title,
          courseId: summary.CourseId,
          course: summary.CourseName,
          description: '',
          dueDate: new Date(summary.DueDate).toLocaleDateString(),
          totalPoints: summary.Points,
        }));
        
        setAssignments(formattedAssignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array since we only want to fetch once on mount

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

  if (loading) {
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
