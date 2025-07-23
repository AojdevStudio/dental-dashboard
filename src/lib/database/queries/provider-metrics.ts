/**
 * Optimized database queries for provider metrics calculation
 */

import { prisma } from '@/lib/database/prisma';
import type {
  DateRange,
  MetricsPeriod,
  MetricsQueryParams,
  ProviderComparativeMetrics,
  ProviderFinancialMetrics,
  ProviderPatientMetrics,
  ProviderPerformanceMetrics,
} from '@/types/provider-metrics';
import { Prisma } from '@prisma/client';

/**
 * Generate SQL date conditions based on period and date range
 */
function getDateConditions(period: MetricsPeriod, dateRange?: DateRange) {
  if (period === 'custom' && dateRange) {
    return {
      gte: dateRange.startDate,
      lt: dateRange.endDate,
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'daily':
      return {
        gte: startOfToday,
        lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
      };
    case 'weekly': {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      return {
        gte: startOfWeek,
        lt: now,
      };
    }
    case 'monthly': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        gte: startOfMonth,
        lt: now,
      };
    }
    case 'quarterly': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfQuarter = new Date(now.getFullYear(), quarterStartMonth, 1);
      return {
        gte: startOfQuarter,
        lt: now,
      };
    }
    case 'yearly': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        gte: startOfYear,
        lt: now,
      };
    }
    default: {
      const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        gte: defaultStartOfMonth,
        lt: now,
      };
    }
  }
}

/**
 * Get provider financial metrics from database
 */
export async function getProviderFinancialMetrics(
  params: MetricsQueryParams
): Promise<ProviderFinancialMetrics> {
  const { providerId, clinicId, period, dateRange } = params;
  const dateConditions = getDateConditions(period, dateRange);

  // Get current period production data
  const currentProductionData = await prisma.$queryRaw<
    Array<{
      hygieneProduction: number;
      dentistProduction: number;
      totalProduction: number;
      totalCollections: number;
    }>
  >`
    SELECT 
      COALESCE(SUM(CASE WHEN hp.amount IS NOT NULL THEN hp.amount ELSE 0 END), 0) as hygieneProduction,
      COALESCE(SUM(CASE WHEN dp.amount IS NOT NULL THEN dp.amount ELSE 0 END), 0) as dentistProduction,
      COALESCE(SUM(CASE WHEN hp.amount IS NOT NULL THEN hp.amount ELSE 0 END) + 
               SUM(CASE WHEN dp.amount IS NOT NULL THEN dp.amount ELSE 0 END), 0) as totalProduction,
      COALESCE(SUM(fc.amount), 0) as totalCollections
    FROM "Provider" p
    LEFT JOIN "HygieneProduction" hp ON hp."providerId" = p.id 
      AND hp.date >= ${dateConditions.gte}::timestamp 
      AND hp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND hp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "DentistProduction" dp ON dp."providerId" = p.id 
      AND dp.date >= ${dateConditions.gte}::timestamp 
      AND dp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND dp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "FinancialCollection" fc ON fc."providerId" = p.id 
      AND fc.date >= ${dateConditions.gte}::timestamp 
      AND fc.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND fc."clinicId" = ${clinicId}` : Prisma.empty}
    WHERE p.id = ${providerId}
      ${clinicId ? Prisma.sql`AND p."clinicId" = ${clinicId}` : Prisma.empty}
    GROUP BY p.id
  `;

  // Get previous period for growth calculation
  const previousPeriodEnd = dateConditions.gte;
  const periodDuration = (dateConditions.lt ?? new Date()).getTime() - dateConditions.gte.getTime();
  const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);

  const previousProductionData = await prisma.$queryRaw<
    Array<{
      totalProduction: number;
    }>
  >`
    SELECT 
      COALESCE(SUM(CASE WHEN hp.amount IS NOT NULL THEN hp.amount ELSE 0 END) + 
               SUM(CASE WHEN dp.amount IS NOT NULL THEN dp.amount ELSE 0 END), 0) as totalProduction
    FROM "Provider" p
    LEFT JOIN "HygieneProduction" hp ON hp."providerId" = p.id 
      AND hp.date >= ${previousPeriodStart}::timestamp 
      AND hp.date < ${previousPeriodEnd}::timestamp
      ${clinicId ? Prisma.sql`AND hp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "DentistProduction" dp ON dp."providerId" = p.id 
      AND dp.date >= ${previousPeriodStart}::timestamp 
      AND dp.date < ${previousPeriodEnd}::timestamp
      ${clinicId ? Prisma.sql`AND dp."clinicId" = ${clinicId}` : Prisma.empty}
    WHERE p.id = ${providerId}
      ${clinicId ? Prisma.sql`AND p."clinicId" = ${clinicId}` : Prisma.empty}
    GROUP BY p.id
  `;

  const current = currentProductionData[0] || {
    hygieneProduction: 0,
    dentistProduction: 0,
    totalProduction: 0,
    totalCollections: 0,
  };

  const previous = previousProductionData[0] || { totalProduction: 0 };

  // Calculate growth percentage
  const productionGrowth =
    previous.totalProduction > 0
      ? ((current.totalProduction - previous.totalProduction) / previous.totalProduction) * 100
      : 0;

  // Calculate collection rate
  const collectionRate =
    current.totalProduction > 0 ? current.totalCollections / current.totalProduction : 0;

  // Get goal data if requested
  let goalData = {};
  if (params.includeGoals) {
    const goals = await prisma.goal.findMany({
      where: {
        providerId,
        ...(clinicId && { clinicId }),
        startDate: {
          gte: dateConditions.gte,
        },
        endDate: {
          lte: dateConditions.lt ?? new Date(),
        },
      },
      select: {
        targetValue: true,
      },
    });

    const productionGoal = goals.reduce((sum, goal) => sum + Number(goal.targetValue), 0);

    if (productionGoal > 0) {
      goalData = {
        productionGoal,
        goalAchievement: (current.totalProduction / productionGoal) * 100,
        goalVariance: current.totalProduction - productionGoal,
      };
    }
  }

  const overheadPercentage = 0.6; // TODO: Calculate from actual overhead data
  const totalOverhead = current.totalProduction * overheadPercentage;
  const netIncome = current.totalProduction - totalOverhead;

  return {
    providerId,
    clinicId: clinicId || '',
    period,
    dateRange: {
      startDate: dateConditions.gte,
      endDate: dateConditions.lt ?? new Date(),
    },
    totalProduction: current.totalProduction,
    hygieneProduction: current.hygieneProduction,
    dentistProduction: current.dentistProduction,
    productionGrowth,
    totalCollections: current.totalCollections,
    collectionRate,
    collectionEfficiency: collectionRate, // Could be enhanced with adjusted production
    overheadPercentage,
    profitMargin:
      (current.totalCollections - current.totalCollections * overheadPercentage) /
      current.totalCollections,
    totalOverhead,
    netIncome,
    ...goalData,
  };
}

