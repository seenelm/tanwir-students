import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { CourseRequest, CourseResponse } from '../types/course';
import { courseConverter } from '../model/course';

export class CourseService {
  private db = getFirestore();
  private coursesCollection = collection(this.db, 'courses').withConverter(courseConverter);

  async getCourses(request: CourseRequest = {}): Promise<CourseResponse> {
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
}
