import { prisma } from '@/lib/database/client';
import logger from '@/lib/utils/logger';
import type {
  ISODateString,
  ProviderFilters,
  ProviderPerformanceMetrics,
  ProviderWithLocations,
} from '@/types/providers';
import { Prisma } from '@prisma/client';

/**
 * Describes the raw row structure from the dentist performance query.
 */
interface RawDentistPerformanceRow {
  provider_id: string;
  provider_name: string;
  location_id: string;
  location_name: string;
  period_start: string;
  period_end: string;
  total_production: string | null;
  avg_daily_production: string | null;
  production_days: string | number;
  production_goal: string | null;
}

/**
 * Describes the raw row structure from the hygienist performance query.
 */
interface RawHygienistPerformanceRow {
  provider_id: string;
  provider_name: string;
  location_id: string;
  location_name: string;
  period_start: string;
  period_end: string;
  total_production: string | null;
  avg_daily_production: string | null;
  production_days: string | number;
  production_goal: string | null;
}

// For the accumulator in getProvidersWithLocations
interface LocationSummaryProvider {
  id: string;
  name: string;
  providerType: string;
  status: string;
  isPrimary: boolean;
  startDate: Date;
}

interface LocationSummaryCounts {
  total: number;
  dentists: number;
  hygienists: number;
  primary: number;
}

interface LocationSummaryValue {
  id: string;
  name: string;
  address: string | null;
  providers: LocationSummaryProvider[];
  counts: LocationSummaryCounts;
}

interface LocationSummaryAccumulator {
  [locationKey: string]: LocationSummaryValue;
}

/**
 * Build common where clause for provider queries
 */
function buildProviderWhereClause(params: {
  providerId?: string;
  clinicId?: string;
  providerType?: string;
  status?: string;
  includeInactive?: boolean;
  locationId?: string;
}): Prisma.ProviderWhereInput {
  const {
    providerId,
    clinicId,
    providerType,
    status,
    includeInactive = false,
    locationId,
  } = params;

  const whereClause: Prisma.ProviderWhereInput = {};

  if (providerId) {
    whereClause.id = providerId;
  }

  if (clinicId) {
    whereClause.clinicId = clinicId;
  }

  if (providerType) {
    whereClause.providerType = providerType;
  }

  // Handle status filtering - explicit status parameter takes precedence
  if (status) {
    whereClause.status = status;
  } else if (!includeInactive) {
    whereClause.status = 'active';
  }

  // If filtering by location, we need to include providers who work at that location
  if (locationId) {
    whereClause.providerLocations = {
      some: {
        locationId,
        isActive: true,
      },
    };
  }

  return whereClause;
}

// Use Prisma-generated type to ensure type safety for the complete query
const providerQueryArgs = Prisma.validator<Prisma.ProviderFindManyArgs>()({
  include: {
    clinic: {
      select: {
        id: true,
        name: true,
      },
    },
    providerLocations: {
      where: {
        isActive: true,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { location: { name: 'asc' } }],
    },
    _count: {
      select: {
        providerLocations: {
          where: { isActive: true },
        },
        hygieneProduction: true,
        dentistProduction: true,
      },
    },
  },
  orderBy: [{ name: 'asc' }],
});

type RawProviderData = Prisma.ProviderGetPayload<typeof providerQueryArgs>;

/**
 * Build common query options for provider queries
 */
/**
 * Build Prisma query options with optional pagination
 * @param whereClause - The where clause for filtering
 * @param pagination - Optional pagination parameters with page and limit
 * @returns Prisma query options with computed offset from page and limit
 */
function buildProviderQueryOptions(
  whereClause: Prisma.ProviderWhereInput,
  pagination?: { page: number; limit: number }
) {
  const baseOptions = {
    ...providerQueryArgs,
    where: whereClause,
  };

  // Add pagination if provided - compute offset internally from page and limit
  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    return {
      ...baseOptions,
      skip: offset,
      take: pagination.limit,
    };
  }

  return baseOptions;
}

/**
 * Transform raw provider data to ProviderWithLocations format
 */
