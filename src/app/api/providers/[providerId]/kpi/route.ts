import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { getProviderKPIDashboard } from '@/lib/database/queries/provider-metrics';
import { z } from 'zod';

/**
 * Validation schema for KPI query parameters
 */
const kpiQuerySchema = z.object({
  period: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .optional()
    .default('monthly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  locationId: z.string().optional(),
  includeComparisons: z.boolean().optional().default(true),
  includeTrends: z.boolean().optional().default(true),
  compareToProvider: z.string().optional(),
});

/**
 * Calculate date range based on period type
 */
function calculateDateRange(
  period: string,
  startDate?: string,
  endDate?: string
): { startDate: Date; endDate: Date } {
  if (startDate && endDate) {
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
  }

  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'daily':
      start.setDate(end.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(end.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarterly':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'yearly':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1); // Default to monthly
  }

  return { startDate: start, endDate: end };
}

const getProviderKPIHandler: ApiHandler = async (
  request: Request,
  {
    params,
    authContext,
  }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const resolvedParams = await params;
    const providerId = resolvedParams.providerId as string;

    if (!providerId) {
      return apiError('Provider ID is required', 400);
    }

    // Parse query parameters
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());

    // Convert query parameters with proper typing
    const queryParams: Record<string, string | boolean> = {
      ...rawParams,
    };

    // Convert string booleans to actual booleans
    if (rawParams.includeComparisons) {
      queryParams.includeComparisons = rawParams.includeComparisons === 'true';
    }
    if (rawParams.includeTrends) {
      queryParams.includeTrends = rawParams.includeTrends === 'true';
    }

    const validatedParams = kpiQuerySchema.parse(queryParams);

    // Calculate date range
    const { startDate, endDate } = calculateDateRange(
      validatedParams.period,
      validatedParams.startDate,
      validatedParams.endDate
    );

    // Determine clinic ID based on auth context
    const clinicId = authContext.isSystemAdmin
      ? authContext.clinicIds[0] || '' // System admin may need to specify clinic
      : authContext.clinicIds[0] || '';

    if (!clinicId) {
      return apiError('Clinic context is required', 400);
    }

    // Build calculation parameters
    const calculationParams = {
      providerId,
      clinicId,
      startDate,
      endDate,
      locationId: validatedParams.locationId,
      calculationOptions: {
        includeTrends: validatedParams.includeTrends,
        includeComparisons: validatedParams.includeComparisons,
        includeBenchmarks: true,
        trendPeriods: 12, // Default to 12 periods for trend analysis
      },
    };

    // Get KPI dashboard data
    const result = await getProviderKPIDashboard(calculationParams);

    if (!result.success) {
      return apiError(
        result.error?.message || 'Failed to calculate provider KPIs',
        result.error?.type === 'PROVIDER_NOT_FOUND' ? 404 : 500
      );
    }

    // Add performance information to response
    const response = {
      ...result.data,
      performanceInfo: {
        queryTime: result.performance?.calculationTime || 0,
        dataFreshness: new Date(),
        cacheHit: result.performance?.cacheUsed ?? false,
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('Error fetching provider KPI data:', error);
    return handleApiError(error);
  }
};

/**
 * GET /api/providers/[providerId]/kpi
 *
 * Fetch comprehensive provider KPI dashboard data including:
 * - Financial KPIs (production totals, collection rates, overhead percentages)
 * - Performance KPIs (goal achievement, variance analysis, trend calculations)
 * - Patient KPIs (patient count, appointment efficiency, case acceptance rates)
 * - Comparative KPIs (provider ranking, clinic averages, benchmark comparisons)
 *
 * Query Parameters:
 * - period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' (default: 'monthly')
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - locationId: string (optional - filter by specific location)
 * - includeComparisons: boolean (default: true)
 * - includeTrends: boolean (default: true)
 * - compareToProvider: string (optional - compare to specific provider)
 *
 * Implements Story 1.1 AC2: KPI Metrics Dashboard
 */
export const GET = withAuth(getProviderKPIHandler);
