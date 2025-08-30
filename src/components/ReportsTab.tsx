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
import { readSheet } from "@/ai/flows/read-sheet-flow";
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

  async function fetchSheetData() {
    setLoading(true);
    setError(null);
    try {
      const [salesData, dieselData] = await Promise.all([
        readSheet({ range: "Sales!A2:K" }),
        readSheet({ range: "Diesel!A2:I" }),
      ]);

      if (salesData) {
        setSales(
          salesData.map((row) => ({
            dcno: row[0],
            date: row[1],
            time: row[2],
            name: row[3],
            supplier: row[4],
            grosswt: row[5],
            tarewt: row[6],
            netwt: row[7],
            driver: row[8],
            site: row[9],
            remarks: row[10],
          }))
        );
      }

      if (dieselData) {
        setDiesel(
          dieselData.map((row) => ({
            date: row[0],
            time: row[1],
            vehicleNumber: row[2],
            liters: row[3],
            rate: row[4],
            amount: row[5],
            driverName: row[6],
            pump: row[7],
            odo: row[8],
          }))
        );
      }
    } catch (e) {
      const error = e as Error;
      console.error("Failed to fetch sheet data:", error);
      setError(error.message);
      if (!error.message.includes("GOOGLE_SHEETS_CREDENTIALS")) {
        toast({
          variant: "destructive",
          title: "Error!",
          description: error.message || "Failed to fetch data from Google Sheets.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSheetData();
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
  
  if (error && error.includes("GOOGLE_SHEETS_CREDENTIALS")) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
         {error} Please ask the AI assistant to help you set up your Google Sheets credentials.
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
              All sale entries from the Google Sheet.
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
              All diesel entries from the Google Sheet.
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle No.</TableHead>
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
