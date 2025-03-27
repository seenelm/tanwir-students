import { Sidebar } from './Sidebar1';
import '../styles/main.css';

export class Header {
  private readonly CLASS_NAMES = {
    header: 'header',
    headerActions: 'header-actions',
    menuToggle: 'menu-toggle',
    headerTitle: 'header-title',
  };

  private currentPage: string;

  constructor(private sidebar: Sidebar, initialPage: string = 'Home') {
    this.currentPage = initialPage;
  }

  public setCurrentPage(page: string) {
    this.currentPage = page;
    const titleElement = document.querySelector(`.${this.CLASS_NAMES.headerTitle}`);
    if (titleElement) {
      titleElement.textContent = page;
    }
  }

  render(): HTMLElement {
    const header = document.createElement('header');
    header.className = this.CLASS_NAMES.header;
    
    header.innerHTML = `
      <h1 class="${this.CLASS_NAMES.headerTitle}">${this.currentPage}</h1>
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
