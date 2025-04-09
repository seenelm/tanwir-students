import '../styles/courses.css';
import { Course } from '../services/courses/types/course';
import { CourseService } from '../services/courses/service/CourseService';
import './CourseCard';

export class Courses extends HTMLElement {
  private courses: Course[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    await this.fetchCourses();
    this.render();
  }

  private async fetchCourses() {
    try {
      const service = new CourseService();
      const response = await service.getCourses({});
      this.courses = response.course;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  }

  private render() {
    let content = `
      <style>
        .courses-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsive grid */
          gap: 20px;
          padding: 20px;
          font-family: sans-serif;
        }
      </style>
      <div class="courses-container">
    `;

    this.courses.forEach(course => {
      content += `
        <course-card
          course-id="${course.Id}"
          name="${course.Name}"
          description="${course.Description}"
          level="${course.Level}"
          created-by="${course.CreatedBy}"
          enrollment-count="${course.Enrollments ? course.Enrollments.length : 0}"
        ></course-card>
      `;
    });

    content += `</div>`;

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = content;
    }
  }

  public getElement(): HTMLElement {
    return this;
  }
}

customElements.define("course-list", Courses);