/**
 * Get provider performance metrics from database
 */
export async function getProviderPerformanceMetrics(
  params: MetricsQueryParams
): Promise<ProviderPerformanceMetrics> {
  const { providerId, clinicId, period, dateRange } = params;
  const dateConditions = getDateConditions(period, dateRange);

  // Get appointment and productivity data
  const performanceData = await prisma.$queryRaw<
    Array<{
      totalAppointments: bigint;
      completedAppointments: bigint;
      cancelledAppointments: bigint;
      noShowAppointments: bigint;
      casesPresented: bigint;
      casesAccepted: bigint;
      treatmentPlansCreated: bigint;
      treatmentPlansStarted: bigint;
      hoursWorked: number;
      totalProduction: number;
    }>
  >`
    SELECT 
      COUNT(a.id) as totalAppointments,
      COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completedAppointments,
      COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelledAppointments,
      COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as noShowAppointments,
      COUNT(CASE WHEN tp.status = 'presented' THEN 1 END) as casesPresented,
      COUNT(CASE WHEN tp.status = 'accepted' THEN 1 END) as casesAccepted,
      COUNT(tp.id) as treatmentPlansCreated,
      COUNT(CASE WHEN tp.status = 'started' THEN 1 END) as treatmentPlansStarted,
      COALESCE(SUM(EXTRACT(EPOCH FROM (a."endTime" - a."startTime")) / 3600), 0) as hoursWorked,
      COALESCE(SUM(CASE WHEN hp.amount IS NOT NULL THEN hp.amount ELSE 0 END) + 
               SUM(CASE WHEN dp.amount IS NOT NULL THEN dp.amount ELSE 0 END), 0) as totalProduction
    FROM "Provider" p
    LEFT JOIN "Appointment" a ON a."providerId" = p.id 
      AND a.date >= ${dateConditions.gte}::timestamp 
      AND a.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND a."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "TreatmentPlan" tp ON tp."providerId" = p.id 
      AND tp."createdAt" >= ${dateConditions.gte}::timestamp 
      AND tp."createdAt" < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND tp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "HygieneProduction" hp ON hp."providerId" = p.id 
      AND hp.date >= ${dateConditions.gte}::timestamp 
      AND hp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND hp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "DentistProduction" dp ON dp."providerId" = p.id 
      AND dp.date >= ${dateConditions.gte}::timestamp 
      AND dp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND dp."clinicId" = ${clinicId}` : Prisma.empty}
    WHERE p.id = ${providerId}
      ${clinicId ? Prisma.sql`AND p."clinicId" = ${clinicId}` : Prisma.empty}
    GROUP BY p.id
  `;

  const data = performanceData[0];

  if (!data) {
    // Return zero metrics if no data found
    return {
      providerId,
      clinicId: clinicId || '',
      period,
      dateRange: {
        startDate: dateConditions.gte,
        endDate: dateConditions.lt,
      },
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      appointmentCompletionRate: 0,
      hoursWorked: 0,
      productionPerHour: 0,
      appointmentsPerDay: 0,
      averageAppointmentValue: 0,
      casesPresented: 0,
      casesAccepted: 0,
      caseAcceptanceRate: 0,
      treatmentPlansCreated: 0,
      treatmentPlansStarted: 0,
      treatmentPlanStartRate: 0,
      averageProductionPerDay: 0,
      goalAchievementRate: 0,
      performanceVariance: 0,
    };
  }

  // Convert BigInt to number for calculations
  const totalAppointments = Number(data.totalAppointments);
  const completedAppointments = Number(data.completedAppointments);
  const cancelledAppointments = Number(data.cancelledAppointments);
  const noShowAppointments = Number(data.noShowAppointments);
  const casesPresented = Number(data.casesPresented);
  const casesAccepted = Number(data.casesAccepted);
  const treatmentPlansCreated = Number(data.treatmentPlansCreated);
  const treatmentPlansStarted = Number(data.treatmentPlansStarted);

  // Calculate derived metrics
  const appointmentCompletionRate =
    totalAppointments > 0 ? completedAppointments / totalAppointments : 0;

  const productionPerHour = data.hoursWorked > 0 ? data.totalProduction / data.hoursWorked : 0;

  const daysInPeriod = Math.ceil(
    ((dateConditions.lt ?? new Date()).getTime() - dateConditions.gte.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const appointmentsPerDay = daysInPeriod > 0 ? totalAppointments / daysInPeriod : 0;

  const averageAppointmentValue =
    completedAppointments > 0 ? data.totalProduction / completedAppointments : 0;

  const caseAcceptanceRate = casesPresented > 0 ? casesAccepted / casesPresented : 0;

  const treatmentPlanStartRate =
    treatmentPlansCreated > 0 ? treatmentPlansStarted / treatmentPlansCreated : 0;

  // Calculate additional performance metrics
  const averageProductionPerDay = daysInPeriod > 0 ? data.totalProduction / daysInPeriod : 0;

  // Get goal achievement rate (simplified - should be calculated from actual goals)
  const goalAchievementRate = 0.85; // TODO: Calculate from actual goal data

  // Calculate performance variance (simplified - should compare to historical average)
  const performanceVariance = 0.05; // TODO: Calculate from historical data

  return {
    providerId,
    clinicId: clinicId || '',
    period,
    dateRange: {
      startDate: dateConditions.gte,
      endDate: dateConditions.lt ?? new Date(),
    },
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    appointmentCompletionRate,
    hoursWorked: data.hoursWorked,
    productionPerHour,
    appointmentsPerDay,
    averageAppointmentValue,
    casesPresented,
    casesAccepted,
    caseAcceptanceRate,
    treatmentPlansCreated,
    treatmentPlansStarted,
    treatmentPlanStartRate,
    averageProductionPerDay,
    goalAchievementRate,
    performanceVariance,
  };
}

/**
 * Get provider patient metrics from database
 */
export async function getProviderPatientMetrics(
  params: MetricsQueryParams
): Promise<ProviderPatientMetrics> {
  const { providerId, clinicId, period, dateRange } = params;
  const dateConditions = getDateConditions(period, dateRange);

  // Get patient metrics
  const patientData = await prisma.$queryRaw<
    Array<{
      totalPatients: bigint;
      newPatients: bigint;
      activePatients: bigint;
      referralsReceived: bigint;
      referralsSent: bigint;
      averagePatientValue: number;
    }>
  >`
    SELECT 
      COUNT(DISTINCT p.id) as totalPatients,
      COUNT(DISTINCT CASE WHEN p."createdAt" >= ${dateConditions.gte}::timestamp THEN p.id END) as newPatients,
      COUNT(DISTINCT CASE WHEN a.date >= ${dateConditions.gte}::timestamp AND a.date < ${dateConditions.lt}::timestamp THEN p.id END) as activePatients,
      COUNT(CASE WHEN r."receivedAt" >= ${dateConditions.gte}::timestamp AND r."receivedAt" < ${dateConditions.lt}::timestamp THEN 1 END) as referralsReceived,
      COUNT(CASE WHEN r."sentAt" >= ${dateConditions.gte}::timestamp AND r."sentAt" < ${dateConditions.lt}::timestamp THEN 1 END) as referralsSent,
      COALESCE(AVG(
        CASE WHEN a.date >= ${dateConditions.gte}::timestamp AND a.date < ${dateConditions.lt}::timestamp 
        THEN (hp.amount + dp.amount) END
      ), 0) as averagePatientValue
    FROM "Provider" prov
    LEFT JOIN "Appointment" a ON a."providerId" = prov.id
      ${clinicId ? Prisma.sql`AND a."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "Patient" p ON p.id = a."patientId"
    LEFT JOIN "Referral" r ON r."providerId" = prov.id
      ${clinicId ? Prisma.sql`AND r."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "HygieneProduction" hp ON hp."providerId" = prov.id AND hp."patientId" = p.id
      AND hp.date >= ${dateConditions.gte}::timestamp AND hp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND hp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "DentistProduction" dp ON dp."providerId" = prov.id AND dp."patientId" = p.id
      AND dp.date >= ${dateConditions.gte}::timestamp AND dp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND dp."clinicId" = ${clinicId}` : Prisma.empty}
    WHERE prov.id = ${providerId}
      ${clinicId ? Prisma.sql`AND prov."clinicId" = ${clinicId}` : Prisma.empty}
    GROUP BY prov.id
  `;

  const data = patientData[0];

  if (!data) {
    return {
      providerId,
      clinicId: clinicId || '',
      period,
      dateRange: {
        startDate: dateConditions.gte,
        endDate: dateConditions.lt,
      },
      totalPatients: 0,
      newPatients: 0,
      activePatients: 0,
      patientRetentionRate: 0,
      averagePatientValue: 0,
      lifetimePatientValue: 0,
      patientAcquisitionCost: 0,
      referralsReceived: 0,
      referralsSent: 0,
      referralConversionRate: 0,
      returningPatients: 0,
      appointmentEfficiency: 0,
      caseAcceptanceRate: 0,
    };
  }

  const totalPatients = Number(data.totalPatients);
  const newPatients = Number(data.newPatients);
  const activePatients = Number(data.activePatients);
  const referralsReceived = Number(data.referralsReceived);
  const referralsSent = Number(data.referralsSent);

  // Calculate retention rate (simplified - could be more sophisticated)
  const patientRetentionRate = totalPatients > 0 ? activePatients / totalPatients : 0;

  // Calculate referral conversion rate
  const referralConversionRate = referralsReceived > 0 ? newPatients / referralsReceived : 0;

  // Calculate additional patient metrics
  const returningPatients = totalPatients - newPatients;
  const appointmentEfficiency = 0.92; // TODO: Calculate from actual appointment data

  return {
    providerId,
    clinicId: clinicId || '',
    period,
    dateRange: {
      startDate: dateConditions.gte,
      endDate: dateConditions.lt ?? new Date(),
    },
    totalPatients,
    newPatients,
    activePatients,
    patientRetentionRate,
    averagePatientValue: data.averagePatientValue,
    lifetimePatientValue: data.averagePatientValue * 5, // Simplified calculation
    patientAcquisitionCost: 100, // TODO: Calculate from marketing spend
    referralsReceived,
    referralsSent,
    referralConversionRate,
    returningPatients,
    appointmentEfficiency,
    caseAcceptanceRate: 0.75, // TODO: Calculate from actual case acceptance data
  };
}

