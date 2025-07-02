# Foolproof Environment Switching Guide

## Overview
This guide provides step-by-step procedures for safely switching between development environments without risk of data contamination.

## 🎯 Environment Overview

| Environment | Database | Purpose | Data Type |
|-------------|----------|---------|-----------|
| **Production** | `supabase.co` cloud | Live application | Real customer data |
| **Staging** | `staging.supabase.co` | Integration testing | Anonymized production data |
| **Local Development** | `localhost:54322` | Development/Testing | Test fixtures only |

## 🔒 Critical Safety Rules

1. **NEVER run test operations against production**
2. **ALWAYS verify environment before database operations**
3. **USE CORRECT .env file for each environment**
4. **VALIDATE environment variables after switching**
5. **STOP all processes before switching**

## Environment Files Structure

```
.env              # Production environment (default)
.env.staging      # Staging environment 
.env.test         # Local test environment
.env.local        # Current active environment (git ignored)
```

### Production Environment (`.env`)
```bash
DATABASE_URL="postgresql://postgres.yovbdmjwrrgardkgrenc:PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://yovbdmjwrrgardkgrenc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="production_anon_key"
SUPABASE_SERVICE_ROLE_KEY="production_service_key"
NODE_ENV="production"
ALLOW_PRODUCTION_DB="true"
```

### Staging Environment (`.env.staging`)
```bash
DATABASE_URL="postgresql://postgres.STAGING_ID:PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://STAGING_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="staging_anon_key"
SUPABASE_SERVICE_ROLE_KEY="staging_service_key"
NODE_ENV="development"
ALLOW_STAGING_DB="true"
```

### Local Test Environment (`.env.test`)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="test_anon_key"
SUPABASE_SERVICE_ROLE_KEY="test_service_key"
NODE_ENV="test"
```

## Environment Switching Procedures

### 🔄 Switch to Local Test Environment

**When to use:** RLS testing, unit tests, local development with test data

```bash
#!/bin/bash
# Switch to local test environment

echo "🔄 Switching to LOCAL TEST environment..."

# 1. Stop all running processes
echo "1. Stopping all processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "prisma studio" 2>/dev/null || true

# 2. Start local test database
echo "2. Starting local test database..."
pnpm test:start

# 3. Switch environment file
echo "3. Switching to test environment..."
cp .env.test .env.local

# 4. Verify environment
echo "4. Verifying environment..."
node -e "
const { validateTestEnvironment } = require('./src/lib/utils/test-environment-guard.ts');
try {
  validateTestEnvironment();
  console.log('✅ Successfully switched to LOCAL TEST environment');
} catch (error) {
  console.error('❌ Environment switch failed:', error.message);
  process.exit(1);
}
"

echo "5. Environment variables:"
echo "   DATABASE_URL: $(echo $DATABASE_URL | cut -c1-50)..."
echo "   SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"

echo "✅ Safe to run RLS tests and local development"
```

### 🔄 Switch to Staging Environment

**When to use:** Integration testing, feature validation, migration testing

```bash
#!/bin/bash
# Switch to staging environment

echo "🔄 Switching to STAGING environment..."

# 1. Stop all processes
echo "1. Stopping all processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true

# 2. Stop local test database if running
echo "2. Stopping local test database..."
pnpm test:stop 2>/dev/null || true

# 3. Switch environment file
echo "3. Switching to staging environment..."
cp .env.staging .env.local

# 4. Verify environment
echo "4. Verifying staging environment..."
if [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"staging"* ]]; then
  echo "✅ Successfully switched to STAGING environment"
else
  echo "❌ Environment switch failed - not staging URL"
  exit 1
fi

# 5. Test database connection
echo "5. Testing database connection..."
pnpm prisma db pull --force 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

echo "✅ Safe to run integration tests and staging deployment"
```

### 🔄 Switch to Production Environment

**When to use:** Production deployment, production data analysis (READ-ONLY)

```bash
#!/bin/bash
# Switch to production environment

echo "🔄 Switching to PRODUCTION environment..."
echo "⚠️  WARNING: This will connect to LIVE PRODUCTION DATA"
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Production switch cancelled"
  exit 1
fi

# 1. Stop all processes
echo "1. Stopping all processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "prisma studio" 2>/dev/null || true

# 2. Stop local test database
echo "2. Stopping local test database..."
pnpm test:stop 2>/dev/null || true

