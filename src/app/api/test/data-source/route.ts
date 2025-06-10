import { withAuth } from "@/lib/api/middleware";
import { ApiError } from "@/lib/api/utils";
import { prisma } from "@/lib/database/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test/data-source
 * Get test data source for the current user
 */
export const GET = withAuth(async (request, { authContext }) => {
  try {
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        clinicId: authContext.clinicId,
        name: { contains: "Test Google Sheets Connection" },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ dataSource });
  } catch (error) {
    console.error("Failed to fetch data source:", error);
    throw new ApiError("Failed to fetch data source", 500);
  }
});

/**
 * POST /api/test/data-source
 * Create a test data source for Google Sheets integration
 */
export const POST = withAuth(async (request, { authContext }) => {
  try {
    // Create a test data source
    const dataSource = await prisma.dataSource.create({
      data: {
        name: "Test Google Sheets Connection",
        spreadsheetId: `test-${Date.now()}`,
        sheetName: "Sheet1",
        syncFrequency: "manual",
        connectionStatus: "pending",
        accessToken: "pending",
        clinicId: authContext.clinicId,
      },
    });

    return NextResponse.json({
      success: true,
      dataSource: {
        id: dataSource.id,
        name: dataSource.name,
        spreadsheetId: dataSource.spreadsheetId,
        connectionStatus: dataSource.connectionStatus,
        clinicId: dataSource.clinicId,
      },
    });
  } catch (error) {
    console.error("Failed to create data source:", error);
    throw new ApiError("Failed to create data source", 500);
  }
});
