/**
 * @fileoverview KPI Chart Component
 *
 * This file implements a reusable chart component for displaying key performance
 * indicators (KPIs) with trend visualization in the dashboard interface.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";

/**
 * Sample data for chart visualization
 * This would be replaced with actual data from an API in production.
 */
const sampleChartData = {
  daily: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2025, 4, i + 1).toISOString().split("T")[0],
    value: Math.floor(Math.random() * 100) + 50,
  })),
  weekly: Array.from({ length: 12 }, (_, i) => ({
    date: `Week ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 50,
  })),
  monthly: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2025, i, 1).toLocaleString("default", { month: "short" }),
    value: Math.floor(Math.random() * 100) + 50,
  })),
};

/**
 * Interface for KPIChart component properties
 *
 * @property {string} title - Title of the KPI chart
 * @property {string} [subtitle] - Optional subtitle or description
 * @property {boolean} [isLoading] - Whether the chart is in loading state
 * @property {Array<{date: string, value: number}>} [data] - Chart data points
 * @property {string} [defaultView] - Default time period view ('daily', 'weekly', 'monthly')
 * @property {string} [valuePrefix] - Prefix for value display (e.g., '$')
 * @property {string} [valueSuffix] - Suffix for value display (e.g., '%')
 */
interface KPIChartProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  data?: Array<{ date: string; value: number }>;
  defaultView?: "daily" | "weekly" | "monthly";
  valuePrefix?: string;
  valueSuffix?: string;
}

/**
 * KPI Chart Component
 *
 * A chart component for visualizing key performance indicators and metrics trends.
 * Features include:
 * - Time period tabs (daily, weekly, monthly)
 * - Line chart visualization
 * - Loading state
 * - Value formatting with optional prefix/suffix
 *
 * @param {KPIChartProps} props - Component properties
 * @returns {JSX.Element} The rendered KPI chart component
 */
export function KPIChart({
  title,
  subtitle,
  isLoading = false,
  data,
  defaultView = "monthly",
  valuePrefix = "",
  valueSuffix = "",
}: KPIChartProps) {
  // If no data is provided, use the sample data
  const chartData = data || sampleChartData;

  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          {subtitle && <Skeleton className="h-4 w-60 mt-1" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultView}>
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-[200px]">
            <ChartPlaceholder
              data={chartData.daily}
              valuePrefix={valuePrefix}
              valueSuffix={valueSuffix}
            />
          </TabsContent>

          <TabsContent value="weekly" className="h-[200px]">
            <ChartPlaceholder
              data={chartData.weekly}
              valuePrefix={valuePrefix}
              valueSuffix={valueSuffix}
            />
          </TabsContent>

          <TabsContent value="monthly" className="h-[200px]">
            <ChartPlaceholder
              data={chartData.monthly}
              valuePrefix={valuePrefix}
              valueSuffix={valueSuffix}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Chart Placeholder Component
 *
 * A placeholder component for chart visualization. In a production environment,
 * this would be replaced with an actual chart library implementation like Recharts.
 *
 * @param {Object} props - Component properties
 * @param {Array<{date: string, value: number}>} props.data - Chart data points
 * @param {string} [props.valuePrefix] - Prefix for value display
 * @param {string} [props.valueSuffix] - Suffix for value display
 * @returns {JSX.Element} The rendered chart placeholder
 */
function ChartPlaceholder({
  data,
  valuePrefix = "",
  valueSuffix = "",
}: {
  data: Array<{ date: string; value: number }>;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  // Find the min and max values for scaling
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm text-muted-foreground mb-2">
        Placeholder chart: In production, use a chart library like Recharts
      </div>

      <div className="flex items-end h-full space-x-1">
        {data.map((point, i) => {
          // Scale the bar height based on the value
          const heightPercent =
            range === 0
              ? 50 // If all values are the same, use 50% height
              : ((point.value - min) / range) * 80 + 20; // Scale from 20% to 100%

          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="bg-primary/90 w-full rounded-t"
                style={{ height: `${heightPercent}%` }}
                title={`${point.date}: ${valuePrefix}${point.value}${valueSuffix}`}
              />
              {/* Only show every nth label to avoid overcrowding */}
              {i % Math.ceil(data.length / 10) === 0 && (
                <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                  {point.date}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
