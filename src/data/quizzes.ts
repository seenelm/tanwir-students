// src/data/quizzes.ts
import { Quiz } from '../types';

const quizzes: Quiz[] = [
  {
    id: 1,
    title: 'Midterm Exam',
    subject: 'Mathematics',
    scheduledDate: '2025-04-18',
    status: 'Upcoming',
    duration: '2 hours',
    topics: ['Calculus', 'Linear Algebra', 'Probability']
  },
  {
    id: 2,
    title: 'Chapter Quiz',
    subject: 'Physics',
    scheduledDate: '2025-04-12',
    status: 'Upcoming',
    duration: '45 minutes',
    topics: ['Mechanics', 'Energy']
  },
  {
    id: 3,
    title: 'Pop Quiz',
    subject: 'English Literature',
    dateTaken: '2025-03-20',
    status: 'Completed',
    score: 85,
    feedback: 'Good understanding of the material.'
  },
  {
    id: 4,
    title: 'Final Exam',
    subject: 'Chemistry',
    dateTaken: '2025-03-15',
    status: 'Completed',
    score: 92,
    feedback: 'Excellent work!'
  }
];

export function getAllQuizzes(): Quiz[] {
  return quizzes;
}

export function getUpcomingQuizzes(): Quiz[] {
  return quizzes.filter(q => q.status === 'Upcoming');
}

export function getCompletedQuizzes(): Quiz[] {
  return quizzes.filter(q => q.status === 'Completed');
}