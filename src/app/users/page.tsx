
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ArrowLeft, Loader2, UserCog, Trash2, ShieldCheck, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addUser, getAllUsers, deleteUser } from '@/services/userService';
import type { User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
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

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'user'], { required_error: 'You need to select a role.' }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<Omit<User, 'password'> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
      });
      router.push('/');
    }
  }, [isAuthenticated, user, router, toast]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const userList = await getAllUsers();
        setUsers(userList);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
      if (user?.role === 'admin') {
          fetchUsers();
      }
  }, [user]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      await addUser(data);
      toast({
        title: 'Success!',
        description: `User '${data.username}' has been created.`,
      });
      form.reset();
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
        await deleteUser(userToDelete.id);
        toast({
            title: "User Deleted",
            description: `User '${userToDelete.username}' has been successfully deleted.`,
        });
        fetchUsers(); // Refresh user list
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting User",
            description: error.message,
        });
    } finally {
        setUserToDelete(null);
    }
  };


  if (user?.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Redirecting...</p>
      </main>
    );
  }

  return (
    <>
    <AlertDialog>
        <main className="min-h-screen bg-background font-body text-foreground p-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/" passHref>
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
                </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2"><UserPlus /> Add New User</CardTitle>
                    <CardDescription>
                        Create a new user account with a username and password.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., john_doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>User Role</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="user" />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2"><Shield /> User</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="admin" />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2"><ShieldCheck /> Admin</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                            Add User
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2"><UserCog/> Existing Users</CardTitle>
                        <CardDescription>List of all users in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.username}</TableCell>
                                        <TableCell className="capitalize">{u.role}</TableCell>
                                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            {u.username !== 'admin' && (
                                                 <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" onClick={() => setUserToDelete(u)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete User</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        </main>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account
                for <span className="font-bold">{userToDelete?.username}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
