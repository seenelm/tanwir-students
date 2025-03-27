import { AuthService } from '../services/auth';
import '../styles/main.css';

export class Login {
  private readonly CLASS_NAMES = {
    login: 'login',
    loginContainer: 'login-container',
    button: 'login-button',
    logo: 'login-logo',
    title: 'login-title'
  };

  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  private async handleLogin(button: HTMLButtonElement) {
    try {
      button.disabled = true;
      const user = await this.authService.signInWithGoogle();
      if (user) {
        // Dispatch a custom event that App can listen to
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'login-error';
      errorMessage.textContent = 'Failed to sign in. Please try again.';
      button.parentElement?.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    } finally {
      button.disabled = false;
    }
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = this.CLASS_NAMES.login;

    const loginContainer = document.createElement('div');
    loginContainer.className = this.CLASS_NAMES.loginContainer;

    // Add logo
    const logo = document.createElement('img');
    logo.src = '/logo.webp';
    logo.alt = 'Tanwir Logo';
    logo.className = this.CLASS_NAMES.logo;
    loginContainer.appendChild(logo);

    // Add title
    const title = document.createElement('h1');
    title.className = this.CLASS_NAMES.title;
    title.textContent = 'Tanwir Portal';
    loginContainer.appendChild(title);

    const button = document.createElement('button');
    button.className = this.CLASS_NAMES.button;
    button.innerHTML = `
      <img src="https://www.google.com/favicon.ico" alt="Google" />
      <span>Sign in with Google</span>
    `;

    button.addEventListener('click', () => this.handleLogin(button));
    loginContainer.appendChild(button);
    container.appendChild(loginContainer);

    return container;
  }
}
