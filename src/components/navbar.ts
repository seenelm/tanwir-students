// src/components/Navbar.ts
export function createNavbar(): HTMLElement {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  // Logo/Title
  const title = document.createElement('div');
  title.className = 'navbar-title';
  title.id = 'current-tab-title';
  title.textContent = 'Dashboard'; // Default tab
  
  // User info
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';
  
  const userName = document.createElement('span');
  userName.textContent = 'John Doe';
  
  const userAvatar = document.createElement('div');
  userAvatar.className = 'user-avatar';
  userAvatar.textContent = 'JD';
  
  userInfo.appendChild(userName);
  userInfo.appendChild(userAvatar);
  
  // Mobile menu toggle
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<span class="material-icons">menu</span>';
  menuToggle.style.display = 'none';
  menuToggle.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('active');
  });
  
  navbar.appendChild(menuToggle);
  navbar.appendChild(title);
  navbar.appendChild(userInfo);
  
  return navbar;
}

// Function to update the navbar title based on current tab
export function updateNavbarTitle(tabName: string): void {
  const titleElement = document.getElementById('current-tab-title');
  if (titleElement) {
    titleElement.textContent = tabName;
  }
}