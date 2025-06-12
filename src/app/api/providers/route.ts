import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiPaginated, getPaginationParams, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { getProvidersWithLocationsPaginated } from '@/lib/database/queries/providers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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
    const { page, limit, offset } = getPaginationParams(searchParams);

    // Apply multi-tenant filtering - providers can only see providers from their clinic
    const filters = {
      ...queryParams,
      clinicId:
        queryParams.clinicId ||
        (authContext.clinicIds && authContext.clinicIds.length > 0
          ? authContext.clinicIds[0]
          : undefined),
    };

    // Fetch providers with database-level pagination
    const { providers: paginatedProviders, total } = await getProvidersWithLocationsPaginated({
      ...filters,
      pagination: { offset, limit },
    });

    return apiPaginated(paginatedProviders, total, page, limit) as NextResponse;
  } catch (error) {
    return handleApiError(error);
  }
};

export const GET = withAuth(getProvidersHandler);

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
    const { prisma } = await import('@/lib/database/prisma');
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

export const POST = withAuth(createProviderHandler);
