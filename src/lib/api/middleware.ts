/**
 * API Route Middleware
 * Provides authentication and auth context for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, AuthContext } from '@/lib/database/auth-context'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/api/utils'

export type ApiHandler = (
  request: NextRequest,
  context: {
    params?: Record<string, string> | Promise<Record<string, string>>
    authContext: AuthContext
  }
) => Promise<NextResponse>

/**
 * Wraps an API route handler with authentication and auth context
 */
export function withAuth(
  handler: ApiHandler,
  options?: {
    requireAdmin?: boolean
    requireClinicAdmin?: boolean
  }
): (request: NextRequest, context: any) => Promise<NextResponse> {
  return async (request: NextRequest, context: any) => {
    try {
      // Get auth context
      const authContext = await getAuthContext()
      
      if (!authContext) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check admin requirements
      if (options?.requireAdmin && authContext.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Check clinic admin requirements
      if (options?.requireClinicAdmin) {
        const clinicId = request.nextUrl.searchParams.get('clinicId') || 
                        request.headers.get('x-clinic-id')
        
        if (!clinicId) {
          return NextResponse.json(
            { error: 'Clinic ID required' },
            { status: 400 }
          )
        }

        const { isClinicAdmin } = await import('@/lib/database/auth-context')
        const isAdmin = await isClinicAdmin(authContext, clinicId)
        
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Clinic admin access required' },
            { status: 403 }
          )
        }
      }

      // Call the handler with auth context
      return await handler(request, {
        ...context,
        authContext
      })
      
    } catch (error) {
      console.error('API route error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Access denied')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
      }
      
      // Generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Extract and validate clinic ID from request
 */
export function getClinicId(request: NextRequest): string | null {
  // Check URL params
  const urlClinicId = request.nextUrl.searchParams.get('clinicId')
  if (urlClinicId) return urlClinicId

  // Check headers
  const headerClinicId = request.headers.get('x-clinic-id')
  if (headerClinicId) return headerClinicId

  // Check body for POST/PUT requests
  // Note: This would need to be handled in the route handler
  // as NextRequest doesn't provide easy body access

  return null
}


/**
 * Parse date range params from request
 */
export function getDateRangeParams(request: NextRequest): {
  startDate?: Date
  endDate?: Date
} {
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('startDate')
  const end = searchParams.get('endDate')

  return {
    startDate: start ? new Date(start) : undefined,
    endDate: end ? new Date(end) : undefined,
  }
}

/**
 * Validate request body against a schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: {
    parse: (data: unknown) => T
  }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    throw new Error('Invalid request body')
  }
}