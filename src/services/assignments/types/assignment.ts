export interface AssignmentRequest {
  courseId?: string;
}

export interface Assignment {
  AssignmentId: string;
  CourseId: string;
  CourseName: string;
  CreatedAt: Date;
  CreatedBy: string;
  Description: string;
  DueDate: Date;
  Points: number;
  Title: string;
  Subject?: string | null;
  type?: string;
  timeLimit?: number | null;
  passingScore?: number | null;
}

export interface AssignmentResponse {
  assignments: Assignment[];
}

export interface AssignmentDisplay {
  id: string;
  courseId: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  totalPoints: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  points: number;
  options: QuizOption[];
  type: string;
}

export interface QuizAssignment extends Assignment {
  type: 'quiz';
  timeLimit?: number | null;
  passingScore?: number | null;
  questions?: QuizQuestion[];
}

export interface GoogleFormAssignment extends Assignment {
  type: 'google-form';
  formUrl: string;
  embedUrl?: string;
}