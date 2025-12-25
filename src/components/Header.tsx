import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const breadcrumbs = useBreadcrumbs();

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <header className="header">
      <div className="header-content">
        <nav className="breadcrumbs">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <span key={index}>
                  {index > 0 && <span className="breadcrumb-separator"> / </span>}
                  {isLast ? (
                    <span className="breadcrumb">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.to} className="breadcrumb breadcrumb-clickable">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })
          ) : (
            <span className="breadcrumb">Home</span>
          )}
        </nav>
      </div>

      <div className="header-right">
        <button
          className="menu-toggle"
          aria-label="Toggle Menu"
          onClick={onToggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>

        {user && (
          <div className="user-profile">
            <div className="user-initials">
              {getInitials(
                user.displayName ||
                  `${user.FirstName ?? ''} ${user.LastName ?? ''}`.trim() ||
                  user.email ||
                  '?'
              )}
            </div>
            <span className="user-name">
              {user.displayName ||
                `${user.FirstName ?? ''} ${user.LastName ?? ''}`.trim() ||
                user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
