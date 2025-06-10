# Google Sheets API Endpoints Documentation

This document outlines the API endpoints related to Google Sheets integration.

## 1. List Google Spreadsheets

*   **File Path**: `src/app/api/google/sheets/route.ts`
*   **HTTP Method(s)**: `GET`
*   **Effective URL Path**: `/api/google/sheets`
*   **Purpose**: Lists all Google Spreadsheets accessible to the authenticated user via the provided Google OAuth credentials.
*   **Authentication/Authorization**:
    *   Requires a valid Supabase session (user must be logged in).
    *   Requires valid Google OAuth credentials (access token) associated with the `dataSourceId` for the authenticated user.
*   **Request Parameters**:
    *   **Query Parameters**:
        *   `dataSourceId` (string, required): The ID of the `DataSource` record in the database that holds the Google credentials.
*   **Response Structure**:
    *   **Success (200 OK)**: `ListSpreadsheetsResponse`
        ```typescript
        // From the file:
        // export type ListSpreadsheetsResponse = {
        //   spreadsheets?: SpreadsheetInfo[];
        //   error?: string;
        //   details?: string;
        // };
        //
        // interface SpreadsheetInfo {
        //   id: string | null | undefined;
        //   name: string | null | undefined;
        // }
        //
        // A successful response will look like:
        {
          "spreadsheets": [
            {
              "id": "spreadsheetId1",
              "name": "My First Spreadsheet"
            },
            {
              "id": "spreadsheetId2",
              "name": "Another Sheet (Shared)"
            }
            // ... more spreadsheets
          ]
        }
        // If no spreadsheets are found, it will be: { "spreadsheets": [] }
        ```
    *   **Error Responses**:
        *   `400 Bad Request`:
            *   `{ "error": "Data source ID is required" }`
            *   `{ "error": "Access token not found in data source" }`
        *   `401 Unauthorized`:
            *   `{ "error": "Unauthorized" }` (if Supabase session is invalid)
            *   `{ "error": "Google API authentication failed. Please re-authenticate or check credentials." }` (if Google API reports auth issue)
        *   `404 Not Found`:
            *   `{ "error": "Data source not found or credentials missing" }`
        *   `500 Internal Server Error`:
            *   `{ "error": "<specific error message from caught exception>" }`
        *   `502 Bad Gateway`:
            *   `{ "error": "Failed to retrieve spreadsheets from Google (service returned null)" }`
        *   `503 Service Unavailable`:
            *   `{ "error": "Google Drive service is currently unavailable or not configured correctly." }`
*   **Key Dependencies**:
    *   `@/services/google/sheets`: Specifically the `listSpreadsheets` function.
    *   `@/lib/db` (Prisma): For fetching `DataSource` credentials.
    *   `@supabase/ssr`: For session management.

## 2. Get Google Spreadsheet Metadata

*   **File Path**: `src/app/api/google/sheets/[spreadsheetId]/route.ts`
*   **HTTP Method(s)**: `GET`
*   **Effective URL Path**: `/api/google/sheets/{spreadsheetId}`
*   **Purpose**: Retrieves metadata for a specified Google Spreadsheet, including its title and information about its individual sheets (tabs).
*   **Authentication/Authorization**:
    *   Requires a valid Supabase session (user must be logged in).
    *   Requires valid Google OAuth credentials (access token) associated with the `dataSourceId` for the authenticated user.
*   **Request Parameters**:
    *   **Path Parameter**:
        *   `spreadsheetId` (string, required): The ID of the Google Spreadsheet.
    *   **Query Parameters**:
        *   `dataSourceId` (string, required): The ID of the `DataSource` record in the database that holds the Google credentials.
