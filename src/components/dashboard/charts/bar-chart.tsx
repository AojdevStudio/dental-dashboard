'use client';

import type { ChartConfig } from '@/lib/types/charts';
import { formatDate, formatNumber, truncateLabel } from '@/lib/utils/chart-helpers';
import { chartTheme, getChartColors } from '@/lib/utils/color-schemes';
import { getResponsiveMargin, isMobile, useBreakpoint } from '@/lib/utils/responsive-helpers';
import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from '../chart-container';

interface BarChartProps {
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
  horizontal?: boolean;
}

const safeFormatNumber = (value: string | number): string => {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) || 0 : value;
  return formatNumber(numValue);
};

// Helper to generate click handler
function createClickHandler(onDataPointClick?: (data: Record<string, unknown>) => void) {
  if (!onDataPointClick) {
    return undefined;
  }
  return (data: unknown) => {
    if (data?.activePayload) {
      onDataPointClick(data.activePayload[0].payload);
    }
  };
}

// Helper to render bars
function renderBars(
  config: ChartConfig,
  colors: string[],
  stacked: boolean,
  animationDuration: number
) {
  if (config.series && config.series.length > 0) {
    return config.series.map((series, index) => (
      <Bar
        key={series.dataKey}
        dataKey={series.dataKey}
        name={series.name}
        fill={series.color || colors[index]}
        stackId={stacked && series.stackId ? series.stackId : undefined}
        animationDuration={animationDuration}
      />
    ));
  }

  return (
    <Bar dataKey="value" fill={colors[0]} animationDuration={animationDuration}>
      {config.data.map((entry, index) => (
        <Cell
          key={`cell-${entry.name || entry.value || index}`}
          fill={colors[index % colors.length]}
        />
      ))}
    </Bar>
  );
}

// Horizontal Bar Chart Component
function HorizontalBarChart({
  config,
  defaultConfig,
  margin,
  mobile,
  colors,
  stacked,
  formatYAxis,
  formatTooltip,
  onDataPointClick,
}: {
  config: ChartConfig;
  defaultConfig: ChartConfig;
  margin: { top: number; right: number; bottom: number; left: number };
  mobile: boolean;
  colors: string[];
  stacked: boolean;
  formatYAxis: (value: number | string) => string;
  formatTooltip: (value: number | string, name: string) => string;
  onDataPointClick?: (data: Record<string, unknown>) => void;
}) {
  const CustomTooltip = createCustomTooltip(config, formatTooltip);

  return (
    <ResponsiveContainer width="100%" height={defaultConfig.height}>
      <RechartsBarChart
        layout="vertical"
        data={defaultConfig.data}
        margin={margin}
        onClick={createClickHandler(onDataPointClick)}
      >
        {defaultConfig.showGrid && (
          <CartesianGrid
            strokeDasharray={chartTheme.grid.strokeDasharray}
            stroke={chartTheme.grid.stroke}
            horizontal={!mobile}
          />
        )}
        <XAxis type="number" tick={{ ...chartTheme.axis.style }} tickFormatter={formatYAxis} />
        <YAxis
          type="category"
          dataKey={config.xAxisKey || 'name'}
          tick={{ ...chartTheme.axis.style }}
          tickFormatter={(value) => truncateLabel(value, mobile ? 10 : 20)}
          width={mobile ? 80 : 100}
        />
        {defaultConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
        {defaultConfig.showLegend && !mobile && (
          <Legend wrapperStyle={chartTheme.legend.style} verticalAlign="top" height={36} />
        )}
        {renderBars(config, colors, stacked, defaultConfig.animationDuration || 750)}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Vertical Bar Chart Component
function VerticalBarChart({
  config,
  defaultConfig,
  margin,
  mobile,
  colors,
  stacked,
  formatYAxis,
  formatTooltip,
  onDataPointClick,
}: {
  config: ChartConfig;
  defaultConfig: ChartConfig;
  margin: { top: number; right: number; bottom: number; left: number };
  mobile: boolean;
  colors: string[];
  stacked: boolean;
  formatYAxis: (value: number | string) => string;
  formatTooltip: (value: number | string, name: string) => string;
  onDataPointClick?: (data: Record<string, unknown>) => void;
}) {
  const CustomTooltip = createCustomTooltip(config, formatTooltip);

  return (
    <ResponsiveContainer width="100%" height={defaultConfig.height}>
      <RechartsBarChart
        data={defaultConfig.data}
        margin={margin}
        onClick={createClickHandler(onDataPointClick)}
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
        {renderBars(config, colors, stacked, defaultConfig.animationDuration || 750)}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Helper to create custom tooltip
function createCustomTooltip(
  config: ChartConfig,
  formatTooltip: (value: number | string, name: string) => string
) {
  return function CustomTooltip({
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
  }) {
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
}

export function BarChart({
  config,
  title,
  subtitle,
  loading,
  error,
  className,
  formatYAxis = safeFormatNumber,
  formatTooltip = safeFormatNumber,
  onDataPointClick,
  stacked = false,
  horizontal = false,
}: BarChartProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobile(breakpoint);
  const margin = getResponsiveMargin(breakpoint);

  const colors = getChartColors(
    'dental',
    (config.series?.length || 0) > 0 ? config.series?.length || 1 : config.data.length
  );

  const defaultConfig: ChartConfig = {
    ...config,
    height: config.height || 400,
    showGrid: config.showGrid !== false,
    showTooltip: config.showTooltip !== false,
    showLegend: config.showLegend !== false,
    animationDuration: config.animationDuration || 750,
  };

  const ChartComponent = horizontal ? (
    <HorizontalBarChart
      config={config}
      defaultConfig={defaultConfig}
      margin={margin}
      mobile={mobile}
      colors={colors}
      stacked={stacked}
      formatYAxis={formatYAxis}
      formatTooltip={formatTooltip}
      onDataPointClick={onDataPointClick}
    />
  ) : (
    <VerticalBarChart
      config={config}
      defaultConfig={defaultConfig}
      margin={margin}
      mobile={mobile}
      colors={colors}
      stacked={stacked}
      formatYAxis={formatYAxis}
      formatTooltip={formatTooltip}
      onDataPointClick={onDataPointClick}
    />
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      config={defaultConfig}
      loading={loading}
      error={error}
      className={className}
    >
      {ChartComponent}
    </ChartContainer>
  );
}
