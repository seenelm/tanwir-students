// models/assignment.ts
import { Timestamp, DocumentData, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase/firestore';
import { Assignment } from '../types/assignment';

export const assignmentConverter: FirestoreDataConverter<Assignment> = {
  toFirestore: (assignment: Assignment): DocumentData => {
    const data: DocumentData = {
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
    
    // Add optional fields if they exist
    if (assignment.type) data.type = assignment.type;
    if (assignment.timeLimit) data.timeLimit = assignment.timeLimit;
    if (assignment.passingScore) data.passingScore = assignment.passingScore;
    if ('formUrl' in assignment) data.formUrl = (assignment as any).formUrl;
    if ('embedUrl' in assignment) data.embedUrl = (assignment as any).embedUrl;
    
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Assignment => {
    const data = snapshot.data();
    const assignment: Assignment = {
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
    
    // Add optional fields if they exist
    if (data.type) assignment.type = data.type;
    if (data.timeLimit) assignment.timeLimit = data.timeLimit;
    if (data.passingScore) assignment.passingScore = data.passingScore;
    if (data.formUrl) (assignment as any).formUrl = data.formUrl;
    if (data.embedUrl) (assignment as any).embedUrl = data.embedUrl;
    
    return assignment;
  }
};