import React, { useEffect, useState } from 'react';
import { usePage } from '../context/PageContext';
import { AuthService } from '../services/auth';

interface HeaderProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar }) => {
  const { breadcrumbs, setCurrentPage } = usePage();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const authService = AuthService.getInstance();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };
  
  const handleBreadcrumbClick = (index: number) => {
    // If clicking on the first breadcrumb (e.g., "Courses")
    if (index === 0) {
      setCurrentPage(breadcrumbs[0]);
    }
  };
  
  return (
    <header className="header">
      <div className="header-content">
        {breadcrumbs.length > 1 ? (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="breadcrumb-separator"> / </span>}
                <span 
                  className={`breadcrumb ${index === 0 ? 'breadcrumb-clickable' : ''}`}
                  onClick={() => index === 0 && handleBreadcrumbClick(index)}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h1 className="header-title">{currentPage}</h1>
        )}
      </div>
      <div className="header-right">
        <button className="menu-toggle" aria-label="Toggle Menu" onClick={onToggleSidebar}>
          <span className="material-icons">menu</span>
        </button>
        {user && (
          <div className="user-profile">
            <div className="user-initials">
              {user.displayName ? getInitials(user.displayName) : '?'}
            </div>
            <span className="user-name">{user.displayName || 'User'}</span>
          </div>
        )}
      </div>
    </header>
  );
};