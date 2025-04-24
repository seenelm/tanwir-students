import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Course, CourseRequest, CourseResponse, Enrollment } from '../types/course';
import { courseConverter } from '../model/course';

export class CourseService {
  private static instance: CourseService;
  private db = getFirestore();
  private coursesCollection = collection(this.db, 'courses').withConverter(courseConverter);
  private cachedCourses: Course[] = [];
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    // Initialize real-time listener for all courses
    this.initializeListener();
  }

  private initializeListener() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = onSnapshot(this.coursesCollection, (snapshot) => {
      this.cachedCourses = snapshot.docs.map(doc => doc.data());
    });
  }

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async getCourses(request: CourseRequest = {}): Promise<CourseResponse> {
    // If we have cached courses and no specific filters, return cached data
    if (this.cachedCourses.length > 0 && Object.keys(request).length === 0) {
      return { course: this.cachedCourses };
    }

    // If we need to filter, apply filters to cached data
    if (this.cachedCourses.length > 0) {
      let filteredCourses = this.cachedCourses;
      
      if (request.courseId) {
        filteredCourses = filteredCourses.filter(course => course.Id === request.courseId);
      }
      if (request.name) {
        filteredCourses = filteredCourses.filter(course => course.Name === request.name);
      }
      if (request.level !== undefined) {
        filteredCourses = filteredCourses.filter(course => course.Level === request.level);
      }
      
      return { course: filteredCourses };
    }

    // If no cached data, fetch from Firestore
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

    return { course: courses };
  }

  getCourseById(courseId: string): Course | null {
    return this.cachedCourses.find(course => course.Id === courseId) || null;
  }

  async enrollStudent(courseId: string, studentId: string, studentName: string): Promise<void> {
    try {
      console.log('CourseService.enrollStudent called with:', { courseId, studentId, studentName });
      const courseDoc = doc(this.coursesCollection, courseId);
      console.log('Course document reference:', courseDoc);
      
      const enrollment: Enrollment = {
        EnrolleeId: studentId,
        Name: studentName
      };
      console.log('Creating enrollment:', enrollment);

      // Get current course data
      const course = this.getCourseById(courseId);
      console.log('Current course data:', course);
      
      // Create or update Enrollments array
      const currentEnrollments = course?.Enrollments || [];
      const updatedEnrollments = [...currentEnrollments, enrollment];
      
      console.log('Updating enrollments:', updatedEnrollments);
      await updateDoc(courseDoc, {
        Enrollments: updatedEnrollments
      });
      console.log('Student enrolled successfully');
    } catch (error) {
      console.error('Error in CourseService.enrollStudent:', error);
      throw error;
    }
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    try {
      const courseDoc = doc(this.coursesCollection, courseId);
      const course = this.cachedCourses.find(c => c.Id === courseId);
      
      if (course) {
        const updatedEnrollments = course.Enrollments.filter(
          enrollment => enrollment.EnrolleeId !== studentId
        );
        
        await updateDoc(courseDoc, {
          Enrollments: updatedEnrollments
        });
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  }

  isStudentEnrolled(courseId: string, studentId: string): boolean {
    const course = this.cachedCourses.find(c => c.Id === courseId);
    return course?.Enrollments.some(enrollment => enrollment.EnrolleeId === studentId) || false;
  }

  // Cleanup method to unsubscribe from listeners
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
