
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
  const royaltyWeight = Number(data.royaltyWeight);
  const rent = Number(data.rent || 0);
  
  const compactClass = settings.useCompactLayout ? 'gap-y-0.5' : 'gap-y-1.5';
  const compactPadding = settings.useCompactLayout ? 'py-0' : 'py-0.5';

  return (
    <div className={`bg-white text-black p-4 w-[210mm] min-h-[99mm] border border-gray-400 flex flex-col justify-between font-sans ${settings.fontSize}`}>
      <div>
        {settings.showCompanyHeader && (
          <header className={`pb-2 border-b-2 border-gray-400 mb-2`}>
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
                  <p><strong>DC No:</strong> {String(data.dcno).padStart(3, '0')}</p>
                  <p><strong>Date:</strong> {data.date}</p>
                  <p><strong>Time:</strong> {data.time}</p>
                </div>
            </div>
             {settings.saleDocumentTitle && <h2 className="text-center font-bold text-lg underline mt-2">{settings.saleDocumentTitle}</h2>}
          </header>
        )}

        <main className="flex justify-between items-start">
          <div className={`grid grid-cols-2 gap-x-6 ${compactClass} flex-grow text-sm`}>
            {settings.showSalePurchase && (<div className={`col-span-2 ${compactPadding}`}>
              <strong className="block text-gray-600">Purchase:</strong>
              <span>{data.purchase}</span>
            </div>)}
            <div className={`col-span-2 ${compactPadding}`}>
              <strong className="block text-gray-600">Customer:</strong>
              <span>{data.customer || data.site}</span>
            </div>
             {settings.showSaleTransporter && (<div className={`col-span-2 ${compactPadding}`}>
              <strong className="block text-gray-600">Transporter:</strong>
              <span>{data.transporter}</span>
            </div>)}
            <div className={compactPadding}>
              <strong className="block text-gray-600">Material:</strong>
              <span>{data.material}</span>
            </div>
            {settings.showSaleDriver && (<div className={compactPadding}>
              <strong className="block text-gray-600">Driver:</strong>
              <span>{data.driver}</span>
            </div>)}
            {settings.showSaleVehicleNumber && (<div className={compactPadding}>
                <strong className="block text-gray-600">Vehicle Number:</strong>
                <span>{data.vehicleNumber}</span>
            </div>)}
            {settings.showSaleRoyalty && (<div className={compactPadding}>
              <strong className="block text-gray-600">Royalty Pass Number:</strong>
              <span>{data.royaltyPassNumber || 'N/A'}</span>
            </div>)}
            {settings.showSaleRoyalty && (<div className={compactPadding}>
                <strong className="block text-gray-600">Royalty Weight:</strong>
                <span>{typeof royaltyWeight === 'number' && royaltyWeight > 0 ? `${royaltyWeight.toFixed(2)} KG` : 'N/A'}</span>
            </div>)}
             {settings.showSaleRent && (<div className={compactPadding}>
              <strong className="block text-gray-600">Rent:</strong>
              <span>₹{rent.toFixed(2)}</span>
            </div>)}

            {/* This is the new vertical layout for weights */}
            {settings.showSaleWeightDetails && (
              <div className="col-span-2 mt-2 space-y-1">
                 <div>
                    <strong className="block text-gray-600">Gross Weight:</strong>
                    <span>{grosswt.toFixed(2)} KG</span>
                 </div>
                 <div>
                    <strong className="block text-gray-600">Tare Weight:</strong>
                    <span>{tarewt.toFixed(2)} KG</span>
                 </div>
                 <div className="font-bold text-base pt-1">
                    <strong className="block text-gray-600">Net Weight:</strong>
                    <span>{netwt.toFixed(2)} KG</span>
                 </div>
              </div>
            )}
           
            {settings.showSaleRemarks && data.remarks && (
              <div className="col-span-2 mt-1">
                <strong className="block text-gray-600">Remarks:</strong>
                <p className="mt-0.5 border p-1 rounded-md text-xs">{data.remarks}</p>
              </div>
            )}
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
          <p>(Signature)</p>
        </footer>
      )}
    </div>
  );
};
