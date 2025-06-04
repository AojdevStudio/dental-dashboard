import { prisma } from "@/lib/database/prisma";
import { getSpreadsheetMetadata } from "@/services/google/sheets";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spreadsheetId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");
  const { spreadsheetId } = await params;

  console.log("[Test Metadata API] spreadsheetId:", spreadsheetId, "dataSourceId:", dataSourceId);

  if (!dataSourceId || !spreadsheetId) {
    return NextResponse.json(
      {
        error: "Both dataSourceId and spreadsheetId are required",
      },
      { status: 400 }
    );
  }

  try {
    // Get the data source with tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      select: {
        accessToken: true,
      },
    });

    if (!dataSource?.accessToken) {
      return NextResponse.json({ error: "Access token not found" }, { status: 400 });
    }

    // Get spreadsheet metadata
    console.log("[Test Metadata API] Fetching metadata...");
    const metadata = await getSpreadsheetMetadata(dataSource.accessToken, spreadsheetId);
    console.log("[Test Metadata API] Metadata received:", metadata?.sheets?.length || 0, "sheets");

    return NextResponse.json({
      spreadsheetId: metadata?.spreadsheetId,
      spreadsheetTitle: metadata?.properties?.title,
      sheets:
        metadata?.sheets?.map((sheet: any) => ({
          id: sheet.properties?.sheetId,
          title: sheet.properties?.title,
        })) || [],
    });
  } catch (error) {
    console.error("[Test Metadata API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
