/**
 * Financial Metrics Chart Component
 *
 * Interactive financial metrics chart that visualizes provider financial KPIs
 * including production totals, collection rates, and overhead percentages
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProviderFinancialMetrics } from '@/types/provider-metrics';
import { AlertTriangle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface FinancialChartData {
  period: string;
  production: number;
  collections: number;
  overhead: number;
  netIncome: number;
  collectionRate: number;
}

interface FinancialMetricsChartProps {
  data: ProviderFinancialMetrics[];
  title?: string;
  description?: string;
  chartType?: 'bar' | 'line' | 'area';
  showTrends?: boolean;
  showComparison?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: FinancialChartData;
}

interface FinancialTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Custom tooltip for financial data with proper formatting
 */
function FinancialTooltip({ active, payload, label }: FinancialTooltipProps) {
  if (!(active && payload && payload.length > 0)) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={`${entry.dataKey}-${entry.name}`}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-medium">
            {entry.dataKey === 'collectionRate'
              ? `${entry.value.toFixed(1)}%`
              : `$${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Format financial data for chart consumption
 */
function formatFinancialData(data: ProviderFinancialMetrics[]): FinancialChartData[] {
  return data.map((metrics, index) => ({
    period: `Period ${index + 1}`, // TODO: Use actual period labels when available
    production: metrics.totalProduction,
    collections: metrics.totalCollections,
    overhead: metrics.totalOverhead,
    netIncome: metrics.netIncome,
    collectionRate: metrics.collectionRate * 100, // Convert to percentage
  }));
}

/**
 * Trend indicator component for showing financial trends
 */
function TrendIndicator({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className={colorClass}>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Loading state component for financial charts
 */
function FinancialChartLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-end h-48">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={`bar-skeleton-item-${i + 1}`}
                className="w-8"
                style={{ height: `${Math.random() * 150 + 50}px` }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`legend-skeleton-item-${i + 1}`} className="h-4 w-16" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component for financial charts
 */
function FinancialChartError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <h3 className="font-medium mb-2">Failed to Load Financial Data</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {error.message || 'An error occurred while loading financial metrics.'}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-sm text-primary hover:underline">
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main financial metrics chart component
 */
export function FinancialMetricsChart({
  data,
  title = 'Financial Performance',
  description = 'Production, collections, and overhead metrics',
  chartType = 'bar',
  showTrends = true,
  showComparison = true,
  isLoading = false,
  error = null,
  className = '',
}: FinancialMetricsChartProps) {
  // Handle loading state
  if (isLoading) {
    return <FinancialChartLoading />;
  }

  // Handle error state
  if (error) {
    return <FinancialChartError error={error} />;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No financial data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatFinancialData(data);

  // Calculate trends from first to last data point
  const firstData = data[0];
  const lastData = data.at(-1);
  const productionTrend =
    firstData && lastData
      ? ((lastData.totalProduction - firstData.totalProduction) / firstData.totalProduction) * 100
      : 0;
  const collectionTrend =
    firstData && lastData
      ? ((lastData.collectionRate - firstData.collectionRate) / firstData.collectionRate) * 100
      : 0;

  // Chart colors
  const colors = {
    production: '#3b82f6', // blue
    collections: '#10b981', // green
    overhead: '#f59e0b', // amber
    netIncome: '#8b5cf6', // purple
    collectionRate: '#ef4444', // red
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<FinancialTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="production"
              stroke={colors.production}
              strokeWidth={2}
              name="Production"
              dot={{ fill: colors.production, strokeWidth: 0, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="collections"
              stroke={colors.collections}
              strokeWidth={2}
              name="Collections"
              dot={{ fill: colors.collections, strokeWidth: 0, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="netIncome"
              stroke={colors.netIncome}
              strokeWidth={2}
              name="Net Income"
              dot={{ fill: colors.netIncome, strokeWidth: 0, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<FinancialTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="production"
              stackId="1"
              stroke={colors.production}
              fill={colors.production}
              fillOpacity={0.6}
              name="Production"
            />
            <Area
              type="monotone"
              dataKey="collections"
              stackId="1"
              stroke={colors.collections}
              fill={colors.collections}
              fillOpacity={0.6}
              name="Collections"
            />
            <Area
              type="monotone"
              dataKey="overhead"
              stackId="1"
              stroke={colors.overhead}
              fill={colors.overhead}
              fillOpacity={0.6}
              name="Overhead"
            />
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<FinancialTooltip />} />
            <Legend />
            <Bar
              dataKey="production"
              fill={colors.production}
              name="Production"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="collections"
              fill={colors.collections}
              name="Collections"
              radius={[2, 2, 0, 0]}
            />
            <Bar dataKey="overhead" fill={colors.overhead} name="Overhead" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showTrends && (
            <div className="text-right space-y-1">
              <TrendIndicator value={productionTrend} label="Production" />
              <TrendIndicator value={collectionTrend} label="Collections" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {showComparison && lastData && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Production</p>
                <p className="font-medium">${lastData.totalProduction.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Collection Rate</p>
                <p className="font-medium">{(lastData.collectionRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Income</p>
                <p className="font-medium">${lastData.netIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Overhead</p>
                <p className="font-medium">${lastData.totalOverhead.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FinancialMetricsChart;
