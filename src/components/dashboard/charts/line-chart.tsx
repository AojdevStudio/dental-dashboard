'use client';

import type { ChartConfig } from '@/lib/types/charts';
import { formatDate, formatNumber, truncateLabel } from '@/lib/utils/chart-helpers';
import { chartTheme, getChartColors } from '@/lib/utils/color-schemes';
import { getResponsiveMargin, isMobile, useBreakpoint } from '@/lib/utils/responsive-helpers';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from '../chart-container';

interface LineChartProps {
  config: ChartConfig;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  formatYAxis?: (value: number | string) => string;
  formatTooltip?: (value: number | string, name: string) => string;
  onDataPointClick?: (data: Record<string, unknown>) => void;
}

export function LineChart({
  config,
  title,
  subtitle,
  loading,
  error,
  className,
  formatYAxis = (value) =>
    formatNumber(typeof value === 'string' ? Number.parseFloat(value) || 0 : value),
  formatTooltip = (value) =>
    formatNumber(typeof value === 'string' ? Number.parseFloat(value) || 0 : value),
  onDataPointClick,
}: LineChartProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobile(breakpoint);
  const margin = getResponsiveMargin(breakpoint);

  const colors = getChartColors('dental', config.series?.length || 1);

  const defaultConfig: ChartConfig = {
    ...config,
    height: config.height || 400,
    showGrid: config.showGrid !== false,
    showTooltip: config.showTooltip !== false,
    showLegend: config.showLegend !== false,
    animationDuration: config.animationDuration || 750,
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number | string;
      color: string;
    }>;
    label?: string;
  }) => {
    if (!(active && payload && payload.length > 0)) {
      return null;
    }

    return (
      <div style={chartTheme.tooltip.container}>
        <p style={chartTheme.tooltip.label}>
          {config.xAxisKey === 'date' ? formatDate(label || '') : label}
        </p>
        {payload.map((entry, index: number) => (
          <p
            key={`${entry.name}-${index}`}
            style={{ ...chartTheme.tooltip.value, color: entry.color }}
          >
            {entry.name}: {formatTooltip(entry.value, entry.name)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      config={defaultConfig}
      loading={loading}
      error={error}
      className={className}
    >
      <ResponsiveContainer width="100%" height={defaultConfig.height}>
        <RechartsLineChart
          data={defaultConfig.data}
          margin={margin}
          onClick={
            onDataPointClick
              ? (data) => {
                  if (data?.activePayload) {
                    onDataPointClick(data.activePayload[0].payload);
                  }
                }
              : undefined
          }
        >
          {defaultConfig.showGrid && (
            <CartesianGrid
              strokeDasharray={chartTheme.grid.strokeDasharray}
              stroke={chartTheme.grid.stroke}
              vertical={!mobile}
            />
          )}

          <XAxis
            dataKey={config.xAxisKey || 'name'}
            tick={{ ...chartTheme.axis.style }}
            tickFormatter={(value) => {
              if (config.xAxisKey === 'date') {
                return formatDate(value, mobile ? 'MMM' : 'MMM dd');
              }
              return truncateLabel(value, mobile ? 10 : 20);
            }}
            angle={mobile ? -45 : 0}
            textAnchor={mobile ? 'end' : 'middle'}
            height={mobile ? 60 : 30}
          />

          <YAxis
            tick={{ ...chartTheme.axis.style }}
            tickFormatter={formatYAxis}
            width={mobile ? 50 : 60}
          />

          {defaultConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}

          {defaultConfig.showLegend && !mobile && (
            <Legend wrapperStyle={chartTheme.legend.style} verticalAlign="top" height={36} />
          )}

          {config.series?.map((series, index) => (
            <Line
              key={series.dataKey}
              type={series.type || 'monotone'}
              dataKey={series.dataKey}
              name={series.name}
              stroke={series.color || colors[index]}
              strokeWidth={2}
              dot={{ r: mobile ? 0 : 4 }}
              activeDot={{ r: 6 }}
              animationDuration={defaultConfig.animationDuration}
            />
          )) || (
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: mobile ? 0 : 4 }}
              activeDot={{ r: 6 }}
              animationDuration={defaultConfig.animationDuration}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
