import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { Assignment, QuizQuestion } from '../types/assignment';
import { assignmentConverter } from '../model/assignment';
import { auth } from '../../../config/firebase';

// Interface for assignment summary (minimal data for listings)
interface AssignmentSummary {
  AssignmentId: string;
  Title: string;
  CourseId: string;
  CourseName: string;
  DueDate: Date;
  Points: number;
}

interface StudentGrade {
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  totalPoints: number;
  submittedAt: Date;
}

interface StudentGrades {
  studentId: string;
  studentName: string;
  grades: StudentGrade[];
}

export class AssignmentService {
  private static instance: AssignmentService;
  private db = getFirestore();
  private assignmentsCollection = collection(this.db, 'assignments').withConverter(assignmentConverter);
  private cachedAssignments: Map<string, Assignment> = new Map();
  private cachedSummaries: AssignmentSummary[] | null = null;
  private cachedAttachments: Map<string, any[]> = new Map();
  private cachedDiscussions: Map<string, any[]> = new Map();
  private cachedQuestions: Map<string, any[]> = new Map();

  private constructor() {}

  static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  // Convert document snapshot to summary
  private documentToSummary(doc: QueryDocumentSnapshot): AssignmentSummary {
    const data = doc.data();
    return {
      AssignmentId: doc.id,
      Title: data.Title,
      CourseId: data.CourseId,
      CourseName: data.CourseName,
      DueDate: data.DueDate,
      Points: data.Points,
    };
  }

  // Get assignment summaries for listings (minimal data)
  async getAssignments(): Promise<AssignmentSummary[]> {
    // Return cached summaries if available
    if (this.cachedSummaries) {
      console.log('Using cached assignment summaries');
      return this.cachedSummaries;
    }

    console.log('Fetching assignment summaries from Firestore');
    const assignmentsQuery = query(
      this.assignmentsCollection,
      orderBy('DueDate', 'asc')
    );
    
    const snapshot = await getDocs(assignmentsQuery);
    const summaries = snapshot.docs.map(doc => this.documentToSummary(doc));
    
    // Cache the summaries
    this.cachedSummaries = summaries;
    return summaries;
  }

  // Get detailed assignment data by ID
  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    // Return cached assignment if available
    if (this.cachedAssignments.has(assignmentId)) {
      console.log(`Using cached assignment data for ID: ${assignmentId}`);
      return this.cachedAssignments.get(assignmentId)!;
    }

    console.log(`Fetching detailed assignment data for ID: ${assignmentId}`);
    const assignmentDoc = doc(this.assignmentsCollection, assignmentId);
    const snapshot = await getDoc(assignmentDoc);

    if (!snapshot.exists()) {
      console.log(`Assignment with ID ${assignmentId} not found`);
      return null;
    }

    const assignment = snapshot.data();
    // Include the document ID in the returned data
    const assignmentWithId = { ...assignment, AssignmentId: snapshot.id };
    
