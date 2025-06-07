import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/database/client";

export interface LocationWithMetrics {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  clinic: {
    id: string;
    name: string;
  };
  providers: {
    id: string;
    name: string;
    providerType: string;
    isPrimary: boolean;
  }[];
  financialSummary: {
    totalRecords: number;
    totalProduction: number;
    avgProduction: number;
    lastRecordDate: Date | null;
  };
  _count: {
    providers: number;
    financials: number;
  };
}

/**
 * Describes the raw row structure returned by the getLocationFinancialSummary query.
 */
interface RawLocationFinancialSummaryRow {
  location_id: string;
  location_name: string;
  clinic_id: string;
  clinic_name: string;
  period_start: string; // Dates are strings from raw query
  period_end: string; // Dates are strings from raw query
  total_production: string | null;
  total_adjustments: string | null;
  total_write_offs: string | null;
  total_net_production: string | null;
  total_collections: string | null;
  avg_daily_production: string | null;
  record_count: string | number; // COUNT can return string or number depending on DB
  last_sync_date: string | null; // Dates are strings from raw query
}

/**
 * Describes the raw row structure returned by the getTopPerformingLocations query.
 */
interface RawTopPerformingLocationRow {
  id: string;
  name: string;
  address: string | null;
  clinic_name: string;
  total_production: string | null;
  total_net_production: string | null;
  total_collections: string | null;
  avg_daily_production: string | null;
  production_days: string | number;
  provider_count: string | number;
}

export interface LocationFinancialSummary {
  locationId: string;
  locationName: string;
  clinicId: string;
  clinicName: string;
  periodStart: Date;
  periodEnd: Date;
  totalProduction: number;
  totalAdjustments: number;
  totalWriteOffs: number;
  totalNetProduction: number;
  totalCollections: number;
  avgDailyProduction: number;
  recordCount: number;
  lastSyncDate: Date | null;
}

/**
 * Get all locations with comprehensive metrics
 */
export async function getLocationsWithMetrics(params?: {
  clinicId?: string;
  includeInactive?: boolean;
}): Promise<LocationWithMetrics[]> {
  const { clinicId, includeInactive = false } = params || {};

  const whereClause: Prisma.LocationWhereInput = {};

  if (clinicId) {
    whereClause.clinicId = clinicId;
  }

  if (!includeInactive) {
    whereClause.isActive = true;
  }

  const locations = await prisma.location.findMany({
    where: whereClause,
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
      providers: {
        where: {
          isActive: true,
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true,
              status: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { provider: { name: "asc" } }],
      },
      // `_count` cannot be filtered – fetch active-provider count separately if required
      _count: {
        select: {
          providers: true,
          financials: true,
        },
      },
    },
    orderBy: [{ clinic: { name: "asc" } }, { name: "asc" }],
  });

  // Fetch all location IDs
  const locationIds = locations.map((loc) => loc.id);

  // Single groupBy query to get all aggregates and last record date per location
  const financialSummaries = await prisma.locationFinancial.groupBy({
    by: ["locationId"],
    where: { locationId: { in: locationIds } },
    _sum: { production: true },
    _avg: { production: true },
    _count: { id: true },
    _max: { date: true },
  });

  // Map locationId to financial summary
  /**
   * Represents the structure of an item in the financialSummaries array,
   * resulting from the Prisma groupBy operation on LocationFinancial.
   * @typedef {object} FinancialSummaryGroup
   * @property {string} locationId - The ID of the location.
   * @property {object} [_sum] - Aggregated sum of specified numeric fields.
   * @property {Prisma.Decimal | null} [_sum.production] - Total production amount.
   * @property {object} [_avg] - Aggregated average of specified numeric fields.
   * @property {Prisma.Decimal | null} [_avg.production] - Average production amount.
   * @property {object} [_count] - Count of records or specific fields.
   * @property {number} [_count.id] - Count of financial records by their ID.
   * @property {object} [_max] - Maximum value of specified fields.
   * @property {Date | null} [_max.date] - The most recent date among the financial records.
   */
  type FinancialSummaryGroup = {
    locationId: string; // Assuming Location['id'] is string, adjust if different
    _sum: {
      production: Prisma.Decimal | null;
    };
    _avg: {
      production: Prisma.Decimal | null;
    };
    _count: {
      id: number;
    };
    _max: {
      date: Date | null;
    };
  };

  // Helper function to safely convert Prisma.Decimal to number
  function safeDecimalToNumber(value: Prisma.Decimal | null | undefined): number {
    if (value && typeof value === "object" && "toNumber" in value) {
      return value.toNumber();
    }
    return 0;
  }

  const summaryMap = new Map(
    financialSummaries.map((fs: FinancialSummaryGroup) => [fs.locationId, fs])
  );

  const locationsWithMetrics = locations.map((location) => {
    const summary = summaryMap.get(location.id);
    return {
      id: location.id,
      name: location.name,
      address: location.address,
      isActive: location.isActive,
      clinic: location.clinic,
      providers: location.providers.map((pl) => ({
        id: pl.provider.id,
        name: pl.provider.name,
        providerType: pl.provider.providerType,
        isPrimary: pl.isPrimary,
      })),
      financialSummary: {
        totalRecords: summary?._count.id || 0,
        totalProduction: safeDecimalToNumber(summary?._sum.production),
        avgProduction: safeDecimalToNumber(summary?._avg.production),
        lastRecordDate: summary?._max.date || null,
      },
      _count: location._count,
    };
  });

  return locationsWithMetrics;
}

