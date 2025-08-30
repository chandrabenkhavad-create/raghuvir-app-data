
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'raghuvir_infra_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        setIsAuthenticated(JSON.parse(storedAuth));
      }
    } catch (error) {
        console.error("Could not read from local storage", error)
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (user: string, pass: string): boolean => {
    // In a real application, you'd have more robust authentication
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(true));
      } catch (error) {
        console.error("Could not write to local storage", error)
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error("Could not remove from local storage", error)
    }
  };
  
  // Prevent rendering children until we have checked auth status
  if (loading) {
      return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
