'use client';

import type { ChartConfig } from '@/lib/types/charts';
import { formatDate, formatNumber, truncateLabel } from '@/lib/utils/chart-helpers';
import { chartTheme, getChartColors } from '@/lib/utils/color-schemes';
import { getResponsiveMargin, isMobile, useBreakpoint } from '@/lib/utils/responsive-helpers';
import {
  Area,
  CartesianGrid,
  Legend,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from '../chart-container';

interface AreaChartProps {
  config: ChartConfig;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  formatYAxis?: (value: number | string) => string;
  formatTooltip?: (value: number | string, name: string) => string;
  onDataPointClick?: (data: Record<string, unknown>) => void;
  stacked?: boolean;
  gradient?: boolean;
}

export function AreaChart({
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
  stacked = false,
  gradient = true,
}: AreaChartProps) {
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
      <ResponsiveContainer
        width="100%"
        height={defaultConfig.height}
        className="text-muted-foreground"
      >
        <RechartsAreaChart
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
          {gradient && (
            <defs>
              {(config.series || [{ dataKey: 'value' }]).map((series, index) => {
                const color = ('color' in series ? series.color : undefined) || colors[index];
                return (
                  <linearGradient
                    key={`gradient-${series.dataKey}`}
                    id={`gradient-${series.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                );
              })}
            </defs>
          )}

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
            <Area
              key={series.dataKey}
              type={series.type || 'monotone'}
              dataKey={series.dataKey}
              name={series.name}
              stroke={series.color || colors[index]}
              strokeWidth={2}
              fill={gradient ? `url(#gradient-${series.dataKey})` : series.color || colors[index]}
              fillOpacity={gradient ? 1 : 0.6}
              stackId={stacked ? series.stackId || 'stack' : undefined}
              animationDuration={defaultConfig.animationDuration}
            />
          )) || (
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              fill={gradient ? 'url(#gradient-value)' : colors[0]}
              fillOpacity={gradient ? 1 : 0.6}
              animationDuration={defaultConfig.animationDuration}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
