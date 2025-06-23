# Troubleshooting Guide

## Overview

This comprehensive guide helps diagnose and resolve common issues in the Dental Dashboard application. It covers development problems, production issues, performance bottlenecks, and provides systematic debugging approaches.

## Quick Reference

```bash
# Common fixes
pnpm install          # Dependency issues
pnpm prisma generate  # Prisma client issues
pnpm dev --turbo      # Development server issues
pnpm clean           # Clean all caches
pnpm test:start      # Local test database issues
```

## Development Issues

### Environment Setup

#### Issue: Environment variables not loading

**Symptoms:**
- `undefined` values for env vars
- Authentication failures
- Database connection errors

**Solution:**
```bash
# 1. Check .env.local exists
ls -la .env*

# 2. Verify format (no spaces around =)
# ✅ Correct
DATABASE_URL="postgresql://..."
# ❌ Wrong
DATABASE_URL = "postgresql://..."

# 3. Restart dev server
pnpm dev

# 4. Debug env loading
// Add to next.config.js
console.log('Env check:', {
  DATABASE_URL: process.env.DATABASE_URL ? '✓' : '✗',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'
})
```

#### Issue: Port already in use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Database Issues

#### Issue: Prisma client not generated

**Symptoms:**
- `Cannot find module '@prisma/client'`
- Type errors for Prisma models

**Solution:**
```bash
# Generate Prisma client
pnpm prisma generate

# If that fails, try:
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
pnpm install
pnpm prisma generate
```

#### Issue: Database connection timeout

**Symptoms:**
- `P1001: Can't reach database server`
- Timeout errors during queries

**Solution:**
```typescript
// 1. Check connection string
console.log('DB URL:', process.env.DATABASE_URL)

// 2. Test connection
// lib/test-db.ts
import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query successful:', result)
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

// 3. Check Supabase pooler vs direct connection
// Use pooler for serverless (Vercel)
DATABASE_URL="postgresql://...@db.supabase.co:6543/..." # Pooler
DIRECT_URL="postgresql://...@db.supabase.co:5432/..."   # Direct
```

#### Issue: Migration failures

**Symptoms:**
- `P3009: migrate found failed migrations`
- Schema drift warnings

**Solution:**
```bash
# 1. Check migration status
pnpm prisma migrate status

# 2. Reset development database (CAUTION: data loss)
pnpm prisma migrate reset

# 3. For production, create new migration
pnpm prisma migrate dev --name fix_schema_drift

# 4. Manual fix for failed migrations
pnpm prisma migrate resolve --applied "20240115_migration_name"
```

### Build Issues

#### Issue: Type errors during build

**Symptoms:**
- TypeScript compilation errors
- `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
# 1. Clean TypeScript cache
rm -rf tsconfig.tsbuildinfo

# 2. Check for type issues
pnpm typecheck

# 3. Update types
pnpm add -D @types/node@latest @types/react@latest

# 4. Strict mode issues
// tsconfig.json - temporarily relax
{
  "compilerOptions": {
    "strict": false, // Temporary
    "skipLibCheck": true
  }
}
```

#### Issue: Out of memory during build

**Symptoms:**
- `JavaScript heap out of memory`
- Build process crashes

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Or add to package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### Component Issues

#### Issue: Hydration mismatch

**Symptoms:**
- `Text content does not match server-rendered HTML`
- Layout shifts after page load

**Solution:**
```typescript
// 1. Ensure consistent rendering
// ❌ Bad - different on server/client
<div>{new Date().toLocaleString()}</div>

// ✅ Good - consistent
<div>{formatDate(date, 'PPP')}</div>

// 2. Use suppressHydrationWarning carefully
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>

// 3. Move dynamic content to client
'use client'
export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return <div>{new Date().toLocaleString()}</div>
}
```

## Production Issues

### Deployment Failures

#### Issue: Vercel deployment fails

**Symptoms:**
- Build error in Vercel logs
- Environment variable issues

**Solution:**
```bash
# 1. Check Vercel logs
vercel logs --since 1h

# 2. Verify environment variables in Vercel dashboard
# Project Settings > Environment Variables

# 3. Test build locally with production env
pnpm build:prod

# 4. Clear Vercel cache
vercel --force
```

#### Issue: Database not accessible in production

**Symptoms:**
- `ECONNREFUSED` errors
- Authentication failures

**Solution:**
```typescript
// 1. Use connection pooling for serverless
// Vercel functions need pooled connections
DATABASE_URL="postgresql://...@db.supabase.co:6543/postgres?pgbouncer=true"

// 2. Add connection timeout
DATABASE_URL="postgresql://...?connect_timeout=300&pool_timeout=60"

// 3. Implement retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Performance Issues

#### Issue: Slow API responses

**Symptoms:**
- API routes taking > 1s
- Timeout errors

**Diagnosis:**
```typescript
// Add timing middleware
export async function middleware(request: NextRequest) {
  const start = Date.now()
  
  const response = NextResponse.next()
  
  const duration = Date.now() - start
  response.headers.set('X-Response-Time', `${duration}ms`)
  
  if (duration > 1000) {
    console.warn(`Slow request: ${request.url} took ${duration}ms`)
  }
  
  return response
}

