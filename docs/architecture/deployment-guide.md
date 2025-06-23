# Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the Dental Dashboard, covering local development, staging, and production environments. It includes configuration management, CI/CD pipelines, monitoring setup, and rollback procedures.

## Quick Reference

```bash
# Local development
pnpm dev

# Build for production
pnpm build

# Deploy to staging
git push origin develop

# Deploy to production
git push origin main

# Emergency rollback
vercel rollback [deployment-id]
```

## Environment Setup

### Environment Variables

```bash
# .env.local (Development)
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dental_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/dental_dev"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Monitoring (optional)
SENTRY_DSN="https://your-sentry-dsn"
VERCEL_ANALYTICS_ID="your-analytics-id"

# .env.staging (Staging)
DATABASE_URL="postgresql://postgres:password@db.staging.supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="https://staging.dentalcrm.com"
NODE_ENV="staging"

# .env.production (Production)
DATABASE_URL="postgresql://postgres:password@db.prod.supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="https://app.dentalcrm.com"
NODE_ENV="production"
```

### Environment Validation

```typescript
// lib/config/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().endsWith('.apps.googleusercontent.com'),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  
  // Optional
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
})

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env)
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }
  
  return parsed.data
}

// Validate on startup
export const env = validateEnv()
```

## Local Development

### Prerequisites

```bash
# Required software
- Node.js >= 18.17.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Docker (optional, for local Supabase)
```

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/dental-dashboard.git
cd dental-dashboard

# 2. Install dependencies
pnpm install

# 3. Setup local database
docker-compose up -d postgres

# 4. Copy environment variables
cp .env.example .env.local

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Seed database (optional)
pnpm prisma db seed

# 7. Start development server
pnpm dev
```

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dental_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

## Build Process

### Production Build

```bash
# Build optimization script
#!/bin/bash
# scripts/build.sh

echo "🏗️  Starting production build..."

# Clean previous builds
rm -rf .next
rm -rf node_modules/.cache

# Set production environment
export NODE_ENV=production

# Run type checking
echo "📝 Type checking..."
pnpm typecheck

# Run linting
echo "🔍 Linting..."
pnpm lint

# Run tests
echo "🧪 Running tests..."
pnpm test

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Build application
echo "📦 Building application..."
pnpm next build

# Analyze bundle size
echo "📊 Analyzing bundle..."
pnpm analyze

echo "✅ Build completed successfully!"
```

### Build Configuration

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: ['supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      }
    ]
  }
}

// Sentry configuration for production
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'your-org',
  project: 'dental-dashboard',
}

module.exports = process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  DIRECT_URL: ${{ secrets.DIRECT_URL }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run type checking
        run: pnpm typecheck
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.dentalcrm.com

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Pre-deployment Checks

```typescript
// scripts/pre-deploy.ts
import { execSync } from 'child_process'

async function preDeploymentChecks() {
  console.log('🔍 Running pre-deployment checks...')
  
  const checks = [
    {
      name: 'Type checking',
      command: 'pnpm typecheck',
      critical: true
    },
    {
      name: 'Linting',
      command: 'pnpm lint',
      critical: true
    },
    {
      name: 'Unit tests',
      command: 'pnpm test',
      critical: true
    },
    {
      name: 'Build test',
      command: 'pnpm build',
      critical: true
    },
    {
      name: 'Bundle size check',
      command: 'pnpm size',
      critical: false
    },
    {
      name: 'Security audit',
      command: 'pnpm audit',
      critical: false
    }
  ]
  
  const results = []
  
  for (const check of checks) {
    try {
      console.log(`\n▶️  ${check.name}...`)
      execSync(check.command, { stdio: 'inherit' })
      results.push({ ...check, passed: true })
      console.log(`✅ ${check.name} passed`)
    } catch (error) {
      results.push({ ...check, passed: false })
      console.error(`❌ ${check.name} failed`)
      
      if (check.critical) {
        console.error('\n🚨 Critical check failed. Deployment aborted.')
        process.exit(1)
      }
    }
  }
  
  // Summary
  console.log('\n📊 Pre-deployment check summary:')
  results.forEach(result => {
    console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}`)
  })
  
  const allPassed = results.every(r => r.passed)
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Ready to deploy.')
  } else {
    console.log('\n⚠️  Some checks failed. Review before deploying.')
  }
  
  return allPassed
}

// Run checks
preDeploymentChecks().catch(console.error)
```

## Database Migrations

### Migration Strategy

```typescript
// scripts/migrate-prod.ts
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

async function productionMigration() {
  console.log('🔄 Starting production migration...')
  
  // 1. Backup database
  console.log('📦 Creating database backup...')
  const backupName = `backup_${Date.now()}`
  execSync(`pg_dump $DATABASE_URL > backups/${backupName}.sql`)
  
  try {
    // 2. Run migrations
    console.log('🚀 Applying migrations...')
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit' })
    
    // 3. Verify migration
    console.log('✓ Verifying migration...')
    const prisma = new PrismaClient()
    
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 5
    `
    
    console.log('Recent migrations:', migrations)
    
    await prisma.$disconnect()
    
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    // Rollback
    console.log('⏮️  Rolling back...')
    execSync(`psql $DATABASE_URL < backups/${backupName}.sql`)
    
    throw error
  }
}

