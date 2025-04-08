// services/AssignmentService.ts

import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where 
  } from 'firebase/firestore';
  import { AssignmentRequest, Assignment, AssignmentResponse } from '../types/assignment';
  import { Timestamp } from 'firebase/firestore';
  
  export class AssignmentService {
    private db = getFirestore();
  
    /**
     * Gets assignments based on the provided request.  
     * If `courseId` is provided, assignments are filtered by the course.
     */
    async getAssignments(request: AssignmentRequest): Promise<AssignmentResponse> {
      const assignmentsCollection = collection(this.db, 'assignments');
      let q;
      
      if (request.courseId) {
        q = query(assignmentsCollection, where('CourseId', '==', request.courseId));
      } else {
        // If no course filtering is needed, simply query the collection.
        // Note: getDocs can accept a CollectionReference directly.
        q = assignmentsCollection;
      }
      
      const snapshot = await getDocs(q);
      
      const assignments: Assignment[] = snapshot.docs.map(doc => {
        const data = doc.data();
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
      });
      
      return { assignments };
    }
  }
  