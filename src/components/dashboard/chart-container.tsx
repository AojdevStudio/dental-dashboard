'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartContainerProps } from '@/lib/types/charts';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function ChartContainer({
  title,
  subtitle,
  config,
  loading = false,
  error = null,
  className,
  style,
  children,
  headerActions,
}: ChartContainerProps & { children: React.ReactNode }) {
  if (loading) {
    return (
      <Card class={cn('w-full', className)} style={style}>
        <CardHeader>
          {title && <Skeleton class="h-6 w-48" />}
          {subtitle && <Skeleton class="h-4 w-64 mt-2" />}
        </CardHeader>
        <CardContent>
          <Skeleton class="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card class={cn('w-full', className)} style={style}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error loading chart</AlertTitle>
            <AlertDescription>
              {error.message || 'An unexpected error occurred while loading the chart data.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card class={cn('w-full', className)} style={style}>
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {headerActions && <div class="flex items-center space-x-2">{headerActions}</div>}
      </CardHeader>
      <CardContent class="p-0 pb-4">{children}</CardContent>
    </Card>
  );
}