// Profile database queries
prisma.$use(async (params, next) => {
  const start = Date.now()
  const result = await next(params)
  const duration = Date.now() - start
  
  if (duration > 100) {
    console.warn('Slow query:', {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`
    })
  }
  
  return result
})
```

**Solutions:**
```typescript
// 1. Add database indexes
CREATE INDEX idx_appointments_date_provider 
ON appointments(scheduled_start, provider_id)
WHERE status != 'cancelled';

// 2. Optimize queries
// ❌ Bad - N+1 problem
const providers = await prisma.provider.findMany()
for (const provider of providers) {
  const appointments = await prisma.appointment.findMany({
    where: { providerId: provider.id }
  })
}

// ✅ Good - Single query
const providers = await prisma.provider.findMany({
  include: {
    appointments: {
      where: { status: { not: 'cancelled' } }
    }
  }
})

// 3. Implement caching
const cachedData = await redis.get(cacheKey)
if (cachedData) return cachedData

const freshData = await expensiveQuery()
await redis.setex(cacheKey, 300, freshData)
return freshData
```

#### Issue: High memory usage

**Symptoms:**
- Container restarts
- Out of memory errors

**Solution:**
```typescript
// 1. Monitor memory usage
if (global.gc) {
  global.gc()
  const usage = process.memoryUsage()
  console.log('Memory:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heap: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`
  })
}

// 2. Stream large datasets
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      let offset = 0
      const limit = 100
      
      while (true) {
        const batch = await prisma.record.findMany({
          skip: offset,
          take: limit
        })
        
        if (batch.length === 0) break
        
        for (const record of batch) {
          controller.enqueue(JSON.stringify(record) + '\n')
        }
        
        offset += limit
      }
      
      controller.close()
    }
  })
  
  return new Response(stream)
}

// 3. Clear large objects
let largeData = null // Clear reference
```

### Authentication Issues

#### Issue: Session expiration handling

**Symptoms:**
- Users logged out unexpectedly
- 401 errors after inactivity

**Solution:**
```typescript
// Implement session refresh
const { data: { session }, error } = await supabase.auth.getSession()

if (error || !session) {
  // Try to refresh
  const { data, error: refreshError } = await supabase.auth.refreshSession()
  
  if (refreshError) {
    // Redirect to login
    router.push('/login')
    return
  }
}

// Auto-refresh before expiry
useEffect(() => {
  const interval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const timeUntilExpiry = session.expires_at * 1000 - Date.now()
      
      // Refresh if less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        await supabase.auth.refreshSession()
      }
    }
  }, 60000) // Check every minute
  
  return () => clearInterval(interval)
}, [])
```

## Debugging Techniques

### Browser DevTools

```typescript
// Enhanced logging for development
if (process.env.NODE_ENV === 'development') {
  // Styled console logs
  console.log(
    '%c API Call ',
    'background: #222; color: #bada55; padding: 2px 4px;',
    { endpoint, params, response }
  )
  
  // Performance timing
  console.time('API Call')
  const response = await fetch(url)
  console.timeEnd('API Call')
  
  // Trace component renders
  if (typeof window !== 'undefined') {
    window.TRACK_RENDERS = new WeakMap()
    
    function trackRender(component: string) {
      const count = window.TRACK_RENDERS.get(component) || 0
      window.TRACK_RENDERS.set(component, count + 1)
      console.log(`${component} rendered ${count + 1} times`)
    }
  }
}
```

### React Developer Tools

```typescript
// Debug re-renders
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>()
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, any> = {}
      
      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          }
        }
      })
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps)
      }
    }
    
    previousProps.current = props
  })
}

// Usage
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props)
  // Component logic
}
```

### Database Query Debugging

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE dental_dashboard SET log_statement = 'all';
ALTER DATABASE dental_dashboard SET log_duration = on;

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Analyze query plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, COUNT(a.id) as appointment_count
FROM providers p
LEFT JOIN appointments a ON p.id = a.provider_id
WHERE p.clinic_id = 'uuid'
GROUP BY p.id;
```

### Network Debugging

```typescript
// Intercept and log all fetch requests
if (process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch
  
  window.fetch = async (...args) => {
    const [resource, config] = args
    const method = config?.method || 'GET'
    
    console.group(`🌐 ${method} ${resource}`)
    console.log('Request:', config)
    console.time('Duration')
    
    try {
      const response = await originalFetch(...args)
      const cloned = response.clone()
      
      console.log('Status:', response.status)
      console.log('Headers:', Object.fromEntries(response.headers))
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        console.log('Response:', await cloned.json())
      }
      
      return response
    } catch (error) {
      console.error('Error:', error)
      throw error
    } finally {
      console.timeEnd('Duration')
      console.groupEnd()
    }
  }
}
```

