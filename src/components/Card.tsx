import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string | React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  imageUrl?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  description, 
  footer, 
  children,
  onClick,
  imageUrl,
  icon
}) => {
  return (
    <div 
      className={`card ${onClick ? 'card-clickable' : ''}`} 
      onClick={onClick}
    >
      {imageUrl && (
        <div className="card-image">
          <img src={imageUrl} alt={title} />
        </div>
      )}
      <div className="card-header">
        {icon && <div className="card-icon">{icon}</div>}
        <div className="card-title-container">
          <h3>{title}</h3>
          {subtitle && <h5 className="card-subtitle">{subtitle}</h5>}
        </div>
      </div>
      {description && <div className="card-description">{description}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};