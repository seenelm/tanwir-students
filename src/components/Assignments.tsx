import React, { useEffect, useState } from 'react';
import { AssignmentService } from '../services/assignments/service/AssignmentService';
import { AssignmentCard } from './AssignmentCard'; // Make sure this is a React component now
import '../styles/assignments.css'; // Optional: move inline styles here

interface Assignment {
  id: number;
  courseId: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  totalPoints: number;
}

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const service = new AssignmentService();
        const response = await service.getAssignments({});
        const formattedAssignments = response.assignments.map((assignment: any) => ({
          id: assignment.id || '',
          title: assignment.Title,
          courseId: assignment.CourseId,
          course: assignment.CourseName,
          description: assignment.Description,
          dueDate: new Date(assignment.DueDate).toLocaleDateString(),
          totalPoints: assignment.Points,
        }));
        setAssignments(formattedAssignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  const groupByCourse = (assignments: Assignment[]): Record<string, Assignment[]> => {
    return assignments.reduce((groups: Record<string, Assignment[]>, assignment) => {
      if (!groups[assignment.course]) {
        groups[assignment.course] = [];
      }
      groups[assignment.course].push(assignment);
      return groups;
    }, {});
  };

  const groupedAssignments = groupByCourse(assignments);

  return (
    <div className="assignments-container">
      {Object.entries(groupedAssignments).map(([course, assignments]) => (
        <div key={course} className="course-section">
          <div className="course-title">{course}</div>
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
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
