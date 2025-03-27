export interface Course {
    Id: string;
    Name: string;
    Description: string;
    CreatedBy: string;
    CreatedAt: Date;
  }
  
  export interface CourseEnrollment {
    CourseId: string;
    UserId: string;
    Role: 'student' | 'admin';
    EnrolledAt: Date;
  }