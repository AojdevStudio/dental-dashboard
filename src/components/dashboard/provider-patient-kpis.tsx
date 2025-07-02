/**
 * @fileoverview Patient KPI display component for provider dashboard.
 *
 * Displays patient metrics including patient count, appointment efficiency,
 * case acceptance rates, and satisfaction metrics.
 *
 * Implements Story 1.1 AC2: Patient KPIs display requirements.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { PatientKPIs } from '@/lib/types/provider-metrics';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CheckCircle,
  Clock,
  Minus,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ProviderPatientKPIsProps {
  /** Patient KPI data */
  data: PatientKPIs;
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
 * Loading skeleton for patient KPIs
 */
function PatientKPIsLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: 4 }, (_, i) => i).map((index) => (
        <Card key={`patient-skeleton-${index}`}>
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
 * Provider Patient KPIs Component
 */
export default function ProviderPatientKPIs({
  data,
  isLoading = false,
  showDetails = true,
  compact = false,
}: ProviderPatientKPIsProps) {
  if (isLoading) {
    return <PatientKPIsLoading compact={compact} />;
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
        {/* Patient Count */}
        <KPIMetricCard
          title="Total Patients"
          value={formatNumber(data.patientCount.current)}
          trend={data.patientCount.trend}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground space-y-1">
            <div>New: {formatNumber(data.patientCount.newPatients)}</div>
            <div>Returning: {formatNumber(data.patientCount.returningPatients)}</div>
          </div>
        </KPIMetricCard>

        {/* Appointment Efficiency */}
        <KPIMetricCard
          title="Completion Rate"
          value={formatPercentage(
            (data.appointmentEfficiency.completedAppointments.current /
              Math.max(data.appointmentEfficiency.scheduledAppointments.current, 1)) *
              100
          )}
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">
            {formatNumber(data.appointmentEfficiency.completedAppointments.current)} of{' '}
            {formatNumber(data.appointmentEfficiency.scheduledAppointments.current)} scheduled
          </div>
        </KPIMetricCard>

        {/* Case Acceptance Rate */}
        <KPIMetricCard
          title="Case Acceptance"
          value={formatPercentage(data.caseAcceptanceRates.caseAcceptanceRate.current)}
          trend={data.caseAcceptanceRates.caseAcceptanceRate.trend}
          icon={<Calendar className="h-4 w-4 text-orange-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">
            {formatNumber(data.caseAcceptanceRates.treatmentPlansAcceptedCount.current)} accepted
          </div>
        </KPIMetricCard>

        {/* Patient Satisfaction */}
        <KPIMetricCard
          title="Satisfaction"
          value={`${data.patientSatisfaction.averageRating.current.toFixed(1)}/5.0`}
          trend={data.patientSatisfaction.averageRating.trend}
          icon={<Star className="h-4 w-4 text-purple-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">
            {formatNumber(data.patientSatisfaction.reviewCount.current)} reviews
          </div>
        </KPIMetricCard>
      </div>

      {/* Appointment Efficiency Detail */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Efficiency Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Appointment Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span className="font-medium">
                      {formatNumber(data.appointmentEfficiency.scheduledAppointments.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Completed
                    </span>
                    <span className="font-medium text-green-600">
                      {formatNumber(data.appointmentEfficiency.completedAppointments.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Cancelled
                    </span>
                    <span className="font-medium text-red-600">
                      {formatNumber(data.appointmentEfficiency.cancelledAppointments.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      No-shows
                    </span>
                    <span className="font-medium text-orange-600">
                      {formatPercentage(data.appointmentEfficiency.noshowRate.current)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Performance Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>On-time Rate</span>
                      <span>{formatPercentage(data.appointmentEfficiency.onTimeRate.current)}</span>
                    </div>
                    <Progress
                      value={data.appointmentEfficiency.onTimeRate.current}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span>
                        {formatPercentage(
                          (data.appointmentEfficiency.completedAppointments.current /
                            Math.max(data.appointmentEfficiency.scheduledAppointments.current, 1)) *
                            100
                        )}
                      </span>
                    </div>
                    <Progress
                      value={
                        (data.appointmentEfficiency.completedAppointments.current /
                          Math.max(data.appointmentEfficiency.scheduledAppointments.current, 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Patient Retention</span>
                      <span>{formatPercentage(data.patientCount.retentionRate)}</span>
                    </div>
                    <Progress value={data.patientCount.retentionRate} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case Acceptance Analysis */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Acceptance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Treatment Plans</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presented</span>
                    <span className="font-medium">
                      {formatNumber(data.caseAcceptanceRates.treatmentPlansPresentedCount.current)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accepted</span>
                    <span className="font-medium text-green-600">
                      {formatNumber(data.caseAcceptanceRates.treatmentPlansAcceptedCount.current)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acceptance Rate</span>
                    <Badge
                      variant={
                        data.caseAcceptanceRates.caseAcceptanceRate.current >= 70
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {formatPercentage(data.caseAcceptanceRates.caseAcceptanceRate.current)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Financial Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Case Value</span>
                    <span className="font-medium">
                      ${formatNumber(data.caseAcceptanceRates.averageCaseValue.current)}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {formatPercentage(data.caseAcceptanceRates.caseAcceptanceRate.current)}
                    </div>
                    <div className="text-sm text-blue-600">Overall Acceptance Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Satisfaction Details */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Satisfaction Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-700 mb-2">
                  <Star className="h-6 w-6 fill-current" />
                  {data.patientSatisfaction.averageRating.current.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Based on {formatNumber(data.patientSatisfaction.reviewCount.current)} reviews
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {formatPercentage(data.patientSatisfaction.recommendationRate.current)}
                </div>
                <div className="text-sm text-muted-foreground">Recommendation Rate</div>
                <div className="text-xs text-green-600 mt-1">Patients who would recommend</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {formatPercentage(data.patientCount.retentionRate)}
                </div>
                <div className="text-sm text-muted-foreground">Retention Rate</div>
                <div className="text-xs text-blue-600 mt-1">Returning patients</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
