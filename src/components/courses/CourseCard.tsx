import React from 'react';
import { Card } from '../Card';
import { usePage } from '../../context/PageContext';

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  level: number;
  createdBy: string;
  enrollmentCount: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  name,
  description,
  level,
  createdBy,
  enrollmentCount,
}) => {
  const { setCurrentPage, setCourseId, setBreadcrumbs } = usePage();
  
  const handleCardClick = () => {
    setCourseId(courseId);
    setBreadcrumbs(['Courses', name]);
    setCurrentPage('CourseDetail');
  };
  
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
      onClick={handleCardClick}
    />
  );
};