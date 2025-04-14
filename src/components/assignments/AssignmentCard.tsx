import React from 'react';
import { Card } from '../Card';
import { usePage } from '../../context/PageContext';

interface AssignmentCardProps {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  totalPoints: number;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  id,
  title,
  course,
  description,
  dueDate,
  totalPoints,
}) => {
  const { setCurrentPage, setBreadcrumbs, setAssignmentId } = usePage();
  
  const handleCardClick = () => {
    setAssignmentId(id);
    setBreadcrumbs(['Assignments', title]);
    setCurrentPage('AssignmentDetail');
  };
  
  return (
    <Card
      title={title}
      subtitle={course}
      description={description}
      footer={
        <>
          <div>Due: {dueDate}</div>
          <div>{totalPoints} points</div>
        </>
      }
      onClick={handleCardClick}
    />
  );
};
