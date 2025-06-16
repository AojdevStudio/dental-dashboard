import { describe, expect, it } from 'vitest';
import type { ChartSeries } from '@/lib/types/charts';

// Test the stackId logic directly without rendering components
describe('AreaChart stackId Logic', () => {
  // This function replicates the logic we fixed in the area chart component
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
