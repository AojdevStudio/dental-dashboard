# Staging Environment Architecture Design

## Overview

This document outlines the design for a dedicated staging environment that provides complete isolation between development, testing, and production activities.

## Current Environment Issues

**Problem:** Development and production currently share the same Supabase cloud database, creating risk of:
- Test data contamination
- Production data corruption during development
- No safe environment for integration testing
- Inability to test migrations safely

## Proposed 3-Environment Architecture

### 1. **Production Environment**
- **Database:** Supabase Cloud (current: `yovbdmjwrrgardkgrenc.supabase.co`)
- **Purpose:** Live customer data only
- **Access:** Restricted, requires explicit permission
- **Data:** Real KamDental clinic data
- **Backups:** Daily automated + point-in-time recovery

### 2. **Staging Environment** ⭐ **NEW**
- **Database:** Separate Supabase Cloud project
- **Purpose:** Production-like testing, migration validation, integration testing
- **Access:** Development team access
- **Data:** Anonymized production data or realistic test data
- **Sync:** Weekly refresh from production (anonymized)

### 3. **Local Development/Test Environment**
- **Database:** Local Supabase (`localhost:54322`)
- **Purpose:** Unit tests, RLS testing, local development
- **Access:** Individual developer machines
- **Data:** Minimal test fixtures
- **Reset:** Automatic cleanup after tests

## Staging Environment Implementation Plan

### Phase 1: Supabase Staging Project Setup

1. **Create New Supabase Project**
   ```bash
   # Using Supabase CLI
   supabase projects create dental-dashboard-staging --org "KC Ventures Consulting Group"
   ```

2. **Configure Environment Variables**
   ```bash
   # .env.staging
   DATABASE_URL="postgresql://postgres.STAGING_ID:PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://STAGING_ID.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="staging_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="staging_service_key"
   ```

3. **Schema Migration Pipeline**
   ```bash
   # Deploy same schema to staging
   pnpm prisma migrate deploy --env staging
   pnpm prisma generate
   ```

### Phase 2: Data Management Strategy

#### Option A: Anonymized Production Data (Recommended)
```typescript
// scripts/sync-staging-data.ts
async function syncProductionToStaging() {
  // 1. Export production data (anonymized)
  // 2. Transform sensitive data (emails, names, etc.)
  // 3. Import to staging database
  // 4. Validate data integrity
}
```

#### Option B: Realistic Test Data
```typescript
// scripts/seed-staging.ts
async function seedStagingData() {
  // Create realistic but fake data that mirrors production structure
  // Multiple clinics, providers, realistic production data volumes
}
```

### Phase 3: Environment Switching Infrastructure

#### Environment Detection Utility
```typescript
// src/lib/utils/environment-detection.ts
export function detectEnvironment(): 'production' | 'staging' | 'local' | 'test' {
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (dbUrl?.includes('localhost:54322')) return 'test';
  if (supabaseUrl?.includes('staging')) return 'staging';
  if (supabaseUrl?.includes('supabase.co')) return 'production';
  return 'local';
}
```

#### Environment-Specific Configuration
```typescript
// src/lib/config/environment-config.ts
const configs = {
  production: {
    allowTestData: false,
    requireBackup: true,
    logLevel: 'error',
    requireConfirmation: true
  },
  staging: {
    allowTestData: true,
    requireBackup: false,
    logLevel: 'info',
    requireConfirmation: false
  },
  test: {
    allowTestData: true,
    requireBackup: false,
    logLevel: 'debug',
    requireConfirmation: false
  }
};
```

## Environment Access Matrix

| Operation | Production | Staging | Local Test |
|-----------|------------|---------|------------|
| RLS Testing | ❌ NEVER | ✅ YES | ✅ YES |
| Migration Testing | ❌ NEVER | ✅ YES | ✅ YES |
| Load Testing | ❌ NEVER | ✅ YES | ⚠️ LIMITED |
| Feature Development | ❌ NEVER | ✅ YES | ✅ YES |
| Data Experiments | ❌ NEVER | ✅ YES | ✅ YES |
| Customer Demos | ⚠️ READ-ONLY | ✅ YES | ❌ NO |

## Deployment Pipeline

```mermaid
graph LR
    A[Local Development] --> B[Local Tests Pass]
    B --> C[Push to Staging]
    C --> D[Staging Tests Pass]
    D --> E[Integration Tests]
    E --> F[Deploy to Production]
    
    G[RLS Testing] --> H[Staging Validation]
    H --> I[Production Deployment]
```

## Benefits of This Architecture

1. **Complete Isolation:** Production is never touched during development
2. **Safe Testing:** RLS policies can be tested safely in staging
3. **Migration Validation:** Schema changes tested before production
4. **Integration Testing:** Full application testing with realistic data
5. **Demo Environment:** Safe environment for customer demonstrations
6. **Rollback Safety:** Can test rollback procedures in staging

## Implementation Timeline

- **Week 1:** Create staging Supabase project and basic configuration
- **Week 2:** Implement data sync pipeline and environment detection
- **Week 3:** Update all documentation and procedures
- **Week 4:** Team training and validation testing

## Cost Considerations

- **Staging Supabase Project:** ~$25/month (Pro plan)
- **Data Storage:** ~$5-10/month additional
- **Total Additional Cost:** ~$30-35/month
- **Risk Mitigation Value:** Prevents potential data loss incidents (invaluable)

## Next Steps

1. Create staging Supabase project
2. Implement environment detection utilities
3. Create data sync pipeline
4. Update all development procedures
5. Train team on new workflow