import { prisma } from "@/lib/database/prisma";
import { listSpreadsheets } from "@/services/google/sheets";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");

  console.log("[Test API] Starting with dataSourceId:", dataSourceId);

  if (!dataSourceId) {
    return NextResponse.json({ error: "dataSourceId is required" }, { status: 400 });
  }

  try {
    // Get the data source with tokens directly
    console.log("[Test API] Fetching data source from database...");
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        expiryDate: true,
        connectionStatus: true,
      },
    });

    console.log("[Test API] Data source found:", {
      id: dataSource?.id,
      hasAccessToken: !!dataSource?.accessToken,
      connectionStatus: dataSource?.connectionStatus,
    });

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    if (!dataSource.accessToken || dataSource.accessToken === "pending") {
      return NextResponse.json({ error: "Access token not found in data source" }, { status: 400 });
    }

    // List spreadsheets using the Google Sheets service
    console.log("[Test API] Calling listSpreadsheets...");
    const spreadsheets = await listSpreadsheets(dataSource.accessToken);
    console.log("[Test API] Spreadsheets received:", spreadsheets?.length || 0);

    return NextResponse.json({
      success: true,
      spreadsheets: spreadsheets || [],
      count: spreadsheets?.length || 0,
    });
  } catch (error) {
    console.error("[Test API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch spreadsheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
