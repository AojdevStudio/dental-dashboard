/**
 * React hook for provider metrics data fetching with caching
 */

import type {
  MetricsQueryParams,
  ProviderMetrics,
  ProviderMetricsTrend,
} from '@/types/provider-metrics';
import { type UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * API client for provider metrics
 */
class ProviderMetricsClient {
  private baseUrl = '/api/providers';

  async getProviderMetrics(params: MetricsQueryParams): Promise<ProviderMetrics> {
    const searchParams = new URLSearchParams({
      period: params.period,
      ...(params.clinicId && { clinicId: params.clinicId }),
      ...(params.dateRange && {
        startDate: params.dateRange.startDate.toISOString(),
        endDate: params.dateRange.endDate.toISOString(),
      }),
      includeComparative: String(params.includeComparative ?? true),
      includeGoals: String(params.includeGoals ?? true),
      refreshCache: String(params.refreshCache ?? false),
    });

    const response = await fetch(`${this.baseUrl}/${params.providerId}/metrics?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch provider metrics: ${response.status}`);
    }

    return response.json();
  }

  async getProviderMetricsTrend(
    params: MetricsQueryParams,
    metricName: string,
    periods = 12
  ): Promise<ProviderMetricsTrend> {
    const searchParams = new URLSearchParams({
      period: params.period,
      metricName,
      periods: String(periods),
      ...(params.clinicId && { clinicId: params.clinicId }),
      ...(params.dateRange && {
        startDate: params.dateRange.startDate.toISOString(),
        endDate: params.dateRange.endDate.toISOString(),
      }),
    });

    const response = await fetch(
      `${this.baseUrl}/${params.providerId}/metrics/trend?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch provider metrics trend: ${response.status}`
      );
    }

    return response.json();
  }

  async refreshMetricsCache(providerId: string, clinicId?: string): Promise<void> {
    const searchParams = new URLSearchParams({
      ...(clinicId && { clinicId }),
    });

    const response = await fetch(`${this.baseUrl}/${providerId}/metrics/refresh?${searchParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to refresh metrics cache: ${response.status}`);
    }
  }
}

// Singleton instance
const metricsClient = new ProviderMetricsClient();

/**
 * Query key factory for provider metrics
 */
const providerMetricsKeys = {
  all: ['provider-metrics'] as const,
  provider: (providerId: string) => [...providerMetricsKeys.all, providerId] as const,
  metrics: (params: MetricsQueryParams) =>
    [...providerMetricsKeys.provider(params.providerId), 'metrics', params] as const,
  trend: (params: MetricsQueryParams, metricName: string, periods: number) =>
    [
      ...providerMetricsKeys.provider(params.providerId),
      'trend',
      metricName,
      periods,
      params,
    ] as const,
};

/**
 * Hook options interface
 */
interface UseProviderMetricsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Hook for fetching provider metrics
 */
