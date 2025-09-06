
"use client";

import { useAuth } from '@/components/AuthProvider';
import { FileSpreadsheet, Fuel, LayoutDashboard, LogOut, Package, UserCog } from 'lucide-react';
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
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
                Raghuvir Infrastructure
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Sayla-Sudamda Road,Sudamda.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
               <SupabaseStatus />
               <ThemeToggle />
               {user === 'admin' && (
                  <Link href="/users" passHref>
                    <Button variant="outline">
                      <UserCog className="mr-2 h-4 w-4" /> Manage Users
                    </Button>
                  </Link>
                )}
               <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
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
        </Tabs>
      </div>
    </main>
  );
}
