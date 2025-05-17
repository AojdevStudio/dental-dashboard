import { type NextRequest, NextResponse } from "next/server";
import {
  getSpreadsheetMetadata,
  type SpreadsheetMetadata as GoogleSpreadsheetResourceType, // Alias the imported type
} from "@/services/google/sheets";
import { prisma } from "@/lib/db";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Define API response structure types based on the aliased service type
interface SheetInfo {
  id: number; // sheetId
  title: string; // sheetName
}

export async function GET(request: NextRequest, { params }: { params: { spreadsheetId: string } }) {
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
            // Log error if setting cookie fails, e.g. in read-only context
            console.warn(`Failed to set cookie \'${name}\':`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Workaround for remove: set with maxAge 0
            cookieStore.set(name, "", { ...options, maxAge: 0 }); // No await
          } catch (error) {
            console.warn(`Failed to remove cookie \'${name}\':`, error);
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
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
  }

  if (!spreadsheetId) {
    return NextResponse.json({ error: "Spreadsheet ID is required" }, { status: 400 });
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

    // Assuming credentials structure from previous context
    const credentials = dataSource.credentials as unknown as {
      access_token: string;
    };
    const accessToken = credentials.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token not found in data source" }, { status: 400 });
    }

    const metadata: GoogleSpreadsheetResourceType | null = await getSpreadsheetMetadata(
      accessToken,
      spreadsheetId
    );

    if (!metadata) {
      return NextResponse.json(
        { error: "Failed to retrieve spreadsheet metadata from Google" },
        { status: 502 } // Bad Gateway
      );
    }

    // Ensure metadata.sheets and metadata.properties exist (they should if metadata is not null based on SpreadsheetMetadata type)
    if (!metadata.properties || !metadata.sheets) {
      console.error("Incomplete spreadsheet data structure from service:", metadata);
      return NextResponse.json({ error: "Incomplete spreadsheet data received" }, { status: 500 });
    }

    const spreadsheetTitle = metadata.properties.title;
    // Ensure sheet.properties exists before accessing sheetId and title
    const sheetsInfo: SheetInfo[] = metadata.sheets
      .filter((sheet) => sheet.properties) // Add a filter for safety
      .map((sheet) => ({
        id: sheet.properties!.sheetId, // Use non-null assertion if filter guarantees presence
        title: sheet.properties!.title,
      }));

    return NextResponse.json({
      spreadsheetId: metadata.spreadsheetId,
      spreadsheetTitle,
      sheets: sheetsInfo,
    });
  } catch (error) {
    console.error("Error getting spreadsheet metadata:", error);
    let errorMessage = "Internal server error";
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("Requested entity was not found")) {
        statusCode = 404;
        errorMessage = "Spreadsheet not found or access denied.";
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
