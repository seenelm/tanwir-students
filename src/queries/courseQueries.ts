import { useQuery } from '@tanstack/react-query';
import { CourseService } from '../services/courses/service/CourseService';
import { Course } from '../services/courses/types/course';
import { AuthService } from '../services/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

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

// Get course details with enrollment info
export const useCourseDetail = (courseId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['courseDetail', courseId, userId],
    queryFn: async () => {
      if (!courseId) return null;

      const authService = AuthService.getInstance();
      
      // Fetch course data directly from Firestore to bypass cache
      const courseDocRef = doc(db, 'courses', courseId);
      const courseDocSnap = await getDoc(courseDocRef);
      
      if (!courseDocSnap.exists()) return null;
      
      const courseData = courseDocSnap.data();
      const course: any = {
        Id: courseId,
        name: courseData.name || `Course ${courseId}`,
        Name: courseData.Name || courseData.name || `Course ${courseId}`,
        description: courseData.description || 'No description available',
        Description: courseData.Description || courseData.description || 'No description available',
        createdBy: courseData.createdBy || 'Unknown',
        CreatedBy: courseData.CreatedBy || courseData.createdBy || 'Unknown',
        createdAt: courseData.createdAt,
        section: courseData.section || '',
        Section: courseData.Section || courseData.section || '',
        year: courseData.year || '',
        Year: courseData.Year || courseData.year || '',
        syllabus: courseData.syllabus || '',
        Syllabus: courseData.Syllabus || courseData.syllabus || '',
        subjects: courseData.subjects || courseData.Subjects || [],
        Subjects: courseData.Subjects || courseData.subjects || [],
        playlist: courseData.playlist || '',
        attachments: courseData.attachments || courseData.Attachments || [],
        Attachments: courseData.Attachments || courseData.attachments || [],
        Enrollments: courseData.Enrollments || []
      };

      let enrolledSemesters: string[] = [];
      
      // Get user's enrollment data
      if (userId) {
        const userData = await authService.getUserData(userId);
        if (userData?.courses) {
          const enrollment: any = userData.courses.find((c: any) => {
            const courseRef = c.courseRef || '';
            return courseRef.includes(courseId) || courseId.includes(courseRef.split('/')[1]);
          });
          
          if (enrollment?.guidanceDetails?.plan) {
            const plan = enrollment.guidanceDetails.plan;
            if (plan === 'Full Year') {
              enrolledSemesters = ['fall', 'spring'];
            } else if (plan === 'Fall Semester') {
              enrolledSemesters = ['fall'];
            } else if (plan === 'Spring Semester') {
              enrolledSemesters = ['spring'];
            }
          }
        }
      }

      return {
        course,
        enrolledSemesters,
      };
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};
