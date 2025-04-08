// import { 
//   getFirestore, 
//   collection, 
//   addDoc, 
//   getDocs,
//   doc,
//   query, 
//   where,
//   updateDoc,
//   serverTimestamp,
//   Timestamp,
//   orderBy,
//   getDoc
// } from 'firebase/firestore';
// import { Assignment, StudentAssignment, AssignmentStatus, AssignmentAttachment, AssignmentQuestion, StudentAnswer, AssignmentDiscussion } from '../../../types/assignment';
// import { AuthService } from '../../auth';

// export class AssignmentService {
//   private static instance: AssignmentService;
//   private db = getFirestore();
//   private authService: AuthService;
//   // Add cache maps for different data types
//   private attachmentsCache: Map<string, { data: AssignmentAttachment[], timestamp: number }> = new Map();
//   private questionsCache: Map<string, { data: AssignmentQuestion[], timestamp: number }> = new Map();
//   private discussionsCache: Map<string, { data: AssignmentDiscussion[], timestamp: number }> = new Map();
//   private studentAnswersCache: Map<string, { data: StudentAnswer[], timestamp: number }> = new Map();
//   private assignmentsCache: Map<string, { data: Assignment[], timestamp: number }> = new Map();
//   // Cache expiration time in milliseconds (5 minutes)
//   private cacheExpirationTime = 5 * 60 * 1000;

//   private constructor() {
//     this.authService = AuthService.getInstance();
//   }

//   public static getInstance(): AssignmentService {
//     if (!AssignmentService.instance) {
//       AssignmentService.instance = new AssignmentService();
//     }
//     return AssignmentService.instance;
//   }

//   /**
//    * Clears all caches or a specific cache if specified
//    */
//   public clearCache(type?: 'attachments' | 'questions' | 'discussions' | 'studentAnswers' | 'assignments'): void {
//     if (!type) {
//       this.attachmentsCache.clear();
//       this.questionsCache.clear();
//       this.discussionsCache.clear();
//       this.studentAnswersCache.clear();
//       this.assignmentsCache.clear();
//       return;
//     }

//     switch (type) {
//       case 'attachments':
//         this.attachmentsCache.clear();
//         break;
//       case 'questions':
//         this.questionsCache.clear();
//         break;
//       case 'discussions':
//         this.discussionsCache.clear();
//         break;
//       case 'studentAnswers':
//         this.studentAnswersCache.clear();
//         break;
//       case 'assignments':
//         this.assignmentsCache.clear();
//         break;
//     }
//   }

//   /**
//    * Checks if cache is valid
//    */
//   private isCacheValid<T>(cache: Map<string, { data: T[], timestamp: number }>, key: string): boolean {
//     const cachedData = cache.get(key);
//     if (!cachedData) return false;
    
//     const now = Date.now();
//     return (now - cachedData.timestamp) < this.cacheExpirationTime;
//   }

//   /**
//    * Creates a new assignment for a course
//    */
//   async createAssignment(
//     courseId: string,
//     title: string,
//     description: string,
//     dueDate: Date,
//     points: number
//   ): Promise<string> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const assignmentData = {
//       CourseId: courseId,
//       Title: title,
//       Description: description,
//       DueDate: Timestamp.fromDate(dueDate),
//       CreatedAt: serverTimestamp(),
//       CreatedBy: user.uid,
//       Points: points
//     };

//     const docRef = await addDoc(collection(this.db, 'assignments'), assignmentData);
//     // Clear the assignments cache for this course
//     this.assignmentsCache.delete(courseId);
//     return docRef.id;
//   }

//   /**
//    * Gets all assignments for a course
//    */
//   async getCourseAssignments(courseId: string): Promise<Assignment[]> {
//     // Check cache first
//     if (this.isCacheValid(this.assignmentsCache, courseId)) {
//       return this.assignmentsCache.get(courseId)!.data;
//     }

//     const q = query(
//       collection(this.db, 'assignments'),
//       where('CourseId', '==', courseId)
//     );

//     const querySnapshot = await getDocs(q);
//     const assignments = querySnapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       DueDate: (doc.data().DueDate as Timestamp).toDate(),
//       CreatedAt: (doc.data().CreatedAt as Timestamp).toDate()
//     } as Assignment));

//     // Store in cache
//     this.assignmentsCache.set(courseId, { data: assignments, timestamp: Date.now() });
    
//     return assignments;
//   }

//   /**
//    * Gets assignments for a student in a course
//    */
//   async getStudentAssignments(courseId: string, studentId: string): Promise<StudentAssignment[]> {
//     const q = query(
//       collection(this.db, 'studentAssignments'),
//       where('CourseId', '==', courseId),
//       where('StudentId', '==', studentId)
//     );

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       SubmittedAt: doc.data().SubmittedAt ? (doc.data().SubmittedAt as Timestamp).toDate() : undefined
//     } as StudentAssignment));
//   }

