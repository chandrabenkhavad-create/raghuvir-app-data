
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { DieselEntry } from '@/types';

type NewDieselEntry = Omit<DieselEntry, 'id' | 'created_at'>;

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

export async function addDieselEntry(entry: NewDieselEntry): Promise<DieselEntry> {
    return runQuery(supabase => 
        supabase
            .from('diesel')
            .insert([entry])
            .select()
            .single()
    );
}

export async function getRecentDieselEntries(limit = 5): Promise<DieselEntry[]> {
     return runQuery(supabase => 
        supabase
            .from('diesel')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)
    );
}

export async function getAllDieselEntries(): Promise<DieselEntry[]> {
  return runQuery(supabase => 
    supabase
        .from('diesel')
        .select('*')
        .order('id', { ascending: false })
  );
}
