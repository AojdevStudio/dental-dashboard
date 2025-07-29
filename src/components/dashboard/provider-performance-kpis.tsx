/**
 * @fileoverview Performance KPI display component for provider dashboard.
 *
 * Displays performance metrics including goal achievement, variance analysis,
 * trend calculations, and productivity metrics.
 *
 * Implements Story 1.1 AC2: Performance KPIs display requirements.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { PerformanceKPIs } from '@/lib/types/provider-metrics';
import { cn } from '@/lib/utils';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ProviderPerformanceKPIsProps {
  /** Performance KPI data */
  data: PerformanceKPIs;
  /** Loading state */
  isLoading?: boolean;
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Compact view for smaller displays */
  compact?: boolean;
}

/**
 * Format percentage values
 */
function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number values
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
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
  icon: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}

function KPIMetricCard({
  title,
  value,
  trend,
  icon,
  compact = false,
  children,
}: KPIMetricCardProps) {
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

          {trend && <p className="text-xs text-muted-foreground">{trend.periodLabel}</p>}

          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for performance KPIs
 */
function PerformanceKPIsLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: 4 }, (_, i) => i).map((index) => (
        <Card key={`performance-skeleton-${index}`}>
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
 * Provider Performance KPIs Component
 */
export default function ProviderPerformanceKPIs({
  data,
  isLoading = false,
  showDetails = true,
  compact = false,
}: ProviderPerformanceKPIsProps) {
  if (isLoading) {
    return <PerformanceKPIsLoading compact={compact} />;
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
        {/* Goal Achievement */}
        <KPIMetricCard
          title="Goal Achievement"
          value={formatPercentage(data.goalAchievement.current)}
          trend={data.goalAchievement.trend}
          icon={<Target className="h-4 w-4 text-blue-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">
            {data.goalAchievement.goalsAchieved} of {data.goalAchievement.totalGoals} goals
          </div>
          <Progress value={data.goalAchievement.current} className="h-2 mt-2" />
        </KPIMetricCard>

        {/* Production per Hour */}
        <KPIMetricCard
          title="Production/Hour"
          value={`$${formatNumber(data.productivity.productionPerHour.current)}`}
          trend={data.productivity.productionPerHour.trend}
          icon={<Clock className="h-4 w-4 text-green-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">
            {formatNumber(data.productivity.hoursWorked.current)} hours worked
          </div>
        </KPIMetricCard>

        {/* Utilization Rate */}
        <KPIMetricCard
          title="Utilization Rate"
          value={formatPercentage(data.productivity.utilizationRate.current)}
          trend={data.productivity.utilizationRate.trend}
          icon={<Activity className="h-4 w-4 text-orange-600" />}
          compact={compact}
        >
          <Progress value={data.productivity.utilizationRate.current} className="h-2 mt-2" />
        </KPIMetricCard>

        {/* Variance Score */}
        <KPIMetricCard
          title="Performance Score"
          value="87"
          icon={<Award className="h-4 w-4 text-purple-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">Composite performance metric</div>
        </KPIMetricCard>
      </div>

      {/* Goals Achievement Detail */}
      {showDetails && data.goalAchievement.achievedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goal Achievement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.goalAchievement.achievedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {formatNumber(goal.targetValue)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatPercentage(goal.achievementPercentage)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current: {formatNumber(goal.currentValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variance Analysis */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Production Variance</span>
                </div>
                <div className="text-2xl font-bold">
                  {data.varianceAnalysis.productionVariance.current > 0 ? '+' : ''}
                  {formatPercentage(data.varianceAnalysis.productionVariance.current)}
                </div>
                <div className="text-sm text-muted-foreground">vs target</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Patient Variance</span>
                </div>
                <div className="text-2xl font-bold">
                  {data.varianceAnalysis.patientVariance.current > 0 ? '+' : ''}
                  {formatPercentage(data.varianceAnalysis.patientVariance.current)}
                </div>
                <div className="text-sm text-muted-foreground">vs target</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Appointment Variance</span>
                </div>
                <div className="text-2xl font-bold">
                  {data.varianceAnalysis.appointmentVariance.current > 0 ? '+' : ''}
                  {formatPercentage(data.varianceAnalysis.appointmentVariance.current)}
                </div>
                <div className="text-sm text-muted-foreground">vs target</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productivity Metrics */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productivity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Work Hours Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours Worked</span>
                    <span className="font-medium">
                      {formatNumber(data.productivity.hoursWorked.current)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Production per Hour</span>
                    <span className="font-medium">
                      ${formatNumber(data.productivity.productionPerHour.current)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utilization Rate</span>
                    <span className="font-medium">
                      {formatPercentage(data.productivity.utilizationRate.current)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Performance Indicators</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Goal Achievement</span>
                    <Badge variant={data.goalAchievement.current >= 80 ? 'default' : 'secondary'}>
                      {formatPercentage(data.goalAchievement.current)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Productivity Trend</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.productivity.productionPerHour.trend?.direction)}
                      <span
                        className={getTrendColor(
                          data.productivity.productionPerHour.trend?.direction
                        )}
                      >
                        {data.productivity.productionPerHour.trend?.percentage
                          ? formatPercentage(
                              data.productivity.productionPerHour.trend.percentage,
                              0
                            )
                          : 'No change'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Utilization Trend</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.productivity.utilizationRate.trend?.direction)}
                      <span
                        className={getTrendColor(
                          data.productivity.utilizationRate.trend?.direction
                        )}
                      >
                        {data.productivity.utilizationRate.trend?.percentage
                          ? formatPercentage(data.productivity.utilizationRate.trend.percentage, 0)
                          : 'No change'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
