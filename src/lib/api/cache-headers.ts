import { NextResponse } from 'next/server';

/**
 * Predefined cache control strategies for different types of API responses
 *
 * This object provides a comprehensive set of caching strategies optimized
 * for different data types and usage patterns in the dental dashboard application.
 * Each strategy balances performance with data freshness requirements.
 *
 * Strategy Details:
 * - STATIC: For data that rarely changes (e.g., clinic information, provider types)
 * - PRIVATE: For user-specific data that should be cached privately (e.g., user profile)
 * - DYNAMIC: For frequently updated data (e.g., metrics, dashboard data)
 * - NO_CACHE: For real-time data that must always be fresh (e.g., auth status)
 * - IMMUTABLE: For versioned/hashed resources that never change
 *
 * @constant
 * @type {Record<string, Record<string, string>>}
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
 * Applies appropriate cache control headers to a NextResponse based on the specified strategy
 *
 * This utility function enhances API responses with optimal caching behavior.
 * It applies the selected caching strategy headers to improve performance
 * and reduce unnecessary API calls while maintaining data freshness.
 *
 * @template T - The NextResponse type being extended
 * @param response - The NextResponse object to enhance with cache headers
 * @param strategy - The caching strategy key from CacheStrategies (default: 'PRIVATE')
 * @returns The enhanced response object with cache headers applied
 *
 * @example
 * // Apply private caching to user data
 * const response = NextResponse.json(userData);
 * return withCacheHeaders(response, 'PRIVATE');
 *
 * @example
 * // Apply static caching to configuration data
 * const response = NextResponse.json(config);
 * return withCacheHeaders(response, 'STATIC');
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
 * Creates a JSON response with appropriate cache headers in a single operation
 *
 * This convenience function combines JSON response creation with cache header
 * application, providing a streamlined way to return properly cached API responses.
 * It's the recommended way to return JSON data from API routes.
 *
 * @param data - The data object to serialize and return as JSON
 * @param strategy - The caching strategy key from CacheStrategies (default: 'PRIVATE')
 * @param status - HTTP status code for the response (default: 200)
 * @returns NextResponse containing JSON data with appropriate cache headers
 *
 * @example
 * // Return user data with private caching
 * return cachedJson(userData, 'PRIVATE');
 *
 * @example
 * // Return error with no caching
 * return cachedJson({ error: 'Not found' }, 'NO_CACHE', 404);
 *
 * @example
 * // Return static configuration data
 * return cachedJson(appConfig, 'STATIC');
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
 * Adds ETag header support for HTTP conditional requests and efficient caching
 *
 * ETags enable conditional requests where clients can check if content has changed
 * before downloading it again. This reduces bandwidth and improves performance
 * by allowing 304 Not Modified responses for unchanged content.
 *
 * @template T - The NextResponse type being extended
 * @param response - The NextResponse object to add ETag header to
 * @param etag - The ETag value (will be wrapped in quotes automatically)
 * @returns The response object with ETag header added
 *
 * @example
 * // Add ETag based on content hash
 * const contentHash = generateHash(responseData);
 * return withETag(response, contentHash);
 *
 * @example
 * // Use with database record version
 * const etag = `${record.id}-${record.updatedAt.getTime()}`;
 * return withETag(response, etag);
 */
export function withETag<T extends NextResponse>(response: T, etag: string): T {
  response.headers.set('ETag', `"${etag}"`);
  return response;
}

/**
 * Checks if the incoming request has a matching ETag for conditional request handling
 *
 * This function compares the If-None-Match header from the client request with
 * the current ETag value to determine if the content has changed. If they match,
 * the client already has the latest version and a 304 Not Modified response
 * should be returned instead of sending the full content.
 *
 * @param request - The incoming HTTP request object
 * @param currentETag - The current ETag value for the requested resource
 * @returns Boolean indicating if ETags match (true = content not modified)
 *
 * @example
 * // Check for conditional request in API route
 * if (isNotModified(request, currentETag)) {
 *   return notModifiedResponse();
 * }
 * return cachedJson(freshData, 'PRIVATE');
 *
 * @example
 * // Use with database record versioning
 * const recordETag = `${record.id}-${record.version}`;
 * if (isNotModified(request, recordETag)) {
 *   return notModifiedResponse();
 * }
 */
export function isNotModified(request: Request, currentETag: string): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  return ifNoneMatch === `"${currentETag}"`;
}

/**
 * Creates a 304 Not Modified response for unchanged content
 *
 * This function returns a standard 304 Not Modified HTTP response,
 * indicating that the requested resource hasn't changed since the
 * client's cached version. This saves bandwidth and improves performance
 * by avoiding unnecessary data transfer.
 *
 * @returns NextResponse with 304 status and empty body
 *
 * @example
 * // Return 304 for unchanged content
 * if (isNotModified(request, currentETag)) {
 *   return notModifiedResponse();
 * }
 *
 * @example
 * // Use in combination with ETag checking
 * const resourceETag = generateETag(resource);
 * if (isNotModified(request, resourceETag)) {
 *   return notModifiedResponse();
 * }
 * return withETag(cachedJson(resource, 'PRIVATE'), resourceETag);
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 });
}
