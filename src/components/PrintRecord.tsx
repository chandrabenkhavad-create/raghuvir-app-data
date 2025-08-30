"use client";

import type { FC } from 'react';
import QRCode from 'react-qr-code';

interface SaleEntry {
  id: number;
  dcno: number;
  date: string;
  time: string;
  name: string;
  supplier: string;
  transporter: string;
  grosswt: number;
  tarewt: number;
  netwt: number;
  rent: number;
  driver: string;
  site: string;
  remarks?: string;
}

interface PrintRecordProps {
  data: SaleEntry | null;
}

export const PrintRecord: FC<PrintRecordProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const qrCodeValue = JSON.stringify(data);

  return (
    <div className="bg-white text-black p-8 w-[210mm] min-h-[148mm] border border-gray-400 flex flex-col justify-between font-sans text-sm">
      <div>
        <header className="flex justify-between items-start pb-4 border-b-2 border-gray-400 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Raghuvir Infrastructure</h1>
            <p className="text-base">Sale Record</p>
          </div>
          <div className="text-right">
            <p><strong>DC No:</strong> {data.dcno}</p>
            <p><strong>Date:</strong> {data.date}</p>
            <p><strong>Time:</strong> {data.time}</p>
          </div>
        </header>

        <main className="flex justify-between items-start">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow">
            <div className="col-span-2">
              <strong className="block text-gray-600">Supplier:</strong>
              <span>{data.supplier}</span>
            </div>
             <div className="col-span-2">
              <strong className="block text-gray-600">Transporter:</strong>
              <span>{data.transporter}</span>
            </div>
             <div className="col-span-2">
              <strong className="block text-gray-600">Site:</strong>
              <span>{data.site}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Item Name:</strong>
              <span>{data.name}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Driver:</strong>
              <span>{data.driver}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Gross Weight:</strong>
              <span>{data.grosswt.toFixed(2)} KG</span>
            </div>
            <div>
              <strong className="block text-gray-600">Tare Weight:</strong>
              <span>{data.tarewt.toFixed(2)} KG</span>
            </div>
            <div className="font-bold">
              <strong className="block text-gray-600">Net Weight:</strong>
              <span>{data.netwt.toFixed(2)} KG</span>
            </div>
            <div className="font-bold">
              <strong className="block text-gray-600">Rent:</strong>
              <span>₹{data.rent.toFixed(2)}</span>
            </div>
            {data.remarks && (
              <div className="col-span-2 mt-2">
                <strong className="block text-gray-600">Remarks:</strong>
                <p className="mt-1 border p-2 rounded-md">{data.remarks}</p>
              </div>
            )}
          </div>
          <div className="ml-8 flex-shrink-0">
             <QRCode value={qrCodeValue} size={128} />
          </div>
        </main>
      </div>

      <footer className="text-center text-xs text-gray-500 pt-4 mt-auto">
        This is a computer-generated document.
      </footer>
    </div>
  );
};
