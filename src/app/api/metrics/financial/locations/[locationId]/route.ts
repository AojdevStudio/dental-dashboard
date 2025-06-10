import type { Clinic, DataSource, Location, LocationFinancial, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/database/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description Represents a `LocationFinancial` record augmented with details about
 * its associated `Location` (including `Clinic`) and optionally its `DataSource`.
 */
type FinancialRecordWithDetails = LocationFinancial & {
  location: Location & {
    clinic: Pick<Clinic, "id" | "name">;
  };
  dataSource?: Pick<DataSource, "id" | "name" | "lastSyncedAt"> | null;
};

/**
 * @description Defines the structure for data used when creating or updating
 * a `LocationFinancial` record.
 * It includes calculated fields like `netProduction` and `totalCollections`,
 * along with optional raw financial figures.
 */
type LocationFinancialUpdateData = {
  netProduction: number;
  totalCollections: number;
  date?: Date;
  production?: number;
  adjustments?: number;
  writeOffs?: number;
  patientIncome?: number;
  insuranceIncome?: number;
  unearned?: number | null;
};

export async function GET(request: NextRequest, { params }: { params: { locationId: string } }) {
  try {
    const { locationId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const summary = searchParams.get("summary") === "true";

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
        },
        { status: 404 }
      );
    }

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    const where = {
      locationId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    };

    if (summary) {
      // Return summary statistics
      const [recentRecords, totals] = await Promise.all([
        // Get most recent 10 records
        prisma.locationFinancial.findMany({
          where,
          orderBy: { date: "desc" },
          take: 10,
          select: {
            date: true,
            production: true,
            netProduction: true,
            totalCollections: true,
          },
        }),
        // Get aggregate totals
        prisma.locationFinancial.aggregate({
          where,
          _sum: {
            production: true,
            adjustments: true,
            writeOffs: true,
            netProduction: true,
            patientIncome: true,
            insuranceIncome: true,
            totalCollections: true,
          },
          _avg: {
            production: true,
            netProduction: true,
            totalCollections: true,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      // Calculate date range for the summary
      const [dateRange] = await prisma.$queryRaw<[{ min_date: Date; max_date: Date }]>`
        SELECT 
          MIN(date) as min_date,
          MAX(date) as max_date
        FROM location_financial 
        WHERE location_id = ${locationId}
        ${Object.keys(dateFilter).length > 0 ? `AND date >= ${dateFilter.gte} AND date <= ${dateFilter.lte}` : ""}
      `;

      return NextResponse.json({
        success: true,
        data: {
          location,
          summary: {
            dateRange: {
              start: dateRange?.min_date,
              end: dateRange?.max_date,
            },
            totals: {
              records: totals._count.id,
              totalProduction: totals._sum.production || 0,
              totalAdjustments: totals._sum.adjustments || 0,
              totalWriteOffs: totals._sum.writeOffs || 0,
              totalNetProduction: totals._sum.netProduction || 0,
              totalPatientIncome: totals._sum.patientIncome || 0,
              totalInsuranceIncome: totals._sum.insuranceIncome || 0,
              totalCollections: totals._sum.totalCollections || 0,
            },
            averages: {
              avgProduction: totals._avg.production || 0,
              avgNetProduction: totals._avg.netProduction || 0,
              avgCollections: totals._avg.totalCollections || 0,
            },
          },
          recentRecords,
        },
      });
    }
    // Return detailed records
    const financialData = await prisma.locationFinancial.findMany({
      where,
      include: {
        dataSource: {
          select: {
            id: true,
            name: true,
            lastSyncedAt: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        location,
        financialData,
      },
    });
  } catch (error) {
    console.error("Error fetching location financial data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { locationId: string } }) {
  try {
    const { locationId } = params;
    const body = await request.json();
    const {
      recordId,
      date,
      production,
      adjustments,
      writeOffs,
      patientIncome,
      insuranceIncome,
      unearned,
    } = body;

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
        },
        { status: 404 }
      );
    }

    let financialRecord: FinancialRecordWithDetails | undefined;

    if (recordId) {
      // Update existing record
      const existingRecord = await prisma.locationFinancial.findFirst({
        where: {
          id: recordId,
          locationId,
        },
      });

      if (!existingRecord) {
        return NextResponse.json(
          {
            success: false,
            error: "Financial record not found",
          },
          { status: 404 }
        );
      }

      // Calculate derived fields
      const netProduction =
        Number.parseFloat(production || existingRecord.production.toString()) -
        Number.parseFloat(adjustments || existingRecord.adjustments.toString()) -
        Number.parseFloat(writeOffs || existingRecord.writeOffs.toString());

      const totalCollections =
        Number.parseFloat(patientIncome || existingRecord.patientIncome.toString()) +
        Number.parseFloat(insuranceIncome || existingRecord.insuranceIncome.toString());

      const updateData: LocationFinancialUpdateData = { netProduction, totalCollections };
      if (date !== undefined) updateData.date = new Date(date);
      if (production !== undefined) updateData.production = Number.parseFloat(production);
      if (adjustments !== undefined) updateData.adjustments = Number.parseFloat(adjustments);
      if (writeOffs !== undefined) updateData.writeOffs = Number.parseFloat(writeOffs);
      if (patientIncome !== undefined) updateData.patientIncome = Number.parseFloat(patientIncome);
      if (insuranceIncome !== undefined)
        updateData.insuranceIncome = Number.parseFloat(insuranceIncome);
      if (unearned !== undefined)
        updateData.unearned = unearned ? Number.parseFloat(unearned) : null;

      financialRecord = await prisma.locationFinancial.update({
        where: { id: recordId },
        data: updateData,
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } else if (date) {
      // Upsert based on date
      const netProduction =
        Number.parseFloat(production || "0") -
        Number.parseFloat(adjustments || "0") -
        Number.parseFloat(writeOffs || "0");

      const totalCollections =
        Number.parseFloat(patientIncome || "0") + Number.parseFloat(insuranceIncome || "0");

      financialRecord = await prisma.locationFinancial.upsert({
        where: {
          clinicId_locationId_date: {
            clinicId: location.clinicId,
            locationId,
            date: new Date(date),
          },
        },
        update: {
          production: Number.parseFloat(production || "0"),
          adjustments: Number.parseFloat(adjustments || "0"),
          writeOffs: Number.parseFloat(writeOffs || "0"),
          netProduction,
          patientIncome: Number.parseFloat(patientIncome || "0"),
          insuranceIncome: Number.parseFloat(insuranceIncome || "0"),
          totalCollections,
          unearned: unearned ? Number.parseFloat(unearned) : null,
        },
        create: {
          clinicId: location.clinicId,
          locationId,
          date: new Date(date),
          production: Number.parseFloat(production || "0"),
          adjustments: Number.parseFloat(adjustments || "0"),
          writeOffs: Number.parseFloat(writeOffs || "0"),
          netProduction,
          patientIncome: Number.parseFloat(patientIncome || "0"),
          insuranceIncome: Number.parseFloat(insuranceIncome || "0"),
          totalCollections,
          unearned: unearned ? Number.parseFloat(unearned) : null,
        },
        include: {
          location: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either recordId or date is required for update",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: financialRecord,
      message: "Financial data updated successfully",
    });
  } catch (error) {
    console.error("Error updating location financial data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update location financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
