import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Move regex to module scope for performance
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Generic API Response interface for typing the shape of response bodies.
 * Used to ensure consistency in the data structure returned by API endpoints.
 * @template T The type of the data payload.
 */
export interface ApiSuccessPayload<T = unknown> {
  success: true;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorPayload {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessPayload<T> | ApiErrorPayload;

/**
 * Created response helper function
 */
export function apiCreated<T>(data: T): NextResponse<ApiSuccessPayload<T>> {
  return apiSuccess(data, 201);
}

/**
 * Success response helper function
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessPayload<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Error response helper function
 */
export function apiError(
  message: string,
  status = 500,
  code?: string
): NextResponse<ApiErrorPayload> {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

/**
 * Paginated response helper function
 */
export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  status = 200
): NextResponse<ApiSuccessPayload<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status }
  );
}

/**
 * Parse pagination parameters from search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const limit = Math.min(Number.parseInt(searchParams.get('limit') || '10'), 100);
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1'), 1);
  const offset = (page - 1) * limit;

  return { limit, page, offset };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMetadata(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const nextOffset = hasNextPage ? page * limit : null;
  const prevOffset = hasPrevPage ? (page - 2) * limit : null;

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextOffset,
    prevOffset,
  };
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof ApiError) {
    return apiError(error.message, error.statusCode, error.code);
  }

  if (error instanceof ZodError) {
    return apiError('Invalid request data', 400, 'VALIDATION_ERROR');
  }

  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Access denied')) {
      return apiError(error.message, 403, 'ACCESS_DENIED');
    }
    if (error.message.includes('not found')) {
      return apiError(error.message, 404, 'NOT_FOUND');
    }

    return apiError(error.message, 500, 'INTERNAL_ERROR');
  }

  return apiError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

/**
 * Validate UUID format
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Parse and validate date range parameters
 */
export function getDateRangeParams(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!(startDate && endDate)) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError('Invalid date format', 400, 'INVALID_DATE');
  }

  if (start > end) {
    throw new ApiError('Start date must be before end date', 400, 'INVALID_DATE_RANGE');
  }

  return { startDate: start, endDate: end };
}

/**
 * Parse and validate sort parameters
 */
export function getSortParams(searchParams: URLSearchParams, allowedFields: string[]) {
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  if (!sortBy) {
    return null;
  }

  if (!allowedFields.includes(sortBy)) {
    throw new ApiError(
      `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
      400,
      'INVALID_SORT_FIELD'
    );
  }

  const order = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  return { sortBy, sortOrder: order };
}
