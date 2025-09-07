
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { Download, AlertTriangle, Calendar as CalendarIcon, Edit, Printer } from "lucide-react";
import { getAllSaleEntries } from "@/services/saleService";
import { getAllDieselEntries } from "@/services/dieselService";
import type { SaleEntry, DieselEntry } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";

interface ReportsTabProps {
  onEditSale: (entry: SaleEntry) => void;
  onEditDiesel: (entry: DieselEntry) => void;
  onPrintSale: (entry: SaleEntry) => void;
  onPrintDiesel: (entry: DieselEntry) => void;
  refreshKey: boolean;
}

export function ReportsTab({ onEditSale, onEditDiesel, onPrintSale, onPrintDiesel, refreshKey }: ReportsTabProps) {
  const [salesData, setSalesData] = useState<SaleEntry[]>([]);
  const [dieselData, setDieselData] = useState<DieselEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesFromDate, setSalesFromDate] = useState<Date | undefined>();
  const [salesToDate, setSalesToDate] = useState<Date | undefined>();
  const [dieselFromDate, setDieselFromDate] = useState<Date | undefined>();
  const [dieselToDate, setDieselToDate] = useState<Date | undefined>();

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
  }, [refreshKey]);
  
  // Helper to parse DD/MM/YYYY into a Date object
  const parseDate = (dateString: string): Date => {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
  }

  const downloadCSV = (data: any[], filename: string, headers: string[], fromDate?: Date, toDate?: Date) => {
    let filteredData = data;
    
    if (fromDate || toDate) {
        filteredData = data.filter(row => {
            const rowDate = parseDate(row.date);
            const start = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
            const end = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;
            
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
            return true;
        });
    }

    const csvRows = filteredData.map(row => 
        headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                return "";
            }
            let stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                stringValue = `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salesHeaders = [
    "id", "dcno", "date", "time", "material", "supplier", "customer",
    "transporter", "grosswt", "tarewt", "netwt", "rent", "driver",
    "site", "remarks", "vehicleNumber", "royaltyPassNumber", "royaltyWeight", "created_at"
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
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                A complete log of all sales entries.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !salesFromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {salesFromDate ? format(salesFromDate, "PPP") : <span>From date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={salesFromDate}
                        onSelect={setSalesFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !salesToDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {salesToDate ? format(salesToDate, "PPP") : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={salesToDate}
                        onSelect={setSalesToDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
                <Button
                    onClick={() => downloadCSV(salesData, "sales_report", salesHeaders, salesFromDate, salesToDate)}
                    disabled={loading || salesData.length === 0}
                    className="w-full sm:w-auto"
                >
                    <Download className="mr-2" /> Download CSV
                </Button>
            </div>
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Net Weight</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{String(sale.dcno).padStart(3, "0")}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.vehicleNumber}</TableCell>
                      <TableCell>{sale.material}</TableCell>
                      <TableCell>{sale.customer || sale.site}</TableCell>
                      <TableCell>{sale.netwt.toFixed(2)} KG</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onPrintSale(sale)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEditSale(sale)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                      </TableCell>
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
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Diesel Report</CardTitle>
              <CardDescription>
                A complete log of all diesel entries.
              </CardDescription>
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dieselFromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dieselFromDate ? format(dieselFromDate, "PPP") : <span>From date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dieselFromDate}
                        onSelect={setDieselFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dieselToDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dieselToDate ? format(dieselToDate, "PPP") : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dieselToDate}
                        onSelect={setDieselToDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
                <Button
                  onClick={() => downloadCSV(dieselData, "diesel_report", dieselHeaders, dieselFromDate, dieselToDate)}
                  disabled={loading || dieselData.length === 0}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2" /> Download CSV
                </Button>
            </div>
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
                    <TableHead>Pump</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dieselData.map((diesel) => (
                    <TableRow key={diesel.id}>
                      <TableCell>{diesel.date}</TableCell>
                      <TableCell>{diesel.vehicleNumber}</TableCell>
                      <TableCell>{diesel.liters.toFixed(2)} L</TableCell>
                      <TableCell>₹{diesel.amount.toFixed(2)}</TableCell>
                      <TableCell>{diesel.pump}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onPrintDiesel(diesel)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEditDiesel(diesel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                      </TableCell>
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
