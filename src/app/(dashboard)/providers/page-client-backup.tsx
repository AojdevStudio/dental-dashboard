'use client';
import { PermissionsProvider } from '@/components/providers/permissions-provider';
import { ProviderFilters } from '@/components/providers/provider-filters';
import { ProviderGrid } from '@/components/providers/provider-grid';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { useProviders } from '@/hooks/use-providers';
import type {
  ProviderStatusValue,
  ProviderTypeValue,
  ProviderWithLocations,
} from '@/types/providers';
import { PROVIDER_STATUSES, PROVIDER_TYPES } from '@/types/providers';
import { Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function ProvidersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL parameters with NaN validation
  const getUrlParams = useCallback(() => {
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
    const providerTypeParam = searchParams.get('providerType');
    const statusParam = searchParams.get('status');
    return {
      page: Number.isNaN(page) ? 1 : Math.max(1, page),
      limit: Number.isNaN(limit) ? 12 : Math.min(Math.max(1, limit), 50), // cap to a sensible upper bound
      search: searchParams.get('search') || undefined,
      providerType:
        providerTypeParam && PROVIDER_TYPES.includes(providerTypeParam as ProviderTypeValue)
          ? (providerTypeParam as ProviderTypeValue)
          : undefined,
      status:
        statusParam && PROVIDER_STATUSES.includes(statusParam as ProviderStatusValue)
          ? (statusParam as ProviderStatusValue)
          : undefined,
      locationId: searchParams.get('locationId') || undefined,
      viewMode: (searchParams.get('viewMode') as 'grid' | 'list') || 'grid',
    };
  }, [searchParams]);

  const urlParams = getUrlParams();
  const { providers, pagination, isLoading, isError, error, refetch } = useProviders({
    initialFilters: urlParams,
  });

  // Update URL without page reload
  const updateUrl = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          newSearchParams.set(key, String(value));
        } else {
          newSearchParams.delete(key);
        }
      }
      router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Event handlers
  const handleProviderClick = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/providers/${provider.id}`);
    },
    [router]
  );

  const handleProviderEdit = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/providers/${provider.id}/edit`);
    },
    [router]
  );

  const handleViewModeChange = useCallback(
    (viewMode: 'grid' | 'list') => {
      updateUrl({ viewMode });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
    },
    [updateUrl]
  );

  const handleAddProvider = useCallback(() => {
    router.push('/providers/create');
  }, [router]);

  return (
    <PermissionsProvider>
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
              <p className="text-muted-foreground">Manage dental providers and their assignments</p>
            </div>
            <AddProviderButton onAdd={handleAddProvider} />
          </div>

          <ProviderFilters
            locations={[]}
            showLocationFilter={true}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          />

          <ProviderGrid
            providers={providers}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            pagination={
              pagination
                ? {
                    ...pagination,
                    hasNextPage: pagination.page < pagination.totalPages,
                    hasPreviousPage: pagination.page > 1,
                  }
                : undefined
            }
            viewMode={urlParams.viewMode}
            onViewModeChange={handleViewModeChange}
            onPageChange={handlePageChange}
            onProviderEdit={handleProviderEdit}
            onProviderClick={handleProviderClick}
            emptyMessage="No providers found"
            emptyDescription="Try adjusting your search criteria or add a new provider to get started."
          />
        </div>
      </div>
    </PermissionsProvider>
  );
}

function AddProviderButton({ onAdd }: { onAdd: () => void }) {
  const permissions = usePermissions();
  const accessibleClinics = permissions.getAccessibleClinics();

  // Check if user can create providers in any of their accessible clinics
  const canCreate = accessibleClinics.some((clinicId) => permissions.canCreateProvider(clinicId));

  if (!canCreate) {
    return null;
  }

  return (
    <Button onClick={onAdd}>
      <Plus className="mr-2 h-4 w-4" />
      Add Provider
    </Button>
  );
}
