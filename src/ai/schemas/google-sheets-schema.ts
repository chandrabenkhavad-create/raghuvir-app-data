import { z } from 'genkit';

export const AppendToSheetInputSchema = z.object({
  sheetName: z.string().describe('The name of the sheet (e.g., Sales, Diesel).'),
  data: z.array(z.any()).describe('The row data to append.'),
});
export type AppendToSheetInput = z.infer<typeof AppendToSheetInputSchema>;
