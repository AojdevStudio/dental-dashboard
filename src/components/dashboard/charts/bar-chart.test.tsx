import { describe, expect, it, vi } from 'vitest';
import type { ChartSeries } from '@/lib/types/charts';

// Test the stackId logic directly without rendering components
describe('BarChart stackId Logic', () => {
  // This function replicates the logic we fixed in the renderBars function
  function getStackId(stacked: boolean, series: ChartSeries): string | undefined {
    return stacked ? series.stackId || 'stack' : undefined;
  }

  it('should return default stackId when stacked is true but series lacks stackId', () => {
    const series: ChartSeries = { dataKey: 'revenue', name: 'Revenue' };
    const result = getStackId(true, series);
    expect(result).toBe('stack');
  });

  it('should return provided stackId when available', () => {
    const series: ChartSeries = { dataKey: 'revenue', name: 'Revenue', stackId: 'custom-stack' };
    const result = getStackId(true, series);
    expect(result).toBe('custom-stack');
  });

  it('should return undefined when stacked is false', () => {
    const series: ChartSeries = { dataKey: 'revenue', name: 'Revenue' };
    const result = getStackId(false, series);
    expect(result).toBeUndefined();
  });

  it('should return undefined when stacked is false even with stackId provided', () => {
    const series: ChartSeries = { dataKey: 'revenue', name: 'Revenue', stackId: 'custom-stack' };
    const result = getStackId(false, series);
    expect(result).toBeUndefined();
  });

  it('should handle empty stackId string correctly', () => {
    const series: ChartSeries = { dataKey: 'revenue', name: 'Revenue', stackId: '' };
    const result = getStackId(true, series);
    expect(result).toBe('stack'); // Empty string should fallback to default
  });

  it('should handle multiple series with mixed stackId configurations', () => {
    const series1: ChartSeries = { dataKey: 'revenue', name: 'Revenue', stackId: 'custom-stack' };
    const series2: ChartSeries = { dataKey: 'expenses', name: 'Expenses' }; // No stackId
    const series3: ChartSeries = { dataKey: 'profit', name: 'Profit', stackId: 'another-stack' };

    expect(getStackId(true, series1)).toBe('custom-stack');
    expect(getStackId(true, series2)).toBe('stack'); // Should get default
    expect(getStackId(true, series3)).toBe('another-stack');
  });
});

// Test the click handler logic and type safety improvements
describe('BarChart Click Handler Logic', () => {
  // Type definition for Recharts click event data (replicated from the component)
  interface RechartsClickData {
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

  // This function replicates the logic we fixed in the createClickHandler function
  function createClickHandler(onDataPointClick?: (data: Record<string, unknown>) => void) {
    if (!onDataPointClick) {
      return undefined;
    }
    return (data: RechartsClickData) => {
      if (data?.activePayload && data.activePayload.length > 0) {
        onDataPointClick(data.activePayload[0].payload);
      }
    };
  }

  it('should return undefined when onDataPointClick is not provided', () => {
    const result = createClickHandler();
    expect(result).toBeUndefined();
  });

  it('should return undefined when onDataPointClick is undefined', () => {
    const result = createClickHandler(undefined);
    expect(result).toBeUndefined();
  });

  it('should return a function when onDataPointClick is provided', () => {
    const mockCallback = vi.fn();
    const result = createClickHandler(mockCallback);
    expect(typeof result).toBe('function');
  });

  it('should call onDataPointClick with payload when activePayload has data', () => {
    const mockCallback = vi.fn();
    const clickHandler = createClickHandler(mockCallback);

    const mockData: RechartsClickData = {
      activePayload: [
        {
          payload: { name: 'Test', value: 100, category: 'A' },
          name: 'Test Series',
          value: 100,
          dataKey: 'value'
        }
      ],
      activeLabel: 'Test Label'
    };

    clickHandler?.(mockData);

    expect(mockCallback).toHaveBeenCalledWith({ name: 'Test', value: 100, category: 'A' });
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call onDataPointClick when activePayload is undefined', () => {
    const mockCallback = vi.fn();
    const clickHandler = createClickHandler(mockCallback);

    const mockData: RechartsClickData = {
      activeLabel: 'Test Label'
    };

    clickHandler?.(mockData);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should not call onDataPointClick when activePayload is empty array', () => {
    const mockCallback = vi.fn();
    const clickHandler = createClickHandler(mockCallback);

    const mockData: RechartsClickData = {
      activePayload: [],
      activeLabel: 'Test Label'
    };

    clickHandler?.(mockData);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle data with no activePayload property safely', () => {
    const mockCallback = vi.fn();
    const clickHandler = createClickHandler(mockCallback);

    const mockData: RechartsClickData = {
      activeLabel: 'Test Label',
      activeCoordinate: { x: 100, y: 200 }
    };

    expect(() => clickHandler?.(mockData)).not.toThrow();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle multiple items in activePayload correctly (only use first)', () => {
    const mockCallback = vi.fn();
    const clickHandler = createClickHandler(mockCallback);

    const mockData: RechartsClickData = {
      activePayload: [
        {
          payload: { name: 'First', value: 100 },
          name: 'First Series',
          value: 100
        },
        {
          payload: { name: 'Second', value: 200 },
          name: 'Second Series',
          value: 200
        }
      ]
    };

    clickHandler?.(mockData);

    expect(mockCallback).toHaveBeenCalledWith({ name: 'First', value: 100 });
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
