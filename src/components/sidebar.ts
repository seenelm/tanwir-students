// src/components/Sidebar.ts
import { updateNavbarTitle } from './navbar';

interface MenuItem {
  text: string;
  icon: string;
  route: string;
}

export function createSidebar(): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  
  // Add logo container
  const logoContainer = document.createElement('div');
  logoContainer.className = 'sidebar-logo';
  
  // Create logo image
  const logoImg = document.createElement('img');
  logoImg.src = '/src/assets/tanwir-horizontal.webp';
  logoImg.alt = 'Tanwir';
  logoImg.className = 'tanwir-logo';
  
  // Append logo to container
  logoContainer.appendChild(logoImg);
  sidebar.appendChild(logoContainer);
  
  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: 'dashboard', route: '/' },
    { text: 'Assignments', icon: 'assignment', route: '/assignments' },
    { text: 'Quizzes & Tests', icon: 'quiz', route: '/quizzes' },
  ];
  
  const nav = document.createElement('ul');
  nav.className = 'sidebar-nav';
  
  menuItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    
    const a = document.createElement('a');
    a.href = item.route;
    a.className = 'sidebar-link';
    
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = item.icon;
    
    const text = document.createElement('span');
    text.textContent = item.text;
    
    a.appendChild(icon);
    a.appendChild(text);
    li.appendChild(a);
    nav.appendChild(li);
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update the navbar title with the current tab name
      updateNavbarTitle(item.text);
      
      // Update active tab styling
      document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
      });
      a.classList.add('active');
      
      navigateTo(item.route);
    });
  });
  
  sidebar.appendChild(nav);
  
  // Set default active tab
  const defaultLink = nav.querySelector('.sidebar-link');
  if (defaultLink) {
    defaultLink.classList.add('active');
  }
  
  return sidebar;
}

function navigateTo(route: string): void {
  // This will be replaced with actual router logic
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  
  mainContent.innerHTML = '';
  
  switch(route) {
    case '/':
      import('./dashboard').then(module => {
        module.renderDashboard(mainContent as HTMLElement);
      });
      break;
    case '/assignments':
      import('./assignments').then(module => {
        module.renderAssignments(mainContent as HTMLElement);
      });
      break;
    case '/quizzes':
      import('./quizzes').then(module => {
        module.renderQuizzes(mainContent as HTMLElement);
      });
      break;
    default:
      mainContent.textContent = 'Page not found';
  }
}