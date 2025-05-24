import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Standard API response utilities
 */
export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json(data, { status })
  }

  static error(message: string, status = 500, code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status }
    )
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    status = 200
  ) {
    return NextResponse.json(
      {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status }
    )
  }
}

/**
 * Parse pagination parameters from search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '10'),
    100
  )
  const page = Math.max(
    parseInt(searchParams.get('page') || '1'),
    1
  )
  const offset = (page - 1) * limit

  return { limit, page, offset }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return ApiResponse.error(error.message, error.statusCode, error.code)
  }

  if (error instanceof ZodError) {
    return ApiResponse.error(
      'Invalid request data',
      400,
      'VALIDATION_ERROR'
    )
  }

  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Access denied')) {
      return ApiResponse.error(error.message, 403, 'ACCESS_DENIED')
    }
    if (error.message.includes('not found')) {
      return ApiResponse.error(error.message, 404, 'NOT_FOUND')
    }
    
    return ApiResponse.error(error.message, 500, 'INTERNAL_ERROR')
  }

  return ApiResponse.error(
    'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  )
}

/**
 * Validate UUID format
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Parse and validate date range parameters
 */
export function getDateRangeParams(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return null
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError('Invalid date format', 400, 'INVALID_DATE')
  }

  if (start > end) {
    throw new ApiError('Start date must be before end date', 400, 'INVALID_DATE_RANGE')
  }

  return { startDate: start, endDate: end }
}

/**
 * Parse and validate sort parameters
 */
export function getSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[]
) {
  const sortBy = searchParams.get('sortBy')
  const sortOrder = searchParams.get('sortOrder')

  if (!sortBy) {
    return null
  }

  if (!allowedFields.includes(sortBy)) {
    throw new ApiError(
      `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
      400,
      'INVALID_SORT_FIELD'
    )
  }

  const order = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'

  return { sortBy, sortOrder: order }
}