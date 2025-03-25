// src/data/assignments.ts
import { Assignment } from '../types';

const assignments: Assignment[] = [
  {
    id: 1,
    title: 'Tafsir Research Paper',
    description: 'Write a 5-page research paper on the exegesis of Surah Al-Kahf',
    dueDate: '2025-04-15',
    status: 'Not Submitted'
  },
  {
    id: 2,
    title: 'Fiqh Case Studies',
    description: 'Complete the case studies on purification (Taharah) and prayer (Salah)',
    dueDate: '2025-04-10',
    status: 'Submitted',
    submittedFiles: ['fiqh_case_studies.pdf']
  },
  {
    id: 3,
    title: 'Islamic History Essay',
    description: 'Write a 3-page essay on the contributions of scholars during the Golden Age of Islam',
    dueDate: '2025-04-05',
    status: 'Graded',
    feedback: 'Excellent work! Your analysis of the scholarly contributions was thorough and well-supported.',
    submittedFiles: ['islamic_history_essay.docx']
  },
  {
    id: 4,
    title: 'Hadith Analysis',
    description: 'Analyze the chain of narration (isnad) and text (matn) of the assigned hadith collection',
    dueDate: '2025-04-20',
    status: 'Not Submitted'
  },
  {
    id: 5,
    title: 'Arabic Grammar Exercises',
    description: 'Complete exercises on verb conjugation and sentence structure in classical Arabic',
    dueDate: '2025-04-25',
    status: 'Not Submitted'
  }
];

export function getAllAssignments(): Assignment[] {
  return assignments;
}

export function getUpcomingAssignments(): Assignment[] {
  return assignments.filter(a => a.status === 'Not Submitted');
}

export function getAssignmentById(id: number): Assignment | undefined {
  return assignments.find(a => a.id === id);
}