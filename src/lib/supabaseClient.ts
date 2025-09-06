
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL" && supabaseAnonKey && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY") {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    console.error("Please make sure your NEXT_PUBLIC_SUPABASE_URL is a valid URL.");
  }
} else {
    console.warn("Supabase environment variables are not set. App will run in a disconnected state.");
}

export { supabase };
