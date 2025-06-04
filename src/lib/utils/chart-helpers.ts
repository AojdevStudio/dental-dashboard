import type { ChartDataPoint, ChartSeries } from "@/lib/types/charts";
import { format, isValid, parseISO } from "date-fns";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatDate = (date: Date | string, formatString = "MMM dd"): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "";

  return format(dateObj, formatString);
};

export const aggregateDataByPeriod = (
  data: ChartDataPoint[],
  period: "day" | "week" | "month" | "quarter" | "year",
  valueKey: string,
  dateKey = "date"
): ChartDataPoint[] => {
  const formatMap = {
    day: "MMM dd",
    week: "MMM dd",
    month: "MMM yyyy",
    quarter: "QQQ yyyy",
    year: "yyyy",
  };

  const grouped = data.reduce(
    (acc, item) => {
      const date = item[dateKey];
      if (!date) return acc;

      const key = formatDate(date, formatMap[period]);
      if (!acc[key]) {
        acc[key] = { name: key, value: 0, count: 0 };
      }

      acc[key].value += item[valueKey] || 0;
      acc[key].count += 1;

      return acc;
    },
    {} as Record<string, any>
  );

  return Object.values(grouped).map((item) => ({
    ...item,
    value: item.value / (period === "day" ? 1 : item.count), // Average for non-daily periods
  }));
};

export const calculateTrend = (
  currentValue: number,
  previousValue: number
): { direction: "up" | "down" | "neutral"; percentage: number } => {
  if (previousValue === 0) {
    return { direction: "neutral", percentage: 0 };
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  const direction = percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral";

  return { direction, percentage: Math.abs(percentageChange) };
};

export const getDataRange = (data: ChartDataPoint[], valueKey: string) => {
  const values = data.map((item) => item[valueKey] || 0).filter((v) => typeof v === "number");

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, v) => sum + v, 0) / values.length,
  };
};

export const normalizeData = (data: ChartDataPoint[], series: ChartSeries[]): ChartDataPoint[] => {
  return data.map((point) => {
    const normalized: ChartDataPoint = { ...point };

    series.forEach((s) => {
      if (!(s.dataKey in normalized)) {
        normalized[s.dataKey] = 0;
      }
    });

    return normalized;
  });
};

export const generateTickValues = (min: number, max: number, tickCount = 5): number[] => {
  const range = max - min;
  const step = Math.ceil(range / tickCount / 10) * 10;
  const ticks: number[] = [];

  let current = Math.floor(min / step) * step;
  while (current <= max) {
    ticks.push(current);
    current += step;
  }

  return ticks;
};

export const truncateLabel = (label: string, maxLength = 20): string => {
  if (label.length <= maxLength) return label;
  return `${label.substring(0, maxLength - 3)}...`;
};

export const getChartDimensions = (
  containerWidth: number,
  aspectRatio = 16 / 9,
  maxHeight = 400
): { width: number; height: number } => {
  const height = Math.min(containerWidth / aspectRatio, maxHeight);
  return { width: containerWidth, height };
};

export const exportChartData = (data: ChartDataPoint[], filename: string) => {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map((row) => Object.values(row).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
