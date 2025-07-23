/**
 * Provider metrics calculation business logic
 */

import type {
  DateRange,
  MetricsPeriod,
  MetricsQueryParams,
  MetricsResult,
  ProviderComparativeMetrics,
  ProviderFinancialMetrics,
  ProviderMetrics,
  ProviderMetricsTrend,
  ProviderPatientMetrics,
  ProviderPerformanceMetrics,
} from '@/types/provider-metrics';
import {
  getProviderComparativeMetrics,
  getProviderFinancialMetrics,
  getProviderPatientMetrics,
  getProviderPerformanceMetrics,
} from '../database/queries/provider-metrics';
import { MetricsQuerySchema } from './validation';

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Round number to specified decimal places
 */
function roundToDecimals(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Generate date range for given period
 */
function generateDateRangeForPeriod(period: MetricsPeriod): DateRange {
  const now = new Date();

  switch (period) {
    case 'daily':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      };
    case 'weekly': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return {
        startDate: startOfWeek,
        endDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    }
    case 'monthly':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case 'quarterly': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      return {
        startDate: new Date(now.getFullYear(), quarterStartMonth, 1),
        endDate: new Date(now.getFullYear(), quarterStartMonth + 3, 1),
      };
    }
    case 'yearly':
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear() + 1, 0, 1),
      };
    default:
      // Default to monthly
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
  }
}

/**
 * Validate and normalize metrics query parameters
 */
function validateAndNormalizeParams(params: MetricsQueryParams): MetricsResult<MetricsQueryParams> {
  try {
    // Validate using Zod schema
    const validatedParams = MetricsQuerySchema.parse(params);

    // Ensure date range is set for all periods
    if (!validatedParams.dateRange) {
      validatedParams.dateRange = generateDateRangeForPeriod(validatedParams.period);
    }

    return {
      success: true,
      data: validatedParams,
    };
  } catch (error) {
    return {
      success: false,
      error: 'INVALID_DATE_RANGE',
      message: error instanceof Error ? error.message : 'Invalid query parameters',
    } as MetricsResult<MetricsQueryParams>;
  }
}

/**
 * Calculate comprehensive provider metrics
 */
