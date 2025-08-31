'use server';
/**
 * @fileOverview A flow for appending data to a Google Sheet.
 *
 * - appendToGoogleSheet - A function that handles appending data to a Google Sheet.
 * - AppendToSheetInput - The input type for the appendToGoogleSheet function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import 'dotenv/config';

export const AppendToSheetInputSchema = z.object({
  sheetName: z.string().describe('The name of the sheet (e.g., Sales, Diesel).'),
  data: z.array(z.any()).describe('The row data to append.'),
});
export type AppendToSheetInput = z.infer<typeof AppendToSheetInputSchema>;

async function getGoogleSheetsClient() {
  const credentials = {
    client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_API_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google API credentials are not set in environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

export const appendToGoogleSheet = ai.defineFlow(
  {
    name: 'appendToGoogleSheet',
    inputSchema: AppendToSheetInputSchema,
    outputSchema: z.void(),
  },
  async ({ sheetName, data }) => {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID is not set in environment variables.');
    }

    try {
      const sheets = await getGoogleSheetsClient();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [data],
        },
      });
    } catch (error) {
      console.error('Failed to append data to Google Sheet:', error);
      // We will just log the error and not throw it to the client
      // because the primary data store is the local file.
    }
  }
);
