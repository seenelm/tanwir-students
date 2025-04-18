export interface Enrollment {
  EnrolleeId: string;
  Name: string;
}

export interface CourseRequest {
  courseId?: string;
  name?: string;
  description?: string;
  level?: number;
  enrollments?: Enrollment[];
}

export interface Course {
  Id: string;
  CreatedAt: Date;
  CreatedBy: string;
  Description: string;
  Enrollments: Enrollment[];
  Level: number;
  Name: string;
  Syllabus?: string; // Optional syllabus content
}

export interface CourseResponse {
  course: Course[];
}