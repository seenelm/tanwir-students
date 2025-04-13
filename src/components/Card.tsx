import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  description, 
  footer, 
  children,
  onClick 
}) => {
  return (
    <div 
      className={`card ${onClick ? 'card-clickable' : ''}`} 
      onClick={onClick}
    >
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