function transformProviderData(providers: RawProviderData[]): ProviderWithLocations[] {
  return providers.map((provider) => {
    const locations = provider.providerLocations.map((pl) => ({
      id: pl.id,
      locationId: pl.location.id,
      locationName: pl.location.name,
      locationAddress: pl.location.address,
      isPrimary: pl.isPrimary,
      isActive: pl.isActive,
      startDate: pl.startDate.toISOString() as ISODateString,
      endDate: pl.endDate ? (pl.endDate.toISOString() as ISODateString) : null,
    }));

    const primaryLocation = provider.providerLocations.find((pl) => pl.isPrimary)?.location;

    return {
      id: provider.id,
      name: provider.name,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      providerType: provider.providerType,
      status: provider.status,
      clinic: provider.clinic,
      locations,
      primaryLocation,
      _count: {
        locations: provider._count.providerLocations,
        hygieneProduction: provider._count.hygieneProduction,
        dentistProduction: provider._count.dentistProduction,
      },
    };
  });
}

/**
 * Get all providers with their location relationships
 * @param params - Filter and pagination parameters
 * @returns Array of providers with location details
 */
export async function getProvidersWithLocations(
  params?: ProviderFilters
): Promise<ProviderWithLocations[]> {
  const {
    clinicId,
    locationId,
    providerId,
    providerType,
    status,
    includeInactive = false,
    page,
    limit,
  } = params || {};

  const whereClause = buildProviderWhereClause({
    providerId,
    clinicId,
    providerType,
    status,
    includeInactive,
    locationId,
  });

  // Create pagination object if page and limit are provided
  const pagination = page && limit ? { page, limit } : undefined;
  const queryOptions = buildProviderQueryOptions(whereClause, pagination);
  const providers = await prisma.provider.findMany(queryOptions);

  return transformProviderData(providers);
}

/**
 * Get provider performance metrics by location
 */
export async function getProviderPerformanceByLocation(params: {
  providerId?: string;
  locationId?: string;
  clinicId?: string;
  startDate: Date;
  endDate: Date;
  providerType?: 'dentist' | 'hygienist';
}): Promise<ProviderPerformanceMetrics[]> {
  const { providerId, locationId, clinicId, startDate, endDate, providerType } = params;

  // Build the WHERE clause for filtering
  const whereConditions: string[] = [];
  const values: unknown[] = [];

  if (providerId) {
    whereConditions.push(`p.id = $${values.length + 1}`);
    values.push(providerId);
  }

  if (locationId) {
    whereConditions.push(`pl.location_id = $${values.length + 1}`);
    values.push(locationId);
  }

  if (clinicId) {
    whereConditions.push(`p.clinic_id = $${values.length + 1}`);
    values.push(clinicId);
  }

  if (providerType) {
    whereConditions.push(`p.provider_type = $${values.length + 1}`);
    values.push(providerType);
  }

  // Add date range
  whereConditions.push(`dp.date >= $${values.length + 1}`);
  values.push(startDate);
  whereConditions.push(`dp.date <= $${values.length + 1}`);
  values.push(endDate);

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Query for dentist performance (has location-specific data)
  const dentistQuery = `
    SELECT 
      p.id as provider_id,
      p.name as provider_name,
      l.id as location_id,
      l.name as location_name,
      $${values.length + 1} as period_start,
      $${values.length + 2} as period_end,
      CASE 
        WHEN l.name = 'Humble' THEN COALESCE(SUM(dp.verified_production_humble), 0)
        WHEN l.name = 'Baytown' THEN COALESCE(SUM(dp.verified_production_baytown), 0)
        ELSE 0
      END as total_production,
      CASE 
        WHEN l.name = 'Humble' THEN COALESCE(AVG(dp.verified_production_humble), 0)
        WHEN l.name = 'Baytown' THEN COALESCE(AVG(dp.verified_production_baytown), 0)
        ELSE 0
      END as avg_daily_production,
      COUNT(CASE 
        WHEN l.name = 'Humble' AND dp.verified_production_humble > 0 THEN 1
        WHEN l.name = 'Baytown' AND dp.verified_production_baytown > 0 THEN 1
        ELSE NULL
      END) as production_days,
      AVG(dp.monthly_goal) as production_goal
    FROM providers p
    JOIN provider_locations pl ON p.id = pl.provider_id AND pl.is_active = true
    JOIN locations l ON pl.location_id = l.id
    LEFT JOIN dentist_production dp ON p.id = dp.provider_id
    ${whereClause}
    AND p.provider_type = 'dentist'
    GROUP BY p.id, p.name, l.id, l.name
    HAVING COUNT(dp.id) > 0
  `;

  values.push(startDate, endDate);

  // Query for hygienist performance (location needs to be inferred from production records)
  const hygienistQuery = `
    SELECT 
      p.id as provider_id,
      p.name as provider_name,
      l.id as location_id,
      l.name as location_name,
      $${values.length + 1} as period_start,
      $${values.length + 2} as period_end,
      COALESCE(SUM(hp.verified_production), 0) as total_production,
      COALESCE(AVG(hp.verified_production), 0) as avg_daily_production,
      COUNT(CASE WHEN hp.verified_production > 0 THEN 1 ELSE NULL END) as production_days,
      AVG(hp.production_goal) as production_goal
    FROM providers p
    JOIN provider_locations pl ON p.id = pl.provider_id AND pl.is_active = true
    JOIN locations l ON pl.location_id = l.id
    LEFT JOIN hygiene_production hp ON p.id = hp.provider_id
    ${whereClause.replace(/dp\.date/g, 'hp.date')}
    AND p.provider_type = 'hygienist'
    GROUP BY p.id, p.name, l.id, l.name
    HAVING COUNT(hp.id) > 0
  `;
  let results: (RawDentistPerformanceRow | RawHygienistPerformanceRow)[] = [];

  if (!providerType || providerType === 'dentist') {
    const dentistResults = (await prisma.$queryRawUnsafe(
      dentistQuery,
      ...values
    )) as RawDentistPerformanceRow[];
    results = [...results, ...dentistResults];
  }

  if (!providerType || providerType === 'hygienist') {
    const hygienistResults = (await prisma.$queryRawUnsafe(
      hygienistQuery,
      ...values,
      startDate,
      endDate
    )) as RawHygienistPerformanceRow[];
    results = [...results, ...hygienistResults];
  }

  return results.map((row) => ({
    providerId: row.provider_id,
    providerName: row.provider_name,
    locationId: row.location_id,
    locationName: row.location_name,
    periodStart: new Date(row.period_start).toISOString() as ISODateString,
    periodEnd: new Date(row.period_end).toISOString() as ISODateString,
    totalProduction: Number.parseFloat(row.total_production || '0'),
    avgDailyProduction: Number.parseFloat(row.avg_daily_production || '0'),
    productionDays: Number.parseInt(String(row.production_days || '0')),
    productionGoal: row.production_goal
      ? Number.parseFloat(String(row.production_goal))
      : undefined,
    variancePercentage:
      row.production_goal && Number.parseFloat(row.production_goal) !== 0
        ? ((Number.parseFloat(row.total_production || '0') -
            Number.parseFloat(row.production_goal)) /
            Number.parseFloat(row.production_goal)) *
          100
        : undefined,
  }));
}

