
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Download, AlertTriangle } from "lucide-react";
import { getAllSaleEntries } from "@/services/saleService";
import { getAllDieselEntries } from "@/services/dieselService";
import type { SaleEntry, DieselEntry } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


export function ReportsTab() {
  const [salesData, setSalesData] = useState<SaleEntry[]>([]);
  const [dieselData, setDieselData] = useState<DieselEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(e.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...data.map((row) =>
          headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salesHeaders = [
    "id", "dcno", "date", "time", "name", "material", "supplier",
    "transporter", "grosswt", "tarewt", "netwt", "rent", "driver",
    "site", "remarks", "vehicleNumber", "created_at"
  ];
  
  const dieselHeaders = [
      "id", "date", "time", "vehicleNumber", "liters", "rate", 
      "amount", "driverName", "pump", "odo", "created_at"
  ];

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Reports Error</AlertTitle>
        <AlertDescription>
          <p>Could not fetch report data. This is likely due to a Supabase connection issue.</p>
          <pre className="mt-2 bg-muted/50 p-2 rounded-md font-mono text-xs text-destructive-foreground">{error}</pre>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="sales">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sales">Sales Report</TabsTrigger>
        <TabsTrigger value="diesel">Diesel Report</TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                A complete log of all sales entries.
              </CardDescription>
            </div>
            <Button
              onClick={() => downloadCSV(salesData, "sales_report", salesHeaders)}
              disabled={loading || salesData.length === 0}
            >
              <Download className="mr-2" /> Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DC No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Net Weight</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{String(sale.dcno).padStart(3, "0")}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.vehicleNumber}</TableCell>
                      <TableCell>{sale.material}</TableCell>
                      <TableCell>{sale.netwt.toFixed(2)} KG</TableCell>
                      <TableCell>{sale.supplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="diesel">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Diesel Report</CardTitle>
              <CardDescription>
                A complete log of all diesel entries.
              </CardDescription>
            </div>
            <Button
              onClick={() => downloadCSV(dieselData, "diesel_report", dieselHeaders)}
              disabled={loading || dieselData.length === 0}
            >
              <Download className="mr-2" /> Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Liters</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Pump</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dieselData.map((diesel) => (
                    <TableRow key={diesel.id}>
                      <TableCell>{diesel.date}</TableCell>
                      <TableCell>{diesel.vehicleNumber}</TableCell>
                      <TableCell>{diesel.liters.toFixed(2)} L</TableCell>
                      <TableCell>₹{diesel.amount.toFixed(2)}</TableCell>
                      <TableCell>{diesel.driverName}</TableCell>
                      <TableCell>{diesel.pump}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

    