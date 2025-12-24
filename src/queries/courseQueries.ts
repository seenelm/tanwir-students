import { useQuery } from '@tanstack/react-query';
import { CourseService } from '../services/courses/service/CourseService';
import { Course } from '../services/courses/types/course';
import { AuthService } from '../services/auth';

const courseService = CourseService.getInstance();

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters?: any) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async () => {
      const response = await courseService.getCourses();
      return response.course;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific course by ID
export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId || ''),
    queryFn: async () => {
      if (!courseId) return null;
      return await courseService.getCourseById(courseId);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get enrolled courses for a user
export const useEnrolledCourses = (userId: string | undefined, userRole: string | null) => {
  return useQuery({
    queryKey: ['enrolledCourses', userId, userRole],
    queryFn: async (): Promise<{ courses: Course[]; enrolledIds: string[] }> => {
      if (!userId || !userRole) return { courses: [], enrolledIds: [] };
      
      const authService = AuthService.getInstance();
      const enrolledCourseRefs = await authService.getUserEnrolledCourses();
      
      if (userRole === 'admin') {
        // Admins see all courses
        const response = await courseService.getCourses();
        return { courses: response.course, enrolledIds: enrolledCourseRefs };
      } else {
        // Students see only enrolled courses
        const enrolledCourses: Course[] = [];
        for (const courseId of enrolledCourseRefs) {
          const course = await courseService.getCourseById(courseId);
          if (course) {
            enrolledCourses.push(course);
          }
        }
        return { courses: enrolledCourses, enrolledIds: enrolledCourseRefs };
      }
    },
    enabled: !!userId && !!userRole,
    staleTime: 5 * 60 * 1000,
  });
};

// Check if student is enrolled in a course
export const useIsEnrolled = (courseId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['isEnrolled', courseId, userId],
    queryFn: async () => {
      if (!courseId || !userId) return false;
      return await courseService.isStudentEnrolled(courseId, userId);
    },
    enabled: !!courseId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
