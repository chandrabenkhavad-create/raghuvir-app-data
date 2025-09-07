
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { verifyUser } from '@/services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'raghuvir_infra_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const { authenticated, username } = JSON.parse(storedAuth);
        setIsAuthenticated(authenticated);
        setUser(username);
      }
    } catch (error) {
        console.error("Could not read from session storage", error)
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    const isValid = await verifyUser(username, pass);
    if (isValid) {
      setIsAuthenticated(true);
      setUser(username);
      try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ authenticated: true, username }));
      } catch (error) {
        console.error("Could not write to session storage", error)
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error("Could not remove from session storage", error)
    }
  };
  
  if (loading) {
      return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
