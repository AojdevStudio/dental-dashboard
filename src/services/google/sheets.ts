// src/services/google/sheets.ts
import { google, drive_v3, sheets_v4, type Auth } from "googleapis";

// Placeholder for Google Sheets API client initialization if needed
// import { google } from 'googleapis';
// import { getOAuth2Client } from './auth'; // Assuming you have an auth service

/**
 * Google Sheets API Service
 *
 * Provides methods for interacting with Google Sheets API, including
 * listing available spreadsheets, retrieving spreadsheet metadata,
 * and reading sheet data. Handles authentication and data formatting.
 */

/**
 * Interface representing basic spreadsheet information
 *
 * @interface Spreadsheet
 */
interface Spreadsheet {
  /** Google Sheets unique identifier */
  id: string;

  /** Spreadsheet display name */
  name: string;
}

/**
 * Interface for detailed spreadsheet metadata
 *
 * @interface SpreadsheetMetadata
 */
interface SpreadsheetMetadata {
  /** Google Sheets unique identifier */
  spreadsheetId: string;

  /** Full URL to access the spreadsheet in browser */
  spreadsheetUrl: string;

  /** Spreadsheet title/name */
  title: string;

  /** Array of individual sheets within the spreadsheet */
  sheets: Array<{
    properties: {
      /** Sheet ID (numeric, different from spreadsheet ID) */
      sheetId: number;

      /** Individual sheet name */
      title: string;

      /** Position of the sheet in the spreadsheet */
      index: number;
    };
  }>;
  // Add more metadata fields as needed, e.g., named ranges
}

/**
 * Interface representing data from a spreadsheet
 *
 * @interface SheetData
 */
interface SheetData {
  /** Google Sheets unique identifier */
  spreadsheetId: string;

  /** Name of the individual sheet within the spreadsheet */
  sheetName: string;

  /** A1 notation of the range that was fetched */
  range: string;

  /** Two-dimensional array of cell values (rows and columns) */
  values: unknown[][]; // Array of rows, where each row is an array of cells
}

/**
 * Creates an OAuth2 client with the provided access token
 *
 * @param {string} accessToken - Valid Google OAuth access token
 * @returns {Auth.OAuth2Client} Authenticated OAuth2 client for Google API requests
 * @private
 */
function createOAuthClient(accessToken: string): Auth.OAuth2Client {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

/**
 * Lists available Google Spreadsheets for the authenticated user
 *
 * Queries Google Drive API to retrieve all spreadsheet files the user has access to.
 * Limited to 200 results by default.
 *
 * @param {string} accessToken - Valid Google OAuth access token
 * @returns {Promise<Spreadsheet[]>} Array of spreadsheet objects with id and name
 * @throws {Error} If the API request fails or authentication is invalid
 *
 * @example
 * // Get all spreadsheets the user has access to
 * try {
 *   const spreadsheets = await listSpreadsheets(accessToken);
 *   // Display the spreadsheets to the user
 *   console.log(`Found ${spreadsheets.length} spreadsheets`);
 *   spreadsheets.forEach(sheet => console.log(`${sheet.name} (${sheet.id})`));
 * } catch (error) {
 *   console.error('Failed to list spreadsheets:', error);
 * }
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
 * Retrieves detailed metadata for a specific Google Spreadsheet
 *
 * Fetches information about the spreadsheet including its title, URL,
 * and all the individual sheets it contains.
 *
 * @param {string} accessToken - Valid Google OAuth access token
 * @param {string} spreadsheetId - ID of the spreadsheet to retrieve metadata for
 * @returns {Promise<SpreadsheetMetadata | null>} Spreadsheet metadata or null if not found
 * @throws {Error} If the API request fails or authentication is invalid
 *
 * @example
 * // Get metadata for a specific spreadsheet
 * try {
 *   const metadata = await getSpreadsheetMetadata(accessToken, spreadsheetId);
 *   if (metadata) {
 *     console.log(`Spreadsheet: ${metadata.title}`);
 *     console.log(`URL: ${metadata.spreadsheetUrl}`);
 *     console.log(`Sheets: ${metadata.sheets.map(s => s.properties.title).join(', ')}`);
 *   }
 * } catch (error) {
 *   console.error('Failed to get spreadsheet metadata:', error);
 * }
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
 * Reads data from a specific sheet and range within a Google Spreadsheet
 *
 * Fetches values from the specified range in A1 notation (e.g., "Sheet1!A1:D10").
 * Returns a structured object with the data and metadata about the range.
 *
 * @param {string} accessToken - Valid Google OAuth access token
 * @param {string} spreadsheetId - ID of the spreadsheet to read data from
 * @param {string} range - A1 notation range to read (e.g., "Sheet1!A1:D10")
 * @returns {Promise<SheetData | null>} Sheet data or null if the range is empty
 * @throws {Error} If the API request fails or authentication is invalid
 *
 * @example
 * // Read data from a specific range in a spreadsheet
 * try {
 *   const data = await readSheetData(accessToken, spreadsheetId, 'Invoices!A1:F20');
 *   if (data && data.values.length > 0) {
 *     // Process the data
 *     const headerRow = data.values[0];
 *     const dataRows = data.values.slice(1);
 *     console.log(`Found ${dataRows.length} rows of data`);
 *   } else {
 *     console.log('No data found in the specified range');
 *   }
 * } catch (error) {
 *   console.error('Failed to read sheet data:', error);
 * }
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