//   /**
//    * Assigns an assignment to a student
//    */
//   async assignToStudent(assignmentId: string, studentId: string, courseId: string): Promise<string> {
//     const studentAssignment = {
//       AssignmentId: assignmentId,
//       StudentId: studentId,
//       CourseId: courseId,
//       Status: 'pending' as AssignmentStatus,
//       CreatedAt: serverTimestamp()
//     };

//     const docRef = await addDoc(collection(this.db, 'studentAssignments'), studentAssignment);
//     return docRef.id;
//   }

//   /**
//    * Updates a student's assignment status and grade
//    */
//   async updateStudentAssignment(
//     studentAssignmentId: string,
//     status: AssignmentStatus,
//     grade?: number,
//     feedback?: string
//   ): Promise<void> {
//     const docRef = doc(this.db, 'studentAssignments', studentAssignmentId);
    
//     const updateData: Partial<StudentAssignment> = {
//       Status: status
//     };

//     if (status === 'submitted') {
//       updateData.SubmittedAt = serverTimestamp() as unknown as Date;
//     }

//     if (grade !== undefined) {
//       updateData.Grade = grade;
//     }

//     if (feedback !== undefined) {
//       updateData.Feedback = feedback;
//     }

//     await updateDoc(docRef, updateData);
//   }

//   /**
//    * Gets all assignments for the current user
//    */
//   async getCurrentUserAssignments(): Promise<StudentAssignment[]> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const q = query(
//       collection(this.db, 'studentAssignments'),
//       where('StudentId', '==', user.uid)
//     );

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       SubmittedAt: doc.data().SubmittedAt ? (doc.data().SubmittedAt as Timestamp).toDate() : undefined
//     } as StudentAssignment));
//   }

//   /**
//    * Attachment methods
//    */
//   async addAttachment(assignmentId: string, file: File): Promise<string> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const userRole = await this.authService.getUserRole();
//     if (userRole !== 'admin') throw new Error('Only admins can add attachments');

//     // TODO: Implement file upload to Firebase Storage
//     // For now, we'll just store the metadata
//     const attachmentData = {
//       Name: file.name,
//       FileType: file.type,
//       FileUrl: '', // This should come from Storage upload
//       UploadedBy: user.uid,
//       CreatedAt: serverTimestamp()
//     };

//     const attachmentRef = collection(this.db, `assignments/${assignmentId}/attachments`);
//     const docRef = await addDoc(attachmentRef, attachmentData);
    
//     // Clear the attachments cache for this assignment
//     this.attachmentsCache.delete(assignmentId);
    
//     return docRef.id;
//   }

//   async getAttachments(assignmentId: string): Promise<AssignmentAttachment[]> {
//     // Check cache first
//     if (this.isCacheValid(this.attachmentsCache, assignmentId)) {
//       return this.attachmentsCache.get(assignmentId)!.data;
//     }
    
//     const attachmentsRef = collection(this.db, `assignments/${assignmentId}/attachments`);
//     const snapshot = await getDocs(attachmentsRef);
    
//     const attachments = snapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       CreatedAt: doc.data().CreatedAt?.toDate()
//     } as AssignmentAttachment));
    
//     // Store in cache
//     this.attachmentsCache.set(assignmentId, { data: attachments, timestamp: Date.now() });
    
//     return attachments;
//   }

//   /**
//    * Question methods
//    */
//   async addQuestion(assignmentId: string, question: Omit<AssignmentQuestion, 'Id' | 'CreatedAt'>): Promise<string> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const userRole = await this.authService.getUserRole();
//     if (userRole !== 'admin') throw new Error('Only admins can add questions');

//     const questionData = {
//       ...question,
//       CreatedAt: serverTimestamp()
//     };

//     const questionsRef = collection(this.db, `assignments/${assignmentId}/questions`);
//     const docRef = await addDoc(questionsRef, questionData);
    
//     // Clear the questions cache for this assignment
//     this.questionsCache.delete(assignmentId);
    
//     return docRef.id;
//   }

//   async getQuestions(assignmentId: string): Promise<AssignmentQuestion[]> {
//     // Check cache first
//     if (this.isCacheValid(this.questionsCache, assignmentId)) {
//       return this.questionsCache.get(assignmentId)!.data;
//     }
    
//     const questionsRef = collection(this.db, `assignments/${assignmentId}/questions`);
//     const snapshot = await getDocs(questionsRef);
    
//     const questions = snapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       CreatedAt: doc.data().CreatedAt?.toDate()
//     } as AssignmentQuestion));
    
//     // Store in cache
//     this.questionsCache.set(assignmentId, { data: questions, timestamp: Date.now() });
    
//     return questions;
//   }

//   /**
//    * Student answer methods
//    */
//   async submitAnswer(assignmentId: string, questionId: string, answer: string): Promise<string> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const userRole = await this.authService.getUserRole();
//     if (userRole !== 'student') throw new Error('Only students can submit answers');

