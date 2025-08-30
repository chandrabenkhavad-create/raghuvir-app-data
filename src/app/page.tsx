import { FileSpreadsheet, Fuel, Package } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaleForm } from '@/components/SaleForm';
import { DieselForm } from '@/components/DieselForm';
import { ReportsTab } from '@/components/ReportsTab';

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-dark font-headline">
            Raghuvir Infrastructure
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Sayla-Sidamda Road,Sudamda.
          </p>
        </header>

        <Tabs defaultValue="sale" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="sale">
              <Package className="mr-2 h-4 w-4" />
              Sale Entry
            </TabsTrigger>
            <TabsTrigger value="diesel">
              <Fuel className="mr-2 h-4 w-4" />
              Diesel Entry
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sale" className="mt-6">
            <SaleForm />
          </TabsContent>
          
          <TabsContent value="diesel" className="mt-6">
            <DieselForm />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
