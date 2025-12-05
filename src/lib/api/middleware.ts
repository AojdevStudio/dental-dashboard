import { type NextRequest, NextResponse } from 'next/server';
import { type AuthContext, getAuthContext } from '../database/auth-context';

export type ApiHandler<_TSuccessPayload = unknown> = (
  request: Request,
  context: {
    params: Promise<Record<string, string | string[]>>;
    authContext: AuthContext;
  }
) => Promise<NextResponse<unknown>>;

/**
 * Validates admin access requirements based on user role and context
 *
 * This function checks if the authenticated user meets the specified admin requirements.
 * It supports both system-wide admin checks and clinic-specific admin validation.
 *
 * @param authContext - The authenticated user's context containing role and clinic information
 * @param options - Configuration object specifying access requirements
 * @param options.requireAdmin - Whether system admin role is required
 * @param options.requireClinicAdmin - Whether clinic admin role is required for a specific clinic
 * @param req - The incoming request object (needed for clinic admin validation)
 * @returns Promise resolving to null if access is granted, or NextResponse with error if denied
 * @throws {Error} When validation logic encounters an unexpected error
 *
 * @example
 * // Check for system admin
 * const result = await validateAdminAccess(authContext, { requireAdmin: true });
 *
 * @example
 * // Check for clinic admin with clinic ID in request
 * const result = await validateAdminAccess(authContext, { requireClinicAdmin: true }, request);
 */
async function validateAdminAccess(
  authContext: NonNullable<AuthContext>,
  options?: { requireAdmin?: boolean; requireClinicAdmin?: boolean },
  req?: Request
): Promise<NextResponse | null> {
  // Check admin requirements
  if (options?.requireAdmin && authContext.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Check clinic admin requirements
  if (options?.requireClinicAdmin && req) {
    const clinicId =
      (req as NextRequest).nextUrl.searchParams.get('clinicId') ||
      (req as NextRequest).headers.get('x-clinic-id');

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID required' }, { status: 400 });
    }

    const { isClinicAdmin } = await import('../database/auth-context');
    const isAdmin = await isClinicAdmin(authContext, clinicId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Clinic admin access required' }, { status: 403 });
    }
  }

  return null;
}

/**
 * Handles middleware errors by mapping them to appropriate HTTP status codes and responses
 *
 * This function processes various error types and converts them into standardized API error responses.
 * It provides specific handling for common error patterns like access denied and not found scenarios.
 *
 * @param error - The error object to be processed (can be Error instance or unknown type)
 * @returns NextResponse with appropriate error message and HTTP status code
 *
 * @example
 * // Handle an access denied error
 * const response = handleMiddlewareError(new Error('Access denied: insufficient permissions'));
 * // Returns: NextResponse with 403 status
 *
 * @example
 * // Handle a generic error
 * const response = handleMiddlewareError(new Error('Something went wrong'));
 * // Returns: NextResponse with 500 status
 */
function handleMiddlewareError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

/**
 * Higher-order function that wraps API route handlers with authentication and authorization middleware
 *
 * This function provides a secure wrapper for Next.js API routes, automatically handling:
 * - User authentication validation via Supabase
 * - Auth context injection with user and clinic information
 * - Admin access control based on specified requirements
 * - Consistent error handling and response formatting
 *
 * @template TSuccessPayload - The expected type of successful response data
 * @param handler - The API route handler function to be wrapped
 * @param options - Configuration object for access control requirements
 * @param options.requireAdmin - Whether system admin role is required (default: false)
 * @param options.requireClinicAdmin - Whether clinic admin role is required (default: false)
 * @returns Enhanced API route handler with authentication and authorization
 *
 * @example
 * // Simple authenticated endpoint
 * export const GET = withAuth(async (req, { authContext }) => {
 *   // Access authenticated user via authContext
 *   return NextResponse.json({ userId: authContext.userId });
 * });
 *
 * @example
 * // Admin-only endpoint
 * export const POST = withAuth(async (req, { authContext }) => {
 *   // Only system admins can access this endpoint
 *   return NextResponse.json({ message: 'Admin operation successful' });
 * }, { requireAdmin: true });
 *
 * @example
 * // Clinic admin endpoint
 * export const PUT = withAuth(async (req, { authContext }) => {
 *   // User must be admin of the specified clinic
 *   return NextResponse.json({ message: 'Clinic admin operation successful' });
 * }, { requireClinicAdmin: true });
 */
