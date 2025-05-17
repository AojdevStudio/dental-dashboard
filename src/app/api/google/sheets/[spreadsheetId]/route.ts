import { type NextRequest, NextResponse } from "next/server";
import { getSpreadsheet as getSpreadsheetService } from "@/services/google/sheets";
import { prisma } from "@/lib/prisma";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Define expected structure from getSpreadsheetService
interface GoogleSheetProperty {
  sheetId: number;
  title: string;
  index?: number;
  // Other sheet properties if needed
}

interface GoogleSpreadsheetResource {
  spreadsheetId: string;
  properties: {
    title: string;
    // Other spreadsheet properties
  };
  sheets: Array<{
    properties: GoogleSheetProperty;
    // Other data per sheet if relevant
  }>;
  // Other top-level properties of spreadsheet resource
}

// Define API response structure
interface SheetInfo {
  id: number; // sheetId
  title: string; // sheetName
}
export type GetSpreadsheetMetadataResponse = {
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  sheets?: SheetInfo[];
  error?: string;
  details?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { spreadsheetId: string } }
): Promise<NextResponse<GetSpreadsheetMetadataResponse>> {
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

  if (!dataSourceId) {
    return NextResponse.json({ error: "dataSourceId is required" }, { status: 400 });
  }
  if (!spreadsheetId) {
    // This case should be rare due to Next.js routing but good for robustness
    return NextResponse.json({ error: "spreadsheetId is required in path" }, { status: 400 });
  }

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

    const rawSpreadsheet = (await getSpreadsheetService(
      dataSourceId,
      spreadsheetId
    )) as GoogleSpreadsheetResource;

    if (!rawSpreadsheet || !rawSpreadsheet.properties || !rawSpreadsheet.sheets) {
      console.error("Invalid spreadsheet data received from service:", rawSpreadsheet);
      return NextResponse.json(
        { error: "Failed to retrieve valid spreadsheet data" },
        { status: 500 }
      );
    }

    const spreadsheetTitle = rawSpreadsheet.properties.title;
    const sheets: SheetInfo[] = rawSpreadsheet.sheets.map((sheet) => ({
      id: sheet.properties.sheetId,
      title: sheet.properties.title,
    }));

    return NextResponse.json({
      spreadsheetId: rawSpreadsheet.spreadsheetId,
      spreadsheetTitle,
      sheets,
    });
  } catch (error) {
    console.error(`Failed to get spreadsheet metadata for ${spreadsheetId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get spreadsheet metadata", details: errorMessage },
      { status: 500 }
    );
  }
}
