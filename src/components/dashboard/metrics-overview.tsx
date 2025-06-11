'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton, MetricCardSkeleton } from '@/components/ui/skeleton-loaders';
import { useMetrics } from '@/hooks/use-metrics';
import { AlertCircle } from 'lucide-react';

/**
 * MetricsOverview Component
 *
 * Client-side component that demonstrates using React Query hooks
 * with skeleton loading states for optimal performance.
 *
 * Features:
 * - Automatic data caching with React Query
 * - Skeleton loading states
 * - Error handling
 * - Responsive grid layout
 */
export function MetricsOverview() {
  const { metrics, aggregatedMetrics, isLoading, metricsError, refetchMetrics } = useMetrics({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  // Error state
  if (metricsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          Failed to load metrics. Please try again later.
          <button type="button" onClick={() => refetchMetrics()} class="ml-2 underline">
            Retry
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  // Calculate summary metrics from aggregated data
  const totalProduction = aggregatedMetrics.monthly.reduce((sum, metric) => sum + metric.value, 0);

  const avgDailyProduction =
    aggregatedMetrics.daily.length > 0
      ? aggregatedMetrics.daily.reduce((sum, m) => sum + m.value, 0) /
        aggregatedMetrics.daily.length
      : 0;

  const latestMetric = metrics[0];
  const previousMetric = metrics[1];
  const trend =
    latestMetric && previousMetric
      ? ((latestMetric.value - previousMetric.value) / previousMetric.value) * 100
      : 0;

  return (
    <div class="space-y-6">
      {/* Summary Cards */}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Total Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">${totalProduction.toLocaleString()}</div>
            <p class="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">${avgDailyProduction.toLocaleString()}</div>
            <p class="text-xs text-muted-foreground">Per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Latest Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">${latestMetric?.value.toLocaleString() || 'N/A'}</div>
            <p class="text-xs text-muted-foreground">
              {latestMetric ? new Date(latestMetric.date).toLocaleDateString() : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div class={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </div>
            <p class="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder - would integrate with a charting library */}
      <Card class="p-6">
        <CardTitle class="mb-4">Production Trend</CardTitle>
        <div class="h-[350px] flex items-center justify-center text-muted-foreground">
          Chart visualization would go here
        </div>
      </Card>
    </div>
  );
}
