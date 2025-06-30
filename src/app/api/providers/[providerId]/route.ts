import { type ApiHandler, withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/utils';
import type { AuthContext } from '@/lib/database/auth-context';
import { prisma } from '@/lib/database/prisma';
import type { ProviderWithLocations } from '@/types/providers';
import { NextResponse } from 'next/server';

const getProviderHandler: ApiHandler = async (
  _request: Request,
  {
    params,
    authContext,
  }: { params: Promise<Record<string, string | string[]>>; authContext: AuthContext }
) => {
  try {
    const resolvedParams = await params;
    const providerId = resolvedParams.providerId as string;

    if (!providerId) {
      return apiError('Provider ID is required', 400);
    }

    // Apply multi-tenant filtering - providers can only see providers from their clinic
    const clinicFilter = authContext.isSystemAdmin
      ? {}
      : { clinicId: { in: authContext.clinicIds } };

    // Fetch provider with multi-tenant filtering
    const provider = await prisma.provider.findFirst({
      where: {
        id: providerId,
        ...clinicFilter,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        providerLocations: {
          select: {
            id: true,
            locationId: true,
            isPrimary: true,
            isActive: true,
            startDate: true,
            endDate: true,
            location: {
              select: {
                name: true,
                address: true,
              },
            },
          },
          where: {
            isActive: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { startDate: 'desc' }],
        },
        _count: {
          select: {
            providerLocations: true,
            hygieneProduction: true,
            dentistProduction: true,
          },
        },
      },
    });

    if (!provider) {
      return apiError('Provider not found', 404);
    }

    // Transform to match ProviderWithLocations interface
    const responseData: ProviderWithLocations = {
      id: provider.id,
      name: provider.name,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      providerType: provider.providerType,
      status: provider.status,
      clinic: provider.clinic,
      locations: provider.providerLocations.map((loc) => ({
        id: loc.id,
        locationId: loc.locationId,
        locationName: loc.location.name,
        locationAddress: loc.location.address,
        isPrimary: loc.isPrimary,
        isActive: loc.isActive,
        startDate: loc.startDate.toISOString() as import('@/types/providers').ISODateString,
        endDate: (loc.endDate?.toISOString() as import('@/types/providers').ISODateString) || null,
      })),
      primaryLocation: (() => {
        const primaryLoc = provider.providerLocations.find((loc) => loc.isPrimary);
        return primaryLoc
          ? {
              id: primaryLoc.locationId,
              name: primaryLoc.location.name,
              address: primaryLoc.location.address,
            }
          : undefined;
      })(),
      _count: {
        locations: provider._count.providerLocations,
        hygieneProduction: provider._count.hygieneProduction,
        dentistProduction: provider._count.dentistProduction,
      },
    };

    return apiSuccess(responseData);
  } catch (error) {
    console.error('Error fetching provider data:', error);
    return handleApiError(error);
  }
};

/**
 * GET /api/providers/[providerId]
 *
 * Fetch individual provider data with location relationships and metrics
 * Implements multi-tenant security and proper error handling
 */
export const GET = withAuth(getProviderHandler);

/**
 * PATCH /api/providers/[providerId]
 *
 * Update provider information
 * Placeholder for future implementation (AC4)
 */
export function PATCH() {
  return NextResponse.json({ error: 'Provider updates not yet implemented' }, { status: 501 });
}

/**
 * DELETE /api/providers/[providerId]
 *
 * Soft delete provider (set status to inactive)
 * Placeholder for future implementation (AC4)
 */
export function DELETE() {
  return NextResponse.json({ error: 'Provider deletion not yet implemented' }, { status: 501 });
}
