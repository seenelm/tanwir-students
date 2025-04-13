import React, { useEffect, useState } from 'react';
import { CourseService } from '../../services/courses/service/CourseService';
import { Course } from '../../services/courses/types/course';
import { usePage } from '../../context/PageContext';

export const CourseDetail: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { courseId } = usePage();
  
  useEffect(() => {
    const courseService = CourseService.getInstance();
  
    const fetchCourseDetail = async () => {
      if (!courseId) return;
  
      setLoading(true);
  
      // First try from cache
      let fetchedCourse = courseService.getCourseById(courseId);
  
      if (!fetchedCourse) {
        // If not found in cache, fetch all and retry
        await courseService.getCourses(); // This will fill the cache
        fetchedCourse = courseService.getCourseById(courseId);
      }
  
      setCourse(fetchedCourse ?? null);
      setLoading(false);
    };
  
    fetchCourseDetail();
  }, [courseId]);
  
  
  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }
  
  if (!course) {
    return <div className="error">Course not found</div>;
  }
  
  return (
    <div className="course-detail">
      <div className="course-header">
        <h2>{course.Name}</h2>
        <div className="course-meta">
          <span className="level">Level: {course.Level}</span>
          <span className="enrollment">Students: {course.Enrollments.length}</span>
        </div>
      </div>
      
      <div className="course-description">
        <h3>About this course</h3>
        <p>{course.Description}</p>
      </div>
      
      <div className="course-instructor">
        <h3>Instructor</h3>
        <p>{course.CreatedBy}</p>
      </div>
      
      {/* You can add more sections here like syllabus, materials, etc. */}
    </div>
  );
};