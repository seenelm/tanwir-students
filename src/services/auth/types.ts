export type UserRole = 'admin' | 'student' | null;

export interface StudentInfo {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: string | number;
  studentType?: string;
}

export interface CourseEnrollment {
  courseRef: string;
  metadata?: {
    type?: string;
    section?: string;
    plan?: string;
    status?: string;
  };
}

export interface AuthorizedUser {
  uid: string;
  FirstName: string;
  LastName: string;
  displayName: string | null;
  email: string | null;
  role?: UserRole;
  studentInfo?: StudentInfo;
  courses?: CourseEnrollment[];
}