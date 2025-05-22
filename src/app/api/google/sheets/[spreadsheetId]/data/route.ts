/**
 * Google Sheets Data API Route
 * 
 * This API route provides access to data within a specific Google Spreadsheet.
 * It allows authenticated users to retrieve data from a specified range within a spreadsheet.
 * The route requires authentication via Supabase and verifies that the user has access to the
 * requested data source containing Google API credentials.
 */

import { type NextRequest, NextResponse } from "next/server";
import { readSheetData as readSheetDataService } from "@/services/google/sheets";
import { prisma } from "@/lib/db";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Interface representing the response structure from Google Sheets API.
 * Based on the ValueRange object from Google Sheets API v4.
 * 
 * @typedef {Object} ValueRange
 * @property {string} [range] - The range that was read from the spreadsheet
 * @property {string} [majorDimension] - The dimension of the data ("ROWS" or "COLUMNS")
 * @property {unknown[][]} [values] - The data values as a 2D array
 */
interface ValueRange {
  range?: string;
  majorDimension?: string;
  values?: unknown[][]; // Cells can be string, number, boolean, or empty
}

/**
 * Type definition for the response when requesting only headers from a sheet.
 * 
 * @typedef {Object} GetSheetHeadersResponse
 * @property {string[]} [headers] - Array of header values from the first row
 * @property {string} [error] - Error message if the request failed
 * @property {string} [details] - Additional error details if available
 */
export type GetSheetHeadersResponse = {
  headers?: string[];
  error?: string;
  details?: string;
};

/**
 * Type definition for the response when requesting data values from a sheet.
 * 
 * @typedef {Object} GetSheetValuesResponse
 * @property {unknown[][]} [values] - 2D array of cell values
 * @property {string} [error] - Error message if the request failed
 * @property {string} [details] - Additional error details if available
 */
export type GetSheetValuesResponse = {
  values?: unknown[][];
  error?: string;
  details?: string;
};

/**
 * Combined type for general sheet data responses that may include both headers and values.
 * 
 * @typedef {Object} GetSheetDataGeneralResponse
 * @property {string[]} [headers] - Array of header values from the first row
 * @property {unknown[][]} [values] - 2D array of cell values
 * @property {string} [error] - Error message if the request failed
 * @property {string} [details] - Additional error details if available
 */
export type GetSheetDataGeneralResponse = {
  headers?: string[];
  values?: unknown[][];
  error?: string;
  details?: string;
};

/**
 * Handles GET requests to retrieve data from a specific Google Spreadsheet.
 * This endpoint requires authentication via Supabase and access to a valid Google API data source.
 * 
 * The function performs the following steps:
 * 1. Authenticates the user using Supabase session cookies
 * 2. Validates the requested data source belongs to the authenticated user
 * 3. Retrieves Google API credentials from the data source
 * 4. Calls the Google Sheets API to read data from the specified range
 * 5. Returns the formatted sheet data to the client
 *
 * @param {NextRequest} request - The incoming request object
 *   - request.searchParams.range: The A1 notation range to read from the spreadsheet
 *   - request.searchParams.dataSourceId: ID of the data source containing Google API credentials
 * @param {Object} params - Route parameters from the dynamic route
 * @param {string} params.spreadsheetId - The ID of the Google Spreadsheet to read from
 * @returns {Promise<NextResponse>} JSON response with spreadsheet data or error
 *   - 200: Success with sheet data (headers and/or values)
 *   - 400: Bad request if required parameters are missing
 *   - 401: Unauthorized if user is not authenticated or has invalid Google credentials
 *   - 404: Not found if the data source or spreadsheet doesn't exist
 *   - 500: Server error for unexpected errors
 * @throws {Error} If there's an unexpected error during execution
 */
export async function GET(request: NextRequest, { params }: { params: { spreadsheetId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.warn(`Failed to set cookie '${name}' in GET handler:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.warn(`Failed to remove cookie '${name}' in GET handler:`, error);
          }
        },
      },
    }
  );

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("Error getting session or no session:", sessionError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const spreadsheetId = params.spreadsheetId;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range");
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
  }

  if (!spreadsheetId) {
    return NextResponse.json({ error: "Spreadsheet ID is required" }, { status: 400 });
  }

  if (!range) {
    return NextResponse.json({ error: "Range is required" }, { status: 400 });
  }

  try {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId, userId: userId },
      select: { credentials: true },
    });

    if (!dataSource || !dataSource.credentials) {
      return NextResponse.json(
        { error: "Data source not found or credentials missing" },
        { status: 404 }
      );
    }

    const credentials = dataSource.credentials as unknown as { access_token: string };
    const accessToken = credentials.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token not found in data source" }, { status: 400 });
    }

    const sheetData = await readSheetDataService(accessToken, spreadsheetId, range);

    if (!sheetData) {
      return NextResponse.json({ error: "Failed to retrieve sheet data" }, { status: 500 });
    }
    return NextResponse.json(sheetData);
  } catch (error) {
    console.error("Error getting sheet data:", error);
    let errorMessage = "Internal server error";
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("Requested entity was not found")) {
        statusCode = 404;
        errorMessage = "Spreadsheet or sheet range not found.";
      } else if (
        error.message.includes("API key not valid") ||
        error.message.includes("Invalid Credentials")
      ) {
        statusCode = 401;
        errorMessage =
          "Google API authentication failed. Please re-authenticate or check credentials.";
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
