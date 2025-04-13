import React, { useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
// import { useUserRole } from '../context/UserRoleContext';
import { Login } from './Login';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { Header } from './Header';
import { usePage } from '../context/PageContext';

const AppReact: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);
  const { currentPage, setCurrentPage } = usePage();
  // const { role } = useUserRole();
  
  useEffect(() => {
    const authService = AuthService.getInstance();
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    
    return unsubscribe;
  }, []);
  
  if (!isAuthenticated) {
    return (
      <Login />
    );
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
        <Header currentPage={currentPage} onToggleSidebar={() => setSidebarActive(!sidebarActive)} />
        <Content currentPage={currentPage} />
      </div>
    </div>
  );
};

export default AppReact;