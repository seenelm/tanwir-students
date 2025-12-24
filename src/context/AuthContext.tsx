import React, { createContext, useContext, useState } from 'react';
import { AuthorizedUser } from '../types/auth';

interface AuthContextValue {
  user: AuthorizedUser | null;
  setUser: (user: AuthorizedUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthorizedUser | null>(null);

  const value = {
    user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
