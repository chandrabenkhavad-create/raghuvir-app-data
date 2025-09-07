
'use server';

import { getSupabase } from '@/lib/supabaseClient';
import type { MasterDataItem, MasterDataType } from '@/types';

// This generic query runner handles Supabase queries, including connection errors and non-existent tables.
async function runQuery<T>(
    query: (supabase: ReturnType<typeof getSupabase>) => PromiseLike<{ data: T | null; error: any }>,
    fallback: T 
): Promise<T> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
             throw new Error("Supabase is not connected. Please check your environment variables.");
        }
        const { data, error } = await query(supabase);

        if (error) {
            // '42P01': undefined_table. This is a special case where we don't want to throw an error, just return the fallback.
            if (error.code === '42P01') {
                console.warn(`Supabase master table query warning: ${error.message}. This is expected if the table hasn't been created yet.`);
                return fallback;
            }
            // 'PGRST116': The result contains 0 rows. This is not an error, just no record found. Return fallback.
             if (error.code === 'PGRST116') {
                return fallback;
            }
            console.error('Supabase query failed:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data ?? fallback;
    } catch (e: any) {
        console.error("Service-level error in masterService:", e.message);
        // Check if the error is due to Supabase not being connected and return fallback state
        if (e.message.includes("Supabase is not connected")) {
            return fallback;
        }
        throw e;
    }
}

export async function getMasterData(type: MasterDataType): Promise<MasterDataItem[]> {
    return runQuery(supabase => 
        supabase
            .from(type)
            .select('id, name, created_at')
            .order('name', { ascending: true }),
        []
    );
}

export async function addMasterDataItem(type: MasterDataType, name: string): Promise<MasterDataItem> {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");

        // Check for duplicates
        const { data: existing, error: existingError } = await supabase
            .from(type)
            .select('id')
            .eq('name', name)
            .single();

        if (existing) {
            throw new Error(`Item '${name}' already exists in ${type}.`);
        }
        // Handle case where .single() finds no rows
        if (existingError && existingError.code !== 'PGRST116') {
            throw existingError;
        }

        const { data, error } = await supabase
            .from(type)
            .insert([{ name }])
            .select()
            .single();
            
        if (error) {
            // Handle unique constraint violation just in case the check above has a race condition
            if (error.code === '23505') {
                 throw new Error(`Item '${name}' already exists in ${type}.`);
            }
            throw error;
        }
        return data;

    } catch (error: any) {
        console.error(`Failed to add item to ${type}:`, error);
        throw new Error(error.message || `Failed to add item to ${type}.`);
    }
}

export async function deleteMasterDataItem(type: MasterDataType, id: number): Promise<void> {
    if (id === undefined) {
        throw new Error("Item ID is required for deletion.");
    }
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error("Supabase not connected");

        const { error } = await supabase
            .from(type)
            .delete()
            .eq('id', id);
        
        if (error) throw error;

    } catch (error: any) {
        console.error(`Failed to delete item from ${type}:`, error);
        throw new Error(error.message || `Failed to delete item from ${type}.`);
    }
}
