
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { DieselEntry } from '@/types';

type NewDieselEntry = Omit<DieselEntry, 'id' | 'created_at'>;

async function runQuery<T>(query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T; error: any }>, emptyState: T): Promise<T> {
    try {
        const supabase = getSupabase();
        const { data, error } = await query(supabase);

        if (error) {
            // '42P01' is the Postgres error code for "undefined_table"
            if (error.code === '42P01') {
                console.warn(`Supabase table not found. Returning empty state. Error: ${error.message}`);
                return emptyState;
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

export async function getRecentDieselEntries(limit = 5): Promise<DieselEntry[]> {
     return runQuery(supabase => 
        supabase
            .from('diesel')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    , []);
}

export async function getAllDieselEntries(): Promise<DieselEntry[]> {
  return runQuery(supabase => 
    supabase
        .from('diesel')
        .select('*')
        .order('id', { ascending: false })
  , []);
}
