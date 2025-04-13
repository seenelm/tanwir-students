import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { Course, CourseRequest, CourseResponse } from '../types/course';
import { courseConverter } from '../model/course';

export class CourseService {
  private static instance: CourseService;
  private db = getFirestore();
  private coursesCollection = collection(this.db, 'courses').withConverter(courseConverter);
  private cachedCourses: Course[] = [];

  private constructor() {}

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async getCourses(request: CourseRequest = {}): Promise<CourseResponse> {
    if (this.cachedCourses.length > 0 && Object.keys(request).length === 0) {
      return { course: this.cachedCourses };
    }

    const constraints = [];
    if (request.courseId) {
      constraints.push(where('courseId', '==', request.courseId));
    }
    if (request.name) {
      constraints.push(where('Name', '==', request.name));
    }
    if (request.level !== undefined) {
      constraints.push(where('Level', '==', request.level));
    }

    const q = query(this.coursesCollection, ...constraints);
    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map(doc => doc.data());

    // Only cache if we're fetching all
    if (Object.keys(request).length === 0) {
      this.cachedCourses = courses;
    }

    return { course: courses };
  }

  getCourseById(courseId: string): Course | null {
    return this.cachedCourses.find(course => course.Id === courseId) || null;
  }
}
