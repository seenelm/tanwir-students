// src/data/assignments.ts
import { Assignment } from '../types';

const assignments: Assignment[] = [
  {
    id: 1,
    title: 'Research Paper',
    description: 'Write a 5-page research paper on a topic of your choice',
    dueDate: '2025-04-15',
    status: 'Not Submitted'
  },
  {
    id: 2,
    title: 'Math Problem Set',
    description: 'Complete problems 1-20 in Chapter 5',
    dueDate: '2025-04-10',
    status: 'Submitted',
    submittedFiles: ['math_homework.pdf']
  },
  {
    id: 3,
    title: 'History Essay',
    description: 'Write a 3-page essay on World War II',
    dueDate: '2025-04-05',
    status: 'Graded',
    feedback: 'Excellent work! Your analysis was thorough and well-supported.',
    submittedFiles: ['history_essay.docx']
  },
  {
    id: 4,
    title: 'Science Lab Report',
    description: 'Write a lab report for the experiment conducted in class',
    dueDate: '2025-04-20',
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