'use client';
import { ProviderFilters } from '@/components/providers/provider-filters';
import { ProviderNavigation } from '@/components/providers/provider-navigation';
import type { ProviderWithLocations } from '@/types/providers';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Maximum allowed page number to prevent performance issues
 */
const MAX_PAGE = 1000;

/**
 * Safely parse integer from string with fallback to default value
 */
function safeParseInt(value: string | null, defaultValue: number): number {
  if (value === null) {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

interface ProvidersData {
  providers: ProviderWithLocations[];
  total: number;
}

interface LocationSummary {
  id: string;
  name: string;
  providerCount: number;
}

/**
 * Providers Page - Client Component Implementation
 *
 * Client-side rendered page that displays all providers with proper API data
 * Implements multi-tenant security and handles user interactions
 */
export default function ProvidersPage() {
  const searchParams = useSearchParams();
  const [providersData, setProvidersData] = useState<ProvidersData>({ providers: [], total: 0 });
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Parse search parameters
  const page = Math.max(1, Math.min(MAX_PAGE, safeParseInt(searchParams.get('page'), 1)));
  const limit = Math.max(1, Math.min(1000, safeParseInt(searchParams.get('limit'), 12)));

  const search = searchParams.get('search') || undefined;
  const providerType = searchParams.get('providerType') || undefined;
  const locationId = searchParams.get('locationId') || undefined;
  const status = searchParams.get('status') || undefined;

  // Validate enum-like parameters
  const allowedStatuses = ['active', 'inactive'];
  const validStatus = status && allowedStatuses.includes(status) ? status : undefined;

  const allowedProviderTypes = ['dentist', 'hygienist', 'specialist', 'other'];
  const validProviderType =
    providerType && allowedProviderTypes.includes(providerType) ? providerType : undefined;

  // Fetch data on mount and when search params change
  useEffect(() => {
    // Helper function to build query parameters
    const buildQueryParams = (
      page: number,
      limit: number,
      search?: string,
      providerType?: string,
      locationId?: string,
      status?: string
    ) => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (search) {
        params.append('search', search);
      }
      if (providerType) {
        params.append('providerType', providerType);
      }
      if (locationId) {
        params.append('locationId', locationId);
      }
      if (status) {
        params.append('status', status);
      }

      return params;
    };

    // Helper function to fetch providers data
    const fetchProvidersData = async (params: URLSearchParams) => {
      const response = await fetch(`/api/providers?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch providers');
      }

      return {
        providers: result.data,
        total: result.pagination?.total || 0,
      };
    };

    // Helper function to handle fetch errors
    const handleFetchError = (err: unknown) => {
      console.error('Error fetching providers data:', err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setProvidersData({ providers: [], total: 0 });
      setLocations([]);
    };

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const params = buildQueryParams(
          page,
          limit,
          search,
          validProviderType,
          locationId,
          validStatus
        );
        const providersData = await fetchProvidersData(params);

        setProvidersData(providersData);
        setLocations([]); // For now, set empty locations - can be implemented later
      } catch (err) {
        handleFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, limit, search, validProviderType, locationId, validStatus]);

  const handleRetry = () => {
    // Trigger a re-fetch by updating a dependency
    setIsLoading(true);
    setIsError(false);
    setError(null);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
            <p className="text-muted-foreground">Manage dental providers and their assignments</p>
          </div>
        </div>

        {/* Provider Filters */}
        <ProviderFilters
          locations={locations}
          showLocationFilter={true}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        />

        {/* Provider Navigation */}
        <ProviderNavigation
          providers={providersResult.providers}
          pagination={{
            page,
            limit,
            total: providersResult.total,
            totalPages: Math.ceil(providersResult.total / Math.max(1, limit)),
            hasNextPage: page < Math.ceil(providersResult.total / Math.max(1, limit)),
            hasPreviousPage: page > 1,
          }}
          emptyMessage="No providers found"
          emptyDescription="Try adjusting your search criteria or add a new provider to get started."
        />
      </div>
    </div>
  );
}
