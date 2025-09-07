
"use client";

import type { FC } from 'react';
import QRCode from "react-qr-code";
import type { DieselEntry } from '@/types';
import { usePrintSettings } from '@/hooks/usePrintSettings';

interface PrintDieselRecordProps {
  data: DieselEntry | null;
}

export const PrintDieselRecord: FC<PrintDieselRecordProps> = ({ data }) => {
  const { settings } = usePrintSettings();

  if (!data) {
    return null;
  }

  const qrCodeValue = JSON.stringify(data);
  
  const liters = Number(data.liters || 0);
  const rate = Number(data.rate || 0);
  const amount = Number(data.amount || 0);
  const odo = Number(data.odo || 0);

  const compactClass = settings.useCompactLayout ? 'gap-y-0.5' : 'gap-y-1.5';
  const compactPadding = settings.useCompactLayout ? 'py-0' : 'py-0.5';

  return (
    <div className={`bg-white text-black p-4 w-[220mm] min-h-[110mm] border border-gray-400 flex flex-col justify-between font-sans ${settings.fontSize}`}>
      <div>
        {settings.showCompanyHeader && (
          <header className="pb-2 border-b-2 border-gray-400 mb-2">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {settings.companyLogoUrl && (
                        <img src={settings.companyLogoUrl} alt="Company Logo" className="h-12 max-w-24 object-contain" />
                    )}
                    <div>
                      <h1 className="text-xl font-bold">{settings.companyName}</h1>
                      <p className="text-xs">{settings.companyAddress}</p>
                       <p className="text-xs">
                        {settings.companyContact && `Contact: ${settings.companyContact}`}
                        {settings.companyGst && ` | GST: ${settings.companyGst}`}
                      </p>
                       <p className="text-xs">
                        {settings.companyEmail && `Email: ${settings.companyEmail}`}
                        {settings.companyWebsite && ` | Web: ${settings.companyWebsite}`}
                      </p>
                    </div>
                </div>
                <div className="text-right text-xs flex-shrink-0">
                  <p><strong>Record ID:</strong> {data.id}</p>
                  <p><strong>Date:</strong> {data.date}</p>
                  <p><strong>Time:</strong> {data.time}</p>
                </div>
            </div>
             {settings.dieselDocumentTitle && <h2 className="text-center font-bold text-lg underline mt-2">{settings.dieselDocumentTitle}</h2>}
          </header>
        )}

        <main className="flex justify-between items-start">
          <div className={`grid grid-cols-2 gap-x-6 ${compactClass} flex-grow text-sm`}>
            <div className={`col-span-2 ${compactPadding}`}>
                <strong className="block text-gray-600">Vehicle Number:</strong>
                <span>{data.vehicleNumber}</span>
            </div>
             <div className={`col-span-2 ${compactPadding}`}>
              <strong className="block text-gray-600">Pump:</strong>
              <span>{data.pump}</span>
            </div>
            {settings.showDieselDriver && (<div className={compactPadding}>
              <strong className="block text-gray-600">Driver Name:</strong>
              <span>{data.driverName}</span>
            </div>)}
             {settings.showDieselOdo && (<div className={compactPadding}>
              <strong className="block text-gray-600">ODO Reading:</strong>
              <span>{odo}</span>
            </div>)}
            <div className={compactPadding}>
              <strong className="block text-gray-600">Liters:</strong>
              <span>{liters.toFixed(2)} L</span>
            </div>
            <div className={compactPadding}>
              <strong className="block text-gray-600">Rate:</strong>
              <span>₹{rate.toFixed(2)} / L</span>
            </div>
            <div className={`font-bold ${compactPadding}`}>
              <strong className="block text-gray-600">Total Amount:</strong>
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>
           {settings.showQRCode && (
            <div className="ml-4 flex-shrink-0">
               <QRCode value={qrCodeValue} size={80} />
            </div>
          )}
        </main>
      </div>

       {settings.showFooter && (
        <footer className="text-right text-xs text-gray-700 pt-8 mt-auto">
          <div className="border-t-2 border-dashed border-gray-400 w-48 ml-auto mb-1"></div>
          <p>{settings.authorizedSignatory}</p>
          <p>(Authorised Signatory)</p>
        </footer>
      )}
    </div>
  );
};
