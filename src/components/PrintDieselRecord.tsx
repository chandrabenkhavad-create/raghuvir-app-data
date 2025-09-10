
"use client";

import type { FC } from 'react';
import type { DieselEntry } from '@/types';
import { usePrintSettings } from '@/hooks/usePrintSettings';
import { cn } from '@/lib/utils';

interface PrintDieselRecordProps {
  data: DieselEntry | null;
}

export const PrintDieselRecord: FC<PrintDieselRecordProps> = ({ data }) => {
  const { settings } = usePrintSettings();

  if (!data) {
    return null;
  }
  
  const liters = Number(data.liters || 0);
  const rate = Number(data.rate || 0);
  const amount = Number(data.amount || 0);
  const odo = Number(data.odo || 0);
  const mileage = Number(data.mileage || 0);

  const compactClass = settings.useCompactLayout ? 'gap-y-0.5' : 'gap-y-1.5';
  const compactPadding = settings.useCompactLayout ? 'py-0' : 'py-0.5';

  const pageSizeClasses = {
      DL: 'w-[210mm] min-h-[99mm]',
      A4_portrait: 'w-[210mm] min-h-[297mm]',
      A4_landscape: 'w-[297mm] min-h-[210mm]',
  };

  return (
    <div className={cn(
        'bg-white text-black p-4 border border-gray-400 flex flex-col justify-between font-sans',
        pageSizeClasses[settings.pageSize],
        settings.fontSize
    )}>
      <div>
        {settings.showCompanyHeader && (
          <header className="pb-2 border-b-2 border-gray-400 mb-2">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {settings.companyLogoUrl && (
                        <img src={settings.companyLogoUrl} alt="Company Logo" className="h-12 max-w-24 object-contain" />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{settings.companyName}</h1>
                      <p className="text-sm">{settings.companyAddress}</p>
                       <p className="text-sm">
                        {settings.companyContact && `Contact: ${settings.companyContact}`}
                        {settings.companyGst && ` | GST: ${settings.companyGst}`}
                      </p>
                       <p className="text-sm">
                        {settings.companyEmail && `Email: ${settings.companyEmail}`}
                        {settings.companyWebsite && ` | Web: ${settings.companyWebsite}`}
                      </p>
                    </div>
                </div>
                <div className="text-right text-sm flex-shrink-0">
                  <p><strong>Record ID:</strong> {data.id}</p>
                  <p><strong>Date:</strong> {data.date}</p>
                  <p><strong>Time:</strong> {data.time}</p>
                </div>
            </div>
             {settings.dieselDocumentTitle && <h2 className="text-center font-bold text-lg underline mt-2">{settings.dieselDocumentTitle}</h2>}
          </header>
        )}

        <main className="flex justify-between items-start">
          <div className={cn('grid grid-cols-2 gap-x-8 flex-grow text-sm', compactClass)}>
            <div className={cn('col-span-2 items-baseline', compactPadding)}>
                <strong>Vehicle Number: </strong>
                <span className="text-lg font-semibold">{data.vehicleNumber}</span>
            </div>
             <div className={cn('col-span-2 items-baseline', compactPadding)}>
              <strong>Pump: </strong>
              <span className="text-lg">{data.pump}</span>
            </div>
            {settings.showDieselDriver && (<div className={cn('items-baseline', compactPadding)}>
              <strong>Driver Name: </strong>
              <span className="text-lg">{data.driverName}</span>
            </div>)}
             {settings.showDieselOdo && (<div className={cn('items-baseline', compactPadding)}>
              <strong>ODO Reading: </strong>
              <span className="text-lg">{odo}</span>
            </div>)}
            <div className={cn('items-baseline', compactPadding)}>
              <strong>Liters: </strong>
              <span className="text-lg">{liters.toFixed(2)} L</span>
            </div>
            <div className={cn('items-baseline', compactPadding)}>
              <strong>Rate: </strong>
              <span className="text-lg">₹{rate.toFixed(2)} / L</span>
            </div>
            <div className={cn('items-baseline font-bold', compactPadding)}>
              <strong>Total Amount: </strong>
              <span className="text-lg">₹{amount.toFixed(2)}</span>
            </div>
            {mileage > 0 && (
                <div className={cn('items-baseline font-bold', compactPadding)}>
                    <strong>Mileage: </strong>
                    <span className="text-lg">{mileage.toFixed(2)} km/L</span>
                </div>
            )}
          </div>
        </main>
      </div>

       {settings.showFooter && (
        <footer className="text-right text-xs text-gray-700 pt-8 mt-auto">
          <div className="border-t-2 border-dashed border-gray-400 w-48 ml-auto mb-1"></div>
          <p>{settings.authorizedSignatory}</p>
        </footer>
      )}
    </div>
  );
};
