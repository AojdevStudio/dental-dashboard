/**
 * Provider KPI Dashboard Container Component
 *
 * Main orchestrator for provider dashboard visualizations using compound component pattern
 */

'use client';

import { FinancialMetricsChart } from '@/components/dashboard/charts/financial-metrics-chart';
import { PatientAnalyticsChart } from '@/components/dashboard/charts/patient-analytics-chart';
import { ProviderPerformanceChart } from '@/components/dashboard/charts/provider-performance-chart';
import { ProviderComparisonTable } from '@/components/dashboard/provider-comparison-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProviderMetrics } from '@/hooks/use-provider-metrics';
import { usePerformanceMonitor } from '@/lib/utils/performance-monitor';
import type { MetricsQueryParams, ProviderMetrics } from '@/types/provider-metrics';
import { AlertTriangle, ArrowLeft, RefreshCcw, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React, { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

/**
 * Dashboard context for sharing state across compound components
 */
interface DashboardContextValue {
  providerId: string;
  providerName?: string;
  metrics?: ProviderMetrics;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  refreshMetrics: () => Promise<void>;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

/**
 * Hook to safely access dashboard context
 */
function useDashboardContext(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('Dashboard components must be used within ProviderKPIDashboard.Root');
  }
  return context;
}

/**
 * Root dashboard component that provides context and coordinates data loading
 */
function Root({
  providerId,
  providerName,
  initialPeriod = 'monthly',
  clinicId,
  children,
  className = '',
}: {
  providerId: string;
  providerName?: string;
  initialPeriod?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  clinicId?: string;
  children: ReactNode;
  className?: string;
}) {
  const [period, setPeriod] = React.useState(initialPeriod);

  // Performance monitoring
  const { startMeasure, endMeasure } = usePerformanceMonitor('ProviderKPIDashboard');

  // Prepare metrics query parameters
  const metricsParams: MetricsQueryParams = useMemo(
    () => ({
      providerId,
      clinicId,
      period,
      includeComparative: true,
      includeGoals: true,
      refreshCache: false,
    }),
    [providerId, clinicId, period]
  );

  // Fetch provider metrics with enhanced caching
  const {
    data: metrics,
    isLoading,
    isError,
    error,
    refreshCache,
  } = useProviderMetrics(metricsParams, {
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes to keep data longer
  });

  // Performance monitoring effects
  useEffect(() => {
    if (isLoading) {
      startMeasure();
    } else {
      endMeasure();
    }
  }, [isLoading, startMeasure, endMeasure]);

  const handlePeriodChange = React.useCallback((newPeriod: typeof period) => {
    setPeriod(newPeriod);
  }, []);

  const contextValue: DashboardContextValue = {
    providerId,
    providerName: providerName || metrics?.providerName,
    metrics,
    isLoading,
    isError,
    error,
    refreshMetrics: refreshCache,
    period,
    onPeriodChange: handlePeriodChange,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className={`space-y-6 ${className}`}>{children}</div>
    </DashboardContext.Provider>
  );
}

/**
 * Dashboard header with breadcrumbs and controls
 */
function Header({
  showBackButton = true,
  backHref = '/dashboard/providers',
  children,
}: {
  showBackButton?: boolean;
  backHref?: string;
  children?: ReactNode;
}) {
  const { providerName, period, onPeriodChange, refreshMetrics, isLoading } = useDashboardContext();

  const periods = [
    { value: 'daily' as const, label: 'Daily' },
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'monthly' as const, label: 'Monthly' },
    { value: 'quarterly' as const, label: 'Quarterly' },
    { value: 'yearly' as const, label: 'Yearly' },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      {showBackButton && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" asChild={true}>
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Providers
            </Link>
          </Button>
        </div>
      )}

      {/* Header Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {providerName ? `${providerName} Dashboard` : 'Provider Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Comprehensive KPI metrics and performance analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center border rounded-lg p-1">
            {periods.map((periodOption) => (
              <Button
                key={periodOption.value}
                variant={period === periodOption.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPeriodChange(periodOption.value)}
                className="text-xs"
              >
                {periodOption.label}
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Custom Header Content */}
      {children}
    </div>
  );
}

/**
 * Main content area with responsive grid layout
 */
function Content({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isLoading, isError } = useDashboardContext();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  return <div className={`grid gap-6 ${className}`}>{children}</div>;
}

/**
 * Grid section for organizing related KPI components
 */
function Section({
  title,
  description,
  children,
  className = '',
  cols = 'md:grid-cols-2 lg:grid-cols-3',
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  cols?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={`grid gap-4 ${cols}`}>{children}</div>
    </div>
  );
}

/**
 * KPI summary cards for key metrics
 */
