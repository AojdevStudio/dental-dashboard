/**
 * Dashboard Main Page
 *
 * This page serves as the main entry point for the dashboard section of the application.
 * It displays an overview of key metrics, recent activities, and important information
 * that users need to monitor their dental practice performance.
 *
 * The page uses React's Suspense for data loading, providing a skeleton UI while
 * the dashboard data is being fetched. This improves perceived performance and
 * user experience by showing a loading state that matches the final UI structure.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';
import { type AuthContext, getAuthContext } from '@/lib/database/auth-context';
import { prisma } from '@/lib/database/prisma';
import type { Prisma } from '@prisma/client';
import { Suspense } from 'react';
import DashboardClient from './dashboard-client';

/**
 * Dashboard Page Component
 *
 * Renders the main dashboard view with metrics and visualizations.
 * Uses Suspense for data loading with a skeleton fallback UI.
 *
 * @returns {JSX.Element} The rendered dashboard page with data visualization components
 */
export default async function DashboardPage() {
  let authContext: AuthContext | null;

  try {
    authContext = await getAuthContext();
  } catch (error) {
    return (
      <Card class="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            An error occurred while verifying your authentication. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown authentication error'}
          </p>
          <div class="flex gap-2">
            <a href="/login" class="text-primary hover:underline">
              Return to Login
            </a>
            <span class="text-muted-foreground">•</span>
            <a href="/dashboard" class="text-primary hover:underline">
              Retry
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!authContext) {
    return (
      <Card class="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please log in to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/login" class="text-primary hover:underline">
            Return to Login
          </a>
        </CardContent>
      </Card>
    );
  }

  // Get the current clinic information
  let currentClinic: ClinicWithCounts | null = null;
  if (authContext.selectedClinicId && authContext.selectedClinicId !== 'all') {
    try {
      currentClinic = await prisma.clinic.findUnique({
        where: { id: authContext.selectedClinicId },
        select: {
          id: true,
          name: true,
          location: true,
          _count: {
            select: {
              users: true,
              providers: true,
              metrics: true,
            },
          },
        },
      });
    } catch (_error) {
      // Continue with currentClinic as null - the UI will handle the fallback
      // This ensures the app remains stable even if the clinic query fails
    }
  }

  return (
    <div class="w-full space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent authContext={authContext} clinic={currentClinic} />
      </Suspense>
    </div>
  );
}

// Type for clinic with counts
type ClinicWithCounts = Prisma.ClinicGetPayload<{
  select: {
    id: true;
    name: true;
    location: true;
    _count: {
      select: {
        users: true;
        providers: true;
        metrics: true;
      };
    };
  };
}>;

/**
 * Dashboard Content Component
 *
 * Displays the main dashboard content with clinic-specific information.
 *
 * @returns {JSX.Element} The rendered dashboard content
 */
async function DashboardContent({
  authContext,
  clinic,
}: {
  authContext: AuthContext;
  clinic: ClinicWithCounts | null;
}) {
  // Prepare initial data for client component
  const initialData = {
    clinic,
    isSystemAdmin: authContext.isSystemAdmin ?? false,
    selectedClinicId: authContext.selectedClinicId ?? 'all',
    userId: authContext.userId,
  };

  return (
    <div class="w-full space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground mt-2">
          {authContext.isSystemAdmin && authContext.selectedClinicId === 'all'
            ? 'Viewing all clinics'
            : clinic
              ? `${clinic.name} - ${clinic.location}`
              : 'Select a clinic to view metrics'}
        </p>
      </div>

      {/* Main Dashboard Content */}
      {clinic ? (
        <DashboardClient initialData={initialData} />
      ) : authContext.isSystemAdmin && authContext.selectedClinicId === 'all' ? (
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">All Clinics Overview</h2>
          <AllClinicsOverview />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Clinic Selected</CardTitle>
            <CardDescription>
              Please select a clinic from the dropdown above to view metrics and data.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

/**
 * All Clinics Overview Component
 *
 * Shows a summary of all clinics for system administrators.
 *
 * @returns {JSX.Element} The rendered all clinics overview
 */
async function AllClinicsOverview() {
  let clinics: ClinicWithCounts[];

  try {
    clinics = await prisma.clinic.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        location: true,
        _count: {
          select: {
            users: true,
            providers: true,
            metrics: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    // Return error state when clinic data cannot be fetched
    return (
      <Card class="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Data Loading Error</CardTitle>
          <CardDescription>
            Unable to load clinics data. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown database error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clinics.map((clinic) => (
        <Card key={clinic.id}>
          <CardHeader>
            <CardTitle class="text-lg">{clinic.name}</CardTitle>
            <CardDescription>{clinic.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Users:</span>
                <span class="font-medium">{clinic._count.users}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Providers:</span>
                <span class="font-medium">{clinic._count.providers}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Metrics:</span>
                <span class="font-medium">{clinic._count.metrics}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