export function withAuth<TSuccessPayload = unknown>(
  handler: ApiHandler<TSuccessPayload>,
  options?: {
    requireAdmin?: boolean;
    requireClinicAdmin?: boolean;
  }
): (
  request: Request,
  context: { params: Promise<Record<string, string | string[]>> }
) => Promise<NextResponse> {
  return async (req: Request, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const authContext = await getAuthContext();

      if (!authContext) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Validate access requirements
      const accessError = await validateAdminAccess(authContext, options, req);
      if (accessError) {
        return accessError;
      }

      // Call the handler with auth context
      return await handler(req, {
        ...context,
        authContext,
      });
    } catch (error) {
      return handleMiddlewareError(error);
    }
  };
}

/**
 * Extracts and validates clinic ID from various sources in the request
 *
 * This utility function attempts to find a clinic ID from multiple request sources
 * in order of priority: URL search params, request headers, and request body.
 * Useful for endpoints that need to determine which clinic context to operate in.
 *
 * @param request - The Next.js request object to extract clinic ID from
 * @returns The clinic ID string if found, null if no valid clinic ID is present
 *
 * @example
 * // Get clinic ID from URL params: /api/data?clinicId=abc-123
 * const clinicId = getClinicId(request);
 *
 * @example
 * // Get clinic ID from custom header: X-Clinic-ID: abc-123
 * const clinicId = getClinicId(request);
 */
export function getClinicId(request: NextRequest): string | null {
  // Check URL params
  const urlClinicId = request.nextUrl.searchParams.get('clinicId');
  if (urlClinicId) {
    return urlClinicId;
  }

  // Check headers
  const headerClinicId = request.headers.get('x-clinic-id');
  if (headerClinicId) {
    return headerClinicId;
  }

  // Check body for POST/PUT requests
  // Note: This would need to be handled in the route handler
  // as NextRequest doesn't provide easy body access

  return null;
}

/**
 * Parses and extracts date range parameters from request URL search params
 *
 * This function safely extracts startDate and endDate from URL search parameters
 * and converts them to Date objects. Handles cases where parameters are missing
 * or invalid gracefully by returning undefined values.
 *
 * @param request - The Next.js request object containing URL search parameters
 * @returns Object containing optional startDate and endDate as Date objects
 *
 * @example
 * // URL: /api/metrics?startDate=2024-01-01&endDate=2024-01-31
 * const { startDate, endDate } = getDateRangeParams(request);
 * // Returns: { startDate: Date('2024-01-01'), endDate: Date('2024-01-31') }
 *
 * @example
 * // URL without date params: /api/metrics
 * const { startDate, endDate } = getDateRangeParams(request);
 * // Returns: { startDate: undefined, endDate: undefined }
 */
export function getDateRangeParams(request: NextRequest): {
  startDate?: Date;
  endDate?: Date;
} {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('startDate');
  const end = searchParams.get('endDate');

  return {
    startDate: start ? new Date(start) : undefined,
    endDate: end ? new Date(end) : undefined,
  };
}

/**
 * Validates and parses request body against a provided schema
 *
 * This generic utility function parses JSON request bodies and validates them
 * against a provided schema object (typically Zod). Provides type-safe parsing
 * with proper error handling for malformed JSON or validation failures.
 *
 * @template T - The expected type after successful validation
 * @param request - The Next.js request object containing the JSON body
 * @param schema - Schema object with a parse method (e.g., Zod schema)
 * @returns Promise resolving to the validated and typed data
 * @throws {Error} When JSON parsing fails or validation errors occur
 *
 * @example
 * // Validate user creation data
 * const userData = await validateBody(request, userCreateSchema);
 * // userData is now typed according to the schema
 *
 * @example
 * // With Zod schema
 * const updateSchema = z.object({ name: z.string(), email: z.string().email() });
 * const validData = await validateBody(request, updateSchema);
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: {
    parse: (data: unknown) => T;
  }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (_error) {
    throw new Error('Invalid request body');
  }
}
