import { NextRequest, NextResponse } from "next/server"
import { readSheetData } from "@/services/google/sheets"
import { prisma } from "@/lib/database/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spreadsheetId: string }> }
) {
  const { searchParams } = new URL(request.url)
  const dataSourceId = searchParams.get("dataSourceId")
  const range = searchParams.get("range")
  const { spreadsheetId } = await params

  console.log("[Test Data API] spreadsheetId:", spreadsheetId, "range:", range, "dataSourceId:", dataSourceId)

  if (!dataSourceId || !spreadsheetId || !range) {
    return NextResponse.json({ 
      error: "dataSourceId, spreadsheetId, and range are all required" 
    }, { status: 400 })
  }

  try {
    // Get the data source with tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      select: {
        accessToken: true
      }
    })

    if (!dataSource?.accessToken) {
      return NextResponse.json({ error: "Access token not found" }, { status: 400 })
    }

    // Read sheet data
    console.log("[Test Data API] Reading sheet data...")
    const data = await readSheetData(dataSource.accessToken, spreadsheetId, range)
    console.log("[Test Data API] Data received:", data?.values?.length || 0, "rows")

    return NextResponse.json({
      range: data?.range,
      majorDimension: data?.majorDimension,
      values: data?.values || []
    })
  } catch (error) {
    console.error("[Test Data API] Error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch sheet data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}