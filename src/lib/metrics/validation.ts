/**
 * Validation schemas for provider metrics using Zod
 */

import { z } from 'zod';

// UUID validation regex pattern (moved to top-level for performance)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Date range validation schema
 */
export const DateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  });

/**
 * Metrics period validation schema
 */
export const MetricsPeriodSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom',
]);

/**
 * Metrics query parameters validation schema
 */
export const MetricsQuerySchema = z
  .object({
    providerId: z.string().uuid('Provider ID must be a valid UUID'),
    clinicId: z.string().uuid('Clinic ID must be a valid UUID').optional(),
    period: MetricsPeriodSchema,
    dateRange: DateRangeSchema.optional(),
    includeComparative: z.boolean().default(true),
    includeGoals: z.boolean().default(true),
    refreshCache: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.period === 'custom') {
        return data.dateRange !== undefined;
      }
      return true;
    },
    {
      message: "Date range is required when period is 'custom'",
      path: ['dateRange'],
    }
  );

/**
 * Provider financial metrics validation schema
 */
export const ProviderFinancialMetricsSchema = z
  .object({
    providerId: z.string().uuid(),
    clinicId: z.string().uuid(),
    period: MetricsPeriodSchema,
    dateRange: DateRangeSchema,

    totalProduction: z.number().min(0, 'Production cannot be negative'),
    hygieneProduction: z.number().min(0, 'Hygiene production cannot be negative'),
    dentistProduction: z.number().min(0, 'Dentist production cannot be negative'),
    productionGrowth: z.number(),

    totalCollections: z.number().min(0, 'Collections cannot be negative'),
    collectionRate: z.number().min(0).max(2, 'Collection rate should be between 0 and 200%'),
    collectionEfficiency: z
      .number()
      .min(0)
      .max(2, 'Collection efficiency should be between 0 and 200%'),

    productionGoal: z.number().min(0).optional(),
    goalAchievement: z.number().optional(),
    goalVariance: z.number().optional(),

    overheadPercentage: z
      .number()
      .min(0)
      .max(1, 'Overhead percentage should be between 0 and 100%'),
    profitMargin: z.number(),
  })
  .refine(
    (data) => data.hygieneProduction + data.dentistProduction <= data.totalProduction * 1.01, // Allow 1% tolerance for rounding
    {
      message: 'Sum of hygiene and dentist production cannot exceed total production',
      path: ['totalProduction'],
    }
  );

/**
 * Provider performance metrics validation schema
 */
export const ProviderPerformanceMetricsSchema = z
  .object({
    providerId: z.string().uuid(),
    clinicId: z.string().uuid(),
    period: MetricsPeriodSchema,
    dateRange: DateRangeSchema,

    totalAppointments: z.number().int().min(0),
    completedAppointments: z.number().int().min(0),
    cancelledAppointments: z.number().int().min(0),
    noShowAppointments: z.number().int().min(0),
    appointmentCompletionRate: z.number().min(0).max(1),

    hoursWorked: z
      .number()
      .min(0)
      .max(24 * 365, 'Hours worked cannot exceed hours in a year'),
    productionPerHour: z.number().min(0),
    appointmentsPerDay: z.number().min(0),
    averageAppointmentValue: z.number().min(0),

    casesPresented: z.number().int().min(0),
    casesAccepted: z.number().int().min(0),
    caseAcceptanceRate: z.number().min(0).max(1),

    treatmentPlansCreated: z.number().int().min(0),
    treatmentPlansStarted: z.number().int().min(0),
    treatmentPlanStartRate: z.number().min(0).max(1),
  })
  .refine(
    (data) =>
      data.completedAppointments + data.cancelledAppointments + data.noShowAppointments <=
      data.totalAppointments,
    {
      message: 'Sum of appointment outcomes cannot exceed total appointments',
      path: ['totalAppointments'],
    }
  )
  .refine((data) => data.casesAccepted <= data.casesPresented, {
    message: 'Cases accepted cannot exceed cases presented',
    path: ['casesAccepted'],
  })
  .refine((data) => data.treatmentPlansStarted <= data.treatmentPlansCreated, {
    message: 'Treatment plans started cannot exceed treatment plans created',
    path: ['treatmentPlansStarted'],
  });

/**
 * Provider patient metrics validation schema
 */
