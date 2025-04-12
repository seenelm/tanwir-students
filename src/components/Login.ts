import { AuthService } from '../services/auth';
import '../styles/main.css';

export class Login {
  private readonly CLASS_NAMES = {
    login: 'login',
    loginContainer: 'login-container',
    button: 'login-button',
    logo: 'login-logo',
    title: 'login-title',
    leftPanel: 'login-left-panel',
    rightPanel: 'login-right-panel',
    greeting: 'login-greeting',
    quote: 'login-quote'
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

    // Create left panel (green side with greeting and quote)
    const leftPanel = document.createElement('div');
    leftPanel.className = this.CLASS_NAMES.leftPanel;
    
    // Add greeting
    const greeting = document.createElement('h2');
    greeting.className = this.CLASS_NAMES.greeting;
    greeting.textContent = "Asalamu' Alaykum!";
    leftPanel.appendChild(greeting);
    
    // Add quote
    const quote = document.createElement('p');
    quote.className = this.CLASS_NAMES.quote;
    quote.innerHTML = 'The prophet ﷺ stated that "Seeking knowledge is an obligation upon every muslim" <br><span class="quote-source">(Sunan Ibn Majah 224)</span>';
    leftPanel.appendChild(quote);
    
    // Create right panel (login side)
    const rightPanel = document.createElement('div');
    rightPanel.className = this.CLASS_NAMES.rightPanel;
    
    // Add logo
    const logo = document.createElement('img');
    logo.src = '/logo.webp';
    logo.alt = 'Tanwir Logo';
    logo.className = this.CLASS_NAMES.logo;
    rightPanel.appendChild(logo);

    const button = document.createElement('button');
    button.className = this.CLASS_NAMES.button;
    button.innerHTML = `
      <img src="https://www.google.com/favicon.ico" alt="Google" />
      <span>Sign in with Google</span>
    `;

    button.addEventListener('click', () => this.handleLogin(button));
    rightPanel.appendChild(button);
    
    // Add both panels to the container
    loginContainer.appendChild(leftPanel);
    loginContainer.appendChild(rightPanel);
    container.appendChild(loginContainer);

    return container;
  }
}
