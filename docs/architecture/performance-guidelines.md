# Performance Guidelines

## Overview

This document outlines performance optimization strategies, benchmarks, and best practices for the Dental Dashboard. It covers frontend optimization, database performance, API efficiency, caching strategies, and monitoring approaches to ensure a fast, responsive user experience.

## Quick Reference

```typescript
// Performance targets
- Initial page load: < 3 seconds
- Time to interactive: < 5 seconds
- API response time: < 200ms (p95)
- Database queries: < 100ms (p95)
- Core Web Vitals: All green
```

## Performance Benchmarks

### Target Metrics

```typescript
// Core Web Vitals targets
export const performanceTargets = {
  // Largest Contentful Paint
  LCP: {
    good: 2500, // < 2.5s
    needsImprovement: 4000, // < 4s
    poor: 4000 // > 4s
  },
  
  // First Input Delay
  FID: {
    good: 100, // < 100ms
    needsImprovement: 300, // < 300ms
    poor: 300 // > 300ms
  },
  
  // Cumulative Layout Shift
  CLS: {
    good: 0.1, // < 0.1
    needsImprovement: 0.25, // < 0.25
    poor: 0.25 // > 0.25
  },
  
  // Time to First Byte
  TTFB: {
    good: 600, // < 600ms
    needsImprovement: 1000, // < 1s
    poor: 1000 // > 1s
  }
}

// Application-specific targets
export const appMetrics = {
  dashboardLoad: 2000, // 2s
  providerListLoad: 1000, // 1s
  dataSync: 30000, // 30s for full sync
  reportGeneration: 5000, // 5s
  searchResults: 500 // 500ms
}
```

## Frontend Performance

### Code Splitting

```typescript
// Route-based code splitting with Next.js
// app/(dashboard)/providers/page.tsx
import dynamic from 'next/dynamic'

// Heavy components loaded on demand
const HeavyChart = dynamic(
  () => import('@/components/charts/heavy-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const ProviderAnalytics = dynamic(
  () => import('@/components/providers/analytics'),
  {
    loading: () => <AnalyticsSkeleton />
  }
)

// Component-level splitting
export default function ProvidersPage() {
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  return (
    <div>
      <ProviderList />
      
      {showAnalytics && (
        <Suspense fallback={<AnalyticsSkeleton />}>
          <ProviderAnalytics />
        </Suspense>
      )}
    </div>
  )
}
```

### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256]
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Tree shaking
    config.optimization.usedExports = true
    config.optimization.sideEffects = false
    
    // Module concatenation
    config.optimization.concatenateModules = true
    
    // Split chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          // Commons chunk
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20
          },
          // Library chunk
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
            },
            name(module) {
              const hash = crypto.createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          }
        }
      }
    }
    
    return config
  }
}
```

### React Optimization

```typescript
// Memoization strategies
import { memo, useMemo, useCallback } from 'react'

// Memoized component
export const ProviderCard = memo<ProviderCardProps>(
  ({ provider, onSelect }) => {
    return (
      <Card onClick={() => onSelect(provider.id)}>
        {/* Component content */}
      </Card>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.provider.id === nextProps.provider.id &&
      prevProps.provider.updatedAt === nextProps.provider.updatedAt
    )
  }
)

// Expensive calculations
export function useProviderMetrics(providers: Provider[]) {
  // Memoize expensive calculations
  const metrics = useMemo(() => {
    return providers.reduce((acc, provider) => {
      const ytdProduction = calculateYTDProduction(provider)
      const activePatients = countActivePatients(provider)
      
      return {
        ...acc,
        [provider.id]: {
          ytdProduction,
          activePatients,
          efficiency: ytdProduction / activePatients
        }
      }
    }, {})
  }, [providers])
  
  // Memoize callbacks
  const getProviderMetric = useCallback(
    (providerId: string, metric: string) => {
      return metrics[providerId]?.[metric] ?? 0
    },
    [metrics]
  )
  
  return { metrics, getProviderMetric }
}