export async function calculateProviderMetrics(
  params: MetricsQueryParams
): Promise<MetricsResult<ProviderMetrics>> {
  const startTime = Date.now();

  try {
    // Validate parameters
    const validationResult = validateAndNormalizeParams(params);
    if (!(validationResult.success && validationResult.data)) {
      return {
        success: false,
        error: validationResult.error,
        message: validationResult.message,
      };
    }

    const validatedParams = validationResult.data;

    // Fetch all metrics in parallel for performance
    const [financial, performance, patient, comparative] = await Promise.all([
      getProviderFinancialMetrics(validatedParams),
      getProviderPerformanceMetrics(validatedParams),
      getProviderPatientMetrics(validatedParams),
      validatedParams.includeComparative ? getProviderComparativeMetrics(validatedParams) : null,
    ]);

    // Enhance financial metrics with calculated values
    const enhancedFinancial: ProviderFinancialMetrics = {
      ...financial,
      collectionRate: roundToDecimals(financial.collectionRate, 4),
      collectionEfficiency: roundToDecimals(financial.collectionEfficiency, 4),
      productionGrowth: roundToDecimals(financial.productionGrowth, 2),
      overheadPercentage: roundToDecimals(financial.overheadPercentage, 4),
      profitMargin: roundToDecimals(financial.profitMargin, 4),
    };

    // Enhance performance metrics with calculated values
    const enhancedPerformance: ProviderPerformanceMetrics = {
      ...performance,
      appointmentCompletionRate: roundToDecimals(performance.appointmentCompletionRate, 4),
      productionPerHour: roundToDecimals(performance.productionPerHour, 2),
      appointmentsPerDay: roundToDecimals(performance.appointmentsPerDay, 2),
      averageAppointmentValue: roundToDecimals(performance.averageAppointmentValue, 2),
      caseAcceptanceRate: roundToDecimals(performance.caseAcceptanceRate, 4),
      treatmentPlanStartRate: roundToDecimals(performance.treatmentPlanStartRate, 4),
    };

    // Enhance patient metrics with calculated values
    const enhancedPatient: ProviderPatientMetrics = {
      ...patient,
      patientRetentionRate: roundToDecimals(patient.patientRetentionRate, 4),
      averagePatientValue: roundToDecimals(patient.averagePatientValue, 2),
      lifetimePatientValue: roundToDecimals(patient.lifetimePatientValue, 2),
      patientAcquisitionCost: roundToDecimals(patient.patientAcquisitionCost, 2),
      referralConversionRate: roundToDecimals(patient.referralConversionRate, 4),
    };

    // Default comparative metrics if not included
    const defaultComparative: ProviderComparativeMetrics = {
      providerId: params.providerId,
      clinicId: params.clinicId || '',
      period: params.period,
      dateRange: validatedParams.dateRange || { startDate: new Date(), endDate: new Date() },
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

    // Get provider name (simplified - could be enhanced with actual provider lookup)
    const providerName = `Provider ${params.providerId.slice(-8)}`;

    const metrics: ProviderMetrics = {
      providerId: params.providerId,
      providerName,
      clinicId: params.clinicId || '',
      calculatedAt: new Date(),
      financial: enhancedFinancial,
      performance: enhancedPerformance,
      patient: enhancedPatient,
      comparative: comparative || defaultComparative,
    };

    const calculationTime = Date.now() - startTime;

    return {
      success: true,
      data: metrics,
      calculationTime,
    };
  } catch (error) {
    const calculationTime = Date.now() - startTime;

    return {
      success: false,
      error: 'CALCULATION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to calculate provider metrics',
      calculationTime,
    };
  }
}

/**
 * Calculate period date range
 */
function calculatePeriodDateRange(
  period: MetricsPeriod,
  index: number
): { start: Date; end: Date } {
  const periodStart = new Date();
  const periodEnd = new Date();

  switch (period) {
    case 'monthly': {
      periodStart.setMonth(periodStart.getMonth() - index);
      periodStart.setDate(1);
      periodEnd.setMonth(periodEnd.getMonth() - index + 1);
      periodEnd.setDate(1);
      break;
    }
    case 'weekly': {
      periodStart.setDate(periodStart.getDate() - index * 7);
      periodEnd.setDate(periodEnd.getDate() - (index - 1) * 7);
      break;
    }
    case 'daily': {
      periodStart.setDate(periodStart.getDate() - index);
      periodEnd.setDate(periodEnd.getDate() - index + 1);
      break;
    }
    default: {
      // Default to monthly
      periodStart.setMonth(periodStart.getMonth() - index);
      periodStart.setDate(1);
      periodEnd.setMonth(periodEnd.getMonth() - index + 1);
      periodEnd.setDate(1);
    }
  }

  return { start: periodStart, end: periodEnd };
}

/**
 * Extract metric value from metrics object
 */
function extractMetricValue(
  metrics: ProviderMetrics,
  metricName:
    | keyof ProviderFinancialMetrics
    | keyof ProviderPerformanceMetrics
    | keyof ProviderPatientMetrics
): number {
  if (metricName in metrics.financial) {
    return metrics.financial[metricName as keyof ProviderFinancialMetrics] as number;
  }
  if (metricName in metrics.performance) {
    return metrics.performance[metricName as keyof ProviderPerformanceMetrics] as number;
  }
  if (metricName in metrics.patient) {
    return metrics.patient[metricName as keyof ProviderPatientMetrics] as number;
  }
  return 0;
}

/**
 * Calculate trend statistics
 */
function calculateTrendStatistics(changes: number[]): {
  averageGrowthRate: number;
  volatility: number;
  trendDirection: 'up' | 'down' | 'stable';
} {
  const validChanges = changes.filter((change) => Number.isFinite(change));

  const averageGrowthRate =
    validChanges.length > 0
      ? validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length
      : 0;

  const volatility =
    validChanges.length > 1
      ? Math.sqrt(
          validChanges.reduce((sum, change) => sum + (change - averageGrowthRate) ** 2, 0) /
            (validChanges.length - 1)
        )
      : 0;

  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (averageGrowthRate > 5) {
    trendDirection = 'up';
  } else if (averageGrowthRate < -5) {
    trendDirection = 'down';
  }

  return { averageGrowthRate, volatility, trendDirection };
}

/**
 * Calculate metrics trend over time
 */
export async function calculateProviderMetricsTrend(
  params: MetricsQueryParams,
  metricName:
    | keyof ProviderFinancialMetrics
    | keyof ProviderPerformanceMetrics
    | keyof ProviderPatientMetrics,
  periods = 12
): Promise<MetricsResult<ProviderMetricsTrend>> {
  const startTime = Date.now();

  try {
    const trendData: ProviderMetricsTrend['data'] = [];
    const changes: number[] = [];

    // Calculate metrics for each period
    for (let i = periods - 1; i >= 0; i--) {
      const { start: periodStart, end: periodEnd } = calculatePeriodDateRange(params.period, i);

      const periodParams: MetricsQueryParams = {
        ...params,
        dateRange: {
          startDate: periodStart,
          endDate: periodEnd,
        },
        includeComparative: false,
      };

      const metricsResult = await calculateProviderMetrics(periodParams);

      if (metricsResult.success && metricsResult.data) {
        const value = extractMetricValue(metricsResult.data, metricName);

        // Calculate change from previous period
        let change: number | undefined;
        let changePercentage: number | undefined;

        if (trendData.length > 0) {
          const lastDataPoint = trendData.at(-1);
          if (lastDataPoint) {
            const previousValue = lastDataPoint.value;
            change = value - previousValue;
            changePercentage = calculatePercentageChange(value, previousValue);
            changes.push(changePercentage);
          }
        }

        trendData.push({
          date: periodStart,
          period: formatPeriodLabel(periodStart, params.period),
          value: roundToDecimals(value, 2),
          change: change ? roundToDecimals(change, 2) : undefined,
          changePercentage: changePercentage ? roundToDecimals(changePercentage, 2) : undefined,
        });
      }
    }

    // Calculate trend statistics
    const { averageGrowthRate, volatility, trendDirection } = calculateTrendStatistics(changes);

    const trend: ProviderMetricsTrend = {
      providerId: params.providerId,
      metric: metricName,
      period: params.period,
      data: trendData,
      trendDirection,
      averageGrowthRate: roundToDecimals(averageGrowthRate, 2),
      volatility: roundToDecimals(volatility, 2),
    };

    const calculationTime = Date.now() - startTime;

    return {
      success: true,
      data: trend,
      calculationTime,
    };
  } catch (error) {
    const calculationTime = Date.now() - startTime;

    return {
      success: false,
      error: 'CALCULATION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to calculate metrics trend',
      calculationTime,
    };
  }
}

/**
 * Format period label for display
 */
function formatPeriodLabel(date: Date, period: MetricsPeriod): string {
  switch (period) {
    case 'daily':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'weekly':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'monthly':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    case 'quarterly': {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
    case 'yearly':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString('en-US');
  }
}

/**
 * Compare provider metrics for efficiency analysis
 */
export function calculateEfficiencyScore(metrics: ProviderMetrics): number {
  const weights = {
    collectionRate: 0.3,
    appointmentCompletionRate: 0.2,
    productionPerHour: 0.25,
    caseAcceptanceRate: 0.15,
    patientRetentionRate: 0.1,
  };

  const normalizedScores = {
    collectionRate: Math.min(metrics.financial.collectionRate * 100, 100),
    appointmentCompletionRate: metrics.performance.appointmentCompletionRate * 100,
    productionPerHour: Math.min((metrics.performance.productionPerHour / 1000) * 100, 100),
    caseAcceptanceRate: metrics.performance.caseAcceptanceRate * 100,
    patientRetentionRate: metrics.patient.patientRetentionRate * 100,
  };

  const weightedScore = Object.entries(weights).reduce((total, [metric, weight]) => {
    const score = normalizedScores[metric as keyof typeof normalizedScores] || 0;
    return total + score * weight;
  }, 0);

  return roundToDecimals(weightedScore, 1);
}
