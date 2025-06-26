/**
 * Performance Monitoring Utilities
 *
 * Tools for measuring and monitoring dashboard performance to ensure
 * load times remain under 2 seconds and chart rendering under 1 second
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceThresholds {
  pageLoad: number; // 2 seconds
  chartRender: number; // 1 second
  apiResponse: number; // 500ms
  databaseQuery: number; // 200ms
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds: PerformanceThresholds = {
    pageLoad: 2000,
    chartRender: 1000,
    apiResponse: 500,
    databaseQuery: 200,
  };

  /**
   * Start measuring a performance metric
   */
  start(name: string, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  /**
   * End measuring a performance metric
   */
  end(name: string, metadata?: Record<string, unknown>): number {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.metadata = { ...metric.metadata, ...metadata };

    // Check against thresholds
    this.checkThreshold(name, duration);

    // Log performance data
    this.logMetric(metric);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    this.start(name, metadata);

    try {
      const result = await fn();
      const duration = this.end(name);
      return { result, duration };
    } catch (error) {
      this.end(name, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Measure React component render time
   */
  measureRender(componentName: string, metadata?: Record<string, unknown>) {
    const measureName = `render:${componentName}`;

    return {
      start: () => this.start(measureName, metadata),
      end: () => this.end(measureName),
    };
  }

  /**
   * Measure API request performance
   */
  async measureApiRequest<T>(
    url: string,
    requestFn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    const name = `api:${url}`;
    return this.measure(name, requestFn, metadata);
  }

  /**
   * Measure database query performance
   */
  async measureDatabaseQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    const name = `db:${queryName}`;
    return this.measure(name, queryFn, metadata);
  }

  /**
   * Check if duration exceeds threshold
   */
  private checkThreshold(name: string, duration: number): void {
    let threshold: number | undefined;

    if (name.includes('page') || name.includes('load')) {
      threshold = this.thresholds.pageLoad;
    } else if (name.includes('chart') || name.includes('render')) {
      threshold = this.thresholds.chartRender;
    } else if (name.includes('api')) {
      threshold = this.thresholds.apiResponse;
    } else if (name.includes('db')) {
      threshold = this.thresholds.databaseQuery;
    }

    if (threshold && duration > threshold) {
      console.warn(
        `Performance threshold exceeded for "${name}": ${duration.toFixed(2)}ms > ${threshold}ms`
      );

      // In production, you might want to send this to a monitoring service
      if (typeof window !== 'undefined' && 'navigator' in window && 'sendBeacon' in navigator) {
        const data = JSON.stringify({
          type: 'performance_threshold_exceeded',
          metric: name,
          duration,
          threshold,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });

        // Send to monitoring endpoint (implement as needed)
        // navigator.sendBeacon('/api/monitoring/performance', data);
      }
    }
  }

  /**
   * Log performance metric
   */
  private logMetric(metric: PerformanceMetric): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Performance: ${metric.name} took ${metric.duration?.toFixed(2)}ms`,
        metric.metadata
      );
    }

    // In production, send to analytics/monitoring service
    if (process.env.NODE_ENV === 'production' && metric.duration) {
      // Example: Send to analytics service
      // analytics.track('performance_metric', {
      //   name: metric.name,
      //   duration: metric.duration,
      //   metadata: metric.metadata,
      // });
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    thresholdViolations: number;
  } {
    const metrics = this.getMetrics();
    const completedMetrics = metrics.filter((m) => m.duration !== undefined);

    if (completedMetrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        thresholdViolations: 0,
      };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / completedMetrics.length;

    const slowestMetric = completedMetrics.reduce((slowest, current) =>
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    const thresholdViolations = completedMetrics.filter((m) => {
      const duration = m.duration || 0;
      if (m.name.includes('page') || m.name.includes('load')) {
        return duration > this.thresholds.pageLoad;
      }
      if (m.name.includes('chart') || m.name.includes('render')) {
        return duration > this.thresholds.chartRender;
      }
      if (m.name.includes('api')) {
        return duration > this.thresholds.apiResponse;
      }
      if (m.name.includes('db')) {
        return duration > this.thresholds.databaseQuery;
      }
      return false;
    }).length;

    return {
      totalMetrics: completedMetrics.length,
      averageDuration,
      slowestMetric,
      thresholdViolations,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Update performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const measure = performanceMonitor.measureRender(componentName);

  return {
    startMeasure: measure.start,
    endMeasure: measure.end,
    measureAsync: async <T>(fn: () => Promise<T>) => {
      const name = `${componentName}:async`;
      return performanceMonitor.measure(name, fn);
    },
  };
}

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(name?: string) {
  return <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (this: any, ...args: any[]) {
      return performanceMonitor.measure(measureName, () => originalMethod?.apply(this, args));
    } as T;

    return descriptor;
  };
}

/**
 * Utility for measuring Web Vitals
 */
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Measure First Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
        performanceMonitor.start('web-vitals:fcp');
        performanceMonitor.end('web-vitals:fcp');
      }
    }
  });

  observer.observe({ entryTypes: ['paint'] });

  // Measure Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    performanceMonitor.start('web-vitals:lcp');
    setTimeout(() => {
      performanceMonitor.end('web-vitals:lcp');
    }, lastEntry.startTime);
  });

  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Measure Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }

    // Store CLS value using public API
    performanceMonitor.start('web-vitals:cls');
    setTimeout(() => {
      performanceMonitor.end('web-vitals:cls');
    }, clsValue);
  });

  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Export the singleton instance
 */
export { performanceMonitor };

/**
 * Convenience functions
 */
export const {
  start: startPerformanceMeasure,
  end: endPerformanceMeasure,
  measure: measurePerformanceFunction,
  measureApiRequest,
  measureDatabaseQuery,
  getMetrics,
  getSummary: getPerformanceSummary,
  clear: clearPerformanceMetrics,
} = performanceMonitor;
