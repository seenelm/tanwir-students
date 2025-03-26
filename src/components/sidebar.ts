import '../style.css';

export class Sidebar {
  private isActive: boolean = false;
  private readonly CLASS_NAMES = {
    sidebar: 'sidebar',
    active: 'active',
  };

  constructor() {
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  private handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      window.innerWidth <= 768 &&
      !target.closest(`.${this.CLASS_NAMES.sidebar}`) &&
      !target.closest('.menu-toggle') &&
      this.isActive
    ) {
      this.toggleActive();
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
    const sidebar = document.querySelector(`.${this.CLASS_NAMES.sidebar}`);
    sidebar?.classList.toggle(this.CLASS_NAMES.active);
  }

  render(): HTMLElement {
    const sidebar = document.createElement('aside');
    sidebar.className = this.CLASS_NAMES.sidebar;
    
    sidebar.innerHTML = `
      <nav>
        <ul>
          <li><a href="#"><span class="material-icons">home</span> Home</a></li>
          <li><a href="#"><span class="material-icons">person</span> Profile</a></li>
          <li><a href="#"><span class="material-icons">dashboard</span> Dashboard</a></li>
          <li><a href="#"><span class="material-icons">settings</span> Settings</a></li>
        </ul>
      </nav>
    `;

    document.addEventListener('click', this.handleOutsideClick);
    return sidebar;
  }
}
