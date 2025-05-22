/**
 * @fileoverview Dashboard Example Component
 *
 * This file implements an example dashboard component that demonstrates the structure
 * and layout of a dental practice dashboard. It shows how to integrate the filter bar
 * and display metrics based on the selected filters. In a production environment,
 * this would be connected to real data sources and metrics.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFilterParams } from "@/hooks/useFilterStore";
import React from "react";
import { FilterBar } from "./filters";

/**
 * Dashboard Example Component
 *
 * A demonstration dashboard that showcases the structure and layout of a dental practice
 * dashboard interface. It includes:
 * - A filter bar for selecting clinics, providers, and time periods
 * - A display of the current filter parameters
 * - Example metric cards that would show filtered data in a real application
 *
 * This component serves as a template and reference implementation for building
 * actual dashboard views with real data integration.
 *
 * @returns {JSX.Element} The rendered dashboard example component
 */
export function DashboardExample() {
  // Get filter params from the global filter store for use in data queries
  const filterParams = useFilterParams();

  // In a real application, you would use these filter params in your React Query hooks
  // For example:
  // const { data: metrics } = useMetricsQuery(filterParams);

  /**
   * Render the dashboard interface
   *
   * The dashboard layout consists of:
   * 1. A header with the dashboard title
   * 2. A filter bar for selecting data parameters
   * 3. A debug card showing the current filter state
   * 4. A grid of metric cards that would display actual data in production
   *
   * The responsive grid layout adjusts based on screen size:
   * - 1 column on mobile (default)
   * - 2 columns on medium screens (md breakpoint)
   * - 3 columns on large screens (lg breakpoint)
   *
   * @returns {JSX.Element} The rendered dashboard UI
   */
  return (
    <div className="w-full space-y-6">
      {/* Dashboard header with title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dental Practice Dashboard</h1>
      </div>

      {/* Filter Bar component for selecting clinics, providers, and time periods */}
      <FilterBar />

      {/* Debug card displaying the current filter parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Current Filter Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-secondary p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(filterParams, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Visual separator between filter display and metric cards */}
      <Separator />

      {/* Responsive grid of metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Appointments metric card - would display real data in production */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Filtered appointment metrics would appear here</p>
          </CardContent>
        </Card>

        {/* Revenue metric card - would display real data in production */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Filtered revenue metrics would appear here</p>
          </CardContent>
        </Card>

        {/* Patients metric card - would display real data in production */}
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Filtered patient metrics would appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
