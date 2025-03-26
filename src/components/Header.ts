import { Sidebar } from './Sidebar';
import '../style.css';

export class Header {
  private readonly CLASS_NAMES = {
    header: 'header',
    headerActions: 'header-actions',
    menuToggle: 'menu-toggle',
  };

  constructor(private sidebar: Sidebar) {}

  render(): HTMLElement {
    const header = document.createElement('header');
    header.className = this.CLASS_NAMES.header;
    
    header.innerHTML = `
      <h1>Welcome</h1>
      <div class="${this.CLASS_NAMES.headerActions}">
        <button class="${this.CLASS_NAMES.menuToggle}" aria-label="Toggle Menu">
          <span class="material-icons">menu</span>
        </button>
      </div>
    `;

    const menuToggle = header.querySelector(`.${this.CLASS_NAMES.menuToggle}`);
    menuToggle?.addEventListener('click', () => this.sidebar.toggleActive());

    return header;
  }
}
