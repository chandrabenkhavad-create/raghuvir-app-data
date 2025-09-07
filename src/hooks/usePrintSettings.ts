"use client";

import { useState, useEffect, useCallback } from 'react';

export interface PrintSettings {
  fontSize: 'text-sm' | 'text-base' | 'text-lg';
  showQRCode: boolean;
  showCompanyHeader: boolean;
  showFooter: boolean;
}

const SETTINGS_KEY = 'raghuvir_infra_print_settings';

const defaultSettings: PrintSettings = {
  fontSize: 'text-base',
  showQRCode: true,
  showCompanyHeader: true,
  showFooter: true,
};

export const usePrintSettings = () => {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Could not read print settings from localStorage", error);
      // Fallback to default settings
      setSettings(defaultSettings);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PrintSettings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
         console.error("Could not save print settings to localStorage", error);
      }
      return updated;
    });
  }, []);
  
  const resetSettings = useCallback(() => {
    try {
        localStorage.removeItem(SETTINGS_KEY);
        setSettings(defaultSettings);
    } catch (error) {
        console.error("Could not remove print settings from localStorage", error);
    }
  }, []);

  return { settings, updateSettings, isLoaded, resetSettings };
};
