
"use client";

import { useAuth } from '@/components/AuthProvider';
import { FileSpreadsheet, Fuel, LayoutDashboard, LogOut, Package, UserCog, Settings, Palette, Type, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaleForm } from '@/components/SaleForm';
import { DieselForm } from '@/components/DieselForm';
import { ReportsTab } from '@/components/ReportsTab';
import { DashboardTab } from '@/components/DashboardTab';
import { MastersTab } from '@/components/MastersTab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaleEntry, DieselEntry } from '@/types';
import { EditSaleDialog } from '@/components/EditSaleDialog';
import { EditDieselDialog } from '@/components/EditDieselDialog';
import { PrintLayoutSettings } from '@/components/PrintLayoutSettings';
import { CompanyDetailsSettings } from '@/components/CompanyDetailsSettings';
import { UserPermissionsSettings } from '@/components/UserPermissionsSettings';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { setTheme } = useTheme();
  const { settings: appSettings, isLoaded: appSettingsLoaded } = useAppSettings();
  
  // State for editing entries
  const [editingSale, setEditingSale] = useState<SaleEntry | null>(null);
  const [editingDiesel, setEditingDiesel] = useState<DieselEntry | null>(null);

  // State for printing entries
  const [printingSale, setPrintingSale] = useState<SaleEntry | null>(null);
  const [printingDiesel, setPrintingDiesel] = useState<DieselEntry | null>(null);
  
  const [refreshReports, setRefreshReports] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  useEffect(() => {
    // If the user is not an admin and their default tab is hidden, switch to a visible tab.
    if (user?.role !== 'admin' && appSettingsLoaded) {
      const tabsVisibility = {
        dashboard: appSettings.userCanViewDashboard,
        sale: true,
        diesel: true,
        reports: appSettings.userCanViewReports,
        masters: appSettings.userCanViewMasters,
        settings: appSettings.userCanViewSettings,
      };

      if (!tabsVisibility[activeTab as keyof typeof tabsVisibility]) {
          // Default to the first available tab for the user
          if (appSettings.userCanViewDashboard) setActiveTab('dashboard');
          else setActiveTab('sale'); 
      }
    }
  }, [user, appSettings, appSettingsLoaded, activeTab]);


  const handleEditSale = (entry: SaleEntry) => {
    setEditingSale(entry);
  }

  const handleEditDiesel = (entry: DieselEntry) => {
    setEditingDiesel(entry);
  }
  
  const handlePrintSale = (entry: SaleEntry) => {
    setPrintingSale(entry);
  }

  const handlePrintDiesel = (entry: DieselEntry) => {
    setPrintingDiesel(entry);
  }
  
  const onSaleUpdated = () => {
    setEditingSale(null); // Close the dialog
    setRefreshReports(prev => !prev);
  }

  const onDieselUpdated = () => {
    setEditingDiesel(null); // Close the dialog
    setRefreshReports(prev => !prev);
  }


  if (!isAuthenticated || !appSettingsLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }
  
  const isAdmin = user?.role === 'admin';
  const showDashboard = isAdmin || appSettings.userCanViewDashboard;
  const showReports = isAdmin || appSettings.userCanViewReports;
  const showMasters = isAdmin || appSettings.userCanViewMasters;
  const showSettings = isAdmin || appSettings.userCanViewSettings;

  return (
    <>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-w-5xl mx-auto gap-2">
            {showDashboard && <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>}
            <TabsTrigger value="sale"><Package className="mr-2 h-4 w-4" />Sale Entry</TabsTrigger>
            <TabsTrigger value="diesel"><Fuel className="mr-2 h-4 w-4" />Diesel Entry</TabsTrigger>
            {showReports && <TabsTrigger value="reports"><FileSpreadsheet className="mr-2 h-4 w-4" />Reports</TabsTrigger>}
            {showMasters && <TabsTrigger value="masters"><Database className="mr-2 h-4 w-4" />Masters</TabsTrigger>}
            {showSettings && <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="sale" className="mt-6">
            <SaleForm 
              onEntrySaved={() => { /* Can be used to refresh recent list */ }}
              entryToPrint={printingSale}
              onPrintDialogChange={() => setPrintingSale(null)}
              onEditRequest={handleEditSale}
            />
          </TabsContent>
          
          <TabsContent value="diesel" className="mt-6">
            <DieselForm
              entryToPrint={printingDiesel}
              onPrintDialogChange={() => setPrintingDiesel(null)}
              onEditRequest={handleEditDiesel}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab 
              onEditSale={handleEditSale}
              onEditDiesel={handleEditDiesel}
              onPrintSale={handlePrintSale}
              onPrintDiesel={handlePrintDiesel}
              refreshKey={refreshReports}
            />
          </TabsContent>

           <TabsContent value="masters" className="mt-6">
             <MastersTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
             <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Application Settings</CardTitle>
                            <CardDescription>Manage application-wide settings and user actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-3 border rounded-lg">
                               <span className="font-medium">Dark/Light Mode</span>
                               <ThemeToggle />
                            </div>
                             {isAdmin && (
                                <Link href="/users" passHref>
                                  <Button asChild variant="outline" className="w-full justify-start p-6 text-left">
                                     <div className="flex justify-between items-center w-full">
                                       Manage Users
                                       <UserCog className="h-5 w-5" />
                                     </div>
                                  </Button>
                                </Link>
                              )}
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div>
                              <Label className="flex items-center gap-2 mb-3"><Palette /> Color Scheme</Label>
                              <RadioGroup defaultValue="default" onValueChange={(v) => setTheme(v)}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="default" id="r1" />
                                  <Label htmlFor="r1">Default</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="theme-zinc" id="r2" />
                                  <Label htmlFor="r2">Zinc</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="theme-rose" id="r3" />
                                  <Label htmlFor="r3">Rose</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="theme-blue" id="r4" />
                                  <Label htmlFor="r4">Blue</Label>
                                </div>
                              </RadioGroup>
                           </div>
                            <div>
                              <Label className="flex items-center gap-2 mb-3"><Type /> Font Style</Label>
                              <RadioGroup defaultValue="font-body" onValueChange={(v) => {
                                 document.body.classList.remove('font-body', 'font-poppins', 'font-roboto');
                                 document.body.classList.add(v);
                              }}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="font-body" id="f1" />
                                  <Label htmlFor="f1">Inter (Default)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="font-poppins" id="f2" />
                                  <Label htmlFor="f2">Poppins</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="font-roboto" id="f3" />
                                  <Label htmlFor="f3">Roboto</Label>
                                </div>
                              </RadioGroup>
                           </div>
                        </CardContent>
                     </Card>
                </div>
                 {isAdmin && (
                    <div className="space-y-8">
                        <UserPermissionsSettings />
                        <CompanyDetailsSettings />
                        <PrintLayoutSettings />
                    </div>
                 )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>

    {editingSale && (
        <EditSaleDialog
            isOpen={!!editingSale}
            onClose={() => setEditingSale(null)}
            onSaleUpdated={onSaleUpdated}
            saleEntry={editingSale}
        />
    )}
    {editingDiesel && (
        <EditDieselDialog
            isOpen={!!editingDiesel}
            onClose={() => setEditingDiesel(null)}
            onDieselUpdated={onDieselUpdated}
            dieselEntry={editingDiesel}
        />
    )}
    </>
  );
}
