"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Printer } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PrintRecord } from '@/components/PrintRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const purchaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  grosswt: z.coerce.number().positive('Gross weight must be a positive number'),
  tarewt: z.coerce.number().positive('Tare weight must be a positive number'),
  netwt: z.coerce.number().positive('Net weight must be positive'),
  driver: z.string().min(1, 'Driver is required'),
  site: z.string().min(1, 'Site is required'),
  remarks: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;
type PurchaseEntry = PurchaseFormValues & { 
  id: number;
  dcno: string;
  date: string;
  time: string;
};

export const PurchaseForm: FC = () => {
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [entryToPrint, setEntryToPrint] = useState<PurchaseEntry | null>(null);
  const { toast } = useToast();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      name: '',
      supplier: '',
      driver: '',
      site: '',
      remarks: '',
      grosswt: 0,
      tarewt: 0,
      netwt: 0,
    },
  });

  const grosswt = form.watch('grosswt');
  const tarewt = form.watch('tarewt');

  useEffect(() => {
    const net = (grosswt || 0) - (tarewt || 0);
    form.setValue('netwt', parseFloat(net.toFixed(2)));
  }, [grosswt, tarewt, form]);

  const onSubmit: SubmitHandler<PurchaseFormValues> = (data) => {
    const now = new Date();
    const newEntry: PurchaseEntry = { 
      ...data, 
      id: now.getTime(),
      dcno: `DC-${now.getTime()}`,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setEntryToPrint(newEntry);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Purchase entry has been saved.',
    });
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
  
  const openPrintDialog = (entry: PurchaseEntry) => {
    setEntryToPrint(entry);
  };

  return (
    <>
      <Dialog>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package /> Purchase Entry
            </CardTitle>
            <CardDescription>Enter the details of the new purchase.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cement Bags" {...field} />
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
                        <FormLabel>Supplier</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ABC Suppliers" {...field} />
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
                        <FormLabel>Driver</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grosswt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Weight</FormLabel>
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
                        <FormLabel>Tare Weight</FormLabel>
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
                        <FormLabel>Net Weight</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="site"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Site</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Construction Site" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes..." {...field} />
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

      {entries.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Purchase Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DC No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Net Weight</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.dcno}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.netwt} KG</TableCell>
                    <TableCell>{entry.driver}</TableCell>
                    <TableCell>{entry.site}</TableCell>
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
    </>
  );
};