/**
 * Get providers for a specific location
 */
export function getProvidersByLocation(
  locationId: string,
  params?: {
    providerType?: string;
    includeInactive?: boolean;
  }
): Promise<ProviderWithLocations[]> {
  return getProvidersWithLocations({
    locationId,
    ...params,
  });
}

/**
 * Get location summary for providers (useful for AOJ-41 dashboard)
 */
export async function getProviderLocationSummary(
  clinicId?: string
): Promise<LocationSummaryValue[]> {
  const whereClause: Prisma.ProviderLocationWhereInput = {
    isActive: true,
  };

  if (clinicId) {
    whereClause.provider = {
      clinicId,
    };
  }

  const providerLocations = await prisma.providerLocation.findMany({
    where: whereClause,
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          providerType: true,
          status: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
          address: true,
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

  // Group by location
  const locationSummary = providerLocations.reduce((acc, pl) => {
    const locationKey = pl.location.id;

    if (!acc[locationKey]) {
      acc[locationKey] = {
        id: pl.location.id,
        name: pl.location.name,
        address: pl.location.address,
        providers: [],
        counts: {
          total: 0,
          dentists: 0,
          hygienists: 0,
          primary: 0,
        },
      };
    }

    acc[locationKey].providers.push({
      id: pl.provider.id,
      name: pl.provider.name,
      providerType: pl.provider.providerType,
      status: pl.provider.status,
      isPrimary: pl.isPrimary,
      startDate: pl.startDate,
    });

    acc[locationKey].counts.total++;
    if (pl.provider.providerType === 'dentist') {
      acc[locationKey].counts.dentists++;
    }
    if (pl.provider.providerType === 'hygienist') {
      acc[locationKey].counts.hygienists++;
    }
    if (pl.isPrimary) {
      acc[locationKey].counts.primary++;
    }

    return acc;
  }, {} as LocationSummaryAccumulator);

  return Object.values(locationSummary);
}

/**
 * Get providers with their location relationships including total count for pagination
 * @param params - Filter and pagination parameters
 * @returns Object containing providers array and total count
 */
export async function getProvidersWithLocationsPaginated(
  params?: ProviderFilters
): Promise<{ providers: ProviderWithLocations[]; total: number }> {
  const {
    clinicId,
    locationId,
    providerId,
    providerType,
    status,
    includeInactive = false,
    page,
    limit,
  } = params || {};

  // Input validation for pagination parameters
  if (page !== undefined || limit !== undefined) {
    if (page !== undefined && page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (limit !== undefined && limit <= 0) {
      throw new Error('Pagination limit must be greater than 0');
    }
    if (limit !== undefined && limit > 1000) {
      throw new Error('Pagination limit cannot exceed 1000 to prevent performance issues');
    }
  }

  const whereClause = buildProviderWhereClause({
    providerId,
    clinicId,
    providerType,
    status,
    includeInactive,
    locationId,
  });

  // Create pagination object if page and limit are provided
  const pagination = page && limit ? { page, limit } : undefined;

  // Execute count and data queries in parallel for performance
  const [total, providers] = await Promise.all([
    prisma.provider.count({ where: whereClause }),
    prisma.provider.findMany(buildProviderQueryOptions(whereClause, pagination)),
  ]);

  return { providers: transformProviderData(providers), total };
}

/**
 * Get a specific provider with detailed location information
 */
export async function getProviderWithLocationDetails(
  providerId: string
): Promise<ProviderWithLocations | null> {
  const providers = await getProvidersWithLocations({ providerId });
  return providers[0] || null;
}

/**
 * Calculate period start and end dates based on period type
 */
function calculatePeriodDates(
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  startDate?: Date,
  endDate?: Date
): { periodStart: Date; periodEnd: Date } {
  const now = new Date();

  if (startDate && endDate) {
    return { periodStart: startDate, periodEnd: endDate };
  }

  switch (period) {
    case 'daily': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endOfDay.setHours(23, 59, 59, 999);
      return { periodStart: today, periodEnd: endOfDay };
    }
    case 'weekly': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return { periodStart: startOfWeek, periodEnd: endOfWeek };
    }
    case 'monthly': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return { periodStart: startOfMonth, periodEnd: endOfMonth };
    }
    case 'quarterly': {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      endOfQuarter.setHours(23, 59, 59, 999);
      return { periodStart: startOfQuarter, periodEnd: endOfQuarter };
    }
    case 'yearly': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      return { periodStart: startOfYear, periodEnd: endOfYear };
    }
    default: {
      // Default to current month
      const startDefault = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDefault = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDefault.setHours(23, 59, 59, 999);
      return { periodStart: startDefault, periodEnd: endDefault };
    }
  }
}

