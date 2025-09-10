

export interface SaleEntry {
  id: number;
  dcno: number;
  date: string;
  time: string;
  material: string;
  purchase: string;
  customer: string;
  site: string;
  transporter: string;
  grosswt: number;
  tarewt: number;
  netwt: number;
  rent: number;
  driver: string;
  remarks?: string;
  vehicleNumber: string;
  royaltyPassNumber?: string;
  royaltyWeight?: number;
  created_at: string;
}

export interface DieselEntry {
  id: number;
  date: string;
  time: string;
  vehicleNumber: string;
  liters: number;
  rate: number;
  amount: number;
  driverName: string;
  pump: string;
  odo: number;
  mileage?: number;
  created_at: string;
}

export interface AppSettings {
  userCanViewDashboard: boolean;
  userCanViewReports: boolean;
  userCanViewSettings: boolean;
  userCanEditEntries: boolean;
}

export interface PrintSettings {
  pageSize: 'DL' | 'A4_portrait' | 'A4_landscape';
  fontSize: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg';
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


export interface User {
  id: number;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  created_at: string;
  settings?: AppSettings & PrintSettings;
}

    
