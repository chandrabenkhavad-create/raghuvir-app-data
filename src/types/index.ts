
export interface SaleEntry {
  id: number;
  dcno: number;
  date: string;
  time: string;
  material: string;
  supplier: string;
  customer: string;
  transporter: string;
  grosswt: number;
  tarewt: number;
  netwt: number;
  rent: number;
  driver: string;
  site: string;
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
  created_at: string;
}
