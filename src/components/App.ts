import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Content } from './Content';
import { Login } from './Login';
import { AuthService } from '../services/auth';
import { User } from 'firebase/auth';
import '../style.css';

export class App {
  private readonly CLASS_NAMES = {
    layout: 'layout',
    mainContent: 'main-content',
  };

  private sidebar: Sidebar;
  private header: Header;
  private content: Content;
  private login: Login;
  private authService: AuthService;
  private container: HTMLElement;

  constructor() {
    this.sidebar = new Sidebar();
    this.header = new Header(this.sidebar);
    this.content = new Content();
    this.login = new Login();
    this.authService = AuthService.getInstance();
    this.container = document.createElement('div');

    // Set up page change handler
    this.sidebar.setOnPageChange((page) => this.header.setCurrentPage(page));

    // Listen for auth state changes
    this.authService.onAuthStateChanged((user) => this.handleAuthStateChange(user));
    
    // Listen for login event
    window.addEventListener('userLoggedIn', () => this.renderApp());
  }

  private handleAuthStateChange(user: User | null) {
    if (user) {
      this.renderApp();
    } else {
      this.renderLogin();
    }
  }

  private renderLogin() {
    this.container.innerHTML = '';
    this.container.appendChild(this.login.render());
  }

  private renderApp() {
    this.container.innerHTML = '';
    const layout = document.createElement('div');
    layout.className = this.CLASS_NAMES.layout;

    const main = document.createElement('main');
    main.className = this.CLASS_NAMES.mainContent;
    
    main.appendChild(this.header.render());
    main.appendChild(this.content.render());
    
    layout.appendChild(this.sidebar.render());
    layout.appendChild(main);

    this.container.appendChild(layout);
  }

  render(): HTMLElement {
    // Check if user is already logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.renderApp();
    } else {
      this.renderLogin();
    }

    return this.container;
  }
}
