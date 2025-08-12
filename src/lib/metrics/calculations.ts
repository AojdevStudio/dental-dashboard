/**
 * @fileoverview Metrics Calculation Functions
 *
 * This module provides functions for calculating derived metrics, KPIs, and
 * performance indicators used throughout the dental dashboard. All functions
 * are type-safe and handle edge cases like division by zero.
 */

/**
 * Financial metrics calculation results
 */
export interface FinancialMetrics {
  /** Total production amount */
  totalProduction: number;
  /** Total collections amount */
  totalCollections: number;
  /** Collection percentage (collections / production * 100) */
  collectionPercentage: number;
  /** Net production after adjustments */
  netProduction: number;
  /** Total adjustments amount */
  totalAdjustments: number;
  /** Adjustment percentage */
  adjustmentPercentage: number;
}

/**
 * Patient metrics calculation results
 */
export interface PatientMetrics {
  /** Total number of active patients */
  activePatients: number;
  /** Number of new patients in period */
  newPatients: number;
  /** Patient retention rate as percentage */
  retentionRate: number;
  /** Average patient value */
  averagePatientValue: number;
  /** Patient growth rate */
  growthRate: number;
}

/**
 * Appointment metrics calculation results
 */
export interface AppointmentMetrics {
  /** Total scheduled appointments */
  totalScheduled: number;
  /** Number of completed appointments */
  completed: number;
  /** Number of cancelled appointments */
  cancelled: number;
  /** Number of no-show appointments */
  noShows: number;
  /** Completion rate as percentage */
  completionRate: number;
  /** No-show rate as percentage */
  noShowRate: number;
  /** Cancellation rate as percentage */
  cancellationRate: number;
}

/**
 * Production efficiency metrics
 */
export interface EfficiencyMetrics {
  /** Production per hour worked */
  productionPerHour: number;
  /** Average appointment duration in minutes */
  averageAppointmentDuration: number;
  /** Utilization rate as percentage */
  utilizationRate: number;
  /** Revenue per patient visit */
  revenuePerVisit: number;
}

/**
 * Calculates comprehensive financial metrics from raw financial data
 *
 * @param production - Total production amount
 * @param collections - Total collections amount
 * @param adjustments - Total adjustments amount (positive for write-offs)
 * @returns Calculated financial metrics with percentages
 *
 * @example
 * ```typescript
 * const metrics = calculateFinancialMetrics(100000, 95000, 5000);
 * // Returns: { totalProduction: 100000, collectionPercentage: 95, ... }
 * ```
 */
export function calculateFinancialMetrics(
  production: number,
  collections: number,
  adjustments = 0
): FinancialMetrics {
  const netProduction = production - adjustments;

  return {
    totalProduction: production,
    totalCollections: collections,
    collectionPercentage: production > 0 ? (collections / production) * 100 : 0,
    netProduction,
    totalAdjustments: adjustments,
    adjustmentPercentage: production > 0 ? (adjustments / production) * 100 : 0,
  };
}

/**
 * Calculates patient-related metrics and growth indicators
 *
 * @param activePatients - Current number of active patients
 * @param newPatients - Number of new patients in period
 * @param previousActivePatients - Active patients in previous period for growth calculation
 * @param totalRevenue - Total revenue for calculating average patient value
 * @returns Calculated patient metrics
 */
export function calculatePatientMetrics(
  activePatients: number,
  newPatients: number,
  previousActivePatients = 0,
  totalRevenue = 0
): PatientMetrics {
  const retentionRate =
    previousActivePatients > 0
      ? ((activePatients - newPatients) / previousActivePatients) * 100
      : 0;

  const growthRate =
    previousActivePatients > 0
      ? ((activePatients - previousActivePatients) / previousActivePatients) * 100
      : 0;

  const averagePatientValue = activePatients > 0 ? totalRevenue / activePatients : 0;

  return {
    activePatients,
    newPatients,
    retentionRate: Math.max(0, Math.min(100, retentionRate)), // Clamp between 0-100
    averagePatientValue,
    growthRate,
  };
}

/**
 * Calculates appointment scheduling and completion metrics
 *
 * @param totalScheduled - Total number of scheduled appointments
 * @param completed - Number of completed appointments
 * @param cancelled - Number of cancelled appointments
 * @param noShows - Number of no-show appointments
 * @returns Calculated appointment metrics with rates
 */
export function calculateAppointmentMetrics(
  totalScheduled: number,
  completed: number,
  cancelled: number,
  noShows: number
): AppointmentMetrics {
  const safeTotal = Math.max(1, totalScheduled); // Prevent division by zero

  return {
    totalScheduled,
    completed,
    cancelled,
    noShows,
    completionRate: (completed / safeTotal) * 100,
    noShowRate: (noShows / safeTotal) * 100,
    cancellationRate: (cancelled / safeTotal) * 100,
  };
}

/**
 * Calculates provider efficiency and productivity metrics
 *
 * @param production - Total production amount
 * @param hoursWorked - Total hours worked in the period
 * @param appointmentCount - Number of appointments completed
 * @param totalAppointmentMinutes - Total minutes spent in appointments
 * @param scheduledHours - Total scheduled work hours for utilization calculation
 * @returns Calculated efficiency metrics
 */
export function calculateEfficiencyMetrics(
  production: number,
  hoursWorked: number,
  appointmentCount: number,
  totalAppointmentMinutes: number,
  scheduledHours: number = hoursWorked
): EfficiencyMetrics {
  const productionPerHour = hoursWorked > 0 ? production / hoursWorked : 0;
  const averageAppointmentDuration =
    appointmentCount > 0 ? totalAppointmentMinutes / appointmentCount : 0;
  const utilizationRate = scheduledHours > 0 ? (hoursWorked / scheduledHours) * 100 : 0;
  const revenuePerVisit = appointmentCount > 0 ? production / appointmentCount : 0;

  return {
    productionPerHour,
    averageAppointmentDuration,
    utilizationRate: Math.min(100, utilizationRate), // Cap at 100%
    revenuePerVisit,
  };
}

/**
 * Calculates variance between actual and target values
 *
 * @param actual - Actual value achieved
 * @param target - Target value to compare against
 * @returns Object with variance amount and percentage
 */
export function calculateVariance(
  actual: number,
  target: number
): { variance: number; variancePercentage: number } {
  const variance = actual - target;
  const variancePercentage = target > 0 ? (variance / target) * 100 : 0;

  return { variance, variancePercentage };
}

/**
 * Calculates growth rate between two periods
 *
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Growth rate as percentage (positive for growth, negative for decline)
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculates moving average for trend smoothing
 *
 * @param values - Array of numeric values
 * @param windowSize - Size of the moving average window
 * @returns Array of moving averages (shorter than input by windowSize - 1)
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > values.length) {
    throw new Error('Invalid window size for moving average calculation');
  }

  const result: number[] = [];

  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(average);
  }

  return result;
}

/**
 * Calculates percentile rank for a value in a dataset
 *
 * @param value - Value to find percentile for
 * @param dataset - Array of values to compare against
 * @returns Percentile rank (0-100)
 */
export function calculatePercentileRank(value: number, dataset: number[]): number {
  if (dataset.length === 0) {
    return 0;
  }

  const sortedData = [...dataset].sort((a, b) => a - b);
  const countBelow = sortedData.filter((v) => v < value).length;
  const countEqual = sortedData.filter((v) => v === value).length;

  return ((countBelow + countEqual * 0.5) / sortedData.length) * 100;
}
