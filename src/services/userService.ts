
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

async function runQuery<T>(query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T; error: any }>, emptyState: T): Promise<T> {
    try {
        const supabase = getSupabase();
        // No error thrown here, but supabase can be null if not configured
        if (!supabase) {
            return emptyState;
        }
        const { data, error } = await query(supabase);

        if (error) {
            if (error.code === '42P01' || error.code === 'PGRST116') {
                console.warn(`Supabase query warning: ${error.message}`);
                return emptyState;
            }
            console.error('Supabase query failed:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data;
    } catch (e: any) {
        console.error("Service-level error:", e.message)
        // Check if the error is due to Supabase not being connected and return empty state
        if (e.message.includes("Supabase is not connected")) {
            return emptyState;
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
     try {
        getSupabase(); // This will throw if not configured, and we'll fall into the catch block
     } catch (e) {
         // Supabase is not configured, fall back to default admin user
         console.log("Supabase not configured, falling back to default admin credentials.");
         if (username === 'admin' && pass === 'admin') {
            return { id: 0, username: 'admin', role: 'admin', created_at: new Date().toISOString() };
         }
         return null;
     }

     const user = await runQuery(supabase => 
        supabase
            .from('users')
            .select('id, username, password, role, created_at')
            .eq('username', username)
            .single()
    , null);

    if (user && user.password) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }

    // User not found, check for default admin on first run
    if (username === 'admin' && pass === 'admin') {
        const users = await getAllUsers();
        if (users.length === 0) {
             console.log("No users found. Creating default admin user.");
             const newAdmin = await addUser({ username: 'admin', password: 'admin', role: 'admin' });
             const { password, ...adminWithoutPassword } = newAdmin;
             return adminWithoutPassword;
        }
    }
    
    return null;
}


export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  return runQuery(supabase => 
    supabase
        .from('users')
        .select('id, username, role, created_at')
        .order('id', { ascending: false })
  , []);
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
