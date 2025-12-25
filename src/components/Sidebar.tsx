import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useSignOut } from '../queries/authQueries';
import '../styles/main.css';

type Route = {
  path: string;
  title: string;
  icon: string;
  adminOnly?: boolean;
};

const routes: Route[] = [
  { path: '/', title: 'Home', icon: 'home' },
  // Temporarily hidden tabs
  // { path: '/assignments', title: 'Assignments', icon: 'assignment' },
  { path: '/courses', title: 'Courses', icon: 'school' },
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
  currentPath: string; // Still needed for backward compatibility
  onClose?: () => void;
  isActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  isActive = false,
}) => {
  const { user } = useAuth();
  const { mutate: signOut } = useSignOut();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async () => {
    signOut();
  };

  const navigateTo = (path: string) => {
    navigate(path);
    onClose?.();
  };

  // Filter routes based on user role
  const filteredRoutes = routes.filter(route => {
    if (route.adminOnly) {
      return user?.Role === 'admin';
    }
    return true;
  });

  // Check if route is active
  const isRouteActive = (routePath: string) => {
    if (routePath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(routePath);
  };

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
                className={isRouteActive(route.path) ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(route.path);
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
