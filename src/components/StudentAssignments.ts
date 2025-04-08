// Import the AssignmentCard so that its custom element is registered.
import "./AssignmentCard";
import { AssignmentService } from "../services/assignments/service/AssignmentService";

interface Assignment {
  id: number;
  courseId: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  totalPoints: number;
}

export class StudentAssignments extends HTMLElement {
  private assignments: Assignment[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    await this.fetchAssignments();
    this.render();
  }

  private async fetchAssignments() {
    try {
      const service = new AssignmentService();
      const response = await service.getAssignments({});
      
      this.assignments = response.assignments.map(assignment => ({
        id: (assignment as any).id || '',  
        title: assignment.Title,
        courseId: assignment.CourseId,
        course: assignment.CourseName,
        description: assignment.Description,
        dueDate: assignment.DueDate.toLocaleDateString(),
        totalPoints: assignment.Points,
      }));
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  }

  private groupByCourse(assignments: Assignment[]): Record<string, Assignment[]> {
    return assignments.reduce((groups: Record<string, Assignment[]>, assignment: Assignment) => {
      const course = assignment.course;
      if (!groups[course]) {
        groups[course] = [];
      }
      groups[course].push(assignment);
      return groups;
    }, {});
  }

  private render() {
    const grouped = this.groupByCourse(this.assignments);
    
    let content = `
      <style>
        .course-section {
          margin-bottom: 2rem;
          font-family: sans-serif;
        }
        .course-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .assignments-container {
          padding: 1rem;
        }
      </style>
      <div class="assignments-container">
    `;

    Object.keys(grouped).forEach((course) => {
      content += `<div class="course-section">
                    <div class="course-title">${course}</div>`;
      grouped[course].forEach((assignment) => {
        content += `
          <assignment-card 
            title="${assignment.title}" 
            course="${assignment.course}" 
            description="${assignment.description}" 
            due-date="${assignment.dueDate}" 
            total-points="${assignment.totalPoints}">
          </assignment-card>`;
      });
      content += `</div>`;
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

customElements.define("student-assignments", StudentAssignments);
