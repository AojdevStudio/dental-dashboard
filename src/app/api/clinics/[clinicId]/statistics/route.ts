/**
 * Clinic Statistics API Route
 * Get aggregated statistics for a clinic
 */

import { withAuth } from '@/lib/api/middleware';
import {
  ApiError as ApiErrorClass,
  apiError,
  apiSuccess,
  getDateRangeParams,
} from '@/lib/api/utils';
import * as clinicQueries from '@/lib/database/queries/clinics';
import type { NextRequest } from 'next/server'; // Import NextRequest

export type GetClinicStatisticsResponse = Awaited<
  ReturnType<typeof clinicQueries.getClinicStatistics>
>;

/**
 * GET /api/clinics/:clinicId/statistics
 * Get clinic statistics with optional date range
 */
export const GET = withAuth<GetClinicStatisticsResponse>(
  async (request: Request, { authContext, params }) => {
    const resolvedParams = await params;
    const clinicIdParam = resolvedParams?.clinicId;
    let clinicId: string;

    if (Array.isArray(clinicIdParam)) {
      if (clinicIdParam.length === 0 || !clinicIdParam[0]) {
        return apiError('Clinic ID is missing or invalid in route parameters', 400);
      }
      clinicId = clinicIdParam[0];
    } else if (typeof clinicIdParam === 'string' && clinicIdParam) {
      clinicId = clinicIdParam;
    } else {
      return apiError('Clinic ID is missing or invalid in route parameters', 400);
    }

    const dateRange = getDateRangeParams((request as NextRequest).nextUrl.searchParams);
    const startDate = dateRange?.startDate;
    const endDate = dateRange?.endDate;

    try {
      const statistics = await clinicQueries.getClinicStatistics(authContext, clinicId, {
        startDate,
        endDate,
      });

      return apiSuccess(statistics);
    } catch (error) {
      if (error instanceof ApiErrorClass && error.statusCode === 403) {
        // More specific check if ApiErrorClass is thrown by validateClinicAccess
        return apiError(error.message, 403, error.code);
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return apiError(error.message, 403, 'ACCESS_DENIED');
      }
      throw error;
    }
  }
);
