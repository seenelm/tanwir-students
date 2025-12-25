import React from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../Card';

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
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/assignments/${id}`);
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
