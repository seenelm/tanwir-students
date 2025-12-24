import { useQuery } from '@tanstack/react-query';
import { AssignmentService } from '../services/assignments/service/AssignmentService';

const assignmentService = AssignmentService.getInstance();

// Query keys
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: any) => [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  course: (courseId: string) => [...assignmentKeys.all, 'course', courseId] as const,
  results: (courseId: string) => [...assignmentKeys.all, 'results', courseId] as const,
};

// Get all assignments
export const useAssignments = () => {
  return useQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: async () => {
      return await assignmentService.getAssignments();
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get assignments for a specific course
export const useCourseAssignments = (courseId: string | undefined) => {
  return useQuery({
    queryKey: assignmentKeys.course(courseId || ''),
    queryFn: async () => {
      if (!courseId) return [];
      const allAssignments = await assignmentService.getAssignments();
      return allAssignments.filter(a => a.CourseId === courseId);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get filtered assignments for students (only enrolled courses)
export const useFilteredAssignments = (
  userRole: string | null,
  enrolledCourseIds: string[]
) => {
  return useQuery({
    queryKey: [...assignmentKeys.lists(), 'filtered', userRole, enrolledCourseIds],
    queryFn: async () => {
      const assignmentSummaries = await assignmentService.getAssignments();
      
      if (userRole === 'student') {
        return assignmentSummaries.filter(summary => 
          enrolledCourseIds.includes(summary.CourseId)
        );
      }
      
      return assignmentSummaries;
    },
    enabled: !!userRole,
    staleTime: 5 * 60 * 1000,
  });
};

// Get quiz results for a course
export const useCourseQuizResults = (courseId: string | undefined) => {
  return useQuery({
    queryKey: assignmentKeys.results(courseId || ''),
    queryFn: async () => {
      if (!courseId) return {};
      return await assignmentService.getAllQuizResultsForCourse(courseId);
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes for quiz results
  });
};
