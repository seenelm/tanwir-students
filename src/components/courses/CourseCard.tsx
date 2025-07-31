import React, { useState } from 'react';
import { Card } from '../Card';
import { usePage } from '../../context/PageContext';
import { CourseVariation } from '../../services/courses/types/course';

interface CourseCardProps {
  courseId: string;
  name: string;
  description: string;
  level: number;
  createdBy: string;
  enrollmentCount: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  isStudent?: boolean;
  enrollmentStatus?: {
    success: boolean;
    message: string;
    courseId: string;
  } | null;
  // Square-related props
  price?: number;
  paymentLink?: string;
  imageUrl?: string;
  onPurchase?: (variationId?: string) => void;
  variations?: CourseVariation[];
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  name,
  description,
  level,
  createdBy,
  enrollmentCount,
  isEnrolled = false,
  onEnroll,
  isStudent = false,
  enrollmentStatus = null,
  // Square-related props
  price,
  paymentLink,
  imageUrl,
  onPurchase,
  variations = [],
  eventStartDate,
  eventEndDate,
  eventLocation,
}) => {
  const { setCurrentPage, setCourseId, setBreadcrumbs } = usePage();
  const [selectedVariation, setSelectedVariation] = useState<string | undefined>(
    variations.length > 0 ? variations[0].variationId : undefined
  );
  
  const handleCardClick = () => {
    setCourseId(courseId);
    setBreadcrumbs(['Courses', name]);
    setCurrentPage('CourseDetail');
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the enroll button
    if (onEnroll) {
      onEnroll();
    }
  };
  
  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the purchase button
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else if (onPurchase) {
      onPurchase(selectedVariation);
    }
  };

  const handleVariationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariation(e.target.value);
  };
  
  // Find the selected variation price
  const selectedPrice = selectedVariation && variations.length > 0
    ? variations.find(v => v.variationId === selectedVariation)?.price || price
    : price;
  
  // Format dates if available
  const formattedStartDate = eventStartDate 
    ? new Date(eventStartDate).toLocaleDateString() 
    : null;
  const formattedEndDate = eventEndDate 
    ? new Date(eventEndDate).toLocaleDateString() 
    : null;
  
  return (
    <Card
      title={name}
      subtitle={`Level: ${level}`}
      description={
        <>
          <div>{description}</div>
          
          {/* Display event information if available */}
          {(formattedStartDate || eventLocation) && (
            <div className="course-event-info">
              {formattedStartDate && formattedEndDate && (
                <div className="course-dates">
                  <span className="date-label">Dates:</span> {formattedStartDate} - {formattedEndDate}
                </div>
              )}
              {eventLocation && (
                <div className="course-location">
                  <span className="location-label">Location:</span> {eventLocation}
                </div>
              )}
            </div>
          )}
          
          {/* Display price information */}
          {selectedPrice !== undefined && (
            <div className="course-price">
              Price: ${selectedPrice.toFixed(2)}
            </div>
          )}
          
          {isStudent && (
            <div className="course-enrollment-status">
              {isEnrolled ? (
                <div className="enrolled-status">
                  <span className="status-indicator enrolled">✓</span> Enrolled
                </div>
              ) : (
                <>
                  {variations.length > 0 && (
                    <div className="course-variations">
                      <select 
                        className="variation-select" 
                        value={selectedVariation}
                        onChange={handleVariationChange}
                      >
                        {variations.map(variation => (
                          <option key={variation.variationId} value={variation.variationId}>
                            {variation.name} - ${variation.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {price && price > 0 ? (
                    <button 
                      className="purchase-button" 
                      onClick={handlePurchaseClick}
                    >
                      Purchase Course
                    </button>
                  ) : (
                    <button 
                      className="enroll-button" 
                      onClick={handleEnrollClick}
                      disabled={!!enrollmentStatus}
                    >
                      Enroll Now
                    </button>
                  )}
                </>
              )}
              {enrollmentStatus && (
                <div className={`enrollment-message ${enrollmentStatus.success ? 'success' : 'error'}`}>
                  {enrollmentStatus.message}
                </div>
              )}
            </div>
          )}
        </>
      }
      footer={
        <>
          <div>Created by: {createdBy}</div>
          <div>Enrolled: {enrollmentCount}</div>
        </>
      }
      onClick={handleCardClick}
      imageUrl={imageUrl}
    />
  );
};