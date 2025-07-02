import ProviderKPIDashboard from '@/components/dashboard/provider-kpi-dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import type { ProviderWithLocations } from '@/types/providers';
import { ArrowLeft, Calendar, Mail, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

/**
 * Get provider initials for avatar fallback
 */
function getProviderInitials(provider: ProviderWithLocations): string {
  if (provider.firstName && provider.lastName) {
    return `${provider.firstName[0]}${provider.lastName[0]}`.toUpperCase();
  }
  return provider.name
    .split(' ')
    .filter((w) => w.length)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Get status badge variant based on provider status
 */
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'pending':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get provider type badge variant
 */
function getProviderTypeVariant(
  providerType: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (providerType.toLowerCase()) {
    case 'dentist':
      return 'default';
    case 'hygienist':
      return 'secondary';
    case 'specialist':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Fetch provider data with proper authentication and multi-tenant security
 */
async function getProviderData(providerId: string): Promise<ProviderWithLocations | null> {
  // 1. Authentication & Session Validation
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Get user details from database to check role and clinic association
  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      id: true,
      role: true,
      clinicId: true,
    },
  });

  if (!dbUser) {
    redirect('/login?error=user_not_found');
  }

  // Check if user is system admin
  const isSystemAdmin = dbUser.role === 'system_admin';
  const clinicId = dbUser.clinicId || undefined;

  // Only require clinic association for non-system admins
  if (!(clinicId || isSystemAdmin)) {
    redirect('/login?error=no_clinic_associated');
  }

  // 2. Fetch provider with multi-tenant security
  try {
    const provider = await prisma.provider.findFirst({
      where: {
        id: providerId,
        // Apply multi-tenant filtering for non-system admins
        ...(isSystemAdmin ? {} : { clinicId }),
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
      return null;
    }

    // Transform to match ProviderWithLocations interface
    return {
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
  } catch (error) {
    console.error('Error fetching provider:', error);
    return null;
  }
}

/**
 * Provider Detail Page - Individual provider dashboard with KPI metrics
 *
 * Implements AC1: Provider Detail Page Navigation from Story 1.1
 */
export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;

  // Validate providerId format (basic UUID validation)
  if (!providerId || typeof providerId !== 'string') {
    notFound();
  }

  // Fetch provider data
  const provider = await getProviderData(providerId);

  if (!provider) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header with breadcrumb navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/providers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Providers
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{provider.name}</h1>
            <p className="text-muted-foreground">Provider Dashboard & Performance Metrics</p>
          </div>
        </div>

        {/* Provider Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage alt={provider.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-lg">
                    {getProviderInitials(provider)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{provider.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getProviderTypeVariant(provider.providerType)}>
                      {provider.providerType}
                    </Badge>
                    <Badge variant={getStatusVariant(provider.status)}>{provider.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </h3>
                {provider.email ? (
                  <a
                    href={`mailto:${provider.email}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {provider.email}
                  </a>
                ) : (
                  <span className="text-gray-500 text-sm">No email provided</span>
                )}
              </div>

              {/* Clinic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Clinic
                </h3>
                <span className="text-sm">{provider.clinic.name}</span>
              </div>

              {/* Location Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Locations
                </h3>
                <div className="text-sm">
                  <span className="font-medium">{provider._count.locations}</span> location
                  {provider._count.locations !== 1 ? 's' : ''}
                  {provider.primaryLocation && (
                    <div className="text-gray-600 mt-1">
                      Primary: {provider.primaryLocation.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Production Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Production Records
                </h3>
                <div className="text-sm space-y-1">
                  <div>Hygiene: {provider._count.hygieneProduction}</div>
                  <div>Dentist: {provider._count.dentistProduction}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Detail Card */}
        {provider.locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Location Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {provider.locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{location.locationName}</h4>
                        {location.isPrimary && (
                          <Badge variant="outline" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      {location.locationAddress && (
                        <p className="text-sm text-gray-600 mt-1">{location.locationAddress}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Since {new Date(location.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Dashboard (AC2) - Comprehensive provider performance metrics */}
        <ProviderKPIDashboard
          providerId={provider.id}
          initialParams={{
            period: 'monthly',
            includeComparisons: true,
            includeTrends: true,
          }}
        />

        {/* Placeholder for Chart Visualizations (AC3) */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Charts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Interactive charts and visualizations coming soon...
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-8 border rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="h-32 w-full mb-4" />
                  <p className="text-sm text-gray-600">Production Trends Chart</p>
                </div>
              </div>
              <div className="p-8 border rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="h-32 w-full mb-4" />
                  <p className="text-sm text-gray-600">Goal Achievement Chart</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
