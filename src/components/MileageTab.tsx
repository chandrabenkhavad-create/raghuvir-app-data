
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getAllDieselEntries } from '@/services/dieselService';
import type { DieselEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function MileageTab() {
    const [dieselData, setDieselData] = useState<DieselEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const diesel = await getAllDieselEntries();
                setDieselData(diesel.sort((a, b) => a.id - b.id)); // Sort oldest to newest
            } catch (e: any) {
                setError(e.message || "Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const allVehicleNumbers = useMemo(() => {
      return [...new Set(dieselData.map(d => d.vehicleNumber))].sort();
    }, [dieselData]);

    const mileageReport = useMemo(() => {
        if (!selectedVehicle) return [];

        const vehicleEntries = dieselData.filter(entry => entry.vehicleNumber === selectedVehicle);
        if (vehicleEntries.length < 2) return [];

        const report: {
            id: number;
            date: string;
            startOdo: number;
            endOdo: number;
            distance: number;
            liters: number;
            mileage: number;
        }[] = [];

        for (let i = 1; i < vehicleEntries.length; i++) {
            const previousEntry = vehicleEntries[i-1];
            const currentEntry = vehicleEntries[i];
            
            const distance = currentEntry.odo - previousEntry.odo;
            const liters = currentEntry.liters;

            // Only calculate if distance is positive
            if (distance > 0 && liters > 0) {
                report.push({
                    id: currentEntry.id,
                    date: currentEntry.date,
                    startOdo: previousEntry.odo,
                    endOdo: currentEntry.odo,
                    distance: distance,
                    liters: liters,
                    mileage: distance / liters,
                });
            }
        }
        // Return in reverse chronological order
        return report.reverse();

    }, [dieselData, selectedVehicle]);


    if (error) {
        return (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Mileage Report Error</AlertTitle>
            <AlertDescription>
              <p>Could not fetch data. This is likely due to a Supabase connection issue.</p>
              <pre className="mt-2 bg-muted/50 p-2 rounded-md font-mono text-xs text-destructive-foreground">{error}</pre>
            </AlertDescription>
          </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Mileage Report</CardTitle>
                <CardDescription>Select a vehicle to see its mileage between each diesel refill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="max-w-xs">
                    <Select onValueChange={setSelectedVehicle} value={selectedVehicle || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder={<div className="flex items-center gap-2"><Truck/>Select a vehicle</div>} />
                        </SelectTrigger>
                        <SelectContent>
                             {loading ? <SelectItem value="loading" disabled>Loading vehicles...</SelectItem> : allVehicleNumbers.map(vehicle => (
                                <SelectItem key={vehicle} value={vehicle}>{vehicle}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading && <Skeleton className="h-40 w-full" />}

                {!loading && selectedVehicle && (
                    mileageReport.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Start ODO</TableHead>
                                    <TableHead>End ODO</TableHead>
                                    <TableHead>Distance (km)</TableHead>
                                    <TableHead>Liters Filled</TableHead>
                                    <TableHead className="font-bold text-right">Mileage (km/L)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mileageReport.map(report => (
                                    <TableRow key={report.id}>
                                        <TableCell>{report.date}</TableCell>
                                        <TableCell>{report.startOdo}</TableCell>
                                        <TableCell>{report.endOdo}</TableCell>
                                        <TableCell>{report.distance.toFixed(2)}</TableCell>
                                        <TableCell>{report.liters.toFixed(2)}</TableCell>
                                        <TableCell className="font-bold text-right">{report.mileage.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">
                                Not enough data to generate a mileage report for this vehicle.
                            </p>
                            <p className="text-sm text-muted-foreground/80">
                                At least two diesel entries are required.
                            </p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
