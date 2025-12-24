import { useQuery } from '@tanstack/react-query';
import { AssignmentService } from '../services/assignments/service/AssignmentService';

export interface StudentGrade {
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt?: any;
}

export interface StudentGrades {
  studentId: string;
  studentName: string;
  grades: StudentGrade[];
  averagePercentage: number;
}

// Query keys
export const gradesKeys = {
  all: ['grades'] as const,
  course: (courseId: string) => [...gradesKeys.all, 'course', courseId] as const,
  student: (courseId: string, studentId: string) => [...gradesKeys.course(courseId), 'student', studentId] as const,
};

// Get grades for a course (admin view - all students)
export const useCourseGrades = (
  courseId: string | undefined,
  userRole: string | undefined,
  enrolledStudents: any[]
) => {
  return useQuery({
    queryKey: [...gradesKeys.course(courseId || ''), 'admin', enrolledStudents.length],
    queryFn: async (): Promise<StudentGrades[]> => {
      if (!courseId || userRole !== 'admin' || enrolledStudents.length === 0) {
        return [];
      }

      const assignmentService = AssignmentService.getInstance();
      const allResults = await assignmentService.getAllQuizResultsForCourse(courseId);
      
      const studentGradesMap: Record<string, StudentGrades> = {};

      enrolledStudents.forEach(student => {
        const studentId = student.uid || student.id || student.studentId;
        const studentName = getDisplayName(student);
        
        studentGradesMap[studentId] = {
          studentId,
          studentName,
          grades: [],
          averagePercentage: 0
        };
      });

      // Populate grades for each student
      Object.entries(allResults).forEach(([assignmentId, results]: [string, any]) => {
        const assignment = results.assignment;
        const submissions = results.submissions || [];

        submissions.forEach((submission: any) => {
          const studentId = submission.userId;
          if (studentGradesMap[studentId]) {
            studentGradesMap[studentId].grades.push({
              assignmentId,
              assignmentTitle: assignment?.title || 'Unknown Assignment',
              score: submission.score || 0,
              maxScore: assignment?.points || 100,
              percentage: ((submission.score || 0) / (assignment?.points || 100)) * 100,
              submittedAt: submission.submittedAt
            });
          }
        });
      });

      // Calculate averages
      Object.values(studentGradesMap).forEach(studentGrades => {
        if (studentGrades.grades.length > 0) {
          const totalPercentage = studentGrades.grades.reduce((sum, grade) => sum + grade.percentage, 0);
          studentGrades.averagePercentage = totalPercentage / studentGrades.grades.length;
        }
      });

      return Object.values(studentGradesMap);
    },
    enabled: !!courseId && userRole === 'admin' && enrolledStudents.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

// Get grades for a student (student view)
export const useStudentGrades = (
  courseId: string | undefined,
  userId: string | undefined,
  userRole: string | undefined
) => {
  return useQuery({
    queryKey: gradesKeys.student(courseId || '', userId || ''),
    queryFn: async (): Promise<StudentGrade[]> => {
      if (!courseId || !userId || userRole !== 'student') {
        return [];
      }

      const assignmentService = AssignmentService.getInstance();
      const allResults = await assignmentService.getAllQuizResultsForCourse(courseId);
      
      const studentGrades: StudentGrade[] = [];

      Object.entries(allResults).forEach(([assignmentId, results]: [string, any]) => {
        const assignment = results.assignment;
        const submissions = results.submissions || [];
        
        const userSubmission = submissions.find((s: any) => s.userId === userId);
        
        if (userSubmission) {
          studentGrades.push({
            assignmentId,
            assignmentTitle: assignment?.title || 'Unknown Assignment',
            score: userSubmission.score || 0,
            maxScore: assignment?.points || 100,
            percentage: ((userSubmission.score || 0) / (assignment?.points || 100)) * 100,
            submittedAt: userSubmission.submittedAt
          });
        }
      });

      return studentGrades;
    },
    enabled: !!courseId && !!userId && userRole === 'student',
    staleTime: 2 * 60 * 1000,
  });
};

// Helper function
function getDisplayName(student: any): string {
  if (student.studentInfo) {
    const info = student.studentInfo;
    if (info.firstName && info.lastName) {
      return `${info.firstName} ${info.lastName}`;
    } else if (info.firstName) {
      return info.firstName;
    } else if (info.lastName) {
      return info.lastName;
    } else if (info.name) {
      return info.name;
    }
  }
  
  if (student.email && !student.email.includes('ID:') && !student.uid?.includes(student.email)) {
    return student.email;
  }
  
  if (student.FirstName || student.LastName) {
    return `${student.FirstName || ''} ${student.LastName || ''}`.trim();
  }
  
  if (student.displayName) {
    return student.displayName;
  }
  
  if (student.uid && student.uid.includes('@') && !student.uid.includes('ID:')) {
    return student.uid;
  }
  
  return 'Unknown';
}
