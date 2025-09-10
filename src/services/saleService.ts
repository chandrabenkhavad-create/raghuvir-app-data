
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { SaleEntry } from '@/types';

type NewSaleEntry = Omit<SaleEntry, 'id' | 'created_at'>;

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


export async function addSaleEntry(entry: NewSaleEntry): Promise<SaleEntry> {
    // addSaleEntry should fail if the table doesn't exist.
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        const { data, error } = await supabase
            .from('sales')
            .insert([entry])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch(error: any) {
        console.error('Failed to add sale entry:', error);
        throw new Error(`Failed to add sale entry: ${error.message}`);
    }
}

export async function updateSaleEntry(id: number, entry: Partial<NewSaleEntry>): Promise<SaleEntry> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");
        const { data, error } = await supabase
            .from('sales')
            .update(entry)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Failed to update sale entry:', error);
        throw new Error(`Failed to update sale entry: ${error.message}`);
    }
}


export async function getRecentSaleEntries(limit = 10): Promise<SaleEntry[]> {
     const data = await runQuery(supabase => 
        supabase
            .from('sales')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    , []);
    return data || [];
}

export async function getLastSaleEntry(): Promise<SaleEntry | null> {
    try {
        const supabase = getSupabase();
        if (!supabase) return null; // Gracefully handle no connection
        
        const { data, error } = await supabase
            .from('sales')
            .select('dcno')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116' && error.code !== '42P01') { 
            console.error('Error fetching last sale entry:', error);
            throw new Error('Failed to fetch last sale entry. ' + error.message);
        }

        return data;
    } catch(e: any) {
        console.error("Service-level error in getLastSaleEntry:", e.message);
        throw e;
    }
}


export async function getAllSaleEntries(): Promise<SaleEntry[]> {
  const data = await runQuery(supabase =>
    supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false })
  , []);
  return data || [];
}

export async function getSaleEntryById(id: number): Promise<SaleEntry | null> {
    if (typeof id !== 'number' || !id) {
        console.error("getSaleEntryById: Invalid ID provided", id);
        return null;
    }
    return runQuery(supabase => 
        supabase
            .from('sales')
            .select('*')
            .eq('id', id)
            .single()
    , null);
}

    