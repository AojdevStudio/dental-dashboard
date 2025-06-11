'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { KPICardProps } from '@/lib/types/kpi';
import { cn } from '@/lib/utils';
import { getTrendColor } from '@/lib/utils/color-schemes';
import { motion } from 'framer-motion';
import { Calendar, Info, Minus, Target, TrendingDown, TrendingUp } from 'lucide-react';

export function KPICard({
  data,
  variant = 'default',
  colorScheme = 'default',
  loading = false,
  error = null,
  className,
  onClick,
  showTrend = true,
  showComparison = true,
  showGoal = true,
  formatValue = (value) => value.toString(),
}: KPICardProps) {
  if (loading) {
    return (
      <Card class={cn('relative overflow-hidden', className)}>
        <CardHeader class="space-y-0 pb-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-8 w-24 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-2 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card class={cn('relative overflow-hidden', className)}>
        <CardHeader>
          <CardTitle class="text-destructive">Error</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!data.trend) {
      return null;
    }

    const Icon =
      data.trend.direction === 'up'
        ? TrendingUp
        : data.trend.direction === 'down'
          ? TrendingDown
          : Minus;

    const color = getTrendColor(
      data.trend.direction,
      data.trend.direction === 'up' ? 'positive' : 'negative'
    );

    return (
      <div
        class={cn('flex items-center gap-1 text-sm', {
          'text-green-600': color === '#059669',
          'text-red-600': color === '#DC2626',
          'text-gray-600': data.trend.direction === 'neutral',
        })}
      >
        <Icon class="w-4 h-4" />
        <span>{data.trend.percentage.toFixed(1)}%</span>
      </div>
    );
  };

  const cardContent = (
    <>
      <CardHeader
        class={cn('space-y-0', {
          'pb-2': variant === 'compact',
          'pb-4': variant === 'default',
          'pb-6': variant === 'detailed',
        })}
      >
        <div class="flex items-start justify-between">
          <div class="space-y-1 flex-1">
            <CardTitle
              class={cn('text-sm font-medium text-muted-foreground', {
                'text-xs': variant === 'compact',
              })}
            >
              {data.title}
            </CardTitle>
            <div class="flex items-baseline gap-2">
              <motion.span
                class={cn('font-bold tracking-tight', {
                  'text-2xl': variant === 'compact',
                  'text-3xl': variant === 'default',
                  'text-4xl': variant === 'detailed',
                })}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {formatValue(data.value)}
              </motion.span>
              {data.unit && <span class="text-muted-foreground text-sm">{data.unit}</span>}
            </div>
          </div>
          {data.icon && variant !== 'compact' && (
            <data.icon class="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {showTrend && data.trend && variant !== 'compact' && (
          <div class="mt-2">{getTrendIcon()}</div>
        )}
      </CardHeader>

      <CardContent
        class={cn({
          'pb-2': variant === 'compact',
          'pb-4': variant === 'default',
          'pb-6': variant === 'detailed',
        })}
      >
        {showComparison && data.comparison && variant !== 'compact' && (
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">
                vs {data.comparison.customPeriodLabel || `Last ${data.comparison.period}`}
              </span>
              <span class="font-medium">{formatValue(data.comparison.previousValue)}</span>
            </div>
          </div>
        )}

        {showGoal && data.goal && (
          <div class="space-y-2 mt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground flex items-center gap-1">
                <Target class="w-3 h-3" />
                {data.goal.label || 'Goal'}
              </span>
              <span class="font-medium">{formatValue(data.goal.value)}</span>
            </div>
            <Progress
              value={data.goal.progress}
              class="h-2"
              aria-label={`Goal progress: ${data.goal.progress}%`}
            />
            <p class="text-xs text-muted-foreground text-right">{data.goal.progress}% achieved</p>
          </div>
        )}

        {variant === 'detailed' && data.description && (
          <p class="text-sm text-muted-foreground mt-4 flex items-start gap-1">
            <Info class="w-3 h-3 mt-0.5 flex-shrink-0" />
            {data.description}
          </p>
        )}

        {data.lastUpdated && variant !== 'compact' && (
          <div class="flex items-center gap-1 text-xs text-muted-foreground mt-4">
            <Calendar class="w-3 h-3" />
            <span>Updated {new Date(data.lastUpdated).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </>
  );

  const cardClasses = cn(
    'relative overflow-hidden transition-all duration-200 h-full',
    {
      'hover:shadow-md cursor-pointer': onClick,
      'border-green-200 bg-green-50/30': colorScheme === 'success',
      'border-amber-200 bg-amber-50/30': colorScheme === 'warning',
      'border-red-200 bg-red-50/30': colorScheme === 'error',
    },
    className
  );

  if (onClick) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card class={cardClasses} onClick={onClick}>
          {cardContent}
        </Card>
      </motion.div>
    );
  }

  return <Card class={cardClasses}>{cardContent}</Card>;
}
