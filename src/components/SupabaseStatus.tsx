
"use client";

import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { checkSupabaseConnection, initializeSupabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SupabaseStatus() {
  const [status, setStatus] = useState<{ connected: boolean; error: string | null }>({ connected: false, error: 'Checking connection...' });
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    const connectionStatus = await checkSupabaseConnection();
    setStatus(connectionStatus);
    setIsChecking(false);
  };
  
  const handleReconnect = async () => {
      toast({ title: "Re-initializing Supabase client...", description: "Fetching latest environment variables."});
      initializeSupabase(); // Re-initialize with potentially new env vars
      await checkConnection(); // Check the connection again
  }

  useEffect(() => {
    checkConnection();
  }, []);

  const statusColor = status.connected ? 'bg-green-500' : 'bg-red-500';
  const tooltipText = status.connected ? 'Supabase connection is healthy.' : `Connection Error: ${status.error || 'Unknown error'}`;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isChecking ? 'animate-pulse bg-yellow-500' : statusColor}`} />
              <span className="text-sm text-muted-foreground hidden md:inline">
                 {isChecking ? "Checking..." : (status.connected ? "Connected" : "Error")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {!status.connected && (
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleReconnect} disabled={isChecking}>
                        <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                    </Button>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>Retry Connection</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      )}
    </div>
  );
}
