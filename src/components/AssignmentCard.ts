import assignmentCardStyles from '../styles/assignmentCard.css?raw';

export class AssignmentCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'course', 'description', 'due-date', 'total-points'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  private render() {
    const title = this.getAttribute('title') || '';
    const course = this.getAttribute('course') || '';
    const description = this.getAttribute('description') || '';
    const dueDate = this.getAttribute('due-date') || '';
    const totalPoints = this.getAttribute('total-points') || '0';

    this.shadowRoot!.innerHTML = `
      <style>
        ${assignmentCardStyles}
      </style>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${title}</h3>
          <span class="course-label">${course}</span>
        </div>
        <p class="card-description">${description}</p>
        <div class="card-meta">
          <span>Due: ${dueDate}</span>
          <span>${totalPoints} points</span>
        </div>
      </div>
    `;

    this.shadowRoot!.querySelector('.card')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('card-click', {
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('assignment-card', AssignmentCard);
