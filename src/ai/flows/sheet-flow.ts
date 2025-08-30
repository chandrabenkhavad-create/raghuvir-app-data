'use server';
/**
 * @fileOverview A flow for appending data to a Google Sheet.
 *
 * - appendToSheet - A function that handles appending data to a Google Sheet.
 * - AppendToSheetInput - The input type for the appendToSheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {google} from 'googleapis';

const AppendToSheetInputSchema = z.object({
  range: z.string().describe('The A1 notation of a range to search for a logical table of data. Values are appended after the last row of the table.'),
  values: z.array(z.array(z.any())).describe('The data to append. Each inner array is a row.'),
});
export type AppendToSheetInput = z.infer<typeof AppendToSheetInputSchema>;

export async function appendToSheet(input: AppendToSheetInput): Promise<void> {
  return appendToSheetFlow(input);
}

const appendToSheetFlow = ai.defineFlow(
  {
    name: 'appendToSheetFlow',
    inputSchema: AppendToSheetInputSchema,
    outputSchema: z.void(),
  },
  async ({range, values}) => {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || process.env.GOOGLE_SHEETS_CREDENTIALS.startsWith('https://docs.google.com/spreadsheets/d/1UGSsiHRXE3_46a6f_BgjfXXRfI2wTYfEkyIGILIK5ao/edit?gid=0#gid=0')) {
        throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable not set. Please refer to the documentation to set it up.');
    }
    if (!process.env.GOOGLE_SHEET_ID) {https://docs.google.com/spreadsheets/d/1UGSsiHRXE3_46a6f_BgjfXXRfI2wTYfEkyIGILIK5ao/edit?gid=0#gid=0
        throw new Error('GOOGLE_SHEET_ID environment variable not set. Please provide the ID of your Google Sheet.');
    }
    
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({version: 'v4', auth});

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values,
        },
    });
  }
);
