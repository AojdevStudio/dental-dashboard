/**
 * Provider Metrics API Route - Enhanced with caching and performance optimization
 */

import { withAuth } from '@/lib/api/middleware';
import { ApiError, apiError, apiSuccess } from '@/lib/api/responses';
import { calculateProviderMetrics } from '@/lib/metrics/provider-calculations';
import type { MetricsQueryParams, ProviderMetrics } from '@/types/provider-metrics';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const MetricsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  clinicId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeComparative: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  includeGoals: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  refreshCache: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

const ProviderIdSchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
});

// Cache configuration
const CACHE_TTL = {
  daily: 15 * 60, // 15 minutes for daily metrics
  weekly: 30 * 60, // 30 minutes for weekly
  monthly: 60 * 60, // 1 hour for monthly
  quarterly: 2 * 60 * 60, // 2 hours for quarterly
  yearly: 4 * 60 * 60, // 4 hours for yearly
};

// In-memory cache for development (use Redis in production)
const metricsCache = new Map<
  string,
  {
    data: ProviderMetrics;
    timestamp: number;
    ttl: number;
  }
>();

/**
 * Generate cache key for metrics
 */
function generateCacheKey(providerId: string, params: MetricsQueryParams): string {
  const baseKey = `metrics:${providerId}:${params.period}`;
  const dateKey = params.dateRange
    ? `:${params.dateRange.startDate.toISOString()}:${params.dateRange.endDate.toISOString()}`
    : '';
  const optionsKey = `:${params.includeComparative}:${params.includeGoals}`;
  const clinicKey = params.clinicId ? `:${params.clinicId}` : '';

  return `${baseKey}${dateKey}${optionsKey}${clinicKey}`;
}

/**
 * Get cached metrics if valid
 */
function getCachedMetrics(cacheKey: string): ProviderMetrics | null {
  const cached = metricsCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl * 1000) {
    metricsCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

/**
 * Cache metrics data
 */
function setCachedMetrics(cacheKey: string, data: ProviderMetrics, ttlSeconds: number): void {
  metricsCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  });
}

/**
 * Clear cache for provider
 */
function clearProviderCache(providerId: string): void {
  const keysToDelete = Array.from(metricsCache.keys()).filter((key) =>
    key.startsWith(`metrics:${providerId}`)
  );
  keysToDelete.forEach((key) => metricsCache.delete(key));
}

/**
 * GET /api/providers/[providerId]/metrics - Get provider metrics with caching
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const params = await context.params;
      const { searchParams } = new URL(req.url);

      // Validate provider ID
      const providerValidation = ProviderIdSchema.safeParse(params);
      if (!providerValidation.success) {
        return apiError('Invalid provider ID format', 400, providerValidation.error.errors);
      }

      const { providerId } = providerValidation.data;

      // Validate query parameters
      const queryValidation = MetricsQuerySchema.safeParse(
        Object.fromEntries(searchParams.entries())
      );
      if (!queryValidation.success) {
        return apiError('Invalid query parameters', 400, queryValidation.error.errors);
      }

      const queryParams = queryValidation.data;

      // Build metrics query parameters
      const metricsParams: MetricsQueryParams = {
        providerId,
        clinicId: queryParams.clinicId,
        period: queryParams.period,
        dateRange:
          queryParams.startDate && queryParams.endDate
            ? {
                startDate: new Date(queryParams.startDate),
                endDate: new Date(queryParams.endDate),
              }
            : undefined,
        includeComparative: queryParams.includeComparative,
        includeGoals: queryParams.includeGoals,
        refreshCache: queryParams.refreshCache,
      };

      // Generate cache key
      const cacheKey = generateCacheKey(providerId, metricsParams);
      const cacheTtl = CACHE_TTL[queryParams.period];

      // Check cache unless refresh is requested
      if (!queryParams.refreshCache) {
        const cachedMetrics = getCachedMetrics(cacheKey);
        if (cachedMetrics) {
          return apiSuccess(cachedMetrics, {
            'X-Cache': 'HIT',
            'X-Cache-TTL': String(cacheTtl),
          });
        }
      }

      // Performance timing
      const startTime = Date.now();

      // Calculate metrics
      const result = await calculateProviderMetrics(metricsParams);

      if (!result.success) {
        throw new ApiError(result.error || 'Failed to calculate provider metrics', 500);
      }

      const calculationTime = Date.now() - startTime;

      // Cache the results
      setCachedMetrics(cacheKey, result.data, cacheTtl);

      // Add performance headers
      const headers = {
        'X-Cache': 'MISS',
        'X-Cache-TTL': String(cacheTtl),
        'X-Calculation-Time': String(calculationTime),
        'Cache-Control': `public, max-age=${cacheTtl}, stale-while-revalidate=${cacheTtl * 2}`,
      };

      return apiSuccess(result.data, headers);
    } catch (error) {
      console.error('Provider metrics API error:', error);

      if (error instanceof ApiError) {
        return apiError(error.message, error.statusCode);
      }

      return apiError('Internal server error while fetching provider metrics', 500);
    }
  }
);

/**
 * POST /api/providers/[providerId]/metrics/refresh - Refresh metrics cache
 */
