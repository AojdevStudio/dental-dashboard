/**
 * @fileoverview React hook for fetching and managing provider data
 *
 * This hook provides a clean interface for interacting with the enhanced
 * providers API, including filtering, pagination, and real-time updates.
 */

import type {
  CreateProviderRequest,
  ProviderWithLocations,
  ProvidersQueryParams,
} from '@/types/providers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

// API response type for the enhanced providers endpoint
interface ApiResponse {
  success: boolean;
  data: ProviderWithLocations[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Hook configuration options
interface UseProvidersOptions {
  initialFilters?: Partial<ProvidersQueryParams>;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

// Hook return type
interface UseProvidersReturn {
  // Data
  providers: ProviderWithLocations[];
  pagination: ApiResponse['pagination'] | null;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filters and pagination
  filters: ProvidersQueryParams;
  setFilters: (filters: Partial<ProvidersQueryParams>) => void;
  clearFilters: () => void;

  // Pagination controls
  page: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Actions
  refetch: () => void;
  createProvider: (data: CreateProviderRequest) => Promise<void>;
  isCreating: boolean;
}

/**
 * Fetches providers from the API with the given parameters
 */
async function fetchProviders(params: ProvidersQueryParams): Promise<ApiResponse> {
  const searchParams = new URLSearchParams();

  // Add all defined parameters to the search params
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const response = await fetch(`/api/providers?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Creates a new provider
 */
async function createProvider(data: CreateProviderRequest): Promise<ProviderWithLocations> {
  const response = await fetch('/api/providers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Custom hook for managing provider data with filtering and pagination
 */
export function useProviders(options: UseProvidersOptions = {}): UseProvidersReturn {
  const { initialFilters = {}, enabled = true, refetchOnWindowFocus = false } = options;

  const queryClient = useQueryClient();

  // State for filters and pagination
  const [filters, setFiltersState] = useState<ProvidersQueryParams>(() => {
    const defaultFilters = { page: 1, limit: 10 };
    return {
      ...defaultFilters,
      ...(initialFilters || {}),
      page:
        initialFilters?.page !== undefined && initialFilters.page !== null
          ? initialFilters.page
          : defaultFilters.page,
      limit:
        initialFilters?.limit !== undefined && initialFilters.limit !== null
          ? initialFilters.limit
          : defaultFilters.limit,
    };
  });

  // Query for fetching providers
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['providers', filters],
    queryFn: () => fetchProviders(filters),
    enabled,
    refetchOnWindowFocus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating providers
  const createMutation = useMutation({
    mutationFn: createProvider,
    onSuccess: () => {
      // Invalidate providers query to refetch data
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });

  // Filter management
  const setFilters = useCallback((newFilters: Partial<ProvidersQueryParams>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (unless page is explicitly set)
      page:
        newFilters.page !== undefined
          ? newFilters.page
          : Object.keys(newFilters).some(
                (k) =>
                  k !== 'page' &&
                  k !== 'limit' &&
                  newFilters[k as keyof typeof newFilters] !== prev[k as keyof typeof prev]
              )
            ? 1
            : prev.page,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: filters.limit, // Keep the current limit
    });
  }, [filters.limit]);

  // Pagination helpers
  const setPage = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  const nextPage = useCallback(() => {
    if (data?.pagination && filters.page! < data.pagination.totalPages) {
      setPage(filters.page! + 1);
    }
  }, [data?.pagination, filters.page, setPage]);

  const previousPage = useCallback(() => {
    if (filters.page! > 1) {
      setPage(filters.page! - 1);
    }
  }, [filters.page, setPage]);

  // Create provider wrapper
  const handleCreateProvider = useCallback(
    async (providerData: CreateProviderRequest) => {
      await createMutation.mutateAsync(providerData);
    },
    [createMutation]
  );

  return {
    // Data
    providers: data?.data || [],
    pagination: data?.pagination || null,

    // Loading states
    isLoading,
    isError,
    error: error as Error | null,

    // Filters and pagination
    filters,
    setFilters,
    clearFilters,

    // Pagination controls
    page: filters.page || 1,
    setPage,
    nextPage,
    previousPage,

    // Actions
    refetch,
    createProvider: handleCreateProvider,
    isCreating: createMutation.isPending,
  };
}

/**
 * Hook for fetching a single provider by ID
 */
export function useProvider(providerId: string, enabled = true) {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: async (): Promise<ProviderWithLocations> => {
      const response = await fetch(`/api/providers?providerId=${providerId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provider: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();
      if (!result.data || result.data.length === 0) {
        throw new Error('Provider not found');
      }

      return result.data[0];
    },
    enabled: enabled && !!providerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for provider statistics and quick filters
 */
export function useProviderFilters(clinicId?: string) {
  return useQuery({
    queryKey: ['provider-filters', clinicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clinicId) {
        params.append('clinicId', clinicId);
      }

      const response = await fetch(`/api/providers?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch provider data');
      }

      const result: ApiResponse = await response.json();
      const providers = result.data;

      // Calculate filter options from the data
      const providerTypes = [...new Set(providers.map((p) => p.providerType))];
      const statuses = [...new Set(providers.map((p) => p.status))];
      const locations = [
        ...new Set(
          providers.flatMap((p) =>
            p.locations.map((l) => ({ id: l.locationId, name: l.locationName }))
          )
        ),
      ];

      return {
        providerTypes,
        statuses,
        locations,
        totalCount: result.pagination.total,
      };
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options don't change often
  });
}
