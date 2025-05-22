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

import { Suspense } from "react";
import { DashboardExample } from "@/components/dashboards";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard Page Component
 * 
 * Renders the main dashboard view with metrics and visualizations.
 * Uses Suspense for data loading with a skeleton fallback UI.
 * 
 * @returns {JSX.Element} The rendered dashboard page with data visualization components
 */
export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardExample />
      </Suspense>
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
      <Skeleton className="h-8 w-64" />
      
      {/* Summary metrics placeholder */}
      <Skeleton className="h-[120px] w-full" />
      
      {/* Main chart placeholder */}
      <Skeleton className="h-[200px] w-full" />
      
      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    </div>
  );
}
