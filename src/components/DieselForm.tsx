
"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Fuel, 
  Printer, 
  Save, 
  Car, 
  Droplets, 
  Tag, 
  IndianRupee, 
  User, 
  Building, 
  Gauge
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PrintDieselRecord } from '@/components/PrintDieselRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import type { DieselEntry } from '@/types';
import { addDieselEntry } from '@/services/dieselService';

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

export const DieselForm: FC = () => {
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
    const newEntryData: Omit<DieselEntry, 'id' | 'created_at'> = { 
      ...data, 
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString(),
    };
    
    try {
      const savedEntry = await addDieselEntry(newEntryData);
      setEntryToPrint(savedEntry);
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
        description: 'Diesel entry has been saved.',
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: (error as Error).message || 'Failed to save entry.',
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
  
  const openPrintDialog = () => {
    // This is triggered by the button, we just need the dialog to open.
    // The entryToPrint state is already set on form submission.
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
                      <FormLabel className="flex items-center gap-2"><Car /> Vehicle Number</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><Droplets /> Liters</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><Tag /> Rate</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><IndianRupee /> Amount</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><User /> Driver Name</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><Building /> Pump</FormLabel>
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
                      <FormLabel className="flex items-center gap-2"><Gauge /> ODO Meter Reading</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 125000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit"><Save className="mr-2 h-4 w-4" />Submit Entry</Button>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!entryToPrint}
                    onClick={openPrintDialog}
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
