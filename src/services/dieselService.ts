
'use server';

import { supabase } from '@/lib/supabaseClient';
import type { DieselEntry } from '@/types';

type NewDieselEntry = Omit<DieselEntry, 'id' | 'created_at'>;

export async function addDieselEntry(entry: NewDieselEntry): Promise<DieselEntry> {
    const { data, error } = await supabase
        .from('diesel')
        .insert([entry])
        .select()
        .single();

    if (error) {
        console.error('Error adding diesel entry:', error);
        throw new Error('Failed to add diesel entry. ' + error.message);
    }

    return data;
}

export async function getRecentDieselEntries(limit = 5): Promise<DieselEntry[]> {
    const { data, error } = await supabase
        .from('diesel')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching recent diesel entries:', error);
        throw new Error('Failed to fetch recent diesel entries. ' + error.message);
    }

    return data;
}

export async function getAllDieselEntries(): Promise<DieselEntry[]> {
  const { data, error } = await supabase
    .from('diesel')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching all diesel entries:', error);
    throw new Error('Failed to fetch all diesel entries. ' + error.message);
  }

  return data;
}
