
"use client";

import type { FC } from 'react';
import QRCode from "react-qr-code";
import type { DieselEntry } from '@/types';

interface PrintDieselRecordProps {
  data: DieselEntry | null;
}

export const PrintDieselRecord: FC<PrintDieselRecordProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const qrCodeValue = JSON.stringify(data);
  
  // Ensure values are numbers before calling toFixed
  const liters = Number(data.liters || 0);
  const rate = Number(data.rate || 0);
  const amount = Number(data.amount || 0);
  const odo = Number(data.odo || 0);


  return (
    <div className="bg-white text-black p-8 w-[210mm] min-h-[148mm] border border-gray-400 flex flex-col justify-between font-sans text-sm">
      <div>
        <header className="flex justify-between items-start pb-4 border-b-2 border-gray-400 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Raghuvir Infrastructure</h1>
            <p className="text-base">Diesel Record</p>
          </div>
          <div className="text-right">
            <p><strong>Record ID:</strong> {data.id}</p>
            <p><strong>Date:</strong> {data.date}</p>
            <p><strong>Time:</strong> {data.time}</p>
          </div>
        </header>

        <main className="flex justify-between items-start">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow">
            <div className="col-span-2">
                <strong className="block text-gray-600">Vehicle Number:</strong>
                <span>{data.vehicleNumber}</span>
            </div>
             <div className="col-span-2">
              <strong className="block text-gray-600">Pump:</strong>
              <span>{data.pump}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Driver Name:</strong>
              <span>{data.driverName}</span>
            </div>
             <div>
              <strong className="block text-gray-600">ODO Reading:</strong>
              <span>{odo}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Liters:</strong>
              <span>{liters.toFixed(2)} L</span>
            </div>
            <div>
              <strong className="block text-gray-600">Rate:</strong>
              <span>₹{rate.toFixed(2)} / L</span>
            </div>
            <div className="font-bold">
              <strong className="block text-gray-600">Total Amount:</strong>
              <span>₹{amount.toFixed(2)}</span>
            </div>
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
