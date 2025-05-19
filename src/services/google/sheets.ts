// src/services/google/sheets.ts
import { google, drive_v3, sheets_v4, type Auth } from "googleapis";

// Placeholder for Google Sheets API client initialization if needed
// import { google } from 'googleapis';
// import { getOAuth2Client } from './auth'; // Assuming you have an auth service

interface Spreadsheet {
  id: string;
  name: string;
}

interface SpreadsheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
  // Add more metadata fields as needed, e.g., named ranges
}

interface SheetData {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  values: unknown[][]; // Array of rows, where each row is an array of cells
}

function createOAuthClient(accessToken: string): Auth.OAuth2Client {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

/**
 * Lists available Google Spreadsheets for the authenticated user.
 * Requires an authenticated Google API client.
 */
export async function listSpreadsheets(accessToken: string): Promise<Spreadsheet[]> {
  try {
    const authClient = createOAuthClient(accessToken);
    const drive = google.drive({ version: "v3", auth: authClient });

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name)",
      pageSize: 200,
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files
        .map((file) => ({
          id: file.id!,
          name: file.name!,
        }))
        .filter((file) => file.id && file.name) as Spreadsheet[];
    }
    return [];
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    throw new Error("Failed to list spreadsheets");
  }
}

/**
 * Retrieves metadata for a specific Google Spreadsheet.
 * Requires an authenticated Google API client.
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata | null> {
  try {
    const authClient = createOAuthClient(accessToken);
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields:
        "spreadsheetId,properties.title,spreadsheetUrl,sheets.properties(sheetId,title,index)",
    });

    const data = response.data;
    if (data) {
      return {
        spreadsheetId: data.spreadsheetId!,
        spreadsheetUrl: data.spreadsheetUrl!,
        title: data.properties?.title!,
        sheets:
          data.sheets?.map((sheet) => ({
            properties: {
              sheetId: sheet.properties?.sheetId!,
              title: sheet.properties?.title!,
              index: sheet.properties?.index!,
            },
          })) || [],
      } as SpreadsheetMetadata;
    }
    return null;
  } catch (error) {
    console.error(`Error getting spreadsheet metadata for ${spreadsheetId}:`, error);
    throw new Error("Failed to get spreadsheet metadata");
  }
}

/**
 * Reads data from a specific sheet and range within a Google Spreadsheet.
 * Requires an authenticated Google API client.
 */
export async function readSheetData(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<SheetData | null> {
  try {
    const authClient = createOAuthClient(accessToken);
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data = response.data;
    if (data?.values) {
      return {
        spreadsheetId,
        sheetName: data.range?.split("!")[0] ?? "",
        range: data.range!,
        values: data.values as unknown[][],
      };
    }
    return null;
  } catch (error) {
    console.error(`Error reading sheet data for ${spreadsheetId}, range ${range}:`, error);
    throw new Error("Failed to read sheet data");
  }
}
