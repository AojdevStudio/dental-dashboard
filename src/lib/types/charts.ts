import type React from 'react';
import type { CSSProperties } from 'react';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area';

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  date?: Date | string;
  [key: string]: unknown;
}

export interface ChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  type?: 'monotone' | 'linear' | 'natural';
  stackId?: string;
}

export interface ChartConfig {
  type: ChartType;
  data: ChartDataPoint[];
  series?: ChartSeries[];
  width?: number | string;
  height?: number | string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
  colors?: string[];
  xAxisKey?: string;
  yAxisKey?: string;
  responsive?: boolean;
}

export interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  config: ChartConfig;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  style?: CSSProperties;
  onDataPointClick?: (data: ChartDataPoint) => void;
  headerActions?: React.ReactNode;
}

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export interface RechartsClickData {
  activePayload?: Array<{
    payload: Record<string, unknown>;
    name?: string;
    value?: number | string;
    dataKey?: string;
  }>;
  activeLabel?: string;
  activeCoordinate?: {
    x: number;
    y: number;
  };
}

export interface LegendProps {
  value?: string;
  payload?: Array<{
    value: string;
    type?: string;
    color?: string;
  }>;
}

export type ChartTheme = {
  colors: {
    primary: string[];
    secondary: string[];
    success: string;
    warning: string;
    error: string;
    neutral: string[];
  };
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
};

export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename?: string;
  quality?: number;
  scale?: number;
}
