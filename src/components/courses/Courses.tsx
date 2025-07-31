import React, { useEffect, useState } from 'react';
import { Course } from '../../services/courses/types/course';
import { CourseService } from '../../services/courses/service/CourseService';
import { CourseCard } from './CourseCard';
import { AuthService, UserRole } from '../../services/auth';
import confusedImage from '../../assets/confused1.webp';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{success: boolean; message: string; courseId: string} | null>(null);

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
        const allCourses = response.course;
        
        // Get current user
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setCurrentUserId(currentUser.uid);
          
          // If user is a student, identify enrolled courses
          if (role === 'student') {
            const enrolledIds = allCourses
              .filter(course => course.Enrollments.some(enrollment => enrollment.EnrolleeId === currentUser.uid))
              .map(course => course.Id);
            setEnrolledCourseIds(enrolledIds);
          }
        }
        
        // Show all courses regardless of enrollment status
        setCourses(allCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, [isEnrolling]);

  const handleEnroll = async (courseId: string) => {
    if (!currentUserId) return;
    
    try {
      setIsEnrolling(true);
      const service = CourseService.getInstance();
      const authService = AuthService.getInstance();
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        // Get user's name from Firestore
        const users = await authService.getAllUsers();
        const user = users.find(u => u.uid === currentUser.uid);
        const studentName = user ? `${user.FirstName} ${user.LastName}` : currentUser.email || 'Student';
        
        // Enroll the student
        await service.enrollStudent(courseId, currentUser.uid, studentName);
        
        // Update enrolled course IDs
        setEnrolledCourseIds(prev => [...prev, courseId]);
        setEnrollmentStatus({
          success: true,
          message: 'Successfully enrolled in the course!',
          courseId: courseId
        });
        
        // Clear status message after 3 seconds
        setTimeout(() => {
          setEnrollmentStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      setEnrollmentStatus({
        success: false,
        message: 'Failed to enroll in the course. Please try again.',
        courseId: courseId
      });
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setEnrollmentStatus(null);
      }, 3000);
    } finally {
      setIsEnrolling(false);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourseIds.includes(courseId);
  };

  return (
    <div className="courses-container">
      {courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.Id}
              courseId={course.Id}
              name={course.Name}
              description={course.Description}
              level={course.Level}
              createdBy={course.CreatedBy}
              enrollmentCount={course.Enrollments ? course.Enrollments.length : 0}
              isEnrolled={isEnrolled(course.Id)}
              onEnroll={() => handleEnroll(course.Id)}
              isStudent={userRole === 'student'}
              enrollmentStatus={enrollmentStatus && enrollmentStatus.courseId === course.Id ? enrollmentStatus : null}
            />
          ))}
        </div>
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
            No courses available.
          </p>
        </div>
      )}
    </div>
  );
};
