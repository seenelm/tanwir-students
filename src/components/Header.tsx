import React from 'react';
import '../styles/main.css';

interface HeaderProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar }) => {
  return (
    <header className="header">
      <h1 className="header-title">{currentPage}</h1>
      <div className="header-actions">
        <button className="menu-toggle" aria-label="Toggle Menu" onClick={onToggleSidebar}>
          <span className="material-icons">menu</span>
        </button>
      </div>
    </header>
  );
};
