import { type NextRequest, NextResponse } from "next/server";
import { readSheetData as readSheetDataService } from "@/services/google/sheets";
import { prisma } from "@/lib/db";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Define expected structure from getSheetDataService (Google Sheets API ValueRange)
interface ValueRange {
  range?: string;
  majorDimension?: string;
  values?: unknown[][]; // Cells can be string, number, boolean, or empty
}

// Define API response structures
export type GetSheetHeadersResponse = {
  headers?: string[];
  error?: string;
  details?: string;
};

export type GetSheetValuesResponse = {
  values?: unknown[][];
  error?: string;
  details?: string;
};

// Combined type for flexibility, or use a type guard on the GET handler return
export type GetSheetDataGeneralResponse = {
  headers?: string[];
  values?: unknown[][];
  error?: string;
  details?: string;
};

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
