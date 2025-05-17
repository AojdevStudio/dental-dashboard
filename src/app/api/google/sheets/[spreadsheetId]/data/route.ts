import { type NextRequest, NextResponse } from "next/server";
import { getSheetData as getSheetDataService } from "@/services/google/sheets";
import { prisma } from "@/lib/prisma";
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

export async function GET(
  request: NextRequest,
  { params }: { params: { spreadsheetId: string } }
): Promise<NextResponse<GetSheetDataGeneralResponse>> {
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
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options);
        },
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

  const { spreadsheetId } = params;
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");
  const sheetName = searchParams.get("sheetName");
  const range = searchParams.get("range"); // e.g., "1:1" for headers, or "A2:D100" for data cells

  if (!dataSourceId || !sheetName || !range || !spreadsheetId) {
    const missingParams = [];
    if (!dataSourceId) missingParams.push("dataSourceId");
    if (!sheetName) missingParams.push("sheetName");
    if (!range) missingParams.push("range");
    if (!spreadsheetId) missingParams.push("spreadsheetId");
    return NextResponse.json(
      { error: `Missing required parameters: ${missingParams.join(", ")}` },
      { status: 400 }
    );
  }

  // Construct the full range string for the service, e.g., "'Sheet Name'!A1:D100"
  // Sheet names with spaces or special characters need to be quoted.
  const fullRange = sheetName.includes(" ") ? `'${sheetName}'!${range}` : `${sheetName}!${range}`;

  try {
    const authUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { clinicId: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: "Authenticated user not found in database" },
        { status: 404 }
      );
    }
    const userClinicId = authUser.clinicId;

    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: dataSourceId,
        clinicId: userClinicId,
      },
    });

    if (!dataSource) {
      return NextResponse.json(
        { error: "DataSource not found or access denied for this clinic" },
        { status: 404 }
      );
    }

    const result = (await getSheetDataService(
      dataSourceId,
      spreadsheetId,
      fullRange
    )) as ValueRange;

    if (!result || !("values" in result) || result.values === undefined || result.values === null) {
      // If result.values is undefined or null, treat as an issue or potentially an empty valid response depending on strictness.
      // Google API might return an empty ValueRange object {} if sheet itself is empty and a range like A1:Z100 is queried.
      // It might return { values: [] } if a valid range returns no data.
      // Explicitly checking for undefined/null for 'values' property.
      if (
        result &&
        "values" in result &&
        Array.isArray(result.values) &&
        result.values.length === 0
      ) {
        // This is a valid case of an empty range or sheet part returning no data.
        if (range === "1:1") {
          return NextResponse.json({ headers: [] });
        }
        return NextResponse.json({ values: [] });
      }
      console.error(
        "Invalid or missing values in data received from getSheetData service:",
        result
      );
      return NextResponse.json(
        { error: "Failed to retrieve valid sheet data or values array is missing" },
        { status: 500 }
      );
    }

    // Ensure result.values is an array before proceeding
    if (!Array.isArray(result.values)) {
      console.error("Sheet data values is not an array:", result.values);
      return NextResponse.json(
        { error: "Invalid data format received from Google Sheets API" },
        { status: 500 }
      );
    }

    if (range === "1:1") {
      if (result.values.length > 0 && Array.isArray(result.values[0])) {
        const headers = result.values[0].map((header) => String(header ?? "")); // Ensure header is string, default to empty if null/undefined
        return NextResponse.json({ headers });
      }
      return NextResponse.json({ headers: [] });
    }

    return NextResponse.json({ values: result.values });
  } catch (error) {
    console.error(
      `Failed to get sheet data for ${spreadsheetId}, sheet ${sheetName}, range ${range}:`,
      error
    );
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get sheet data", details: errorMessage },
      { status: 500 }
    );
  }
}
