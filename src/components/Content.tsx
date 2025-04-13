import React from 'react';
import { Home } from './home/Home';
import { Courses } from './courses/Courses';
import { Assignments } from './assignments/Assignments';
import { Videos } from './videos/Videos';
import { CourseDetail } from './courses/CourseDetail';

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
      case 'coursedetail':
        return <CourseDetail />;
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