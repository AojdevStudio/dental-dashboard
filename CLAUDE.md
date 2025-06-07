# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter and formatter
pnpm lint:fix     # Auto-fix linting issues
```

**Database:**
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database with sample data
```

**Testing:**
```bash
pnpm test         # Run all tests with Vitest
pnpm test:ui      # Run tests with UI
pnpm test:integration  # Run integration tests only
```

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19, TypeScript 5.8
- **Database:** Supabase (PostgreSQL) with Prisma ORM
- **Authentication:** Supabase Auth with SSR
- **UI:** Tailwind CSS 4, Shadcn UI, Radix primitives
- **State:** TanStack Query, Zustand, React Hook Form + Zod
- **Code Quality:** Biome (linting/formatting), Vitest (testing)

### Multi-Tenant Architecture
This is a **multi-tenant dental practice management system** with:
- **Clinic-based isolation** using Row Level Security (RLS)
- **Role-based access control:** clinic_admin, provider, staff, viewer
- **Location-based financial tracking** for multi-location clinics
- **UUID migration support** with dual ID system (CUID + UUID)

### Key Database Models
```
Clinic -> User (via UserClinicRole) -> Provider -> DataSource
Clinic -> Location -> LocationFinancial
Provider -> HygieneProduction, DentistProduction
```

### Authentication Flow
- **Middleware-based route protection** (`middleware.ts`) with comprehensive logging
- **Separate Supabase clients** for browser vs server contexts
- **API route protection** using `withAuth` middleware pattern
- **OAuth integration** for Google Sheets access

## Critical Patterns

### 1. Database Queries
- **All queries in `src/lib/database/queries/`** - centralized data access
- **Auth context required** - every query must include clinic/user authorization
- **Zod schemas in `src/lib/database/schemas/`** for validation
- **Generated Prisma client** located at `src/generated/prisma/` (not standard location)

### 2. API Routes Structure
```
/api/auth/          # Authentication endpoints
/api/clinics/       # Clinic management + statistics
/api/metrics/       # Financial, provider, patient metrics
/api/providers/     # Provider management + locations
/api/export/        # CSV/PDF export functionality
```

### 3. Logging with Winston
- **Structured logging required** - use `src/lib/utils/logger.ts`
- **Environment-specific levels:** debug (dev), warn (production)
- **Include metadata:** userId, clinicId, action for all operations
- **Avoid PII in logs** - follow guidelines in `/docs/rules/agent/winston-logging-guidelines.mdc`

### 4. Error Handling
- **Use ApiError classes** for consistent error responses
- **Include correlation IDs** in error logs
- **Follow error handling patterns** in existing API routes

## Development Guidelines

### File Organization
- **`src/` directory structure** (not root-level components)
- **Absolute imports with `@/`** alias
- **Component organization:** ui/ (reusable), auth/, dashboard/, common/
- **Generated files in `src/generated/`** - do not edit manually

### Code Quality
- **Biome configuration:** 100-char line width, 2-space indentation, strict rules
- **TypeScript strict mode** with comprehensive type checking
- **Server Components by default** - only use 'use client' when necessary
- **Consistent naming:** kebab-case for files, PascalCase for components

### Google Sheets Integration
- **OAuth flow implemented** but data processing is placeholder
- **Column mapping system** for transforming spreadsheet data
- **Sync operations** need implementation in `/api/hygiene-production/sync/` and similar endpoints
- **Google Apps Scripts** available in `/scripts/google-apps-script/`

## Current State

### Implemented Features
- Complete Supabase SSR authentication
- Multi-tenant database schema with RLS
- API route infrastructure
- Component library and dashboard layout
- Google OAuth integration

### Placeholder/Incomplete Features
- **Google Sheets sync logic** - endpoints exist but core processing is TODO
- **Metric calculations** - basic structure exists, specific formulas needed
- **Dashboard data integration** - components ready but data flow incomplete
- **Export functionality** - PDF/CSV endpoints are placeholders

### Testing Strategy
- **Unit tests** with Vitest for utilities and components
- **Integration tests** for multi-tenant database operations
- **API route testing** with auth context simulation
- **Test files:** `src/tests/` and `__tests__/` directories

## Security Considerations

- **Row Level Security policies** enforced at database level
- **Environment variables:** PUBLIC_ prefix for client-accessible vars
- **API authentication** required on all protected routes
- **Sensitive data handling** per logging guidelines
- **Multi-tenant isolation** verified through comprehensive tests

## Performance Notes

- **Prisma client singleton** with global caching in development
- **Server-side rendering** by default for better performance
- **TanStack Query** for client-side data caching
- **Database indexing** optimized for multi-tenant queries

When working with this codebase, always consider the multi-tenant context, use the established authentication patterns, and follow the logging guidelines for maintainability.