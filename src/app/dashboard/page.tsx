import { Suspense } from "react";
import { DashboardExample } from "@/components/dashboards";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardExample />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    </div>
  );
}
