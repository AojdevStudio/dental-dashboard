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

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/database/auth-context";
import { prisma } from "@/lib/database/prisma";
import { Suspense } from "react";

/**
 * Dashboard Page Component
 *
 * Renders the main dashboard view with metrics and visualizations.
 * Uses Suspense for data loading with a skeleton fallback UI.
 *
 * @returns {JSX.Element} The rendered dashboard page with data visualization components
 */
export default async function DashboardPage() {
  const authContext = await getAuthContext();
  
  if (!authContext) {
    return <div>Unauthorized</div>;
  }

  // Get the current clinic information
  let currentClinic = null;
  if (authContext.selectedClinicId && authContext.selectedClinicId !== "all") {
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
  }

  return (
    <div className="w-full space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent authContext={authContext} clinic={currentClinic} />
      </Suspense>
    </div>
  );
}

/**
 * Dashboard Content Component
 *
 * Displays the main dashboard content with clinic-specific information.
 *
 * @returns {JSX.Element} The rendered dashboard content
 */
async function DashboardContent({ 
  authContext, 
  clinic 
}: { 
  authContext: any; 
  clinic: any;
}) {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {authContext.isSystemAdmin && authContext.selectedClinicId === "all" 
            ? "Viewing all clinics" 
            : clinic 
              ? `${clinic.name} - ${clinic.location}`
              : "Select a clinic to view metrics"}
        </p>
      </div>

      {/* Summary Cards */}
      {clinic && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinic._count.users}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinic._count.providers}</div>
              <p className="text-xs text-muted-foreground">Dentists and hygienists</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metrics Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinic._count.metrics}</div>
              <p className="text-xs text-muted-foreground">Data points collected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">Active</div>
              <p className="text-xs text-muted-foreground">Clinic operational status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Clinics View for System Admin */}
      {authContext.isSystemAdmin && authContext.selectedClinicId === "all" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Clinics Overview</h2>
          <AllClinicsOverview />
        </div>
      )}

      {/* Empty State */}
      {!clinic && !authContext.isSystemAdmin && (
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
  const clinics = await prisma.clinic.findMany({
    where: { status: "active" },
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
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clinics.map((clinic) => (
        <Card key={clinic.id}>
          <CardHeader>
            <CardTitle className="text-lg">{clinic.name}</CardTitle>
            <CardDescription>{clinic.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users:</span>
                <span className="font-medium">{clinic._count.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Providers:</span>
                <span className="font-medium">{clinic._count.providers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metrics:</span>
                <span className="font-medium">{clinic._count.metrics}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton Component
 *
 * Provides a loading placeholder UI that mimics the structure of the actual dashboard.
 * This component is shown while the dashboard data is being fetched, giving users
 * visual feedback about the loading state without jarring layout shifts when data arrives.
 *
 * The skeleton includes placeholders for:
 * - Dashboard title
 * - Summary metrics panel
 * - Main chart or visualization
 * - Grid of metric cards
 *
 * @returns {JSX.Element} The rendered skeleton UI for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Title placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Main content area */}
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}