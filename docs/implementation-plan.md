# Diff Implementation Plan

## Overview

Apply the provided diff exactly as specified, focusing on structural changes first without intermediate testing.

## Implementation Order

### Phase 1: File Updates & Modifications

**Execute all file changes in this exact order:**

1. **Update [`src/lib/auth/config.ts`](src/lib/auth/config.ts)**

   - Replace entire content with new browser client implementation
   - Changes: `@supabase/supabase-js` → `@supabase/ssr`, add error handling, factory pattern

2. **Update [`src/lib/auth/session.ts`](src/lib/auth/session.ts)**

   - Replace entire content with new server client implementation
   - Changes: `@supabase/auth-helpers-nextjs` → `@supabase/ssr`, async function, cookie handling

3. **Update [`src/lib/database/prisma.ts`](src/lib/database/prisma.ts)**
   - Replace entire content with new Prisma configuration
   - Changes: Move from `src/lib/db.ts` content, update import path, enhanced documentation

### Phase 2: New File Creation

**Create all new placeholder files:**

4. **Create [`src/lib/auth/middleware.ts`](src/lib/auth/middleware.ts)**

   - Empty file (placeholder)

5. **Database Query Files:**

   - [`src/lib/database/queries/clinics.ts`](src/lib/database/queries/clinics.ts)
   - [`src/lib/database/queries/goals.ts`](src/lib/database/queries/goals.ts)
   - [`src/lib/database/queries/google-sheets.ts`](src/lib/database/queries/google-sheets.ts)
   - [`src/lib/database/queries/metrics.ts`](src/lib/database/queries/metrics.ts)
   - [`src/lib/database/queries/users.ts`](src/lib/database/queries/users.ts)

6. **Database Schema Files:**

   - [`src/lib/database/schemas/clinic.ts`](src/lib/database/schemas/clinic.ts)
   - [`src/lib/database/schemas/goal.ts`](src/lib/database/schemas/goal.ts)
   - [`src/lib/database/schemas/google-sheet.ts`](src/lib/database/schemas/google-sheet.ts)
   - [`src/lib/database/schemas/metric.ts`](src/lib/database/schemas/metric.ts)
   - [`src/lib/database/schemas/user.ts`](src/lib/database/schemas/user.ts)

7. **Google Sheets Integration Files:**

   - [`src/lib/google-sheets/auth.ts`](src/lib/google-sheets/auth.ts)
   - [`src/lib/google-sheets/client.ts`](src/lib/google-sheets/client.ts)
   - [`src/lib/google-sheets/mapping.ts`](src/lib/google-sheets/mapping.ts)
   - [`src/lib/google-sheets/sync.ts`](src/lib/google-sheets/sync.ts)
   - [`src/lib/google-sheets/validation.ts`](src/lib/google-sheets/validation.ts)

8. **Metrics Processing Files:**
   - [`src/lib/metrics/aggregations.ts`](src/lib/metrics/aggregations.ts)
   - [`src/lib/metrics/calculations.ts`](src/lib/metrics/calculations.ts)
   - [`src/lib/metrics/transformations.ts`](src/lib/metrics/transformations.ts)
   - [`src/lib/metrics/types.ts`](src/lib/metrics/types.ts)

### Phase 3: File Deletions

**Remove deprecated files and directories:**

9. **Delete Files:**

   - [`src/lib/db.ts`](src/lib/db.ts)
   - [`src/lib/prisma.ts`](src/lib/prisma.ts)

10. **Delete Directories:**
    - [`src/lib/supabase/`](src/lib/supabase/) (entire directory)
    - [`src/lib/temp_providers/`](src/lib/temp_providers/) (entire directory)

### Phase 4: Import Reference Updates

**Update all import statements in affected files:**

11. **Auth Action Files:**

    - [`src/actions/auth/signup.ts`](src/actions/auth/signup.ts): `@/lib/supabase/server` → `@/lib/auth/session`
    - [`src/actions/auth/login.ts`](src/actions/auth/login.ts): `@/lib/supabase/server` → `@/lib/auth/session`
    - [`src/actions/auth/reset-password.ts`](src/actions/auth/reset-password.ts): `@/lib/supabase/server` → `@/lib/auth/session`
    - [`src/actions/auth/get-session.ts`](src/actions/auth/get-session.ts): `@/lib/supabase/server` → `@/lib/auth/session`
    - [`src/actions/auth/oauth.ts`](src/actions/auth/oauth.ts): `@/lib/supabase/server` → `@/lib/auth/session`

12. **API Route Files:**
    - [`src/app/api/auth/callback/route.ts`](src/app/api/auth/callback/route.ts): `@/lib/supabase/server` → `@/lib/auth/session`
    - [`src/app/api/auth/google/callback/route.ts`](src/app/api/auth/google/callback/route.ts): `@/lib/prisma` → `@/lib/database/prisma`

## Key Changes Summary

### Authentication System

- **Before**: Legacy `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
- **After**: Modern `@supabase/ssr` with proper SSR support
- **Pattern**: Singleton exports → Factory functions

### Database Configuration

- **Before**: Multiple Prisma files (`src/lib/db.ts`, `src/lib/prisma.ts`)
- **After**: Single consolidated file (`src/lib/database/prisma.ts`)
- **Import**: Standard `@prisma/client` instead of generated client

### Module Organization

- **Before**: Flat structure with temporary files
- **After**: Organized modules for database, Google Sheets, and metrics

### Import Path Changes

| Old Path                | New Path                |
| ----------------------- | ----------------------- |
| `@/lib/supabase/server` | `@/lib/auth/session`    |
| `@/lib/prisma`          | `@/lib/database/prisma` |

## Critical Notes

- All placeholder files contain single-line comments matching the diff exactly
- Function signatures change from singleton exports to factory functions
- Cookie handling moves from auth helpers to direct Next.js integration
- Prisma client uses standard import instead of generated client path

## Post-Implementation

After all structural changes are complete, testing can be performed to verify:

- Authentication flows work with new SSR clients
- Database connections work with consolidated Prisma config
- Import references resolve correctly
- Application builds without errors
