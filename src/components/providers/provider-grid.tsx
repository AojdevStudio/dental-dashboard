'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProviderWithLocations } from '@/types/providers';
import { AlertTriangle, Grid3X3, List, RefreshCw, Users } from 'lucide-react';
import { CompactProviderCard, DetailedProviderCard } from './provider-card';

/**
 * Pagination information interface
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Props for the ProviderGrid component
 */
export interface ProviderGridProps {
  providers?: ProviderWithLocations[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  pagination?: PaginationInfo;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onPageChange?: (page: number) => void;
  onProviderEdit?: (provider: ProviderWithLocations) => void;
  onProviderView?: (provider: ProviderWithLocations) => void;
  onProviderClick?: (provider: ProviderWithLocations) => void;
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

/**
 * Skeleton loader for provider cards
 */
function ProviderCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState({
  viewMode = 'grid',
  count = 6,
}: {
  viewMode?: 'grid' | 'list';
  count?: number;
}) {
  const gridClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      : 'space-y-4';

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <ProviderCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({
  error,
  onRetry,
}: {
  error?: Error | null;
  onRetry?: () => void;
}) {
  return (
    <Alert className="max-w-md mx-auto">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium">Failed to load providers</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'An unexpected error occurred while loading provider data.'}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Empty state component
 */
function EmptyState({
  message = 'No providers found',
  description = 'Try adjusting your search criteria or filters to find providers.',
}: {
  message?: string;
  description?: string;
}) {
  return (
    <div className="text-center py-12 max-w-md mx-auto">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

/**
 * View mode toggle buttons
 */
function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}) {
  if (!onViewModeChange) return null;

  return (
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="px-3"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="px-3"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}

/**
 * Pagination component
 */
function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange?: (page: number) => void;
}) {
  if (!onPageChange) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
        providers
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            const page = i + 1;
            const isCurrentPage = page === pagination.page;

            return (
              <Button
                key={page}
                variant={isCurrentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            );
          })}

          {pagination.totalPages > 5 && (
            <>
              <span className="text-gray-500">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.totalPages)}
                className="w-8 h-8 p-0"
              >
                {pagination.totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/**
 * Main ProviderGrid component
 */
export function ProviderGrid({
  providers = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  pagination,
  viewMode = 'grid',
  onViewModeChange,
  onPageChange,
  onProviderEdit,
  onProviderView,
  onProviderClick,
  className = '',
  emptyMessage,
  emptyDescription,
}: ProviderGridProps) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
        <LoadingState viewMode={viewMode} />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Error loading providers</div>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  // Handle empty state
  if (!providers.length) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">No providers found</div>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
        <EmptyState message={emptyMessage} description={emptyDescription} />
      </div>
    );
  }

  // Grid classes based on view mode
  const gridClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      : 'space-y-4';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with count and view toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {providers.length} provider{providers.length !== 1 ? 's' : ''}
          {pagination && ` of ${pagination.total}`}
        </div>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>

      {/* Provider grid/list */}
      <div className={gridClasses}>
        {providers.map((provider) => {
          const CardComponent = viewMode === 'list' ? CompactProviderCard : DetailedProviderCard;

          return (
            <CardComponent
              key={provider.id}
              provider={provider}
              onEdit={onProviderEdit}
              onViewDetails={onProviderView}
              onClick={onProviderClick ? () => onProviderClick(provider) : undefined}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
    </div>
  );
}

export default ProviderGrid;
