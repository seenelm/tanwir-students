import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Assignment } from '../types/assignment';
import { assignmentConverter } from '../model/assignment';

// Interface for assignment summary (minimal data for listings)
interface AssignmentSummary {
  AssignmentId: string;
  Title: string;
  CourseId: string;
  CourseName: string;
  DueDate: Date;
  Points: number;
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
  

  // Clear cache (useful for testing or when data might be stale)
  clearCache(): void {
    this.cachedAssignments.clear();
    this.cachedSummaries = null;
    this.cachedAttachments.clear();
    this.cachedDiscussions.clear();
    this.cachedQuestions.clear();
    console.log('All caches cleared');
  }
}
