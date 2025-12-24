import React from 'react';
import { CourseCard } from './CourseCard';
import confusedImage from '../../assets/confused1.webp';
import { useAuth } from '../../context/AuthContext';
import { useEnrolledCourses } from '../../queries/courseQueries';

export const Courses: React.FC = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useEnrolledCourses(user?.uid, user?.Role ?? null);
  
  const courses = data?.courses || [];
  const enrolledCourseIds = data?.enrolledIds || [];

  // Debug logging
  React.useEffect(() => {
    console.log('Courses Component State:', {
      user,
      isLoading,
      data,
      coursesCount: courses.length,
      error,
      queryEnabled: !!user?.uid && !!user?.Role
    });
  }, [user, isLoading, data, courses.length, error]);

  // Helper function to check if a user is enrolled in a course
  const isEnrolled = (courseId: string) => {
    return enrolledCourseIds.includes(courseId);
  };

  return (
    <div className="courses-container">
      {(isLoading) ? (
        <div className="loading-container">
          <p>Loading courses...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.Id}
              courseId={course.Id}
              name={course.name || course.Name || ''}
              description={course.description || course.Description || ''}
              section={course.section || course.Section || ''}
              year={course.year || course.Year || ''}
              createdBy={course.createdBy || course.CreatedBy || ''}
              isEnrolled={isEnrolled(course.Id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-courses" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          minHeight: '60vh'
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
            {user?.Role === 'student' ? 'You are not enrolled in any courses.' : 'No courses available.'}
          </p>
        </div>
      )}
    </div>
  );
};
