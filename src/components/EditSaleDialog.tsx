
"use client";

import { useState, useEffect, type FC, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  Printer, 
  Save, 
  User, 
  Building, 
  Truck, 
  Weight, 
  Scale, 
  FileText,
  Car,
  IndianRupee,
  Ticket,
  ScrollText,
  Briefcase
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PrintRecord } from '@/components/PrintRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { SaleEntry } from '@/types';
import { updateSaleEntry, getAllSaleEntries } from '@/services/saleService';

const saleSchema = z.object({
  id: z.number(),
  dcno: z.coerce.number(),
  material: z.string().min(1, 'Material is required'),
  purchase: z.string().min(1, 'Purchase is required'),
  customer: z.string().min(1, 'Customer is required'),
  transporter: z.string().min(1, 'Transporter is required'),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  grosswt: z.coerce.number().positive('Gross weight must be a positive number'),
  tarewt: z.coerce.number().positive('Tare weight must be a positive number'),
  netwt: z.coerce.number().positive('Net weight must be positive'),
  rent: z.coerce.number().min(0, 'Rent must be a positive number'),
  driver: z.string().min(1, 'Driver is required'),
  royaltyPassNumber: z.string().optional(),
  royaltyWeight: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface EditSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleUpdated: () => void;
  saleEntry: SaleEntry;
}

export const EditSaleDialog: FC<EditSaleDialogProps> = ({ isOpen, onClose, onSaleUpdated, saleEntry }) => {
  const { toast } = useToast();
  const [allSales, setAllSales] = useState<SaleEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAllSaleEntries().then(setAllSales);
    }
  }, [isOpen]);

  const suggestionLists = useMemo(() => {
    const purchase = [...new Set(allSales.map(s => s.purchase))];
    const customer = [...new Set(allSales.map(s => s.customer || s.site))];
    const material = [...new Set(allSales.map(s => s.material))];
    const transporter = [...new Set(allSales.map(s => s.transporter))];
    const vehicleNumber = [...new Set(allSales.map(s => s.vehicleNumber))];
    const driver = [...new Set(allSales.map(s => s.driver))];
    return { purchase, customer, material, transporter, vehicleNumber, driver };
  }, [allSales]);


  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
  });

  useEffect(() => {
    if (saleEntry) {
      form.reset({
        ...saleEntry,
        customer: saleEntry.customer || saleEntry.site,
        royaltyWeight: saleEntry.royaltyWeight ?? 0,
      });
    }
  }, [saleEntry, form, isOpen]);

  const grosswt = form.watch('grosswt');
  const tarewt = form.watch('tarewt');

  useEffect(() => {
    const net = (grosswt || 0) - (tarewt || 0);
    form.setValue('netwt', parseFloat(net.toFixed(2)));
  }, [grosswt, tarewt, form]);

  const onSubmit: SubmitHandler<SaleFormValues> = async (data) => {
    try {
      const submissionData = { ...data, site: data.customer };
      await updateSaleEntry(saleEntry.id, submissionData);
      toast({
        title: 'Success!',
        description: 'Sale entry has been updated.',
      });
      onSaleUpdated();
      onClose(); // Close the dialog on successful update
    } catch (error) {
       console.error('Failed to update entry:', error);
       toast({
         variant: 'destructive',
         title: 'Error!',
         description: (error as Error).message || 'Failed to update entry.',
       });
    }
  };

  const handlePrint = () => {
    const printableContent = document.getElementById('printable-edit-content');
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
           <datalist id="edit-purchase-list">
             {suggestionLists.purchase.map(p => <option key={p} value={p} />)}
           </datalist>
           <datalist id="edit-customer-list">
             {suggestionLists.customer.map(c => <option key={c} value={c} />)}
           </datalist>
           <datalist id="edit-material-list">
             {suggestionLists.material.map(m => <option key={m} value={m} />)}
           </datalist>
           <datalist id="edit-transporter-list">
             {suggestionLists.transporter.map(t => <option key={t} value={t} />)}
           </datalist>
           <datalist id="edit-vehicleNumber-list">
             {suggestionLists.vehicleNumber.map(v => <option key={v} value={v} />)}
           </datalist>
           <datalist id="edit-driver-list">
             {suggestionLists.driver.map(d => <option key={d} value={d} />)}
           </datalist>
          <DialogHeader>
            <DialogTitle>Edit Sale Entry (DC No: {String(saleEntry?.dcno).padStart(3, '0')})</DialogTitle>
            <DialogDescription>
              Update the details of this sale entry. Click Update to save changes.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   <div className="space-y-4">
                     <FormField
                      control={form.control}
                      name="purchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Building /> Purchase From</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Self" {...field} list="edit-purchase-list" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="customer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Briefcase /> Customer</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Local Builders" {...field} list="edit-customer-list" />
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
                            <Input placeholder="e.g., 20mm" {...field} list="edit-material-list" />
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
                            <Input placeholder="e.g., Self" {...field} list="edit-transporter-list" />
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
                            <Input placeholder="e.g., MH12AB1234" {...field} list="edit-vehicleNumber-list" />
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
                            <Input placeholder="e.g., John Doe" {...field} list="edit-driver-list" />
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
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" />Update Entry</Button>
                </DialogFooter>
              </form>
            </Form>
            <div className="hidden">
                <div id="printable-edit-content">
                    <PrintRecord data={{ ...saleEntry, ...form.getValues() }} />
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};
