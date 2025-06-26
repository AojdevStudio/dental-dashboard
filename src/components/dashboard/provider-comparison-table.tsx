/**
 * Provider Comparison Table Component
 *
 * Comprehensive comparative analytics table that displays provider rankings,
 * clinic averages, and benchmark comparisons with sorting and filtering
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProviderMetrics } from '@/types/provider-metrics';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Minus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProviderComparisonData {
  providerId: string;
  providerName: string;
  rank: number;
  totalProduction: number;
  collectionRate: number;
  patientCount: number;
  goalAchievement: number;
  variance: number;
  clinicAverage: boolean;
  trend: 'up' | 'down' | 'stable';
  percentile: number;
}

interface ProviderComparisonTableProps {
  data: ProviderMetrics[];
  currentProviderId?: string;
  title?: string;
  description?: string;
  showRankings?: boolean;
  showTrends?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

type SortField = keyof ProviderComparisonData;
type SortDirection = 'asc' | 'desc';

/**
 * Performance indicator component with trend arrows and color coding
 */
function PerformanceIndicator({
  value,
  trend,
  format = 'number',
  isCurrentProvider = false,
}: {
  value: number;
  trend: 'up' | 'down' | 'stable';
  format?: 'number' | 'percentage' | 'currency' | 'rank';
  isCurrentProvider?: boolean;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'rank':
        return `#${val}`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getPerformanceColor = () => {
    if (format === 'rank') {
      return value <= 3 ? 'text-green-600' : value <= 10 ? 'text-yellow-600' : 'text-gray-600';
    }

    // For percentages, higher is generally better
    if (format === 'percentage') {
      return value >= 0.9 ? 'text-green-600' : value >= 0.7 ? 'text-yellow-600' : 'text-red-600';
    }

    return 'text-foreground';
  };

  return (
    <div className={`flex items-center gap-2 ${isCurrentProvider ? 'font-bold' : ''}`}>
      <span className={getPerformanceColor()}>{formatValue(value)}</span>
      {getTrendIcon()}
    </div>
  );
}

/**
 * Percentile badge component
 */
function PercentileBadge({ percentile }: { percentile: number }) {
  const getBadgeStyle = () => {
    if (percentile >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (percentile >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentile >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      {percentile}th
    </span>
  );
}

/**
 * Transform metrics data into comparison table format
 */
function transformToComparisonData(data: ProviderMetrics[]): ProviderComparisonData[] {
  // Sort by total production to determine rankings
  const sortedData = [...data].sort(
    (a, b) => b.financial.totalProduction - a.financial.totalProduction
  );

  return sortedData.map((metrics, index) => ({
    providerId: metrics.providerId,
    providerName: metrics.providerName,
    rank: index + 1,
    totalProduction: metrics.financial.totalProduction,
    collectionRate: metrics.financial.collectionRate,
    patientCount: metrics.patient.totalPatients,
    goalAchievement: metrics.performance.goalAchievementRate,
    variance: metrics.performance.performanceVariance,
    clinicAverage: false, // TODO: Determine from actual clinic data
    trend:
      metrics.financial.productionGrowth > 0
        ? 'up'
        : metrics.financial.productionGrowth < 0
          ? 'down'
          : 'stable',
    percentile: Math.round(((data.length - index) / data.length) * 100),
  }));
}

/**
 * Export data to CSV format
 */
function exportToCSV(data: ProviderComparisonData[], filename = 'provider-comparison.csv') {
  const headers = [
    'Rank',
    'Provider Name',
    'Total Production',
    'Collection Rate',
    'Patient Count',
    'Goal Achievement',
    'Performance Variance',
    'Percentile',
  ];

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      [
        row.rank,
        `"${row.providerName}"`,
        row.totalProduction,
        (row.collectionRate * 100).toFixed(1) + '%',
        row.patientCount,
        (row.goalAchievement * 100).toFixed(1) + '%',
        (row.variance * 100).toFixed(1) + '%',
        row.percentile + 'th',
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Loading state component for comparison table
 */
function ComparisonTableLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Table skeleton */}
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <div className="grid grid-cols-8 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0">
                <div className="grid grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component for comparison table
 */
function ComparisonTableError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <h3 className="font-medium mb-2">Failed to Load Comparison Data</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {error.message || 'An error occurred while loading provider comparison data.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main provider comparison table component
 */
export function ProviderComparisonTable({
  data,
  currentProviderId,
  title = 'Provider Rankings',
  description = 'Comparative performance analytics across all providers',
  showRankings = true,
  showTrends = true,
  isLoading = false,
  error = null,
  className = '',
}: ProviderComparisonTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [metricFilter, setMetricFilter] = useState<string>('all');

  // Handle loading state
  if (isLoading) {
    return <ComparisonTableLoading />;
  }

  // Handle error state
  if (error) {
    return <ComparisonTableError error={error} />;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No provider data available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = useMemo(() => transformToComparisonData(data), [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = comparisonData.filter((provider) =>
      provider.providerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply metric filter
    if (metricFilter !== 'all') {
      // Add specific filtering logic based on metric type
      // For now, show all data
    }

    // Sort data
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [comparisonData, searchTerm, sortField, sortDirection, metricFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleExport = () => {
    exportToCSV(
      filteredAndSortedData,
      `provider-comparison-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={metricFilter} onValueChange={setMetricFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="collections">Collections</SelectItem>
              <SelectItem value="patients">Patients</SelectItem>
              <SelectItem value="goals">Goal Achievement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comparison Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showRankings && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('rank')}
                    >
                      <div className="flex items-center gap-2">
                        Rank
                        {getSortIcon('rank')}
                      </div>
                    </TableHead>
                  )}
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('providerName')}
                  >
                    <div className="flex items-center gap-2">
                      Provider
                      {getSortIcon('providerName')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalProduction')}
                  >
                    <div className="flex items-center gap-2">
                      Production
                      {getSortIcon('totalProduction')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('collectionRate')}
                  >
                    <div className="flex items-center gap-2">
                      Collection Rate
                      {getSortIcon('collectionRate')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('patientCount')}
                  >
                    <div className="flex items-center gap-2">
                      Patients
                      {getSortIcon('patientCount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('goalAchievement')}
                  >
                    <div className="flex items-center gap-2">
                      Goal Achievement
                      {getSortIcon('goalAchievement')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('percentile')}
                  >
                    <div className="flex items-center gap-2">
                      Percentile
                      {getSortIcon('percentile')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((provider) => {
                  const isCurrentProvider = provider.providerId === currentProviderId;
                  return (
                    <TableRow
                      key={provider.providerId}
                      className={isCurrentProvider ? 'bg-blue-50 border-blue-200' : ''}
                    >
                      {showRankings && (
                        <TableCell>
                          <PerformanceIndicator
                            value={provider.rank}
                            trend="stable"
                            format="rank"
                            isCurrentProvider={isCurrentProvider}
                          />
                        </TableCell>
                      )}
                      <TableCell className={isCurrentProvider ? 'font-bold' : ''}>
                        {provider.providerName}
                        {isCurrentProvider && (
                          <span className="ml-2 text-xs text-blue-600">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PerformanceIndicator
                          value={provider.totalProduction}
                          trend={provider.trend}
                          format="currency"
                          isCurrentProvider={isCurrentProvider}
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceIndicator
                          value={provider.collectionRate}
                          trend={provider.trend}
                          format="percentage"
                          isCurrentProvider={isCurrentProvider}
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceIndicator
                          value={provider.patientCount}
                          trend={provider.trend}
                          format="number"
                          isCurrentProvider={isCurrentProvider}
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceIndicator
                          value={provider.goalAchievement}
                          trend={provider.trend}
                          format="percentage"
                          isCurrentProvider={isCurrentProvider}
                        />
                      </TableCell>
                      <TableCell>
                        <PercentileBadge percentile={provider.percentile} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
          <div>
            <p className="text-muted-foreground">Total Providers</p>
            <p className="font-medium">{filteredAndSortedData.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Production</p>
            <p className="font-medium">
              $
              {Math.round(
                filteredAndSortedData.reduce((sum, p) => sum + p.totalProduction, 0) /
                  filteredAndSortedData.length
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Collection Rate</p>
            <p className="font-medium">
              {(
                (filteredAndSortedData.reduce((sum, p) => sum + p.collectionRate, 0) /
                  filteredAndSortedData.length) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Top Performer</p>
            <p className="font-medium">{filteredAndSortedData[0]?.providerName || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProviderComparisonTable;
