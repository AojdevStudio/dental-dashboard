'use client';

/**
 * @fileoverview Main provider KPI dashboard component.
 *
 * Integrates all provider KPI components (Financial, Performance, Patient, Comparative)
 * with real-time data fetching and error handling.
 *
 * Implements Story 1.1 AC2: KPI Metrics Dashboard complete integration.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProviderMetrics } from '@/hooks/use-provider-metrics';
import type { ProviderKPIQueryParams } from '@/lib/types/provider-metrics';
import { AlertCircle, BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import ProviderComparativeKPIs from './provider-comparative-kpis';
import ProviderFinancialKPIs from './provider-financial-kpis';
import ProviderPatientKPIs from './provider-patient-kpis';
import ProviderPerformanceKPIs from './provider-performance-kpis';

interface ProviderKPIDashboardProps {
  /** Provider ID to display KPIs for */
  providerId: string;
  /** Initial query parameters */
  initialParams?: Partial<ProviderKPIQueryParams>;
  /** Show compact view */
  compact?: boolean;
  /** Default active tab */
  defaultTab?: 'financial' | 'performance' | 'patient' | 'comparative';
}

/**
 * Error display component
 */
function ErrorDisplay({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Failed to load KPI data</h3>
            <p className="text-sm text-red-600 mt-1">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for the entire dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => i).map((index) => (
          <Card key={`dashboard-skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Performance info display
 */
function PerformanceInfo({
  performanceInfo,
}: {
  performanceInfo?: { queryTime: number; dataFreshness: Date; cacheHit: boolean };
}) {
  if (!performanceInfo) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-4">
      <span>Query time: {performanceInfo.queryTime}ms</span>
      <span>Updated: {performanceInfo.dataFreshness.toLocaleTimeString()}</span>
      {performanceInfo.cacheHit && <span className="text-green-600">Cached</span>}
    </div>
  );
}

/**
 * Main Provider KPI Dashboard Component
 */
export default function ProviderKPIDashboard({
  providerId,
  initialParams = {},
  compact = false,
  defaultTab = 'financial',
}: ProviderKPIDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const {
    data: dashboardData,
    isLoading,
    error,
    isFetching,
    performanceInfo,
    refetch,
    updateParams,
    currentParams,
  } = useProviderMetrics(providerId, {
    period: 'monthly',
    includeComparisons: true,
    includeTrends: true,
    ...initialParams,
  });

  // Handle loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Handle error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={() => refetch()} />;
  }

  // Handle missing data
  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No KPI data available for this provider.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { financial, performance, patient, comparative, period } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Provider KPI Dashboard</h2>
          <p className="text-muted-foreground">Performance metrics for {period.label}</p>
        </div>
        <div className="flex items-center gap-4">
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              Updating...
            </div>
          )}
          <PerformanceInfo performanceInfo={performanceInfo} />
        </div>
      </div>

      {/* Period Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Period:</span>
        {(['monthly', 'quarterly', 'yearly'] as const).map((periodOption) => (
          <button
            key={periodOption}
            type="button"
            onClick={() => updateParams({ period: periodOption })}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentParams.period === periodOption
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-muted-foreground hover:bg-gray-100'
            }`}
          >
            {periodOption.charAt(0).toUpperCase() + periodOption.slice(1)}
          </button>
        ))}
      </div>

      {/* KPI Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="patient" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patient
          </TabsTrigger>
          <TabsTrigger value="comparative" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparative
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Financial Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderFinancialKPIs
                data={financial}
                isLoading={false}
                showDetails={!compact}
                compact={compact}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderPerformanceKPIs
                data={performance}
                isLoading={false}
                showDetails={!compact}
                compact={compact}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Patient Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderPatientKPIs
                data={patient}
                isLoading={false}
                showDetails={!compact}
                compact={compact}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Comparative Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderComparativeKPIs
                data={comparative}
                isLoading={false}
                showDetails={!compact}
                compact={compact}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Completeness Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.dataCompleteness.financialData}%
              </div>
              <div className="text-xs text-muted-foreground">Financial Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.dataCompleteness.performanceData}%
              </div>
              <div className="text-xs text-muted-foreground">Performance Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.dataCompleteness.patientData}%
              </div>
              <div className="text-xs text-muted-foreground">Patient Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.dataCompleteness.comparativeData}%
              </div>
              <div className="text-xs text-muted-foreground">Comparative Data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
