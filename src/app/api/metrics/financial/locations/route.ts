import { prisma } from "@/lib/database/client";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @description Defines the shape of the 'where' clause used for filtering
 * location financial data in Prisma queries.
 */
type LocationFinancialWhereInput = {
  clinicId?: string;
  locationId?: string;
  date?: {
    gte?: Date;
    lte?: Date;
  };
};

/**
 * @description Represents the structure of an item returned by the raw SQL query
 * when aggregating financial data. It includes the period, IDs, and various
 * summed/averaged financial metrics.
 */
type AggregatedFinancialItem = {
  period: Date; // Or string, depending on how DATE_TRUNC is handled by the driver
  clinic_id: string;
  location_id: string;
  total_production: string | null;
  total_adjustments: string | null;
  total_write_offs: string | null;
  total_net_production: string | null;
  total_patient_income: string | null;
  total_insurance_income: string | null;
  total_collections: string | null;
  avg_unearned: string | null;
  record_count: bigint; // COUNT(*) typically returns bigint
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const locationId = searchParams.get("locationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const groupBy = searchParams.get("groupBy"); // 'day', 'week', 'month'

    // Build where clause
    const where: LocationFinancialWhereInput = {};

    if (clinicId) {
      where.clinicId = clinicId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Base query options
    const baseOptions = {
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        dataSource: {
          select: {
            id: true,
            name: true,
            lastSyncedAt: true,
          },
        },
      },
    };

    if (groupBy) {
      // Return aggregated data
      let dateGrouping: string;
      switch (groupBy) {
        case "week":
          dateGrouping = `DATE_TRUNC('week', date)`;
          break;
        case "month":
          dateGrouping = `DATE_TRUNC('month', date)`;
          break;
        default:
          dateGrouping = `DATE_TRUNC('day', date)`;
      }

      // Build parameterized query conditions
      const conditions = [];
      const params = [];

      if (where.clinicId) {
        conditions.push(`clinic_id = ${params.length + 1}`);
        params.push(where.clinicId);
      }

      if (where.locationId) {
        conditions.push(`location_id = ${params.length + 1}`);
        params.push(where.locationId);
      }

      if (where.date?.gte) {
        conditions.push(`date >= ${params.length + 1}`);
        params.push(where.date.gte);
      }

      if (where.date?.lte) {
        conditions.push(`date <= ${params.length + 1}`);
        params.push(where.date.lte);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const aggregatedData = (await prisma.$queryRawUnsafe(
        `
        SELECT 
          ${dateGrouping} as period,
          clinic_id,
          location_id,
          SUM(production) as total_production,
          SUM(adjustments) as total_adjustments,
          SUM(write_offs) as total_write_offs,
          SUM(net_production) as total_net_production,
          SUM(patient_income) as total_patient_income,
          SUM(insurance_income) as total_insurance_income,
          SUM(total_collections) as total_collections,
          AVG(unearned) as avg_unearned,
          COUNT(*) as record_count
        FROM location_financial 
        ${whereClause}
        GROUP BY period, clinic_id, location_id
        ORDER BY period DESC, clinic_id, location_id
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
        ...params,
        limit,
        offset
      )) as AggregatedFinancialItem[];

      // Get clinic and location details for aggregated data
      const enrichedData = await Promise.all(
        aggregatedData.map(async (item) => {
          const [clinic, location] = await Promise.all([
            prisma.clinic.findUnique({
              where: { id: item.clinic_id },
              select: { id: true, name: true },
            }),
            prisma.location.findUnique({
              where: { id: item.location_id },
              select: { id: true, name: true, address: true },
            }),
          ]);

          return {
            period: item.period,
            clinic,
            location,
            metrics: {
              totalProduction: Number.parseFloat(item.total_production || "0"),
              totalAdjustments: Number.parseFloat(item.total_adjustments || "0"),
              totalWriteOffs: Number.parseFloat(item.total_write_offs || "0"),
              totalNetProduction: Number.parseFloat(item.total_net_production || "0"),
              totalPatientIncome: Number.parseFloat(item.total_patient_income || "0"),
              totalInsuranceIncome: Number.parseFloat(item.total_insurance_income || "0"),
              totalCollections: Number.parseFloat(item.total_collections || "0"),
              avgUnearned: Number.parseFloat(item.avg_unearned || "0"),
              recordCount: Number.parseInt(item.record_count.toString() || "0"),
            },
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: enrichedData,
        pagination: {
          page,
          limit,
          hasMore: enrichedData.length === limit,
        },
        groupBy,
      });
    }

    // If not grouping, return individual records with pagination
    const [data, total] = await Promise.all([
      prisma.locationFinancial.findMany({
        ...baseOptions,
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.locationFinancial.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + data.length < total,
      },
    });
  } catch (e: unknown) {
    console.error("Error fetching location financial data:", e);
    let errorMessage = "An unknown error occurred";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location financial data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinicId,
      locationId,
      date,
      production,
      adjustments,
      writeOffs,
      patientIncome,
      insuranceIncome,
      unearned,
      dataSourceId,
      createdBy,
    } = body;

    // Validate required fields
    if (!clinicId || !locationId || !date || production === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: clinicId, locationId, date, and production are required",
        },
        { status: 400 }
      );
    }

    // Verify clinic and location exist
    const [clinic, location] = await Promise.all([
      prisma.clinic.findUnique({ where: { id: clinicId } }),
      prisma.location.findUnique({ where: { id: locationId } }),
    ]);

    if (!clinic) {
      return NextResponse.json(
        {
          success: false,
          error: "Clinic not found",
        },
        { status: 404 }
      );
    }

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found",
        },
        { status: 404 }
      );
    }

    if (location.clinicId !== clinicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Location does not belong to the specified clinic",
        },
        { status: 400 }
      );
    }

    // Calculate derived fields
    const netProduction =
      Number.parseFloat(production) -
      Number.parseFloat(adjustments || "0") -
      Number.parseFloat(writeOffs || "0");
    const totalCollections =
      Number.parseFloat(patientIncome || "0") + Number.parseFloat(insuranceIncome || "0");

    // Check for existing record on same date
    const existingRecord = await prisma.locationFinancial.findFirst({
      where: {
        clinicId,
        locationId,
        date: new Date(date),
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Financial data already exists for this location and date. Use PUT to update.",
        },
        { status: 409 }
      );
    }

    // Create the financial record
    const financialRecord = await prisma.locationFinancial.create({
      data: {
        clinicId,
        locationId,
        date: new Date(date),
        production: Number.parseFloat(production),
        adjustments: Number.parseFloat(adjustments || "0"),
        writeOffs: Number.parseFloat(writeOffs || "0"),
        netProduction,
        patientIncome: Number.parseFloat(patientIncome || "0"),
        insuranceIncome: Number.parseFloat(insuranceIncome || "0"),
        totalCollections,
        unearned: unearned ? Number.parseFloat(unearned) : null,
        dataSourceId: dataSourceId || null,
        createdBy: createdBy || null,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: financialRecord,
        message: "Financial data created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating location financial data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create location financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
