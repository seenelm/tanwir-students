import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  doc,
  query, 
  where,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Assignment, StudentAssignment, AssignmentStatus } from '../types/assignment';
import { AuthService } from './auth';

export class AssignmentService {
  private static instance: AssignmentService;
  private db = getFirestore();
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  /**
   * Creates a new assignment for a course
   */
  async createAssignment(
    courseId: string,
    title: string,
    description: string,
    dueDate: Date,
    points: number
  ): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const assignmentData = {
      CourseId: courseId,
      Title: title,
      Description: description,
      DueDate: Timestamp.fromDate(dueDate),
      CreatedAt: serverTimestamp(),
      CreatedBy: user.uid,
      Points: points
    };

    const docRef = await addDoc(collection(this.db, 'assignments'), assignmentData);
    return docRef.id;
  }

  /**
   * Gets all assignments for a course
   */
  async getCourseAssignments(courseId: string): Promise<Assignment[]> {
    const q = query(
      collection(this.db, 'assignments'),
      where('CourseId', '==', courseId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      DueDate: (doc.data().DueDate as Timestamp).toDate(),
      CreatedAt: (doc.data().CreatedAt as Timestamp).toDate()
    } as Assignment));
  }

  /**
   * Gets assignments for a student in a course
   */
  async getStudentAssignments(courseId: string, studentId: string): Promise<StudentAssignment[]> {
    const q = query(
      collection(this.db, 'studentAssignments'),
      where('CourseId', '==', courseId),
      where('StudentId', '==', studentId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      SubmittedAt: doc.data().SubmittedAt ? (doc.data().SubmittedAt as Timestamp).toDate() : undefined
    } as StudentAssignment));
  }

  /**
   * Assigns an assignment to a student
   */
  async assignToStudent(assignmentId: string, studentId: string, courseId: string): Promise<string> {
    const studentAssignment = {
      AssignmentId: assignmentId,
      StudentId: studentId,
      CourseId: courseId,
      Status: 'pending' as AssignmentStatus,
      CreatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(this.db, 'studentAssignments'), studentAssignment);
    return docRef.id;
  }

  /**
   * Updates a student's assignment status and grade
   */
  async updateStudentAssignment(
    studentAssignmentId: string,
    status: AssignmentStatus,
    grade?: number,
    feedback?: string
  ): Promise<void> {
    const docRef = doc(this.db, 'studentAssignments', studentAssignmentId);
    
    const updateData: Partial<StudentAssignment> = {
      Status: status
    };

    if (status === 'submitted') {
      updateData.SubmittedAt = serverTimestamp() as unknown as Date;
    }

    if (grade !== undefined) {
      updateData.Grade = grade;
    }

    if (feedback !== undefined) {
      updateData.Feedback = feedback;
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Gets all assignments for the current user
   */
  async getCurrentUserAssignments(): Promise<StudentAssignment[]> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(this.db, 'studentAssignments'),
      where('StudentId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      SubmittedAt: doc.data().SubmittedAt ? (doc.data().SubmittedAt as Timestamp).toDate() : undefined
    } as StudentAssignment));
  }
}