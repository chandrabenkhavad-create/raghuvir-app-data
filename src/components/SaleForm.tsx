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
  IndianRupee
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PrintRecord } from '@/components/PrintRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { appendToLocalStore, readFromLocalStore } from '@/ai/flows/local-store-flow';

const saleSchema = z.object({
  dcno: z.coerce.number(),
  material: z.string().min(1, 'Material is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  transporter: z.string().min(1, 'Transporter is required'),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  grosswt: z.coerce.number().positive('Gross weight must be a positive number'),
  tarewt: z.coerce.number().positive('Tare weight must be a positive number'),
  netwt: z.coerce.number().positive('Net weight must be positive'),
  rent: z.coerce.number().min(0, 'Rent must be a positive number'),
  driver: z.string().min(1, 'Driver is required'),
  site: z.string().min(1, 'Site is required'),
  remarks: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;
type SaleEntry = SaleFormValues & { 
  id: number;
  date: string;
  time: string;
};

export const SaleForm: FC = () => {
  const [entries, setEntries] = useState<SaleEntry[]>([]);
  const [entryToPrint, setEntryToPrint] = useState<SaleEntry | null>(null);
  const { toast } = useToast();
  const [nextDcNo, setNextDcNo] = useState(1);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      dcno: nextDcNo,
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
    },
  });

  useEffect(() => {
    async function fetchEntries() {
      try {
        const data: SaleEntry[] = await readFromLocalStore('sales');
        setEntries(data);
        if (data.length > 0) {
          setEntryToPrint(data[0]);
          // DC numbers are now numeric
          const lastEntry = data[0];
          const lastDcNum = lastEntry.dcno;
          const newDcNo = lastDcNum + 1;
          setNextDcNo(newDcNo);
          form.setValue('dcno', newDcNo);
        } else {
          setNextDcNo(1);
          form.setValue('dcno', 1);
        }
      } catch (error) {
        console.error('Failed to load sales entries:', error);
        toast({
          variant: 'destructive',
          title: 'Error!',
          description: 'Failed to load recent sales entries.',
        });
      }
    }
    fetchEntries();
  }, [toast, form]);

  const grosswt = form.watch('grosswt');
  const tarewt = form.watch('tarewt');

  useEffect(() => {
    const net = (grosswt || 0) - (tarewt || 0);
    form.setValue('netwt', parseFloat(net.toFixed(2)));
  }, [grosswt, tarewt, form]);

  useEffect(() => {
    form.setValue('dcno', nextDcNo);
  }, [nextDcNo, form]);

  const onSubmit: SubmitHandler<SaleFormValues> = async (data) => {
    const now = new Date();
    const newEntry: SaleEntry = { 
      ...data,
      dcno: nextDcNo,
      id: now.getTime(),
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString(),
    };

    try {
      await appendToLocalStore({
        storeName: 'sales',
        data: newEntry,
      });
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      setEntryToPrint(newEntry);

      const newDcNo = nextDcNo + 1;
      setNextDcNo(newDcNo);
      
      form.reset({
        dcno: newDcNo,
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
      });
      toast({
        title: 'Success!',
        description: 'Sale entry has been saved locally.',
      });
    } catch (error) {
       console.error('Failed to save to local file:', error);
       toast({
         variant: 'destructive',
         title: 'Error!',
         description: (error as Error).message || 'Failed to save entry to local file.',
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
  
  const openPrintDialog = (entry: SaleEntry) => {
    setEntryToPrint(entry);
  };

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
              <CardTitle>Recent Sale Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DC No.</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Gross Wt.</TableHead>
                    <TableHead>Tare Wt.</TableHead>
                    <TableHead>Net Wt.</TableHead>
                    <TableHead>Vehicle No.</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{String(entry.dcno).padStart(3, '0')}</TableCell>
                      <TableCell>{entry.material}</TableCell>
                      <TableCell>{entry.supplier}</TableCell>
                      <TableCell>{entry.grosswt} KG</TableCell>
                      <TableCell>{entry.tarewt} KG</TableCell>
                      <TableCell>{entry.netwt} KG</TableCell>
                      <TableCell>{entry.vehicleNumber}</TableCell>
                      <TableCell>{entry.remarks}</TableCell>
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

    
    