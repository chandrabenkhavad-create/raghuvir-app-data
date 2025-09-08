
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    const success = await login(username, password);
    if (success) {
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
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-sky-300 to-white p-4">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold font-headline tracking-wider bg-gradient-to-r from-[#4C1A57] to-[#753a80] bg-clip-text text-transparent py-2">
          Raghuvir Infrastructure
        </h1>
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white/50 p-8 shadow-2xl backdrop-blur-lg border border-white/30">
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-md">
                <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
                Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
               Enter your credentials to access the portal.
            </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="mt-8 space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="username"
                        type="text"
                        placeholder="Username"
                        className="pl-10 h-12 text-base"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="pl-10 pr-10 h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle password visibility">
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                </div>
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                 {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    "Get Started"
                )}
            </Button>
        </form>
      </div>
    </main>
  );
}
