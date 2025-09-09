
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import type { User, AppSettings, PrintSettings } from '@/types';

type UserSettings = AppSettings & PrintSettings;

// This generic query runner handles Supabase queries, including connection errors and non-existent tables.
async function runQuery<T>(
    query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T | null; error: any }>,
    // The fallback is returned when the table doesn't exist or no rows are found.
    // For single objects it should be `null`, for arrays it should be `[]`.
    fallback: T | null
): Promise<T | null> {
    try {
        const supabase = getSupabase();
        // No error thrown here, but supabase can be null if not configured
        if (!supabase) {
             throw new Error("Supabase is not connected. Please check your environment variables.");
        }
        const { data, error } = await query(supabase);

        if (error) {
            if (error.code === '42P01' || error.code === 'PGRST116') {
                console.warn(`Supabase query warning: ${error.message}`);
                return fallback;
            }
            console.error('Supabase query failed:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data;
    } catch (e: any) {
        console.error("Service-level error:", e.message)
        // Check if the error is due to Supabase not being connected and return empty state
        if (e.message.includes("Supabase is not connected")) {
            return fallback;
        }
        throw e;
    }
}


export async function addUser(entry: Omit<User, 'id' | 'created_at'>): Promise<User> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        
        const hashedPassword = await bcrypt.hash(entry.password!, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{ username: entry.username, password: hashedPassword, role: entry.role }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch(error: any) {
        console.error('Failed to add user:', error);
        if (error.code === '23505') { // Unique constraint violation
             throw new Error(`User '${entry.username}' already exists.`);
        }
        throw new Error(`Failed to add user: ${error.message}`);
    }
}

export async function verifyUser(username: string, pass: string): Promise<User | null> {
     let supabase;
     try {
        supabase = getSupabase();
     } catch (e) {
         // Supabase is not configured, fall back to default admin user
         console.log("Supabase not configured, falling back to default admin credentials.");
         if (username === 'admin' && pass === 'admin') {
            return { id: 0, username: 'admin', role: 'admin', created_at: new Date().toISOString() };
         }
         return null;
     }

    // This is a workaround for RLS. We can't query the users table directly with anon key
    // if RLS is enabled. A secure way is to use a postgres function.
    // However, for simplicity in Studio, we are querying directly.
    // The user must create a policy to allow anon users to read the 'users' table.
     const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password, role, created_at, settings')
        .eq('username', username)
        .single();
    
     if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is not a "real" error in this case.
        console.error("Error fetching user for verification:", error.message);
        // This could be due to RLS policies.
        throw new Error(`Could not verify user. Check your RLS policies on the 'users' table. Error: ${error.message}`);
     }

    if (user && user.password) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }

    // User not found, check for default admin on first run
    if (username === 'admin' && pass === 'admin') {
        const { data: allUsers, error: fetchAllError } = await supabase.from('users').select('id').limit(1);
        if (fetchAllError && fetchAllError.code !== '42P01') {
             throw new Error(`Could not check for existing users. Check RLS policies. Error: ${fetchAllError.message}`);
        }

        if (!allUsers || allUsers.length === 0) {
             console.log("No users found. Creating default admin user.");
             // This will likely fail if RLS is enabled and no policy allows insertion.
             // The user needs an RLS policy for this too.
             const newAdmin = await addUser({ username: 'admin', password: 'admin', role: 'admin' });
             const { password, ...adminWithoutPassword } = newAdmin;
             return adminWithoutPassword;
        }
    }
    
    return null;
}

export async function updateUserSettings(userId: number, settings: UserSettings): Promise<User> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        const { data, error } = await supabase
            .from('users')
            .update({ settings })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error(`Failed to update settings for user ${userId}:`, error);
        throw new Error(`Failed to update user settings: ${error.message}`);
    }
}


export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const data = await runQuery(supabase => 
    supabase
        .from('users')
        .select('id, username, role, created_at')
        .order('id', { ascending: false })
  , []);
  return data || [];
}

export async function deleteUser(id: number): Promise<void> {
    if (id === undefined) {
        throw new Error("User ID is required for deletion.");
    }
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) throw error;

    } catch (error: any) {
        console.error('Failed to delete user:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
    }
}
