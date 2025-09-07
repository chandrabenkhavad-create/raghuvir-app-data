
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface PrintSettings {
  fontSize: 'text-sm' | 'text-base' | 'text-lg';
  showQRCode: boolean;
  showCompanyHeader: boolean;
  showFooter: boolean;
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyLogoUrl: string;
  companyGst: string;
  companyEmail: string;
  companyWebsite: string;
  useCompactLayout: boolean;
  // Sale specific
  showSaleTransporter: boolean;
  showSaleDriver: boolean;
  showSaleRent: boolean;
  showSaleRemarks: boolean;
  showSaleRoyalty: boolean;
  // Diesel specific
  showDieselDriver: boolean;
  showDieselOdo: boolean;
  // New
  authorizedSignatory: string;
  saleDocumentTitle: string;
  dieselDocumentTitle: string;
}

const SETTINGS_KEY = 'raghuvir_infra_print_settings';

const defaultSettings: PrintSettings = {
  fontSize: 'text-base',
  showQRCode: true,
  showCompanyHeader: true,
  showFooter: true,
  companyName: 'Raghuvir Infrastructure',
  companyAddress: 'Sayla-Sudamda Road, Sudamda.',
  companyContact: '',
  companyLogoUrl: '',
  companyGst: '',
  companyEmail: '',
  companyWebsite: '',
  authorizedSignatory: 'For Raghuvir Infrastructure',
  useCompactLayout: false,
  showSaleTransporter: true,
  showSaleDriver: true,
  showSaleRent: true,
  showSaleRemarks: true,
  showSaleRoyalty: true,
  showDieselDriver: true,
  showDieselOdo: true,
  saleDocumentTitle: 'DELIVERY CHALLAN (Original)',
  dieselDocumentTitle: 'DIESEL SLIP',
};

export const usePrintSettings = () => {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        // Merge stored settings with defaults to ensure all keys are present
        setSettings(prev => ({ ...defaultSettings, ...JSON.parse(storedSettings) }));
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
