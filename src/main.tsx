import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // Use the React version
import { UserRoleProvider } from './context/UserRoleContext';
import { AuthProvider } from './context/AuthContext';
import { PageProvider } from './context/PageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/main.css';

const queryClient = new QueryClient();
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