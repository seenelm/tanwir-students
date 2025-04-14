import React, { useEffect, useState } from 'react';
import { AssignmentService } from '../../services/assignments/service/AssignmentService';
import { AssignmentDisplay } from '../../services/assignments/types/assignment';
import { AssignmentCard } from './AssignmentCard';

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const service = AssignmentService.getInstance();
        const assignmentSummaries = await service.getAssignments();
        
        const formattedAssignments = assignmentSummaries.map(summary => ({
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

    fetchAssignments();
  }, []);

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
    return <div className="no-assignments">No assignments found</div>;
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
