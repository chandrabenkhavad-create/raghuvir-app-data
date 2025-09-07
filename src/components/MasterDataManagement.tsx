
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Trash2, PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { MasterDataItem, MasterDataType } from '@/types';
import { getMasterData, addMasterDataItem, deleteMasterDataItem } from '@/services/masterService';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty.'),
});
type FormValues = z.infer<typeof formSchema>;

interface MasterDataManagementProps {
    dataType: MasterDataType;
    title: string;
    description: string;
    icon: ReactNode;
}

export function MasterDataManagement({ dataType, title, description, icon }: MasterDataManagementProps) {
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterDataItem | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getMasterData(dataType);
      setData(items);
    } catch (e: any) {
      setError(e.message || `Failed to fetch ${title} data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType]);

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    try {
      await addMasterDataItem(dataType, formData.name);
      toast({ title: 'Success!', description: `${title} '${formData.name}' has been added.` });
      form.reset();
      fetchData(); // Refresh the list
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error!', description: e.message });
    }
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMasterDataItem(dataType, itemToDelete.id);
      toast({ title: "Item Deleted", description: `${title} '${itemToDelete.name}' has been deleted.` });
      fetchData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error Deleting Item", description: e.message });
    } finally {
      setItemToDelete(null);
    }
  };
  
   if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Data for '{title}'</AlertTitle>
        <AlertDescription>
          <p>Could not fetch data. This might be because the table `'{dataType}'` does not exist in your database yet.</p>
          <p className='mt-2'>Please go to your Supabase project, create the table, and then refresh.</p>
          <pre className="mt-2 bg-muted/50 p-2 rounded-md font-mono text-xs text-destructive-foreground">{error}</pre>
        </AlertDescription>
      </Alert>
    );
  }

  return (
     <AlertDialog>
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle /> Add New {title}</CardTitle>
                <CardDescription>Add a new item to the master list.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{title} Name</FormLabel>
                                <FormControl>
                                <Input placeholder={`Enter new ${title.toLowerCase()} name...`} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                            Add {title}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{icon} Existing {title}s</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" onClick={() => setItemToDelete(item)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete Item</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
      </div>

       <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item 
                <span className="font-bold"> {itemToDelete?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
