import { prisma } from '@/lib/database/client';
import type { ProviderFilters } from '@/types/providers';
import type { Prisma } from '@prisma/client';

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

export interface ProviderWithLocations {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  providerType: string;
  status: string;
  clinic: {
    id: string;
    name: string;
  };
  locations: {
    id: string;
    locationId: string;
    locationName: string;
    locationAddress: string | null;
    isPrimary: boolean;
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
  }[];
  primaryLocation?: {
    id: string;
    name: string;
    address: string | null;
  };
  _count: {
    locations: number;
    hygieneProduction: number;
    dentistProduction: number;
  };
}

export interface ProviderPerformanceMetrics {
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  periodStart: Date;
  periodEnd: Date;
  totalProduction: number;
  avgDailyProduction: number;
  productionDays: number;
  productionGoal?: number;
  variancePercentage?: number;
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
    includeInactive = false,
    pagination,
  } = params || {};

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

  if (!includeInactive) {
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

  const queryOptions: Prisma.ProviderFindManyArgs = {
    where: whereClause,
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
  };

  // Add pagination if provided
  if (pagination) {
    queryOptions.skip = pagination.offset;
    queryOptions.take = pagination.limit;
  }

  const providers = await prisma.provider.findMany(queryOptions);

  return providers.map((provider) => {
    const locations = provider.providerLocations.map((pl) => ({
      id: pl.id,
      locationId: pl.location.id,
      locationName: pl.location.name,
      locationAddress: pl.location.address,
      isPrimary: pl.isPrimary,
      isActive: pl.isActive,
      startDate: pl.startDate,
      endDate: pl.endDate,
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
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
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
export async function getProvidersByLocation(
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
    includeInactive = false,
    pagination,
  } = params || {};

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

  if (!includeInactive) {
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

  // Execute count and data queries in parallel for performance
  const [total, providers] = await Promise.all([
    prisma.provider.count({ where: whereClause }),
    (async () => {
      const queryOptions: Prisma.ProviderFindManyArgs = {
        where: whereClause,
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
      };

      // Add pagination if provided
      if (pagination) {
        queryOptions.skip = pagination.offset;
        queryOptions.take = pagination.limit;
      }

      return prisma.provider.findMany(queryOptions);
    })(),
  ]);

  const mappedProviders = providers.map((provider) => {
    const locations = provider.providerLocations.map((pl) => ({
      id: pl.id,
      locationId: pl.location.id,
      locationName: pl.location.name,
      locationAddress: pl.location.address,
      isPrimary: pl.isPrimary,
      isActive: pl.isActive,
      startDate: pl.startDate,
      endDate: pl.endDate,
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

  return { providers: mappedProviders, total };
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
