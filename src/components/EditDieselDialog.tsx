
"use client";

import { useState, useEffect, type FC, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PrintDieselRecord } from '@/components/PrintDieselRecord';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DieselEntry } from '@/types';
import { updateDieselEntry, getAllDieselEntries } from '@/services/dieselService';

const dieselSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  liters: z.coerce.number().positive('Liters must be a positive number'),
  rate: z.coerce.number().positive('Rate must be a positive number'),
  amount: z.coerce.number().positive(),
  driverName: z.string().min(1, 'Driver name is required'),
  pump: z.string().min(1, 'Pump name is required'),
  odo: z.coerce.number().int().positive('ODO reading must be a positive number'),
  mileage: z.coerce.number().optional(),
});

type DieselFormValues = z.infer<typeof dieselSchema>;

interface EditDieselDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDieselUpdated: () => void;
  dieselEntry: DieselEntry;
}

export const EditDieselDialog: FC<EditDieselDialogProps> = ({ isOpen, onClose, onDieselUpdated, dieselEntry }) => {
  const { toast } = useToast();
  const [allDiesel, setAllDiesel] = useState<DieselEntry[]>([]);
  const [previousOdoForEdit, setPreviousOdoForEdit] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAllDieselEntries().then(setAllDiesel);
    }
  }, [isOpen]);

  const suggestionLists = useMemo(() => {
    const vehicleNumber = [...new Set(allDiesel.map(d => d.vehicleNumber))];
    const driverName = [...new Set(allDiesel.map(d => d.driverName))];
    const pump = [...new Set(allDiesel.map(d => d.pump))];
    return { vehicleNumber, driverName, pump };
  }, [allDiesel]);

  const form = useForm<DieselFormValues>({
    resolver: zodResolver(dieselSchema),
  });

  useEffect(() => {
    if (dieselEntry && isOpen) {
      form.reset({
        ...dieselEntry,
        mileage: dieselEntry.mileage ?? 0,
      });

      // Find the ODO of the entry just before the one being edited
      const vehicleEntries = allDiesel
        .filter(entry => entry.vehicleNumber.toLowerCase() === dieselEntry.vehicleNumber.toLowerCase() && entry.id < dieselEntry.id)
        .sort((a, b) => b.id - a.id);
      
      if (vehicleEntries.length > 0) {
        setPreviousOdoForEdit(vehicleEntries[0].odo);
      } else {
        setPreviousOdoForEdit(null);
      }

    }
  }, [dieselEntry, form, isOpen, allDiesel]);

  const liters = form.watch('liters');
  const rate = form.watch('rate');
  const currentOdo = form.watch('odo');

  useEffect(() => {
    const calculatedAmount = (liters || 0) * (rate || 0);
    form.setValue('amount', parseFloat(calculatedAmount.toFixed(2)));
  }, [liters, rate, form]);

  useEffect(() => {
    if (previousOdoForEdit !== null && currentOdo > previousOdoForEdit && liters > 0) {
      const distance = currentOdo - previousOdoForEdit;
      const mileage = distance / liters;
      form.setValue('mileage', parseFloat(mileage.toFixed(2)));
    } else {
      form.setValue('mileage', 0);
    }
  }, [currentOdo, previousOdoForEdit, liters, form]);


  const onSubmit: SubmitHandler<DieselFormValues> = async (data) => {
    try {
      await updateDieselEntry(dieselEntry.id, data);
      toast({
        title: 'Success!',
        description: 'Diesel entry has been updated.',
      });
      onDieselUpdated();
      onClose();
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
    const printableContent = document.getElementById('printable-edit-diesel-content');
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
           <datalist id="edit-diesel-vehicleNumber-list">
             {suggestionLists.vehicleNumber.map(v => <option key={v} value={v} />)}
           </datalist>
           <datalist id="edit-diesel-driverName-list">
             {suggestionLists.driverName.map(d => <option key={d} value={d} />)}
           </datalist>
           <datalist id="edit-diesel-pump-list">
             {suggestionLists.pump.map(p => <option key={p} value={p} />)}
           </datalist>
          <DialogHeader>
            <DialogTitle>Edit Diesel Entry (ID: {dieselEntry?.id})</DialogTitle>
            <DialogDescription>
              Update the details of this diesel entry. Click Update to save changes.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Car /> Vehicle Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MH12-AB1234" {...field} list="edit-diesel-vehicleNumber-list" />
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
                          <Input placeholder="e.g., Jane Smith" {...field} list="edit-diesel-driverName-list" />
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
                          <Input placeholder="e.g., HP Petrol Pump" {...field} list="edit-diesel-pump-list" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="odo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Gauge /> ODO Meter Reading</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 125000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Gauge /> Mileage (km/L)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" />Update Entry</Button>
                </DialogFooter>
              </form>
            </Form>
            <div className="hidden">
                <div id="printable-edit-diesel-content">
                    <PrintDieselRecord data={{ ...dieselEntry, ...form.getValues() }} />
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};
