"use client";

import type { ChartConfig } from "@/lib/types/charts";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils/chart-helpers";
import { chartTheme, getChartColors } from "@/lib/utils/color-schemes";
import { isMobile, useBreakpoint } from "@/lib/utils/responsive-helpers";
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartContainer } from "../chart-container";

interface PieChartProps {
  config: ChartConfig;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  formatTooltip?: (value: any, name: string) => string;
  onDataPointClick?: (data: any) => void;
  isDoughnut?: boolean;
  showPercentage?: boolean;
  labelLine?: boolean;
}

export function PieChart({
  config,
  title,
  subtitle,
  loading,
  error,
  className,
  formatTooltip = (value) => formatNumber(value),
  onDataPointClick,
  isDoughnut = false,
  showPercentage = true,
  labelLine = true,
}: PieChartProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobile(breakpoint);

  const colors = getChartColors("dental", config.data.length);

  const defaultConfig: ChartConfig = {
    ...config,
    height: config.height || 400,
    showTooltip: config.showTooltip !== false,
    showLegend: config.showLegend !== false,
    animationDuration: config.animationDuration || 750,
  };

  // Calculate total for percentage calculations
  const total = config.data.reduce((sum, entry) => sum + (entry.value || 0), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = (data.value / total) * 100;

    return (
      <div style={chartTheme.tooltip.container}>
        <p style={chartTheme.tooltip.label}>{data.name}</p>
        <p style={{ ...chartTheme.tooltip.value, color: data.payload.fill }}>
          {formatTooltip(data.value, data.name)}
          {showPercentage && ` (${percentage.toFixed(1)}%)`}
        </p>
      </div>
    );
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    index,
  }: any) => {
    if (mobile) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (value / total) * 100;

    if (percentage < 5) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <ul className={`flex ${mobile ? "flex-col" : "flex-wrap"} gap-2 justify-center mt-4`}>
        {payload.map((entry: any, index: number) => {
          const percentage = (entry.payload.value / total) * 100;
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span style={chartTheme.legend.style}>
                {entry.value}
                {showPercentage && ` (${percentage.toFixed(1)}%)`}
              </span>
            </li>
          );
        })}
      </ul>
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
        <RechartsPieChart>
          <Pie
            data={defaultConfig.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={mobile ? 100 : 120}
            innerRadius={isDoughnut ? (mobile ? 50 : 60) : 0}
            fill="#8884d8"
            dataKey="value"
            animationDuration={defaultConfig.animationDuration}
            onClick={onDataPointClick}
          >
            {defaultConfig.data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                style={{ cursor: onDataPointClick ? "pointer" : "default" }}
              />
            ))}
          </Pie>

          {defaultConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}

          {defaultConfig.showLegend && <Legend content={<CustomLegend />} verticalAlign="bottom" />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
