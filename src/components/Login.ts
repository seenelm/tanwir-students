import { AuthService } from '../services/auth';
import '../styles/main.css';

export class Login {
  private readonly CLASS_NAMES = {
    login: 'login',
    button: 'login-button',
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

    const button = document.createElement('button');
    button.className = this.CLASS_NAMES.button;
    button.innerHTML = `
      <img src="https://www.google.com/favicon.ico" alt="Google" />
      Sign in with Google
    `;

    button.addEventListener('click', () => this.handleLogin(button));
    container.appendChild(button);

    return container;
  }
}