/**
 * Type for aggregated production data by location
 */
type LocationProductionData = {
  locationId: string;
  locationName: string;
  total: number;
  average: number;
  goal?: number;
  variance?: number;
  variancePercentage?: number;
};

/**
 * Aggregate production data by location
 */
function aggregateProductionByLocation(
  productionData: ProviderPerformanceMetrics[]
): LocationProductionData[] {
  // Use a Map to efficiently aggregate data by locationId - O(n) complexity
  const locationMap = new Map<string, LocationProductionData>();
  const productionDaysMap = new Map<string, number>();

  for (const data of productionData) {
    const existing = locationMap.get(data.locationId);
    const existingProductionDays = productionDaysMap.get(data.locationId) || 0;

    if (existing) {
      // Update existing location data
      existing.total += data.totalProduction;
      const newProductionDays = existingProductionDays + data.productionDays;
      productionDaysMap.set(data.locationId, newProductionDays);

      // Calculate weighted average: total production / total production days
      existing.average = newProductionDays > 0 ? existing.total / newProductionDays : 0;
      if (data.productionGoal) {
        existing.goal = (existing.goal || 0) + data.productionGoal;
      }
      // Recalculate variance based on updated totals
      if (existing.goal && existing.goal > 0) {
        existing.variance = existing.total - existing.goal;
        existing.variancePercentage = (existing.variance / existing.goal) * 100;
      }
    } else {
      // Create new location entry
      productionDaysMap.set(data.locationId, data.productionDays);
      locationMap.set(data.locationId, {
        locationId: data.locationId,
        locationName: data.locationName,
        total: data.totalProduction,
        average: data.productionDays > 0 ? data.totalProduction / data.productionDays : 0,
        goal: data.productionGoal,
        variance: data.productionGoal ? data.totalProduction - data.productionGoal : undefined,
        variancePercentage: data.variancePercentage,
      });
    }
  }

  // Convert Map values to array
  return Array.from(locationMap.values());
}

