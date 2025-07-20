import { ProviderDashboard } from '@/components/dashboard/provider-kpi-dashboard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import type { ProviderWithLocations } from '@/types/providers';
import { ArrowLeft, Mail, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

// Regex constants for provider ID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

interface ProviderDetailPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

/**
 * Validate provider ID format (UUID or slug)
 */
function isValidProviderId(providerId: string): boolean {
  return UUID_REGEX.test(providerId) || SLUG_REGEX.test(providerId);
}

/**
 * Get provider by ID with location details
 */
async function getProviderById(
  providerId: string,
  clinicId?: string
): Promise<ProviderWithLocations | null> {
  const whereClause: { OR: { id: string }[]; clinicId?: string } = {
    OR: [
      { id: providerId },
      // TODO: Add slug support when provider slugs are implemented
    ],
  };

  // Add clinic-based filtering for multi-tenant security
  if (clinicId) {
    whereClause.clinicId = clinicId;
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
      startDate: pl.startDate.toISOString() as string,
      endDate: (pl.endDate?.toISOString() as string) || null,
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
 * Provider Detail Page - Server Component Implementation
 *
 * Displays comprehensive provider information including KPI dashboards
 * and performance visualizations. Resolves 404 issues from provider listing.
 */
export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const resolvedParams = await params;
  const { providerId } = resolvedParams;

  // 1. Validate provider ID format
  if (!isValidProviderId(providerId)) {
    notFound();
  }

  // 2. Authentication & Session Validation
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
      email: true,
      name: true,
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

  // 3. Fetch Provider Data
  const provider = await getProviderById(providerId, isSystemAdmin ? undefined : clinicId);

  if (!provider) {
    notFound();
  }

  // 4. Render Provider Detail Page
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/providers">Providers</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{provider.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild={true}>
              <Link href="/dashboard/providers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Providers
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{provider.name}</h1>
              <p className="text-muted-foreground">
                {provider.providerType.charAt(0).toUpperCase() + provider.providerType.slice(1)}
                {provider.clinic && ` at ${provider.clinic.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Information Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {provider.firstName && provider.lastName
                    ? `${provider.firstName} ${provider.lastName}`
                    : provider.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provider Type</p>
                <p className="font-medium">
                  {provider.providerType.charAt(0).toUpperCase() + provider.providerType.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p
                  className={`font-medium ${
                    provider.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                </p>
              </div>
              {provider.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {provider.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations ({provider._count.locations})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {provider.locations.length > 0 ? (
                <div className="space-y-3">
                  {provider.locations.map((location) => (
                    <div key={location.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{location.locationName}</p>
                        {location.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      {location.locationAddress && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {location.locationAddress}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Status: {location.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No locations assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Production Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
              <CardDescription>Overall production statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">
                  {provider._count.hygieneProduction + provider._count.dentistProduction}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hygiene</p>
                  <p className="font-medium">{provider._count.hygieneProduction}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dentist</p>
                  <p className="font-medium">{provider._count.dentistProduction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider KPI Dashboard */}
        <ProviderDashboard
          providerId={provider.id}
          providerName={provider.name}
          clinicId={provider.clinic?.id}
        />
      </div>
    </div>
  );
}
