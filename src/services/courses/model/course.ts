// models/assignment.ts
import { DocumentData, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase/firestore';
import { Course } from '../types/course';

export const courseConverter: FirestoreDataConverter<Course> = {
  toFirestore: (course: Course): DocumentData => {
    return {
      CreatedAt: course.CreatedAt,
      CreatedBy: course.CreatedBy,
      Description: course.Description,
      Enrollments: course.Enrollments,
      Level: course.Level,
      Name: course.Name,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Course => {
    const data = snapshot.data();
    return {
      Id: snapshot.id,
      CreatedAt: data.CreatedAt as Date,
      CreatedBy: data.CreatedBy,
      Description: data.Description,
      Enrollments: data.Enrollments || [],
      Level: data.Level,
      Name: data.Name,
    };
  }
};