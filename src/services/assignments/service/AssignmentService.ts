import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { AssignmentRequest, AssignmentResponse } from '../types/assignment';
import { assignmentConverter } from '../model/assignment';

export class AssignmentService {
  private db = getFirestore();
  private assignmentsCollection = collection(this.db, 'assignments').withConverter(assignmentConverter);

  async getAssignments(request: AssignmentRequest): Promise<AssignmentResponse> {
    const constraints = request.courseId ? [where('CourseId', '==', request.courseId)] : [];
    const q = query(this.assignmentsCollection, ...constraints);
    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map(doc => doc.data());
    return { assignments };
  }
}