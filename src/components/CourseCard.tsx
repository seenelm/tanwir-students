import React from 'react';
import { Card } from './Card';

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  level: number;
  createdBy: string;
  enrollmentCount: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  name,
  description,
  level,
  createdBy,
  enrollmentCount,
}) => {
  return (
    <Card
      title={name}
      subtitle={`Level: ${level}`}
      description={description}
      footer={
        <>
          <div>Created by: {createdBy}</div>
          <div>Enrolled: {enrollmentCount}</div>
        </>
      }
    />
  );
};
