import '../styles/main.css';
import { AuthService } from '../services/auth';

type Route = {
  path: string;
  title: string;
  icon: string;
};

export class Sidebar {
  private isActive: boolean = false;
  private readonly CLASS_NAMES = {
    sidebar: 'sidebar',
    active: 'active',
    signout: 'signout-button'
  };
  private onPageChange?: (page: string) => void;
  private authService: AuthService;

  private readonly routes: Route[] = [
    { path: '/home', title: 'Home', icon: 'home' },
    { path: '/profile', title: 'Profile', icon: 'person' },
    { path: '/courses', title: 'Courses', icon: 'school' },
    { path: '/settings', title: 'Settings', icon: 'settings' },
  ];

  constructor() {
    this.authService = AuthService.getInstance();
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    // Set initial route
    const path = window.location.pathname;
    const route = this.routes.find(r => r.path === path) || this.routes[0];
    this.navigateToRoute(route);
  }

  setOnPageChange(callback: (page: string) => void) {
    this.onPageChange = callback;
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

  private navigateToRoute(route: Route) {
    history.pushState(null, '', route.path);
    this.onPageChange?.(route.title);
  }

  private handleNavClick(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      const path = link.getAttribute('href') || '/home';
      const route = this.routes.find(r => r.path === path);
      if (route) {
        this.navigateToRoute(route);
        if (window.innerWidth <= 768) {
          this.toggleActive();
        }
      }
    }
  }

  private async handleSignOut() {
    try {
      await this.authService.signOut();
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    } catch (error) {
      console.error('Error signing out:', error);
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
    
    const currentPath = window.location.pathname;
    
    sidebar.innerHTML = `
      <nav>
        <ul>
          ${this.routes.map(route => `
            <li>
              <a href="${route.path}" class="${currentPath === route.path ? 'active' : ''}">
                <span class="material-icons">${route.icon}</span> ${route.title}
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
      <div class="${this.CLASS_NAMES.signout}">
        <button>
          <span class="material-icons">logout</span>
          Sign Out
        </button>
      </div>
    `;

    const nav = sidebar.querySelector('nav');
    nav?.addEventListener('click', (e) => this.handleNavClick(e));

    const signOutButton = sidebar.querySelector(`.${this.CLASS_NAMES.signout} button`);
    signOutButton?.addEventListener('click', () => this.handleSignOut());

    document.addEventListener('click', this.handleOutsideClick);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      const route = this.routes.find(r => r.path === path) || this.routes[0];
      this.onPageChange?.(route.title);
    });

    return sidebar;
  }
}