    // Cache the detailed assignment data
    this.cachedAssignments.set(assignmentId, assignmentWithId);
    return assignmentWithId;
  }

  async getAttachments(assignmentId: string) {
    // Return cached attachments if available
    if (this.cachedAttachments.has(assignmentId)) {
      console.log(`Using cached attachments for assignment ID: ${assignmentId}`);
      return this.cachedAttachments.get(assignmentId)!;
    }

    console.log(`Fetching attachments for assignment ID: ${assignmentId}`);
    const attachmentsRef = collection(this.db, `assignments/${assignmentId}/attachments`);
    const snapshot = await getDocs(attachmentsRef);
    const attachments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Cache the attachments
    this.cachedAttachments.set(assignmentId, attachments);
    return attachments;
  }
  
  async getDiscussions(assignmentId: string) {
    // Return cached discussions if available
    if (this.cachedDiscussions.has(assignmentId)) {
      console.log(`Using cached discussions for assignment ID: ${assignmentId}`);
      return this.cachedDiscussions.get(assignmentId)!;
    }

    console.log(`Fetching discussions for assignment ID: ${assignmentId}`);
    const discussionsRef = collection(this.db, `assignments/${assignmentId}/discussions`);
    const snapshot = await getDocs(discussionsRef);
    const discussions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Cache the discussions
    this.cachedDiscussions.set(assignmentId, discussions);
    return discussions;
  }
  
  async getQuestions(assignmentId: string) {
    // Return cached questions if available
    if (this.cachedQuestions.has(assignmentId)) {
      console.log(`Using cached questions for assignment ID: ${assignmentId}`);
      return this.cachedQuestions.get(assignmentId)!;
    }

    console.log(`Fetching questions for assignment ID: ${assignmentId}`);
    const questionsRef = collection(this.db, `assignments/${assignmentId}/questions`);
    const snapshot = await getDocs(questionsRef);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Cache the questions
    this.cachedQuestions.set(assignmentId, questions);
    return questions;
  }
  
  async saveQuizResult(
    assignmentId: string,
    _userId: string, // not needed anymore
    result: {
      score: number;
      totalPoints: number;
      earnedPoints: number;
      answers: Record<string, string>;
      completed: boolean;
      passed?: boolean;
    }
  ) {
    try {
      if (!auth.currentUser) throw new Error('Not signed in');
  
      const resultsRef = collection(this.db, `assignments/${assignmentId}/results`);
      await addDoc(resultsRef, {
        StudentId: auth.currentUser.uid,                // <-- matches rules
        score: result.score,
        totalPoints: result.totalPoints,
        earnedPoints: result.earnedPoints,
        answers: result.answers,
        completed: result.completed,
        passed: result.passed ?? null,
        submittedAt: serverTimestamp()
      });
  
      return true;
    } catch (e) {
      console.error('Error saving quiz result:', e);
      return false;
    }
  }

  async getUserQuizResult(assignmentId: string, userId: string) {
    try {
      console.log('getUserQuizResult called with:', { assignmentId, userId });
      const resultsRef = collection(this.db, `assignments/${assignmentId}/results`);
      
      // Log all results in this subcollection for debugging
      console.log('Checking all results in subcollection');
      const allResults = await getDocs(resultsRef);
      console.log('All results in subcollection:', { 
        empty: allResults.empty, 
        size: allResults.size,
        docs: allResults.docs.map(d => ({ id: d.id, data: d.data() }))
      });
      
      // Simplified query - only filter by StudentId without ordering
      const q = query(
        resultsRef,
        where('StudentId', '==', userId)
      );
      
      console.log('Query created:', q);
      const snap = await getDocs(q);
      console.log('Query results:', { empty: snap.empty, size: snap.size });
      
      if (snap.empty) return null;

      // If we have multiple results, find the most recent one manually
      let latestDoc = snap.docs[0];
      let latestTimestamp = latestDoc.data().submittedAt;
      
      if (snap.size > 1) {
        snap.docs.forEach(doc => {
          const timestamp = doc.data().submittedAt;
          if (timestamp && (!latestTimestamp || timestamp.seconds > latestTimestamp.seconds)) {
            latestDoc = doc;
            latestTimestamp = timestamp;
          }
        });
      }
      
      const result = { id: latestDoc.id, ...(latestDoc.data() as any) };
      console.log('Found quiz result:', result);
      return result;
    } catch (e) {
      console.error('getUserQuizResult error', e);
      return null;
    }
  }

  // Clear cache (useful for testing or when data might be stale)
  clearCache(): void {
    this.cachedAssignments.clear();
    this.cachedSummaries = null;
    this.cachedAttachments.clear();
    this.cachedDiscussions.clear();
    this.cachedQuestions.clear();
    console.log('All caches cleared');
  }

  // Get assignments for a specific course
  async getAssignmentsByCourseId(courseId: string): Promise<Assignment[]> {
    console.log(`Fetching assignments for course ID: ${courseId}`);
    
    // Get all assignment summaries
    const summaries = await this.getAssignments();
    
    // Filter summaries by courseId
    const courseAssignmentSummaries = summaries.filter(
      summary => summary.CourseId === courseId
    );
    
    // Fetch full assignment details for each summary
    const assignments: Assignment[] = [];
    for (const summary of courseAssignmentSummaries) {
      const assignment = await this.getAssignmentById(summary.AssignmentId);
      if (assignment) {
        assignments.push(assignment);
      }
    }
    
    return assignments;
  }

  // Create a new quiz assignment
  async createQuizAssignment(quizData: {
    title: string;
    description: string;
    courseId: string;
    courseName: string;
    subject?: string;
    dueDate: Date;
    points: number;
    questions: QuizQuestion[];
    timeLimit?: number;
    passingScore?: number;
    createdBy: string;
  }): Promise<string> {
    console.log('Creating new quiz assignment');
    
    const newAssignment = {
      Title: quizData.title,
      Description: quizData.description,
      CourseId: quizData.courseId,
      CourseName: quizData.courseName,
      Subject: quizData.subject || null,
      DueDate: quizData.dueDate instanceof Date ? Timestamp.fromDate(quizData.dueDate) : new Date(),
      Points: quizData.points,
      CreatedBy: quizData.createdBy,
      CreatedAt: new Date(),
      AssignmentId: '', // This will be updated after document creation
      type: 'quiz',
      timeLimit: quizData.timeLimit || null,
      passingScore: quizData.passingScore || null
    };
    
    // Add the assignment document
    const docRef = await addDoc(this.assignmentsCollection, newAssignment);
    const assignmentId = docRef.id;
    
    // Update the document with its own ID
    await updateDoc(docRef, {
      AssignmentId: assignmentId
    });
    
    // Add questions as subcollection
    const questionsCollection = collection(this.db, `assignments/${assignmentId}/questions`);
    for (const question of quizData.questions) {
      await addDoc(questionsCollection, {
        text: question.text,
        points: question.points,
        type: question.type,
        options: question.options
      });
    }
    
    // Clear cache to ensure fresh data on next fetch
    this.clearCache();
    
    return assignmentId;
  }

  // Create a new Google Form assignment
  async createGoogleFormAssignment(formData: {
    title: string;
    description: string;
    formUrl: string;
    embedUrl: string;
    courseId: string;
    courseName: string;
    dueDate: Date;
    points: number;
    createdBy?: string;
  }): Promise<string> {
    console.log('Creating new Google Form assignment');
    
    const currentUser = auth.currentUser;
    const createdBy = formData.createdBy || currentUser?.email || 'Admin';
    
    const newAssignment = {
      Title: formData.title,
      Description: formData.description,
      CourseId: formData.courseId,
      CourseName: formData.courseName,
      DueDate: formData.dueDate instanceof Date ? Timestamp.fromDate(formData.dueDate) : Timestamp.now(),
      Points: formData.points,
      CreatedBy: createdBy,
      CreatedAt: serverTimestamp(),
      AssignmentId: '', // This will be updated after document creation
      type: 'google-form',
      formUrl: formData.formUrl,
      embedUrl: formData.embedUrl,
      Subject: null
    };
    
    // Add the assignment document directly without converter to preserve all fields
    const assignmentsCollectionRef = collection(this.db, 'assignments');
    const docRef = await addDoc(assignmentsCollectionRef, newAssignment);
    const assignmentId = docRef.id;
    
    // Update the document with its own ID
    await updateDoc(docRef, {
      AssignmentId: assignmentId
    });
    
    // Clear cache to ensure fresh data on next fetch
    this.clearCache();
    
    return assignmentId;
  }

  // Get all quiz results for a specific student across all assignments in a course
  async getStudentGradesForCourse(courseId: string, studentId: string): Promise<StudentGrade[]> {
    try {
      console.log(`Fetching grades for student ${studentId} in course ${courseId}`);
      
      // Get all assignments for this course
      const courseAssignments = await this.getAssignmentsByCourseId(courseId);
      
      // Fetch results for each assignment
      const grades: StudentGrade[] = [];
      
      for (const assignment of courseAssignments) {
        try {
          const result = await this.getUserQuizResult(assignment.AssignmentId, studentId);
          
          if (result) {
            grades.push({
              assignmentId: assignment.AssignmentId,
              assignmentTitle: assignment.Title,
              score: result.score || 0,
              totalPoints: assignment.Points,
              submittedAt: result.submittedAt?.toDate() || new Date()
            });
          }
        } catch (error) {
          console.error(`Error fetching result for assignment ${assignment.AssignmentId}:`, error);
        }
      }
      
      return grades;
    } catch (error) {
      console.error('Error fetching student grades:', error);
      return [];
    }
  }
  
  // Get all quiz results for all students in a course
  async getAllStudentGradesForCourse(courseId: string, enrolledStudents: any[]): Promise<StudentGrades[]> {
    try {
      console.log(`Fetching grades for all students in course ${courseId}`);
      
      // Get all assignments for this course
      const courseAssignments = await this.getAssignmentsByCourseId(courseId);
      
      // Fetch results for each student
      const allGrades: StudentGrades[] = [];
      
      for (const student of enrolledStudents) {
        try {
          const studentId = student.uid || student.id || student.studentId;
          const studentName = student.displayName || 
                             (student.studentInfo ? 
                              `${student.studentInfo.firstName || ''} ${student.studentInfo.lastName || ''}`.trim() : 
                              student.email || 'Unknown');
          
          const grades: StudentGrade[] = [];
          
          for (const assignment of courseAssignments) {
            try {
              const result = await this.getUserQuizResult(assignment.AssignmentId, studentId);
              
              if (result) {
                grades.push({
                  assignmentId: assignment.AssignmentId,
                  assignmentTitle: assignment.Title,
                  score: result.score || 0,
                  totalPoints: assignment.Points,
                  submittedAt: result.submittedAt?.toDate() || new Date()
                });
              }
            } catch (error) {
              console.error(`Error fetching result for student ${studentId}, assignment ${assignment.AssignmentId}:`, error);
            }
          }
          
          if (grades.length > 0) {
            allGrades.push({
              studentId,
              studentName,
              grades
            });
          }
        } catch (error) {
          console.error(`Error processing student:`, error);
        }
      }
      
      return allGrades;
    } catch (error) {
      console.error('Error fetching all student grades:', error);
      return [];
    }
  }
  
  // Get all results for a specific assignment
  async getAllResultsForAssignment(assignmentId: string): Promise<any[]> {
    try {
      console.log(`Fetching all results for assignment ${assignmentId}`);
      const resultsRef = collection(this.db, `assignments/${assignmentId}/results`);
      const snapshot = await getDocs(resultsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error(`Error fetching results for assignment ${assignmentId}:`, error);
      return [];
    }
  }

  // Get all quiz results for a course in a single batch
  async getAllQuizResultsForCourse(courseId: string): Promise<Record<string, any[]>> {
    try {
      console.log(`Fetching all quiz results for course ${courseId} in batch`);
      
      // Get all assignments for this course
      const courseAssignments = await this.getAssignmentsByCourseId(courseId);
      
      // Create a map to store results by assignment
      const resultsByAssignment: Record<string, any[]> = {};
      
      // Fetch results for each assignment in parallel
      await Promise.all(courseAssignments.map(async (assignment) => {
        try {
          const resultsRef = collection(this.db, `assignments/${assignment.AssignmentId}/results`);
          const snapshot = await getDocs(resultsRef);
          
          resultsByAssignment[assignment.AssignmentId] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate() || new Date()
          }));
        } catch (error) {
          console.error(`Error fetching results for assignment ${assignment.AssignmentId}:`, error);
          resultsByAssignment[assignment.AssignmentId] = [];
        }
      }));
      
      return resultsByAssignment;
    } catch (error) {
      console.error('Error fetching all quiz results:', error);
      return {};
    }
  }
}
