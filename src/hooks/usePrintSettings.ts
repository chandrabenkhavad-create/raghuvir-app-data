
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

export interface PrintSettings {
  pageSize: 'DL' | 'A4_portrait' | 'A4_landscape';
  fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
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
  showSaleVehicleNumber: boolean;
  showSaleWeightDetails: boolean;
  showSaleRemarks: boolean;
  showSaleRoyalty: boolean;
  showSaleDriver: boolean;
  showDieselDriver: boolean;
  showDieselOdo: boolean;
  authorizedSignatory: string;
  saleDocumentTitle: string;
  dieselDocumentTitle: string;
}

const defaultSettings: PrintSettings = {
  pageSize: 'DL',
  fontSize: 'text-xs',
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
  showSaleVehicleNumber: true,
  showSaleWeightDetails: true,
  showSaleRemarks: true,
  showSaleRoyalty: true,
  showSaleDriver: true,
  showDieselDriver: true,
  showDieselOdo: true,
  saleDocumentTitle: 'DELIVERY CHALLAN (Original)',
  dieselDocumentTitle: 'DIESEL SLIP',
};

export const usePrintSettings = () => {
  const { user, updateUserSettingsInContext } = useAuth();
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
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
    // if user is undefined, we are still loading, do nothing
  }, [user]);

  const updateSettings = useCallback((newSettings: Partial<PrintSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    updateUserSettingsInContext(updated);
  }, [settings, updateUserSettingsInContext]);
  
  const resetSettings = useCallback(() => {
    const newSettings = { ...settings, ...defaultSettings };
    setSettings(defaultSettings);
    updateUserSettingsInContext(newSettings);
  }, [settings, updateUserSettingsInContext]);

  return { settings, updateSettings, isLoaded, resetSettings };
};
