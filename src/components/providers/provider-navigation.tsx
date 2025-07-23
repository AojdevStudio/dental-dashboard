'use client';

import { ProviderGrid } from '@/components/providers/provider-grid';
import type { ProviderWithLocations } from '@/types/providers';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface ProviderNavigationProps {
  providers: ProviderWithLocations[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  emptyMessage?: string;
  emptyDescription?: string;
  showAdvancedMetrics?: boolean;
}

/**
 * Client-side wrapper for provider navigation
 *
 * Handles navigation to provider detail pages while maintaining
 * the server component architecture for the main providers page
 */
export function ProviderNavigation({
  providers,
  pagination,
  emptyMessage,
  emptyDescription,
  showAdvancedMetrics = true,
}: ProviderNavigationProps) {
  const router = useRouter();

  // Navigation handlers
  const handleProviderView = useCallback(
    (provider: ProviderWithLocations) => {
      router.push(`/dashboard/providers/${provider.id}`);
    },
    [router]
  );

  const handleProviderEdit = useCallback(
    (provider: ProviderWithLocations) => {
      // TODO: Implement edit functionality in future phases
      router.push(`/dashboard/providers/${provider.id}/edit`);
    },
    [router]
  );

  const handleProviderClick = useCallback(
    (provider: ProviderWithLocations) => {
      // Default click behavior is to view details
      router.push(`/dashboard/providers/${provider.id}`);
    },
    [router]
  );

  const _handleManageLocations = useCallback(
    (provider: ProviderWithLocations) => {
      // TODO: Implement location management in future phases
      router.push(`/dashboard/providers/${provider.id}/locations`);
    },
    [router]
  );

  return (
    <ProviderGrid
      providers={providers}
      pagination={pagination}
      onProviderView={handleProviderView}
      onProviderEdit={handleProviderEdit}
      onProviderClick={handleProviderClick}
      showAdvancedMetrics={showAdvancedMetrics}
      emptyMessage={emptyMessage}
      emptyDescription={emptyDescription}
    />
  );
}

export default ProviderNavigation;
