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
  catalogItemId?: string; // Square catalog item ID
}

export interface CourseVariation {
  variationId: string;
  name: string;
  price: number;
  currency: string;
}

export interface CourseEventData {
  startAt: string;
  endAt: string;
  locationName: string;
  locationType: string[];
}

export interface Course {
  Id: string;  // Keep uppercase Id for compatibility with existing code
  name: string;
  description: string;
  createdBy: string;
  createdAt?: any;
  section?: string;
  year?: string;
  syllabus?: string;
  subjects?: string[];  // Array of subjects for the course
  // Add these for compatibility with existing code
  Name?: string;      // Alias for name
  Description?: string; // Alias for description
  CreatedBy?: string;   // Alias for createdBy
  CreatedAt?: any;      // Alias for createdAt
  Section?: string;     // Alias for section
  Year?: string;        // Alias for year
  Syllabus?: string;    // Alias for syllabus
  Subjects?: string[];  // Uppercase alias for subjects
  Enrollments?: any[];  // Keep for compatibility
  Level?: number;       // Keep for compatibility
}

export interface CourseResponse {
  course: Course[];
}