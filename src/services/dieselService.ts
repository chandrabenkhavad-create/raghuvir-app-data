
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { DieselEntry } from '@/types';

type NewDieselEntry = Omit<DieselEntry, 'id' | 'created_at'>;

// This generic query runner handles Supabase queries, including connection errors and non-existent tables.
async function runQuery<T>(
    query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T | null; error: any }>,
    // The fallback is returned when the table doesn't exist or no rows are found.
    // For single objects it should be `null`, for arrays it should be `[]`.
    fallback: T | null
): Promise<T | null> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
             throw new Error("Supabase is not connected. Please check your environment variables.");
        }
        const { data, error } = await query(supabase);

        if (error) {
            // '42P01': undefined_table. This is a special case where we don't want to throw.
            // 'PGRST116': The result contains 0 rows. This is not an error, just no record found.
            if (error.code === '42P01' || error.code === 'PGRST116') {
                console.warn(`Supabase query warning: ${error.message}`);
                return fallback;
            }
            console.error('Supabase query failed:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data;
    } catch (e: any) {
         // This catches errors from getSupabase() if not connected
        console.error("Service-level error:", e.message)
        throw e;
    }
}

export async function addDieselEntry(entry: NewDieselEntry): Promise<DieselEntry> {
    // addDieselEntry should fail if the table doesn't exist.
     try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        const { data, error } = await supabase
            .from('diesel')
            .insert([entry])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch(error: any) {
        console.error('Failed to add diesel entry:', error);
        throw new Error(`Failed to add diesel entry: ${error.message}`);
    }
}

export async function updateDieselEntry(id: number, entry: Partial<NewDieselEntry>): Promise<DieselEntry> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        const { data, error } = await supabase
            .from('diesel')
            .update(entry)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Failed to update diesel entry:', error);
        throw new Error(`Failed to update diesel entry: ${error.message}`);
    }
}


export async function getRecentDieselEntries(limit = 10): Promise<DieselEntry[]> {
     const data = await runQuery(supabase => 
        supabase
            .from('diesel')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    , []);
    return data || [];
}

export async function getDieselEntryById(id: number): Promise<DieselEntry | null> {
    if (typeof id !== 'number' || !id) {
        console.error("getDieselEntryById: Invalid ID provided", id);
        return null;
    }
    return runQuery(supabase => 
        supabase
            .from('diesel')
            .select('*')
            .eq('id', id)
            .single()
    , null);
}

export async function getAllDieselEntries(): Promise<DieselEntry[]> {
  const data = await runQuery(supabase => 
    supabase
        .from('diesel')
        .select('*')
        .order('id', { ascending: false })
  , []);
  return data || [];
}
