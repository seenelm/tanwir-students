export interface AttendanceRecord {
  Id: string;
  CourseId: string;
  StudentId: string;
  StudentName: string;
  Date: any; // Firestore Timestamp
  Status: 'present' | 'absent' | 'late' | 'excused';
  Notes?: string;
  MarkedBy: string; // Admin who marked attendance
  CreatedAt: any; // Firestore Timestamp
  UpdatedAt?: any; // Firestore Timestamp
}

export interface ClassSession {
  Id: string;
  CourseId: string;
  Date: any; // Firestore Timestamp
  Topic?: string;
  Description?: string;
  CreatedBy: string;
  CreatedAt: any;
  UpdatedAt?: any;
  IsActive?: boolean; // Whether students can currently mark attendance
  ClosedAt?: any; // When the session was closed
}

export interface StudentAttendanceSummary {
  StudentId: string;
  StudentName: string;
  TotalClasses: number;
  Present: number;
  Absent: number;
  Late: number;
  Excused: number;
  AttendanceRate: number; // Percentage
}
