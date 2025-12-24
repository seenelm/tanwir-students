import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { UserRoleProvider } from './context/UserRoleContext';
import { AuthProvider } from './context/AuthContext';
import { PageProvider } from './context/PageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthListener } from './hooks/useAuthStateListener';
import './styles/main.css';

const queryClient = new QueryClient();

// Initialize auth listener once at app entry
initAuthListener(queryClient);

const root = ReactDOM.createRoot(document.getElementById('app')!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserRoleProvider>
          <PageProvider>
            <App />
          </PageProvider>
        </UserRoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);