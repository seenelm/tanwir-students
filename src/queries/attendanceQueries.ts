import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '../services/attendance/service/AttendanceService';

const attendanceService = AttendanceService.getInstance();

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  course: (courseId: string) => [...attendanceKeys.all, 'course', courseId] as const,
  sessions: (courseId: string) => [...attendanceKeys.course(courseId), 'sessions'] as const,
  session: (sessionId: string) => [...attendanceKeys.all, 'session', sessionId] as const,
  summary: (courseId: string) => [...attendanceKeys.course(courseId), 'summary'] as const,
  active: (courseId: string) => [...attendanceKeys.course(courseId), 'active'] as const,
};

// Get class sessions for a course
export const useClassSessions = (courseId: string | undefined) => {
  return useQuery({
    queryKey: attendanceKeys.sessions(courseId || ''),
    queryFn: async () => {
      if (!courseId) return [];
      return await attendanceService.getClassSessions(courseId);
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get attendance summary for a course
export const useAttendanceSummary = (
  courseId: string | undefined,
  enrolledStudents: any[]
) => {
  return useQuery({
    queryKey: [...attendanceKeys.summary(courseId || ''), enrolledStudents.length],
    queryFn: async () => {
      if (!courseId) return [];
      return await attendanceService.getAttendanceSummary(courseId, enrolledStudents);
    },
    enabled: !!courseId && enrolledStudents.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

// Get active sessions for a course
export const useActiveSessions = (courseId: string | undefined) => {
  return useQuery({
    queryKey: attendanceKeys.active(courseId || ''),
    queryFn: async () => {
      if (!courseId) return [];
      return await attendanceService.getActiveSessions(courseId);
    },
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30 seconds for active sessions
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

// Get attendance records for a specific session
export const useSessionAttendance = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: attendanceKeys.session(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) return [];
      return await attendanceService.getAttendanceForSession(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000,
  });
};

// Check which sessions a user has marked
export const useMarkedSessions = (
  activeSessions: any[],
  currentUserId: string | null
) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'marked', currentUserId, activeSessions.map(s => s.Id)],
    queryFn: async () => {
      if (!currentUserId || activeSessions.length === 0) {
        return new Set<string>();
      }
      
      const marked = new Set<string>();
      for (const session of activeSessions) {
        const attendanceRecords = await attendanceService.getAttendanceForSession(session.Id);
        const hasMarked = attendanceRecords.some(record => record.StudentId === currentUserId);
        if (hasMarked) {
          marked.add(session.Id);
        }
      }
      return marked;
    },
    enabled: !!currentUserId && activeSessions.length > 0,
    staleTime: 1 * 60 * 1000,
  });
};

// Mutations
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      courseId,
      date,
      topic,
      description,
      createdBy,
    }: {
      courseId: string;
      date: Date;
      topic: string;
      description: string;
      createdBy: string;
    }) => {
      return await attendanceService.createClassSession(
        courseId,
        date,
        topic,
        description,
        createdBy
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessions(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.summary(variables.courseId) });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      courseId,
      sessionId,
      studentId,
      studentName,
      status,
      markedBy,
    }: {
      courseId: string;
      sessionId: string;
      studentId: string;
      studentName: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      markedBy: string;
    }) => {
      return await attendanceService.markAttendance(
        courseId,
        sessionId,
        studentId,
        studentName,
        status,
        markedBy
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.summary(variables.courseId) });
    },
  });
};

export const useStudentMarkPresent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      courseId,
      sessionId,
      studentId,
      studentName,
    }: {
      courseId: string;
      sessionId: string;
      studentId: string;
      studentName: string;
    }) => {
      return await attendanceService.studentMarkPresent(
        courseId,
        sessionId,
        studentId,
        studentName
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.summary(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: [...attendanceKeys.all, 'marked'] });
    },
  });
};

export const useOpenSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string; courseId: string }) => {
      return await attendanceService.openAttendanceSession(sessionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessions(variables.courseId) });
    },
  });
};

export const useCloseSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string; courseId: string }) => {
      return await attendanceService.closeAttendanceSession(sessionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.active(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.sessions(variables.courseId) });
    },
  });
};
