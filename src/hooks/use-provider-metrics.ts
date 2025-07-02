/**
 * @fileoverview React hook for provider KPI metrics data fetching and caching.
 *
 * Implements optimized data fetching for provider performance metrics with
 * automatic caching, error handling, and performance monitoring.
 *
 * Supports Story 1.1 AC2: KPI Metrics Dashboard requirements.
 */

import type {
  ProviderKPIDashboard,
  ProviderKPIQueryParams,
  ProviderKPIResponse,
} from '@/lib/types/provider-metrics';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

/**
 * Hook configuration options
 */
interface UseProviderMetricsOptions {
  /** Enable automatic refetching (default: true) */
  enabled?: boolean;
  /** Cache time in milliseconds (default: 5 minutes) */
  staleTime?: number;
  /** Refetch interval in milliseconds (default: 30 seconds) */
  refetchInterval?: number;
  /** Retry failed requests (default: 3) */
  retry?: number;
}

/**
 * Provider metrics hook return type
 */
interface UseProviderMetricsReturn {
  /** KPI dashboard data */
  data: ProviderKPIDashboard | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Is currently fetching data */
  isFetching: boolean;
  /** Performance information */
  performanceInfo?: {
    queryTime: number;
    dataFreshness: Date;
    cacheHit: boolean;
  };
  /** Refetch function */
  refetch: () => Promise<UseQueryResult<ProviderKPIResponse, Error>>;
  /** Update query parameters */
  updateParams: (newParams: Partial<ProviderKPIQueryParams>) => void;
  /** Current query parameters */
  currentParams: ProviderKPIQueryParams;
}

/**
 * Fetch provider KPI data from API
 */
async function fetchProviderKPIs(params: ProviderKPIQueryParams): Promise<ProviderKPIResponse> {
  const { providerId, ...queryParams } = params;

  // Build query string
  const searchParams = new URLSearchParams();

  if (queryParams.period) {
    searchParams.append('period', queryParams.period);
  }
  if (queryParams.startDate) {
    searchParams.append('startDate', queryParams.startDate);
  }
  if (queryParams.endDate) {
    searchParams.append('endDate', queryParams.endDate);
  }
  if (queryParams.locationId) {
    searchParams.append('locationId', queryParams.locationId);
  }
  if (queryParams.includeComparisons !== undefined) {
    searchParams.append('includeComparisons', queryParams.includeComparisons.toString());
  }
  if (queryParams.includeTrends !== undefined) {
    searchParams.append('includeTrends', queryParams.includeTrends.toString());
  }
  if (queryParams.compareToProvider) {
    searchParams.append('compareToProvider', queryParams.compareToProvider);
  }

  const url = `/api/providers/${providerId}/kpi?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch provider KPI data');
  }

  return {
    success: true,
    data: result.data,
    performanceInfo: result.performanceInfo,
  };
}

/**
 * Hook for fetching and managing provider KPI metrics data
 *
 * @param providerId - Provider ID to fetch metrics for
 * @param initialParams - Initial query parameters
 * @param options - Hook configuration options
 * @returns Provider metrics data and control functions
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   error,
 *   updateParams
 * } = useProviderMetrics('provider-123', {
 *   period: 'monthly',
 *   includeComparisons: true
 * });
 *
 * // Update to quarterly view
 * updateParams({ period: 'quarterly' });
 * ```
 */
export function useProviderMetrics(
  providerId: string,
  initialParams: Partial<ProviderKPIQueryParams> = {},
  options: UseProviderMetricsOptions = {}
): UseProviderMetricsReturn {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 30 * 1000, // 30 seconds
    retry = 3,
  } = options;

  // Manage query parameters state
  const [queryParams, setQueryParams] = useState<ProviderKPIQueryParams>({
    providerId,
    period: 'monthly',
    includeComparisons: true,
    includeTrends: true,
    ...initialParams,
  });

  // Update provider ID when it changes
  if (queryParams.providerId !== providerId) {
    setQueryParams((prev) => ({ ...prev, providerId }));
  }

  // Create query key for caching
  const queryKey = ['provider-kpi', queryParams];

  // Use React Query for data fetching with caching
  const query = useQuery({
    queryKey,
    queryFn: () => fetchProviderKPIs(queryParams),
    enabled: enabled && !!providerId,
    staleTime,
    refetchInterval,
    retry,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });

  // Update parameters function
  const updateParams = useCallback(
    (newParams: Partial<ProviderKPIQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
        providerId, // Ensure provider ID stays consistent
      }));
    },
    [providerId]
  );

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    performanceInfo: query.data?.performanceInfo,
    refetch: query.refetch,
    updateParams,
    currentParams: queryParams,
  };
}

