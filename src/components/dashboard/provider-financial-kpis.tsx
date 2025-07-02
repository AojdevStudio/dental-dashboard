/**
 * @fileoverview Financial KPI display component for provider dashboard.
 *
 * Displays financial performance metrics including production totals,
 * collection rates, overhead percentages, and related analytics.
 *
 * Implements Story 1.1 AC2: Financial KPIs display requirements.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { FinancialKPIs } from '@/lib/types/provider-metrics';
import { cn } from '@/lib/utils';
import {
  Calendar,
  DollarSign,
  Minus,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ProviderFinancialKPIsProps {
  /** Financial KPI data */
  data: FinancialKPIs;
  /** Loading state */
  isLoading?: boolean;
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Compact view for smaller displays */
  compact?: boolean;
}

/**
 * Format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage values
 */
function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get trend icon based on direction
 */
function getTrendIcon(direction?: 'up' | 'down' | 'neutral') {
  switch (direction) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Get trend color classes
 */
function getTrendColor(direction?: 'up' | 'down' | 'neutral') {
  switch (direction) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
}

/**
 * Individual KPI metric card
 */
interface KPIMetricCardProps {
  title: string;
  value: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    periodLabel: string;
  };
  goal?: number;
  current?: number;
  icon: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}

function KPIMetricCard({
  title,
  value,
  trend,
  goal,
  current,
  icon,
  compact = false,
  children,
}: KPIMetricCardProps) {
  const progressValue = goal && current ? Math.min((current / goal) * 100, 100) : undefined;

  return (
    <Card className={cn('transition-all hover:shadow-md', compact && 'p-2')}>
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className={cn('text-sm font-medium', compact && 'text-xs')}>
              {title}
            </CardTitle>
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(trend.direction)}
              <span className={cn('text-xs font-medium', getTrendColor(trend.direction))}>
                {formatPercentage(trend.percentage, 0)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', compact && 'pt-0 px-2 pb-2')}>
        <div className="space-y-2">
          <div className={cn('text-2xl font-bold', compact && 'text-lg')}>{value}</div>

          {goal && current && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Goal: {formatCurrency(goal)}</span>
                <span>{formatPercentage(progressValue || 0, 0)}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}

          {trend && <p className="text-xs text-muted-foreground">{trend.periodLabel}</p>}

          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for financial KPIs
 */
function FinancialKPIsLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: 4 }, (_, i) => i).map((index) => (
        <Card key={`financial-skeleton-${index}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-2 w-full mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Provider Financial KPIs Component
 */
export default function ProviderFinancialKPIs({
  data,
  isLoading = false,
  showDetails = true,
  compact = false,
}: ProviderFinancialKPIsProps) {
  if (isLoading) {
    return <FinancialKPIsLoading compact={compact} />;
  }

  return (
    <div className="space-y-6">
      {/* Main KPI Grid */}
      <div
        className={cn(
          'grid gap-4',
          compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {/* Production Total */}
        <KPIMetricCard
          title="Total Production"
          value={formatCurrency(data.productionTotal.current)}
          trend={data.productionTotal.trend}
          goal={data.productionTotal.goal}
          current={data.productionTotal.current}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          compact={compact}
        />

        {/* Collection Rate */}
        <KPIMetricCard
          title="Collection Rate"
          value={formatPercentage(data.collectionRate.current)}
          trend={data.collectionRate.trend}
          icon={<Target className="h-4 w-4 text-green-600" />}
          compact={compact}
        >
          {showDetails && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Collections: {formatCurrency(data.collectionRate.collections)}</div>
              <div>Adjustments: {formatCurrency(data.collectionRate.adjustments)}</div>
            </div>
          )}
        </KPIMetricCard>

        {/* Overhead Percentage */}
        <KPIMetricCard
          title="Overhead %"
          value={formatPercentage(data.overheadPercentage.current)}
          trend={data.overheadPercentage.trend}
          icon={<PieChart className="h-4 w-4 text-orange-600" />}
          compact={compact}
        >
          {showDetails && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Fixed: {formatCurrency(data.overheadPercentage.fixedCosts)}</div>
              <div>Variable: {formatCurrency(data.overheadPercentage.variableCosts)}</div>
            </div>
          )}
        </KPIMetricCard>

        {/* Daily Average */}
        <KPIMetricCard
          title="Daily Average"
          value={formatCurrency(data.avgDailyProduction.current)}
          trend={data.avgDailyProduction.trend}
          icon={<Calendar className="h-4 w-4 text-purple-600" />}
          compact={compact}
        />
      </div>

      {/* Location Breakdown */}
      {showDetails &&
        data.productionTotal.byLocation &&
        data.productionTotal.byLocation.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.productionTotal.byLocation.map((location) => (
                  <div
                    key={location.locationId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{location.locationName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(location.percentage)} of total production
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(location.amount)}</div>
                      <Progress value={location.percentage} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Financial Performance Summary */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(data.productionTotal.current)}
                </div>
                <div className="text-sm text-muted-foreground">Total Production</div>
                {data.productionTotal.variance && (
                  <Badge
                    variant={data.productionTotal.variance.amount >= 0 ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {data.productionTotal.variance.amount >= 0 ? '+' : ''}
                    {formatCurrency(data.productionTotal.variance.amount)} vs goal
                  </Badge>
                )}
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(data.collectionRate.collections)}
                </div>
                <div className="text-sm text-muted-foreground">Collections</div>
                <div className="text-sm text-green-600 mt-1">
                  {formatPercentage(data.collectionRate.current)} rate
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {formatCurrency(data.overheadPercentage.totalOverhead)}
                </div>
                <div className="text-sm text-muted-foreground">Total Overhead</div>
                <div className="text-sm text-orange-600 mt-1">
                  {formatPercentage(data.overheadPercentage.current)} of production
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
