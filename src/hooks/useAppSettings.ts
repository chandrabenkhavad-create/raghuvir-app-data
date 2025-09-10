
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

export interface AppSettings {
  userCanViewDashboard: boolean;
  userCanViewReports: boolean;
  userCanViewSettings: boolean;
  userCanEditEntries: boolean;
  userCanViewMileage: boolean;
}

const defaultSettings: AppSettings = {
  userCanViewDashboard: true,
  userCanViewReports: true,
  userCanViewSettings: true,
  userCanEditEntries: true,
  userCanViewMileage: true,
};

export const useAppSettings = () => {
  const { user, updateUserSettingsInContext } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      const userSettings = user.settings || {};
      setSettings({ ...defaultSettings, ...userSettings });
      setIsLoaded(true);
    } else if (user === null) {
      // Handle logged out state
      setIsLoaded(true);
      setSettings(defaultSettings);
    }
    // if user is undefined, we are still loading, so do nothing.
  }, [user]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    updateUserSettingsInContext(updated);
  }, [settings, updateUserSettingsInContext]);
  
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    updateUserSettingsInContext(defaultSettings);
  }, [updateUserSettingsInContext]);

  return { settings, updateSettings, isLoaded, resetSettings };
};
