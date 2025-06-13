import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { getProviderPerformanceMetrics } from '@/lib/database/queries/providers';
import type { ProviderPerformanceResponse } from '@/types/providers';
import type { NextResponse } from 'next/server';
import { z } from 'zod';

// Query parameter validation schema
const performanceQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  locationId: z.string().uuid().optional(),
  includeGoals: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const getProviderPerformanceHandler: ApiHandler = async (
  request: Request,
  {
    params,
    authContext,
  }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const resolvedParams = await params;
    const providerId = resolvedParams.providerId as string;

    // Validate provider ID format
    if (!providerId || typeof providerId !== 'string') {
      return apiError('Provider ID is required', 400);
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse and validate query parameters
    const queryParams = performanceQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    // Convert string dates to Date objects if provided
    const startDate = queryParams.startDate ? new Date(queryParams.startDate) : undefined;
    const endDate = queryParams.endDate ? new Date(queryParams.endDate) : undefined;

    // Validate date range if both dates provided
    if (startDate && endDate && startDate > endDate) {
      return apiError('Start date must be before end date', 400);
    }

    // Apply multi-tenant filtering - providers can only see data from their clinic
    const clinicId =
      authContext.clinicIds && authContext.clinicIds.length > 0
        ? authContext.clinicIds[0]
        : undefined;

    if (!clinicId) {
      return apiError('No clinic access available', 403);
    }

    // Fetch provider performance metrics
    const performanceData = await getProviderPerformanceMetrics({
      providerId,
      period: queryParams.period,
      startDate,
      endDate,
      locationId: queryParams.locationId,
      includeGoals: queryParams.includeGoals ?? true,
      clinicId,
    });

    if (!performanceData) {
      return apiError('Provider not found or access denied', 404);
    }

    // Format response to match ProviderPerformanceResponse interface
    const response: ProviderPerformanceResponse['data'] = {
      provider: {
        id: performanceData.provider.id,
        name: performanceData.provider.name,
        providerType: performanceData.provider.providerType as
          | 'dentist'
          | 'hygienist'
          | 'specialist'
          | 'other',
        primaryLocation: performanceData.provider.primaryLocation
          ? {
              id: performanceData.provider.primaryLocation.id,
              name: performanceData.provider.primaryLocation.name,
              address: performanceData.provider.primaryLocation.address,
            }
          : undefined,
      },
      period: {
        startDate: performanceData.period.startDate.toISOString(),
        endDate: performanceData.period.endDate.toISOString(),
        period: performanceData.period.period,
      },
      production: {
        total: performanceData.production.total,
        average: performanceData.production.average,
        goal: performanceData.production.goal,
        variance: performanceData.production.variance,
        variancePercentage: performanceData.production.variancePercentage,
        byLocation: performanceData.production.byLocation,
      },
      goals: performanceData.goals
        ? {
            total: performanceData.goals.total,
            achieved: performanceData.goals.achieved,
            achievementRate: performanceData.goals.achievementRate,
            details: performanceData.goals.details,
          }
        : undefined,
      trends: performanceData.trends,
    };

    return apiSuccess(response) as NextResponse;
  } catch (error) {
    return handleApiError(error);
  }
};

export const GET = withAuth(getProviderPerformanceHandler);
