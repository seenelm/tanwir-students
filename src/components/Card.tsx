import React from 'react';
import '../styles/card.css';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, description, footer, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        {subtitle && <h5 className="card-subtitle">{subtitle}</h5>}
      </div>
      {description && <p className="card-description">{description}</p>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
