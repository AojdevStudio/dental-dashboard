/**
 * Individual Clinic API Route
 * Operations on specific clinics
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { ApiResponse, ApiError } from '@/lib/api/utils'
import * as clinicQueries from '@/lib/database/queries/clinics'
import { z } from 'zod'

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export type GetClinicResponse = Awaited<ReturnType<typeof clinicQueries.getClinicById>>
export type UpdateClinicResponse = Awaited<ReturnType<typeof clinicQueries.updateClinic>>
export type GetClinicStatsResponse = Awaited<ReturnType<typeof clinicQueries.getClinicStatistics>>

/**
 * GET /api/clinics/:clinicId
 * Get a specific clinic with optional includes
 */
export const GET = withAuth(async (request, { authContext, params }) => {
  const clinicId = params?.clinicId
  if (!clinicId) {
    return ApiError.badRequest('Clinic ID required')
  }

  const searchParams = request.nextUrl.searchParams
  const includeProviders = searchParams.get('includeProviders') === 'true'
  const includeUsers = searchParams.get('includeUsers') === 'true'
  const includeMetrics = searchParams.get('includeMetrics') === 'true'

  try {
    const clinic = await clinicQueries.getClinicById(authContext, clinicId, {
      includeProviders,
      includeUsers,
      includeMetrics,
    })

    if (!clinic) {
      return ApiError.notFound('Clinic')
    }

    return ApiResponse.success(clinic)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return ApiError.forbidden(error.message)
    }
    throw error
  }
})

/**
 * PATCH /api/clinics/:clinicId
 * Update a clinic (clinic admin only)
 */
export const PATCH = withAuth(async (request, { authContext, params }) => {
  const clinicId = params?.clinicId
  if (!clinicId) {
    return ApiError.badRequest('Clinic ID required')
  }

  // Parse and validate request body
  let body: z.infer<typeof updateClinicSchema>
  try {
    const rawBody = await request.json()
    body = updateClinicSchema.parse(rawBody)
  } catch (error) {
    return ApiError.badRequest('Invalid request body')
  }

  try {
    const clinic = await clinicQueries.updateClinic(authContext, clinicId, body)
    return ApiResponse.success(clinic)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Only clinic administrators')) {
        return ApiError.forbidden(error.message)
      }
    }
    throw error
  }
})