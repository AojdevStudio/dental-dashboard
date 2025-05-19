import { type NextRequest, NextResponse } from "next/server";
import { listSpreadsheets } from "@/services/google/sheets";
import { prisma } from "@/lib/db";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// import { withAuth } from '@/utils/middleware'; // If you have a withAuth wrapper
// import { getRequestAuthData } from '@/utils/authHelpers'; // If you have a helper for user session

// Define a local interface for what we expect from listSpreadsheets
interface GoogleDriveFile {
  id: string | null | undefined;
  name: string | null | undefined;
  // Add other properties if they are used or expected from listSpreadsheets
}

// Define the expected structure for the API response
interface SpreadsheetInfo {
  id: string | null | undefined;
  name: string | null | undefined;
}

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
