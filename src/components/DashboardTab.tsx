
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getAllSaleEntries } from '@/services/saleService';
import type { SaleEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export function DashboardTab() {
    const [salesData, setSalesData] = useState<SaleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const sales = await getAllSaleEntries();
                setSalesData(sales);
            } catch (e: any) {
                setError(e.message || "Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const vehicleTrips = useMemo(() => {
        if (!salesData.length) return {};
        return salesData.reduce((acc, sale) => {
            acc[sale.vehicleNumber] = (acc[sale.vehicleNumber] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [salesData]);

    const supplierMaterials = useMemo(() => {
        if (!salesData.length) return {};
        return salesData.reduce((acc, sale) => {
            if (!acc[sale.supplier]) {
                acc[sale.supplier] = {};
            }
            acc[sale.supplier][sale.material] = (acc[sale.supplier][sale.material] || 0) + sale.netwt;
            return acc;
        }, {} as Record<string, Record<string, number>>);
    }, [salesData]);

    const transporterTrips = useMemo(() => {
        if (!salesData.length) return {};
        return salesData.reduce((acc, sale) => {
            acc[sale.transporter] = (acc[sale.transporter] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [salesData]);

    const vehicleAmounts = useMemo(() => {
        if (!salesData.length) return {};
        return salesData.reduce((acc, sale) => {
            const amount = sale.netwt * sale.rent;
            acc[sale.vehicleNumber] = (acc[sale.vehicleNumber] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);
    }, [salesData]);

    if (error) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        );
    }
    
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card className="md:col-span-2"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Trips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Trips</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleTrips).map(([vehicle, count]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{count}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Transporter Trips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Transporter</TableHead><TableHead className="text-right">Trips</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(transporterTrips).map(([transporter, count]) => (
                                    <TableRow key={transporter}><TableCell>{transporter}</TableCell><TableCell className="text-right">{count}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Vehicle Revenue</CardTitle>
                        <CardDescription>Based on Net Weight * Rent</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Total Amount (₹)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleAmounts).map(([vehicle, amount]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{amount.toFixed(2)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Material Supply by Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(supplierMaterials).map(([supplier, materials]) => (
                             <Card key={supplier} className="bg-muted/50">
                                 <CardHeader><CardTitle className="text-lg">{supplier}</CardTitle></CardHeader>
                                 <CardContent>
                                     <Table>
                                        <TableHeader><TableRow><TableHead>Material</TableHead><TableHead className="text-right">Total Net Weight (KG)</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {Object.entries(materials).map(([material, netwt]) => (
                                                <TableRow key={material}><TableCell>{material}</TableCell><TableCell className="text-right">{netwt.toFixed(2)}</TableCell></TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                 </CardContent>
                             </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Driver Attendance</AlertTitle>
                <AlertDescription>
                    This feature is coming soon. A data structure for driver attendance needs to be created first.
                </AlertDescription>
            </Alert>
        </div>
    );
}
