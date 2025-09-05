// models/assignment.ts
import { Timestamp, DocumentData, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase/firestore';
import { Assignment } from '../types/assignment';

export const assignmentConverter: FirestoreDataConverter<Assignment> = {
  toFirestore: (assignment: Assignment): DocumentData => {
    return {
      CourseId: assignment.CourseId,
      CourseName: assignment.CourseName,
      CreatedAt: assignment.CreatedAt instanceof Date ? Timestamp.fromDate(assignment.CreatedAt) : Timestamp.now(),
      CreatedBy: assignment.CreatedBy,
      Description: assignment.Description,
      DueDate: assignment.DueDate instanceof Date ? Timestamp.fromDate(assignment.DueDate) : Timestamp.now(),
      Points: assignment.Points,
      Title: assignment.Title,
      Subject: assignment.Subject || null,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Assignment => {
    const data = snapshot.data();
    return {
      AssignmentId: snapshot.id,
      CourseId: data.CourseId,
      CourseName: data.CourseName,
      CreatedAt: (data.CreatedAt as Timestamp).toDate(),
      CreatedBy: data.CreatedBy,
      Description: data.Description,
      DueDate: (data.DueDate as Timestamp).toDate(),
      Points: data.Points,
      Title: data.Title,
      Subject: data.Subject || null,
    };
  }
};