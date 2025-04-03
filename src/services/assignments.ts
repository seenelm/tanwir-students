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
  Timestamp,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { Assignment, StudentAssignment, AssignmentStatus, AssignmentAttachment, AssignmentQuestion, StudentAnswer, AssignmentDiscussion } from '../types/assignment';
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

  /**
   * Attachment methods
   */
  async addAttachment(assignmentId: string, file: File): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRole = await this.authService.getUserRole();
    if (userRole !== 'admin') throw new Error('Only admins can add attachments');

    // TODO: Implement file upload to Firebase Storage
    // For now, we'll just store the metadata
    const attachmentData = {
      Name: file.name,
      FileType: file.type,
      FileUrl: '', // This should come from Storage upload
      UploadedBy: user.uid,
      CreatedAt: serverTimestamp()
    };

    const attachmentRef = collection(this.db, `assignments/${assignmentId}/attachments`);
    const docRef = await addDoc(attachmentRef, attachmentData);
    return docRef.id;
  }

  async getAttachments(assignmentId: string): Promise<AssignmentAttachment[]> {
    const attachmentsRef = collection(this.db, `assignments/${assignmentId}/attachments`);
    const snapshot = await getDocs(attachmentsRef);
    
    return snapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      CreatedAt: doc.data().CreatedAt?.toDate()
    } as AssignmentAttachment));
  }

  /**
   * Question methods
   */
  async addQuestion(assignmentId: string, question: Omit<AssignmentQuestion, 'Id' | 'CreatedAt'>): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRole = await this.authService.getUserRole();
    if (userRole !== 'admin') throw new Error('Only admins can add questions');

    const questionData = {
      ...question,
      CreatedAt: serverTimestamp()
    };

    const questionsRef = collection(this.db, `assignments/${assignmentId}/questions`);
    const docRef = await addDoc(questionsRef, questionData);
    return docRef.id;
  }

  async getQuestions(assignmentId: string): Promise<AssignmentQuestion[]> {
    const questionsRef = collection(this.db, `assignments/${assignmentId}/questions`);
    const snapshot = await getDocs(questionsRef);
    
    return snapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      CreatedAt: doc.data().CreatedAt?.toDate()
    } as AssignmentQuestion));
  }

  /**
   * Student answer methods
   */
  async submitAnswer(assignmentId: string, questionId: string, answer: string): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRole = await this.authService.getUserRole();
    if (userRole !== 'student') throw new Error('Only students can submit answers');

    const answerData = {
      QuestionId: questionId,
      StudentId: user.uid,
      Answer: answer,
      SubmittedAt: serverTimestamp()
    };

    const answersRef = collection(this.db, `assignments/${assignmentId}/studentAnswers`);
    const docRef = await addDoc(answersRef, answerData);
    return docRef.id;
  }

  async getStudentAnswers(assignmentId: string, studentId?: string): Promise<StudentAnswer[]> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRole = await this.authService.getUserRole();
    if (userRole !== 'admin' && (!studentId || studentId !== user.uid)) {
      throw new Error('Students can only view their own answers');
    }

    const answersRef = collection(this.db, `assignments/${assignmentId}/studentAnswers`);
    const q = studentId 
      ? query(answersRef, where('StudentId', '==', studentId))
      : answersRef;
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      SubmittedAt: doc.data().SubmittedAt?.toDate(),
      GradedAt: doc.data().GradedAt?.toDate()
    } as StudentAnswer));
  }

  async gradeAnswer(assignmentId: string, answerId: string, score: number): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userRole = await this.authService.getUserRole();
    if (userRole !== 'admin') throw new Error('Only admins can grade answers');

    const answerRef = doc(this.db, `assignments/${assignmentId}/studentAnswers/${answerId}`);
    await updateDoc(answerRef, {
      Score: score,
      GradedBy: user.uid,
      GradedAt: serverTimestamp()
    });
  }

  /**
   * Discussion methods
   */
  async addDiscussion(assignmentId: string, content: string): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const discussionData = {
      UserId: user.uid,
      Content: content,
      CreatedAt: serverTimestamp()
    };

    const discussionsRef = collection(this.db, `assignments/${assignmentId}/discussions`);
    const docRef = await addDoc(discussionsRef, discussionData);
    return docRef.id;
  }

  async getDiscussions(assignmentId: string): Promise<AssignmentDiscussion[]> {
    const discussionsRef = collection(this.db, `assignments/${assignmentId}/discussions`);
    const q = query(discussionsRef, orderBy('CreatedAt', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      Id: doc.id,
      ...doc.data(),
      CreatedAt: doc.data().CreatedAt?.toDate(),
      UpdatedAt: doc.data().UpdatedAt?.toDate()
    } as AssignmentDiscussion));
  }

  async updateDiscussion(assignmentId: string, discussionId: string, content: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const discussionRef = doc(this.db, `assignments/${assignmentId}/discussions/${discussionId}`);
    const discussionDoc = await getDoc(discussionRef);
    
    if (!discussionDoc.exists()) throw new Error('Discussion not found');
    if (discussionDoc.data().UserId !== user.uid) throw new Error('Can only edit your own discussions');

    await updateDoc(discussionRef, {
      Content: content,
      UpdatedAt: serverTimestamp()
    });
  }
}