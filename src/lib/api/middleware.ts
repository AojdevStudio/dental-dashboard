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
 * Validate admin access requirements
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
 * Handle middleware errors with appropriate status codes
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
 * Wraps an API route handler with authentication and auth context
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
 * Extract and validate clinic ID from request
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
 * Parse date range params from request
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
 * Validate request body against a schema
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
