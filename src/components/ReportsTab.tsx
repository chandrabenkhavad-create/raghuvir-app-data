"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readFromLocalStore } from "@/ai/flows/local-store-flow";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

interface SaleEntry {
  dcno: string;
  date: string;
  time: string;
  name: string;
  supplier: string;
  grosswt: string;
  tarewt: string;
  netwt: string;
  driver: string;
  site: string;
  remarks?: string;
}

interface DieselEntry {
  date: string;
  time: string;
  vehicleNumber: string;
  liters: string;
  rate: string;
  amount: string;
  driverName: string;
  pump: string;
  odo: string;
}

export function ReportsTab() {
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [diesel, setDiesel] = useState<DieselEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [salesData, dieselData] = await Promise.all([
        readFromLocalStore("sales"),
        readFromLocalStore("diesel"),
      ]);

      if (salesData) {
        setSales(salesData);
      }

      if (dieselData) {
        setDiesel(dieselData);
      }
    } catch (e) {
      const error = e as Error;
      console.error("Failed to fetch local data:", error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || "Failed to fetch data from local storage.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = (data: (SaleEntry | DieselEntry)[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...data.map((row) =>
          headers.map((header) => (row as any)[header]).join(",")
        ),
      ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
         {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>
              All sale entries from the local file.
            </CardDescription>
          </div>
          <Button
            onClick={() => downloadCSV(sales, "sales_report.csv")}
            disabled={sales.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading sales data...</p>
          ) : sales.length === 0 ? (
             <p>No sales data found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DC No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Net Weight</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Site</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.dcno}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.netwt} KG</TableCell>
                    <TableCell>{entry.driver}</TableCell>
                    <TableCell>{entry.site}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Diesel Report</CardTitle>
            <CardDescription>
              All diesel entries from the local file.
            </CardDescription>
          </div>
          <Button
            onClick={() => downloadCSV(diesel, "diesel_report.csv")}
            disabled={diesel.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading diesel data...</p>
          ) : diesel.length === 0 ? (
            <p>No diesel data found.</p>
          ): (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Vehicle No.</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pump</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diesel.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.vehicleNumber}</TableCell>
                    <TableCell>{entry.liters}</TableCell>
                    <TableCell>₹{entry.amount}</TableCell>
                    <TableCell>{entry.driverName}</TableCell>
                    <TableCell>{entry.pump}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
