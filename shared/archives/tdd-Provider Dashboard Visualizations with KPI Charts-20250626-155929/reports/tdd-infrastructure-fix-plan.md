# TDD Infrastructure Fix Implementation Plan
*Generated: 2025-01-19*

## Executive Summary

This plan addresses the critical infrastructure issues blocking our TDD test suite execution. The goal is to move from "tests won't run due to infrastructure problems" to "tests run but fail for legitimate TDD reasons (missing feature implementation)".

**Total Estimated Time**: 4-6 hours
**Priority**: CRITICAL - Blocking all TDD progress
**Approach**: Fix infrastructure only, do NOT implement features or make tests pass

## Implementation Categories

### 1. React Import Issues (HIGH PRIORITY)
**Problem**: Components failing with "React is not defined" errors
**Impact**: 38+ component tests cannot execute
**Estimated Time**: 1-2 hours

#### Files to Fix:
```
src/components/common/sidebar.tsx
src/app/(dashboard)/providers/error.tsx
src/app/(dashboard)/providers/loading.tsx
```

#### Implementation Approach:
1. **Add React Import**: Add `import React from 'react';` to top of each file
2. **Verify JSX Usage**: Ensure all JSX elements are properly handled
3. **Check Export Pattern**: Maintain existing export patterns

#### Code Pattern:
```typescript
import React from 'react';
// ... other imports

export default function ComponentName() {
  return (
    // JSX content
  );
}
```

#### Verification:
- Run component-specific tests: `pnpm vitest sidebar.test.tsx`
- Look for elimination of "React is not defined" errors
- Tests should now fail for legitimate reasons, not import errors

### 2. Missing Database Infrastructure Files (HIGH PRIORITY)
**Problem**: Tests importing files that don't exist
**Impact**: 15+ database tests cannot execute
**Estimated Time**: 2-3 hours

#### Files to Create:

##### A. `src/lib/database/client.ts`
```typescript
import { PrismaClient } from '@prisma/client';

// Create singleton Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

##### B. `src/lib/database/auth-context.ts`
```typescript
import { prisma } from './client';

export async function isClinicAdmin(userId: string, clinicId: string): Promise<boolean> {
  // Placeholder implementation - will be implemented in GREEN phase
  return false;
}

export async function validateClinicAccess(userId: string, clinicId: string): Promise<void> {
  // Placeholder implementation - will be implemented in GREEN phase
  throw new Error('Access denied to requested clinic');
}

export async function getCurrentClinicId(): Promise<string | null> {
  // Placeholder implementation - will be implemented in GREEN phase
  return null;
}
```

##### C. `src/tests/utils/rls-test-helpers.ts`
```typescript
import { prisma } from '@/lib/database/client';

export async function createTestClinic(data: any) {
  // Placeholder implementation - will be implemented in GREEN phase
  throw new Error('Test helper not implemented');
}

export async function createTestUser(data: any) {
  // Placeholder implementation - will be implemented in GREEN phase
  throw new Error('Test helper not implemented');
}

export async function cleanupTestData() {
  // Placeholder implementation - will be implemented in GREEN phase
  return;
}
```

##### D. `scripts/data-migration/migrate-to-uuid.ts`
```typescript
export class DataMigration {
  // Placeholder implementation - will be implemented in GREEN phase
  static async run() {
    throw new Error('Migration not implemented');
  }
}
```

#### Implementation Order:
1. Create `client.ts` first (foundation)
2. Create `auth-context.ts` (depends on client)
3. Create test helpers (depends on client)
4. Create migration scripts (standalone)

#### Verification:
- Run database tests: `pnpm vitest database`
- Look for elimination of "Cannot find module" errors
- Tests should now fail with "not implemented" errors (expected)

### 3. Next.js Test Environment Setup (MEDIUM PRIORITY)
**Problem**: Server components calling `cookies()` outside request scope
**Impact**: 12+ server component tests cannot execute
**Estimated Time**: 1-2 hours

#### Files to Modify:

##### A. Update `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Next.js server functions
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

##### B. Create `src/tests/utils/next-mocks.ts`
```typescript
import { vi } from 'vitest';

export function mockNextjsContext() {
  const mockCookies = vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }));

  vi.mock('next/headers', () => ({
    cookies: mockCookies,
  }));

  return { mockCookies };
}

export function resetNextjsMocks() {
  vi.clearAllMocks();
}
```

#### Implementation Approach:
1. **Global Mocks**: Add server function mocks to vitest setup
2. **Test-Specific Mocks**: Create utility for per-test mocking
3. **Context Simulation**: Mock request context for server components

#### Verification:
- Run server component tests: `pnpm vitest page.test.tsx`
- Look for elimination of "cookies() called outside request scope" errors
- Tests should now fail for business logic reasons, not context errors

## Implementation Order & Timeline

### Phase 1: React Imports (30-60 minutes)
1. Fix `sidebar.tsx` - Add React import
2. Fix `error.tsx` - Add React import  
3. Fix `loading.tsx` - Add React import
4. Run component tests to verify fixes

### Phase 2: Database Files (90-120 minutes)
1. Create `client.ts` - Prisma client setup
2. Create `auth-context.ts` - Auth utilities with placeholders
3. Create `rls-test-helpers.ts` - Test helpers with placeholders
4. Create migration scripts - Placeholder implementations
5. Run database tests to verify imports resolve

### Phase 3: Next.js Environment (60-90 minutes)
1. Update `vitest.setup.ts` - Add global mocks
2. Create `next-mocks.ts` - Test utilities
3. Update test configuration if needed
4. Run server component tests to verify context fixes

### Phase 4: Verification (30 minutes)
1. Run full test suite: `pnpm test`
2. Categorize remaining failures:
   - ✅ Infrastructure fixed
   - 🔴 Legitimate TDD failures (expected)
3. Document results

## Success Criteria

### Before Fix:
- Tests crash with import/context errors
- Cannot distinguish real failures from infrastructure problems
- Test suite execution blocked

### After Fix:
- All tests can execute without crashing
- Clear distinction between infrastructure vs. feature failures
- Tests fail with meaningful error messages like:
  - "Access denied to requested clinic" (expected - feature not implemented)
  - "Test helper not implemented" (expected - placeholder)
  - "Migration not implemented" (expected - placeholder)

## Risk Mitigation

### Potential Issues:
1. **Import Path Conflicts**: TypeScript path mapping issues
2. **Mock Interference**: Mocks affecting other tests
3. **Prisma Client Issues**: Database connection problems

### Mitigation Strategies:
1. **Test Incrementally**: Fix one category at a time
2. **Verify Isolation**: Ensure mocks don't leak between tests
3. **Database Cleanup**: Proper test database reset between runs

## Post-Fix Next Steps

Once infrastructure is fixed:
1. **Categorize Failures**: Separate legitimate TDD failures from remaining issues
2. **Prioritize Implementation**: Focus on highest-value failing tests first
3. **Implement Features**: Begin GREEN phase of TDD cycle
4. **Monitor Progress**: Track test pass rate improvements

## Conclusion

This plan focuses exclusively on infrastructure fixes to enable proper TDD execution. No features will be implemented - only the minimum code needed to let tests run and fail for the right reasons. This will establish a clean RED phase foundation for subsequent feature development.
