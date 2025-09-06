
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { SaleEntry } from '@/types';

type NewSaleEntry = Omit<SaleEntry, 'id' | 'created_at'>;

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


export async function addSaleEntry(entry: NewSaleEntry): Promise<SaleEntry> {
    // addSaleEntry should fail if the table doesn't exist.
    try {
        const supabase = getSupabase();
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

export async function getRecentSaleEntries(limit = 5): Promise<SaleEntry[]> {
     return runQuery(supabase => 
        supabase
            .from('sales')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    , []);
}

export async function getLastSaleEntry(): Promise<SaleEntry | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('sales')
            .select('dcno')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        // 'PGRST116': No rows found, which is fine, return null.
        // '42P01': Table not found, which is also fine for the initial setup, return null.
        if (error && error.code !== 'PGRST116' && error.code !== '42P01') { 
            console.error('Error fetching last sale entry:', error);
            throw new Error('Failed to fetch last sale entry. ' + error.message);
        }

        return data;
    } catch(e: any) {
        // This catches errors from getSupabase()
        console.error("Service-level error in getLastSaleEntry:", e.message);
        throw e;
    }
}


export async function getAllSaleEntries(): Promise<SaleEntry[]> {
  return runQuery(supabase =>
    supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false })
  , []);
}

export async function getSaleEntryById(id: number): Promise<SaleEntry | null> {
    if (typeof id !== 'number' || !id) {
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

    
