import React, { useEffect, useState } from 'react';
import { Course } from '../../services/courses/types/course';
import { CourseService } from '../../services/courses/service/CourseService';
import { CourseCard } from './CourseCard';
import { AuthService, UserRole } from '../../services/auth';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const service = CourseService.getInstance();
        const authService = AuthService.getInstance();
        
        // Get user role
        const role = await authService.getUserRole();
        setUserRole(role);
        
        // Get all courses
        const response = await service.getCourses({});
        let filteredCourses = response.course;
        
        // If user is a student, filter to only show enrolled courses
        if (role === 'student') {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            filteredCourses = response.course.filter(course => 
              course.Enrollments.some(enrollment => enrollment.EnrolleeId === currentUser.uid)
            );
          }
        }
        
        setCourses(filteredCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="courses-container">
      {courses.length > 0 ? (
        courses.map((course) => (
          <CourseCard
            key={course.Id}
            courseId={course.Id}
            name={course.Name}
            description={course.Description}
            level={course.Level}
            createdBy={course.CreatedBy}
            enrollmentCount={course.Enrollments ? course.Enrollments.length : 0}
          />
        ))
      ) : (
        <div className="no-courses" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '1rem'
        }}>
          <img 
            src="/confused1.webp" 
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
            {userRole === 'student' 
              ? 'You are not enrolled in any courses yet. To enroll contact your administrator.'
              : 'No courses available.'}
          </p>
        </div>
      )}
    </div>
  );
};