/**
 * Get provider comparative metrics from database
 */
export async function getProviderComparativeMetrics(
  params: MetricsQueryParams
): Promise<ProviderComparativeMetrics> {
  const { providerId, clinicId, period, dateRange } = params;
  const dateConditions = getDateConditions(period, dateRange);

  // Get clinic-wide provider rankings
  const rankingData = await prisma.$queryRaw<
    Array<{
      providerId: string;
      totalProduction: number;
      totalCollections: number;
      patientCount: bigint;
    }>
  >`
    SELECT 
      p.id as providerId,
      COALESCE(SUM(CASE WHEN hp.amount IS NOT NULL THEN hp.amount ELSE 0 END) + 
               SUM(CASE WHEN dp.amount IS NOT NULL THEN dp.amount ELSE 0 END), 0) as totalProduction,
      COALESCE(SUM(fc.amount), 0) as totalCollections,
      COUNT(DISTINCT a."patientId") as patientCount
    FROM "Provider" p
    LEFT JOIN "HygieneProduction" hp ON hp."providerId" = p.id 
      AND hp.date >= ${dateConditions.gte}::timestamp 
      AND hp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND hp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "DentistProduction" dp ON dp."providerId" = p.id 
      AND dp.date >= ${dateConditions.gte}::timestamp 
      AND dp.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND dp."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "FinancialCollection" fc ON fc."providerId" = p.id 
      AND fc.date >= ${dateConditions.gte}::timestamp 
      AND fc.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND fc."clinicId" = ${clinicId}` : Prisma.empty}
    LEFT JOIN "Appointment" a ON a."providerId" = p.id 
      AND a.date >= ${dateConditions.gte}::timestamp 
      AND a.date < ${dateConditions.lt}::timestamp
      ${clinicId ? Prisma.sql`AND a."clinicId" = ${clinicId}` : Prisma.empty}
    WHERE p.status = 'active'
      ${clinicId ? Prisma.sql`AND p."clinicId" = ${clinicId}` : Prisma.empty}
    GROUP BY p.id
    ORDER BY totalProduction DESC
  `;

  // Find current provider's position and calculate metrics
  const currentProviderIndex = rankingData.findIndex((row) => row.providerId === providerId);
  const currentProviderData = rankingData[currentProviderIndex];

  if (!currentProviderData) {
    // Return default metrics if provider not found
    return {
      providerId,
      clinicId: clinicId || '',
      period,
      dateRange: {
        startDate: dateConditions.gte,
        endDate: dateConditions.lt,
      },
      productionRank: 1,
      collectionRank: 1,
      patientSatisfactionRank: 1,
      productionPercentile: 50,
      collectionPercentile: 50,
      efficiencyPercentile: 50,
      productionVsAverage: 0,
      collectionVsAverage: 0,
      patientCountVsAverage: 0,
    };
  }

  // Calculate rankings
  const sortedByProduction = [...rankingData].sort((a, b) => b.totalProduction - a.totalProduction);
  const sortedByCollections = [...rankingData].sort(
    (a, b) => b.totalCollections - a.totalCollections
  );

  const productionRank = sortedByProduction.findIndex((row) => row.providerId === providerId) + 1;
  const collectionRank = sortedByCollections.findIndex((row) => row.providerId === providerId) + 1;

  // Calculate percentiles
  const totalProviders = rankingData.length;
  const productionPercentile = ((totalProviders - productionRank + 1) / totalProviders) * 100;
  const collectionPercentile = ((totalProviders - collectionRank + 1) / totalProviders) * 100;

  // Calculate averages
  const avgProduction =
    rankingData.reduce((sum, row) => sum + row.totalProduction, 0) / totalProviders;
  const avgCollections =
    rankingData.reduce((sum, row) => sum + row.totalCollections, 0) / totalProviders;
  const avgPatientCount =
    rankingData.reduce((sum, row) => sum + Number(row.patientCount), 0) / totalProviders;

  // Calculate vs average percentages
  const productionVsAverage =
    avgProduction > 0
      ? ((currentProviderData.totalProduction - avgProduction) / avgProduction) * 100
      : 0;
  const collectionVsAverage =
    avgCollections > 0
      ? ((currentProviderData.totalCollections - avgCollections) / avgCollections) * 100
      : 0;
  const patientCountVsAverage =
    avgPatientCount > 0
      ? ((Number(currentProviderData.patientCount) - avgPatientCount) / avgPatientCount) * 100
      : 0;

  return {
    providerId,
    clinicId: clinicId || '',
    period,
    dateRange: {
      startDate: dateConditions.gte,
      endDate: dateConditions.lt ?? new Date(),
    },
    productionRank,
    collectionRank,
    patientSatisfactionRank: Math.floor(Math.random() * totalProviders) + 1, // TODO: Calculate from actual satisfaction data
    productionPercentile,
    collectionPercentile,
    efficiencyPercentile: (productionPercentile + collectionPercentile) / 2, // Simplified efficiency calculation
    productionVsAverage,
    collectionVsAverage,
    patientCountVsAverage,
  };
}

/**
 * Get comprehensive provider KPI dashboard data
 * Combines all metrics into a dashboard-ready format
 */
export async function getProviderKPIDashboard(params: {
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  locationId?: string;
  calculationOptions?: {
    includeTrends?: boolean;
    includeComparisons?: boolean;
    includeBenchmarks?: boolean;
    trendPeriods?: number;
  };
}) {
  try {
    // Get provider details
    const provider = await prisma.provider.findUnique({
      where: { id: params.providerId },
      include: {
        providerLocations: {
          where: { isPrimary: true },
          include: {
            location: true,
          },
        },
      },
    });

    if (!provider) {
      return {
        success: false,
        error: {
          message: 'Provider not found',
          type: 'PROVIDER_NOT_FOUND',
        },
      };
    }

    // Calculate period type based on date range
    const daysDiff = Math.floor(
      (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    if (daysDiff <= 1) {
      periodType = 'daily';
    } else if (daysDiff <= 7) {
      periodType = 'weekly';
    } else if (daysDiff <= 31) {
      periodType = 'monthly';
    } else if (daysDiff <= 93) {
      periodType = 'quarterly';
    } else {
      periodType = 'yearly';
    }

    // Build metrics query params
    const metricsParams: MetricsQueryParams = {
      providerId: params.providerId,
      clinicId: params.clinicId,
      period: periodType,
      dateRange: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    };

    // Fetch all metrics in parallel
    const [financial, performance, patient, comparative] = await Promise.all([
      getProviderFinancialMetrics(metricsParams),
      getProviderPerformanceMetrics(metricsParams),
      getProviderPatientMetrics(metricsParams),
      getProviderComparativeMetrics(metricsParams),
    ]);

    // Format period label
    const periodLabel = `${params.startDate.toLocaleDateString()} - ${params.endDate.toLocaleDateString()}`;

    const dashboardData = {
      provider: {
        id: provider.id,
        name: `${provider.firstName} ${provider.lastName}`,
        providerType: provider.providerType as 'dentist' | 'hygienist' | 'specialist' | 'other',
        primaryLocation: provider.providerLocations[0]?.location
          ? {
              id: provider.providerLocations[0].location.id,
              name: provider.providerLocations[0].location.name,
              address: provider.providerLocations[0].location.address || undefined,
            }
          : undefined,
      },
      period: {
        startDate: params.startDate,
        endDate: params.endDate,
        periodType,
        label: periodLabel,
      },
      lastUpdated: new Date(),
      dataCompleteness: {
        hasFinancialData: financial.totalProduction > 0,
        hasPatientData: patient.totalPatients > 0,
        hasComparativeData: comparative.productionRank > 0,
        overallCompleteness: 100, // Simplified for now
      },
      metrics: {
        financial,
        performance,
        patient,
        comparative,
      },
    };

    return {
      success: true,
      data: dashboardData,
      performance: {
        calculationTime: Date.now() - params.startDate.getTime(),
        cacheUsed: false,
      },
    };
  } catch (error) {
    console.error('Error in getProviderKPIDashboard:', error);
    return {
      success: false,
      error: {
        message: 'Failed to calculate provider KPIs',
        type: 'CALCULATION_ERROR',
      },
    };
  }
}
