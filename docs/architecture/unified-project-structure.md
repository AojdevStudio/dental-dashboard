# Unified Project Structure

## Overview

This document provides a comprehensive map of the Dental Dashboard project structure. Understanding this organization is crucial for AI agents and developers to navigate the codebase effectively and place new code in the correct locations.

## Quick Reference

```
dental-dashboard/
├── src/                    # All source code
├── docs/                   # Documentation
├── prisma/                 # Database schema and migrations
├── scripts/                # Build and utility scripts
├── tests/                  # E2E test suites
├── public/                 # Static assets
└── migrations/             # SQL migration files
```

## Detailed Project Structure

### `/src` - Source Code Directory

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── reset-password/# Password reset flow
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard view
│   │   ├── providers/     # Provider management
│   │   ├── goals/         # Goal tracking
│   │   ├── reports/       # Reporting features
│   │   └── settings/      # User and clinic settings
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── providers/     # Provider CRUD operations
│       ├── metrics/       # KPI calculations
│       └── goals/         # Goal management
│
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── auth/             # Authentication components
│   ├── providers/        # Provider-related components
│   └── common/           # Shared components
│
├── lib/                  # Utilities and configurations
│   ├── database/         # Prisma client and queries
│   │   ├── client.ts     # Prisma instance
│   │   └── queries/      # Database query functions
│   ├── auth/             # Auth utilities
│   ├── supabase/         # Supabase client setup
│   ├── api/              # API utilities
│   └── utils/            # General utilities
│
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── contexts/             # React context providers
└── styles/               # Global CSS and Tailwind
```

### `/docs` - Documentation

```
docs/
├── index.md              # Master documentation index
├── architecture/         # Technical architecture docs
├── prds/                 # Product requirement documents
│   ├── backlog/         # Future features
│   ├── doing/           # Active development
│   └── done/            # Completed features
├── guides/               # How-to guides
├── migration/            # Migration documentation
└── bmad-integration/     # BMAD methodology docs
```

### `/prisma` - Database Configuration

```
prisma/
├── schema.prisma         # Main database schema
├── seed.ts              # Database seeding script
└── migrations/          # Prisma migration history
```

### `/scripts` - Utility Scripts

```
scripts/
├── agentic-tdd/         # TDD workflow scripts
├── data-migration/      # Data migration utilities
├── google-apps-script/  # Google Sheets sync scripts
└── test-runner.js       # Custom test runner
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `ProviderCard.tsx`)
- **Component Tests**: Same name + `.test.tsx` (e.g., `ProviderCard.test.tsx`)
- **Component Styles**: kebab-case CSS modules (e.g., `provider-card.module.css`)

### API Routes
- **Route Files**: Always named `route.ts`
- **Folder Structure**: RESTful paths (e.g., `/api/providers/[providerId]/route.ts`)

### Utilities
- **Utility Files**: kebab-case (e.g., `format-currency.ts`)
- **Type Files**: kebab-case with `.types.ts` (e.g., `provider.types.ts`)

### Documentation
- **Markdown Files**: kebab-case (e.g., `coding-standards.md`)
- **PRD Files**: Prefixed with ticket number (e.g., `AOJ-59-test-suite.md`)

## Module Organization

### Backend Modules

```
lib/
├── database/queries/     # Database access layer
│   ├── providers.ts     # Provider-related queries
│   ├── clinics.ts       # Clinic queries
│   ├── metrics.ts       # Metric calculations
│   └── users.ts         # User management
│
├── services/            # Business logic layer
│   ├── auth/           # Authentication services
│   ├── financial/      # Financial calculations
│   └── goals/          # Goal tracking logic
│
└── api/                # API utilities
    ├── middleware.ts   # Auth and error handling
    └── utils.ts        # Response helpers
```

### Frontend Modules

```
components/
├── ui/                 # Generic, reusable components
│   ├── button.tsx     # Base button component
│   ├── card.tsx       # Card container
│   └── dialog.tsx     # Modal dialogs
│
├── dashboard/          # Dashboard-specific components
│   ├── kpi-card.tsx   # KPI display card
│   ├── chart-*.tsx    # Chart components
│   └── filters.tsx    # Dashboard filters
│
└── providers/          # Feature-specific components
    ├── provider-card.tsx
    └── provider-grid.tsx
```

## Import/Export Patterns

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Absolute imports (`@/`)
4. Relative imports
5. Type imports

```typescript
// Example proper import order
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency } from './utils'
import type { Provider } from '@/types/provider'
```

## Generated vs Source Files

### Generated Files (Do NOT edit)
- `/prisma/client/` - Prisma generated client
- `/.next/` - Next.js build output
- `/node_modules/` - Dependencies
- `*.tsbuildinfo` - TypeScript cache

### Source Files
- Everything in `/src/` - Application code
- `/prisma/schema.prisma` - Database schema
- Configuration files in root

## Build Output Locations

```
Build Outputs:
├── .next/              # Next.js production build
├── prisma/client/      # Generated Prisma client
└── public/            # Static files served directly
```

## Common Patterns

### API Route Pattern
```
app/api/[resource]/route.ts           # Collection endpoints (GET, POST)
app/api/[resource]/[id]/route.ts      # Item endpoints (GET, PUT, DELETE)
```

### Component + Hook Pattern
```
components/providers/provider-card.tsx  # UI component
hooks/use-providers.ts                  # Data fetching hook
```

### Feature Folder Pattern
```
feature/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks
├── types/            # Feature types
└── utils/            # Feature utilities
```

## Things to Avoid

- ❌ Placing business logic in components
- ❌ Direct database queries in API routes (use query functions)
- ❌ Importing from `node_modules` directly
- ❌ Creating deeply nested folder structures (max 4 levels)
- ❌ Mixing generated and source files

## Related Resources

- [Coding Standards](./coding-standards.md) - Code style guidelines
- [Testing Strategy](./testing-strategy.md) - Test file organization
- [Component Specifications](./components.md) - Component patterns

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)