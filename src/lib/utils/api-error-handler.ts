/**
 * API Error Handler Utilities
 *
 * Provides comprehensive error handling for API calls with
 * null-safe patterns and graceful degradation.
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorContext {
  endpoint?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  success: true;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 500,
  code?: string,
  details?: Record<string, unknown>,
  context?: ApiErrorContext
): NextResponse<ApiErrorResponse> {
  const error: ApiError = {
    message,
    code,
    status,
    details,
    timestamp: new Date().toISOString(),
    requestId: context?.requestId || generateRequestId(),
  };

  // Log error with context
  logApiError(error, context);

  return NextResponse.json({ error, success: false }, { status });
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data, success: true, message }, { status });
}

/**
 * API Error Handler Functions
 */

/**
 * Handles validation errors
 */
export function validationError(
  message: string,
  details?: Record<string, unknown>,
  context?: ApiErrorContext
) {
  return createErrorResponse(message, 400, 'VALIDATION_ERROR', details, context);
}

/**
 * Handles authentication errors
 */
export function authenticationError(
  message = 'Authentication required',
  context?: ApiErrorContext
) {
  return createErrorResponse(message, 401, 'AUTHENTICATION_ERROR', undefined, context);
}

/**
 * Handles authorization errors
 */
export function authorizationError(
  message = 'Insufficient permissions',
  context?: ApiErrorContext
) {
  return createErrorResponse(message, 403, 'AUTHORIZATION_ERROR', undefined, context);
}

/**
 * Handles not found errors
 */
export function notFoundError(resource = 'Resource', context?: ApiErrorContext) {
  return createErrorResponse(`${resource} not found`, 404, 'NOT_FOUND', undefined, context);
}

/**
 * Handles conflict errors
 */
export function conflictError(
  message: string,
  details?: Record<string, unknown>,
  context?: ApiErrorContext
) {
  return createErrorResponse(message, 409, 'CONFLICT_ERROR', details, context);
}

/**
 * Handles rate limiting errors
 */
export function rateLimitedError(message = 'Too many requests', context?: ApiErrorContext) {
  return createErrorResponse(message, 429, 'RATE_LIMITED', undefined, context);
}

/**
 * Handles internal server errors
 */
export function internalError(
  message = 'Internal server error',
  error?: Error,
  context?: ApiErrorContext
) {
  const details = error
    ? {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    : undefined;

  return createErrorResponse(message, 500, 'INTERNAL_ERROR', details, context);
}

/**
 * Handles database errors
 */
export function databaseError(
  message = 'Database operation failed',
  error?: Error,
  context?: ApiErrorContext
) {
  const details = error
    ? {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    : undefined;

  return createErrorResponse(message, 500, 'DATABASE_ERROR', details, context);
}

/**
 * Handles external service errors
 */
export function externalServiceError(
  service: string,
  message?: string,
  error?: Error,
  context?: ApiErrorContext
) {
  const errorMessage = message || `${service} service unavailable`;
  const details = error
    ? {
        service,
        originalError: error.message,
      }
    : { service };

  return createErrorResponse(errorMessage, 503, 'EXTERNAL_SERVICE_ERROR', details, context);
}

/**
 * Wraps API route handlers with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Unhandled API error:', error);

      if (error instanceof Error) {
        return internalError('An unexpected error occurred', error);
      }

      return internalError('An unknown error occurred');
    }
  };
}

/**
 * Validates required fields in request data
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[],
  context?: ApiErrorContext
): void {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields },
      context
    );
  }
}

/**
 * Custom error classes for better error handling
 */
export class ValidationError extends Error {
  details?: Record<string, unknown>;
  context?: ApiErrorContext;

  constructor(message: string, details?: Record<string, unknown>, context?: ApiErrorContext) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.context = context;
  }
}

export class AuthenticationError extends Error {
  context?: ApiErrorContext;

  constructor(message = 'Authentication required', context?: ApiErrorContext) {
    super(message);
    this.name = 'AuthenticationError';
    this.context = context;
  }
}

export class AuthorizationError extends Error {
  context?: ApiErrorContext;

  constructor(message = 'Insufficient permissions', context?: ApiErrorContext) {
    super(message);
    this.name = 'AuthorizationError';
    this.context = context;
  }
}

export class NotFoundError extends Error {
  context?: ApiErrorContext;

  constructor(resource = 'Resource', context?: ApiErrorContext) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.context = context;
  }
}

/**
 * Logs API errors with context
 */
function logApiError(error: ApiError, context?: ApiErrorContext): void {
  const logData = {
    error,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', logData);
  }

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to logging service
    // loggingService.logError(logData);
  }
}

/**
 * Generates a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return !response.success;
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}
