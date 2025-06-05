import { ChartConfig, type ChartDataPoint } from "@/lib/types/charts";
import { aggregateDataByPeriod } from "@/lib/utils/chart-helpers";
import { useCallback, useEffect, useState } from "react";

interface UseChartDataOptions {
  endpoint?: string;
  transform?: (data: unknown) => ChartDataPoint[];
  aggregation?: {
    enabled: boolean;
    period: "day" | "week" | "month" | "quarter" | "year";
    valueKey: string;
    dateKey?: string;
  };
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface UseChartDataReturn {
  data: ChartDataPoint[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChartData({
  endpoint,
  transform,
  aggregation,
  refreshInterval,
  enabled = true,
}: UseChartDataOptions): UseChartDataReturn {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const rawData = await response.json();
      let processedData = transform ? transform(rawData) : rawData;

      // Apply aggregation if enabled
      if (aggregation?.enabled && processedData.length > 0) {
        processedData = aggregateDataByPeriod(
          processedData,
          aggregation.period,
          aggregation.valueKey,
          aggregation.dateKey
        );
      }

      setData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  }, [endpoint, transform, aggregation, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Mock data generator for development
export function generateMockChartData(
  type: "revenue" | "appointments" | "patients" | "treatments",
  points = 30
): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    let value: number;
    switch (type) {
      case "revenue":
        value = Math.floor(Math.random() * 5000) + 10000;
        break;
      case "appointments":
        value = Math.floor(Math.random() * 20) + 30;
        break;
      case "patients":
        value = Math.floor(Math.random() * 15) + 20;
        break;
      case "treatments":
        value = Math.floor(Math.random() * 30) + 40;
        break;
    }

    data.push({
      name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: date.toISOString(),
      value,
    });
  }

  return data;
}

// Transform functions for common data formats
export const chartDataTransformers = {
  timeSeriesFromArray: (
    data: Record<string, unknown>[],
    valueKey: string,
    dateKey: string
  ): ChartDataPoint[] => {
    return data.map((item) => ({
      name: new Date(item[dateKey]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      date: item[dateKey],
      value: item[valueKey],
      ...item,
    }));
  },

  categoricalFromArray: (
    data: Record<string, unknown>[],
    nameKey: string,
    valueKey: string
  ): ChartDataPoint[] => {
    return data.map((item) => ({
      name: item[nameKey],
      value: item[valueKey],
      ...item,
    }));
  },

  multiSeriesFromArray: (
    data: Record<string, unknown>[],
    nameKey: string,
    seriesKeys: string[]
  ): ChartDataPoint[] => {
    return data.map((item) => {
      const point: ChartDataPoint = {
        name: item[nameKey],
        value: 0,
      };

      seriesKeys.forEach((key) => {
        point[key] = item[key];
        point.value += item[key] || 0;
      });

      return point;
    });
  },
};
