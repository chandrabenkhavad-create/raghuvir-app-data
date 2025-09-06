
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { SaleEntry } from '@/types';

type NewSaleEntry = Omit<SaleEntry, 'id' | 'created_at'>;

async function runQuery<T>(query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T; error: any }>): Promise<T> {
    try {
        const supabase = getSupabase();
        const { data, error } = await query(supabase);

        if (error) {
            console.error('Supabase query failed:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data;
    } catch (e: any) {
        console.error("Service-level error:", e.message)
        // Re-throw the error to be caught by the calling component
        throw e;
    }
}


export async function addSaleEntry(entry: NewSaleEntry): Promise<SaleEntry> {
    return runQuery(supabase => 
        supabase
            .from('sales')
            .insert([entry])
            .select()
            .single()
    );
}

export async function getRecentSaleEntries(limit = 5): Promise<SaleEntry[]> {
     return runQuery(supabase => 
        supabase
            .from('sales')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    );
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

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching last sale entry:', error);
            throw new Error('Failed to fetch last sale entry. ' + error.message);
        }

        return data;
    } catch(e: any) {
        if (e.message.includes("undefined_table")) {
             console.warn("`sales` table not found, returning null for last entry.");
             return null;
        }
        throw e;
    }
}


export async function getAllSaleEntries(): Promise<SaleEntry[]> {
  return runQuery(supabase =>
    supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false })
  );
}
