/**
 * Provider Performance Chart Component
 *
 * Interactive performance metrics charts that visualize provider performance KPIs
 * including goal achievement, variance analysis, and trend calculations
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProviderPerformanceMetrics } from '@/types/provider-metrics';
import { AlertTriangle, Target, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PerformanceChartData {
  period: string;
  actualProduction: number;
  goalProduction: number;
  appointmentCompletion: number;
  goalCompletion: number;
  variance: number;
  achievementRate: number;
}

interface ProviderPerformanceChartProps {
  data: ProviderPerformanceMetrics[];
  title?: string;
  description?: string;
  showGoalLines?: boolean;
  showVariance?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

/**
 * Custom tooltip for performance data with detailed breakdown
 */
function PerformanceTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[250px]">
      <p className="font-medium mb-3">{label}</p>
      {payload.map((entry: any, index: number) => {
        const isPercentage = entry.dataKey.includes('Rate') || entry.dataKey.includes('Completion');
        const isCurrency = entry.dataKey.includes('Production');

        let formattedValue = entry.value;
        if (isPercentage) {
          formattedValue = `${(entry.value * 100).toFixed(1)}%`;
        } else if (isCurrency) {
          formattedValue = `$${entry.value.toLocaleString()}`;
        } else {
          formattedValue = entry.value.toFixed(1);
        }

        return (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium">{formattedValue}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Performance status indicator
 */
function PerformanceStatus({
  current,
  target,
  label,
  format = 'number',
}: {
  current: number;
  target: number;
  label: string;
  format?: 'number' | 'percentage' | 'currency';
}) {
  const percentage = (current / target) * 100;
  const isOnTarget = percentage >= 95; // 95% or above considered on target
  const isCloseToTarget = percentage >= 80; // 80-94% close to target

  const statusColor = isOnTarget
    ? 'text-green-600'
    : isCloseToTarget
      ? 'text-yellow-600'
      : 'text-red-600';

  const StatusIcon = isOnTarget ? TrendingUp : TrendingDown;

  const formatValue = (value: number) => {
    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
          <span className={`text-sm font-medium ${statusColor}`}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Current: {formatValue(current)}</span>
          <span>Target: {formatValue(target)}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOnTarget ? 'bg-green-500' : isCloseToTarget ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Format performance data for chart consumption
 */
function formatPerformanceData(data: ProviderPerformanceMetrics[]): PerformanceChartData[] {
  return data.map((metrics, index) => ({
    period: `Period ${index + 1}`, // TODO: Use actual period labels when available
    actualProduction: metrics.actualProduction,
    goalProduction: metrics.goalProduction,
    appointmentCompletion: metrics.appointmentCompletionRate,
    goalCompletion: 0.85, // 85% target completion rate
    variance: metrics.performanceVariance,
    achievementRate: metrics.goalAchievementRate,
  }));
}

/**
 * Loading state component for performance charts
 */
function PerformanceChartLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart skeleton */}
          <div className="h-64 flex items-end justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-4" style={{ height: `${Math.random() * 100 + 50}px` }} />
                <Skeleton className="w-4" style={{ height: `${Math.random() * 80 + 30}px` }} />
              </div>
            ))}
          </div>

          {/* Performance indicators skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component for performance charts
 */
function PerformanceChartError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <h3 className="font-medium mb-2">Failed to Load Performance Data</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {error.message || 'An error occurred while loading performance metrics.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm text-primary hover:underline">
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main provider performance chart component
 */
export function ProviderPerformanceChart({
  data,
  title = 'Performance Metrics',
  description = 'Goal achievement and productivity tracking',
  showGoalLines = true,
  showVariance = true,
  isLoading = false,
  error = null,
  className = '',
}: ProviderPerformanceChartProps) {
  // Handle loading state
  if (isLoading) {
    return <PerformanceChartLoading />;
  }

  // Handle error state
  if (error) {
    return <PerformanceChartError error={error} />;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Target className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatPerformanceData(data);
  const latestData = data[data.length - 1];

  // Chart colors
  const colors = {
    actual: '#3b82f6', // blue
    goal: '#10b981', // green
    variance: '#f59e0b', // amber
    completion: '#8b5cf6', // purple
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<PerformanceTooltip />} />

              {/* Goal line */}
              {showGoalLines && (
                <ReferenceLine
                  y={latestData?.goalProduction || 0}
                  stroke={colors.goal}
                  strokeDasharray="5 5"
                  label={{ value: 'Goal', position: 'right' }}
                />
              )}

              {/* Actual performance line */}
              <Line
                type="monotone"
                dataKey="actualProduction"
                stroke={colors.actual}
                strokeWidth={3}
                name="Actual Production"
                dot={{ fill: colors.actual, strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, stroke: colors.actual, strokeWidth: 2, fill: 'white' }}
              />

              {/* Goal production line */}
              <Line
                type="monotone"
                dataKey="goalProduction"
                stroke={colors.goal}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Goal Production"
                dot={{ fill: colors.goal, strokeWidth: 0, r: 3 }}
              />

              {/* Appointment completion line (secondary axis) */}
              <Line
                type="monotone"
                dataKey="appointmentCompletion"
                stroke={colors.completion}
                strokeWidth={2}
                name="Appointment Rate"
                dot={{ fill: colors.completion, strokeWidth: 0, r: 3 }}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Status Indicators */}
        {latestData && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Current Performance Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PerformanceStatus
                current={latestData.actualProduction}
                target={latestData.goalProduction}
                label="Production Goal"
                format="currency"
              />
              <PerformanceStatus
                current={latestData.appointmentCompletionRate}
                target={0.85} // 85% target
                label="Appointment Completion"
                format="percentage"
              />
              <PerformanceStatus
                current={latestData.goalAchievementRate}
                target={1.0} // 100% target
                label="Overall Goal Achievement"
                format="percentage"
              />
              <PerformanceStatus
                current={Math.abs(latestData.performanceVariance)}
                target={0.1} // 10% variance threshold (lower is better)
                label="Performance Consistency"
                format="percentage"
              />
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {latestData && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Appointments</p>
                <p className="font-medium">{latestData.totalAppointments.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Production/Day</p>
                <p className="font-medium">
                  ${latestData.averageProductionPerDay.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Goal Achievement</p>
                <p
                  className={`font-medium ${
                    latestData.goalAchievementRate >= 0.95
                      ? 'text-green-600'
                      : latestData.goalAchievementRate >= 0.8
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {(latestData.goalAchievementRate * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Performance Variance</p>
                <p
                  className={`font-medium ${
                    Math.abs(latestData.performanceVariance) <= 0.1
                      ? 'text-green-600'
                      : Math.abs(latestData.performanceVariance) <= 0.2
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {latestData.performanceVariance > 0 ? '+' : ''}
                  {(latestData.performanceVariance * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProviderPerformanceChart;
