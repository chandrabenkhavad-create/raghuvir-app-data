"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fuel, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PrintDieselRecord } from '@/components/PrintDieselRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { appendToSheet } from '@/ai/flows/sheet-flow';

const dieselSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  liters: z.coerce.number().positive('Liters must be a positive number'),
  rate: z.coerce.number().positive('Rate must be a positive number'),
  amount: z.coerce.number().positive(),
  driverName: z.string().min(1, 'Driver name is required'),
  pump: z.string().min(1, 'Pump name is required'),
  odo: z.coerce.number().int().positive('ODO reading must be a positive number'),
});

type DieselFormValues = z.infer<typeof dieselSchema>;
type DieselEntry = DieselFormValues & { 
  id: number;
  date: string;
  time: string;
};

export const DieselForm: FC = () => {
  const [entries, setEntries] = useState<DieselEntry[]>([]);
  const [entryToPrint, setEntryToPrint] = useState<DieselEntry | null>(null);
  const { toast } = useToast();

  const form = useForm<DieselFormValues>({
    resolver: zodResolver(dieselSchema),
    defaultValues: {
      vehicleNumber: '',
      liters: 0,
      rate: 0,
      amount: 0,
      driverName: '',
      pump: '',
      odo: 0,
    },
  });

  const liters = form.watch('liters');
  const rate = form.watch('rate');

  useEffect(() => {
    const calculatedAmount = (liters || 0) * (rate || 0);
    form.setValue('amount', parseFloat(calculatedAmount.toFixed(2)));
  }, [liters, rate, form]);

  const onSubmit: SubmitHandler<DieselFormValues> = async (data) => {
    const now = new Date();
    const newEntry = { 
      ...data, 
      id: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };
    
    try {
      await appendToSheet({
        range: 'Diesel!A1', 
        values: [
          [
            newEntry.date,
            newEntry.time,
            newEntry.vehicleNumber,
            newEntry.liters,
            newEntry.rate,
            newEntry.amount,
            newEntry.driverName,
            newEntry.pump,
            newEntry.odo,
          ],
        ],
      });

      setEntries((prev) => [newEntry, ...prev]);
      setEntryToPrint(newEntry);
      form.reset({
        vehicleNumber: '',
        liters: 0,
        rate: 0,
        amount: 0,
        driverName: '',
        pump: '',
        odo: 0,
      });
      toast({
        title: 'Success!',
        description: 'Diesel entry has been saved to Google Sheets.',
      });
    } catch (error) {
      console.error('Failed to save to Google Sheet:', error);
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: (error as Error).message || 'Failed to save entry to Google Sheets. Please check credentials and configuration.',
      });
    }
  };

  const handlePrint = () => {
    const printableContent = document.getElementById('printable-diesel-content');
    if (!printableContent) return;

    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printableContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };
  
  const openPrintDialog = (entry: DieselEntry) => {
    setEntryToPrint(entry);
  };

  return (
    <Dialog>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel /> Diesel Entry
          </CardTitle>
          <CardDescription>Enter the details of the diesel purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MH12-AB1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liters</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20.5" {...field} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 95.50" {...field} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pump"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pump</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., City Fuel Station" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-1">
                      <FormLabel>ODO Meter Reading</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 125000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">Submit Entry</Button>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!entries.some(e => e.id === entryToPrint?.id)}
                    onClick={() => openPrintDialog(entries[0])}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Last Entry
                  </Button>
                </DialogTrigger>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Diesel Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle No.</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pump</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.vehicleNumber}</TableCell>
                    <TableCell>{entry.liters.toFixed(2)}</TableCell>
                    <TableCell>₹{entry.amount.toFixed(2)}</TableCell>
                    <TableCell>{entry.driverName}</TableCell>
                    <TableCell>{entry.pump}</TableCell>
                    <TableCell className="text-right">
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPrintDialog(entry)}
                        >
                          <Printer className="h-4 w-4" />
                          <span className="sr-only">Print</span>
                        </Button>
                      </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
       <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Print Preview</DialogTitle>
            <DialogDescription>
              This is a preview of the diesel record to be printed.
            </DialogDescription>
          </DialogHeader>
          <div id="printable-diesel-content">
             <PrintDieselRecord data={entryToPrint} />
          </div>
          <DialogFooter>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
