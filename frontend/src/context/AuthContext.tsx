import React, { createContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data whenever token changes or on initial mount
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (isMounted) setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch user with token:', error);
          if (isMounted) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (isMounted) setUser(null);
      }
      if (isMounted) setLoading(false);
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching user after login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { AuthContextType };
