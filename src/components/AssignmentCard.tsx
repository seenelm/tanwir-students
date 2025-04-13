import React from 'react';
import { Card } from './Card';

interface AssignmentCardProps {
  title: string;
  course: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  onClick?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  course,
  description,
  dueDate,
  totalPoints,
  onClick,
}) => {
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
    >
      {/* If you want to make the whole card clickable */}
      {onClick && (
        <button onClick={onClick} style={{ display: 'none' }} aria-hidden="true" />
      )}
    </Card>
  );
};
