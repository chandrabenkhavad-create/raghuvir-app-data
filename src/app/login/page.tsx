
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    if (login(username, password)) {
      toast({
        title: 'Success!',
        description: 'You have successfully logged in.',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: 'Invalid username or password.',
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
            Raghuvir Infrastructure
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Sayla-Sudamda Road,Sudamda.
          </p>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><LogIn /> Login</CardTitle>
          <CardDescription>
            Enter your username and password to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

