import { verifyGoogleAuth } from "./authMiddleware";

/**
 * Service for interacting with Google Sheets API
 * Uses the authMiddleware to ensure valid authentication
 */

/**
 * Fetches a spreadsheet's metadata
 * @param {string} dataSourceId - ID of the data source to use for authentication
 * @param {string} spreadsheetId - ID of the spreadsheet to fetch
 * @returns {Promise<Object>} Spreadsheet metadata
 */
export async function getSpreadsheet(dataSourceId, spreadsheetId) {
  const auth = await verifyGoogleAuth(dataSourceId);

  if (!auth.isValid) {
    throw new Error(`Authentication error: ${auth.error}`);
  }

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Sheets API error: ${error.error.message || "Unknown error"}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching spreadsheet:", error);
    throw error;
  }
}

/**
 * Fetches data from a specific sheet within a spreadsheet
 * @param {string} dataSourceId - ID of the data source to use for authentication
 * @param {string} spreadsheetId - ID of the spreadsheet
 * @param {string} range - A1 notation range to fetch (e.g., 'Sheet1!A1:E10')
 * @returns {Promise<Object>} Sheet data
 */
export async function getSheetData(dataSourceId, spreadsheetId, range) {
  const auth = await verifyGoogleAuth(dataSourceId);

  if (!auth.isValid) {
    throw new Error(`Authentication error: ${auth.error}`);
  }

  try {
    const encodedRange = encodeURIComponent(range);
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Sheets API error: ${error.error.message || "Unknown error"}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching sheet data for range ${range}:`, error);
    throw error;
  }
}

/**
 * Lists all spreadsheets available to the user
 * @param {string} dataSourceId - ID of the data source to use for authentication
 * @returns {Promise<Array>} List of available spreadsheets
 */
export async function listSpreadsheets(dataSourceId) {
  const auth = await verifyGoogleAuth(dataSourceId);

  if (!auth.isValid) {
    throw new Error(`Authentication error: ${auth.error}`);
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.spreadsheet%27",
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Drive API error: ${error.error.message || "Unknown error"}`);
    }

    const result = await response.json();
    return result.files;
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    throw error;
  }
}
