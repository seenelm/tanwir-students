import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, AuthService } from '../services/auth';

interface UserRoleContextType {
  role: UserRole | null;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  loading: true
});

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authService = AuthService.getInstance();
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        const role = await authService.getUserRole();
        setRole(role);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => useContext(UserRoleContext);
