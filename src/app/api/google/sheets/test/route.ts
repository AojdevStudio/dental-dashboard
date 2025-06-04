import { prisma } from "@/lib/database/prisma";
import { createClient } from "@/lib/supabase/server";
import { listSpreadsheets } from "@/services/google/sheets";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    return NextResponse.json({ error: "dataSourceId is required" }, { status: 400 });
  }

  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the data source with tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        expiryDate: true,
      },
    });

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    if (!dataSource.accessToken || dataSource.accessToken === "pending") {
      return NextResponse.json({ error: "Access token not found in data source" }, { status: 400 });
    }

    // List spreadsheets using the Google Sheets service
    const spreadsheets = await listSpreadsheets(dataSource.accessToken);

    return NextResponse.json({
      spreadsheets: spreadsheets || [],
      count: spreadsheets?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch spreadsheets:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch spreadsheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
