"use client";

import React from "react";
import { FilterBar } from "./filters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFilterParams } from "@/hooks/useFilterStore";
import { Separator } from "@/components/ui/separator";

export function DashboardExample() {
  // Get filter params for queries
  const filterParams = useFilterParams();

  // In a real application, you would use these filter params in your React Query hooks
  // For example:
  // const { data: metrics } = useMetricsQuery(filterParams);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dental Practice Dashboard</h1>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Display current filter parameters */}
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

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* In a real application, these cards would display real metrics based on the filtered data */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Filtered appointment metrics would appear here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Filtered revenue metrics would appear here</p>
          </CardContent>
        </Card>

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
