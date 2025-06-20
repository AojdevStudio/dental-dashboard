import { ProviderFilters } from '@/components/providers/provider-filters';
import { ProviderGrid } from '@/components/providers/provider-grid';
import { prisma } from '@/lib/database/prisma';
import {
  getProviderLocationSummary,
  getProvidersWithLocationsPaginated,
} from '@/lib/database/queries/providers';
import { createClient } from '@/lib/supabase/server';
import type { ProviderWithLocations } from '@/types/providers';
import { redirect } from 'next/navigation';

/**
 * Maximum allowed page number to prevent performance issues
 */
const MAX_PAGE = 1000;

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
 * Type-safe search parameter extraction helper
 */
function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
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

  // Get user details from database to check role and clinic association
  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      clinicId: true,
    },
  });

  if (!dbUser) {
    redirect('/login?error=user_not_found');
  }

  // Check if user is system admin
  const isSystemAdmin = dbUser.role === 'system_admin';
  const clinicId = dbUser.clinicId || undefined;

  // Only require clinic association for non-system admins
  if (!(clinicId || isSystemAdmin)) {
    redirect('/login?error=no_clinic_associated');
  }

  // 2. Parse and Validate Search Parameters
  const page = Math.max(
    1,
    Math.min(MAX_PAGE, safeParseInt(getSearchParam(resolvedSearchParams, 'page'), 1))
  );
  const limit = Math.max(
    1,
    Math.min(1000, safeParseInt(getSearchParam(resolvedSearchParams, 'limit'), 12))
  );

  // Extract string parameters with type-safe handling
  const search = getSearchParam(resolvedSearchParams, 'search');
  const providerType = getSearchParam(resolvedSearchParams, 'providerType');
  const locationId = getSearchParam(resolvedSearchParams, 'locationId');
  const status = getSearchParam(resolvedSearchParams, 'status');

  // Validate enum-like parameters
  const allowedStatuses = ['active', 'inactive'];
  const validStatus = status && allowedStatuses.includes(status) ? status : undefined;

  const allowedProviderTypes = ['dentist', 'hygienist', 'specialist', 'other'];
  const validProviderType =
    providerType && allowedProviderTypes.includes(providerType) ? providerType : undefined;

  // 3. Concurrent Data Fetching for Performance
  let providersResult: { providers: ProviderWithLocations[]; total: number };
  let locations: Awaited<ReturnType<typeof getProviderLocationSummary>>;

  try {
    [providersResult, locations] = await Promise.all([
      getProvidersWithLocationsPaginated({
        clinicId: isSystemAdmin ? undefined : clinicId,
        page,
        limit,
        search,
        providerType: validProviderType,
        locationId,
        status: validStatus,
      }),
      getProviderLocationSummary(isSystemAdmin ? undefined : clinicId),
    ]);
  } catch (error) {
    console.error('Error fetching providers data:', error);
    // Fallback to empty data to prevent complete page failure
    providersResult = {
      providers: [],
      total: 0,
    };
    locations = [];
  }

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
