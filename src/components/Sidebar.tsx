import React, { useEffect, useState } from 'react';
import { AuthService, UserRole } from '../services/auth';
import '../styles/main.css';

type Route = {
  path: string;
  title: string;
  icon: string;
  adminOnly?: boolean;
};

const routes: Route[] = [
  { path: '/home', title: 'Home', icon: 'home' },
  // Temporarily hidden tabs
  // { path: '/assignments', title: 'Assignments', icon: 'assignment' },
  // { path: '/courses', title: 'Courses', icon: 'school' },
  // { path: '/videos', title: 'Videos', icon: 'play_circle' },
  // { path: '/settings', title: 'Settings', icon: 'settings' },
  { path: '/scholarships', title: 'Financial Aid', icon: 'school', adminOnly: true },
  { path: '/students', title: 'Students', icon: 'people', adminOnly: true },
];

const CLASS_NAMES = {
  sidebar: 'sidebar',
  signout: 'signout-button',
  logo: 'sidebar-logo',
  logoContainer: 'logo-container',
};

interface SidebarProps {
  currentPath: string;
  setCurrentPage: (title: string) => void;
  setCurrentPath: (path: string) => void;
  onClose?: () => void;
  isActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  setCurrentPage,
  setCurrentPath,
  onClose,
  isActive = false,
}) => {
  const authService = AuthService.getInstance();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await authService.getUserRole();
      setUserRole(role);
    };

    fetchUserRole();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateTo = (path: string, title: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setCurrentPage(title);
    onClose?.(); // optional collapse for mobile
  };

  // Filter routes based on user role
  const filteredRoutes = routes.filter(route => {
    if (route.adminOnly) {
      return userRole === 'admin';
    }
    return true;
  });

  return (
    <div className={`${CLASS_NAMES.sidebar} ${isActive ? 'active' : ''}`}>
      <div className={CLASS_NAMES.logoContainer}>
        <img src="/logo.webp" alt="Tanwir Logo" className={CLASS_NAMES.logo} />
        <span>Tanwir Institute</span>
      </div>

      <nav>
        <ul>
          {filteredRoutes.map(route => (
            <li key={route.path}>
              <a
                href={route.path}
                className={currentPath === route.path ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(route.path, route.title);
                }}
              >
                <span className="material-icons">{route.icon}</span> {route.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={CLASS_NAMES.signout}>
        <button onClick={handleSignOut}>
          <span className="material-icons">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};