/**
 * Get financial summary for locations over a date range
 */
export async function getLocationFinancialSummary(params: {
  locationIds?: string[];
  clinicId?: string;
  startDate: Date;
  endDate: Date;
}): Promise<LocationFinancialSummary[]> {
  const { locationIds, clinicId, startDate, endDate } = params;

  const whereConditions: string[] = [];
  const values: unknown[] = [];

  // Build WHERE clause
  whereConditions.push(`lf.date >= $${values.length + 1}`);
  values.push(startDate);

  whereConditions.push(`lf.date <= $${values.length + 1}`);
  values.push(endDate);

  if (clinicId) {
    whereConditions.push(`lf.clinic_id = $${values.length + 1}`);
    values.push(clinicId);
  }

  if (locationIds && locationIds.length > 0) {
    const placeholders = locationIds.map((_, index) => `$${values.length + index + 1}`).join(", ");
    whereConditions.push(`lf.location_id IN (${placeholders})`);
    values.push(...locationIds);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      l.id as location_id,
      l.name as location_name,
      c.id as clinic_id,
      c.name as clinic_name,
      $${values.length + 1} as period_start,
      $${values.length + 2} as period_end,
      COALESCE(SUM(lf.production), 0) as total_production,
      COALESCE(SUM(lf.adjustments), 0) as total_adjustments,
      COALESCE(SUM(lf.write_offs), 0) as total_write_offs,
      COALESCE(SUM(lf.net_production), 0) as total_net_production,
      COALESCE(SUM(lf.total_collections), 0) as total_collections,
      COALESCE(AVG(lf.production), 0) as avg_daily_production,
      COUNT(lf.id) as record_count,
      MAX(ds.last_synced_at) as last_sync_date
    FROM locations l
    JOIN clinics c ON l.clinic_id = c.id
    LEFT JOIN location_financial lf ON l.id = lf.location_id
    LEFT JOIN data_sources ds ON lf.data_source_id = ds.id
    ${whereClause}
    GROUP BY l.id, l.name, c.id, c.name
    ORDER BY c.name, l.name
  `;

  values.push(startDate, endDate);

  try {
    const results = (await prisma.$queryRawUnsafe(
      query,
      ...values
    )) as RawLocationFinancialSummaryRow[];

    return results.map((row) => ({
      locationId: row.location_id,
      locationName: row.location_name,
      clinicId: row.clinic_id,
      clinicName: row.clinic_name,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      totalProduction: Number.parseFloat(row.total_production || "0"),
      totalAdjustments: Number.parseFloat(row.total_adjustments || "0"),
      totalWriteOffs: Number.parseFloat(row.total_write_offs || "0"),
      totalNetProduction: Number.parseFloat(row.total_net_production || "0"),
      totalCollections: Number.parseFloat(row.total_collections || "0"),
      avgDailyProduction: Number.parseFloat(row.avg_daily_production || "0"),
      recordCount: Number.parseInt(String(row.record_count || "0")),
      lastSyncDate: row.last_sync_date ? new Date(row.last_sync_date) : null,
    }));
  } catch (error) {
    console.error("Error fetching location financial summary:", error);
    throw error;
  }
}

/**
 * Get location details with recent financial data
 */
export async function getLocationWithRecentData(locationId: string, days = 30) {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
      providers: {
        where: {
          isActive: true,
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true,
            },
          },
        },
      },
    },
  });

  if (!location) {
    return null;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentFinancials = await prisma.locationFinancial.findMany({
    where: {
      locationId,
      date: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 50,
  });

  return {
    ...location,
    recentFinancials,
  };
}

/**
 * Get top performing locations by production
 */
export async function getTopPerformingLocations(params: {
  clinicId?: string;
  startDate: Date;
  endDate: Date;
  limit?: number;
}) {
  const { clinicId, startDate, endDate, limit = 10 } = params;

  const whereConditions: string[] = [];
  const values: unknown[] = [];

  whereConditions.push(`lf.date >= $${values.length + 1}`);
  values.push(startDate);

  whereConditions.push(`lf.date <= $${values.length + 1}`);
  values.push(endDate);

  if (clinicId) {
    whereConditions.push(`lf.clinic_id = $${values.length + 1}`);
    values.push(clinicId);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      l.id,
      l.name,
      l.address,
      c.name as clinic_name,
      SUM(lf.production) as total_production,
      SUM(lf.net_production) as total_net_production,
      SUM(lf.total_collections) as total_collections,
      AVG(lf.production) as avg_daily_production,
      COUNT(lf.id) as production_days,
      COUNT(DISTINCT pl.provider_id) as provider_count
    FROM locations l
    JOIN clinics c ON l.clinic_id = c.id
    LEFT JOIN location_financial lf ON l.id = lf.location_id
    LEFT JOIN provider_locations pl ON l.id = pl.location_id AND pl.is_active = true
    ${whereClause}
    GROUP BY l.id, l.name, l.address, c.name
    HAVING SUM(lf.production) > 0
    ORDER BY total_production DESC
    LIMIT $${values.length + 1}
  `;

  values.push(limit);

  try {
    const results = (await prisma.$queryRawUnsafe(
      query,
      ...values
    )) as RawTopPerformingLocationRow[];

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      clinicName: row.clinic_name,
      totalProduction: Number.parseFloat(row.total_production || "0"),
      totalNetProduction: Number.parseFloat(row.total_net_production || "0"),
      totalCollections: Number.parseFloat(row.total_collections || "0"),
      avgDailyProduction: Number.parseFloat(row.avg_daily_production || "0"),
      productionDays: Number.parseInt(String(row.production_days || "0")),
      providerCount: Number.parseInt(String(row.provider_count || "0")),
    }));
  } catch (error) {
    console.error("Error fetching top performing locations:", error);
    throw error;
  }
}

