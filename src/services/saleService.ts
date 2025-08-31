
'use server'
import { supabase } from "@/lib/supabaseClient";
import type { SaleEntry } from "@/types";


export async function addSaleEntry(entry: Omit<SaleEntry, 'id' | 'created_at'>): Promise<SaleEntry> {
    const { data, error } = await supabase
      .from('sales')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error adding sale entry:', error);
      throw new Error('Failed to add sale entry to Supabase. ' + error.message);
    }
    return data;
}

export async function getRecentSaleEntries(limit = 10): Promise<SaleEntry[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent sale entries:', error);
        throw new Error('Failed to fetch recent sale entries. ' + error.message);
    }

    return data;
}


export async function getAllSaleEntries(): Promise<SaleEntry[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching all sale entries:', error);
        throw new Error('Failed to fetch all sale entries. ' + error.message);
    }

    return data;
}
