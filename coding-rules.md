# Coding Rules and Conventions

*Comprehensive guide to coding standards extracted from `.cursor/rules` directory*

## Table of Contents
1. [Code Style](#code-style)
2. [Git Workflow](#git-workflow)
3. [Project Structure](#project-structure)
4. [Additional Conventions](#additional-conventions)
   - [Security Practices](#security-practices)
   - [Testing Strategy](#testing-strategy)
   - [Architecture Principles](#architecture-principles)
   - [Documentation Standards](#documentation-standards)

---

## Code Style

### Indentation and Formatting
- **Use consistent indentation (2 spaces)** - Enforced by Biome formatter
- **File Size Limits**: Hard limit of 500 lines per file (no exceptions)
  - Utility functions: < 50-100 lines
  - Complex components/services: 100-300 lines
  - May extend to 400-500 lines only if highly cohesive
- **Import Organization** (enforced by Biome):
  ```tsx
  // 1. React and Next.js imports
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  
  // 2. Third-party library imports
  import { format } from 'date-fns'
  import { z } from 'zod'
  
  // 3. Local absolute imports
  import { Card } from '@/components/ui/card'
  import { formatCurrency } from '@/lib/utils/formatting'
  
  // 4. Local relative imports
  import { LocalComponent } from './LocalComponent'
  
  // 5. Type imports
  import type { Metric } from '@/lib/types/metrics'
  ```

### Naming Conventions
- **Components**: PascalCase (`MetricCard.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `calculateMetrics.ts`)
- **Routes**: kebab-case directories (`google-sheets/`, `user-settings/`)
- **Database**: snake_case for tables/columns (`provider_goals`, `user_id`)
- **Variables**: Descriptive names (`userId` not `id`, `UserProfile` not `Profile`)
- **Foreign Keys**: `{table_singular}_id` pattern

### Comments and Documentation
- **JSDoc3 Mandatory** for all exported functions, classes, and complex types
- **Comment Focus**: Explain "why" and "how", not just "what"
- **Format Standards**:
  ```typescript
  /**
   * Calculates the production percentage for a provider
   * @param actual - The actual production value
   * @param goal - The goal production value
   * @returns The percentage of goal achieved, capped at 200%
   */
  export function calculateProductionPercentage(actual: number, goal: number): number {
    // Cap at 200% to prevent chart scaling issues
    return Math.min((actual / goal) * 100, 200)
  }
  ```
- **Never Include**: TODOs, version control info, or commented-out code

### TypeScript Standards
- **NO `any` or `unknown`** without proper type guards
- **Explicit return types** on all functions
- **Strict null checks**: Always verify variables are not null/undefined
- **Type-safe imports**: Use type imports for types (`import type { ... }`)
- **Zod validation** for all external data at boundaries
- **Environment validation**: Always validate env vars before use

### Function and Component Guidelines
- **Single Responsibility Principle**: Each file/function has one clear purpose
- **Early returns** to reduce nesting
- **Pure functions** when possible
- **Custom hooks** for reusable logic
- **Composition over inheritance**
- **No direct DOM manipulation** in React components
- **No mutating props or state** directly

### Testing Requirements
- **Write unit tests for new functionality** using Vitest
- **Complex business logic**: Write tests first (TDD)
- **React components**: Write tests after implementation
- **API routes**: Test both success and error cases
- **Coverage targets**: 90%+ for business logic services
- **Skip tests** for simple presentational components

---

## Git Workflow

### Branch Strategy
- **Use feature branches** for all new development
  - Branch naming: `feature/story-1.1-description`
  - Always branch from `main` (or specified main branch)
- **Protected main branch**: No direct commits
- **Branch protection requirements**:
  - Require pull requests for all changes
  - Require status checks (including secrets scanning)
  - Require up-to-date branches before merging
  - Restrict force pushes
  - Require signed commits

### Commit Practices
- **Write descriptive commit messages**:
  - Format: `type(scope): description`
  - Examples: 
    - `feat(auth): add OAuth integration`
    - `fix(dashboard): resolve metric calculation error`
    - `docs(api): update endpoint documentation`
- **Reference issue numbers** in commits and PRs
  - Format: `fixes #123` or `relates to #456`
- **Keep commits focused and atomic**
  - One logical change per commit
  - Complete, working state in each commit
- **Never commit**:
  - Secrets or API keys
  - `.env` files
  - Large binary files
  - Generated files (unless necessary)

### Pull Request Workflow
- **Rebase feature branches on main** before creating PR
  ```bash
  git checkout main
  git pull origin main
  git checkout feature/your-branch
  git rebase main
  ```
- **Squash commits when merging** to maintain clean history
- **PR Requirements**:
  - Descriptive title and description
  - Link to related issues
  - All tests passing
  - Code review approval
  - No merge conflicts

### Security in Git
- **Never use wildcard git commands**: No `git add .` or `git add *`
- **Always review with `git status`** before committing
- **Pre-commit checklist**:
  1. Run `git status` to review all files
  2. Verify no `.env*` files are staged
  3. Check for hard-coded secrets
  4. Ensure all API calls use environment variables
- **Emergency response** for accidental secret commits:
  1. Immediately revoke the compromised secret
  2. Generate new credentials
  3. Update environment variables
  4. Clean git history if necessary

---

## Project Structure

### Directory Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (grouped route)
│   ├── (dashboard)/       # Main application pages (grouped route)
│   └── api/               # API route handlers
├── components/            # React components
│   ├── ui/               # Generic UI components (Shadcn)
│   ├── dashboard/        # Dashboard-specific components
│   ├── auth/             # Authentication components
│   └── common/           # Shared components
├── lib/                  # Utilities and configurations
│   ├── database/         # Prisma client and queries
│   ├── auth/             # Authentication utilities
│   ├── supabase/         # Supabase client configurations
│   └── utils/            # General utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── services/             # Business logic layer
├── styles/               # Global styles
└── tests/                # E2E tests and test utilities

scripts/                  # Build and utility scripts
├── database/            # Database management scripts
├── testing/             # Test utilities and runners
└── deployment/          # Deployment scripts

docs/                    # Documentation
├── procedures/          # Step-by-step procedures
├── architecture/        # System design documents
└── api/                # API documentation

prisma/                  # Database schema and migrations
├── schema.prisma       # Prisma schema definition
├── migrations/         # Database migration history
└── seed.ts            # Database seeding script

public/                  # Static assets
supabase/               # Supabase configuration
├── functions/          # Edge functions
└── migrations/         # Supabase-specific migrations
```

### File Organization Principles
- **Domain-based organization**: Group by feature, not file type
- **Colocation**: Keep related files together (component + test + styles)
- **Barrel exports**: Use `index.ts` for public API of services
- **Server-first**: Business logic in server components/API routes
- **Client boundaries**: Explicit `'use client'` directive when needed

### Naming Standards by Directory
- `/src`: Source code only
- `/test`: Test files with `.test.ts` suffix
- `/docs`: Markdown documentation
- `/scripts`: Executable scripts (Node.js or shell)
- `/types`: Global TypeScript type definitions

---

## Additional Conventions

### Security Practices

#### API Security
- **Minimal permission scope** for all operations
- **Separate API keys** for different permission levels
- **Environment variable validation** in all API routes
- **Row Level Security (RLS)** enabled on all database tables
- **Multi-tenant isolation** at database and API levels
- **Rate limiting**: 10 requests per 10 seconds
- **JWT tokens**: 15-minute expiration

#### Secrets Management
- **Never store unencrypted secrets** in repositories
- **Environment variables only** for all secrets
- **Rotation schedule**:
  - API Keys: Every 90 days
  - Database passwords: Every 180 days
  - Service tokens: Every 30 days
  - OAuth secrets: Annually

### Testing Strategy

#### Test Types and Tools
- **Unit Tests**: Vitest for business logic
- **Integration Tests**: Vitest with test database
- **E2E Tests**: Playwright for user flows
- **Database**: Cloud Supabase branch for all tests
- **Mocking**: External dependencies (APIs, services)

#### Testing Requirements
- **Pre-commit**: Tests run automatically via Husky
- **CI/CD**: All tests must pass before merge
- **Coverage**: Monitor but don't enforce arbitrary percentages
- **Focus areas**:
  - Business logic (calculations, transformations)
  - API endpoints (success and error cases)
  - Critical user paths
  - Security boundaries

### Architecture Principles

#### Server-First Design
- **Business logic on server**: All calculations and data processing
- **Client for UI only**: Interactions, animations, form state
- **Pre-calculate data**: Send processed data to client
- **Server Actions**: Use `'use server'` for mutations

#### Component Architecture
- **Server Components by default**: No `'use client'` unless needed
- **Client Component indicators**:
  - Uses React hooks
  - Handles browser events
  - Accesses browser APIs
  - Manages local UI state

#### Database Design
- **Prisma as single source**: All DB operations through Prisma
- **Type-safe queries**: Leverage Prisma's generated types
- **Transactions**: For multi-record operations
- **Migrations**: Version controlled and reversible

### Documentation Standards

#### Code Documentation
- **Every exported function** needs JSDoc
- **Complex algorithms** need detailed explanations
- **Business logic** needs context and reasoning
- **API endpoints** need request/response examples

#### Project Documentation
- **README.md**: Project overview and setup
- **CONTRIBUTING.md**: Development guidelines
- **Architecture docs**: System design decisions
- **API docs**: Endpoint specifications
- **Runbooks**: Operational procedures

### Performance Guidelines

#### Measurement First
- **No premature optimization**
- **Profile before optimizing**: Use React DevTools
- **Benchmark with real data**
- **Monitor Core Web Vitals**

#### Optimization Strategies
- **Server-side rendering** for initial load
- **Code splitting** for large components
- **Image optimization** with Next.js Image
- **Database query optimization** with proper indexes
- **Caching strategies** for expensive operations

### Development Workflow

#### Daily Development
1. **Pull latest changes** from main
2. **Create feature branch** for new work
3. **Write tests** for new functionality
4. **Implement feature** following all conventions
5. **Run quality checks**: `pnpm code-quality`
6. **Create PR** with descriptive information
7. **Address review feedback**
8. **Merge when approved**

#### Code Quality Pipeline
```bash
# Format code
pnpm format

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting and formatting check
pnpm biome:check

# Full quality check
pnpm code-quality
```

#### Continuous Improvement
- **Rule Analytics**: Track rule usage in `.cursor/analytics.md`
- **Pattern Recognition**: Add rules when patterns appear 3+ times
- **Regular Reviews**: Update rules based on team feedback
- **Deprecation**: Remove outdated patterns
- **Documentation Sync**: Keep docs aligned with code

---

## Summary

These coding rules and conventions ensure:
1. **Consistent code style** across the entire codebase
2. **Secure development practices** protecting sensitive data
3. **Maintainable architecture** that scales with the project
4. **Quality assurance** through testing and reviews
5. **Clear documentation** for current and future developers

Remember: **All hook issues are BLOCKING** - code must be 100% clean with all checks passing before proceeding. When in doubt, choose clarity over cleverness.