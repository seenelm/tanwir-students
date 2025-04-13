// src/context/PageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  courseId: string | null;
  setCourseId: (id: string | null) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 'Home',
  setCurrentPage: () => {},
  courseId: null,
  setCourseId: () => {},
  breadcrumbs: [],
  setBreadcrumbs: () => {}
});

export const PageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('Home');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Home']);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    
    // Reset breadcrumbs when navigating to a main page
    if (['Home', 'Courses', 'Assignments', 'Videos', 'Settings'].includes(page)) {
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
        breadcrumbs,
        setBreadcrumbs
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);