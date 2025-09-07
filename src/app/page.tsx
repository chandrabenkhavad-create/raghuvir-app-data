
"use client";

import { useAuth } from '@/components/AuthProvider';
import { FileSpreadsheet, Fuel, LayoutDashboard, LogOut, Package, UserCog, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaleForm } from '@/components/SaleForm';
import { DieselForm } from '@/components/DieselForm';
import { ReportsTab } from '@/components/ReportsTab';
import { DashboardTab } from '@/components/DashboardTab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaleEntry, DieselEntry } from '@/types';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for editing entries
  const [editingSale, setEditingSale] = useState<SaleEntry | null>(null);
  const [editingDiesel, setEditingDiesel] = useState<DieselEntry | null>(null);

  // State for printing entries
  const [printingSale, setPrintingSale] = useState<SaleEntry | null>(null);
  const [printingDiesel, setPrintingDiesel] = useState<DieselEntry | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  const handleEditSale = (entry: SaleEntry) => {
    setEditingSale(entry);
    setEditingDiesel(null);
    setActiveTab('sale');
  }

  const handleEditDiesel = (entry: DieselEntry) => {
    setEditingDiesel(entry);
    setEditingSale(null);
    setActiveTab('diesel');
  }
  
  const handlePrintSale = (entry: SaleEntry) => {
    setPrintingSale(entry);
  }

  const handlePrintDiesel = (entry: DieselEntry) => {
    setPrintingDiesel(entry);
  }
  
  const handleNewSale = () => {
    setEditingSale(null);
    setActiveTab('sale');
  }
  
  const handleNewDiesel = () => {
    setEditingDiesel(null);
    setActiveTab('diesel');
  }


  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8 relative">
          <div className="absolute top-0 right-0 flex items-start gap-4">
              <SupabaseStatus />
              <div className="flex flex-col items-end">
                 <Button variant="ghost" onClick={logout} className="px-3 py-1 h-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                 </Button>
                 {user && <span className="text-base text-muted-foreground mt-1">Welcome, {user.username}</span>}
              </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
              Raghuvir Infrastructure
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Sayla-Sudamda Road,Sudamda.
            </p>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
            </TabsTrigger>
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
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="sale" className="mt-6">
            <SaleForm 
              entryToEdit={editingSale}
              onEntrySaved={() => setEditingSale(null)}
              entryToPrint={printingSale}
              onPrintDialogChange={() => setPrintingSale(null)}
            />
          </TabsContent>
          
          <TabsContent value="diesel" className="mt-6">
            <DieselForm
              entryToEdit={editingDiesel}
              onEntrySaved={() => setEditingDiesel(null)}
              entryToPrint={printingDiesel}
              onPrintDialogChange={() => setPrintingDiesel(null)}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab 
              onEditSale={handleEditSale}
              onEditDiesel={handleEditDiesel}
              onPrintSale={handlePrintSale}
              onPrintDiesel={handlePrintDiesel}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
             <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                    <CardDescription>Manage application-wide settings and user actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                       <span className="font-medium">Theme</span>
                       <ThemeToggle />
                    </div>
                     {user?.role === 'admin' && (
                        <Link href="/users" passHref>
                          <Button variant="outline" className="w-full justify-between p-6">
                             Manage Users
                            <UserCog className="h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
