export interface Assignment {
  Id: string;
  CourseId: string;
  Title: string;
  Description: string;
  DueDate: Date;
  CreatedAt: Date;
  CreatedBy: string;
  Points: number;
}

export interface StudentAssignment {
  Id: string;
  AssignmentId: string;
  StudentId: string;
  CourseId: string;
  Status: 'pending' | 'submitted' | 'graded';
  SubmittedAt?: Date;
  Grade?: number;
  Feedback?: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';