/**
 * Get location performance comparison
 */
export async function getLocationPerformanceComparison(params: {
  locationIds: string[];
  startDate: Date;
  endDate: Date;
}) {
  const summaries = await getLocationFinancialSummary(params);

  // Calculate benchmarks
  const totalProductions = summaries.map((s) => s.totalProduction).filter((p) => p > 0);
  const avgProductions = summaries.map((s) => s.avgDailyProduction).filter((p) => p > 0);

  const benchmarks = {
    avgTotalProduction:
      totalProductions.length > 0
        ? totalProductions.reduce((a, b) => a + b, 0) / totalProductions.length
        : 0,
    avgDailyProduction:
      avgProductions.length > 0
        ? avgProductions.reduce((a, b) => a + b, 0) / avgProductions.length
        : 0,
    maxTotalProduction: totalProductions.length > 0 ? Math.max(...totalProductions) : 0,
    minTotalProduction: totalProductions.length > 0 ? Math.min(...totalProductions) : 0,
  };

  return {
    locations: summaries.map((summary) => ({
      ...summary,
      performanceMetrics: {
        totalProductionRank: totalProductions.filter((p) => p > summary.totalProduction).length + 1,
        totalProductionPercentile:
          totalProductions.length > 0
            ? (totalProductions.filter((p) => p <= summary.totalProduction).length /
                totalProductions.length) *
              100
            : 0,
        avgProductionVsBenchmark:
          benchmarks.avgDailyProduction !== 0
            ? summary.avgDailyProduction / benchmarks.avgDailyProduction
            : 0,
        totalProductionVsBenchmark:
          benchmarks.avgTotalProduction !== 0
            ? summary.totalProduction / benchmarks.avgTotalProduction
            : 0,
      },
    })),
    benchmarks,
  };
}
