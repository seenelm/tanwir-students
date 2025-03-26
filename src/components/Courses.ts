import { CourseService, Course } from '../services/courses';
import { AuthService } from '../services/auth';
import '../styles/courses.css';

export class Courses {
  private courseService: CourseService;
  private authService: AuthService;
  private container: HTMLElement;
  private courses: Course[] = [];
  private isAdmin: boolean = false;

  constructor() {
    this.courseService = CourseService.getInstance();
    this.authService = AuthService.getInstance();
    this.container = document.createElement('div');
    this.container.className = 'courses-container';
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      // Check if user is admin
      const userDoc = await this.authService.getUserData(user.uid);
      this.isAdmin = userDoc?.Role === 'admin';

      await this.loadCourses();
      this.render();
    } catch (error) {
      console.error('Error initializing courses:', error);
    }
  }

  private async loadCourses(): Promise<void> {
    try {
      this.courses = await this.courseService.getCourses();
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }

  private createCourseForm(): HTMLElement {
    const form = document.createElement('form');
    form.className = 'course-form';
    form.innerHTML = `
      <h3>Create New Course</h3>
      <input type="text" placeholder="Course Name" required>
      <textarea placeholder="Course Description" required></textarea>
      <button type="submit">Create Course</button>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('input') as HTMLInputElement;
      const descInput = form.querySelector('textarea') as HTMLTextAreaElement;

      try {
        await this.courseService.createCourse(nameInput.value, descInput.value);
        await this.loadCourses();
        this.render();
        nameInput.value = '';
        descInput.value = '';
      } catch (error) {
        console.error('Error creating course:', error);
        alert('Failed to create course. Please try again.');
      }
    });

    return form;
  }

  private createAddStudentForm(courseId: string): HTMLElement {
    const form = document.createElement('form');
    form.className = 'add-student-form';
    form.innerHTML = `
      <input type="email" placeholder="Student Email" required>
      <button type="submit">Add Student</button>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input') as HTMLInputElement;
      const email = emailInput.value;

      try {
        // Get user by email (you'll need to implement this in AuthService)
        const userId = await this.authService.getUserIdByEmail(email);
        if (!userId) {
          alert('User not found');
          return;
        }

        await this.courseService.addUserToCourse(courseId, userId, 'student');
        emailInput.value = '';
        alert('Student added successfully');
      } catch (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student. Please try again.');
      }
    });

    return form;
  }

  private createCourseCard(course: Course): HTMLElement {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const content = document.createElement('div');
    content.className = 'course-content';
    content.innerHTML = `
      <h3>${course.Name}</h3>
      <p>${course.Description}</p>
    `;
    card.appendChild(content);

    if (this.isAdmin) {
      const adminSection = document.createElement('div');
      adminSection.className = 'course-admin-section';
      adminSection.appendChild(this.createAddStudentForm(course.CreatedBy));
      card.appendChild(adminSection);
    }

    return card;
  }

  render(): HTMLElement {
    this.container.innerHTML = '';

    if (this.isAdmin) {
      this.container.appendChild(this.createCourseForm());
    }

    const coursesGrid = document.createElement('div');
    coursesGrid.className = 'courses-grid';
    
    this.courses.forEach(course => {
      coursesGrid.appendChild(this.createCourseCard(course));
    });

    this.container.appendChild(coursesGrid);
    return this.container;
  }
}