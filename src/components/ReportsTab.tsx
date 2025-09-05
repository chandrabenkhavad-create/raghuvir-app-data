
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";


export function ReportsTab() {
  
  return (
    <div className="space-y-6">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Reports Not Available</AlertTitle>
        <AlertDescription>
         The reporting feature is not available when using Google Sheets as the data source in this application. Data can be viewed directly in your Google Sheet.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>
              View your sales data in your Google Sheet.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            <p>Data is saved directly to your specified Google Sheet.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Diesel Report</CardTitle>
            <CardDescription>
              View your diesel data in your Google Sheet.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            <p>Data is saved directly to your specified Google Sheet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
