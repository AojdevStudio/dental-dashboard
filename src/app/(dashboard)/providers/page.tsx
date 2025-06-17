import { ProviderFilters } from '@/components/providers/provider-filters';
import { ProviderGrid } from '@/components/providers/provider-grid';
import {
  getProviderLocationSummary,
  getProvidersWithLocationsPaginated,
} from '@/lib/database/queries/providers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Safely parse integer from string with fallback to default value
 */
function safeParseInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Providers Page - Server Component Implementation
 *
 * Server-side rendered page that displays all providers with proper API data
 * Implements multi-tenant security and concurrent data fetching for performance
 */
export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the searchParams for Next.js 15 compatibility
  const resolvedSearchParams = await searchParams;
  // 1. Authentication & Session Validation
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Extract clinicId from user session for multi-tenant security
  const clinicId = user.user_metadata?.clinicId || user.app_metadata?.clinicId;

  if (!clinicId) {
    redirect('/login?error=no_clinic_associated');
  }

  // 2. Parse and Validate Search Parameters
  const page = Math.max(
    1,
    safeParseInt(
      Array.isArray(resolvedSearchParams.page)
        ? resolvedSearchParams.page[0]
        : resolvedSearchParams.page,
      1
    )
  );
  const limit = Math.max(
    1,
    Math.min(
      1000,
      safeParseInt(
        Array.isArray(resolvedSearchParams.limit)
          ? resolvedSearchParams.limit[0]
          : resolvedSearchParams.limit,
        12
      )
    )
  );

  // Extract string parameters with array handling
  const search = Array.isArray(resolvedSearchParams.search)
    ? resolvedSearchParams.search[0]
    : resolvedSearchParams.search;
  const providerType = Array.isArray(resolvedSearchParams.providerType)
    ? resolvedSearchParams.providerType[0]
    : resolvedSearchParams.providerType;
  const locationId = Array.isArray(resolvedSearchParams.locationId)
    ? resolvedSearchParams.locationId[0]
    : resolvedSearchParams.locationId;
  const status = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams.status;

  // Validate enum-like parameters
  const allowedStatuses = ['active', 'inactive'];
  const validStatus = status && allowedStatuses.includes(status) ? status : undefined;

  const allowedProviderTypes = ['dentist', 'hygienist', 'specialist', 'other'];
  const validProviderType =
    providerType && allowedProviderTypes.includes(providerType) ? providerType : undefined;

  // 3. Concurrent Data Fetching for Performance
  const [providersResult, locations] = await Promise.all([
    getProvidersWithLocationsPaginated({
      clinicId,
      page,
      limit,
      search,
      providerType: validProviderType,
      locationId,
      status: validStatus,
    }),
    getProviderLocationSummary(clinicId),
  ]);

  // 4. Render Components with Fetched Data
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

        {/* Provider Grid */}
        <ProviderGrid
          providers={providersResult.providers}
          pagination={{
            page,
            limit,
            total: providersResult.total,
            totalPages: Math.ceil(providersResult.total / limit),
            hasNextPage: page < Math.ceil(providersResult.total / limit),
            hasPreviousPage: page > 1,
          }}
          emptyMessage="No providers found"
          emptyDescription="Try adjusting your search criteria or add a new provider to get started."
        />
      </div>
    </div>
  );
}
