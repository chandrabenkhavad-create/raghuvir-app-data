
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getAllSaleEntries } from '@/services/saleService';
import { getAllDieselEntries } from '@/services/dieselService';
import type { SaleEntry, DieselEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, Droplets, Truck, Users, Package, IndianRupee, HandCoins, Building, Fuel, AlertTriangle, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function DashboardTab() {
    const [salesData, setSalesData] = useState<SaleEntry[]>([]);
    const [dieselData, setDieselData] = useState<DieselEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const [sales, diesel] = await Promise.all([
                    getAllSaleEntries(),
                    getAllDieselEntries(),
                ]);
                setSalesData(sales);
                setDieselData(diesel);
            } catch (e: any) {
                setError(e.message || "Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    
    // Helper to parse DD/MM/YYYY into a Date object
    const parseDate = (dateString: string): Date => {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    const filteredSalesData = useMemo(() => {
        if (!fromDate && !toDate) return salesData;
        return salesData.filter(sale => {
            const saleDate = parseDate(sale.date);
            const start = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
            const end = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;

            if (start && saleDate < start) return false;
            if (end && saleDate > end) return false;
            return true;
        });
    }, [salesData, fromDate, toDate]);

    const filteredDieselData = useMemo(() => {
        if (!fromDate && !toDate) return dieselData;
        return dieselData.filter(diesel => {
            const dieselDate = parseDate(diesel.date);
            const start = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
            const end = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;

            if (start && dieselDate < start) return false;
            if (end && dieselDate > end) return false;
            return true;
        });
    }, [dieselData, fromDate, toDate]);

    const vehicleTrips = useMemo(() => {
        if (!filteredSalesData.length) return {};
        return filteredSalesData.reduce((acc, sale) => {
            acc[sale.vehicleNumber] = (acc[sale.vehicleNumber] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredSalesData]);

    const purchaseMaterials = useMemo(() => {
        if (!filteredSalesData.length) return {};
        return filteredSalesData.reduce((acc, sale) => {
            if (!acc[sale.purchase]) {
                acc[sale.purchase] = {};
            }
            const netwt = Number(sale.netwt) || 0;
            acc[sale.purchase][sale.material] = (acc[sale.purchase][sale.material] || 0) + netwt;
            return acc;
        }, {} as Record<string, Record<string, number>>);
    }, [filteredSalesData]);

    const customerTotalSales = useMemo(() => {
        if (!filteredSalesData.length) return {};
        return filteredSalesData.reduce((acc, sale) => {
            const customer = sale.customer || sale.site; // Use customer field, fallback to site
            const netwt = Number(sale.netwt) || 0;
            acc[customer] = (acc[customer] || 0) + netwt;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredSalesData]);

    const transporterTrips = useMemo(() => {
        if (!filteredSalesData.length) return {};
        return filteredSalesData.reduce((acc, sale) => {
            acc[sale.transporter] = (acc[sale.transporter] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredSalesData]);

    const vehicleSaleAmounts = useMemo(() => {
        if (!filteredSalesData.length) return {};
        return filteredSalesData.reduce((acc, sale) => {
            const netwt = Number(sale.netwt) || 0;
            const rent = Number(sale.rent) || 0;
            const amount = (netwt / 1000) * rent;
            acc[sale.vehicleNumber] = (acc[sale.vehicleNumber] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredSalesData]);

    const vehicleDieselAmount = useMemo(() => {
        if (!filteredDieselData.length) return {};
        return filteredDieselData.reduce((acc, diesel) => {
            const amount = Number(diesel.amount) || 0;
            acc[diesel.vehicleNumber] = (acc[diesel.vehicleNumber] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredDieselData]);

    const vehicleDieselLiters = useMemo(() => {
        if (!filteredDieselData.length) return {};
        return filteredDieselData.reduce((acc, diesel) => {
            const liters = Number(diesel.liters) || 0;
            acc[diesel.vehicleNumber] = (acc[diesel.vehicleNumber] || 0) + liters;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredDieselData]);
    
    const totalDieselLiters = useMemo(() => {
        if (!filteredDieselData.length) return 0;
        return filteredDieselData.reduce((total, entry) => total + (Number(entry.liters) || 0), 0);
    }, [filteredDieselData]);

    const pumpDieselLiters = useMemo(() => {
        if (!filteredDieselData.length) return {};
        return filteredDieselData.reduce((acc, diesel) => {
            const liters = Number(diesel.liters) || 0;
            acc[diesel.pump] = (acc[diesel.pump] || 0) + liters;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredDieselData]);

    const vehicleNetRevenue = useMemo(() => {
        const allVehicles = new Set([
            ...Object.keys(vehicleSaleAmounts),
            ...Object.keys(vehicleDieselAmount)
        ]);
        
        const revenue = {} as Record<string, number>;

        for (const vehicle of allVehicles) {
            const saleAmount = vehicleSaleAmounts[vehicle] || 0;
            const dieselCost = vehicleDieselAmount[vehicle] || 0;
            revenue[vehicle] = saleAmount - dieselCost;
        }

        return revenue;
    }, [vehicleSaleAmounts, vehicleDieselAmount]);


    if (error) {
        return (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dashboard Error</AlertTitle>
            <AlertDescription>
              <p>Could not fetch data. This is likely due to a Supabase connection issue.</p>
              <pre className="mt-2 bg-muted/50 p-2 rounded-md font-mono text-xs text-destructive-foreground">{error}</pre>
            </AlertDescription>
          </Alert>
        );
    }
    
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Card className="max-w-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Filter Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-auto flex-1 justify-start text-left font-normal",
                                    !fromDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {fromDate ? format(fromDate, "PPP") : <span>From date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={fromDate}
                                    onSelect={setFromDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-auto flex-1 justify-start text-left font-normal",
                                    !toDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {toDate ? format(toDate, "PPP") : <span>To date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={toDate}
                                    onSelect={setToDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <Button onClick={() => { setFromDate(undefined); setToDate(undefined); }} variant="secondary">Clear</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck /> Vehicle Trips</CardTitle>
                        <CardDescription>From sales entries</CardDescription>
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
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Transporter Trips</CardTitle>
                         <CardDescription>From sales entries</CardDescription>
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
                        <CardTitle className="flex items-center gap-2"><Package /> Vehicle Sale Revenue</CardTitle>
                        <CardDescription>(Net Weight / 1000) * Rent</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleSaleAmounts).map(([vehicle, amount]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{amount.toFixed(2)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><IndianRupee /> Vehicle Diesel Cost</CardTitle>
                        <CardDescription>Total amount spent</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleDieselAmount).map(([vehicle, amount]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{amount.toFixed(2)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Droplets /> Vehicle Diesel Liters</CardTitle>
                        <CardDescription>Total liters consumed</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Liters</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleDieselLiters).map(([vehicle, liters]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{liters.toFixed(2)} L</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building /> Pump-wise Diesel Liters</CardTitle>
                        <CardDescription>Total liters from each pump</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Pump</TableHead><TableHead className="text-right">Liters</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(pumpDieselLiters).map(([pump, liters]) => (
                                    <TableRow key={pump}><TableCell>{pump}</TableCell><TableCell className="text-right">{liters.toFixed(2)} L</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><HandCoins /> Vehicle Net Revenue</CardTitle>
                        <CardDescription>Sale Revenue - Diesel Cost</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Net (₹)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(vehicleNetRevenue).map(([vehicle, amount]) => (
                                    <TableRow key={vehicle}><TableCell>{vehicle}</TableCell><TableCell className="text-right">{amount.toFixed(2)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><Fuel />Total Diesel</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDieselLiters.toFixed(2)} L</div>
                        <p className="text-xs text-muted-foreground">
                            Total diesel consumed across all vehicles
                        </p>
                    </CardContent>
                 </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building /> Material Purchase by Party</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto max-h-96">
                        <div className="space-y-4">
                            {Object.entries(purchaseMaterials).map(([purchase, materials]) => (
                                <Card key={purchase} className="bg-muted/50">
                                    <CardHeader><CardTitle className="text-lg">{purchase}</CardTitle></CardHeader>
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
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Briefcase /> Customer Material Sales</CardTitle>
                        <CardDescription>Total net weight of material sold to each customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead className="text-right">Total Net Weight (KG)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {Object.entries(customerTotalSales).map(([customer, totalNetWt]) => (
                                    <TableRow key={customer}><TableCell>{customer}</TableCell><TableCell className="text-right">{totalNetWt.toFixed(2)}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    

    



    


    