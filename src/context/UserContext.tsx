import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, AuthorizedUser } from '../services/auth';

interface UserContextType {
  userData: AuthorizedUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<AuthorizedUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const authService = AuthService.getInstance();
      const user = authService.getCurrentUser();
      if (user) {
        const data = await authService.getUserData(user.uid);
        setUserData(data);
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
