import React, { createContext, useContext } from 'react';
import { useAuthUser } from '../queries/authQueries';
import { AuthorizedUser } from '../types/auth';

interface AuthContextValue {
  user: AuthorizedUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user = null, isLoading } = useAuthUser();

  const value = {
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