## Error Recovery

### Graceful Error Handling

```typescript
// Global error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Log to error tracking service
    if (typeof window !== 'undefined') {
      window.Sentry?.captureException(error, {
        contexts: { react: errorInfo }
      })
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### Data Recovery

```typescript
// Implement data recovery for failed saves
export function useAutoSave<T>(
  key: string,
  data: T,
  saveFunction: (data: T) => Promise<void>
) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Save to localStorage first
  useEffect(() => {
    if (data) {
      localStorage.setItem(`autosave_${key}`, JSON.stringify(data))
    }
  }, [key, data])
  
  // Attempt to save to server
  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    
    try {
      await saveFunction(data)
      // Clear local storage on success
      localStorage.removeItem(`autosave_${key}`)
    } catch (err) {
      setError(err as Error)
      console.error('AutoSave failed:', err)
      
      // Keep in localStorage for recovery
      toast.error('Failed to save. Your data is preserved locally.')
    } finally {
      setSaving(false)
    }
  }, [data, key, saveFunction])
  
  // Recover from localStorage
  const recover = useCallback(() => {
    const saved = localStorage.getItem(`autosave_${key}`)
    if (saved) {
      return JSON.parse(saved) as T
    }
    return null
  }, [key])
  
  return { save, saving, error, recover }
}
```

## Performance Profiling

### React Profiler

```typescript
// Profile component performance
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
  
  if (actualDuration > 16) { // Longer than one frame
    console.warn(`Slow render detected in ${id}`)
  }
}

export function ProfiledDashboard() {
  return (
    <Profiler id="Dashboard" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  )
}
```

### Database Query Analysis

```typescript
// Query performance analyzer
export async function analyzeQueryPerformance() {
  const queries = [
    {
      name: 'Provider list with locations',
      query: () => prisma.provider.findMany({
        include: { locations: true }
      })
    },
    {
      name: 'Dashboard metrics',
      query: () => prisma.dailyFinancials.aggregate({
        where: { date: { gte: new Date('2024-01-01') } },
        _sum: { netProduction: true }
      })
    }
  ]
  
  for (const { name, query } of queries) {
    const start = performance.now()
    await query()
    const duration = performance.now() - start
    
    console.log(`Query "${name}" took ${duration.toFixed(2)}ms`)
    
    if (duration > 100) {
      console.warn(`Consider optimizing: ${name}`)
    }
  }
}
```

## Logging and Monitoring

### Structured Logging

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'dental-dashboard',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Usage with context
export function logWithContext(
  level: string,
  message: string,
  context: Record<string, any>
) {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    requestId: getRequestId()
  })
}

// Middleware for request logging
export function requestLogger(req: Request) {
  const start = Date.now()
  
  return {
    log: (response: Response) => {
      logWithContext('info', 'API Request', {
        method: req.method,
        url: req.url,
        status: response.status,
        duration: Date.now() - start,
        userAgent: req.headers.get('user-agent')
      })
    }
  }
}
```

## Common Error Messages

### Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `NEXT_NOT_FOUND` | Page component returned notFound() | Check dynamic route params |
| `NEXT_REDIRECT` | Redirect in server component | Use redirect() properly |
| `ChunkLoadError` | Failed to load JS chunk | Clear browser cache, rebuild |
| `PrismaClientKnownRequestError` | Database constraint violation | Check unique constraints |
| `ECONNREFUSED` | Can't connect to service | Verify service is running |
| `ERR_MODULE_NOT_FOUND` | Missing dependency | Run `pnpm install` |

## Diagnostic Scripts

### Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

echo "🏥 Running health checks..."

# Check Node version
echo -n "Node.js: "
node --version

# Check pnpm
echo -n "pnpm: "
pnpm --version

# Check database connection
echo -n "Database: "
pnpm exec ts-node -e "
  import { PrismaClient } from '@prisma/client'
  const prisma = new PrismaClient()
  prisma.\$connect()
    .then(() => console.log('✅ Connected'))
    .catch(() => console.log('❌ Failed'))
    .finally(() => prisma.\$disconnect())
"

# Check environment
echo -n "Environment: "
node -e "
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  const missing = required.filter(key => !process.env[key])
  if (missing.length) {
    console.log('❌ Missing:', missing.join(', '))
  } else {
    console.log('✅ All set')
  }
"
```

## Related Resources

- [Deployment Guide](./deployment-guide.md) - Deployment troubleshooting
- [Performance Guidelines](./performance-guidelines.md) - Performance issues
- [Security Considerations](./security-considerations.md) - Security debugging
- [Testing Strategy](./testing-strategy.md) - Test failures

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)