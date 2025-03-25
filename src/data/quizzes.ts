// src/data/quizzes.ts
import { Quiz } from '../types';

const quizzes: Quiz[] = [
  {
    id: 1,
    title: 'Midterm Exam',
    subject: 'Usul al-Fiqh',
    scheduledDate: '2025-04-18',
    status: 'Upcoming',
    duration: '2 hours',
    topics: ['Legal Maxims', 'Principles of Jurisprudence', 'Scholarly Consensus']
  },
  {
    id: 2,
    title: 'Chapter Quiz',
    subject: 'Quranic Sciences',
    scheduledDate: '2025-04-12',
    status: 'Upcoming',
    duration: '45 minutes',
    topics: ['Revelation', 'Compilation', 'Preservation']
  },
  {
    id: 3,
    title: 'Weekly Assessment',
    subject: 'Hadith Studies',
    dateTaken: '2025-03-20',
    status: 'Completed',
    score: 85,
    feedback: 'Good understanding of hadith classification methods.'
  },
  {
    id: 4,
    title: 'Final Exam',
    subject: 'Islamic Ethics (Akhlaq)',
    dateTaken: '2025-03-15',
    status: 'Completed',
    score: 92,
    feedback: 'Excellent work on applying ethical principles to contemporary situations!'
  },
  {
    id: 5,
    title: 'Oral Examination',
    subject: 'Tajweed',
    scheduledDate: '2025-04-25',
    status: 'Upcoming',
    duration: '30 minutes',
    topics: ['Rules of Recitation', 'Pronunciation', 'Practical Application']
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