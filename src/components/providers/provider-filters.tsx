'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * Debounce hook for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for managing URL search parameters
 */
function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Use replace to avoid adding to browser history for filter changes
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const getParam = useCallback(
    (key: string, defaultValue = '') => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  return { updateUrl, getParam };
}

/**
 * Provider type options
 */
const PROVIDER_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'hygienist', label: 'Hygienist' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'other', label: 'Other' },
];

/**
 * Provider status options
 */
const PROVIDER_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

/**
 * Props for ProviderFilters component
 */
export interface ProviderFiltersProps {
  /** Available locations for filtering */
  locations?: Array<{ id: string; name: string }>;
  /** Show location filter */
  showLocationFilter?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when filters change (for non-URL mode) */
  onFiltersChange?: (filters: {
    search: string;
    providerType: string;
    status: string;
    locationId: string;
  }) => void;
}

/**
 * Individual filter count badge
 */
function FilterCount({ count, onClear }: { count: number; onClear: () => void }) {
  if (count === 0) {
    return null;
  }

  return (
    <Badge variant="secondary" className="ml-2">
      {count}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
        aria-label="Clear filter"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

/**
 * Active filters display
 */
function ActiveFilters({
  search,
  providerType,
  status,
  locationId,
  locations,
  onClearAll,
  onClearFilter,
}: {
  search: string;
  providerType: string;
  status: string;
  locationId: string;
  locations?: Array<{ id: string; name: string }>;
  onClearAll: () => void;
  onClearFilter: (key: string) => void;
}) {
  const activeFilters: Array<{
    key: string;
    label: string;
    value: string;
  }> = [];

  if (search) {
    activeFilters.push({
      key: 'search',
      label: `Search: "${search}"`,
      value: search,
    });
  }

  if (providerType && providerType !== 'all') {
    const typeLabel = PROVIDER_TYPES.find((t) => t.value === providerType)?.label;
    activeFilters.push({
      key: 'providerType',
      label: `Type: ${typeLabel}`,
      value: providerType,
    });
  }

  if (status && status !== 'all') {
    const statusLabel = PROVIDER_STATUSES.find((s) => s.value === status)?.label;
    activeFilters.push({
      key: 'status',
      label: `Status: ${statusLabel}`,
      value: status,
    });
  }

  if (locationId && locationId !== 'all' && locations) {
    const locationLabel = locations.find((l) => l.id === locationId)?.name;
    activeFilters.push({
      key: 'locationId',
      label: `Location: ${locationLabel}`,
      value: locationId,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant="outline" className="gap-1">
          {filter.label}
          <button
            type="button"
            onClick={() => onClearFilter(filter.key)}
            className="hover:bg-gray-200 rounded-full p-0.5"
            aria-label={`Clear ${filter.key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-gray-500 hover:text-gray-700"
      >
        Clear all
      </Button>
    </div>
  );
}

/**
 * Main ProviderFilters component
 */
export function ProviderFilters({
  locations = [],
  showLocationFilter = true,
  className = '',
  onFiltersChange,
}: ProviderFiltersProps) {
  const { updateUrl, getParam } = useUrlFilters();

  // Local state for immediate UI updates
  const [localSearch, setLocalSearch] = useState(() => getParam('search'));
  const [providerType, setProviderType] = useState(() => getParam('providerType') || 'all');
  const [status, setStatus] = useState(() => getParam('status') || 'all');
  const [locationId, setLocationId] = useState(() => getParam('locationId') || 'all');

  // Debounced search value
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync URL params with local state on mount and URL changes
  useEffect(() => {
    setLocalSearch(getParam('search'));
    setProviderType(getParam('providerType') || 'all');
    setStatus(getParam('status') || 'all');
    setLocationId(getParam('locationId') || 'all');
  }, [getParam]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== getParam('search')) {
      updateUrl({ search: debouncedSearch || null, page: null });
    }
  }, [debouncedSearch, updateUrl, getParam]);

  // Notify parent component of filter changes (for non-URL mode)
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        search: debouncedSearch,
        providerType: providerType === 'all' ? '' : providerType,
        status: status === 'all' ? '' : status,
        locationId: locationId === 'all' ? '' : locationId,
      });
    }
  }, [debouncedSearch, providerType, status, locationId, onFiltersChange]);

  // Handle individual filter changes
  const handleProviderTypeChange = useCallback(
    (value: string) => {
      setProviderType(value);
      // Convert 'all' to null for URL params (means no filter)
      updateUrl({ providerType: value === 'all' ? null : value, page: null });
    },
    [updateUrl]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value);
      // Convert 'all' to null for URL params (means no filter)
      updateUrl({ status: value === 'all' ? null : value, page: null });
    },
    [updateUrl]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocationId(value);
      // Convert 'all' to null for URL params (means no filter)
      updateUrl({ locationId: value === 'all' ? null : value, page: null });
    },
    [updateUrl]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setLocalSearch('');
    setProviderType('all');
    setStatus('all');
    setLocationId('all');
    updateUrl({
      search: null,
      providerType: null,
      status: null,
      locationId: null,
      page: null,
    });
  }, [updateUrl]);

  // Clear individual filter
  const handleClearFilter = useCallback(
    (key: string) => {
      switch (key) {
        case 'search': {
          setLocalSearch('');
          updateUrl({ search: null, page: null });
          break;
        }
        case 'providerType': {
          setProviderType('all');
          updateUrl({ providerType: null, page: null });
          break;
        }
        case 'status': {
          setStatus('all');
          updateUrl({ status: null, page: null });
          break;
        }
        case 'locationId': {
          setLocationId('all');
          updateUrl({ locationId: null, page: null });
          break;
        }
        default: {
          // Handle unknown filter keys silently
          break;
        }
      }
    },
    [updateUrl]
  );

  // Count active filters (exclude 'all' values which mean no filter)
  const activeFilterCount = [
    localSearch,
    providerType !== 'all' ? providerType : '',
    status !== 'all' ? status : '',
    locationId !== 'all' ? locationId : '',
  ].filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search providers..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Provider Type Filter */}
        <Select value={providerType} onValueChange={handleProviderTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Provider Type" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        {showLocationFilter && locations.length > 0 && (
          <Select value={locationId} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Filter Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`
              : 'No filters applied'}
          </span>
          <FilterCount count={activeFilterCount} onClear={handleClearAll} />
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <ActiveFilters
        search={localSearch}
        providerType={providerType}
        status={status}
        locationId={locationId}
        locations={locations}
        onClearAll={handleClearAll}
        onClearFilter={handleClearFilter}
      />
    </div>
  );
}

export default ProviderFilters;
