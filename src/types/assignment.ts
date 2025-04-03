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

export interface AssignmentAttachment {
  Id: string;
  Name: string;
  FileUrl: string;
  FileType: string;
  UploadedBy: string;
  CreatedAt: Date;
}

export interface AssignmentQuestion {
  Id: string;
  Question: string;
  Type: 'text' | 'multiple_choice';
  Options?: string[];
  Points: number;
  CreatedAt: Date;
}

export interface StudentAnswer {
  Id: string;
  QuestionId: string;
  StudentId: string;
  Answer: string;
  Score?: number;
  GradedBy?: string;
  SubmittedAt: Date;
  GradedAt?: Date;
}

export interface AssignmentDiscussion {
  Id: string;
  UserId: string;
  Content: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}