export function useProviderMetrics(
  params: MetricsQueryParams,
  options: UseProviderMetricsOptions = {}
): UseQueryResult<ProviderMetrics, Error> & {
  refreshCache: () => Promise<void>;
} {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  const queryResult = useQuery({
    queryKey: providerMetricsKeys.metrics(params),
    queryFn: () => metricsClient.getProviderMetrics(params),
    enabled,
    refetchInterval,
    staleTime,
    gcTime,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408 (timeout)
      if (error.message.includes('40') && !error.message.includes('408')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshCache = useCallback(async () => {
    await metricsClient.refreshMetricsCache(params.providerId, params.clinicId);
    await queryResult.refetch();
  }, [params.providerId, params.clinicId, queryResult]);

  return {
    ...queryResult,
    refreshCache,
  };
}

/**
 * Hook for fetching provider metrics trend
 */
export function useProviderMetricsTrend(
  params: MetricsQueryParams,
  metricName: string,
  periods = 12,
  options: UseProviderMetricsOptions = {}
): UseQueryResult<ProviderMetricsTrend, Error> {
  const {
    enabled = true,
    refetchInterval = 10 * 60 * 1000, // 10 minutes (trends change less frequently)
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 15 * 60 * 1000, // 15 minutes
  } = options;

  return useQuery({
    queryKey: providerMetricsKeys.trend(params, metricName, periods),
    queryFn: () => metricsClient.getProviderMetricsTrend(params, metricName, periods),
    enabled: enabled && !!metricName,
    refetchInterval,
    staleTime,
    gcTime,
    retry: (failureCount, error) => {
      if (error.message.includes('40') && !error.message.includes('408')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching multiple provider metrics trends
 */
export function useProviderMetricsTrends(
  params: MetricsQueryParams,
  metricNames: string[],
  periods = 12,
  options: UseProviderMetricsOptions = {}
): {
  trends: UseQueryResult<ProviderMetricsTrend, Error>[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const {
    enabled = true,
    refetchInterval = 10 * 60 * 1000,
    staleTime = 5 * 60 * 1000,
    gcTime = 15 * 60 * 1000,
  } = options;

  const trends = useQueries({
    queries: metricNames.map((metricName) => ({
      queryKey: providerMetricsKeys.trend(params, metricName, periods),
      queryFn: () => metricsClient.getProviderMetricsTrend(params, metricName, periods),
      enabled: enabled && !!metricName,
      refetchInterval,
      staleTime,
      gcTime,
      retry: (failureCount: number, error: Error) => {
        if (error.message.includes('40') && !error.message.includes('408')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })),
  });

  const isLoading = trends.some((trend) => trend.isLoading);
  const isError = trends.some((trend) => trend.isError);
  const error = trends.find((trend) => trend.error)?.error || null;

  return {
    trends,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook for comparing multiple providers' metrics
 */
export function useMultipleProviderMetrics(
  providers: Array<{ providerId: string; providerName?: string }>,
  baseParams: Omit<MetricsQueryParams, 'providerId'>,
  options: UseProviderMetricsOptions = {}
): {
  metrics: Array<
    UseQueryResult<ProviderMetrics, Error> & { providerId: string; providerName?: string }
  >;
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  successfulMetrics: ProviderMetrics[];
} {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000,
    staleTime = 2 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
  } = options;

  const metrics = useQueries({
    queries: providers.map((provider) => ({
      queryKey: providerMetricsKeys.metrics({ ...baseParams, providerId: provider.providerId }),
      queryFn: () =>
        metricsClient.getProviderMetrics({ ...baseParams, providerId: provider.providerId }),
      enabled: enabled && !!provider.providerId,
      refetchInterval,
      staleTime,
      gcTime,
      retry: (failureCount: number, error: Error) => {
        if (error.message.includes('40') && !error.message.includes('408')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })),
  });

  const enhancedMetrics = metrics.map((metric, index) => ({
    ...metric,
    providerId: providers[index].providerId,
    providerName: providers[index].providerName,
  }));

  const isLoading = metrics.some((metric) => metric.isLoading);
  const isError = metrics.some((metric) => metric.isError);
  const hasData = metrics.some((metric) => metric.data);
  const successfulMetrics = metrics
    .filter((metric) => metric.data !== undefined)
    .map((metric) => metric.data as NonNullable<typeof metric.data>);

  return {
    metrics: enhancedMetrics,
    isLoading,
    isError,
    hasData,
    successfulMetrics,
  };
}

/**
 * Hook for real-time metrics monitoring
 */
export function useRealtimeProviderMetrics(
  params: MetricsQueryParams,
  options: UseProviderMetricsOptions & {
    realtimeEnabled?: boolean;
    realtimeInterval?: number;
  } = {}
) {
  const { realtimeEnabled = false, realtimeInterval = 30 * 1000 } = options;

  const queryOptions: UseProviderMetricsOptions = useMemo(
    () => ({
      ...options,
      refetchInterval: realtimeEnabled ? realtimeInterval : options.refetchInterval,
      staleTime: realtimeEnabled ? 0 : options.staleTime,
      gcTime: realtimeEnabled ? 1 * 60 * 1000 : options.gcTime, // 1 minute in realtime mode
    }),
    [realtimeEnabled, realtimeInterval, options]
  );

  return useProviderMetrics(params, queryOptions);
}

/**
 * Metrics client for direct usage outside of React components
 */
export { metricsClient as providerMetricsClient };

/**
 * Query keys for external cache manipulation
 */
export { providerMetricsKeys };
