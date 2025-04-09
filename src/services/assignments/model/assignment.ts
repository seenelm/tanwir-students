// models/assignment.ts
import { Timestamp, DocumentData, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase/firestore';
import { Assignment } from '../types/assignment';

export const assignmentConverter: FirestoreDataConverter<Assignment> = {
  toFirestore: (assignment: Assignment): DocumentData => {
    return {
      CourseId: assignment.CourseId,
      CourseName: assignment.CourseName,
      CreatedAt: Timestamp.fromDate(assignment.CreatedAt),
      CreatedBy: assignment.CreatedBy,
      Description: assignment.Description,
      DueDate: Timestamp.fromDate(assignment.DueDate),
      Points: assignment.Points,
      Title: assignment.Title,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Assignment => {
    const data = snapshot.data();
    return {
      CourseId: data.CourseId,
      CourseName: data.CourseName,
      CreatedAt: (data.CreatedAt as Timestamp).toDate(),
      CreatedBy: data.CreatedBy,
      Description: data.Description,
      DueDate: (data.DueDate as Timestamp).toDate(),
      Points: data.Points,
      Title: data.Title,
    };
  }
};