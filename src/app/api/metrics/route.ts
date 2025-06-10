/**
 * Metrics API Route
 * Multi-tenant aware metrics endpoints
 */

import { cachedJson } from "@/lib/api/cache-headers";
import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getDateRangeParams, getPaginationParams } from "@/lib/api/utils";
import * as metricQueries from "@/lib/database/queries/metrics";
import { z } from "zod";

// Request schemas
const createMetricSchema = z.object({
  metricDefinitionId: z.string().cuid(),
  date: z.string().datetime(),
  value: z.string(),
  clinicId: z.string().cuid(),
  providerId: z.string().cuid().optional(),
  sourceType: z.enum(["manual", "spreadsheet", "form"]),
  sourceSheet: z.string().optional(),
  externalId: z.string().optional(),
});

const aggregationSchema = z.object({
  clinicId: z.string().cuid(),
  metricDefinitionId: z.string().cuid().optional(),
  providerId: z.string().cuid().optional(),
  aggregationType: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
});

export type GetMetricsResponse = Awaited<ReturnType<typeof metricQueries.getMetrics>>;
export type GetMetricDefinitionsResponse = Awaited<
  ReturnType<typeof metricQueries.getMetricDefinitions>
>;
export type CreateMetricResponse = Awaited<ReturnType<typeof metricQueries.createMetric>>;

/**
 * GET /api/metrics
 * Get metrics with filtering
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinicId") || undefined;
  const providerId = searchParams.get("providerId") || undefined;
  const metricDefinitionId = searchParams.get("metricDefinitionId") || undefined;
  const sourceType = searchParams.get("sourceType") || undefined;
  const { limit, offset } = getPaginationParams(request);
  const dateRange = getDateRangeParams(request);

  const result = await metricQueries.getMetrics(
    authContext,
    {
      clinicId,
      providerId,
      metricDefinitionId,
      sourceType,
      dateRange:
        dateRange.startDate && dateRange.endDate
          ? {
              start: dateRange.startDate,
              end: dateRange.endDate,
            }
          : undefined,
    },
    {
      limit,
      offset,
      orderBy: (searchParams.get("orderBy") as "date" | "value" | "createdAt") || "date",
      orderDir: (searchParams.get("orderDir") as "asc" | "desc") || "desc",
    }
  );

  // Metrics data is frequently updated, use shorter cache time
  return cachedJson(
    {
      metrics: result.metrics,
      pagination: {
        total: result.total,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    },
    "DYNAMIC"
  );
});

/**
 * POST /api/metrics
 * Create a new metric value
 */
export const POST = withAuth(async (request, { authContext }) => {
  // Parse and validate request body
  let body: z.infer<typeof createMetricSchema>;
  try {
    const rawBody = await request.json();
    body = createMetricSchema.parse(rawBody);
  } catch (error) {
    return ApiError.badRequest("Invalid request body");
  }

  // Convert date string to Date object
  const metricData = {
    ...body,
    date: new Date(body.date),
  };

  try {
    const metric = await metricQueries.createMetric(authContext, metricData);
    return ApiResponse.created(metric);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Access denied")) {
        return ApiError.forbidden(error.message);
      }
      if (error.message.includes("Insufficient permissions")) {
        return ApiError.forbidden(error.message);
      }
      if (error.message.includes("Invalid metric definition")) {
        return ApiError.badRequest(error.message);
      }
    }
    throw error;
  }
});
