"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fuel } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

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
type DieselEntry = DieselFormValues & { id: number };

export const DieselForm: FC = () => {
  const [entries, setEntries] = useState<DieselEntry[]>([]);
  const { toast } = useToast();

  const form = useForm<DieselFormValues>({
    resolver: zodResolver(dieselSchema),
    defaultValues: {
      vehicleNumber: '',
      driverName: '',
      pump: '',
    },
  });

  const liters = form.watch('liters');
  const rate = form.watch('rate');

  useEffect(() => {
    const calculatedAmount = (liters || 0) * (rate || 0);
    form.setValue('amount', parseFloat(calculatedAmount.toFixed(2)));
  }, [liters, rate, form]);

  const onSubmit: SubmitHandler<DieselFormValues> = (data) => {
    const newEntry = { ...data, id: Date.now() };
    setEntries((prev) => [newEntry, ...prev]);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Diesel entry has been saved.',
    });
  };

  return (
    <>
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
              <Button type="submit">Submit Entry</Button>
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
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>ODO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.vehicleNumber}</TableCell>
                    <TableCell>{entry.liters}</TableCell>
                    <TableCell>₹{entry.rate.toFixed(2)}</TableCell>
                    <TableCell>₹{entry.amount.toFixed(2)}</TableCell>
                    <TableCell>{entry.driverName}</TableCell>
                    <TableCell>{entry.odo}</TableCell>
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
