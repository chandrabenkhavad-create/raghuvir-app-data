"use client";

import type { FC } from 'react';

interface PurchaseEntry {
  id: number;
  name: string;
  supplier: string;
  weights: string;
  driver: string;
  site: string;
  remarks?: string;
}

interface PrintRecordProps {
  data: PurchaseEntry | null;
}

export const PrintRecord: FC<PrintRecordProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-white text-black p-6 w-[220mm] h-[110mm] border border-gray-300 flex flex-col justify-between font-sans">
      <div>
        <header className="flex justify-between items-start pb-4 border-b border-gray-300 mb-4">
          <div>
            <h1 className="text-2xl font-bold">DataLogger</h1>
            <p className="text-sm">Purchase Record</p>
          </div>
          <div className="text-right text-sm">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Record ID:</strong> {data.id}</p>
          </div>
        </header>

        <main>
          <h2 className="text-lg font-semibold mb-2">Purchase Details</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <strong className="block text-gray-600">Name:</strong>
              <span>{data.name}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Supplier:</strong>
              <span>{data.supplier}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Weights:</strong>
              <span>{data.weights}</span>
            </div>
            <div>
              <strong className="block text-gray-600">Driver:</strong>
              <span>{data.driver}</span>
            </div>
            <div className="col-span-2">
              <strong className="block text-gray-600">Site:</strong>
              <span>{data.site}</span>
            </div>
            {data.remarks && (
              <div className="col-span-2">
                <strong className="block text-gray-600">Remarks:</strong>
                <p className="mt-1">{data.remarks}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="text-center text-xs text-gray-500 pt-4 mt-4">
        Thank you for your business.
      </footer>
    </div>
  );
};
