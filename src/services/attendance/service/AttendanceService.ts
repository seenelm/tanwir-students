import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { AttendanceRecord, ClassSession, StudentAttendanceSummary } from '../types/attendance';

export class AttendanceService {
  private static instance: AttendanceService;
  private db = getFirestore();

  private constructor() {}

  static getInstance(): AttendanceService {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }
    return AttendanceService.instance;
  }

  // Helper method to extract student name from various formats
  private getStudentName(student: any): string {
    // Try to get name from studentInfo first
    if (student.studentInfo) {
      const info = student.studentInfo;
      if (info.firstName && info.lastName) {
        return `${info.firstName} ${info.lastName}`;
      } else if (info.firstName) {
        return info.firstName;
      } else if (info.lastName) {
        return info.lastName;
      } else if (info.name) {
        return info.name;
      }
    }
    
    // Try email as name if it's not a UID
    if (student.email && !student.email.includes('ID:') && student.uid && !student.uid.includes(student.email)) {
      return student.email;
    }
    
    // Fall back to FirstName/LastName
    if (student.FirstName || student.LastName) {
      return `${student.FirstName || ''} ${student.LastName || ''}`.trim();
    }
    
    // Fall back to displayName
    if (student.displayName) {
      return student.displayName;
    }
    
    // If we have an email that looks like a name (contains @ but not the UID)
    if (student.uid && student.uid.includes('@') && !student.uid.includes('ID:')) {
      return student.uid;
    }
    
    return 'Unknown';
  }

  // Class Session Management
  async createClassSession(
    courseId: string,
    date: Date,
    topic?: string,
    description?: string,
    createdBy?: string
  ): Promise<string> {
    try {
      const sessionsCollection = collection(this.db, 'classSessions');
      const sessionData = {
        CourseId: courseId,
        Date: Timestamp.fromDate(date),
        Topic: topic || '',
        Description: description || '',
        CreatedBy: createdBy || 'Unknown',
        CreatedAt: Timestamp.now()
      };

      const docRef = await addDoc(sessionsCollection, sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating class session:', error);
      throw error;
    }
  }

  async getClassSessions(courseId: string): Promise<ClassSession[]> {
    try {
      const sessionsCollection = collection(this.db, 'classSessions');
      const q = query(
        sessionsCollection,
        where('CourseId', '==', courseId)
      );

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as ClassSession));
      
      // Sort by date in JavaScript instead of Firestore
      sessions.sort((a, b) => {
        const dateA = a.Date?.toMillis ? a.Date.toMillis() : 0;
        const dateB = b.Date?.toMillis ? b.Date.toMillis() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`Found ${sessions.length} sessions for course ${courseId}:`, sessions);
      return sessions;
    } catch (error) {
      console.error('Error fetching class sessions:', error);
      return [];
    }
  }

  async updateClassSession(
    sessionId: string,
    updates: Partial<ClassSession>
  ): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'classSessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        UpdatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating class session:', error);
      throw error;
    }
  }

  async deleteClassSession(sessionId: string): Promise<void> {
    try {
      // Delete the session
      const sessionRef = doc(this.db, 'classSessions', sessionId);
      await deleteDoc(sessionRef);

      // Delete all attendance records for this session
      const attendanceCollection = collection(this.db, 'attendance');
      const q = query(attendanceCollection, where('SessionId', '==', sessionId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting class session:', error);
      throw error;
    }
  }

  async openAttendanceSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'classSessions', sessionId);
      await updateDoc(sessionRef, {
        IsActive: true,
        UpdatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error opening attendance session:', error);
      throw error;
    }
  }

  async closeAttendanceSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'classSessions', sessionId);
      await updateDoc(sessionRef, {
        IsActive: false,
        ClosedAt: Timestamp.now(),
        UpdatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error closing attendance session:', error);
      throw error;
    }
  }

  async getActiveSessions(courseId: string): Promise<ClassSession[]> {
    try {
      console.log('Looking for active sessions in course:', courseId);
      const sessionsCollection = collection(this.db, 'classSessions');
      const q = query(
        sessionsCollection,
        where('CourseId', '==', courseId),
        where('IsActive', '==', true)
      );

      const snapshot = await getDocs(q);
      console.log('Active session query results:', {
        empty: snapshot.empty,
        count: snapshot.docs.length,
        docs: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      });
      
      if (snapshot.empty) {
        console.log('No active sessions found for course:', courseId);
        return [];
      }

      // Return all active sessions
      const activeSessions = snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as ClassSession));
      
      console.log('Found active sessions:', activeSessions);
      return activeSessions;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  // Attendance Management
  async markAttendance(
    courseId: string,
    sessionId: string,
    studentId: string,
    studentName: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    markedBy: string,
    notes?: string
  ): Promise<string> {
    try {
      const attendanceCollection = collection(this.db, 'attendance');
      
      // Check if attendance already exists for this student and session
      const q = query(
        attendanceCollection,
        where('CourseId', '==', courseId),
        where('SessionId', '==', sessionId),
        where('StudentId', '==', studentId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Update existing record
        const existingDoc = snapshot.docs[0];
        await updateDoc(existingDoc.ref, {
          Status: status,
          Notes: notes || '',
          MarkedBy: markedBy,
          UpdatedAt: Timestamp.now()
        });
        return existingDoc.id;
      } else {
        // Create new record
        const attendanceData = {
          CourseId: courseId,
          SessionId: sessionId,
          StudentId: studentId,
          StudentName: studentName,
          Status: status,
          Notes: notes || '',
          MarkedBy: markedBy,
          CreatedAt: Timestamp.now()
        };

        const docRef = await addDoc(attendanceCollection, attendanceData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  async getAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceCollection = collection(this.db, 'attendance');
      const q = query(
        attendanceCollection,
        where('SessionId', '==', sessionId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error fetching attendance for session:', error);
      return [];
    }
  }

  async getAttendanceForCourse(courseId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceCollection = collection(this.db, 'attendance');
      const q = query(
        attendanceCollection,
        where('CourseId', '==', courseId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error fetching attendance for course:', error);
      return [];
    }
  }

  async getAttendanceForStudent(
    courseId: string,
    studentId: string
  ): Promise<AttendanceRecord[]> {
    try {
      const attendanceCollection = collection(this.db, 'attendance');
      const q = query(
        attendanceCollection,
        where('CourseId', '==', courseId),
        where('StudentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }
  }

  async getAttendanceSummary(
    courseId: string,
    enrolledStudents: any[]
  ): Promise<StudentAttendanceSummary[]> {
    try {
      const sessions = await this.getClassSessions(courseId);
      const totalClasses = sessions.length;

      if (totalClasses === 0) {
        return enrolledStudents.map(student => ({
          StudentId: student.uid || student.id || student.studentId,
          StudentName: this.getStudentName(student),
          TotalClasses: 0,
          Present: 0,
          Absent: 0,
          Late: 0,
          Excused: 0,
          AttendanceRate: 0
        }));
      }

      const attendanceRecords = await this.getAttendanceForCourse(courseId);

      return enrolledStudents.map(student => {
        const studentId = student.uid || student.id || student.studentId;
        const studentRecords = attendanceRecords.filter(
          record => record.StudentId === studentId
        );

        const present = studentRecords.filter(r => r.Status === 'present').length;
        const absent = studentRecords.filter(r => r.Status === 'absent').length;
        const late = studentRecords.filter(r => r.Status === 'late').length;
        const excused = studentRecords.filter(r => r.Status === 'excused').length;

        const attendanceRate = totalClasses > 0 
          ? ((present + late) / totalClasses) * 100 
          : 0;

        return {
          StudentId: studentId,
          StudentName: this.getStudentName(student),
          TotalClasses: totalClasses,
          Present: present,
          Absent: absent,
          Late: late,
          Excused: excused,
          AttendanceRate: Math.round(attendanceRate)
        };
      });
    } catch (error) {
      console.error('Error calculating attendance summary:', error);
      return [];
    }
  }

  async studentMarkPresent(
    courseId: string,
    sessionId: string,
    studentId: string,
    studentName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('studentMarkPresent called with:', { courseId, sessionId, studentId, studentName });
      
      // Check if session is active
      const sessionSnap = await getDocs(query(collection(this.db, 'classSessions'), where('__name__', '==', sessionId)));
      
      if (sessionSnap.empty) {
        console.log('Session not found:', sessionId);
        return { success: false, message: 'Session not found' };
      }

      const sessionData = sessionSnap.docs[0].data();
      console.log('Session data:', sessionData);
      
      if (!sessionData.IsActive) {
        console.log('Session is not active');
        return { success: false, message: 'This attendance session is not currently open' };
      }

      // Check if student already marked attendance
      const attendanceCollection = collection(this.db, 'attendance');
      const q = query(
        attendanceCollection,
        where('CourseId', '==', courseId),
        where('SessionId', '==', sessionId),
        where('StudentId', '==', studentId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log('Student already marked attendance');
        return { success: false, message: 'You have already marked your attendance for this session' };
      }

      // Mark student as present
      const attendanceData = {
        CourseId: courseId,
        SessionId: sessionId,
        StudentId: studentId,
        StudentName: studentName,
        Status: 'present',
        Notes: 'Self-marked',
        MarkedBy: studentId,
        CreatedAt: Timestamp.now()
      };

      console.log('Attempting to create attendance record:', attendanceData);
      await addDoc(attendanceCollection, attendanceData);
      console.log('Attendance marked successfully!');
      return { success: true, message: 'Attendance marked successfully!' };
    } catch (error: any) {
      console.error('Error marking student attendance:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      return { success: false, message: `Failed to mark attendance: ${error?.message || 'Unknown error'}` };
    }
  }

  // Real-time listener for attendance updates
  subscribeToAttendance(
    courseId: string,
    callback: (records: AttendanceRecord[]) => void
  ): () => void {
    const attendanceCollection = collection(this.db, 'attendance');
    const q = query(
      attendanceCollection,
      where('CourseId', '==', courseId)
    );

    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        Id: doc.id,
        ...doc.data()
      } as AttendanceRecord));
      callback(records);
    });
  }
}
