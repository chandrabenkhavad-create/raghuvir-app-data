
"use client";

import { useAuth } from '@/components/AuthProvider';
import { FileSpreadsheet, Fuel, LayoutDashboard, LogOut, Package, UserCog, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
          <div className="absolute top-0 right-0 flex items-center gap-4">
              <SupabaseStatus />
               <Button variant="ghost" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
               </Button>
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

        <Tabs defaultValue="dashboard" className="w-full">
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
            <SaleForm />
          </TabsContent>
          
          <TabsContent value="diesel" className="mt-6">
            <DieselForm />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
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
                     {user === 'admin' && (
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
