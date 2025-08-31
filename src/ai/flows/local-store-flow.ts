'use server';
/**
 * @fileOverview Flows for reading and appending data to local JSON files.
 *
 * - appendToLocalStore - A function that handles appending data to a local file.
 * - readFromLocalStore - A function that handles reading data from a local file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fs from 'fs/promises';
import path from 'path';
import { AppendToStoreInput, AppendToStoreInputSchema, ReadFromStoreInput, ReadFromStoreInputSchema } from '../schemas/local-store-schema';

const storeDirectory = path.join(process.cwd(), 'data');


async function ensureStore(storeName: string): Promise<string> {
  const filePath = path.join(storeDirectory, `${storeName}.json`);
  try {
    await fs.mkdir(storeDirectory, { recursive: true });
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
  return filePath;
}

export async function appendToLocalStore(input: AppendToStoreInput): Promise<void> {
  return appendToLocalStoreFlow(input);
}

export async function readFromLocalStore(storeName: ReadFromStoreInput): Promise<any[]> {
  return readFromLocalStoreFlow(storeName);
}

const appendToLocalStoreFlow = ai.defineFlow(
  {
    name: 'appendToLocalStoreFlow',
    inputSchema: AppendToStoreInputSchema,
    outputSchema: z.void(),
  },
  async ({ storeName, data }) => {
    const filePath = await ensureStore(storeName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const storeData = JSON.parse(fileContent);
    storeData.unshift(data); // Add new entry to the beginning
    await fs.writeFile(filePath, JSON.stringify(storeData, null, 2), 'utf-8');
  }
);

const readFromLocalStoreFlow = ai.defineFlow(
  {
    name: 'readFromLocalStoreFlow',
    inputSchema: ReadFromStoreInputSchema,
    outputSchema: z.array(z.any()),
  },
  async (storeName) => {
    const filePath = await ensureStore(storeName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  }
);
