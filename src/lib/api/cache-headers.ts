import { NextResponse } from 'next/server';

/**
 * Cache control strategies for different types of data
 */
export const CacheStrategies = {
  // Static data that rarely changes
  STATIC: {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // 1 day, stale for 7 days
  },

  // User-specific data that should be cached privately
  PRIVATE: {
    'Cache-Control': 'private, max-age=300, stale-while-revalidate=600', // 5 minutes, stale for 10 minutes
  },

  // Frequently updated data
  DYNAMIC: {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=120', // 1 minute, stale for 2 minutes
  },

  // Real-time data that shouldn't be cached
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },

  // Immutable data (with version/hash in URL)
  IMMUTABLE: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
  },
} as const;

/**
 * Apply cache headers to a NextResponse
 *
 * @param response - The NextResponse object
 * @param strategy - The caching strategy to apply
 * @returns The response with cache headers applied
 */
export function withCacheHeaders<T extends NextResponse>(
  response: T,
  strategy: keyof typeof CacheStrategies = 'PRIVATE'
): T {
  const headers = CacheStrategies[strategy];

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Create a cached JSON response
 *
 * @param data - The data to return
 * @param strategy - The caching strategy to apply
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with cache headers
 */
export function cachedJson(
  data: unknown,
  strategy: keyof typeof CacheStrategies = 'PRIVATE',
  status = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return withCacheHeaders(response, strategy);
}

/**
 * Add ETag support for conditional requests
 *
 * @param response - The NextResponse object
 * @param etag - The ETag value
 * @returns The response with ETag header
 */
export function withETag<T extends NextResponse>(response: T, etag: string): T {
  response.headers.set('ETag', `"${etag}"`);
  return response;
}

/**
 * Check if request has matching ETag
 *
 * @param request - The incoming request
 * @param currentETag - The current ETag value
 * @returns True if ETags match (304 Not Modified should be returned)
 */
export function isNotModified(request: Request, currentETag: string): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  return ifNoneMatch === `"${currentETag}"`;
}

/**
 * Return 304 Not Modified response
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 });
}
