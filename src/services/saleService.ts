
'use server';

import { supabase } from '@/lib/supabaseClient';
import type { SaleEntry } from '@/types';

type NewSaleEntry = Omit<SaleEntry, 'id' | 'created_at'>;

export async function addSaleEntry(entry: NewSaleEntry): Promise<SaleEntry> {
    const { data, error } = await supabase
        .from('sales')
        .insert([entry])
        .select()
        .single();

    if (error) {
        console.error('Error adding sale entry:', error);
        throw new Error('Failed to add sale entry. ' + error.message);
    }

    return data;
}

export async function getRecentSaleEntries(limit = 5): Promise<SaleEntry[]> {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching recent sale entries:', error);
        throw new Error('Failed to fetch recent sale entries. ' + error.message);
    }

    return data;
}

export async function getLastSaleEntry(): Promise<SaleEntry | null> {
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
