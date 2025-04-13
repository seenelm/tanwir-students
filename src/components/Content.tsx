import React from 'react';
import '../styles/main.css';
import { Home } from './Home';
import { Courses } from './Courses';
import { Assignments } from './Assignments';
import { Videos } from './Videos';

interface ContentProps {
    currentPage: string;
  }
  
  export const Content: React.FC<ContentProps> = ({ currentPage }) => {
    const renderContent = () => {
      switch (currentPage.toLowerCase()) {
        case 'courses':
          return <Courses />;
        case 'home':
          return <Home />;
        case 'assignments':
          return <Assignments />;
        case 'videos':
          return <Videos />;
        case 'settings':
          return (
            <div>
              <h2>Settings</h2>
              <p>Settings panel will be available here.</p>
            </div>
          );
        default:
          return (
            <div>
              <h2>Page Not Found</h2>
              <p>We couldn't find the page you're looking for.</p>
            </div>
          );
      }
    };
  
    return <div className="content">{renderContent()}</div>;
  };
  