//     const answerData = {
//       QuestionId: questionId,
//       StudentId: user.uid,
//       Answer: answer,
//       SubmittedAt: serverTimestamp()
//     };

//     const answersRef = collection(this.db, `assignments/${assignmentId}/studentAnswers`);
//     const docRef = await addDoc(answersRef, answerData);
    
//     // Clear the student answers cache for this assignment
//     const cacheKey = `${assignmentId}_${user.uid}`;
//     this.studentAnswersCache.delete(cacheKey);
    
//     return docRef.id;
//   }

//   async getStudentAnswers(assignmentId: string, studentId?: string): Promise<StudentAnswer[]> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const userRole = await this.authService.getUserRole();
//     if (userRole !== 'admin' && (!studentId || studentId !== user.uid)) {
//       throw new Error('Students can only view their own answers');
//     }
    
//     // Use the current user's ID if studentId is not provided
//     const targetStudentId = studentId || user.uid;
//     const cacheKey = `${assignmentId}_${targetStudentId}`;
    
//     // Check cache first
//     if (this.isCacheValid(this.studentAnswersCache, cacheKey)) {
//       return this.studentAnswersCache.get(cacheKey)!.data;
//     }

//     const answersRef = collection(this.db, `assignments/${assignmentId}/studentAnswers`);
//     const q = query(answersRef, where('StudentId', '==', targetStudentId));
    
//     const snapshot = await getDocs(q);
//     const answers = snapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       SubmittedAt: doc.data().SubmittedAt?.toDate(),
//       GradedAt: doc.data().GradedAt?.toDate()
//     } as StudentAnswer));
    
//     // Store in cache
//     this.studentAnswersCache.set(cacheKey, { data: answers, timestamp: Date.now() });
    
//     return answers;
//   }

//   async gradeAnswer(assignmentId: string, answerId: string, score: number): Promise<void> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const userRole = await this.authService.getUserRole();
//     if (userRole !== 'admin') throw new Error('Only admins can grade answers');

//     const answerRef = doc(this.db, `assignments/${assignmentId}/studentAnswers/${answerId}`);
//     await updateDoc(answerRef, {
//       Score: score,
//       GradedBy: user.uid,
//       GradedAt: serverTimestamp()
//     });
    
//     // Clear all student answers caches for this assignment
//     for (const key of Array.from(this.studentAnswersCache.keys())) {
//       if (key.startsWith(`${assignmentId}_`)) {
//         this.studentAnswersCache.delete(key);
//       }
//     }
//   }

//   /**
//    * Discussion methods
//    */
//   async addDiscussion(assignmentId: string, content: string): Promise<string> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const discussionData = {
//       UserId: user.uid,
//       Content: content,
//       CreatedAt: serverTimestamp()
//     };

//     const discussionsRef = collection(this.db, `assignments/${assignmentId}/discussions`);
//     const docRef = await addDoc(discussionsRef, discussionData);
    
//     // Clear the discussions cache for this assignment
//     this.discussionsCache.delete(assignmentId);
    
//     return docRef.id;
//   }

//   async getDiscussions(assignmentId: string): Promise<AssignmentDiscussion[]> {
//     // Check cache first
//     if (this.isCacheValid(this.discussionsCache, assignmentId)) {
//       return this.discussionsCache.get(assignmentId)!.data;
//     }
    
//     const discussionsRef = collection(this.db, `assignments/${assignmentId}/discussions`);
//     const q = query(discussionsRef, orderBy('CreatedAt', 'asc'));
    
//     const snapshot = await getDocs(q);
//     const discussions = snapshot.docs.map(doc => ({
//       Id: doc.id,
//       ...doc.data(),
//       CreatedAt: doc.data().CreatedAt?.toDate(),
//       UpdatedAt: doc.data().UpdatedAt?.toDate()
//     } as AssignmentDiscussion));
    
//     // Store in cache
//     this.discussionsCache.set(assignmentId, { data: discussions, timestamp: Date.now() });
    
//     return discussions;
//   }

//   async updateDiscussion(assignmentId: string, discussionId: string, content: string): Promise<void> {
//     const user = await this.authService.getCurrentUser();
//     if (!user) throw new Error('User not authenticated');

//     const discussionRef = doc(this.db, `assignments/${assignmentId}/discussions/${discussionId}`);
//     const discussionDoc = await getDoc(discussionRef);
    
//     if (!discussionDoc.exists()) throw new Error('Discussion not found');
//     if (discussionDoc.data().UserId !== user.uid) throw new Error('Can only edit your own discussions');

//     await updateDoc(discussionRef, {
//       Content: content,
//       UpdatedAt: serverTimestamp()
//     });
    
//     // Clear the discussions cache for this assignment
//     this.discussionsCache.delete(assignmentId);
//   }
// }