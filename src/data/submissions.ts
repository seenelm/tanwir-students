// src/data/submissions.ts
import { Submission } from '../types';

const submissions: Submission[] = [
  {
    id: 1,
    assignmentId: 2,
    assignmentTitle: 'Math Problem Set',
    submittedDate: '2025-04-08',
    status: 'Submitted',
    files: ['math_homework.pdf'],
    comments: 'I had some difficulty with problems 15-17.'
  },
  {
    id: 2,
    assignmentId: 3,
    assignmentTitle: 'History Essay',
    submittedDate: '2025-04-02',
    status: 'Graded',
    files: ['history_essay.docx'],
    grade: 95,
    feedback: 'Excellent work! Your analysis was thorough and well-supported.'
  }
];

export function getRecentSubmissions(): Submission[] {
  return submissions.sort((a, b) => 
    new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );
}