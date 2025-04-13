// src/context/PageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 'Home',
  setCurrentPage: () => {}
});

export const PageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('Home');

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);