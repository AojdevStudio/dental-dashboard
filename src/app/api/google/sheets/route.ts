import { type NextRequest, NextResponse } from "next/server";
import { listSpreadsheets as listSpreadsheetsService } from "@/services/google/sheets";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is here for DS verification
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// import { withAuth } from '@/utils/middleware'; // If you have a withAuth wrapper
// import { getRequestAuthData } from '@/utils/authHelpers'; // If you have a helper for user session

// Define the expected structure of a file object from listSpreadsheetsService
interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
  // Add any other properties you expect or might use from the Drive API File resource
}

// Define response type based on get-api-route.mdc guidelines
// This is a simplified example; the actual service might return more complex file objects.
interface SpreadsheetInfo {
  id: string;
  name: string;
  // Add other relevant fields from the Drive API File resource if needed
  // e.g., modifiedTime,webViewLink etc.
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

export async function GET(request: NextRequest): Promise<NextResponse<ListSpreadsheetsResponse>> {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get("sheetName");
  const clinicId = searchParams.get("clinicId"); // Get clinicId from query params

  if (!sheetName) {
    return NextResponse.json({ error: "sheetName query parameter is required" }, { status: 400 });
  }

  if (!clinicId) {
    return NextResponse.json({ error: "clinicId query parameter is required" }, { status: 400 });
  }

  try {
    // If the linter believes cookies() returns a Promise, we must await it.
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              // Using for...of as per linter preference
              for (const { name, value, options } of cookiesToSet) {
                // The rule specifies using cookieStore.set here internally for setAll
                // Assuming direct compatibility of Supabase CookieOptions with next/headers set options
                cookieStore.set(name, value, options);
              }
            } catch (error) {
              // The `setAll` method was called from a Server Component or other context
              // where direct cookie setting might fail or is not applicable.
              // Supabase docs mention this can be ignored if middleware refreshes sessions.
              // Log error for visibility during development if it's unexpected.
              console.warn("Supabase setAll cookie operation failed in current context:", error);
            }
          },
          // No direct `remove` or `delete` here as per supabase-auth-setup.mdc
          // Supabase manages its own session cookies via getAll/setAll interactions.
        },
      }
    );
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
    if (!session) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const authUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { clinicId: true },
    });

    if (!authUser) {
      // Should not happen if session is valid and user exists
      return NextResponse.json(
        { error: "Authenticated user not found in database" },
        { status: 404 }
      );
    }
    const userClinicId = authUser.clinicId;

    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: clinicId,
        clinicId: userClinicId,
      },
    });

    if (!dataSource) {
      return NextResponse.json(
        { error: "DataSource not found or access denied for this clinic" },
        { status: 404 }
      );
    }

    const files: GoogleDriveFile[] = await listSpreadsheetsService(clinicId);

    const spreadsheets: SpreadsheetInfo[] = files.map((file) => ({
      id: file.id,
      name: file.name,
    }));

    return NextResponse.json({ spreadsheets });
  } catch (error) {
    console.error("Failed to list spreadsheets:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to list spreadsheets", details: errorMessage },
      { status: 500 }
    );
  }
}
