import { FileSpreadsheet, Fuel, Package } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PurchaseForm } from '@/components/PurchaseForm';
import { DieselForm } from '@/components/DieselForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-dark font-headline">
            Raghuvir Infrastructure
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your simple solution for data entry and management.
          </p>
        </header>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="purchase">
              <Package className="mr-2 h-4 w-4" />
              Purchase Entry
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
          
          <TabsContent value="purchase" className="mt-6">
            <PurchaseForm />
          </TabsContent>
          
          <TabsContent value="diesel" className="mt-6">
            <DieselForm />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Download your data entries as Excel files. This feature is currently in development.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button disabled>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Purchase Report
                </Button>
                <Button disabled>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Diesel Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
