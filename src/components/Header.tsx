import React from 'react';
import { usePage } from '../context/PageContext';

interface HeaderProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar }) => {
  const { breadcrumbs, setCurrentPage } = usePage();
  
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
      <div className="header-actions">
        <button className="menu-toggle" aria-label="Toggle Menu" onClick={onToggleSidebar}>
          <span className="material-icons">menu</span>
        </button>
      </div>
    </header>
  );
};