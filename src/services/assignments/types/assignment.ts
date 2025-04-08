// types/assignment.ts

// import { Timestamp } from 'firebase/firestore';

export interface AssignmentRequest {
  courseId?: string;
}

export interface Assignment {
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