// Run migration
productionMigration().catch(process.exit)
```

### Zero-downtime Migrations

```sql
-- Example: Adding a new column with zero downtime
-- Step 1: Add nullable column
ALTER TABLE providers 
ADD COLUMN performance_score DECIMAL(5,2);

-- Step 2: Backfill data (can be done gradually)
UPDATE providers 
SET performance_score = (
  SELECT AVG(rating) 
  FROM reviews 
  WHERE provider_id = providers.id
)
WHERE performance_score IS NULL
LIMIT 1000;

-- Step 3: Add constraint after backfill
ALTER TABLE providers 
ALTER COLUMN performance_score SET NOT NULL;

-- Step 4: Add index
CREATE INDEX CONCURRENTLY idx_providers_performance 
ON providers(performance_score DESC);
```

## Deployment Platforms

### Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "regions": ["iad1", "sfo1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url",
      "DIRECT_URL": "@direct-url"
    }
  },
  "functions": {
    "app/api/cron/[...path].ts": {
      "maxDuration": 60
    },
    "app/api/reports/generate.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/system/health"
    }
  ]
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Monitoring Setup

### Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    checks: {
      database: 'checking',
      redis: 'checking',
      supabase: 'checking'
    }
  }
  
  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = 'healthy'
  } catch (error) {
    checks.checks.database = 'unhealthy'
    checks.status = 'degraded'
  }
  
  // Check Redis
  try {
    await redis.ping()
    checks.checks.redis = 'healthy'
  } catch (error) {
    checks.checks.redis = 'unhealthy'
    checks.status = 'degraded'
  }
  
  // Check Supabase
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`
    )
    checks.checks.supabase = response.ok ? 'healthy' : 'unhealthy'
  } catch (error) {
    checks.checks.supabase = 'unhealthy'
    checks.status = 'degraded'
  }
  
  const statusCode = checks.status === 'ok' ? 200 : 503
  
  return Response.json(checks, { status: statusCode })
}
```

### Application Monitoring

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[Filtered]'
      }
      
      // Filter out non-error logs in production
      if (
        process.env.NODE_ENV === 'production' &&
        event.level === 'log'
      ) {
        return null
      }
      
      return event
    },
  })
}

// Error boundary component
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      showDialog
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
```

## Rollback Procedures

### Automated Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

DEPLOYMENT_ID=$1

if [ -z "$DEPLOYMENT_ID" ]; then
  echo "Usage: ./rollback.sh <deployment-id>"
  exit 1
fi

echo "🔄 Starting rollback to deployment: $DEPLOYMENT_ID"

# 1. Rollback application
echo "⏮️  Rolling back application..."
vercel rollback $DEPLOYMENT_ID --yes

# 2. Check deployment status
echo "✓ Checking deployment status..."
vercel inspect $DEPLOYMENT_ID

# 3. Run smoke tests
echo "🧪 Running smoke tests..."
pnpm test:smoke

# 4. Notify team
echo "📢 Notifying team..."
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"⚠️ Production rollback completed to deployment $DEPLOYMENT_ID\"
  }"

echo "✅ Rollback completed!"
```

### Database Rollback

```typescript
// scripts/db-rollback.ts
import { execSync } from 'child_process'

