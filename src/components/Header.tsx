import React, { useEffect, useState } from 'react';
import { usePage } from '../context/PageContext';
import { AuthService } from '../services/auth';
import { CourseService } from '../services/courses/service/CourseService';

interface HeaderProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar }) => {
  const { 
    breadcrumbs, 
    setCurrentPage, 
    setCourseId,
    setBreadcrumbs,
    quizCourseId
  } = usePage();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const authService = AuthService.getInstance();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);
  
  useEffect(() => {
    // If we're on the CreateQuiz page, fetch the course name for breadcrumbs
    if (currentPage === 'CreateQuiz' && quizCourseId) {
      const courseService = CourseService.getInstance();
      courseService.getCourseById(quizCourseId)
        .then(course => {
          if (course && course.Name) {
            // Update breadcrumbs for quiz creation
            setBreadcrumbs(['Courses', course.Name, 'Create Quiz']);
          }
        })
        .catch(error => {
          console.error('Error fetching course for quiz creation:', error);
        });
    }
  }, [currentPage, quizCourseId, setBreadcrumbs]);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };
  
  const handleBreadcrumbClick = (index: number, crumb: string) => {
    // If clicking on the first breadcrumb (e.g., "Courses")
    if (index === 0) {
      setCurrentPage(breadcrumbs[0]);
    }
    // If clicking on the course name (middle breadcrumb in assignment detail or quiz creation)
    else if (index === 1 && breadcrumbs.length > 2) {
      // Get the course ID from the assignment or quiz
      const courseService = CourseService.getInstance();
      courseService.getCourseByName(crumb)
        .then(course => {
          if (course) {
            setCourseId(course.Id);
            setCurrentPage('CourseDetail');
            // Update breadcrumbs to remove the assignment or quiz creation
            setBreadcrumbs(['Courses', crumb]);
          }
        })
        .catch(error => {
          console.error('Error finding course by name:', error);
        });
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {breadcrumbs.length > 1 ? (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => {
              // Determine if this breadcrumb should be clickable
              const isLastBreadcrumb = index === breadcrumbs.length - 1;
              const isCourseBreadcrumb = index === 1 && breadcrumbs.length > 2;
              
              // First breadcrumb is always clickable unless it's the current page
              // Course breadcrumb is clickable when viewing an assignment or creating a quiz
              const isClickable = 
                (index === 0 && !isLastBreadcrumb) || 
                (isCourseBreadcrumb && (currentPage === 'AssignmentDetail' || currentPage === 'CreateQuiz'));
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && <span className="breadcrumb-separator"> / </span>}
                  <span 
                    className={`breadcrumb ${isClickable ? 'breadcrumb-clickable' : ''}`}
                    onClick={() => isClickable && handleBreadcrumbClick(index, crumb)}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              );
            })}
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