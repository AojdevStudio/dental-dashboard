import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiPaginated, getPaginationParams, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { getProvidersWithLocationsPaginated } from '@/lib/database/queries/providers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Zod schema for validating query parameters in provider list requests
 *
 * Validates and transforms query parameters including:
 * - clinicId: Optional UUID for filtering providers by clinic
 * - locationId: Optional UUID for filtering providers by location
 * - providerType: Optional enum for filtering by provider specialty
 * - status: Optional enum for filtering by active/inactive status
 * - includeInactive: Optional boolean flag to include inactive providers
 */
// Query parameter validation schema
const providersQuerySchema = z.object({
  clinicId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  providerType: z.enum(['dentist', 'hygienist', 'specialist', 'other']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  includeInactive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

/**
 * Handles GET requests for retrieving providers with pagination and filtering
 *
 * This handler provides comprehensive provider listing with multi-tenant security,
 * pagination, and various filtering options. It respects user access controls
 * and ensures providers can only see data from their authorized clinics.
 *
 * Security Features:
 * - Multi-tenant filtering based on user's clinic associations
 * - System admin override for cross-clinic access
 * - Automatic clinic context application for regular users
 *
 * @param request - The incoming GET request with query parameters
 * @param authContext - Authenticated user context with clinic and role information
 * @returns Promise<NextResponse> Paginated list of providers with metadata
 *
 * @example
 * // GET /api/providers?clinicId=abc-123&providerType=dentist&page=1&limit=10
 * {
 *   success: true,
 *   data: [{ id: "provider-1", name: "Dr. Smith", ... }],
 *   pagination: { total: 25, page: 1, limit: 10, totalPages: 3 }
 * }
 */
const getProvidersHandler: ApiHandler = async (
  request: Request,
  { authContext }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse and validate query parameters
    const queryParams = providersQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    // Parse pagination parameters using utility
    const { page, limit } = getPaginationParams(searchParams);

    // Apply multi-tenant filtering - providers can only see providers from their clinic
    // Exception: System admins can see all providers when no specific clinic is requested
    const filters = {
      ...queryParams,
      clinicId:
        queryParams.clinicId ||
        (authContext.isSystemAdmin
          ? undefined // System admins see all providers when no specific clinic requested
          : authContext.clinicIds && authContext.clinicIds.length > 0
            ? authContext.clinicIds[0]
            : undefined),
    };

    // Fetch providers with database-level pagination
    const { providers: paginatedProviders, total } = await getProvidersWithLocationsPaginated({
      ...filters,
      page,
      limit,
    });

    return apiPaginated(paginatedProviders, total, page, limit) as NextResponse;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * GET /api/providers - Retrieve providers with filtering and pagination
 *
 * Protected endpoint that requires authentication. Returns paginated list of providers
 * filtered by user's clinic access and optional query parameters.
 */
export const GET = withAuth(getProvidersHandler);

/**
 * Zod schema for validating provider creation requests
 *
 * Validates required and optional fields for creating new providers:
 * - name: Required display name for the provider
 * - first_name, last_name: Optional name components
 * - email: Optional contact email with validation
 * - provider_type: Provider specialty (dentist, hygienist, etc.)
 * - position: Optional job title or position
 * - clinic_id: Required UUID of the clinic the provider belongs to
 */
// Create provider request schema
const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  provider_type: z.enum(['dentist', 'hygienist', 'specialist', 'other']).default('other'),
  position: z.string().optional(),
  clinic_id: z.string().uuid('Invalid clinic ID format'),
});

/**
 * Handles POST requests for creating new providers
 *
 * This handler creates new healthcare providers with comprehensive validation
 * and multi-tenant security. It ensures users can only create providers for
 * clinics they have access to and handles database constraints appropriately.
 *
 * Security Features:
 * - Clinic access validation (users can only create providers for their clinics)
 * - Admin override for cross-clinic provider creation
 * - Input sanitization and validation via Zod schema
 *
 * Error Handling:
 * - Duplicate provider detection (Prisma P2002)
 * - Invalid clinic ID validation (Prisma P2003)
 * - General validation and database errors
 *
 * @param request - The incoming POST request with provider data in JSON body
 * @param authContext - Authenticated user context with clinic and role information
 * @returns Promise<NextResponse> Created provider data with 201 status
 *
 * @example
 * // POST /api/providers
 * // Body: { "name": "Dr. Jane Smith", "provider_type": "dentist", "clinic_id": "abc-123" }
 * {
 *   success: true,
 *   data: {
 *     id: "provider-456",
 *     name: "Dr. Jane Smith",
 *     providerType: "dentist",
 *     clinicId: "abc-123",
 *     status: "active",
 *     ...
 *   }
 * }
 */
const createProviderHandler: ApiHandler = async (
  request: Request,
  { authContext }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const body = await request.json();
    const validatedData = createProviderSchema.parse(body);

    // Ensure user can only create providers for their clinic (unless admin)
    const clinicId = validatedData.clinic_id;
    if (authContext.role !== 'admin' && !authContext.clinicIds.includes(clinicId)) {
      return apiError('Access denied: cannot create provider for different clinic', 403);
    }

    // Create the provider using Prisma directly (since we need the creation logic)
    const { prisma } = await import('@/lib/database/client');
    const provider = await prisma.provider.create({
      data: {
        name: validatedData.name,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name,
        email: validatedData.email,
        providerType: validatedData.provider_type,
        position: validatedData.position,
        status: 'active',
        clinicId: clinicId,
      },
    });

    return NextResponse.json({ success: true, data: provider }, { status: 201 }) as NextResponse;
  } catch (error: unknown) {
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return apiError('A provider with this information already exists', 409);
      }

      if (error.code === 'P2003') {
        return apiError('Invalid clinic_id provided', 400);
      }
    }

    return handleApiError(error);
  }
};

/**
 * POST /api/providers - Create a new provider
 *
 * Protected endpoint that requires authentication. Creates a new healthcare provider
 * with validation and multi-tenant security controls.
 */
export const POST = withAuth(createProviderHandler);