/**
 * Hook for fetching multiple providers' KPI data for comparison
 * Note: This function is designed for a maximum of 10 providers to avoid performance issues
 *
 * @param providerIds - Array of provider IDs to compare (max 10)
 * @param queryParams - Common query parameters for all providers
 * @param options - Hook configuration options
 * @returns Array of provider metrics data
 */
export function useProviderComparison(
  providerIds: string[],
  queryParams: Partial<ProviderKPIQueryParams> = {},
  options: UseProviderMetricsOptions = {}
) {
  // Limit to max 10 providers to prevent performance issues
  const limitedProviderIds = providerIds.slice(0, 10);

  // Always call hooks unconditionally, passing empty string for missing providers
  const provider1 = useProviderMetrics(limitedProviderIds[0] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[0],
  });
  const provider2 = useProviderMetrics(limitedProviderIds[1] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[1],
  });
  const provider3 = useProviderMetrics(limitedProviderIds[2] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[2],
  });
  const provider4 = useProviderMetrics(limitedProviderIds[3] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[3],
  });
  const provider5 = useProviderMetrics(limitedProviderIds[4] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[4],
  });
  const provider6 = useProviderMetrics(limitedProviderIds[5] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[5],
  });
  const provider7 = useProviderMetrics(limitedProviderIds[6] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[6],
  });
  const provider8 = useProviderMetrics(limitedProviderIds[7] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[7],
  });
  const provider9 = useProviderMetrics(limitedProviderIds[8] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[8],
  });
  const provider10 = useProviderMetrics(limitedProviderIds[9] || '', queryParams, {
    ...options,
    enabled: options.enabled && !!limitedProviderIds[9],
  });

  const allQueries = [
    provider1,
    provider2,
    provider3,
    provider4,
    provider5,
    provider6,
    provider7,
    provider8,
    provider9,
    provider10,
  ];

  // Filter to only include providers with valid IDs
  const validQueries = allQueries.filter((_, index) => !!limitedProviderIds[index]);

  return {
    data: validQueries.map((q) => q.data).filter(Boolean),
    isLoading: validQueries.some((q) => q.isLoading),
    errors: validQueries.map((q) => q.error).filter(Boolean),
    isFetching: validQueries.some((q) => q.isFetching),
    refetchAll: () => Promise.all(validQueries.map((q) => q.refetch())),
    providersData: validQueries.map((query, index) => ({
      providerId: limitedProviderIds[index],
      ...query,
    })),
  };
}

/**
 * Lightweight hook for basic provider metrics summary
 * Useful for provider cards and summary views
 */
export function useProviderMetricsSummary(
  providerId: string,
  period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
) {
  return useProviderMetrics(
    providerId,
    {
      period,
      includeComparisons: false,
      includeTrends: false,
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes for summary data
      refetchInterval: 60 * 1000, // 1 minute
    }
  );
}

/**
 * Hook for real-time provider performance monitoring
 * Higher refresh rate for dashboard displays
 */
export function useProviderRealtimeMetrics(
  providerId: string,
  queryParams: Partial<ProviderKPIQueryParams> = {}
) {
  return useProviderMetrics(providerId, queryParams, {
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 15 * 1000, // 15 seconds
    retry: 5,
  });
}
