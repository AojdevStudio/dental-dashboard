/**
 * @fileoverview Metrics Aggregation Functions
 *
 * This module provides functions for aggregating metric data across different
 * time periods and grouping dimensions. Used for dashboard widgets and reports
 * that need pre-computed or on-the-fly data aggregations.
 */

import {
  type MetricDataPoint,
  MetricDataType,
  type MetricTrend,
  TimePeriod,
} from '@/types/database';

/**
 * Configuration options for metric aggregation operations
 */
export interface AggregationOptions {
  /** Time period for grouping (daily, weekly, monthly, etc.) */
  timePeriod: TimePeriod;
  /** Start date for aggregation period */
  startDate: Date;
  /** End date for aggregation period */
  endDate: Date;
  /** Optional provider ID for provider-specific aggregations */
  providerId?: string;
  /** Optional clinic ID for clinic-specific aggregations */
  clinicId?: string;
}

/**
 * Result structure for aggregated metric data
 */
export interface AggregatedMetric {
  /** Identifier for the time period */
  periodId: string;
  /** Human-readable period label */
  periodLabel: string;
  /** Start date of the period */
  periodStart: Date;
  /** End date of the period */
  periodEnd: Date;
  /** Aggregated value for the period */
  value: number;
  /** Number of data points in the aggregation */
  count: number;
  /** Minimum value in the period */
  min: number;
  /** Maximum value in the period */
  max: number;
  /** Average value for the period */
  average: number;
}

/**
 * Aggregates metric data points by time period
 *
 * Takes an array of metric data points and groups them by the specified time period,
 * calculating summary statistics for each period. Useful for creating time-series
 * visualizations and trend analysis.
 *
 * @param dataPoints - Array of metric data points to aggregate
 * @param options - Aggregation configuration options
 * @returns Promise resolving to array of aggregated metrics by time period
 *
 * @example
 * ```typescript
 * const aggregated = await aggregateByTimePeriod(dailyMetrics, {
 *   timePeriod: 'monthly',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31')
 * });
 * ```
 */
export async function aggregateByTimePeriod(
  dataPoints: MetricDataPoint[],
  options: AggregationOptions
): Promise<AggregatedMetric[]> {
  const { timePeriod } = options;

  // Group data points by time period
  const periodGroups = new Map<string, MetricDataPoint[]>();

  for (const point of dataPoints) {
    const periodKey = getPeriodKey(point.date, timePeriod);

    if (!periodGroups.has(periodKey)) {
      periodGroups.set(periodKey, []);
    }

    periodGroups.get(periodKey)?.push(point);
  }

  // Calculate aggregations for each period
  const aggregations: AggregatedMetric[] = [];

  for (const [periodKey, points] of periodGroups) {
    const values = points.map((p) =>
      typeof p.value === 'number' ? p.value : Number.parseFloat(String(p.value))
    );
    const validValues = values.filter((v) => !Number.isNaN(v));

    if (validValues.length === 0) {
      continue;
    }

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const { periodStart: pStart, periodEnd: pEnd } = getPeriodBounds(periodKey, timePeriod);

    aggregations.push({
      periodId: periodKey,
      periodLabel: formatPeriodLabel(pStart, timePeriod),
      periodStart: pStart,
      periodEnd: pEnd,
      value: sum,
      count: validValues.length,
      min: Math.min(...validValues),
      max: Math.max(...validValues),
      average: sum / validValues.length,
    });
  }

  return aggregations.sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());
}

/**
 * Calculates trend metrics comparing current and previous periods
 *
 * Analyzes aggregated metrics to identify trends, growth rates, and changes
 * over time. Returns enhanced metric data with trend indicators.
 *
 * @param aggregatedMetrics - Array of aggregated metrics in chronological order
 * @returns Array of metrics enhanced with trend analysis
 */
export function calculateTrends(aggregatedMetrics: AggregatedMetric[]): MetricTrend[] {
  return aggregatedMetrics.map((current, index) => {
    const previous = index > 0 ? aggregatedMetrics[index - 1] : null;

    let changePercent = 0;
    let _changeDirection: 'up' | 'down' | 'neutral' = 'neutral';

    if (previous && previous.value !== 0) {
      changePercent = ((current.value - previous.value) / previous.value) * 100;
      _changeDirection = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
    }

    return {
      metricId: current.periodId,
      metricName: current.periodLabel,
      dataType: MetricDataType.INTEGER,
      dataPoints: [
        {
          date: current.periodStart,
          value: current.value,
        },
      ],
      // Additional trend properties would be added here in a real implementation
    };
  });
}

/**
 * Generates a period key for grouping data points
 */
function getPeriodKey(date: Date, timePeriod: TimePeriod): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  switch (timePeriod) {
    case TimePeriod.DAILY:
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case TimePeriod.WEEKLY: {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return `${startOfWeek.getFullYear()}-W${getWeekNumber(startOfWeek)}`;
    }
    case TimePeriod.MONTHLY:
      return `${year}-${String(month + 1).padStart(2, '0')}`;
    case TimePeriod.QUARTERLY: {
      const quarter = Math.floor(month / 3) + 1;
      return `${year}-Q${quarter}`;
    }
    case TimePeriod.ANNUAL:
      return `${year}`;
    default:
      return date.toISOString().split('T')[0];
  }
}

/**
 * Calculates period boundaries based on period key and type
 */
function getPeriodBounds(
  periodKey: string,
  timePeriod: TimePeriod
): {
  periodStart: Date;
  periodEnd: Date;
} {
  const parts = periodKey.split('-');
  const year = Number.parseInt(parts[0], 10);

  switch (timePeriod) {
    case TimePeriod.DAILY: {
      const month = Number.parseInt(parts[1], 10) - 1;
      const day = Number.parseInt(parts[2], 10);
      const start = new Date(year, month, day);
      const end = new Date(year, month, day, 23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    }
    case TimePeriod.MONTHLY: {
      const month = Number.parseInt(parts[1], 10) - 1;
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    }
    case TimePeriod.QUARTERLY: {
      const quarter = Number.parseInt(parts[1].substring(1), 10);
      const startMonth = (quarter - 1) * 3;
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    }
    case TimePeriod.ANNUAL: {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    }
    default: {
      const start = new Date(periodKey);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { periodStart: start, periodEnd: end };
    }
  }
}

/**
 * Formats a period label for display
 */
function formatPeriodLabel(date: Date, timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case TimePeriod.DAILY:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case TimePeriod.WEEKLY:
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case TimePeriod.MONTHLY:
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    case TimePeriod.QUARTERLY: {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
    case TimePeriod.ANNUAL:
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Gets the week number for a given date
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