export const ProviderPatientMetricsSchema = z
  .object({
    providerId: z.string().uuid(),
    clinicId: z.string().uuid(),
    period: MetricsPeriodSchema,
    dateRange: DateRangeSchema,

    totalPatients: z.number().int().min(0),
    newPatients: z.number().int().min(0),
    activePatients: z.number().int().min(0),
    patientRetentionRate: z.number().min(0).max(1),

    averagePatientValue: z.number().min(0),
    lifetimePatientValue: z.number().min(0),
    patientAcquisitionCost: z.number().min(0),

    referralsReceived: z.number().int().min(0),
    referralsSent: z.number().int().min(0),
    referralConversionRate: z.number().min(0).max(1),
  })
  .refine((data) => data.newPatients <= data.totalPatients, {
    message: 'New patients cannot exceed total patients',
    path: ['newPatients'],
  })
  .refine((data) => data.activePatients <= data.totalPatients, {
    message: 'Active patients cannot exceed total patients',
    path: ['activePatients'],
  });

/**
 * Provider comparative metrics validation schema
 */
export const ProviderComparativeMetricsSchema = z.object({
  providerId: z.string().uuid(),
  clinicId: z.string().uuid(),
  period: MetricsPeriodSchema,
  dateRange: DateRangeSchema,

  productionRank: z.number().int().min(1),
  collectionRank: z.number().int().min(1),
  patientSatisfactionRank: z.number().int().min(1),

  productionPercentile: z.number().min(0).max(100),
  collectionPercentile: z.number().min(0).max(100),
  efficiencyPercentile: z.number().min(0).max(100),

  productionVsAverage: z.number(),
  collectionVsAverage: z.number(),
  patientCountVsAverage: z.number(),

  industryBenchmarkScore: z.number().min(0).max(100).optional(),
  regionBenchmarkScore: z.number().min(0).max(100).optional(),
});

/**
 * Complete provider metrics validation schema
 */
export const ProviderMetricsSchema = z.object({
  providerId: z.string().uuid(),
  providerName: z.string().min(1, 'Provider name is required'),
  clinicId: z.string().uuid(),
  calculatedAt: z.date(),

  financial: ProviderFinancialMetricsSchema,
  performance: ProviderPerformanceMetricsSchema,
  patient: ProviderPatientMetricsSchema,
  comparative: ProviderComparativeMetricsSchema,
});

/**
 * Metrics trend point validation schema
 */
export const MetricsTrendPointSchema = z.object({
  date: z.date(),
  period: z.string().min(1),
  value: z.number(),
  change: z.number().optional(),
  changePercentage: z.number().optional(),
});

/**
 * Provider metrics trend validation schema
 */
export const ProviderMetricsTrendSchema = z.object({
  providerId: z.string().uuid(),
  metric: z.string().min(1),
  period: MetricsPeriodSchema,
  data: z.array(MetricsTrendPointSchema).min(1, 'Trend data must contain at least one point'),

  trendDirection: z.enum(['up', 'down', 'stable']),
  averageGrowthRate: z.number(),
  volatility: z.number().min(0),
});

/**
 * Multi-provider comparison validation schema
 */
export const ProviderComparisonSchema = z.object({
  clinicId: z.string().uuid(),
  period: MetricsPeriodSchema,
  dateRange: DateRangeSchema,
  providers: z
    .array(
      z.object({
        providerId: z.string().uuid(),
        providerName: z.string().min(1),
        metrics: ProviderMetricsSchema.partial(),
        rank: z.number().int().min(1),
        percentile: z.number().min(0).max(100),
      })
    )
    .min(1, 'Comparison must include at least one provider'),
  clinicAverages: z.object({
    production: z.number().min(0),
    collections: z.number().min(0),
    patients: z.number().int().min(0),
    efficiency: z.number().min(0).max(1),
  }),
});

/**
 * Validation helper function for date range constraints
 */
export function validateDateRange(startDate: Date, endDate: Date, maxRangeMonths = 24): boolean {
  if (startDate > endDate) {
    return false;
  }

  const monthsDiff =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  return monthsDiff <= maxRangeMonths;
}

/**
 * Validation helper for metric percentages
 */
export function validatePercentage(value: number, allowOver100 = false): boolean {
  const min = 0;
  const max = allowOver100 ? Number.MAX_SAFE_INTEGER : 1;
  return value >= min && value <= max;
}

/**
 * Validation helper for UUIDs
 */
export function validateUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}
