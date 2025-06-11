import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useClinics } from './use-clinics';

/**
 * Metric value type
 */
interface MetricValue {
  id: string;
  metricId: string;
  value: number;
  date: string;
  providerId?: string;
  clinicId: string;
}

/**
 * Aggregated metrics type
 */
interface AggregatedMetrics {
  daily: MetricValue[];
  weekly: MetricValue[];
  monthly: MetricValue[];
  quarterly: MetricValue[];
}

/**
 * Metric filters
 */
interface MetricFilters {
  startDate?: string;
  endDate?: string;
  providerId?: string;
  metricIds?: string[];
}

/**
 * Custom hook for managing metrics data with React Query caching
 *
 * This hook provides:
 * - Automatic caching of metrics data
 * - Intelligent cache invalidation based on filters
 * - Support for aggregated and raw metrics
 * - Type-safe metric operations
 *
 * @example
 * const { metrics, aggregatedMetrics, isLoading } = useMetrics({
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * });
 */
export function useMetrics(filters: MetricFilters = {}) {
  const { user } = useAuth();
  const { selectedClinicId } = useClinics();
  const queryClient = useQueryClient();

  // Create a stable query key based on filters
  const metricsQueryKey = ['metrics', selectedClinicId, filters];
  const aggregatedQueryKey = ['metrics', 'aggregated', selectedClinicId, filters];

  /**
   * Fetch raw metrics from the API
   */
  const fetchMetrics = async (): Promise<MetricValue[]> => {
    const params = new URLSearchParams();

    if (selectedClinicId) params.append('clinicId', selectedClinicId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.providerId) params.append('providerId', filters.providerId);
    if (filters.metricIds?.length) {
      for (const id of filters.metricIds) {
        params.append('metricIds', id);
      }
    }

    const response = await fetch(`/api/metrics?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    const data = await response.json();
    return data.metrics || [];
  };

  /**
   * Fetch aggregated metrics from the API
   */
  const fetchAggregatedMetrics = async (): Promise<AggregatedMetrics> => {
    const params = new URLSearchParams();

    if (selectedClinicId) params.append('clinicId', selectedClinicId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.providerId) params.append('providerId', filters.providerId);

    const response = await fetch(`/api/metrics/aggregated?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch aggregated metrics');
    }

    return response.json();
  };

  /**
   * Query for raw metrics
   */
  const metricsQuery = useQuery({
    queryKey: metricsQueryKey,
    queryFn: fetchMetrics,
    enabled: !!user && !!selectedClinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  /**
   * Query for aggregated metrics
   */
  const aggregatedQuery = useQuery({
    queryKey: aggregatedQueryKey,
    queryFn: fetchAggregatedMetrics,
    enabled: !!user && !!selectedClinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  /**
   * Prefetch metrics for a specific date range
   */
  const prefetchMetrics = async (dateRange: { startDate: string; endDate: string }) => {
    await queryClient.prefetchQuery({
      queryKey: ['metrics', selectedClinicId, { ...filters, ...dateRange }],
      queryFn: fetchMetrics,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Invalidate all metrics queries
   */
  const invalidateMetrics = () => {
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
  };

  return {
    // Raw metrics
    metrics: metricsQuery.data || [],
    isLoadingMetrics: metricsQuery.isLoading,
    metricsError: metricsQuery.error,
    refetchMetrics: metricsQuery.refetch,

    // Aggregated metrics
    aggregatedMetrics: aggregatedQuery.data || {
      daily: [],
      weekly: [],
      monthly: [],
      quarterly: [],
    },
    isLoadingAggregated: aggregatedQuery.isLoading,
    aggregatedError: aggregatedQuery.error,
    refetchAggregated: aggregatedQuery.refetch,

    // Combined loading state
    isLoading: metricsQuery.isLoading || aggregatedQuery.isLoading,

    // Utilities
    prefetchMetrics,
    invalidateMetrics,
  };
}
