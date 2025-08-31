import { z } from 'genkit';

export const AppendToStoreInputSchema = z.object({
  storeName: z.string().describe('The name of the store (e.g., sales, diesel).'),
  data: z.any().describe('The data to append.'),
});
export type AppendToStoreInput = z.infer<typeof AppendToStoreInputSchema>;

export const ReadFromStoreInputSchema = z.string();
export type ReadFromStoreInput = z.infer<typeof ReadFromStoreInputSchema>;
