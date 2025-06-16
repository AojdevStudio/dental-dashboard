import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

/**
 * MetricCardSkeleton - Loading state for metric cards
 */
export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

/**
 * ChartSkeleton - Loading state for charts
 */
export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="h-[350px] w-full relative">
          {/* Chart bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 h-full px-8">
            {[0, 1, 2, 3, 4, 5, 6].map((id) => (
              <Skeleton
                key={`chart-bar-${id}`}
                className="flex-1"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * TableSkeleton - Loading state for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      {/* Table header */}
      <div className="border-b">
        <div className="flex gap-4 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }, (_, i) => i).map((id) => (
        <div key={`table-row-${id}`} className="border-b">
          <div className="flex gap-4 p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton - Full dashboard loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((id) => (
          <MetricCardSkeleton key={`dashboard-metric-${id}`} />
        ))}
      </div>

      {/* Chart and table */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <TableSkeleton rows={3} />
        </Card>
      </div>
    </div>
  );
}

/**
 * FormSkeleton - Loading state for forms
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }, (_, i) => i).map((id) => (
        <div key={`form-field-${id}`} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * UserCardSkeleton - Loading state for user cards
 */
export function UserCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </Card>
  );
}

/**
 * GoalCardSkeleton - Loading state for goal cards
 */
export function GoalCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}

/**
 * ProviderListSkeleton - Loading state for provider lists
 */
export function ProviderListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }, (_, i) => i).map((id) => (
        <div key={`provider-item-${id}`} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
