import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router';
import { Login } from './Login';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';

const AppReact: React.FC = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const { user: authUser } = useAuth();
  const location = useLocation();

  // Optional loading state
  if (!authUser) {
    return <Login />;
  }

  // Derive current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/courses/')) return 'CourseDetail';
    if (path === '/courses') return 'Courses';
    if (path.startsWith('/assignments/')) return 'AssignmentDetail';
    if (path === '/assignments') return 'Assignments';
    if (path === '/videos') return 'Videos';
    if (path === '/scholarships') return 'Financial Aid';
    if (path === '/students') return 'Students';
    return 'Home';
  };

  const currentPage = getCurrentPage();

  return (
    <div className={`layout ${sidebarActive ? 'sidebar-active' : ''}`}>
      <Sidebar
        currentPath={currentPage}
        isActive={sidebarActive}
        onClose={() => setSidebarActive(false)}
      />

      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarActive(!sidebarActive)} />
        <Outlet />
      </div>
    </div>
  );
};

export default AppReact;
