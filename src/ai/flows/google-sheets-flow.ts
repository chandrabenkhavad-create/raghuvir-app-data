
'use server';
/**
 * @fileOverview A flow for appending data to a Google Sheet.
 *
 * - appendToGoogleSheet - A function that handles appending data to a Google Sheet.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import 'dotenv/config';
import { AppendToSheetInput, AppendToSheetInputSchema } from '../schemas/google-sheets-schema';

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

export async function appendToGoogleSheet(input: AppendToSheetInput): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Google Sheet ID is not set in environment variables.');
  }

  try {
    const sheets = await getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: input.sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [input.data],
      },
    });
  } catch (error) {
    console.error('Failed to append data to Google Sheet:', error);
    // Re-throw the error to be caught by the calling form
    throw new Error(`Failed to save to Google Sheet. Please check your credentials and Sheet ID. Details: ${(error as Error).message}`);
  }
}
