import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/auth';

const authService = AuthService.getInstance();

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  enrolled: (courseId: string) => [...userKeys.all, 'enrolled', courseId] as const,
};

// Get all users
export const useAllUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      return await authService.getAllUsers();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user data by ID
export const useUserData = (userId: string | undefined) => {
  return useQuery({
    queryKey: userKeys.detail(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return await authService.getUserData(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get enrolled students for a course
export const useEnrolledStudents = (courseId: string | undefined) => {
  return useQuery({
    queryKey: userKeys.enrolled(courseId || ''),
    queryFn: async () => {
      if (!courseId) return [];
      
      const allUsers = await authService.getAllUsers();
      
      // Filter users who are enrolled in this course
      const enrolled = allUsers.filter(user => {
        if (!user.courses || !Array.isArray(user.courses)) {
          return false;
        }
        
        return user.courses.some(course => {
          // Check different possible formats of course reference
          if (course.courseRef === `courses/${courseId}`) {
            return true;
          }
          
          // Also check if courseRef contains the courseId
          if (course.courseRef && typeof course.courseRef === 'string' && 
              (course.courseRef.includes(courseId) || courseId.includes(course.courseRef.split('/')[1]))) {
            return true;
          }
          
          return false;
        });
      });
      
      return enrolled;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get students only (filter out admins)
export const useStudents = () => {
  return useQuery({
    queryKey: [...userKeys.lists(), 'students'],
    queryFn: async () => {
      const allUsers = await authService.getAllUsers();
      return allUsers.filter(user => user.Role !== 'admin');
    },
    staleTime: 5 * 60 * 1000,
  });
};
