"use client";

import { useState, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Printer } from 'lucide-react';

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
  weights: z.string().min(1, 'Weights are required'),
  driver: z.string().min(1, 'Driver is required'),
  site: z.string().min(1, 'Site is required'),
  remarks: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;
type PurchaseEntry = PurchaseFormValues & { id: number };

export const PurchaseForm: FC = () => {
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [lastEntry, setLastEntry] = useState<PurchaseEntry | null>(null);
  const { toast } = useToast();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      name: '',
      supplier: '',
      weights: '',
      driver: '',
      site: '',
      remarks: '',
    },
  });

  const onSubmit: SubmitHandler<PurchaseFormValues> = (data) => {
    const newEntry: PurchaseEntry = { ...data, id: Date.now() };
    setEntries((prev) => [newEntry, ...prev]);
    setLastEntry(newEntry);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Purchase entry has been saved.',
    });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="weights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weights</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500 KG" {...field} />
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
                  name="site"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem className="md:col-span-2">
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
                  onClick={() => window.print()}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Weights</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Site</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.supplier}</TableCell>
                    <TableCell>{entry.weights}</TableCell>
                    <TableCell>{entry.driver}</TableCell>
                    <TableCell>{entry.site}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <div className="print-area">
        <PrintRecord data={lastEntry} />
      </div>
    </>
  );
};
