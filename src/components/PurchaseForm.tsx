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
  const [lastEntry, setLastEntry] = useState<PurchaseEntry | null>(null);
  const { toast } = useToast();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      name: '',
      supplier: '',
      driver: '',
      site: '',
      remarks: '',
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
    setLastEntry(newEntry);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Purchase entry has been saved.',
    });
  };

  const handlePrint = () => {
    if (!lastEntry) return;
  
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
      const printContent = ReactDOMServer.renderToString(
        <PrintRecord data={lastEntry} />
      );
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${printContent}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  disabled={!lastEntry}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Last Entry
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <div className="print-area hidden">
        <PrintRecord data={lastEntry} />
      </div>
    </>
  );
};
