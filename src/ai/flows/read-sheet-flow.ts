"use server";
/**
 * @fileOverview A flow for reading data from a Google Sheet.
 *
 * - readSheet - A function that handles reading data from a Google Sheet.
 * - ReadSheetInput - The input type for the readSheet function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { google } from "googleapis";

const ReadSheetInputSchema = z.object({
  range: z
    .string()
    .describe("The A1 notation of the range to retrieve values from."),
});
export type ReadSheetInput = z.infer<typeof ReadSheetInputSchema>;

export async function readSheet(
  input: ReadSheetInput
): Promise<any[][] | null | undefined> {
  return readSheetFlow(input);
}

const readSheetFlow = ai.defineFlow(
  {
    name: "readSheetFlow",
    inputSchema: ReadSheetInputSchema,
    outputSchema: z.any(),
  },
  async ({ range }) => {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      throw new Error(
        "GOOGLE_SHEETS_CREDENTIALS environment variable not set. Please refer to the documentation to set it up."
      );
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error(
        "GOOGLE_SHEET_ID environment variable not set. Please provide the ID of your Google Sheet."
      );
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  }
);
