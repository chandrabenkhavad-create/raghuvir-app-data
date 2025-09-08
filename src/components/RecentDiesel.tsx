
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
import { getRecentDieselEntries } from "@/services/dieselService";
import type { DieselEntry } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useAuth } from "@/components/AuthProvider";
import { useAppSettings } from "@/hooks/useAppSettings";

interface RecentDieselProps {
    refreshKey: boolean;
    onPrint: (entry: DieselEntry) => void;
    onEdit: (entry: DieselEntry) => void;
}

export function RecentDiesel({ refreshKey, onPrint, onEdit }: RecentDieselProps) {
  const [recentDiesel, setRecentDiesel] = useState<DieselEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { settings } = useAppSettings();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const diesel = await getRecentDieselEntries(10);
        setRecentDiesel(diesel);
      } catch (e: any) {
        setError(e.message || "Failed to fetch recent diesel entries.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);
  
  const canEdit = user?.role === 'admin' || settings.userCanEditEntries;

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Recent Diesel</AlertTitle>
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
        <CardTitle>Recent Diesel Entries</CardTitle>
        <CardDescription>
          The last 10 diesel entries recorded.
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
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Pump</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDiesel.map((diesel) => (
                <TableRow key={diesel.id}>
                  <TableCell>{diesel.date}</TableCell>
                  <TableCell>{diesel.vehicleNumber}</TableCell>
                  <TableCell>{diesel.liters.toFixed(2)} L</TableCell>
                  <TableCell>₹{diesel.amount.toFixed(2)}</TableCell>
                  <TableCell>{diesel.pump}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onPrint(diesel)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(diesel)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                      </Button>
                    )}
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
