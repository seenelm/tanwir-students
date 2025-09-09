import React from 'react';
import { Card } from '../Card';
import { usePage } from '../../context/PageContext';

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  section?: string;
  year?: string;
  createdBy: string;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  name,
  description,
  section,
  year,
  createdBy,
  isEnrolled = false,
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
      subtitle={`${section ? `Section: ${section}` : ''}${section && year ? ' • ' : ''}${year ? `Year: ${year}` : ''}`}
      description={
        <>
          <div>{description}</div>
          {isEnrolled && (
            <div style={{ marginTop: '10px', color: 'green' }}>
              ✓ Enrolled
            </div>
          )}
        </>
      }
      footer={
        <>
          <div className="instructors-list">
            <div className="instructor-label">Taught by:</div>
            {createdBy.split(',').map((instructor, index) => (
              <div key={index} className="instructor-name">
                {instructor.trim()}
              </div>
            ))}
          </div>
        </>
      }
      onClick={handleCardClick}
    />
  );
};