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