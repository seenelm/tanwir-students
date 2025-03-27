import { AssignmentService } from '../services/assignments';
import { CourseService } from '../services/courses';
import { AuthService } from '../services/auth';
import { Assignment } from '../types/assignment';
import { Course } from '../types/course';
import '../styles/assignments.css';

export class Assignments {
  private container: HTMLElement;
  private assignmentService: AssignmentService;
  private courseService: CourseService;
  private authService: AuthService;
  private isAdmin: boolean = false;
  private assignments: Assignment[] = [];
  private courses: Course[] = [];
  private modal: HTMLElement | null = null;

  constructor() {
    this.assignmentService = AssignmentService.getInstance();
    this.courseService = CourseService.getInstance();
    this.authService = AuthService.getInstance();
    this.container = document.createElement('div');
    this.container.className = 'assignments-container';
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) return;

      const userDoc = await this.authService.getUserData(user.uid);
      this.isAdmin = userDoc?.Role === 'admin';

      await this.loadData();
      this.render();
    } catch (error) {
      console.error('Error initializing assignments:', error);
    }
  }

  private async loadData(): Promise<void> {
    try {
      this.courses = await this.courseService.getCourses();
      
      if (this.isAdmin) {
        // Admins see all assignments from all courses
        const assignmentPromises = this.courses.map(course => 
          this.assignmentService.getCourseAssignments(course.Id)
        );
        const assignmentsArrays = await Promise.all(assignmentPromises);
        this.assignments = assignmentsArrays.flat();
      } else {
        // Students only see their assignments
        // const studentAssignments = await this.assignmentService.getCurrentUserAssignments();
        // TODO: Fetch full assignment details for each student assignment
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <div class="modal-body"></div>
      </div>
    `;

    const closeButton = modal.querySelector('.close-button');
    closeButton?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    return modal;
  }

  private createAssignmentForm(): HTMLElement {
    const form = document.createElement('form');
    form.className = 'assignment-form';
    
    const courseOptions = this.courses
      .map(course => `<option value="${course.Id}">${course.Name}</option>`)
      .join('');

    form.innerHTML = `
      <h3>Create New Assignment</h3>
      <div class="form-group">
        <label for="courseSelect">Course</label>
        <select id="courseSelect" required>
          <option value="">Select a course</option>
          ${courseOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" placeholder="Assignment title" required>
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" placeholder="Assignment description" required></textarea>
      </div>
      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input type="datetime-local" id="dueDate" required>
      </div>
      <div class="form-group">
        <label for="points">Points</label>
        <input type="number" id="points" min="0" step="1" required>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-button">Create Assignment</button>
      </div>
    `;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const courseSelect = form.querySelector('#courseSelect') as HTMLSelectElement;
      const titleInput = form.querySelector('#title') as HTMLInputElement;
      const descInput = form.querySelector('#description') as HTMLTextAreaElement;
      const dueDateInput = form.querySelector('#dueDate') as HTMLInputElement;
      const pointsInput = form.querySelector('#points') as HTMLInputElement;

      try {
        await this.assignmentService.createAssignment(
          courseSelect.value,
          titleInput.value,
          descInput.value,
          new Date(dueDateInput.value),
          parseInt(pointsInput.value)
        );

        await this.loadData();
        this.render();
        if (this.modal) {
          this.modal.style.display = 'none';
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
        alert('Failed to create assignment. Please try again.');
      }
    });

    return form;
  }

  private showCreateAssignmentModal(): void {
    if (!this.modal) {
      this.modal = this.createModal();
      document.body.appendChild(this.modal);
    }

    const modalBody = this.modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = '';
      modalBody.appendChild(this.createAssignmentForm());
    }

    this.modal.style.display = 'block';
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private createAssignmentCard(assignment: Assignment): HTMLElement {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    
    const courseName = this.courses.find(c => c.Id === assignment.CourseId)?.Name || 'Unknown Course';
    
    card.innerHTML = `
      <div class="assignment-header">
        <h3>${assignment.Title}</h3>
        <span class="course-name">${courseName}</span>
      </div>
      <div class="assignment-content">
        <p>${assignment.Description}</p>
        <div class="assignment-meta">
          <span class="due-date">Due: ${this.formatDate(assignment.DueDate)}</span>
          <span class="points">${assignment.Points} points</span>
        </div>
      </div>
    `;

    return card;
  }

  render(): HTMLElement {
    this.container.innerHTML = '';

    const header = document.createElement('div');
    // header.className = 'assignments-header';
    
    // const title = document.createElement('h2');
    // title.textContent = 'Assignments';
    // header.appendChild(title);

    if (this.isAdmin) {
      const createButton = document.createElement('button');
      createButton.className = 'create-assignment-button';
      createButton.textContent = 'Create Assignment';
      createButton.addEventListener('click', () => this.showCreateAssignmentModal());
      header.appendChild(createButton);
    }

    this.container.appendChild(header);

    const assignmentsGrid = document.createElement('div');
    assignmentsGrid.className = 'assignments-grid';
    
    this.assignments.forEach(assignment => {
      assignmentsGrid.appendChild(this.createAssignmentCard(assignment));
    });

    this.container.appendChild(assignmentsGrid);
    return this.container;
  }
}