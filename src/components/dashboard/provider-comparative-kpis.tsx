/**
 * @fileoverview Comparative KPI display component for provider dashboard.
 *
 * Displays comparative metrics including provider ranking, clinic averages,
 * benchmark comparisons, and peer analysis.
 *
 * Implements Story 1.1 AC2: Comparative KPIs display requirements.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComparativeKPIs } from '@/lib/types/provider-metrics';
import { cn } from '@/lib/utils';
import { Award, BarChart3, Building, Crown, Medal, Trophy, Users } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProviderComparativeKPIsProps {
  /** Comparative KPI data */
  data: ComparativeKPIs;
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
 * Format number values
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Get ranking badge variant and icon
 */
function getRankingDisplay(_rank: number, _total: number, percentile: number) {
  const isTopTier = percentile >= 80;
  const isHighTier = percentile >= 60;
  const isMidTier = percentile >= 40;

  let variant: 'default' | 'secondary' | 'destructive' | 'outline';
  let icon: ReactNode;
  let label: string;

  if (isTopTier) {
    variant = 'default';
    icon = <Crown className="h-4 w-4" />;
    label = 'Top Performer';
  } else if (isHighTier) {
    variant = 'outline';
    icon = <Trophy className="h-4 w-4" />;
    label = 'High Performer';
  } else if (isMidTier) {
    variant = 'secondary';
    icon = <Medal className="h-4 w-4" />;
    label = 'Average Performer';
  } else {
    variant = 'destructive';
    icon = <Award className="h-4 w-4" />;
    label = 'Improving';
  }

  return { variant, icon, label };
}

/**
 * Individual KPI metric card
 */
interface KPIMetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}

