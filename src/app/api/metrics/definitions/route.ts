/**
 * Metric Definitions API Route
 * Get available metric definitions
 */

import { withAuth } from '@/lib/api/middleware';
import {
  ApiError as ApiErrorClass,
  type ApiErrorPayload,
  type ApiSuccessPayload,
  apiError,
  apiSuccess,
} from '@/lib/api/utils';
import * as metricQueries from '@/lib/database/queries/metrics';
import type { NextRequest, NextResponse } from 'next/server';

export type GetMetricDefinitionsResponse = Awaited<
  ReturnType<typeof metricQueries.getMetricDefinitions>
>;

/**
 * GET /api/metrics/definitions
 * Get all metric definitions
 */
export const GET = withAuth<GetMetricDefinitionsResponse>(
  async (
    request: Request,
    { authContext }
  ): Promise<NextResponse<ApiSuccessPayload<GetMetricDefinitionsResponse> | ApiErrorPayload>> => {
    const searchParams = (request as unknown as NextRequest).nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const dataType = searchParams.get('dataType') || undefined;
    const isComposite = searchParams.get('isComposite');

    try {
      const definitions = await metricQueries.getMetricDefinitions(authContext, {
        category,
        dataType,
        isComposite: isComposite === null ? undefined : isComposite === 'true',
      });

      return apiSuccess(definitions);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return apiError(error.message, 403);
      }
      throw error;
    }
  }
);
