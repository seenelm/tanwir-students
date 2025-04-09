export interface Enrollment {
  enrolleeId: string;
  name: string;
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
}

export interface CourseResponse {
  course: Course[];
}