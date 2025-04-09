import courseCardStyles from '../styles/courseCard.css?raw';

export class CourseCard extends HTMLElement {
  // Update the observed attributes to reflect our course properties.
  static get observedAttributes() {
    return ['name', 'description', 'level', 'created-at', 'created-by', 'enrollment-count'];
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
    const name = this.getAttribute('name') || '';
    const description = this.getAttribute('description') || '';
    const level = this.getAttribute('level') || '';
    // const createdAt = this.getAttribute('created-at') || '';
    const createdBy = this.getAttribute('created-by') || '';
    const enrollmentCount = this.getAttribute('enrollment-count') || '0';

    this.shadowRoot!.innerHTML = `
      <style>
        ${courseCardStyles}
      </style>
      <div class="course-card">
        <div class="course-header">
          <h3 class="course-title">${name}</h3>
          <span class="course-level">Level: ${level}</span>
        </div>
        <p class="course-description">${description}</p>
        <div class="course-meta">
          <span>Created by: ${createdBy}</span>
          <span>${enrollmentCount} enrolled</span>
        </div>
      </div>
    `;

    // Example: dispatch a 'card-click' event when the card is clicked.
    this.shadowRoot!.querySelector('.course-card')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('card-click', {
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('course-card', CourseCard);