function KPICards() {
  const { metrics, period } = useDashboardContext();

  if (!metrics) return null;

  const kpiData = [
    {
      title: 'Total Production',
      value: `$${metrics.financial.totalProduction.toLocaleString()}`,
      change: `${metrics.financial.productionGrowth > 0 ? '+' : ''}${metrics.financial.productionGrowth.toFixed(1)}%`,
      trend: metrics.financial.productionGrowth >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
    {
      title: 'Collection Rate',
      value: `${(metrics.financial.collectionRate * 100).toFixed(1)}%`,
      change: `${metrics.comparative.collectionVsAverage > 0 ? '+' : ''}${metrics.comparative.collectionVsAverage.toFixed(1)}% vs avg`,
      trend: metrics.comparative.collectionVsAverage >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
    {
      title: 'Total Patients',
      value: metrics.patient.totalPatients.toLocaleString(),
      change: `${metrics.patient.newPatients} new`,
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Appointment Rate',
      value: `${(metrics.performance.appointmentCompletionRate * 100).toFixed(1)}%`,
      change: `${metrics.performance.totalAppointments} total`,
      trend: metrics.performance.appointmentCompletionRate >= 0.8 ? 'up' : 'down',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Sections Loading */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState() {
  const { error, refreshMetrics } = useDashboardContext();

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle>Failed to Load Dashboard</CardTitle>
        <CardDescription>
          {error?.message || 'An unexpected error occurred while loading the provider dashboard.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={refreshMetrics} variant="outline" className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder component for chart areas
 */
function ChartPlaceholder({
  title,
  description,
  height = 'h-64',
}: {
  title: string;
  description?: string;
  height?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={`${height} flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/5`}
        >
          <div className="text-center text-sm text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Chart component will be implemented in Phase 4</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compound component export
 */
export const ProviderKPIDashboard = {
  Root,
  Header,
  Content,
  Section,
  KPICards,
  ChartPlaceholder,
  LoadingState,
  ErrorState,
};

/**
 * Chart sections that use dashboard context
 */
function DashboardChartSections({ providerId }: { providerId: string }) {
  const { metrics, isLoading, error } = useDashboardContext();

  return (
    <>
      {/* Financial Metrics Section */}
      <ProviderKPIDashboard.Section
        title="Financial Performance"
        description="Production, collections, and goal tracking"
        cols="md:grid-cols-1 lg:grid-cols-2"
      >
        <FinancialMetricsChart
          data={metrics ? [metrics.financial] : []}
          title="Financial Trends"
          description="Production and collections over time"
          chartType="bar"
          isLoading={isLoading}
          error={error}
        />
        <FinancialMetricsChart
          data={metrics ? [metrics.financial] : []}
          title="Goal Achievement"
          description="Progress towards financial goals"
          chartType="line"
          isLoading={isLoading}
          error={error}
        />
      </ProviderKPIDashboard.Section>

      {/* Performance Metrics Section */}
      <ProviderKPIDashboard.Section
        title="Performance Analytics"
        description="Appointments, productivity, and case acceptance"
        cols="md:grid-cols-1 lg:grid-cols-2"
      >
        <ProviderPerformanceChart
          data={metrics ? [metrics.performance] : []}
          title="Performance Trends"
          description="Goal achievement and productivity tracking"
          showGoalLines={true}
          isLoading={isLoading}
          error={error}
        />
        <ProviderPerformanceChart
          data={metrics ? [metrics.performance] : []}
          title="Goal Achievement"
          description="Performance targets and variance analysis"
          showVariance={true}
          isLoading={isLoading}
          error={error}
        />
      </ProviderKPIDashboard.Section>

      {/* Patient Analytics Section */}
      <ProviderKPIDashboard.Section
        title="Patient Analytics"
        description="Patient acquisition, retention, and value metrics"
        cols="md:grid-cols-1 lg:grid-cols-2"
      >
        <PatientAnalyticsChart
          data={metrics ? [metrics.patient] : []}
          title="Patient Overview"
          description="Patient counts and efficiency metrics"
          chartType="overview"
          isLoading={isLoading}
          error={error}
        />
        <PatientAnalyticsChart
          data={metrics ? [metrics.patient] : []}
          title="Procedure Distribution"
          description="Treatment breakdown and case acceptance"
          chartType="distribution"
          isLoading={isLoading}
          error={error}
        />
      </ProviderKPIDashboard.Section>

      {/* Comparative Analytics Section */}
      <ProviderKPIDashboard.Section
        title="Comparative Analysis"
        description="Performance compared to clinic averages and benchmarks"
        cols="md:grid-cols-1"
      >
        <ProviderComparisonTable
          data={metrics ? [metrics] : []}
          currentProviderId={providerId}
          title="Provider Rankings"
          description="Comprehensive performance comparison across all metrics"
          showRankings={true}
          showTrends={true}
          isLoading={isLoading}
          error={error}
        />
      </ProviderKPIDashboard.Section>
    </>
  );
}

/**
 * Convenience component that combines all dashboard parts
 */
export function ProviderDashboard({
  providerId,
  providerName,
  clinicId,
  className = '',
}: {
  providerId: string;
  providerName?: string;
  clinicId?: string;
  className?: string;
}) {
  return (
    <ProviderKPIDashboard.Root
      providerId={providerId}
      providerName={providerName}
      clinicId={clinicId}
      className={className}
    >
      <ProviderKPIDashboard.Header />

      <ProviderKPIDashboard.Content>
        {/* KPI Summary Cards */}
        <ProviderKPIDashboard.KPICards />

        {/* Chart Sections with Context */}
        <DashboardChartSections providerId={providerId} />
      </ProviderKPIDashboard.Content>
    </ProviderKPIDashboard.Root>
  );
}

export default ProviderKPIDashboard;
