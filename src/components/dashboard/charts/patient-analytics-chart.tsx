/**
 * Patient Analytics Chart Component
 *
 * Interactive patient analytics charts that visualize patient-related KPIs
 * including patient count, appointment efficiency, and case acceptance rates
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProviderPatientMetrics } from '@/types/provider-metrics';
import { AlertTriangle, TrendingDown, TrendingUp, Users } from 'lucide-react';
// biome-ignore lint/style/useImportType: React is needed for ComponentType
import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PatientChartData {
  period: string;
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  appointmentEfficiency: number;
  caseAcceptanceRate: number;
  averageValue: number;
}

interface ProcedureDistribution {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PatientAnalyticsChartProps {
  data: ProviderPatientMetrics[];
  title?: string;
  description?: string;
  showTrends?: boolean;
  showDistribution?: boolean;
  chartType?: 'overview' | 'trends' | 'distribution';
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: PatientChartData;
}

interface PatientTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Custom tooltip for patient data with detailed information
 */
function PatientTooltip({ active, payload, label }: PatientTooltipProps) {
  if (!(active && payload && payload.length > 0)) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[220px]">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry) => {
        const isPercentage = entry.dataKey.includes('Rate') || entry.dataKey.includes('Efficiency');
        const isValue = entry.dataKey.includes('Value');

        let formattedValue: string;
        if (isPercentage) {
          formattedValue = `${(entry.value * 100).toFixed(1)}%`;
        } else if (isValue) {
          formattedValue = `$${entry.value.toLocaleString()}`;
        } else {
          formattedValue = entry.value.toLocaleString();
        }

        return (
          <div
            key={`${entry.dataKey}-${entry.name}`}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium">{formattedValue}</span>
          </div>
        );
      })}
    </div>
  );
}

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

