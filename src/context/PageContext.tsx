// src/context/PageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PageContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  courseId: string | null;
  setCourseId: (id: string | null) => void;
  assignmentId: string | null;
  setAssignmentId: (id: string | null) => void;
  attachmentId: string | null;
  setAttachmentId: (id: string | null) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
  assignmentCourseId: string | null;
  setAssignmentCourseId: (id: string | null) => void;
  assignmentCourseName: string | null;
  setAssignmentCourseName: (name: string | null) => void;
  quizCourseId: string | null;
  setQuizCourseId: (id: string | null) => void;
  setPage: (page: string, params?: Record<string, string>) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 'Home',
  setCurrentPage: () => {},
  courseId: null,
  setCourseId: () => {},
  assignmentId: null,
  setAssignmentId: () => {},
  attachmentId: null,
  setAttachmentId: () => {},
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  assignmentCourseId: null,
  setAssignmentCourseId: () => {},
  assignmentCourseName: null,
  setAssignmentCourseName: () => {},
  quizCourseId: null,
  setQuizCourseId: () => {},
  setPage: () => {}
});

// Map URL paths to page names
const pathToPageMap: Record<string, string> = {
  '/home': 'Home',
  '/courses': 'Courses',
  '/videos': 'Videos',
  '/settings': 'Settings',
  '/scholarships': 'Financial Aid',
  '/students': 'Students'
};

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
      '/scholarships': 'Financial Aid',
      '/students': 'Students'
    };
    
    return pathToPage[path] || 'Home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [courseId, setCourseId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([getInitialPage()]);

  // Update URL when page changes
  useEffect(() => {
    const pageToPath: Record<string, string> = {
      'Home': '/',
      'Courses': '/courses',
      'Assignments': '/assignments',
      'Videos': '/videos',
      'Settings': '/settings',
      'Financial Aid': '/scholarships',
      'Students': '/students'
    };
    
    const path = pageToPath[currentPage] || '/';
    
    // Update URL without full page reload
    window.history.pushState(null, '', path);
  }, [currentPage]);
  const [assignmentCourseId, setAssignmentCourseId] = useState<string | null>(null);
  const [assignmentCourseName, setAssignmentCourseName] = useState<string | null>(null);
  const [quizCourseId, setQuizCourseId] = useState<string | null>(null);
  
  // Initialize from current URL on first load
  useEffect(() => {
    const path = window.location.pathname;
    const pageName = pathToPageMap[path] || 'Home';
    setCurrentPage(pageName);
    setBreadcrumbs([pageName]);
  }, []);
  
  // Listen for browser back/forward button events
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const pageName = pathToPageMap[path] || 'Home';
      
      // Update state based on URL
      setCurrentPage(pageName);
      setBreadcrumbs([pageName]);
      
      // Reset other state when navigating to main pages
      if (['Home', 'Courses', 'Videos', 'Settings'].includes(pageName)) {
        // Clear courseId when not in course detail
        if (pageName !== 'CourseDetail') {
          setCourseId(null);
        }
        
        // Clear assignment data when not in assignment detail
        if (pageName !== 'AssignmentDetail') {
          setAssignmentId(null);
          setAssignmentCourseId(null);
          setAssignmentCourseName(null);
        }
        
        // Clear attachment data when not in attachment viewer
        if (pageName !== 'attachment') {
          setAttachmentId(null);
        }
        
        // Clear quiz data when not in quiz creation
        if (pageName !== 'CreateQuiz') {
          setQuizCourseId(null);
        }
      }
    };

    // Add event listener for popstate (browser back/forward)
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    
    // Reset breadcrumbs when navigating to a main page
    if (['Home', 'Courses', 'Videos', 'Settings', 'Financial Aid', 'Students'].includes(page)) {
      setBreadcrumbs([page]);
      
      // Clear courseId when not in course detail
      if (page !== 'CourseDetail') {
        setCourseId(null);
      }
      
      // Clear assignment data when not in assignment detail
      if (page !== 'AssignmentDetail') {
        setAssignmentId(null);
        setAssignmentCourseId(null);
        setAssignmentCourseName(null);
      }
      
      // Clear attachment data when not in attachment viewer
      if (page !== 'attachment') {
        setAttachmentId(null);
      }
      
      // Clear quiz data when not in quiz creation
      if (page !== 'CreateQuiz') {
        setQuizCourseId(null);
      }
    }
  };

  // Helper function to set page and related parameters in one call
  const setPage = (page: string, params?: Record<string, string>) => {
    setCurrentPage(page);
    
    if (params) {
      // Set courseId if provided
      if (params.courseId) {
        setCourseId(params.courseId);
      }
      
      // Set assignmentId if provided
      if (params.assignmentId) {
        setAssignmentId(params.assignmentId);
      }
      
      // Set attachmentId if provided
      if (params.attachmentId) {
        setAttachmentId(params.attachmentId);
      }
      
      // Set other parameters as needed
      if (params.assignmentCourseId) {
        setAssignmentCourseId(params.assignmentCourseId);
      }
      
      if (params.assignmentCourseName) {
        setAssignmentCourseName(params.assignmentCourseName);
      }
      
      if (params.quizCourseId) {
        setQuizCourseId(params.quizCourseId);
      }
    }
    
    // Update breadcrumbs based on the page
    if (page === 'course') {
      setBreadcrumbs(['Courses', 'Course Detail']);
    } else if (page === 'assignmentDetail') {
      setBreadcrumbs(['Courses', 'Course Detail', 'Assignment']);
    } else if (page === 'attachment') {
      setBreadcrumbs(['Courses', 'Course Detail', 'Attachment']);
    } else if (['Home', 'Courses', 'Videos', 'Settings', 'Financial Aid', 'Students'].includes(page)) {
      setBreadcrumbs([page]);
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
        attachmentId,
        setAttachmentId,
        breadcrumbs,
        setBreadcrumbs,
        assignmentCourseId,
        setAssignmentCourseId,
        assignmentCourseName,
        setAssignmentCourseName,
        quizCourseId,
        setQuizCourseId,
        setPage
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);