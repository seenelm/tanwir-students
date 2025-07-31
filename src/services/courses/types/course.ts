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
  Id: string;
  CreatedAt: Date;
  CreatedBy: string;
  Description: string;
  Enrollments: Enrollment[];
  Level: number;
  Name: string;
  Syllabus?: string; // Optional syllabus content
  // Square-related fields
  CatalogItemId?: string; // ID of the course in Square catalog
  Price?: number; // Price in dollars (default variation price)
  PaymentLink?: string; // Square payment link for direct checkout
  ImageUrl?: string; // Image URL from Square catalog
  LastUpdated?: Date; // Last time the course was updated
  SquareData?: {
    variations: CourseVariation[];
    eventData?: CourseEventData;
    categoryIds?: string[];
  };
}

export interface CourseResponse {
  course: Course[];
}