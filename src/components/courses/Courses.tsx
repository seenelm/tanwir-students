import React, { useEffect, useState } from 'react';
import { Course } from '../../services/courses/types/course';
import { CourseService } from '../../services/courses/service/CourseService';
import { CourseCard } from './CourseCard';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const service = CourseService.getInstance();
        const response = await service.getCourses({});
        setCourses(response.course);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="courses-container">
      {courses.map((course) => (
        <CourseCard
          key={course.Id}
          courseId={course.Id}
          name={course.Name}
          description={course.Description}
          level={course.Level}
          createdBy={course.CreatedBy}
          enrollmentCount={course.Enrollments ? course.Enrollments.length : 0}
        />
      ))}
    </div>
  );
};
