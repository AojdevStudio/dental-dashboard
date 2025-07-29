/**
 * @fileoverview Provider-specific KPI and metrics type definitions.
 *
 * This file defines comprehensive types for provider performance metrics
 * including Financial, Performance, Patient, and Comparative KPIs as required
 * by Story 1.1 AC2: KPI Metrics Dashboard.
 */

import type { KPIData, TrendDirection } from './kpi';

/**
 * Base metric value with trend and comparison data
 */
export interface BaseMetric {
  current: number;
  previous?: number;
  goal?: number;
  trend?: {
    direction: TrendDirection;
    percentage: number;
    periodLabel: string;
  };
  variance?: {
    amount: number;
    percentage: number;
  };
}

/**
 * Financial KPI metrics for a provider
 */
export interface FinancialKPIs {
  /** Total production value for the period */
  productionTotal: BaseMetric & {
    byLocation?: Array<{
      locationId: string;
      locationName: string;
      amount: number;
      percentage: number;
    }>;
  };

  /** Collection rate percentage */
  collectionRate: BaseMetric & {
    collections: number;
    adjustments: number;
  };

  /** Overhead percentage relative to production */
  overheadPercentage: BaseMetric & {
    fixedCosts: number;
    variableCosts: number;
    totalOverhead: number;
  };

  /** Average daily production */
  avgDailyProduction: BaseMetric;

  /** Production per patient */
  productionPerPatient: BaseMetric;
}

/**
 * Performance KPI metrics for a provider
 */
export interface PerformanceKPIs {
  /** Goal achievement percentage */
  goalAchievement: BaseMetric & {
    goalsAchieved: number;
    totalGoals: number;
    achievedGoals: Array<{
      id: string;
      title: string;
      targetValue: number;
      currentValue: number;
      achievementPercentage: number;
    }>;
  };

  /** Variance analysis from targets */
  varianceAnalysis: {
    productionVariance: BaseMetric;
    patientVariance: BaseMetric;
    appointmentVariance: BaseMetric;
  };

  /** Trend calculations for key metrics */
  trendCalculations: {
    productionTrend: Array<{
      period: string;
      date: string;
      value: number;
    }>;
    patientTrend: Array<{
      period: string;
      date: string;
      value: number;
    }>;
  };

  /** Productivity metrics */
  productivity: {
    hoursWorked: BaseMetric;
    productionPerHour: BaseMetric;
    utilizationRate: BaseMetric;
  };
}

/**
 * Patient KPI metrics for a provider
 */
export interface PatientKPIs {
  /** Total patient count for the period */
  patientCount: BaseMetric & {
    newPatients: number;
    returningPatients: number;
    retentionRate: number;
  };

  /** Appointment efficiency metrics */
  appointmentEfficiency: {
    scheduledAppointments: BaseMetric;
    completedAppointments: BaseMetric;
    cancelledAppointments: BaseMetric;
    noshowRate: BaseMetric;
    onTimeRate: BaseMetric;
  };

  /** Case acceptance rates */
  caseAcceptanceRates: {
    treatmentPlansPresentedCount: BaseMetric;
    treatmentPlansAcceptedCount: BaseMetric;
    caseAcceptanceRate: BaseMetric;
    averageCaseValue: BaseMetric;
  };

  /** Patient satisfaction metrics */
  patientSatisfaction: {
    averageRating: BaseMetric;
    reviewCount: BaseMetric;
    recommendationRate: BaseMetric;
  };
}

/**
 * Comparative KPI metrics for provider benchmarking
 */
export interface ComparativeKPIs {
  /** Provider ranking within clinic */
  providerRanking: {
    currentRank: number;
    totalProviders: number;
    rankingCategory: 'production' | 'patients' | 'efficiency' | 'satisfaction';
    percentile: number;
  };

  /** Clinic averages for comparison */
  clinicAverages: {
    avgProduction: number;
    avgPatients: number;
    avgCollectionRate: number;
    avgCaseAcceptance: number;
  };

