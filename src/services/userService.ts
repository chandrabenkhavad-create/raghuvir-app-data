
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

async function runQuery<T>(query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T; error: any }>, emptyState: T): Promise<T> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
             throw new Error("Supabase is not connected. Please check your environment variables.");
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
        throw e;
    }
}


export async function addUser(entry: Omit<User, 'id' | 'created_at'>): Promise<User> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        
        const hashedPassword = await bcrypt.hash(entry.password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{ username: entry.username, password: hashedPassword }])
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

export async function verifyUser(username: string, pass: string): Promise<boolean> {
     const user = await runQuery(supabase => 
        supabase
            .from('users')
            .select('password')
            .eq('username', username)
            .single()
    , null);

    if (!user || !user.password) {
        // For the default admin user if users table is empty or user not found
        if (username === 'admin' && pass === 'admin') {
            const users = await getAllUsers();
            if (users.length === 0) {
                 // First time login, add admin user
                await addUser({ username: 'admin', password: 'admin' });
                return true;
            }
        }
        return false;
    }
    
    return bcrypt.compare(pass, user.password);
}


export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  return runQuery(supabase => 
    supabase
        .from('users')
        .select('id, username, created_at')
        .order('id', { ascending: false })
  , []);
}
