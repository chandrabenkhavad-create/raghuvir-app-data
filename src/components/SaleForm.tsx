
"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  Printer, 
  Save, 
  Hash, 
  User, 
  Building, 
  Truck, 
  Warehouse, 
  Weight, 
  Scale, 
  FileText,
  Car,
  IndianRupee,
  Loader2,
  Ticket,
  ScrollText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PrintRecord } from '@/components/PrintRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import type { SaleEntry } from '@/types';
import { addSaleEntry, getLastSaleEntry } from '@/services/saleService';

const saleSchema = z.object({
  dcno: z.coerce.number(),
  name: z.string().min(1, 'Customer name is required'),
  material: z.string().min(1, 'Material is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  transporter: z.string().min(1, 'Transporter is required'),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  grosswt: z.coerce.number().positive('Gross weight must be a positive number'),
  tarewt: z.coerce.number().positive('Tare weight must be a positive number'),
  netwt: z.coerce.number().positive('Net weight must be positive'),
  rent: z.coerce.number().min(0, 'Rent must be a positive number'),
  driver: z.string().min(1, 'Driver is required'),
  royaltyPassNumber: z.string().optional(),
  royaltyWeight: z.coerce.number().optional(),
  site: z.string().min(1, 'Site is required'),
  remarks: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

export const SaleForm: FC = () => {
  const [entryToPrint, setEntryToPrint] = useState<SaleEntry | null>(null);
  const { toast } = useToast();
  const [nextDcNo, setNextDcNo] = useState<number | null>(null);

  useEffect(() => {
    const fetchLastDcNo = async () => {
      try {
        const lastEntry = await getLastSaleEntry();
        if (lastEntry && lastEntry.dcno) {
          setNextDcNo(lastEntry.dcno + 1);
        } else {
          setNextDcNo(1);
        }
      } catch (error) {
        console.error("Failed to fetch last DC number", error);
        toast({
            variant: 'destructive',
            title: 'Error fetching DC Number',
            description: (error as Error).message || 'Could not connect to the database to get the last DC number.'
        })
        setNextDcNo(1); // Start from 1 if fetch fails
      }
    };
    fetchLastDcNo();
  }, []);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    // Default values will be set in useEffect once nextDcNo is fetched
  });
  
  useEffect(() => {
      if (nextDcNo !== null) {
          form.reset({
            dcno: nextDcNo,
            name: '',
            material: '',
            supplier: '',
            transporter: '',
            vehicleNumber: '',
            driver: '',
            site: '',
            remarks: '',
            grosswt: 0,
            tarewt: 0,
            netwt: 0,
            rent: 0,
            royaltyPassNumber: '',
            royaltyWeight: 0,
          });
      }
  }, [nextDcNo, form]);

  const grosswt = form.watch('grosswt');
  const tarewt = form.watch('tarewt');

  useEffect(() => {
    const net = (grosswt || 0) - (tarewt || 0);
    form.setValue('netwt', parseFloat(net.toFixed(2)));
  }, [grosswt, tarewt, form]);

  const onSubmit: SubmitHandler<SaleFormValues> = async (data) => {
    if (nextDcNo === null) {
        toast({ variant: 'destructive', title: 'Error', description: 'DC Number not initialized.' });
        return;
    }
    
    const now = new Date();
    const newEntryData: Omit<SaleEntry, 'id' | 'created_at'> = { 
      ...data,
      dcno: nextDcNo,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString(),
    };

    try {
      const savedEntry = await addSaleEntry(newEntryData);
      
      setEntryToPrint(savedEntry);

      const newDcNo = nextDcNo + 1;
      setNextDcNo(newDcNo);
      
      toast({
        title: 'Success!',
        description: 'Sale entry has been saved.',
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
    const printableContent = document.getElementById('printable-content');
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

  if (nextDcNo === null) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Package /> Sale Entry
                  </CardTitle>
                  <CardDescription>Enter the details of the new sale.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-96">
                   <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading DC Number...</p>
                   </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <>
      <Dialog>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package /> Sale Entry
            </CardTitle>
            <CardDescription>Enter the details of the new sale.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dcno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Hash /> DC No.</FormLabel>
                          <FormControl>
                            <Input type="text" value={String(field.value).padStart(3, '0')} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><User /> Customer</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Customer Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Building /> Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABC Suppliers" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Package /> Material</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Cement Bags" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transporter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Truck /> Transporter</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., XYZ Logistics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="site"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Warehouse /> Site</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Construction Site" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="vehicleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Car /> Vehicle Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MH12AB1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="driver"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><User /> Driver</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="royaltyPassNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Ticket /> Royalty Pass Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., RP12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="royaltyWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><ScrollText /> Royalty Weight</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 1000" {...field} step="0.01"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><IndianRupee /> Rent</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 5000" {...field} step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-4 rounded-lg border p-4">
                       <FormField
                        control={form.control}
                        name="grosswt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Weight /> Gross Weight</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 1000" {...field} step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tarewt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Scale /> Tare Weight</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 50" {...field} step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="netwt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Weight /> Net Weight</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2"><FileText /> Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                 
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
              This is a preview of the record to be printed.
            </DialogDescription>
          </DialogHeader>
          <div id="printable-content">
             <PrintRecord data={entryToPrint} />
          </div>
          <DialogFooter>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
