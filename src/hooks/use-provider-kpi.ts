/**
 * React hook for provider KPI dashboard data fetching
 */

import type { ProviderKPIDashboard } from '@/lib/types/provider-metrics';
import type { MetricsQueryParams } from '@/types/provider-metrics';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

/**
 * Fetch provider KPI dashboard data
 */
async function fetchProviderKPIDashboard(
  providerId: string,
  params: Partial<MetricsQueryParams>
): Promise<ProviderKPIDashboard> {
  const searchParams = new URLSearchParams({
    period: params.period || 'monthly',
    ...(params.clinicId && { clinicId: params.clinicId }),
    ...(params.dateRange && {
      startDate: params.dateRange.startDate.toISOString(),
      endDate: params.dateRange.endDate.toISOString(),
    }),
    includeComparisons: String(params.includeComparative ?? true),
    includeTrends: String(params.includeGoals ?? true),
  });

  const response = await fetch(`/api/providers/${providerId}/kpi?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch provider KPI dashboard: ${response.status}`
    );
  }

  const data = await response.json();
  return data.data || data; // Handle both wrapped and unwrapped responses
}

/**
 * Hook for fetching provider KPI dashboard data
 */
export function useProviderKPIDashboard(
  providerId: string,
  params: Partial<MetricsQueryParams> = {}
): UseQueryResult<ProviderKPIDashboard, Error> {
  return useQuery({
    queryKey: ['provider-kpi', providerId, params],
    queryFn: () => fetchProviderKPIDashboard(providerId, params),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
