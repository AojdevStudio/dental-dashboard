/**
 * Metric Definitions API Route
 * Get available metric definitions
 */

import { withAuth } from "@/lib/api/middleware";
import { ApiResponse } from "@/lib/api/utils";
import * as metricQueries from "@/lib/database/queries/metrics";

export type GetMetricDefinitionsResponse = Awaited<
  ReturnType<typeof metricQueries.getMetricDefinitions>
>;

/**
 * GET /api/metrics/definitions
 * Get all metric definitions
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || undefined;
  const dataType = searchParams.get("dataType") || undefined;
  const isComposite = searchParams.get("isComposite");

  const definitions = await metricQueries.getMetricDefinitions(authContext, {
    category,
    dataType,
    isComposite: isComposite === null ? undefined : isComposite === "true",
  });

  return ApiResponse.success(definitions);
});
