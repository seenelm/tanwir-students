import React from 'react';
import { Home } from './home/Home';
import { Courses } from './courses/Courses';
import { Assignments } from './assignments/Assignments';
import { Videos } from './videos/Videos';
import { CourseDetail } from './courses/CourseDetail';
import { AssignmentDetail } from './assignments/AssignmentDetail';
import { AttachmentViewer } from './courses/AttachmentViewer';
import { Scholarships } from './scholarships/Scholarships';
import { Students } from './admin/Students';
import QuizCreation from './admin/QuizCreation';
import { useAuth } from '../context/AuthContext';
import { usePage } from '../context/PageContext';

interface ContentProps {
  currentPage: string;
}

export const Content: React.FC<ContentProps> = ({ currentPage }) => {
  const { quizCourseId } = usePage();
  const { user } = useAuth();

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
      case 'assignmentdetail':
        return <AssignmentDetail />;
      case 'attachment':
        return <AttachmentViewer />;
      case 'createquiz':
        // Only allow admin users to access the quiz creation page
        if (user?.Role === 'admin') {
          return <QuizCreation courseId={quizCourseId || undefined} />;
        } else {
          return (
            <div className="unauthorized-container">
              <h2>Unauthorized Access</h2>
              <p>You do not have permission to view this page.</p>
            </div>
          );
        }
      case 'financial aid':
        // Only allow admin users to access the scholarships page
        if (user?.Role === 'admin') {
          return <Scholarships />;
        } else {
          return (
            <div className="unauthorized-container">
              <h2>Unauthorized Access</h2>
              <p>You do not have permission to view this page.</p>
            </div>
          );
        }
      case 'students':
        // Only allow admin users to access the students page
        if (user?.Role === 'admin') {
          return <Students />;
        } else {
          return (
            <div className="unauthorized-container">
              <h2>Unauthorized Access</h2>
              <p>You do not have permission to view this page.</p>
            </div>
          );
        }
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