function KPIMetricCard({ title, value, icon, compact = false, children }: KPIMetricCardProps) {
  return (
    <Card className={cn('transition-all hover:shadow-md', compact && 'p-2')}>
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className={cn('text-sm font-medium', compact && 'text-xs')}>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', compact && 'pt-0 px-2 pb-2')}>
        <div className="space-y-2">
          <div className={cn('text-2xl font-bold', compact && 'text-lg')}>{value}</div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for comparative KPIs
 */
function ComparativeKPIsLoading({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: 4 }, (_, i) => i).map((index) => (
        <Card key={`comparative-skeleton-${index}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
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
 * Provider Comparative KPIs Component
 */
export default function ProviderComparativeKPIs({
  data,
  isLoading = false,
  showDetails = true,
  compact = false,
}: ProviderComparativeKPIsProps) {
  if (isLoading) {
    return <ComparativeKPIsLoading compact={compact} />;
  }

  const { variant, icon, label } = getRankingDisplay(
    data.providerRanking.currentRank,
    data.providerRanking.totalProviders,
    data.providerRanking.percentile
  );

  return (
    <div className="space-y-6">
      {/* Main KPI Grid */}
      <div
        className={cn(
          'grid gap-4',
          compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {/* Provider Ranking */}
        <KPIMetricCard
          title="Clinic Ranking"
          value={`#${data.providerRanking.currentRank}`}
          icon={<Trophy className="h-4 w-4 text-gold-600" />}
          compact={compact}
        >
          <div className="space-y-2">
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
              {icon}
              {label}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {formatNumber(data.providerRanking.percentile)}th percentile
            </div>
          </div>
        </KPIMetricCard>

        {/* vs Clinic Average Production */}
        <KPIMetricCard
          title="vs Clinic Avg"
          value={formatCurrency(data.clinicAverages.avgProduction)}
          icon={<Building className="h-4 w-4 text-blue-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">Clinic average production</div>
        </KPIMetricCard>

        {/* Industry Benchmark */}
        <KPIMetricCard
          title="Industry Benchmark"
          value={formatCurrency(data.benchmarkComparisons.industryAverage.production)}
          icon={<BarChart3 className="h-4 w-4 text-green-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">Industry average</div>
        </KPIMetricCard>

        {/* Peer Comparison */}
        <KPIMetricCard
          title="Peer Average"
          value={formatCurrency(data.peerComparison.avgAmongPeers.production)}
          icon={<Users className="h-4 w-4 text-purple-600" />}
          compact={compact}
        >
          <div className="text-xs text-muted-foreground">Similar providers</div>
        </KPIMetricCard>
      </div>

      {/* Provider Ranking Detail */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider Performance Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-4xl font-bold text-primary">
                    #{data.providerRanking.currentRank}
                  </div>
                  <div className="text-muted-foreground">
                    of {formatNumber(data.providerRanking.totalProviders)} providers
                  </div>
                </div>
                <Badge variant={variant} className="flex items-center gap-2 w-fit mx-auto">
                  {icon}
                  {label} ({formatNumber(data.providerRanking.percentile)}th percentile)
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Ranking Progress</span>
                  <span>{formatNumber(data.providerRanking.percentile)}%</span>
                </div>
                <Progress value={data.providerRanking.percentile} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Bottom</span>
                  <span>Top</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">Production</div>
                  <div className="text-sm text-muted-foreground">
                    Ranked by {data.providerRanking.rankingCategory}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">
                    {formatNumber(data.providerRanking.percentile)}%
                  </div>
                  <div className="text-sm text-blue-600">Percentile</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-700">
                    {data.providerRanking.totalProviders - data.providerRanking.currentRank}
                  </div>
                  <div className="text-sm text-green-600">Providers behind</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinic Averages Comparison */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinic Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Production Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic Avg Production</span>
                    <span className="font-medium">
                      {formatCurrency(data.clinicAverages.avgProduction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic Avg Patients</span>
                    <span className="font-medium">
                      {formatNumber(data.clinicAverages.avgPatients)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic Collection Rate</span>
                    <span className="font-medium">
                      {formatPercentage(data.clinicAverages.avgCollectionRate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Case Acceptance</span>
                    <span className="font-medium">
                      {formatPercentage(data.clinicAverages.avgCaseAcceptance)}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Your Performance vs Clinic</span>
                      <Badge
                        variant={data.providerRanking.percentile >= 50 ? 'default' : 'secondary'}
                      >
                        {data.providerRanking.percentile >= 50 ? 'Above Average' : 'Below Average'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry Benchmarks */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Industry Benchmark Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold">Industry Standards</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Production</span>
                    <span className="font-medium">
                      {formatCurrency(data.benchmarkComparisons.industryAverage.production)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Collection Rate</span>
                    <span className="font-medium">
                      {formatPercentage(data.benchmarkComparisons.industryAverage.collectionRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient Retention</span>
                    <span className="font-medium">
                      {formatPercentage(data.benchmarkComparisons.industryAverage.patientRetention)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Case Acceptance</span>
                    <span className="font-medium">
                      {formatPercentage(data.benchmarkComparisons.industryAverage.caseAcceptance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Your Industry Percentile</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Production</span>
                      <span>
                        {formatNumber(data.benchmarkComparisons.percentileRanking.production)}%
                      </span>
                    </div>
                    <Progress
                      value={data.benchmarkComparisons.percentileRanking.production}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficiency</span>
                      <span>
                        {formatNumber(data.benchmarkComparisons.percentileRanking.efficiency)}%
                      </span>
                    </div>
                    <Progress
                      value={data.benchmarkComparisons.percentileRanking.efficiency}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Patient Satisfaction</span>
                      <span>
                        {formatNumber(
                          data.benchmarkComparisons.percentileRanking.patientSatisfaction
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={data.benchmarkComparisons.percentileRanking.patientSatisfaction}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peer Comparison */}
      {showDetails && data.peerComparison.similarProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peer Provider Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(data.peerComparison.avgAmongPeers.production)}
                  </div>
                  <div className="text-sm text-blue-600">Peer Avg Production</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(data.peerComparison.avgAmongPeers.patients)}
                  </div>
                  <div className="text-sm text-green-600">Peer Avg Patients</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {formatPercentage(data.peerComparison.avgAmongPeers.efficiency)}
                  </div>
                  <div className="text-sm text-purple-600">Peer Avg Efficiency</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Similar Providers Performance</h4>
                <div className="space-y-2">
                  {data.peerComparison.similarProviders.slice(0, 5).map((provider, index) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-600">#{index + 1}</div>
                        <div>
                          <div className="font-medium">
                            {provider.isAnonymized
                              ? `Provider ${provider.id.slice(-4)}`
                              : provider.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(provider.patients)} patients
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(provider.production)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
