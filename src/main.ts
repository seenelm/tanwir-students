import './style.css';
import { createNavbar } from './components/navbar';
import { createSidebar } from './components/sidebar';
import { renderDashboard } from './components/dashboard';

// Mock authentication for now
const isAuthenticated = true;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) {
    console.error('Could not find app container');
    return;
  }
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'container';
  
  // Create navigation
  const navbar = createNavbar();
  const sidebar = createSidebar();
  
  // Create main content area
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  
  // Append elements to DOM
  container.appendChild(navbar);
  container.appendChild(sidebar);
  container.appendChild(mainContent);
  app.appendChild(container);
  
  // Check authentication
  if (!isAuthenticated) {
    renderLoginPage(mainContent);
  } else {
    // Default to dashboard
    renderDashboard(mainContent);
  }
});

// Simple login page renderer (placeholder for future authentication)
function renderLoginPage(container: HTMLElement): void {
  container.innerHTML = '';
  
  const loginCard = document.createElement('div');
  loginCard.className = 'card login-card';
  
  const title = document.createElement('h1');
  title.textContent = 'Student Login';
  
  const form = document.createElement('form');
  
  const usernameGroup = document.createElement('div');
  usernameGroup.className = 'form-group';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.textContent = 'Username:';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.required = true;
  
  usernameGroup.appendChild(usernameLabel);
  usernameGroup.appendChild(usernameInput);
  
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.textContent = 'Password:';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.required = true;
  
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Login';
  
  form.appendChild(usernameGroup);
  form.appendChild(passwordGroup);
  form.appendChild(submitBtn);
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Mock login - in a real app, this would validate credentials
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      renderDashboard(mainContent as HTMLElement);
    }
  });
  
  loginCard.appendChild(title);
  loginCard.appendChild(form);
  container.appendChild(loginCard);
}
