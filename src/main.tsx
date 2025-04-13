import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // Use the React version
import { UserRoleProvider } from './context/UserRoleContext';
import { PageProvider } from './context/PageContext';
import './styles/main.css';

const root = ReactDOM.createRoot(document.getElementById('app')!);

root.render(
  <React.StrictMode>
    <UserRoleProvider>
      <PageProvider>
        <App />
      </PageProvider>
    </UserRoleProvider>
  </React.StrictMode>
);