async function rollbackDatabase(migrationName: string) {
  console.log(`🔄 Rolling back to migration: ${migrationName}`)
  
  try {
    // Create backup of current state
    console.log('📦 Backing up current database state...')
    execSync('pnpm db:backup')
    
    // Rollback migration
    console.log('⏮️  Rolling back migration...')
    execSync(`pnpm prisma migrate resolve --rolled-back ${migrationName}`)
    
    // Verify rollback
    console.log('✓ Verifying rollback...')
    const result = execSync('pnpm prisma migrate status', { 
      encoding: 'utf8' 
    })
    
    console.log(result)
    console.log('✅ Database rollback completed!')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}

// Usage: pnpm db:rollback 20240115_add_performance_score
const migrationName = process.argv[2]
if (!migrationName) {
  console.error('Please provide migration name')
  process.exit(1)
}

rollbackDatabase(migrationName).catch(process.exit)
```

## Post-deployment Tasks

### Smoke Tests

```typescript
// tests/smoke/critical-paths.test.ts
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://app.dentalcrm.com'

test.describe('Critical User Paths', () => {
  test('Login flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    // Check page loads
    await expect(page).toHaveTitle(/Login/)
    
    // Fill login form
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)
  })
  
  test('Dashboard loads', async ({ page }) => {
    // Login first
    await loginUser(page)
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Check critical elements
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="kpi-grid"]')).toBeVisible()
    await expect(page.locator('[data-testid="provider-list"]')).toBeVisible()
  })
  
  test('API health check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`)
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.checks.database).toBe('healthy')
  })
})
```

### Cache Warming

```typescript
// scripts/warm-cache.ts
async function warmCache() {
  console.log('🔥 Warming cache...')
  
  const endpoints = [
    '/api/dashboard',
    '/api/providers',
    '/api/locations',
    '/api/goals/current',
  ]
  
  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const start = Date.now()
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CACHE_WARM_TOKEN}`,
            'X-Cache-Warm': 'true'
          }
        })
        
        const duration = Date.now() - start
        
        return {
          endpoint,
          status: response.status,
          duration,
          cached: response.headers.get('X-Cache-Status') === 'HIT'
        }
      } catch (error) {
        return {
          endpoint,
          error: error.message,
          duration: Date.now() - start
        }
      }
    })
  )
  
  // Report results
  console.log('\n📊 Cache warming results:')
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { endpoint, status, duration, cached } = result.value
      console.log(`  ${cached ? '✅' : '🔄'} ${endpoint} - ${status} (${duration}ms)`)
    } else {
      console.log(`  ❌ Failed to warm cache`)
    }
  })
}

warmCache().catch(console.error)
```

## Troubleshooting

### Common Issues

```typescript
// docs/deployment-troubleshooting.md
export const commonIssues = {
  'Build fails with out of memory': {
    cause: 'Node.js heap size limit reached',
    solution: 'Increase memory: NODE_OPTIONS="--max-old-space-size=4096" pnpm build'
  },
  
  'Database connection timeout': {
    cause: 'Connection pool exhausted or network issues',
    solution: 'Check DATABASE_URL, increase pool size, verify network connectivity'
  },
  
  'Environment variables not found': {
    cause: 'Missing or incorrectly named env vars',
    solution: 'Verify all required env vars are set in Vercel dashboard'
  },
  
  'CORS errors in production': {
    cause: 'Incorrect origin configuration',
    solution: 'Update CORS allowed origins in next.config.js'
  },
  
  'Static assets 404': {
    cause: 'Incorrect asset paths or missing files',
    solution: 'Check public folder, verify build output'
  }
}
```

### Debug Mode

```typescript
// lib/debug/deployment.ts
export function enableDeploymentDebug() {
  if (process.env.DEPLOYMENT_DEBUG === 'true') {
    console.log('🐛 Deployment Debug Mode Enabled')
    
    // Log environment
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    })
    
    // Log configuration
    console.log('Configuration:', {
      databaseUrl: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      googleAuth: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
    })
    
    // Test connections
    testConnections().then(results => {
      console.log('Connection Tests:', results)
    })
  }
}

async function testConnections() {
  const tests = {
    database: false,
    supabase: false,
    redis: false
  }
  
  // Test database
  try {
    await prisma.$queryRaw`SELECT 1`
    tests.database = true
  } catch (error) {
    console.error('Database test failed:', error)
  }
  
  // Test Supabase
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`)
    tests.supabase = response.ok
  } catch (error) {
    console.error('Supabase test failed:', error)
  }
  
  return tests
}
```

## Related Resources

- [Security Considerations](./security-considerations.md) - Production security
- [Performance Guidelines](./performance-guidelines.md) - Optimization strategies
- [Monitoring Guide](./monitoring-guide.md) - Observability setup
- [Troubleshooting Guide](./troubleshooting-guide.md) - Common issues

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)