/**
 * Custom label for pie charts
 */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) {
  if (percent < 0.05) {
    return null; // Don't show labels for slices < 5%
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * Patient metric card component
 */
function PatientMetricCard({
  title,
  value,
  change,
  format = 'number',
  icon: Icon = Users,
}: {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'percentage' | 'currency';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositiveChange = change !== undefined ? change >= 0 : null;
  const ChangeIcon =
    isPositiveChange === null ? null : isPositiveChange ? TrendingUp : TrendingDown;
  const changeColor =
    isPositiveChange === null ? '' : isPositiveChange ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {change !== undefined && ChangeIcon && (
          <div className={`flex items-center gap-1 ${changeColor}`}>
            <ChangeIcon className="h-3 w-3" />
            <span className="text-xs font-medium">
              {isPositiveChange ? '+' : ''}
              {(change * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <p className="text-lg font-bold">{formatValue(value)}</p>
    </div>
  );
}

/**
 * Format patient data for chart consumption
 */
function formatPatientData(data: ProviderPatientMetrics[]): PatientChartData[] {
  return data.map((metrics, index) => ({
    period: `Period ${index + 1}`, // TODO: Use actual period labels when available
    totalPatients: metrics.totalPatients,
    newPatients: metrics.newPatients,
    returningPatients: metrics.returningPatients,
    appointmentEfficiency: metrics.appointmentEfficiency,
    caseAcceptanceRate: metrics.caseAcceptanceRate,
    averageValue: metrics.averagePatientValue,
  }));
}

/**
 * Generate mock procedure distribution data
 */
function generateProcedureDistribution(metrics: ProviderPatientMetrics): ProcedureDistribution[] {
  // Mock procedure data - in real implementation, this would come from the metrics
  const procedures = [
    { name: 'Cleanings', value: Math.floor(metrics.totalPatients * 0.4), color: '#3b82f6' },
    { name: 'Fillings', value: Math.floor(metrics.totalPatients * 0.25), color: '#10b981' },
    { name: 'Crowns', value: Math.floor(metrics.totalPatients * 0.15), color: '#f59e0b' },
    { name: 'Extractions', value: Math.floor(metrics.totalPatients * 0.1), color: '#ef4444' },
    { name: 'Other', value: Math.floor(metrics.totalPatients * 0.1), color: '#8b5cf6' },
  ];

  const total = procedures.reduce((sum, proc) => sum + proc.value, 0);

  return procedures.map((proc) => ({
    ...proc,
    percentage: total > 0 ? (proc.value / total) * 100 : 0,
  }));
}

/**
 * Loading state component for patient analytics
 */
function PatientAnalyticsLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-44 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Metrics cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`metric-skeleton-item-${i + 1}`} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="h-64 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-8 border-muted animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component for patient analytics
 */
function PatientAnalyticsError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
        <h3 className="font-medium mb-2">Failed to Load Patient Analytics</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {error.message || 'An error occurred while loading patient analytics.'}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-sm text-primary hover:underline">
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main patient analytics chart component
 */
export function PatientAnalyticsChart({
  data,
  title = 'Patient Analytics',
  description = 'Patient counts, efficiency, and case acceptance metrics',
  showTrends: _showTrends = true,
  showDistribution = true,
  chartType = 'overview',
  isLoading = false,
  error = null,
  className = '',
}: PatientAnalyticsChartProps) {
  // Handle loading state
  if (isLoading) {
    return <PatientAnalyticsLoading />;
  }

  // Handle error state
  if (error) {
    return <PatientAnalyticsError error={error} />;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No patient data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatPatientData(data);
  const latestData = data.at(-1);
  const procedureData = latestData ? generateProcedureDistribution(latestData) : [];

  // Calculate trends
  const firstData = data[0];
  const patientGrowth =
    firstData && latestData
      ? (latestData.totalPatients - firstData.totalPatients) / firstData.totalPatients
      : 0;
  const _efficiencyChange =
    firstData && latestData
      ? latestData.appointmentEfficiency - firstData.appointmentEfficiency
      : 0;

  const renderChart = () => {
    switch (chartType) {
      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<PatientTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalPatients"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Total Patients"
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="newPatients"
                stroke="#10b981"
                strokeWidth={2}
                name="New Patients"
                dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="returningPatients"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Returning Patients"
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={procedureData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={PieLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {procedureData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} procedures`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // overview
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<PatientTooltip />} />
              <Legend />
              <Bar dataKey="newPatients" fill="#10b981" name="New Patients" radius={[2, 2, 0, 0]} />
              <Bar
                dataKey="returningPatients"
                fill="#3b82f6"
                name="Returning Patients"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Metrics Overview */}
        {latestData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PatientMetricCard
              title="Total Patients"
              value={latestData.totalPatients}
              change={patientGrowth}
              icon={Users}
            />
            <PatientMetricCard title="New Patients" value={latestData.newPatients} icon={Users} />
            <PatientMetricCard
              title="Avg Patient Value"
              value={latestData.averagePatientValue}
              format="currency"
              icon={Users}
            />
            <PatientMetricCard
              title="Case Acceptance"
              value={latestData.caseAcceptanceRate}
              format="percentage"
              icon={Users}
            />
          </div>
        )}

        {/* Main Chart */}
        <div>{renderChart()}</div>

        {/* Additional Analytics */}
        {latestData && showDistribution && chartType !== 'distribution' && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-4">Procedure Distribution</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-sm">
              {procedureData.map((procedure) => (
                <div key={procedure.name} className="text-center">
                  <div
                    className="w-4 h-4 rounded mx-auto mb-1"
                    style={{ backgroundColor: procedure.color }}
                  />
                  <p className="font-medium">{procedure.name}</p>
                  <p className="text-muted-foreground">{procedure.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {latestData && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Appointment Efficiency</p>
                <p
                  className={`font-medium ${
                    latestData.appointmentEfficiency >= 0.9
                      ? 'text-green-600'
                      : latestData.appointmentEfficiency >= 0.8
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {(latestData.appointmentEfficiency * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Patient Retention</p>
                <p className="font-medium">
                  {latestData.totalPatients > 0
                    ? ((latestData.returningPatients / latestData.totalPatients) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Lifetime Value</p>
                <p className="font-medium">${latestData.lifetimePatientValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Patient Growth</p>
                <p
                  className={`font-medium ${
                    patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {patientGrowth >= 0 ? '+' : ''}
                  {(patientGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientAnalyticsChart;
