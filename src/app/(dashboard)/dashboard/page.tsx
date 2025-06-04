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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { getAuthContext } from "@/lib/database/auth-context";
import { prisma } from "@/lib/database/prisma";
import { Suspense } from "react";
import DashboardClient from "./dashboard-client";

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
  clinic,
}: {
  authContext: any;
  clinic: any;
}) {
  // Prepare initial data for client component
  const initialData = {
    clinic,
    isSystemAdmin: authContext.isSystemAdmin,
    selectedClinicId: authContext.selectedClinicId,
    userId: authContext.userId,
  };

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

      {/* Main Dashboard Content */}
      {clinic ? (
        <DashboardClient initialData={initialData} />
      ) : authContext.isSystemAdmin && authContext.selectedClinicId === "all" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Clinics Overview</h2>
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
