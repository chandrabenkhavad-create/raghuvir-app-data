
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { verifyUser, updateUserSettings } from '@/services/userService';
import type { User, AppSettings, PrintSettings } from '@/types';

type UserSettings = AppSettings & PrintSettings;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserSettingsInContext: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'raghuvir_infra_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const userData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
        console.error("Could not read from session storage", error)
    } finally {
        setLoading(false);
    }
  }, []);
  
  const updateUserSettingsInContext = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    const updatedUser = { ...user, settings: { ...user.settings, ...newSettings } };
    setUser(updatedUser);
    
    try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
        // Persist to DB, but don't block UI for it
        await updateUserSettings(user.id, updatedUser.settings as UserSettings);
    } catch (error) {
        console.error("Could not save settings", error);
        // Potentially show a toast to the user
    }
  }, [user]);


  const login = async (username: string, pass: string): Promise<boolean> => {
    const validUser = await verifyUser(username, pass);
    if (validUser) {
      setIsAuthenticated(true);
      setUser(validUser);
      try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(validUser));
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserSettingsInContext }}>
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
