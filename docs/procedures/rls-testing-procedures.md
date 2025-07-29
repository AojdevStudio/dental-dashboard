# RLS Testing Procedures for BMAD Agents

## Overview
This document provides foolproof procedures for testing Row Level Security (RLS) policies safely without contaminating production data.

## 🚨 CRITICAL SAFETY RULES

### BEFORE ANY RLS TESTING:
1. **VERIFY ENVIRONMENT**: Must be `localhost:54321` (local Supabase)
2. **CHECK DATABASE URL**: Must be `localhost:54322` (local PostgreSQL)
3. **NEVER USE PRODUCTION**: Any `.supabase.co` URL is FORBIDDEN
4. **RUN SAFETY CHECK**: Always run environment validation first

## Pre-Testing Safety Checklist

```bash
# 1. Verify you're using local test environment
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "Database URL: $DATABASE_URL"

# 2. Ensure local Supabase is running
pnpm test:start

# 3. Verify test environment
node -e "
const { validateTestEnvironment } = require('./src/lib/utils/test-environment-guard.ts');
try {
  validateTestEnvironment();
  console.log('✅ Safe to proceed with RLS testing');
} catch (error) {
  console.error('❌ UNSAFE ENVIRONMENT:', error.message);
  process.exit(1);
}
"
```

## RLS Testing Workflow

### Step 1: Environment Setup
```bash
# Start local test database
pnpm test:start

# Use test environment file
cp .env.test .env.local

# Verify environment variables
cat .env.local | grep -E "(DATABASE_URL|SUPABASE_URL)"
```

### Step 2: Schema and Policy Deployment
```bash
# Apply schema to local database
pnpm prisma db push

# Apply RLS policies (if using migration scripts)
psql postgresql://postgres:postgres@localhost:54322/postgres -f migrations/002_enable_rls_core_tables.sql
```

### Step 3: Safe Test Data Creation
```typescript
// Use the provided test helpers - they include safety checks
import { 
  createTestClinic, 
  createTestUser, 
  createAuthenticatedClient,
  cleanupTestData 
} from '../tests/utils/rls-test-helpers';

async function safeRLSTest() {
  // Test helpers automatically validate environment
  const clinic1 = await createTestClinic('Test Clinic A');
  const clinic2 = await createTestClinic('Test Clinic B');
  
  const userA = await createTestUser(clinic1.id, 'office_manager');
  const userB = await createTestUser(clinic2.id, 'office_manager');
  
  // Your RLS testing logic here...
  
  // ALWAYS cleanup test data
  await cleanupTestData([userA, userB], [clinic1, clinic2]);
}
```

### Step 4: RLS Policy Testing
```typescript
async function testRLSIsolation() {
  // Test that users can only see their clinic's data
  const clientA = await createAuthenticatedClient(userA);
  const clientB = await createAuthenticatedClient(userB);
  
  // Test data isolation
  const dataA = await clientA.from('providers').select('*');
  const dataB = await clientB.from('providers').select('*');
  
  // Verify isolation
  assert(dataA.data?.every(record => record.clinic_id === clinic1.id));
  assert(dataB.data?.every(record => record.clinic_id === clinic2.id));
}
```

## Common RLS Testing Scenarios

### 1. Multi-Tenant Data Isolation
```typescript
// Test that users only see their clinic's data
await testTableIsolation('providers', userA, clinic1.id);
await testTableIsolation('locations', userB, clinic2.id);
```

### 2. Role-Based Access Control
```typescript
// Test different role permissions
const admin = await createTestUser(clinic1.id, 'clinic_admin');
const viewer = await createTestUser(clinic1.id, 'viewer');

// Test admin can create/update
await testRolePermissions(admin, 'providers', ['SELECT', 'INSERT', 'UPDATE']);

// Test viewer is read-only
await testRolePermissions(viewer, 'providers', ['SELECT']);
```

### 3. Cross-Clinic Access Prevention
```typescript
// Ensure users cannot access other clinics' data
await testCrossClinicBlocking(userA, clinic2.id);
```

## Environment Switching Procedures

### From Production to Test
```bash
# 1. STOP any running development servers
pkill -f "next dev"

# 2. Switch to test environment
cp .env.test .env.local

# 3. Start local test database
pnpm test:start

# 4. Verify environment
pnpm test -- --run tests/environment-validation.test.ts
```

### From Test to Production
```bash
# 1. STOP local test database
pnpm test:stop

# 2. Switch to production environment
cp .env .env.local

# 3. VERIFY no test data exists in production
node scripts/scan-contamination.js

# 4. Start development server
pnpm dev
```

## Test Data Hygiene Guidelines

### What Test Data Looks Like
- **Test emails**: Contain `.test` domain (e.g., `user@tenant-a.test`)
- **Test clinic names**: Contain "Test" or "Tenant" (e.g., `Test Clinic A`)
- **Test UUIDs**: Often use predictable patterns (e.g., `550e8400-e29b-41d4-a716-*`)

### What Production Data Looks Like
- **Real emails**: KamDental domain or provider emails (e.g., `admin@kamdental.com`)
- **Real clinic names**: "KamDental Humble", "KamDental Baytown"
- **Real data patterns**: Actual production volumes and realistic values

### Contamination Detection
```bash
# Run contamination scanner
node scripts/scan-contamination.js

# Look for these warning signs:
# - .test email domains
# - "Test" or "Tenant" in clinic names
# - Unusual bulk data creation patterns
# - UUIDs with predictable patterns
```

## Emergency Procedures

### If Test Data Is Detected in Production
1. **STOP ALL OPERATIONS**
   ```bash
   # Stop any running processes
   pkill -f "next dev"
   pkill -f "pnpm"
   ```

2. **ASSESS CONTAMINATION**
   ```bash
   node scripts/scan-contamination.js > contamination-report.txt
   ```

3. **REVIEW CLEANUP SCRIPT**
   - Examine generated cleanup script carefully
   - Verify it only targets test data
   - Ensure legitimate data is preserved

4. **EXECUTE CLEANUP**
   ```bash
   # Only after careful review
   node generated-cleanup-script.js
   ```

5. **VERIFY CLEANUP**
   ```bash
   node scripts/scan-contamination.js
   ```

## Testing Validation Checklist

Before completing RLS testing:
- [ ] All test data created in local environment only
- [ ] Test results documented and validated
- [ ] Test data completely cleaned up
- [ ] Local test database reset
- [ ] Environment switched back to appropriate setting
- [ ] No test artifacts remain in any environment

## Common Mistakes to Avoid

1. **Forgetting environment validation** - Always run safety checks first
2. **Using production URLs** - Test helpers will prevent this, but be aware
3. **Leaving test data** - Always clean up, even in test environment
4. **Mixing environments** - Use clear separation between test and production
5. **Skipping verification** - Always verify environment before and after testing

## Tools and Utilities

- **Environment Validator**: `src/lib/utils/test-environment-guard.ts`
- **RLS Test Helpers**: `tests/utils/rls-test-helpers.ts`
- **Contamination Scanner**: `scripts/scan-contamination.js`
- **Safety Utilities**: `scripts/safety-utils.js`

## Contact and Escalation

If you encounter any issues or uncertainties during RLS testing:
1. **Stop testing immediately**
2. **Document the issue**
3. **Run contamination scan**
4. **Escalate to senior developer**

Remember: **It's better to be overly cautious than to risk production data contamination.**