'use client';

/**
 * @fileoverview Provider Charts Section for the provider detail page
 *
 * This component integrates the ProviderCharts with the provider metrics data
 * to implement AC3: Interactive Chart Visualizations from Story 1.1
 */

import ProviderCharts from '@/components/dashboard/charts/provider-charts';
import { useProviderMetrics } from '@/hooks/use-provider-metrics';

interface ProviderChartsSectionProps {
  providerId: string;
}

/**
 * Provider Charts Section - Fetches data and renders interactive charts
 *
 * Implements AC3: Interactive Chart Visualizations:
 * - Line charts for production trends and goal progress over time
 * - Bar charts for monthly/quarterly performance comparisons
 * - Pie charts for revenue breakdown and procedure type distribution
 * - Gauge charts for goal achievement percentages and performance ratings
 * - All charts are interactive with tooltips and responsive design
 */
export default function ProviderChartsSection({ providerId }: ProviderChartsSectionProps) {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useProviderMetrics(providerId, {
    period: 'monthly',
    includeComparisons: true,
    includeTrends: true,
  });

  return <ProviderCharts data={dashboardData || null} isLoading={isLoading} error={error} />;
}
