import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

/**
 * Loading component for provider detail page
 *
 * Provides structured loading states while provider data is being fetched
 */
export default function ProviderDetailLoading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header with breadcrumb navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" disabled={true}>
            <ArrowLeft className="h-4 w-4" />
            Back to Providers
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Provider Info Card Loading */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-40 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contact Information Loading */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Clinic Information Loading */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-28" />
              </div>

              {/* Location Summary Loading */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Production Summary Loading */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Detail Card Loading */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ key: 'location-primary' }, { key: 'location-secondary' }].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI Dashboard Loading */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'kpi-production' },
                { key: 'kpi-goals' },
                { key: 'kpi-variance' },
                { key: 'kpi-performance' },
              ].map((item) => (
                <div key={item.key} className="p-4 border rounded-lg bg-gray-50">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts Loading */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[{ key: 'chart-production' }, { key: 'chart-trends' }].map((item) => (
                <div
                  key={item.key}
                  className="p-8 border rounded-lg bg-gray-50 flex items-center justify-center"
                >
                  <div className="text-center w-full">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
