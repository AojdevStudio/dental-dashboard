'use client';

import { PermissionsProvider } from '@/components/providers/permissions-provider';
import { ProviderFilters } from '@/components/providers/provider-filters';
import { type PaginationInfo, ProviderGrid } from '@/components/providers/provider-grid';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { useProviderFilters, useProviders } from '@/hooks/use-providers';
import type { ProviderWithLocations } from '@/types/providers';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Client component wrapper that manages state and data fetching
 */
function ProvidersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permissions = usePermissions();

  // Parse URL parameters
  const filters = useMemo(() => {
    const search = searchParams.get('search') || '';
    const providerType = searchParams.get('providerType') || '';
    const status = searchParams.get('status') || '';
    const locationId = searchParams.get('locationId') || '';
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
    const viewMode = searchParams.get('viewMode') === 'list' ? 'list' : 'grid';

    // Ensure safe defaults for NaN values
    const safePage = Number.isNaN(page) ? 1 : page;
    const safeLimit = Number.isNaN(limit) ? 12 : limit;

    return {
      search: search || undefined,
      providerType: (providerType as 'dentist' | 'hygienist' | 'specialist' | 'other') || undefined,
      status: (status as 'active' | 'inactive') || undefined,
      locationId: locationId || undefined,
      page: safePage,
      limit: safeLimit,
      viewMode: viewMode as 'grid' | 'list',
    };
  }, [searchParams]);

  // Fetch providers with current filters
  const { providers, pagination, isLoading, isError, error, refetch } = useProviders({
    initialFilters: {
      search: filters.search,
      providerType: filters.providerType,
      status: filters.status,
      locationId: filters.locationId,
      page: filters.page,
      limit: filters.limit,
    },
  });

  // Fetch filter options
  const { data: filterOptions } = useProviderFilters();

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (mode: 'grid' | 'list') => {
      const params = new URLSearchParams(searchParams);
      params.set('viewMode', mode);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle provider actions
  const handleProviderEdit = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/providers/${provider.id}/edit`);
    },
    [router]
  );

  const handleProviderView = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/providers/${provider.id}`);
    },
    [router]
  );

  const handleProviderClick = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/providers/${provider.id}`);
    },
    [router]
  );

  const handleCreateProvider = useCallback(() => {
    router.push('/providers/create');
  }, [router]);

  // Convert pagination data
  const paginationInfo: PaginationInfo | undefined = pagination
    ? {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPreviousPage: pagination.page > 1,
      }
    : undefined;

  // Check if user can create providers
  const canCreateProvider =
    permissions.user &&
    (permissions.isSystemAdmin() ||
      permissions
        .getAccessibleClinics()
        .some((clinicId) => permissions.canCreateProvider(clinicId)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-600 mt-1">Manage dental providers and their assignments</p>
        </div>

        {canCreateProvider && (
          <Button onClick={handleCreateProvider}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        )}
      </div>

      {/* Filters */}
      <ProviderFilters
        locations={filterOptions?.locations || []}
        showLocationFilter={true}
        className="bg-white p-6 rounded-lg border"
      />

      {/* Provider Grid */}
      <ProviderGrid
        providers={providers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        pagination={paginationInfo}
        viewMode={filters.viewMode}
        onViewModeChange={handleViewModeChange}
        onPageChange={handlePageChange}
        onProviderEdit={permissions.user ? handleProviderEdit : undefined}
        onProviderView={handleProviderView}
        onProviderClick={handleProviderClick}
        emptyMessage="No providers found"
        emptyDescription="Try adjusting your search criteria or add a new provider to get started."
      />
    </div>
  );
}

/**
 * Main providers page component
 */
export default function ProvidersPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <PermissionsProvider>
        <ProvidersPageClient />
      </PermissionsProvider>
    </div>
  );
}
