
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  userCanViewDashboard: boolean;
  userCanViewReports: boolean;
  userCanViewSettings: boolean;
  userCanEditEntries: boolean;
}

const SETTINGS_KEY = 'raghuvir_infra_app_settings';

const defaultSettings: AppSettings = {
  userCanViewDashboard: true,
  userCanViewReports: true,
  userCanViewSettings: true,
  userCanEditEntries: true,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(prev => ({ ...defaultSettings, ...JSON.parse(storedSettings) }));
      }
    } catch (error) {
      console.error("Could not read app settings from localStorage", error);
      setSettings(defaultSettings);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
         console.error("Could not save app settings to localStorage", error);
      }
      return updated;
    });
  }, []);
  
  const resetSettings = useCallback(() => {
    try {
        localStorage.removeItem(SETTINGS_KEY);
        setSettings(defaultSettings);
    } catch (error) {
        console.error("Could not remove app settings from localStorage", error);
    }
  }, []);

  return { settings, updateSettings, isLoaded, resetSettings };
};