# 3. Scan for any test data contamination
echo "3. Scanning for test data contamination..."
if [ -f "scripts/scan-contamination.js" ]; then
  node scripts/scan-contamination.js
  if [ $? -ne 0 ]; then
    echo "❌ Test data contamination detected! Fix before proceeding."
    exit 1
  fi
fi

# 4. Switch environment file
echo "4. Switching to production environment..."
cp .env .env.local

# 5. Verify environment
echo "5. Verifying production environment..."
if [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"yovbdmjwrrgardkgrenc.supabase.co"* ]]; then
  echo "✅ Connected to PRODUCTION environment"
  echo "🚨 PRODUCTION DATABASE ACTIVE - USE EXTREME CAUTION"
else
  echo "❌ Environment switch failed - not production URL"
  exit 1
fi

echo "✅ Connected to PRODUCTION - READ-ONLY operations recommended"
```

## Environment Validation Scripts

### Quick Environment Check
```bash
# scripts/check-environment.sh
#!/bin/bash

echo "🔍 Current Environment Status:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: $(echo $DATABASE_URL | cut -c1-50)..."
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"

if [[ "$DATABASE_URL" == *"localhost:54322"* ]]; then
  echo "📍 Environment: LOCAL TEST"
elif [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"staging"* ]]; then
  echo "📍 Environment: STAGING"
elif [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"supabase.co"* ]]; then
  echo "📍 Environment: PRODUCTION 🚨"
else
  echo "📍 Environment: UNKNOWN ⚠️"
fi
```

### Pre-Operation Safety Check
```bash
# scripts/safety-check.sh
#!/bin/bash

echo "🛡️ Running safety checks..."

# Check for running processes that might interfere
if pgrep -f "next dev" > /dev/null; then
  echo "⚠️ Next.js dev server is running"
fi

if pgrep -f "prisma studio" > /dev/null; then
  echo "⚠️ Prisma Studio is running"
fi

# Validate environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

# Check for test data patterns in production
if [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"supabase.co"* ]]; then
  echo "🔍 Production environment detected - scanning for test data..."
  if [ -f "scripts/scan-contamination.js" ]; then
    node scripts/scan-contamination.js --quiet
  fi
fi

echo "✅ Safety checks passed"
```

## Common Environment Issues

### Issue: Wrong Environment Variables
**Symptoms:** Unexpected database connections, missing data
**Solution:** 
```bash
# Verify current environment
./scripts/check-environment.sh

# Reset to correct environment
cp .env.test .env.local  # or .env.staging, .env
source .env.local
```

### Issue: Processes Interfering
**Symptoms:** Port conflicts, database connection errors
**Solution:**
```bash
# Kill all development processes
pkill -f "next dev"
pkill -f "pnpm dev" 
pkill -f "prisma studio"

# Restart environment
pnpm test:start  # for local
# or
pnpm dev        # for staging/production
```

### Issue: Database Connection Failures
**Symptoms:** Prisma connection errors, timeout errors
**Solution:**
```bash
# Test database connection
pnpm prisma db pull --force

# If local database needed:
pnpm test:start

# If credentials issue, check environment file
cat .env.local | grep -E "(DATABASE_URL|SUPABASE_URL)"
```

## Environment Switching Checklist

### Before Switching
- [ ] Stop all running development processes
- [ ] Save any important work in progress
- [ ] Note current environment for reference
- [ ] Ensure you have correct environment files

### During Switch
- [ ] Copy correct environment file to `.env.local`
- [ ] Start/stop appropriate database services
- [ ] Verify environment variables are loaded
- [ ] Test database connection

### After Switch
- [ ] Run environment validation
- [ ] Verify correct database connection
- [ ] Test basic operations (if safe)
- [ ] Document the switch for team awareness

## Best Practices

1. **Use Scripts:** Create shell scripts for common switches
2. **Verify Always:** Double-check environment after switching
3. **Document Switches:** Note when and why you switched environments
4. **Team Communication:** Inform team of environment changes
5. **Safety First:** When in doubt, use test environment

## Emergency Procedures

### If You Accidentally Connect to Wrong Environment
1. **STOP IMMEDIATELY** - Don't run any operations
2. **Check what you did** - Review recent commands
3. **Switch to safe environment** - Use test environment
4. **Assess damage** - Run contamination scanner if needed
5. **Report incident** - Document what happened

Remember: **Environment switching is a critical operation that requires careful attention to prevent data contamination.**