
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { verifyUser } from '@/services/userService';
import type { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Omit<User, 'password'> | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'raghuvir_infra_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const { authenticated, userData } = JSON.parse(storedAuth);
        setIsAuthenticated(authenticated);
        setUser(userData);
      }
    } catch (error) {
        console.error("Could not read from session storage", error)
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    const validUser = await verifyUser(username, pass);
    if (validUser) {
      setIsAuthenticated(true);
      setUser(validUser);
      try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ authenticated: true, userData: validUser }));
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