/**
 * Fetch provider goals for a given period
 */
async function fetchProviderGoals(
  providerId: string,
  clinicId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const goals = await prisma.goal.findMany({
    where: {
      providerId,
      clinicId,
      startDate: {
        gte: periodStart,
      },
      endDate: {
        lte: periodEnd,
      },
    },
    include: {
      metricDefinition: {
        select: {
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    total: goals.length,
    achieved: 0, // Would need metric value comparison
    achievementRate: 0, // Would need actual vs target calculation
    details: goals.map((goal) => ({
      id: goal.id,
      title: goal.metricDefinition.name,
      targetValue: Number.parseFloat(goal.targetValue),
      currentValue: 0, // Would need current metric value
      achievementPercentage: 0, // Would need calculation
      period: goal.timePeriod,
      status: 'in_progress' as const, // Would need actual evaluation
    })),
  };
}

/**
 * Get comprehensive provider performance metrics
 */
export async function getProviderPerformanceMetrics(params: {
  providerId: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
  includeGoals?: boolean;
  clinicId?: string;
}) {
  const {
    providerId,
    period = 'monthly',
    startDate,
    endDate,
    locationId,
    includeGoals = true,
    clinicId,
  } = params;

  // Calculate period dates
  const { periodStart, periodEnd } = calculatePeriodDates(period, startDate, endDate);

  // Get provider details with location information
  const provider = await getProviderWithLocationDetails(providerId);
  if (!provider) {
    return null;
  }

  // Verify clinic access if provided
  if (clinicId && provider.clinic.id !== clinicId) {
    return null;
  }

  // Build location filter conditions
  const locationFilter = locationId ? { locationId } : {};

  // Get production data based on provider type
  let productionData: ProviderPerformanceMetrics[] = [];

  if (provider.providerType === 'dentist' || provider.providerType === 'hygienist') {
    try {
      productionData = await getProviderPerformanceByLocation({
        providerId,
        startDate: periodStart,
        endDate: periodEnd,
        providerType: provider.providerType as 'dentist' | 'hygienist',
        clinicId: provider.clinic.id,
        ...locationFilter,
      });
    } catch (error) {
      logger.error('Failed to fetch provider performance data', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        providerId,
        providerType: provider.providerType,
        clinicId: provider.clinic.id,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        locationFilter,
        operation: 'getProviderPerformanceByLocation',
      });
      productionData = [];
    }
  }

  // Calculate total production metrics
  const totalProduction = productionData.reduce((sum, data) => sum + data.totalProduction, 0);
  const totalProductionDays = productionData.reduce((sum, data) => sum + data.productionDays, 0);
  const averageProduction = totalProductionDays > 0 ? totalProduction / totalProductionDays : 0;
  const totalGoal = productionData.reduce((sum, data) => sum + (data.productionGoal || 0), 0);
  const variance = totalGoal > 0 ? totalProduction - totalGoal : undefined;
  const variancePercentage =
    totalGoal > 0 ? ((totalProduction - totalGoal) / totalGoal) * 100 : undefined;

  // Group by location for multi-location providers
  const byLocation = aggregateProductionByLocation(productionData);

  // Get goals if requested
  let goalsData: Awaited<ReturnType<typeof fetchProviderGoals>> | undefined;
  if (includeGoals) {
    try {
      goalsData = await fetchProviderGoals(providerId, provider.clinic.id, periodStart, periodEnd);
    } catch (error) {
      logger.error('Failed to fetch provider goals data', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        providerId,
        clinicId: provider.clinic.id,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        operation: 'fetchProviderGoals',
      });

      // Re-throw with additional context for better error handling upstream
      throw new Error(
        `Failed to fetch provider goals for provider ${providerId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return {
    provider: {
      id: provider.id,
      name: provider.name,
      providerType: provider.providerType,
      clinic: {
        id: provider.clinic.id,
        name: provider.clinic.name,
      },
      primaryLocation: provider.primaryLocation
        ? {
            id: provider.primaryLocation.id,
            name: provider.primaryLocation.name,
            address: provider.primaryLocation.address || undefined,
          }
        : undefined,
    },
    period: {
      startDate: periodStart,
      endDate: periodEnd,
      period,
    },
    production: {
      total: totalProduction,
      average: averageProduction,
      goal: totalGoal > 0 ? totalGoal : undefined,
      variance,
      variancePercentage,
      byLocation: byLocation.length > 0 ? byLocation : undefined,
    },
    goals: goalsData,
    trends: undefined, // Would require additional historical data queries
  };
}
