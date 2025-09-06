
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null;
let connectionError: string | null = null;

function initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    supabase = null;
    connectionError = null;

    if (supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL" && supabaseAnonKey && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY") {
      try {
        supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log("Supabase client initialized.");
      } catch (error: any) {
        console.error("Failed to initialize Supabase client:", error);
        connectionError = "Failed to initialize Supabase client. Please check if your NEXT_PUBLIC_SUPABASE_URL is a valid URL.";
        supabase = null;
      }
    } else {
        console.warn("Supabase environment variables are not set. App will run in a disconnected state.");
        connectionError = "Supabase environment variables are not set. Please add them to the .env file.";
        supabase = null;
    }
}

// Initial initialization
initializeSupabase();


async function checkSupabaseConnection(): Promise<{ connected: boolean; error: string | null }> {
    if (!supabase) {
        return { connected: false, error: connectionError ?? "Supabase client not initialized." };
    }
    try {
        // Perform a simple query to check the connection
        const { error } = await supabase.from('sales').select('id').limit(1);

        if (error && error.code !== '42P01') { // 42P01: undefined_table (this is ok, table might not exist yet)
             console.error('Supabase connection check failed:', error.message);
             return { connected: false, error: `Connection check failed: ${error.message}` };
        }
        
        return { connected: true, error: null };

    } catch (e: any) {
        return { connected: false, error: e.message };
    }
}

function getSupabase() {
    if (!supabase) {
        throw new Error(connectionError || "Supabase is not connected. Please check your environment variables.");
    }
    return supabase;
}


export { getSupabase, checkSupabaseConnection, initializeSupabase };
