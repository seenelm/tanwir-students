import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import { Course } from '../types/course';


export class CourseService {
  private static instance: CourseService;
  private db = getFirestore();

  private constructor() {}

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async createCourse(name: string, description: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Check if user is admin
    const isAdmin = await this.isUserAdmin(user.uid);
    if (!isAdmin) throw new Error('Unauthorized: Only admins can create courses');

    const courseData = {
      Name: name,
      Description: description,
      CreatedBy: user.uid,
      CreatedAt: serverTimestamp()
    };

    const courseRef = await addDoc(collection(this.db, 'courses'), courseData);
    
    // Add creator as admin of the course
    await this.addUserToCourse(courseRef.id, user.uid, 'admin');
    
    return courseRef.id;
  }

  async addUserToCourse(courseId: string, userId: string, role: 'student' | 'admin'): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Check if current user is admin
    const isAdmin = await this.isUserAdmin(user.uid);
    if (!isAdmin) throw new Error('Unauthorized: Only admins can add users to courses');

    const enrollmentData = {
      CourseId: courseId,
      UserId: userId,
      Role: role,
      EnrolledAt: serverTimestamp()
    };

    await addDoc(collection(this.db, 'courseEnrollments'), enrollmentData);
  }

  async getCourses(): Promise<Course[]> {
    const user = auth.currentUser;
    console.log('User:', user);
    console.log('User uid:', user?.uid);
    if (!user) throw new Error('User not authenticated');

    const enrollmentsQuery = query(
      collection(this.db, 'courseEnrollments'),
      where('UserId', '==', user.uid)
    );

    const enrollments = await getDocs(enrollmentsQuery);
    const courseIds = enrollments.docs.map(doc => doc.data().CourseId);

    const courses: Course[] = [];
    for (const courseId of courseIds) {
      const courseDoc = await getDocs(
        query(collection(this.db, 'courses'), where('__name__', '==', courseId))
      );
      if (!courseDoc.empty) {
        const doc = courseDoc.docs[0];
        const courseData = {
          Id: doc.id,
          ...doc.data()
        } as Course;
        courses.push(courseData);
      }
    }

    return courses;
  }

  async getCourseStudents(courseId: string): Promise<string[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Check if current user has access to this course
    const hasAccess = await this.userHasCourseAccess(user.uid, courseId);
    if (!hasAccess) throw new Error('Unauthorized: No access to this course');

    const enrollmentsQuery = query(
      collection(this.db, 'courseEnrollments'),
      where('CourseId', '==', courseId),
      where('Role', '==', 'student')
    );

    const enrollments = await getDocs(enrollmentsQuery);
    return enrollments.docs.map(doc => doc.data().UserId);
  }

  private async isUserAdmin(userId: string): Promise<boolean> {
    const userDoc = await getDocs(
      query(collection(this.db, 'authorizedUsers'), 
            where('__name__', '==', userId))
    );
    
    if (userDoc.empty) return false;
    const userData = userDoc.docs[0].data();
    return userData.Role === 'admin';
  }

  private async userHasCourseAccess(userId: string, courseId: string): Promise<boolean> {
    const enrollmentQuery = query(
      collection(this.db, 'courseEnrollments'),
      where('UserId', '==', userId),
      where('CourseId', '==', courseId)
    );

    const enrollment = await getDocs(enrollmentQuery);
    return !enrollment.empty;
  }
}