  /** Benchmark comparisons against industry standards */
  benchmarkComparisons: {
    industryAverage: {
      production: number;
      collectionRate: number;
      patientRetention: number;
      caseAcceptance: number;
    };
    percentileRanking: {
      production: number;
      efficiency: number;
      patientSatisfaction: number;
    };
  };

  /** Peer comparison with similar providers */
  peerComparison: {
    similarProviders: Array<{
      id: string;
      name: string;
      production: number;
      patients: number;
      isAnonymized: boolean;
    }>;
    avgAmongPeers: {
      production: number;
      patients: number;
      efficiency: number;
    };
  };
}

/**
 * Complete provider KPI dashboard data structure
 */
export interface ProviderKPIDashboard {
  /** Provider information */
  provider: {
    id: string;
    name: string;
    providerType: 'dentist' | 'hygienist' | 'specialist' | 'other';
    primaryLocation?: {
      id: string;
      name: string;
      address?: string;
    };
  };

  /** Period information */
  period: {
    startDate: Date;
    endDate: Date;
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    label: string;
  };

  /** KPI categories */
  financial: FinancialKPIs;
  performance: PerformanceKPIs;
  patient: PatientKPIs;
  comparative: ComparativeKPIs;

  /** Metadata */
  lastUpdated: Date;
  dataCompleteness: {
    financialData: number; // percentage 0-100
    performanceData: number;
    patientData: number;
    comparativeData: number;
  };
}

/**
 * API query parameters for provider KPI data
 */
export interface ProviderKPIQueryParams {
  providerId: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
  locationId?: string;
  includeComparisons?: boolean;
  includeTrends?: boolean;
  compareToProvider?: string;
}

/**
 * API response structure for provider KPI data
 */
export interface ProviderKPIResponse {
  success: boolean;
  data: ProviderKPIDashboard;
  performanceInfo?: {
    queryTime: number;
    dataFreshness: Date;
    cacheHit: boolean;
  };
}

/**
 * Specialized KPI card data for provider metrics
 */
export interface ProviderKPICardData extends Omit<KPIData, 'dataSource'> {
  /** Category for grouping KPIs */
  category: 'financial' | 'performance' | 'patient' | 'comparative';

  /** Metric priority for dashboard layout */
  priority: 'primary' | 'secondary' | 'tertiary';

  /** Data source and freshness */
  dataSource: {
    source: 'production' | 'appointments' | 'goals' | 'calculated';
    lastSync: Date;
    reliability: 'high' | 'medium' | 'low';
  };

  /** Drill-down information */
  drillDown?: {
    available: boolean;
    route?: string;
    queryParams?: Record<string, string>;
  };
}

/**
 * Provider metrics calculation parameters
 */
export interface ProviderMetricsCalculationParams {
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  locationId?: string;
  includeInactive?: boolean;
  calculationOptions?: {
    includeTrends?: boolean;
    includeComparisons?: boolean;
    includeBenchmarks?: boolean;
    trendPeriods?: number;
  };
}

/**
 * Raw database query results for provider metrics
 */
export interface ProviderMetricsRawData {
  /** Production data from production tables */
  production: Array<{
    date: Date;
    locationId: string;
    locationName: string;
    amount: number;
    providerType: string;
    goal?: number;
  }>;

  /** Appointment data */
  appointments: Array<{
    date: Date;
    locationId: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
    patientId: string;
    treatmentValue?: number;
  }>;

  /** Goal data */
  goals: Array<{
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    startDate: Date;
    endDate: Date;
    metricType: string;
  }>;

  /** Patient data */
  patients: Array<{
    id: string;
    firstVisit: Date;
    lastVisit: Date;
    totalVisits: number;
    totalSpent: number;
    status: 'active' | 'inactive';
  }>;
}

/**
 * Error types for provider metrics operations
 */
export type ProviderMetricsError =
  | 'PROVIDER_NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'CALCULATION_ERROR'
  | 'DATABASE_ERROR'
  | 'PERMISSION_DENIED'
  | 'INVALID_PARAMETERS';

export interface ProviderMetricsResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: ProviderMetricsError;
    message: string;
    details?: Record<string, unknown>;
  };
  performance?: {
    calculationTime: number;
    dataPoints: number;
    cacheUsed: boolean;
  };
}
