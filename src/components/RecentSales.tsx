
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
import { Printer, Edit, AlertTriangle } from "lucide-react";
import { getRecentSaleEntries } from "@/services/saleService";
import type { SaleEntry } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface RecentSalesProps {
    refreshKey: boolean;
    onPrint: (id: number) => void;
    onEdit: (id: number) => void;
}

export function RecentSales({ refreshKey, onPrint, onEdit }: RecentSalesProps) {
  const [recentSales, setRecentSales] = useState<SaleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const sales = await getRecentSaleEntries(10);
        setRecentSales(sales);
      } catch (e: any) {
        setError(e.message || "Failed to fetch recent sales.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Recent Sales</AlertTitle>
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
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          The last 10 sale entries recorded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{String(sale.dcno).padStart(3, "0")}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>{sale.vehicleNumber}</TableCell>
                  <TableCell>{sale.material}</TableCell>
                  <TableCell>{sale.netwt.toFixed(2)} KG</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onPrint(sale.id)} className="mr-2">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(sale.id)}>
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
  );
}

    