// Virtualization for large lists
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualProviderList({ providers }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: providers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated row height
    overscan: 5 // Render 5 items outside viewport
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <ProviderCard provider={providers[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Image Optimization

```typescript
// Optimized image component
import Image from 'next/image'

export function OptimizedAvatar({ 
  src, 
  alt, 
  size = 40 
}: AvatarProps) {
  const [error, setError] = useState(false)
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!error && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="rounded-full object-cover"
          placeholder="blur"
          blurDataURL={generateBlurDataURL()}
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
          {getInitials(alt)}
        </div>
      )}
    </div>
  )
}

// Generate blur placeholder
function generateBlurDataURL(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, 10, 10)
  
  return canvas.toDataURL()
}
```

## Database Performance

### Query Optimization

```typescript
// Efficient Prisma queries
// ❌ Bad: N+1 query problem
const providers = await prisma.provider.findMany()
for (const provider of providers) {
  const locations = await prisma.providerLocation.findMany({
    where: { providerId: provider.id }
  })
  provider.locations = locations
}

// ✅ Good: Single query with includes
const providers = await prisma.provider.findMany({
  include: {
    locations: {
      include: {
        location: true
      }
    },
    user: {
      select: {
        email: true,
        lastLoginAt: true
      }
    }
  }
})

// ✅ Better: Select only needed fields
const providers = await prisma.provider.findMany({
  select: {
    id: true,
    displayName: true,
    type: true,
    locations: {
      select: {
        location: {
          select: {
            id: true,
            name: true
          }
        },
        isPrimary: true
      }
    }
  }
})
```

### Index Strategy

```sql
-- Performance-critical indexes
-- Composite index for common queries
CREATE INDEX idx_appointments_provider_date 
  ON appointments(provider_id, scheduled_start DESC)
  WHERE status != 'cancelled';

-- Partial index for active records
CREATE INDEX idx_providers_active_clinic 
  ON providers(clinic_id)
  WHERE is_active = true;

-- GIN index for full-text search
CREATE INDEX idx_patients_search 
  ON patients USING gin(
    to_tsvector('english', 
      first_name || ' ' || last_name || ' ' || 
      COALESCE(preferred_name, '') || ' ' ||
      COALESCE(email, '')
    )
  );

-- BRIN index for time-series data
CREATE INDEX idx_daily_financials_date_brin 
  ON daily_financials USING brin(date)
  WITH (pages_per_range = 128);

-- Index for JSON queries
CREATE INDEX idx_provider_schedule 
  ON providers USING gin(work_schedule);

-- Monitoring index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Connection Pooling

```typescript
// Prisma connection pool configuration
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  // connection_limit = 25
  // pool_timeout = 10
}

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    // Query engine optimizations
    datasources: {
      db: {
        url: process.env.DATABASE_URL!
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connection management
export async function optimizeDatabaseConnections() {
  // Preconnect to reduce cold start
  await prisma.$connect()
  
  // Set statement timeout
  await prisma.$executeRaw`SET statement_timeout = '10s'`
  
  // Enable query planning optimizations
  await prisma.$executeRaw`SET random_page_cost = 1.1`
  await prisma.$executeRaw`SET effective_cache_size = '4GB'`
}
```

### Query Performance Monitoring

```typescript
// Query performance tracking
import { Prisma } from '@prisma/client'

// Prisma middleware for performance monitoring
prisma.$use(async (params, next) => {
  const start = Date.now()
  
  const result = await next(params)
  
  const duration = Date.now() - start
  
  // Log slow queries
  if (duration > 100) {
    console.warn('Slow query detected:', {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
      args: params.args
    })
    
    // Send to monitoring service
    await sendToMonitoring({
      type: 'slow_query',
      model: params.model,
      action: params.action,
      duration,
      timestamp: new Date()
    })
  }
  
  return result
})

// Query analysis helper
export async function analyzeQuery(query: string) {
  const result = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS) ${Prisma.raw(query)}
  `
  
  return {
    query,
    plan: result,
    recommendations: generateOptimizationRecommendations(result)
  }
}
```

## API Performance

### Response Optimization

```typescript
// Efficient API responses
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Parse pagination params
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const skip = (page - 1) * limit
  
  // Parallel queries for data and count
  const [data, total] = await Promise.all([
    prisma.provider.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        displayName: true,
        type: true,
        email: true,
        // Only include necessary fields
      },
      orderBy: { displayName: 'asc' }
    }),
    prisma.provider.count()
  ])
  
  // Set cache headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
    'X-Total-Count': total.toString(),
    'X-Page-Count': Math.ceil(total / limit).toString()
  })
  
  return new Response(
    JSON.stringify({ data, page, limit, total }),
    { headers }
  )
}

// Streaming large responses
export async function streamLargeDataset() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      // Start JSON array
      controller.enqueue(encoder.encode('['))
      
      let offset = 0
      const batchSize = 100
      let first = true
      
      while (true) {
        const batch = await prisma.dailyFinancials.findMany({
          skip: offset,
          take: batchSize,
          orderBy: { date: 'desc' }
        })
        
        if (batch.length === 0) break
        
        for (const record of batch) {
          if (!first) {
            controller.enqueue(encoder.encode(','))
          }
          first = false
          
          controller.enqueue(
            encoder.encode(JSON.stringify(record))
          )
        }
        
        offset += batchSize
      }
      
      // End JSON array
      controller.enqueue(encoder.encode(']'))
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    }
  })
}
```

### Request Batching

```typescript
// Batch multiple requests
export class APIBatcher {
  private queue: Map<string, {
    resolve: (value: any) => void
    reject: (error: any) => void
  }[]> = new Map()
  
  private timeout: NodeJS.Timeout | null = null
  
  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queue.has(key)) {
        this.queue.set(key, [])
      }
      
      this.queue.get(key)!.push({ resolve, reject })
      
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), 10)
      }
    })
  }
  
  private async flush() {
    const batch = Array.from(this.queue.entries())
    this.queue.clear()
    this.timeout = null
    
    if (batch.length === 0) return
    
    try {
      // Batch request
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: batch.map(([key]) => key)
        })
      })
      
      const results = await response.json()
      
      // Resolve individual promises
      batch.forEach(([key, callbacks]) => {
        const result = results[key]
        
        callbacks.forEach(({ resolve, reject }) => {
          if (result.error) {
            reject(result.error)
          } else {
            resolve(result.data)
          }
        })
      })
    } catch (error) {
      // Reject all promises on error
      batch.forEach(([_, callbacks]) => {
        callbacks.forEach(({ reject }) => reject(error))
      })
    }
  }
}

// Usage
const batcher = new APIBatcher()

// These will be batched into a single request
const [user1, user2, user3] = await Promise.all([
  batcher.get('user:1'),
  batcher.get('user:2'),
  batcher.get('user:3')
])
```

## Caching Strategies

### Server-Side Caching

```typescript
// Redis caching with automatic invalidation
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export class CacheManager {
  private static readonly TTL = {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400 // 24 hours
  }
  
  static async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get(key)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  static async set(
    key: string, 
    value: any, 
    ttl: keyof typeof CacheManager.TTL = 'medium'
  ): Promise<void> {
    try {
      await redis.setex(
        key, 
        CacheManager.TTL[ttl], 
        JSON.stringify(value)
      )
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }
  
  // Stale-while-revalidate pattern
  static async swr<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: keyof typeof CacheManager.TTL
      staleTime?: number
    } = {}
  ): Promise<T> {
    const cached = await this.get<{
      data: T
      timestamp: number
    }>(key)
    
    const now = Date.now()
    const staleTime = options.staleTime || 60000 // 1 minute
    
    // Return cached data if fresh
    if (cached && (now - cached.timestamp) < staleTime) {
      return cached.data
    }
    
    // Return stale data and revalidate in background
    if (cached) {
      fetcher().then(fresh => {
        this.set(key, {
          data: fresh,
          timestamp: Date.now()
        }, options.ttl)
      }).catch(console.error)
      
      return cached.data
    }
    
    // No cache, fetch fresh
    const fresh = await fetcher()
    await this.set(key, {
      data: fresh,
      timestamp: Date.now()
    }, options.ttl)
    
    return fresh
  }
}

// Cache-aware API handler
export async function getCachedProviders(clinicId: string) {
  const cacheKey = `providers:${clinicId}`
  
  return CacheManager.swr(
    cacheKey,
    async () => {
      const providers = await prisma.provider.findMany({
        where: { clinicId, isActive: true },
        include: {
          locations: {
            include: { location: true }
          }
        }
      })
      
      return providers
    },
    { ttl: 'long', staleTime: 300000 } // 5 min stale time
  )
}
```

### Client-Side Caching

```typescript
// React Query configuration for optimal caching
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        if (failureCount >= 3) return false
        return true
      },
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Background refetch interval
      refetchInterval: false
    }
  }
})

// Prefetching strategy
export function usePrefetchProviders() {
  const queryClient = useQueryClient()
  
  return useCallback((clinicId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['providers', clinicId],
      queryFn: () => fetchProviders(clinicId),
      staleTime: 10 * 60 * 1000
    })
  }, [queryClient])
}

// Optimistic updates
export function useUpdateProvider() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProvider,
    onMutate: async (updatedProvider) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ 
        queryKey: ['provider', updatedProvider.id] 
      })
      
      // Snapshot previous value
      const previousProvider = queryClient.getQueryData([
        'provider', 
        updatedProvider.id
      ])
      
      // Optimistically update
      queryClient.setQueryData(
        ['provider', updatedProvider.id], 
        updatedProvider
      )
      
      return { previousProvider }
    },
    onError: (err, updatedProvider, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['provider', updatedProvider.id],
        context?.previousProvider
      )
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: ['provider', variables.id] 
      })
    }
  })
}
```

### Edge Caching

```typescript
// Next.js edge caching configuration
export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId')
  
  // Generate cache key
  const cacheKey = new Request(request.url, {
    method: 'GET',
    headers: {
      'X-Cache-Key': `dashboard-${clinicId}`
    }
  })
  
  // Check edge cache
  const cache = await caches.open('dashboard-v1')
  const cached = await cache.match(cacheKey)
  
  if (cached) {
    // Return cached response with updated headers
    const age = Date.now() - new Date(cached.headers.get('date')!).getTime()
    
    return new Response(cached.body, {
      headers: {
        ...cached.headers,
        'X-Cache-Status': 'HIT',
        'Age': Math.floor(age / 1000).toString()
      }
    })
  }
  
  // Fetch fresh data
  const data = await fetchDashboardData(clinicId!)
  
  // Create response
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Cache-Status': 'MISS'
    }
  })
  
  // Store in edge cache
  await cache.put(cacheKey, response.clone())
  
  return response
}
```

## Resource Loading

### Lazy Loading

```typescript
// Intersection Observer for lazy loading
export function useLazyLoad<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.unobserve(element)
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before visible
      }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [])
  
  return { ref, isIntersecting }
}

// Lazy loaded component
export function LazyChart({ data }: Props) {
  const { ref, isIntersecting } = useLazyLoad<HTMLDivElement>()
  
  return (
    <div ref={ref} className="h-[400px]">
      {isIntersecting ? (
        <Suspense fallback={<ChartSkeleton />}>
          <ExpensiveChart data={data} />
        </Suspense>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  )
}
```

### Resource Hints

```typescript
// Resource preloading
export function ResourceHints() {
  return (
    <Head>
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="https://supabase.co" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      
      {/* Preconnect to establish early connections */}
      <link 
        rel="preconnect" 
        href="https://supabase.co" 
        crossOrigin="anonymous" 
      />
      
      {/* Preload critical resources */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* Prefetch next likely navigation */}
      <link 
        rel="prefetch" 
        href="/api/dashboard-data" 
        as="fetch" 
        crossOrigin="anonymous" 
      />
      
      {/* Module preload for critical JS */}
      <link 
        rel="modulepreload" 
        href="/_next/static/chunks/framework.js" 
      />
    </Head>
  )
}
```

## Monitoring and Analytics

### Performance Monitoring

```typescript
// Real User Monitoring (RUM)
export function initPerformanceMonitoring() {
  // Web Vitals
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics)
      getFID(sendToAnalytics)
      getFCP(sendToAnalytics)
      getLCP(sendToAnalytics)
      getTTFB(sendToAnalytics)
    })
  }
  
  // Custom metrics
  performance.mark('app-interactive')
  
  // Navigation timing
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.fetchStart,
      download: navigation.responseEnd - navigation.responseStart,
      domParse: navigation.domInteractive - navigation.domLoading,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      onLoad: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart
    }
    
    sendToAnalytics({ name: 'navigation', ...metrics })
  })
}

// Send metrics to analytics
function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta
    })
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, metric.value)
  }
}
```

### Custom Performance Marks

```typescript
// Performance tracking utilities
export class PerformanceTracker {
  private marks: Map<string, number> = new Map()
  
  start(name: string) {
    this.marks.set(name, performance.now())
    performance.mark(`${name}-start`)
  }
  
  end(name: string, metadata?: any) {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`No start mark found for ${name}`)
      return
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    // Log performance data
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metadata)
    
    // Send to monitoring
    sendToAnalytics({
      name: `custom-${name}`,
      value: duration,
      metadata
    })
    
    this.marks.delete(name)
    
    return duration
  }
}

// Usage in components
const perf = new PerformanceTracker()

export function DashboardPage() {
  useEffect(() => {
    perf.start('dashboard-load')
    
    // Cleanup
    return () => {
      perf.end('dashboard-load', {
        route: '/dashboard',
        timestamp: new Date().toISOString()
      })
    }
  }, [])
  
  return <Dashboard />
}
```

### Performance Budget

```javascript
// performance-budget.config.js
module.exports = {
  bundles: [
    {
      name: 'main',
      path: '.next/static/chunks/main-*.js',
      maxSize: '100kb'
    },
    {
      name: 'framework',
      path: '.next/static/chunks/framework-*.js',
      maxSize: '150kb'
    },
    {
      name: 'total-javascript',
      path: '.next/static/chunks/*.js',
      maxSize: '400kb'
    },
    {
      name: 'total-css',
      path: '.next/static/css/*.css',
      maxSize: '50kb'
    }
  ],
  metrics: {
    'first-contentful-paint': 1500,
    'largest-contentful-paint': 2500,
    'time-to-interactive': 3500,
    'cumulative-layout-shift': 0.1,
    'max-potential-fid': 100
  }
}
```

## Performance Testing

### Load Testing

```typescript
// k6 load test script
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp to 50
    { duration: '1m', target: 50 },   // Stay at 50
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
}

export default function () {
  // Test dashboard API
  const dashboardRes = http.get(`${__ENV.API_URL}/api/dashboard`, {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  })
  
  check(dashboardRes, {
    'dashboard status 200': (r) => r.status === 200,
    'dashboard load time OK': (r) => r.timings.duration < 200,
  })
  
  // Test provider list
  const providersRes = http.get(`${__ENV.API_URL}/api/providers`, {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  })
  
  check(providersRes, {
    'providers status 200': (r) => r.status === 200,
    'providers load time OK': (r) => r.timings.duration < 150,
  })
  
  sleep(1)
}
```

## Optimization Checklist

```typescript
export const performanceChecklist = {
  frontend: [
    'Enable code splitting for routes',
    'Lazy load heavy components',
    'Optimize bundle size (<400KB)',
    'Use image optimization',
    'Implement virtual scrolling for long lists',
    'Memoize expensive calculations',
    'Use production builds',
    'Enable compression (gzip/brotli)'
  ],
  
  backend: [
    'Add database indexes for common queries',
    'Use connection pooling',
    'Implement query result caching',
    'Optimize N+1 queries',
    'Use pagination for large datasets',
    'Enable query logging in development',
    'Monitor slow queries',
    'Use read replicas for analytics'
  ],
  
  api: [
    'Implement response caching',
    'Use ETags for conditional requests',
    'Enable compression',
    'Implement request batching',
    'Use field filtering',
    'Add rate limiting',
    'Stream large responses',
    'Use CDN for static assets'
  ],
  
  monitoring: [
    'Track Core Web Vitals',
    'Monitor API response times',
    'Set up error tracking',
    'Create performance budgets',
    'Run regular load tests',
    'Monitor database performance',
    'Track cache hit rates',
    'Set up alerts for degradation'
  ]
}
```

## Related Resources

- [Frontend Architecture](./frontend-architecture.md) - React optimization
- [Backend Architecture](./backend-architecture.md) - API performance
- [Database Schema](./database-schema.md) - Query optimization
- [Monitoring Guide](./monitoring-guide.md) - Performance tracking

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)