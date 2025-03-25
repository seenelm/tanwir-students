// src/types.ts
export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'Not Submitted' | 'Submitted' | 'Graded';
  feedback?: string;
  submittedFiles?: string[];
}

export interface Quiz {
  id: number;
  title: string;
  subject: string;
  scheduledDate?: string;
  dateTaken?: string;
  status: 'Upcoming' | 'Completed';
  duration?: string;
  topics?: string[];
  score?: number;
  feedback?: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  submittedDate: string;
  status: 'Submitted' | 'Graded';
  files: string[];
  comments?: string;
  feedback?: string;
  grade?: number;
}

export interface Notification {
  id: number;
  text: string;
  date: string;
  read: boolean;
}