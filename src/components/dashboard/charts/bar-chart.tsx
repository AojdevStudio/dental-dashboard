"use client";

import type { ChartConfig } from "@/lib/types/charts";
import { formatCurrency, formatDate, formatNumber, truncateLabel } from "@/lib/utils/chart-helpers";
import { chartTheme, getChartColors } from "@/lib/utils/color-schemes";
import { getResponsiveMargin, isMobile, useBreakpoint } from "@/lib/utils/responsive-helpers";
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
} from "recharts";
import { ChartContainer } from "../chart-container";

interface BarChartProps {
  config: ChartConfig;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any, name: string) => string;
  onDataPointClick?: (data: any) => void;
  stacked?: boolean;
  horizontal?: boolean;
}

export function BarChart({
  config,
  title,
  subtitle,
  loading,
  error,
  className,
  formatYAxis = (value) => formatNumber(value),
  formatTooltip = (value) => formatNumber(value),
  onDataPointClick,
  stacked = false,
  horizontal = false,
}: BarChartProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobile(breakpoint);
  const margin = getResponsiveMargin(breakpoint);

  const colors = getChartColors("dental", config.series?.length || config.data.length);

  const defaultConfig: ChartConfig = {
    ...config,
    height: config.height || 400,
    showGrid: config.showGrid !== false,
    showTooltip: config.showTooltip !== false,
    showLegend: config.showLegend !== false,
    animationDuration: config.animationDuration || 750,
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={chartTheme.tooltip.container}>
        <p style={chartTheme.tooltip.label}>
          {config.xAxisKey === "date" ? formatDate(label) : label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ ...chartTheme.tooltip.value, color: entry.color }}>
            {entry.name}: {formatTooltip(entry.value, entry.name)}
          </p>
        ))}
      </div>
    );
  };

  const ChartComponent = horizontal ? (
    <ResponsiveContainer width="100%" height={defaultConfig.height}>
      <RechartsBarChart
        layout="vertical"
        data={defaultConfig.data}
        margin={margin}
        onClick={
          onDataPointClick
            ? (data) => {
                if (data && data.activePayload) {
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
            horizontal={!mobile}
          />
        )}

        <XAxis type="number" tick={{ ...chartTheme.axis.style }} tickFormatter={formatYAxis} />

        <YAxis
          type="category"
          dataKey={config.xAxisKey || "name"}
          tick={{ ...chartTheme.axis.style }}
          tickFormatter={(value) => truncateLabel(value, mobile ? 10 : 20)}
          width={mobile ? 80 : 100}
        />

        {defaultConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}

        {defaultConfig.showLegend && !mobile && (
          <Legend wrapperStyle={chartTheme.legend.style} verticalAlign="top" height={36} />
        )}

        {config.series?.map((series, index) => (
          <Bar
            key={series.dataKey}
            dataKey={series.dataKey}
            name={series.name}
            fill={series.color || colors[index]}
            stackId={stacked ? "stack" : undefined}
            animationDuration={defaultConfig.animationDuration}
          />
        )) || (
          <Bar dataKey="value" fill={colors[0]} animationDuration={defaultConfig.animationDuration}>
            {defaultConfig.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  ) : (
    <ResponsiveContainer width="100%" height={defaultConfig.height}>
      <RechartsBarChart
        data={defaultConfig.data}
        margin={margin}
        onClick={
          onDataPointClick
            ? (data) => {
                if (data && data.activePayload) {
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
          dataKey={config.xAxisKey || "name"}
          tick={{ ...chartTheme.axis.style }}
          tickFormatter={(value) => {
            if (config.xAxisKey === "date") {
              return formatDate(value, mobile ? "MMM" : "MMM dd");
            }
            return truncateLabel(value, mobile ? 10 : 20);
          }}
          angle={mobile ? -45 : 0}
          textAnchor={mobile ? "end" : "middle"}
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
          <Bar
            key={series.dataKey}
            dataKey={series.dataKey}
            name={series.name}
            fill={series.color || colors[index]}
            stackId={stacked && series.stackId ? series.stackId : undefined}
            animationDuration={defaultConfig.animationDuration}
          />
        )) || (
          <Bar dataKey="value" fill={colors[0]} animationDuration={defaultConfig.animationDuration}>
            {defaultConfig.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
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
