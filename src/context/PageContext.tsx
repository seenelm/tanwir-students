// src/context/PageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PageContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  courseId: string | null;
  setCourseId: (id: string | null) => void;
  assignmentId: string | null;
  setAssignmentId: (id: string | null) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 'Home',
  setCurrentPage: () => {},
  courseId: null,
  setCourseId: () => {},
  assignmentId: null,
  setAssignmentId: () => {},
  breadcrumbs: [],
  setBreadcrumbs: () => {}
});

export const PageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Initialize based on URL path
  const getInitialPage = () => {
    const path = window.location.pathname;
    
    // Map URL paths to page names
    const pathToPage: Record<string, string> = {
      '/': 'Home',
      '/courses': 'Courses',
      '/assignments': 'Assignments',
      '/videos': 'Videos',
      '/settings': 'Settings',
      '/scholarships': 'Scholarships',
      '/students': 'Students'
    };
    
    return pathToPage[path] || 'Home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [courseId, setCourseId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([getInitialPage()]);

  // Update URL when page changes
  useEffect(() => {
    const pageToPath: Record<string, string> = {
      'Home': '/',
      'Courses': '/courses',
      'Assignments': '/assignments',
      'Videos': '/videos',
      'Settings': '/settings',
      'Scholarships': '/scholarships',
      'Students': '/students'
    };
    
    const path = pageToPath[currentPage] || '/';
    
    // Update URL without full page reload
    window.history.pushState(null, '', path);
  }, [currentPage]);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    
    // Reset breadcrumbs when navigating to a main page
    if (['Home', 'Courses', 'Assignments', 'Videos', 'Settings', 'Scholarships', 'Students'].includes(page)) {
      setBreadcrumbs([page]);
      // Clear courseId when not in course detail
      if (page !== 'CourseDetail') {
        setCourseId(null);
      }
    }
  };

  return (
    <PageContext.Provider 
      value={{ 
        currentPage, 
        setCurrentPage: handleSetCurrentPage, 
        courseId, 
        setCourseId, 
        assignmentId, 
        setAssignmentId,
        breadcrumbs,
        setBreadcrumbs
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);