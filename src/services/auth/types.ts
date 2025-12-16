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
  guidanceDetails?: {
    imageUrl?: string;
    module?: string;
    plan?: string;
    section?: string;
    status?: string;
    [key: string]: any;
  };
  placementInfo?: {
    arabicProficiency?: string;
    interestReason?: string;
    level?: string;
    listeningAbility?: string;
    plan?: string;
    previousTopics?: string;
    readingAbility?: string;
    section?: string;
    studiedIslamicSciences?: string;
    writingAbility?: string;
    [key: string]: any;
  };
  [key: string]: any;
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