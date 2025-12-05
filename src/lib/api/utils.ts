import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Move regex to module scope for performance

/**
 * Custom error class for API-specific errors with HTTP status codes
 *
 * Extends the standard Error class to include HTTP status codes and optional
 * error codes for consistent API error handling. Maintains proper prototype
 * chain for instanceof checks after TypeScript transpilation.
 *
 * @extends Error
 * @property {number} statusCode - HTTP status code for the error
 * @property {string} [code] - Optional application-specific error code
 *
 * @example
 * // Throw a validation error
 * throw new ApiError('Invalid email format', 400, 'VALIDATION_ERROR');
 *
 * @example
 * // Throw an access denied error
 * throw new ApiError('Access denied', 403, 'INSUFFICIENT_PERMISSIONS');
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;

    // Ensure proper prototype chain for instanceof checks after transpilation
    Object.setPrototypeOf(this, ApiError.prototype);
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
 * Creates a standardized 201 Created response for successful resource creation
 *
 * This helper function wraps newly created resources in the standard API response
 * format and sets the appropriate HTTP 201 status code. Used by POST endpoints
 * that create new database records.
 *
 * @template T - The type of the created resource data
 * @param data - The created resource data to return
 * @returns NextResponse with standardized success payload and 201 status
 *
 * @example
 * // Return newly created provider
 * const provider = await createProvider(data);
 * return apiCreated(provider);
 */
export function apiCreated<T>(data: T): NextResponse<ApiSuccessPayload<T>> {
  return apiSuccess(data, 201);
}

/**
 * Creates a standardized success response with customizable status code
 *
 * This is the primary helper for creating successful API responses. It wraps
 * the response data in the standard API format and allows for custom HTTP
 * status codes while defaulting to 200 OK.
 *
 * @template T - The type of the response data
 * @param data - The response data to return
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with standardized success payload
 *
 * @example
 * // Standard 200 response
 * return apiSuccess(userData);
 *
 * @example
 * // Custom status code
 * return apiSuccess(updatedData, 202); // Accepted
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
 * Creates a standardized error response with HTTP status code and optional error code
 *
 * This helper function creates consistent error responses across all API endpoints.
 * It wraps error information in the standard API format and supports both generic
 * HTTP errors and application-specific error codes.
 *
 * @param message - Human-readable error message
 * @param status - HTTP status code (defaults to 500)
 * @param code - Optional application-specific error code
 * @returns NextResponse with standardized error payload
 *
 * @example
 * // Generic validation error
 * return apiError('Invalid input data', 400);
 *
 * @example
 * // Specific application error
 * return apiError('User not found', 404, 'USER_NOT_FOUND');
 *
 * @example
 * // Authorization error
 * return apiError('Access denied', 403, 'INSUFFICIENT_PERMISSIONS');
 */