export const POST = withAuth(
  async (req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const params = await context.params;

      // Validate provider ID
      const providerValidation = ProviderIdSchema.safeParse(params);
      if (!providerValidation.success) {
        return apiError('Invalid provider ID format', 400, providerValidation.error.errors);
      }

      const { providerId } = providerValidation.data;

      // Clear all cached metrics for this provider
      clearProviderCache(providerId);

      return apiSuccess({
        message: 'Metrics cache refreshed successfully',
        providerId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Provider metrics cache refresh error:', error);

      if (error instanceof ApiError) {
        return apiError(error.message, error.statusCode);
      }

      return apiError('Internal server error while refreshing metrics cache', 500);
    }
  }
);

/**
 * GET /api/providers/[providerId]/metrics/cache-status - Get cache status
 */
export const HEAD = withAuth(
  async (req: NextRequest, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const params = await context.params;
      const { searchParams } = new URL(req.url);

      // Validate provider ID
      const providerValidation = ProviderIdSchema.safeParse(params);
      if (!providerValidation.success) {
        return new NextResponse(null, { status: 400 });
      }

      const { providerId } = providerValidation.data;

      // Validate minimal query parameters for cache key generation
      const period = searchParams.get('period') || 'monthly';
      const cacheKey = generateCacheKey(providerId, {
        providerId,
        period: period as any,
        includeComparative: true,
        includeGoals: true,
      });

      const cached = metricsCache.get(cacheKey);
      const isCached = cached && Date.now() - cached.timestamp < cached.ttl * 1000;

      const headers = {
        'X-Cache-Status': isCached ? 'HIT' : 'MISS',
        'X-Cache-Size': String(metricsCache.size),
        ...(cached && {
          'X-Cache-Age': String(Math.floor((Date.now() - cached.timestamp) / 1000)),
          'X-Cache-TTL': String(cached.ttl),
        }),
      };

      return new NextResponse(null, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('Provider metrics cache status error:', error);
      return new NextResponse(null, { status: 500 });
    }
  }
);

/**
 * Export cache utilities for testing and monitoring
 */
export const cacheUtils = {
  getCacheSize: () => metricsCache.size,
  clearAllCache: () => metricsCache.clear(),
  getCacheKeys: () => Array.from(metricsCache.keys()),
  getCacheStats: () => {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    metricsCache.forEach((value) => {
      totalSize += JSON.stringify(value.data).length;
      if (now - value.timestamp > value.ttl * 1000) {
        expiredCount++;
      }
    });

    return {
      totalEntries: metricsCache.size,
      expiredEntries: expiredCount,
      totalSizeBytes: totalSize,
      averageSizeBytes: metricsCache.size > 0 ? totalSize / metricsCache.size : 0,
    };
  },
};
