/**
 * Aggregated Metrics API Route
 * Get aggregated metrics for dashboards and reports
 */

import { withAuth } from '@/lib/api/middleware'
import { ApiResponse, ApiError, getDateRangeParams } from '@/lib/api/utils'
import * as metricQueries from '@/lib/database/queries/metrics'
import { z } from 'zod'

const aggregationParamsSchema = z.object({
  clinicId: z.string().cuid(),
  metricDefinitionId: z.string().cuid().optional(),
  providerId: z.string().cuid().optional(),
  aggregationType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
})

export type GetAggregatedMetricsResponse = Awaited<ReturnType<typeof metricQueries.getAggregatedMetrics>>

/**
 * GET /api/metrics/aggregated
 * Get aggregated metrics with various groupings
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams
  const dateRange = getDateRangeParams(request)

  // Validate required parameters
  if (!dateRange.startDate || !dateRange.endDate) {
    return ApiError.badRequest('Start date and end date are required')
  }

  // Parse query parameters
  let params: z.infer<typeof aggregationParamsSchema>
  try {
    params = aggregationParamsSchema.parse({
      clinicId: searchParams.get('clinicId'),
      metricDefinitionId: searchParams.get('metricDefinitionId') || undefined,
      providerId: searchParams.get('providerId') || undefined,
      aggregationType: searchParams.get('aggregationType') || 'monthly',
    })
  } catch (error) {
    return ApiError.badRequest('Invalid query parameters')
  }

  try {
    const aggregations = await metricQueries.getAggregatedMetrics(
      authContext,
      params.clinicId,
      {
        metricDefinitionId: params.metricDefinitionId,
        providerId: params.providerId,
        aggregationType: params.aggregationType,
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate,
        },
      }
    )

    return ApiResponse.success({ aggregations })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return ApiError.forbidden(error.message)
    }
    throw error
  }
})