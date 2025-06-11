/**
 * Metric Definitions API Route
 * Get available metric definitions
 */

import { withAuth } from "@/lib/api/middleware";
import {
  apiSuccess,
  apiError,
  ApiError as ApiErrorClass,
  type ApiSuccessPayload,
  type ApiErrorPayload,
} from "@/lib/api/utils";
import * as metricQueries from "@/lib/database/queries/metrics";
import type { NextRequest, NextResponse } from "next/server";

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
    const category = searchParams.get("category") || undefined;
    const dataType = searchParams.get("dataType") || undefined;
    const isComposite = searchParams.get("isComposite");

    const definitions = await metricQueries.getMetricDefinitions(authContext, {
      category,
      dataType,
      isComposite: isComposite === null ? undefined : isComposite === "true",
    });

    return apiSuccess(definitions);
  }
);
