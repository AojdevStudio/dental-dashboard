/**
 * Comprehensive type definitions for provider metrics and KPI calculations
 */

import type { z } from 'zod';

/**
 * Time period for metrics calculation
 */
export type MetricsPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

/**
 * Date range interface for custom periods
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Provider financial metrics
 */
export interface ProviderFinancialMetrics {
  providerId: string;
  clinicId: string;
  period: MetricsPeriod;
  dateRange: DateRange;

  // Production metrics
  totalProduction: number;
  hygieneProduction: number;
  dentistProduction: number;
  productionGrowth: number; // percentage change from previous period

  // Collection metrics
  totalCollections: number;
  collectionRate: number; // collections / production
  collectionEfficiency: number; // collections / adjusted production

  // Goal metrics
  productionGoal?: number;
  goalAchievement?: number; // percentage of goal achieved
  goalVariance?: number; // difference from goal

  // Overhead metrics
  overheadPercentage: number;
  profitMargin: number;
}

/**
 * Provider performance metrics
 */
export interface ProviderPerformanceMetrics {
  providerId: string;
  clinicId: string;
  period: MetricsPeriod;
  dateRange: DateRange;

  // Appointment metrics
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  appointmentCompletionRate: number;

  // Productivity metrics
  hoursWorked: number;
  productionPerHour: number;
  appointmentsPerDay: number;
  averageAppointmentValue: number;

  // Case acceptance
  casesPresented: number;
  casesAccepted: number;
  caseAcceptanceRate: number;

  // Treatment planning
  treatmentPlansCreated: number;
  treatmentPlansStarted: number;
  treatmentPlanStartRate: number;
}

/**
 * Provider patient analytics
 */
export interface ProviderPatientMetrics {
  providerId: string;
  clinicId: string;
  period: MetricsPeriod;
  dateRange: DateRange;

  // Patient counts
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  patientRetentionRate: number;

  // Patient value metrics
  averagePatientValue: number;
  lifetimePatientValue: number;
  patientAcquisitionCost: number;

  // Referral metrics
  referralsReceived: number;
  referralsSent: number;
  referralConversionRate: number;
}

/**
 * Comparative metrics for ranking and benchmarking
 */
export interface ProviderComparativeMetrics {
  providerId: string;
  clinicId: string;
  period: MetricsPeriod;
  dateRange: DateRange;

  // Rankings within clinic
  productionRank: number;
  collectionRank: number;
  patientSatisfactionRank: number;

  // Percentile scores
  productionPercentile: number;
  collectionPercentile: number;
  efficiencyPercentile: number;

  // Comparisons to averages
  productionVsAverage: number; // percentage above/below average
  collectionVsAverage: number;
  patientCountVsAverage: number;

  // Benchmark scores
  industryBenchmarkScore?: number;
  regionBenchmarkScore?: number;
}

/**
 * Aggregated provider metrics containing all KPI categories
 */
export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  clinicId: string;
  calculatedAt: Date;

  financial: ProviderFinancialMetrics;
  performance: ProviderPerformanceMetrics;
  patient: ProviderPatientMetrics;
  comparative: ProviderComparativeMetrics;
}

/**
 * Metrics query parameters
 */
export interface MetricsQueryParams {
  providerId: string;
  clinicId?: string; // Optional for system admins
  period: MetricsPeriod;
  dateRange?: DateRange; // Required if period is 'custom'
  includeComparative?: boolean;
  includeGoals?: boolean;
  refreshCache?: boolean;
}

/**
 * Trend data point for time series analysis
 */
export interface MetricsTrendPoint {
  date: Date;
  period: string; // Human readable period label
  value: number;
  change?: number; // Change from previous period
  changePercentage?: number;
}

/**
 * Metrics trend data
 */
export interface ProviderMetricsTrend {
  providerId: string;
  metric: string; // Metric name (e.g., 'totalProduction', 'collectionRate')
  period: MetricsPeriod;
  data: MetricsTrendPoint[];

  // Trend analysis
  trendDirection: 'up' | 'down' | 'stable';
  averageGrowthRate: number;
  volatility: number; // Standard deviation of changes
}

/**
 * Multi-provider comparison data
 */
export interface ProviderComparison {
  clinicId: string;
  period: MetricsPeriod;
  dateRange: DateRange;
  providers: Array<{
    providerId: string;
    providerName: string;
    metrics: Partial<ProviderMetrics>;
    rank: number;
    percentile: number;
  }>;
  clinicAverages: {
    production: number;
    collections: number;
    patients: number;
    efficiency: number;
  };
}

/**
 * Metrics calculation error types
 */
export type MetricsError =
  | 'PROVIDER_NOT_FOUND'
  | 'INVALID_DATE_RANGE'
  | 'INSUFFICIENT_DATA'
  | 'CALCULATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'CACHE_ERROR';

/**
 * Metrics calculation result wrapper
 */
export interface MetricsResult<T> {
  success: boolean;
  data?: T;
  error?: MetricsError;
  message?: string;
  calculationTime?: number; // milliseconds
}

/**
 * Metrics cache entry
 */
export interface MetricsCacheEntry {
  key: string;
  data: ProviderMetrics;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

/**
 * Performance metrics for monitoring
 */
export interface MetricsPerformance {
  queryTime: number;
  cacheHitRate: number;
  dataFreshness: number; // age in minutes
  memoryUsage: number; // bytes
}

/**
 * Export types for validation schemas
 */
export type MetricsQueryParamsInput = z.input<
  typeof import('../lib/metrics/validation').MetricsQuerySchema
>;
export type DateRangeInput = z.input<typeof import('../lib/metrics/validation').DateRangeSchema>;
