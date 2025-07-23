import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { prisma } from '@/lib/database/prisma';
import type { ISODateString, ProviderWithLocations } from '@/types/providers';
import type { NextResponse } from 'next/server';
import { z } from 'zod';

// Provider ID validation regex patterns (moved to top-level for performance)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

// Provider ID validation schema
const providerIdSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
});

/**
 * Validate provider ID format (UUID or slug)
 */
function isValidProviderId(providerId: string): boolean {
  return UUID_REGEX.test(providerId) || SLUG_REGEX.test(providerId);
}

/**
 * Get provider by ID with location details and multi-tenant security
 */
async function getProviderById(
  providerId: string,
  authContext: AuthContext
): Promise<ProviderWithLocations | null> {
  interface ProviderWhereClause {
    OR: Array<{ id: string }>;
    clinicId?: { in: string[] };
  }

  const whereClause: ProviderWhereClause = {
    OR: [
      { id: providerId },
      // TODO: Add slug support when provider slugs are implemented
    ],
  };

  // Apply multi-tenant filtering - only system admins can see all providers
  if (authContext.role !== 'system_admin' && authContext.clinicIds.length > 0) {
    whereClause.clinicId = {
      in: authContext.clinicIds,
    };
  }

  const provider = await prisma.provider.findFirst({
    where: whereClause,
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
      providerLocations: {
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: [{ isPrimary: 'desc' }, { location: { name: 'asc' } }],
      },
      _count: {
        select: {
          hygieneProduction: true,
          dentistProduction: true,
        },
      },
    },
  });

  if (!provider) {
    return null;
  }

  // Transform to match ProviderWithLocations interface
  const transformedProvider: ProviderWithLocations = {
    id: provider.id,
    name: provider.name,
    firstName: provider.firstName,
    lastName: provider.lastName,
    email: provider.email,
    providerType: provider.providerType,
    status: provider.status,
    clinic: provider.clinic,
    locations: provider.providerLocations.map((pl) => ({
      id: pl.id,
      locationId: pl.location.id,
      locationName: pl.location.name,
      locationAddress: pl.location.address,
      isPrimary: pl.isPrimary,
      isActive: pl.isActive,
      startDate: pl.startDate.toISOString() as ISODateString,
      endDate: (pl.endDate?.toISOString() || null) as ISODateString | null,
    })),
    primaryLocation: provider.providerLocations.find((pl) => pl.isPrimary)?.location || undefined,
    _count: {
      locations: provider.providerLocations.length,
      hygieneProduction: provider._count.hygieneProduction,
      dentistProduction: provider._count.dentistProduction,
    },
  };

  return transformedProvider;
}

/**
 * GET /api/providers/[providerId]
 *
 * Retrieve detailed information for a specific provider
 * Supports both UUID and slug-based identification
 * Enforces multi-tenant security and role-based access control
 */
const getProviderHandler: ApiHandler = async (
  _request: Request,
  {
    params,
    authContext,
  }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const resolvedParams = await params;

    // Validate provider ID parameter
    const { providerId } = providerIdSchema.parse(resolvedParams);

    // Validate provider ID format
    if (!isValidProviderId(providerId)) {
      return apiError('Invalid provider ID format', 400);
    }

    // Fetch provider with multi-tenant security
    const provider = await getProviderById(providerId, authContext);

    if (!provider) {
      return apiError('Provider not found', 404);
    }

    return apiSuccess(provider) as NextResponse;
  } catch (error) {
    console.error('Error fetching provider:', error);
    return handleApiError(error);
  }
};

export const GET = withAuth(getProviderHandler);

/**
 * PATCH /api/providers/[providerId]
 *
 * Update provider information
 * TODO: Implement provider update functionality in future phases
 */
const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  providerType: z.enum(['dentist', 'hygienist', 'specialist', 'other']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateProviderHandler: ApiHandler = async (
  request: Request,
  {
    params,
    authContext,
  }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const resolvedParams = await params;
    const { providerId } = providerIdSchema.parse(resolvedParams);

    // Validate provider ID format
    if (!isValidProviderId(providerId)) {
      return apiError('Invalid provider ID format', 400);
    }

    // Parse and validate request body
    const body = await request.json();
    const updateData = updateProviderSchema.parse(body);

    // Check if provider exists and user has access
    const existingProvider = await getProviderById(providerId, authContext);
    if (!existingProvider) {
      return apiError('Provider not found', 404);
    }

    // Only allow updates if user has admin role or provider is in user's clinic
    if (authContext.role !== 'system_admin' && authContext.role !== 'admin') {
      return apiError('Insufficient permissions to update provider', 403);
    }

    // Update provider
    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: updateData,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        providerLocations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { location: { name: 'asc' } }],
        },
        _count: {
          select: {
            hygieneProduction: true,
            dentistProduction: true,
          },
        },
      },
    });

    return apiSuccess(updatedProvider) as NextResponse;
  } catch (error) {
    console.error('Error updating provider:', error);
    return handleApiError(error);
  }
};

export const PATCH = withAuth(updateProviderHandler);
