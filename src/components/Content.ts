import '../styles/main.css';
import { Courses } from './Courses';

export class Content {
  private readonly CLASS_NAMES = {
    content: 'content',
  };
  private currentPath: string = window.location.pathname;

  constructor() {
    // Listen for custom navigation events
    window.addEventListener('navigationEvent', ((e: CustomEvent) => {
      this.currentPath = e.detail.path;
      this.updateContent();
    }) as EventListener);
  }

  private updateContent(): void {
    const content = this.render();
    const existingContent = document.querySelector(`.${this.CLASS_NAMES.content}`);
    if (existingContent && existingContent.parentNode) {
      existingContent.parentNode.replaceChild(content, existingContent);
    }
  }

  private renderContent(): HTMLElement {
    switch (this.currentPath) {
      case '/courses':
        const courses = new Courses();
        return courses.render();
      case '/home':
        const home = document.createElement('div');
        home.innerHTML = '<h2>Home</h2><p>Welcome to Tanwir!</p>';
        return home;
      case '/profile':
        const profile = document.createElement('div');
        profile.innerHTML = '<h2>Profile</h2><p>Your profile information will appear here.</p>';
        return profile;
      case '/settings':
        const settings = document.createElement('div');
        settings.innerHTML = '<h2>Settings</h2><p>Settings panel will be available here.</p>';
        return settings;
      default:
        const defaultContent = document.createElement('div');
        defaultContent.innerHTML = '<h2>Home</h2><p>Welcome to Tanwir!</p>';
        return defaultContent;
    }
  }

  render(): HTMLElement {
    const content = this.renderContent();
    content.className = this.CLASS_NAMES.content;
    return content;
  }
}
