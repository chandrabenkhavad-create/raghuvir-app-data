
"use client";

import type { FC } from 'react';
import type { SaleEntry } from '@/types';
import { usePrintSettings } from '@/hooks/usePrintSettings';
import { cn } from '@/lib/utils';

interface PrintRecordProps {
  data: SaleEntry | null;
}

export const PrintRecord: FC<PrintRecordProps> = ({ data }) => {
  const { settings } = usePrintSettings();
  
  if (!data) {
    return null;
  }
  
  const grosswt = Number(data.grosswt || 0);
  const tarewt = Number(data.tarewt || 0);
  const netwt = Number(data.netwt || 0);
  const royaltyWeight = Number(data.royaltyWeight);
  
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
          <header className={`pb-2 border-b-2 border-gray-400 mb-2`}>
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
                  <p><strong>DC No:</strong> {data.dcno}</p>
                  <p><strong>Date:</strong> {data.date}</p>
                  <p><strong>Time:</strong> {data.time}</p>
                </div>
            </div>
             {settings.saleDocumentTitle && <h2 className="text-center font-bold text-lg underline mt-2">{settings.saleDocumentTitle}</h2>}
          </header>
        )}

        <main className="flex justify-between items-start">
           <div className={`grid grid-cols-2 gap-x-8 flex-grow text-sm ${compactClass}`}>
             {/* Left Column */}
             <div className={`space-y-1 ${compactClass}`}>
                 <div className={`flex justify-between items-baseline ${compactPadding}`}>
                    <strong>Purchase Party:</strong>
                    <span className="text-lg font-semibold">{data.purchase}</span>
                </div>
                <div className={`flex justify-between items-baseline ${compactPadding}`}>
                    <strong>Customer:</strong>
                    <span className="text-lg font-semibold">{data.customer}</span>
                </div>
                <div className={`flex justify-between items-baseline ${compactPadding}`}>
                    <strong>Site:</strong>
                    <span className="text-lg font-semibold">{data.site}</span>
                </div>
                 {settings.showSaleWeightDetails && (
                  <div className="mt-2 space-y-1">
                     <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Gross Weight:</strong>
                        <span className="text-lg">{grosswt.toFixed(2)} KG</span>
                     </div>
                     <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Tare Weight:</strong>
                        <span className="text-lg">{tarewt.toFixed(2)} KG</span>
                     </div>
                     <div className={`flex justify-between items-baseline font-bold pt-1 ${compactPadding}`}>
                        <strong>Net Weight:</strong>
                        <span className="text-lg">{netwt.toFixed(2)} KG</span>
                     </div>
                  </div>
                )}
             </div>
             
             {/* Right Column */}
             <div className={`space-y-1 ${compactClass}`}>
                <div className={`flex justify-between items-baseline ${compactPadding}`}>
                    <strong>Material:</strong>
                    <span className="text-lg font-semibold">{data.material}</span>
                </div>
                 <div className={`flex justify-between items-baseline ${compactPadding}`}>
                    <strong>Transporter:</strong>
                    <span className="text-lg">{data.transporter}</span>
                </div>
                {settings.showSaleVehicleNumber && (
                    <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Vehicle Number:</strong>
                        <span className="text-lg font-semibold">{data.vehicleNumber}</span>
                    </div>
                )}
                 {settings.showSaleDriver && (
                    <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Driver:</strong>
                        <span className="text-lg">{data.driver}</span>
                    </div>
                 )}
                 {settings.showSaleRoyalty && (
                    <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Royalty Pass Number:</strong>
                        <span className="text-lg">{data.royaltyPassNumber || 'N/A'}</span>
                    </div>
                )}
                {settings.showSaleRoyalty && (
                    <div className={`flex justify-between items-baseline ${compactPadding}`}>
                        <strong>Royalty Weight:</strong>
                        <span className="text-lg">{typeof royaltyWeight === 'number' && royaltyWeight > 0 ? `${royaltyWeight.toFixed(2)} KG` : 'N/A'}</span>
                    </div>
                )}
                
                {settings.showSaleRemarks && data.remarks && (
                  <div className="col-span-2 mt-2">
                    <strong>Remarks:</strong>
                    <p className="mt-0.5 border p-1 rounded-md text-xs">{data.remarks}</p>
                  </div>
                )}
             </div>
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