export function apiError(
  message: string,
  status = 500,
  code?: string
): NextResponse<ApiErrorPayload> {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

/**
 * Creates a standardized paginated response with metadata
 *
 * This helper function wraps paginated data in the standard API response format
 * and includes comprehensive pagination metadata for client-side pagination controls.
 * Automatically calculates total pages based on data count and page size.
 *
 * @template T - The type of individual items in the paginated data
 * @param data - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with standardized paginated success payload
 *
 * @example
 * // Return paginated providers
 * const { providers, total } = await getProvidersPaginated({ page: 1, limit: 10 });
 * return apiPaginated(providers, total, 1, 10);
 *
 * @example
 * // Response structure
 * {
 *   success: true,
 *   data: [...items],
 *   pagination: {
 *     total: 50,
 *     page: 1,
 *     limit: 10,
 *     totalPages: 5
 *   }
 * }
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
 * Parses and validates pagination parameters from URL search parameters
 *
 * This utility function extracts pagination parameters from URL search params,
 * applies sensible defaults, and enforces limits to prevent performance issues.
 * The limit is capped at 100 items to prevent excessive database loads.
 *
 * @param searchParams - URLSearchParams object from the request URL
 * @returns Object containing validated pagination parameters
 * @returns {number} limit - Items per page (default: 10, max: 100)
 * @returns {number} page - Current page number (minimum: 1)
 * @returns {number} offset - Database offset for LIMIT/OFFSET queries
 *
 * @example
 * // URL: /api/providers?page=2&limit=25
 * const { limit, page, offset } = getPaginationParams(searchParams);
 * // Returns: { limit: 25, page: 2, offset: 25 }
 *
 * @example
 * // URL with no params: /api/providers
 * const pagination = getPaginationParams(searchParams);
 * // Returns: { limit: 10, page: 1, offset: 0 }
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const limit = Math.min(Number.parseInt(searchParams.get('limit') || '10'), 100);
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1'), 1);
  const offset = (page - 1) * limit;

  return { limit, page, offset };
}

/**
 * Calculates comprehensive pagination metadata for client-side pagination controls
 *
 * This utility function computes all necessary pagination information that clients
 * need to render pagination controls, including page navigation flags and offset
 * calculations for adjacent pages.
 *
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Object containing complete pagination metadata
 *
 * @example
 * // Calculate metadata for current page
 * const meta = calculatePaginationMetadata(100, 3, 20);
 * // Returns:
 * // {
 * //   totalPages: 5,
 * //   hasNextPage: true,
 * //   hasPrevPage: true,
 * //   nextOffset: 60,
 * //   prevOffset: 20
 * // }
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
 * Centralized error handling function for consistent API error responses
 *
 * This function processes various error types and converts them into standardized
 * API error responses. It handles custom ApiError instances, Zod validation errors,
 * and generic JavaScript errors with appropriate HTTP status codes.
 *
 * Error Mapping:
 * - ApiError: Uses the error's statusCode and code
 * - ZodError: Returns 400 with VALIDATION_ERROR code
 * - Generic Errors: Analyzed for common patterns (access denied, not found)
 * - Unknown errors: Returns 500 with UNKNOWN_ERROR code
 *
 * @param error - The error to be processed (can be any type)
 * @returns NextResponse with standardized error payload and appropriate status
 *
 * @example
 * // In a try-catch block
 * try {
 *   const result = await riskyOperation();
 *   return apiSuccess(result);
 * } catch (error) {
 *   return handleApiError(error);
 * }
 *
 * @example
 * // Error response for validation failure
 * // Input: ZodError
 * // Output: { success: false, error: { message: "Invalid request data", code: "VALIDATION_ERROR" } }
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
 * UUID v4 validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates whether a string is a properly formatted UUID v4
 *
 * Uses a compiled regular expression to efficiently validate UUID format.
 * The regex is defined at module scope for performance optimization.
 * Supports both uppercase and lowercase UUID formats.
 *
 * @param id - The string to validate as a UUID
 * @returns boolean indicating whether the string is a valid UUID v4
 *
 * @example
 * // Valid UUID
 * isValidUuid('550e8400-e29b-41d4-a716-446655440000'); // true
 *
 * @example
 * // Invalid UUID
 * isValidUuid('not-a-uuid'); // false
 * isValidUuid('550e8400-e29b-41d4'); // false (incomplete)
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Parses and validates date range parameters from URL search parameters
 *
 * This function extracts startDate and endDate parameters from URL search params,
 * validates their format, and ensures the date range is logical (start before end).
 * Returns null if either parameter is missing, or throws ApiError for invalid data.
 *
 * @param searchParams - URLSearchParams object from the request URL
 * @returns Object with validated Date objects or null if parameters missing
 * @throws {ApiError} When date format is invalid or start date is after end date
 *
 * @example
 * // URL: /api/metrics?startDate=2024-01-01&endDate=2024-01-31
 * const dateRange = getDateRangeParams(searchParams);
 * // Returns: { startDate: Date('2024-01-01'), endDate: Date('2024-01-31') }
 *
 * @example
 * // Invalid date range
 * // URL: /api/metrics?startDate=2024-02-01&endDate=2024-01-01
 * getDateRangeParams(searchParams); // Throws ApiError: "Start date must be before end date"
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
 * Parses and validates sort parameters from URL search parameters
 *
 * This function extracts sortBy and sortOrder parameters, validates that the
 * sort field is allowed (preventing SQL injection), and normalizes the sort
 * order to 'asc' or 'desc'. Returns null if no sort parameters are provided.
 *
 * @param searchParams - URLSearchParams object from the request URL
 * @param allowedFields - Array of field names that are allowed for sorting
 * @returns Object with validated sort parameters or null if not provided
 * @throws {ApiError} When sortBy field is not in the allowedFields array
 *
 * @example
 * // URL: /api/providers?sortBy=name&sortOrder=desc
 * const sort = getSortParams(searchParams, ['name', 'createdAt', 'providerType']);
 * // Returns: { sortBy: 'name', sortOrder: 'desc' }
 *
 * @example
 * // Invalid sort field
 * const sort = getSortParams(searchParams, ['name']);
 * // Throws ApiError: "Invalid sort field. Allowed: name"
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