*   **Response Structure**:
    *   **Success (200 OK)**:
        ```typescript
        {
          "spreadsheetId": "string", // The ID of the spreadsheet
          "spreadsheetTitle": "string", // The title of the spreadsheet
          "sheets": [
            {
              "id": "number", // The ID of an individual sheet (tab)
              "title": "string" // The name of an individual sheet (tab)
            }
            // ... more sheets
          ]
        }
        ```
    *   **Error Responses**:
        *   `400 Bad Request`:
            *   `{ "error": "Data source ID is required" }`
            *   `{ "error": "Spreadsheet ID is required" }`
            *   `{ "error": "Access token not found in data source" }`
        *   `401 Unauthorized`:
            *   `{ "error": "Unauthorized" }` (if Supabase session is invalid)
            *   `{ "error": "Google API authentication failed. Please re-authenticate or check credentials." }` (if Google API reports auth issue)
        *   `404 Not Found`:
            *   `{ "error": "Data source not found or credentials missing" }`
            *   `{ "error": "Spreadsheet not found or access denied." }` (if Google API reports entity not found)
        *   `500 Internal Server Error`:
            *   `{ "error": "Incomplete spreadsheet data received" }` (if data from Google service is malformed)
            *   `{ "error": "<specific error message from caught exception>" }`
        *   `502 Bad Gateway`:
            *   `{ "error": "Failed to retrieve spreadsheet metadata from Google" }`
*   **Key Dependencies**:
    *   `@/services/google/sheets`: Specifically the `getSpreadsheetMetadata` function.
    *   `@/lib/db` (Prisma): For fetching `DataSource` credentials.
    *   `@supabase/ssr`: For session management.

## 3. Get Google Sheet Data

*   **File Path**: `src/app/api/google/sheets/[spreadsheetId]/data/route.ts`
*   **HTTP Method(s)**: `GET`
*   **Effective URL Path**: `/api/google/sheets/{spreadsheetId}/data`
*   **Purpose**: Retrieves data (values) from a specified range within a Google Sheet.
*   **Authentication/Authorization**:
    *   Requires a valid Supabase session (user must be logged in).
    *   Requires valid Google OAuth credentials (access token) associated with the `dataSourceId` for the authenticated user.
*   **Request Parameters**:
    *   **Path Parameter**:
        *   `spreadsheetId` (string, required): The ID of the Google Spreadsheet.
    *   **Query Parameters**:
        *   `range` (string, required): The A1 notation of the range to retrieve (e.g., `Sheet1!A1:B10`).
        *   `dataSourceId` (string, required): The ID of the `DataSource` record in the database that holds the Google credentials.
*   **Response Structure**:
    *   **Success (200 OK)**: `GetSheetDataGeneralResponse`
        ```typescript
        // From the file:
        // export type GetSheetDataGeneralResponse = {
        //   headers?: string[]; // Potentially, though current service seems to return raw ValueRange
        //   values?: unknown[][];
        //   error?: string;
        //   details?: string;
        // };
        //
        // Actual structure from readSheetDataService seems to be Google's ValueRange:
        // interface ValueRange {
        //   range?: string;
        //   majorDimension?: string;
        //   values?: unknown[][]; // Cells can be string, number, boolean, or empty
        // }
        // So, a successful response will look like:
        {
          "range": "Sheet1!A1:B2",
          "majorDimension": "ROWS",
          "values": [
            ["Name", "Value"],
            ["Item A", 100]
          ]
        }
        ```
    *   **Error Responses**:
        *   `400 Bad Request`:
            *   `{ "error": "Data source ID is required" }`
            *   `{ "error": "Spreadsheet ID is required" }`
            *   `{ "error": "Range is required" }`
            *   `{ "error": "Access token not found in data source" }`
        *   `401 Unauthorized`:
            *   `{ "error": "Unauthorized" }` (if Supabase session is invalid)
            *   `{ "error": "Google API authentication failed. Please re-authenticate or check credentials." }` (if Google API reports auth issue)
        *   `404 Not Found`:
            *   `{ "error": "Data source not found or credentials missing" }`
            *   `{ "error": "Spreadsheet or sheet range not found." }` (if Google API reports entity not found)
        *   `500 Internal Server Error`:
            *   `{ "error": "Failed to retrieve sheet data" }`
            *   `{ "error": "<specific error message from caught exception>" }`
*   **Key Dependencies**:
    *   `@/services/google/sheets`: Specifically the `readSheetDataService` function.
    *   `@/lib/db` (Prisma): For fetching `DataSource` credentials.
    *   `@supabase/ssr`: For session management. 