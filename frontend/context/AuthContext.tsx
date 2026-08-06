'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;
      const storedToken = localStorage.getItem('expo_admin_token');

      if (!storedToken || storedToken === 'null' || storedToken === 'undefined') {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchApi<{ authenticated: boolean; user: User }>('/api/admin/me');
        if (data && data.authenticated) {
          setUser(data.user);
          setToken(storedToken);
          setIsAuthenticated(true);
          document.cookie = 'expo_admin_session=true; path=/; max-age=86400; SameSite=Lax';
        } else {
          localStorage.removeItem('expo_admin_token');
          document.cookie = 'expo_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      } catch {
        localStorage.removeItem('expo_admin_token');
        document.cookie = 'expo_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await fetchApi<{ success: boolean; token: string; user: User }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      if (data && data.token) {
        localStorage.setItem('expo_admin_token', data.token);
        document.cookie = 'expo_admin_session=true; path=/; max-age=86400; SameSite=Lax';
        setToken(data.token);
        setUser(data.user || { email, name: 'Masters Admin', role: 'SUPER_ADMIN' });
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed. Invalid server response.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('expo_admin_token');
      document.cookie = 'expo_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/admin/login';
  };


  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
