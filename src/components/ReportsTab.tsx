
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Download, AlertTriangle, Calendar as CalendarIcon, Edit, Printer, Search, Truck, Building2 } from "lucide-react";
import { getAllSaleEntries } from "@/services/saleService";
import { getAllDieselEntries } from "@/services/dieselService";
import type { SaleEntry, DieselEntry } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


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

  // Filters
  const [salesFromDate, setSalesFromDate] = useState<Date | undefined>();
  const [salesToDate, setSalesToDate] = useState<Date | undefined>();
  const [dieselFromDate, setDieselFromDate] = useState<Date | undefined>();
  const [dieselToDate, setDieselToDate] = useState<Date | undefined>();
  const [purchaseFromDate, setPurchaseFromDate] = useState<Date | undefined>();
  const [purchaseToDate, setPurchaseToDate] = useState<Date | undefined>();
  
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

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

  const allVehicleNumbers = useMemo(() => {
      const salesVehicles = salesData.map(s => s.vehicleNumber);
      const dieselVehicles = dieselData.map(d => d.vehicleNumber);
      return [...new Set([...salesVehicles, ...dieselVehicles])].sort();
  }, [salesData, dieselData]);

  const filteredSalesData = useMemo(() => {
    return salesData.filter(sale => {
      // Date filtering
      if (salesFromDate || salesToDate) {
        const saleDate = parseDate(sale.date);
        const start = salesFromDate ? new Date(salesFromDate.setHours(0, 0, 0, 0)) : null;
        const end = salesToDate ? new Date(salesToDate.setHours(23, 59, 59, 999)) : null;
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
      }
      // DC No search
      if (salesSearchTerm && !String(sale.dcno).includes(salesSearchTerm)) {
        return false;
      }
      return true;
    });
  }, [salesData, salesFromDate, salesToDate, salesSearchTerm]);
  
  const filteredDieselData = useMemo(() => {
     return dieselData.filter(diesel => {
        if (dieselFromDate || dieselToDate) {
            const dieselDate = parseDate(diesel.date);
            const start = dieselFromDate ? new Date(dieselFromDate.setHours(0, 0, 0, 0)) : null;
            const end = dieselToDate ? new Date(dieselToDate.setHours(23, 59, 59, 999)) : null;
            if (start && dieselDate < start) return false;
            if (end && dieselDate > end) return false;
        }
        return true;
     });
  }, [dieselData, dieselFromDate, dieselToDate]);
  
  const vehicleFilteredSales = useMemo(() => {
      if (!selectedVehicle) return [];
      return salesData.filter(sale => sale.vehicleNumber === selectedVehicle);
  }, [salesData, selectedVehicle]);

  const vehicleFilteredDiesel = useMemo(() => {
      if (!selectedVehicle) return [];
      return dieselData.filter(diesel => diesel.vehicleNumber === selectedVehicle);
  }, [dieselData, selectedVehicle]);

  const purchaseMaterials = useMemo(() => {
    const filteredData = salesData.filter(sale => {
       if (purchaseFromDate || purchaseToDate) {
        const saleDate = parseDate(sale.date);
        const start = purchaseFromDate ? new Date(purchaseFromDate.setHours(0, 0, 0, 0)) : null;
        const end = purchaseToDate ? new Date(purchaseToDate.setHours(23, 59, 59, 999)) : null;
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
      }
      return true;
    });

    return filteredData.reduce((acc, sale) => {
        if (!acc[sale.purchase]) {
            acc[sale.purchase] = {};
        }
        const netwt = Number(sale.netwt) || 0;
        acc[sale.purchase][sale.material] = (acc[sale.purchase][sale.material] || 0) + netwt;
        return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [salesData, purchaseFromDate, purchaseToDate]);


  const downloadCSV = (data: any[], filename: string, headers?: string[]) => {
    if (!data.length) return;
    const allHeaders = headers || Object.keys(data[0]);
    const csvRows = data.map(row => 
        allHeaders.map(header => {
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

    const csvContent = "data:text/csv;charset=utf-8," + [allHeaders.join(","), ...csvRows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadPurchaseReportCSV = () => {
    const dataForCsv: { party: string; material: string; total_net_weight_kg: number }[] = [];
    Object.entries(purchaseMaterials).forEach(([party, materials]) => {
      Object.entries(materials).forEach(([material, netwt]) => {
        dataForCsv.push({
          party,
          material,
          total_net_weight_kg: parseFloat(netwt.toFixed(2)),
        });
      });
    });
    downloadCSV(dataForCsv, 'party_wise_purchase_report');
  };

  const salesHeaders = [
    "id", "dcno", "date", "time", "material", "purchase", "customer",
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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="sales">Sales Report</TabsTrigger>
        <TabsTrigger value="diesel">Diesel Report</TabsTrigger>
        <TabsTrigger value="vehicle">Vehicle Wise Report</TabsTrigger>
        <TabsTrigger value="purchase">Purchase Report</TabsTrigger>
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
                 <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by DC No..."
                        value={salesSearchTerm}
                        onChange={(e) => setSalesSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-auto"
                    />
                 </div>
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
                    onClick={() => downloadCSV(filteredSalesData, "sales_report", salesHeaders)}
                    disabled={loading || filteredSalesData.length === 0}
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
                  {filteredSalesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{String(sale.dcno).padStart(3, "0")}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.vehicleNumber}</TableCell>
                      <TableCell>{sale.material}</TableCell>
                      <TableCell>{sale.customer || sale.site}</TableCell>
                      <TableCell>{Number(sale.netwt).toFixed(2)} KG</TableCell>
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
                  onClick={() => downloadCSV(filteredDieselData, "diesel_report", dieselHeaders)}
                  disabled={loading || filteredDieselData.length === 0}
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
                  {filteredDieselData.map((diesel) => (
                    <TableRow key={diesel.id}>
                      <TableCell>{diesel.date}</TableCell>
                      <TableCell>{diesel.vehicleNumber}</TableCell>
                      <TableCell>{Number(diesel.liters).toFixed(2)} L</TableCell>
                      <TableCell>₹{Number(diesel.amount).toFixed(2)}</TableCell>
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
      <TabsContent value="vehicle">
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Wise Report</CardTitle>
                <CardDescription>Select a vehicle to see its sales and diesel history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="max-w-xs">
                    <Select onValueChange={setSelectedVehicle} value={selectedVehicle || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder={<div className="flex items-center gap-2"><Truck/>Select a vehicle</div>} />
                        </SelectTrigger>
                        <SelectContent>
                             {allVehicleNumbers.map(vehicle => (
                                <SelectItem key={vehicle} value={vehicle}>{vehicle}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedVehicle && (
                    <div className="space-y-8">
                        {/* Sales Table */}
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Sales Entries</h3>
                                <Button
                                    onClick={() => downloadCSV(vehicleFilteredSales, `${selectedVehicle}_sales_report`, salesHeaders)}
                                    disabled={loading || vehicleFilteredSales.length === 0}
                                >
                                    <Download className="mr-2" /> Download Sales CSV
                                </Button>
                             </div>
                             {loading ? <Skeleton className="h-20 w-full" /> : (
                                vehicleFilteredSales.length > 0 ? (
                                     <Table>
                                        <TableHeader>
                                        <TableRow>
                                            <TableHead>DC No.</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Net Weight</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {vehicleFilteredSales.map((sale) => (
                                            <TableRow key={sale.id}>
                                            <TableCell>{String(sale.dcno).padStart(3, "0")}</TableCell>
                                            <TableCell>{sale.date}</TableCell>
                                            <TableCell>{sale.material}</TableCell>
                                            <TableCell>{Number(sale.netwt).toFixed(2)} KG</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                 <Button variant="outline" size="sm" onClick={() => onPrintSale(sale)}><Printer className="mr-2 h-4 w-4" />Print</Button>
                                                 <Button variant="outline" size="sm" onClick={() => onEditSale(sale)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                            </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                ) : <p className="text-muted-foreground">No sales entries found for this vehicle.</p>
                             )}
                        </div>
                        {/* Diesel Table */}
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Diesel Entries</h3>
                                <Button
                                    onClick={() => downloadCSV(vehicleFilteredDiesel, `${selectedVehicle}_diesel_report`, dieselHeaders)}
                                    disabled={loading || vehicleFilteredDiesel.length === 0}
                                >
                                    <Download className="mr-2" /> Download Diesel CSV
                                </Button>
                             </div>
                              {loading ? <Skeleton className="h-20 w-full" /> : (
                                vehicleFilteredDiesel.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Liters</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Pump</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {vehicleFilteredDiesel.map((diesel) => (
                                            <TableRow key={diesel.id}>
                                                <TableCell>{diesel.date}</TableCell>
                                                <TableCell>{Number(diesel.liters).toFixed(2)} L</TableCell>
                                                <TableCell>₹{Number(diesel.amount).toFixed(2)}</TableCell>
                                                <TableCell>{diesel.pump}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => onPrintDiesel(diesel)}><Printer className="mr-2 h-4 w-4" />Print</Button>
                                                    <Button variant="outline" size="sm" onClick={() => onEditDiesel(diesel)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                ) : <p className="text-muted-foreground">No diesel entries found for this vehicle.</p>
                              )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="purchase">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Party-wise Purchase Report</CardTitle>
                <CardDescription>Material purchased from each party.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !purchaseFromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {purchaseFromDate ? format(purchaseFromDate, "PPP") : <span>From date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={purchaseFromDate}
                        onSelect={setPurchaseFromDate}
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
                          !purchaseToDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {purchaseToDate ? format(purchaseToDate, "PPP") : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={purchaseToDate}
                        onSelect={setPurchaseToDate}
                        initialFocus
                      />
                    </PopoverContent>
                </Popover>
                <Button
                    onClick={downloadPurchaseReportCSV}
                    disabled={loading || Object.keys(purchaseMaterials).length === 0}
                    className="w-full sm:w-auto"
                >
                    <Download className="mr-2" /> Download CSV
                </Button>
            </div>
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
             ) : (
                <div className="space-y-4">
                    {Object.entries(purchaseMaterials).length > 0 ? (
                        Object.entries(purchaseMaterials).map(([purchase, materials]) => (
                            <Card key={purchase} className="bg-muted/50">
                                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5" />{purchase}</CardTitle></CardHeader>
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
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No purchase data found for the selected criteria.</p>
                    )}
                </div>
             )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

    

    