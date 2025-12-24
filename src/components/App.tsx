import React, { useState } from 'react';
import { Login } from './Login';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { Header } from './Header';
import { usePage } from '../context/PageContext';
import { useAuth } from '../context/AuthContext';

const AppReact: React.FC = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const { currentPage, setCurrentPage } = usePage();
  const { user: authUser } = useAuth();

  // Optional loading state
  if (!authUser) {
    return <Login />;
  }

  return (
    <div className={`layout ${sidebarActive ? 'sidebar-active' : ''}`}>
      <Sidebar
        currentPath={currentPage}
        setCurrentPage={setCurrentPage}
        setCurrentPath={setCurrentPage}
        isActive={sidebarActive}
        onClose={() => setSidebarActive(false)}
      />

      <div className="main-content">
        <Header
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarActive(!sidebarActive)}
        />
        <Content currentPage={currentPage} />
      </div>
    </div>
  );
};

export default AppReact;
