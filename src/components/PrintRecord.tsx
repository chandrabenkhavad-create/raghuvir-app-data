
"use client";

import type { FC } from 'react';
import QRCode from 'react-qr-code';
import type { SaleEntry } from '@/types';
import { usePrintSettings } from '@/hooks/usePrintSettings';

interface PrintRecordProps {
  data: SaleEntry | null;
}

export const PrintRecord: FC<PrintRecordProps> = ({ data }) => {
  const { settings } = usePrintSettings();
  
  if (!data) {
    return null;
  }

  const qrCodeValue = JSON.stringify(data);
  
  const grosswt = Number(data.grosswt || 0);
  const tarewt = Number(data.tarewt || 0);
  const netwt = Number(data.netwt || 0);
  const royaltyWeight = Number(data.royaltyWeight || 0);

  return (
    <div className={`bg-white text-black p-6 w-[220mm] min-h-[110mm] border border-gray-400 flex flex-col justify-between font-sans ${settings.fontSize}`}>
      <div>
        {settings.showCompanyHeader && (
          <header className="flex justify-between items-start pb-2 border-b-2 border-gray-400 mb-4">
            <div>
              <h1 className="text-3xl font-bold">Raghuvir Infrastructure</h1>
              <p className="text-lg">Sale Record</p>
            </div>
            <div className="text-right">
              <p><strong>DC No:</strong> {String(data.dcno).padStart(3, '0')}</p>
              <p><strong>Date:</strong> {data.date}</p>
              <p><strong>Time:</strong> {data.time}</p>
            </div>
          </header>
        )}

        <main className="flex justify-between items-start">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 flex-grow">
            <div className="col-span-2">
              <strong className="block text-gray-600">Purchase:</strong>
              <span>{data.purchase}</span>
            </div>
            <div className="col-span-2">
              <strong className="block text-gray-600">Customer:</strong>
              <span>{data.customer || data.site}</span>
            </div>
             <div className="col-span-2">
              <strong className="block text-gray-600">Transporter:</strong>
              <span>{data.transporter}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Material:</strong>
              <span>{data.material}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Driver:</strong>
              <span>{data.driver}</span>
            </div>
            <div>
                <strong className="block text-gray-600">Vehicle Number:</strong>
                <span>{data.vehicleNumber}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Royalty Pass Number:</strong>
              <span>{data.royaltyPassNumber || 'N/A'}</span>
            </div>
             <div>
                <strong className="block text-gray-600">Royalty Weight:</strong>
                <span>{typeof data.royaltyWeight === 'number' && data.royaltyWeight > 0 ? `${royaltyWeight.toFixed(2)} KG` : 'N/A'}</span>
            </div>
             <div>
              <strong className="block text-gray-600">Gross Weight:</strong>
              <span>{grosswt.toFixed(2)} KG</span>
            </div>
            <div>
              <strong className="block text-gray-600">Tare Weight:</strong>
              <span>{tarewt.toFixed(2)} KG</span>
            </div>
            <div className="font-bold">
              <strong className="block text-gray-600">Net Weight:</strong>
              <span>{netwt.toFixed(2)} KG</span>
            </div>
            {data.remarks && (
              <div className="col-span-2 mt-2">
                <strong className="block text-gray-600">Remarks:</strong>
                <p className="mt-1 border p-2 rounded-md">{data.remarks}</p>
              </div>
            )}
          </div>
          {settings.showQRCode && (
            <div className="ml-6 flex-shrink-0">
               <QRCode value={qrCodeValue} size={90} />
            </div>
          )}
        </main>
      </div>

      {settings.showFooter && (
        <footer className="text-center text-gray-500 pt-4 mt-auto">
          This is a computer-generated document.
        </footer>
      )}
    </div>
  );
};
