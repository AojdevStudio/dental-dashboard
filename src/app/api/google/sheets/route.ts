/**
 * Google Sheets API Route
 * 
 * This API route provides access to Google Sheets functionality through the Google Drive API.
 * It allows authenticated users to list their available spreadsheets from Google Drive.
 * The route requires authentication via Supabase and verifies that the user has access to the
 * requested data source containing Google API credentials.
 */

import { type NextRequest, NextResponse } from "next/server";
import { listSpreadsheets } from "@/services/google/sheets";
import { prisma } from "@/lib/db";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// import { withAuth } from '@/utils/middleware'; // If you have a withAuth wrapper
// import { getRequestAuthData } from '@/utils/authHelpers'; // If you have a helper for user session

/**
 * Interface representing a Google Drive file as returned by the Google Drive API.
 * Contains minimal information needed for spreadsheet listing functionality.
 * 
 * @typedef {Object} GoogleDriveFile
 * @property {string|null|undefined} id - The unique identifier of the file in Google Drive
 * @property {string|null|undefined} name - The display name of the file
 */
interface GoogleDriveFile {
  id: string | null | undefined;
  name: string | null | undefined;
  // Add other properties if they are used or expected from listSpreadsheets
}

/**
 * Interface representing spreadsheet information for the API response.
 * Simplified version of GoogleDriveFile with only the essential properties.
 * 
 * @typedef {Object} SpreadsheetInfo
 * @property {string|null|undefined} id - The unique identifier of the spreadsheet
 * @property {string|null|undefined} name - The display name of the spreadsheet
 */
interface SpreadsheetInfo {
  id: string | null | undefined;
  name: string | null | undefined;
}

/**
 * Type definition for the response from the list spreadsheets endpoint.
 * 
 * @typedef {Object} ListSpreadsheetsResponse
 * @property {SpreadsheetInfo[]} [spreadsheets] - Array of spreadsheet information objects if successful
 * @property {string} [error] - Error message if the request failed
 * @property {string} [details] - Additional error details if available
 */
export type ListSpreadsheetsResponse = {
  spreadsheets?: SpreadsheetInfo[];
  error?: string;
  details?: string;
};

// Placeholder for getting user ID from request if needed for dataSource verification
// const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
//   // Implement your actual logic to get user ID, e.g., from Supabase session
//   return 'test-user-id'; // Replace with actual implementation
// };

// Define the type for the cookie store using ReturnType and Awaited
// type CookieStoreType = ReturnType<typeof cookies>; // This would be Promise<ReadonlyRequestCookies>
// type ActualCookieStoreType = Awaited<CookieStoreType>; // This would be ReadonlyRequestCookies

/**
 * Handles GET requests to retrieve a list of Google Spreadsheets available to the user.
 * This endpoint requires authentication via Supabase and access to a valid Google API data source.
 * 
 * The function performs the following steps:
 * 1. Authenticates the user using Supabase session cookies
 * 2. Validates the requested data source belongs to the authenticated user
 * 3. Retrieves Google API credentials from the data source
 * 4. Calls the Google Drive API to list available spreadsheets
 * 5. Returns a formatted list of spreadsheets to the client
 *
 * @param {NextRequest} request - The incoming request object
 *   - request.searchParams.dataSourceId: ID of the data source containing Google API credentials
 * @returns {Promise<NextResponse>} JSON response with spreadsheet list or error
 *   - 200: Success with {spreadsheets: SpreadsheetInfo[]}
 *   - 400: Bad request if dataSourceId is missing or invalid
 *   - 401: Unauthorized if user is not authenticated or has invalid Google credentials
 *   - 404: Not found if the data source doesn't exist
 *   - 500: Server error for unexpected errors
 *   - 502: Bad gateway if Google API returns null
 *   - 503: Service unavailable if Google Drive API is unreachable
 * @throws {Error} If there's an unexpected error during execution
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies(); // cookies() returns the store directly
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value; // No await
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options); // No await
          } catch (error) {
            console.warn(`Failed to set cookie '${name}' in GET handler:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 }); // No await, using set for removal
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

  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");
  // Removed sheetName as it's not required for listing spreadsheets

  if (!dataSourceId) {
    return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
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

    const rawSpreadsheetFiles: GoogleDriveFile[] | null = await listSpreadsheets(accessToken);

    if (rawSpreadsheetFiles === null) {
      // Check for explicit null from service
      return NextResponse.json(
        { error: "Failed to retrieve spreadsheets from Google (service returned null)" },
        { status: 502 }
      );
    }

    // If rawSpreadsheetFiles is an empty array, it's a valid response (no files found)
    const spreadsheets: SpreadsheetInfo[] = rawSpreadsheetFiles.map((file) => ({
      id: file.id,
      name: file.name,
    }));

    return NextResponse.json({ spreadsheets });
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    let errorMessage = "Internal server error";
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if (
        error.message.includes("API key not valid") ||
        error.message.includes("Invalid Credentials")
      ) {
        statusCode = 401;
        errorMessage =
          "Google API authentication failed. Please re-authenticate or check credentials.";
      } else if (error.message.includes("Unable to retrieve Drive API client")) {
        statusCode = 503;
        errorMessage = "Google Drive service is currently unavailable or not configured correctly.";
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
