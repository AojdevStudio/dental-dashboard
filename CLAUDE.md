# CLAUDE.md - Development Partnership & Project Guide

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 DEVELOPMENT PARTNERSHIP - MANDATORY WORKFLOW

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

### AUTOMATED CHECKS ARE MANDATORY
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. No type errors. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

### CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

#### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

#### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

#### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** ❌

Run: `pnpm format && pnpm test && pnpm typecheck && pnpm biome:check`

#### 🚨 CRITICAL: Hook Failures Are BLOCKING
**When hooks report ANY issues (exit code 2), you MUST:**
1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:
- Formatting issues (Biome format)
- Linting violations (Biome lint, Next.js lint)
- Type errors (tsc --noEmit)
- Import/export issues
- ALL other checks

Your code must be 100% clean. No exceptions.

#### Working Memory Management

When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Project Overview

This is a multi-tenant dental practice dashboard built with Next.js 15, TypeScript, Supabase, and Prisma. The application provides comprehensive data visualization and KPI tracking for dental clinics, with Google Sheets integration for data sync.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server

### Code Quality - MANDATORY WORKFLOW
- `pnpm format` - Format code with Biome
- `pnpm test` - Run unit tests with Vitest using local Supabase database
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm biome:check` - Check code with Biome (linting + formatting)
- `pnpm biome:fix` - Auto-fix Biome issues
- `pnpm lint` - Run Next.js ESLint linter
- `pnpm lint:fix` - Fix Biome linting issues automatically
- `pnpm imports:fix` - Organize and fix import statements
- `pnpm pre-commit` - Manual pre-commit check (Biome + tests)
- `pnpm code-quality` - Full quality pipeline (Biome + tests + build)

### Database Operations
- `pnpm prisma:generate` - Generate Prisma client after schema changes
- `pnpm prisma:push` - Push schema changes to database (development)
- `pnpm prisma:studio` - Open Prisma Studio for data inspection
- `pnpm prisma:seed` - Seed database with initial data

### Testing
- `pnpm test:watch` - Run tests in watch mode with local database
- `pnpm test:coverage` - Generate test coverage report with local database
- `pnpm test:integration` - Run integration tests with Vitest
- `pnpm test:start` - Start local Supabase for testing
- `pnpm test:stop` - Stop local Supabase
- `pnpm test:reset` - Reset local test database to clean state

## TypeScript/Next.js-Specific Rules

### FORBIDDEN - NEVER DO THESE:
- **NO any or unknown** without proper type guards
- **NO non-null assertions (!)** without clear justification
- **NO @ts-ignore** - fix the actual type issue
- **NO setTimeout/setInterval** for coordination - use Promises/async
- **NO direct DOM manipulation** in React components
- **NO mutating props or state** directly
- **NO keeping old and new code** together
- **NO migration functions** or compatibility layers
- **NO versioned function names** (processV2, handleNew)
- **NO mixing server/client code** in wrong boundaries
- **NO TODOs** in final code
- **NO index of array as key** property in React elements
- **NO forEach with large arrays** - prefer for...of
- **NO undeclared variables** - explicitly declare all variables
- **NO classes with only static members**

> **AUTOMATED ENFORCEMENT**: Biome and TypeScript will BLOCK commits that violate these rules.  
> When you see `❌ TYPE ERROR` or `❌ LINT ERROR`, you MUST fix it immediately!

### Required Standards:
- **Delete** old code when replacing it
- **Explicit return types** on all functions
- **Meaningful names**: `userId` not `id`, `UserProfile` not `Profile`
- **Early returns** to reduce nesting
- **Type-safe constructors**: proper TypeScript interfaces and types
- **Proper error handling**: use Error objects, not strings
- **Custom hooks** for reusable logic
- **Composition over inheritance**
- **Server/client boundary respect**: no server code in client components
- **Regex literals declared at top level**
- **Prefer const/let over var**
- **Export from instead of import then export**

## Implementation Standards

### Our code is complete when:
- ✅ All linters pass with zero issues (Biome)
- ✅ All tests pass (Vitest)
- ✅ Type checking passes with zero errors
- ✅ Feature works end-to-end
- ✅ Old code is deleted
- ✅ TSDoc on all exported functions/components

### Testing Strategy
- Complex business logic → Write tests first (Vitest)
- React components → Write tests after implementation
- User flows → Add Playwright e2e tests
- API routes → Test both success and error cases
- Skip tests for simple presentational components

## Architecture Overview

### Technology Stack
- **Framework:** Next.js 15 with App Router and Turbopack
- **Language:** TypeScript 5.8.3 with strict mode
- **Database:** Supabase PostgreSQL with Prisma ORM
- **UI:** React 19, Shadcn UI, Radix UI, Tailwind CSS 4
- **State Management:** Server Components, React Context, Zustand, TanStack Query
- **Authentication:** Supabase Auth with SSR
- **Testing:** Hybrid testing with Vitest (unit/integration) and Playwright (E2E) with MCP integration
- **Code Quality:** Biome for comprehensive linting, formatting, and import organization with Husky pre-commit hooks

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
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
├── styles/               # Global styles
└── tests/                # E2E tests and test utilities
```

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Common Information For MCP use:
- **Linear MCP Quick Reference:**
  - Project name: Dental Dashboard (always include the project when creating Linear issues)
  - Project ID: 31deeedb-112f
  - Full Project ID: dental-dashboard-31deeedb112f
  - Team: AOJDevStudio
  - Team ID: 6b3573d9-0510-4503-b569-b92b37a36105

- **Supabase MCP Quick Reference:**
  - Organization name: KC Ventures Consulting Group
  - Organization slug: hbcnwcsjguowrjnugzye
  - Project name: dashboard
  - Project ID: yovbdmjwrrgardkgrenc
  - Project URL: https://yovbdmjwrrgardkgrenc.supabase.co

## 🛡️ DATABASE SAFETY AND ENVIRONMENT PROTECTION

### CRITICAL: Database Environment Safety
This project implements strict database safety protocols to prevent test data contamination in production.

#### Environment Isolation Rules
- **Production Database**: Real KamDental clinic data only (`supabase.co` URLs)
- **Staging Database**: Production-like testing environment (planned)
- **Local Test Database**: Development and testing only (`localhost:54322`)

#### REQUIRED Safety Checks Before Database Operations
1. **Always validate environment** before any database operations
2. **Use test environment guard** for test data operations:
   ```typescript
   import { validateTestEnvironment } from '@/lib/utils/test-environment-guard';
   validateTestEnvironment(); // Throws if production detected
   ```
3. **Check for test data contamination** if suspicious activity:
   ```bash
   node scripts/scan-contamination.js
   ```

## Performance & Security

### **Measure First**:
- No premature optimization
- Use React DevTools Profiler for performance bottlenecks
- Benchmark with real data before claiming improvements
- Monitor Core Web Vitals

### **Security Always**:
- Validate all inputs (client AND server)
- Use crypto.getRandomValues() for randomness
- Sanitize user content before rendering
- Parameterized queries for database operations (never concatenate!)
- Proper authentication/authorization boundaries

## TypeScript Best Practices

1. **Enforce Strict Null Checks:**
   - Always verify that a variable is not null or undefined before using it
   - Use conditional checks, optional chaining (?.), and the nullish coalescing operator (??)

2. **Define and Validate Types for External Data:**
   - For any data coming from an external source (APIs, raw SQL, etc.), create a specific interface or type
   - Use Zod to parse this data at the boundary of your application

3. **Write Type-Safe Prisma Queries:**
   - Rely on the auto-generated types from your Prisma client
   - Use IDE autocompletion to prevent errors in include or select clauses

4. **Integrate Type Checking into Your Workflow:**
   - Run `pnpm typecheck` regularly during development
   - Pre-commit hooks automatically run Biome formatting and tests before commits
   - Use `pnpm code-quality` for full quality pipeline before pushing changes

## Code Quality Pipeline

### Biome Configuration
The project uses a comprehensive Biome setup (`.biome.json`) with:

**Core Features:**
- **VCS Integration:** Git-aware linting with automatic ignore file handling
- **Import Organization:** Automatic import sorting and organization
- **Multi-language Support:** JavaScript/TypeScript, JSON, and CSS formatting

**Rule Categories (300+ rules):**
- **Accessibility:** Ensures WCAG compliance and semantic HTML
- **Performance:** Prevents performance anti-patterns (barrel files, unnecessary re-exports)
- **Security:** XSS prevention and secure coding practices
- **Complexity:** Maintains code readability and cognitive load
- **Style:** Consistent code formatting and naming conventions
- **Correctness:** Prevents runtime errors and type issues

## Communication Protocol

### Progress Updates:
```
✓ Implemented user authentication (all tests passing)
✓ Added rate limiting middleware  
✗ Found issue with session persistence - investigating
```

### Suggesting Improvements:
"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Critical Development Issues

### ⚠️ Database Reseeding Breaks Google Apps Script Sync
**CRITICAL:** Database reseeding generates new clinic IDs, breaking Google Apps Script sync with 500 errors.

**Symptoms:**
- Google Apps Script sync returns 500 errors
- Error: "JSON object requested, multiple (or no) rows returned" (PGRST116)
- No data syncs despite correct payload structure

**Root Cause:** Google Apps Script properties contain old clinic IDs after database reseed.

**Immediate Fix:**
1. Get current clinic IDs: `SELECT id, name FROM clinics ORDER BY name;`
2. Update Google Apps Script properties:
   - `LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID`
   - `LOCATION_FINANCIAL_HUMBLE_CLINIC_ID`
3. Or run Google Apps Script setup wizard again

**Current Clinic IDs (after latest reseed):**
- **Baytown**: `cmc3jcrs20001i2ht5sn89v66`
- **Humble**: `cmc3jcrhe0000i2ht9ymqtmzb`

## Development Guidelines

### Code Writing Guidelines
- Every time you write new code you must run a typecheck and biome check and fix any issues related to the code you wrote
- Run `pnpm biome:check` after every major code implementation

### Component Development
- Use Server Components by default, Client Components only when needed
- Follow the component structure in `docs/rules`
- Use absolute imports with `@/` prefix
- Group imports in order: React/Next.js, third-party, local absolute, local relative, types

### Database Development
1. **Schema Changes:**
   - For rapid iteration: `pnpm prisma:push`
   - For versioned changes: `pnpm prisma migrate dev --name descriptive_name`
2. **After schema changes:** Always run `pnpm prisma:generate`
3. **Data seeding:** Use `pnpm dlx tsx prisma/seed.ts` for reliable seeding

### API Development
- API routes are located in `src/app/api/`
- Use the `withAuth` middleware for protected routes with role-based access control
- Follow RESTful conventions for route naming
- Use Zod for request/response validation
- Implement proper error handling with `ApiError` and `ApiResponse` utilities
- Use standardized pagination with `apiPaginated` and `getPaginationParams`
- Apply multi-tenant security with clinic-based data isolation

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.# CLAUDE.md - Development Partnership & Project Guide

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 DEVELOPMENT PARTNERSHIP - MANDATORY WORKFLOW

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

### AUTOMATED CHECKS ARE MANDATORY
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. No type errors. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

### CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

#### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

#### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

#### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** ❌

Run: `pnpm format && pnpm test && pnpm typecheck && pnpm biome:check`

#### 🚨 CRITICAL: Hook Failures Are BLOCKING
**When hooks report ANY issues (exit code 2), you MUST:**
1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:
- Formatting issues (Biome format)
- Linting violations (Biome lint, Next.js lint)
- Type errors (tsc --noEmit)
- Import/export issues
- ALL other checks

Your code must be 100% clean. No exceptions.

#### Working Memory Management

When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Project Overview

This is a multi-tenant dental practice dashboard built with Next.js 15, TypeScript, Supabase, and Prisma. The application provides comprehensive data visualization and KPI tracking for dental clinics, with Google Sheets integration for data sync.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server

### Code Quality - MANDATORY WORKFLOW
- `pnpm format` - Format code with Biome
- `pnpm test` - Run unit tests with Vitest using local Supabase database
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm biome:check` - Check code with Biome (linting + formatting)
- `pnpm biome:fix` - Auto-fix Biome issues
- `pnpm lint` - Run Next.js ESLint linter
- `pnpm lint:fix` - Fix Biome linting issues automatically
- `pnpm imports:fix` - Organize and fix import statements
- `pnpm pre-commit` - Manual pre-commit check (Biome + tests)
- `pnpm code-quality` - Full quality pipeline (Biome + tests + build)

### Database Operations
- `pnpm prisma:generate` - Generate Prisma client after schema changes
- `pnpm prisma:push` - Push schema changes to database (development)
- `pnpm prisma:studio` - Open Prisma Studio for data inspection
- `pnpm prisma:seed` - Seed database with initial data

### Testing
- `pnpm test:watch` - Run tests in watch mode with local database
- `pnpm test:coverage` - Generate test coverage report with local database
- `pnpm test:integration` - Run integration tests with Vitest
- `pnpm test:start` - Start local Supabase for testing
- `pnpm test:stop` - Stop local Supabase
- `pnpm test:reset` - Reset local test database to clean state

## TypeScript/Next.js-Specific Rules

### FORBIDDEN - NEVER DO THESE:
- **NO any or unknown** without proper type guards
- **NO non-null assertions (!)** without clear justification
- **NO @ts-ignore** - fix the actual type issue
- **NO setTimeout/setInterval** for coordination - use Promises/async
- **NO direct DOM manipulation** in React components
- **NO mutating props or state** directly
- **NO keeping old and new code** together
- **NO migration functions** or compatibility layers
- **NO versioned function names** (processV2, handleNew)
- **NO mixing server/client code** in wrong boundaries
- **NO TODOs** in final code
- **NO index of array as key** property in React elements
- **NO forEach with large arrays** - prefer for...of
- **NO undeclared variables** - explicitly declare all variables
- **NO classes with only static members**

> **AUTOMATED ENFORCEMENT**: Biome and TypeScript will BLOCK commits that violate these rules.  
> When you see `❌ TYPE ERROR` or `❌ LINT ERROR`, you MUST fix it immediately!

### Required Standards:
- **Delete** old code when replacing it
- **Explicit return types** on all functions
- **Meaningful names**: `userId` not `id`, `UserProfile` not `Profile`
- **Early returns** to reduce nesting
- **Type-safe constructors**: proper TypeScript interfaces and types
- **Proper error handling**: use Error objects, not strings
- **Custom hooks** for reusable logic
- **Composition over inheritance**
- **Server/client boundary respect**: no server code in client components
- **Regex literals declared at top level**
- **Prefer const/let over var**
- **Export from instead of import then export**

## Implementation Standards

### Our code is complete when:
- ✅ All linters pass with zero issues (Biome)
- ✅ All tests pass (Vitest)
- ✅ Type checking passes with zero errors
- ✅ Feature works end-to-end
- ✅ Old code is deleted
- ✅ TSDoc on all exported functions/components

### Testing Strategy
- Complex business logic → Write tests first (Vitest)
- React components → Write tests after implementation
- User flows → Add Playwright e2e tests
- API routes → Test both success and error cases
- Skip tests for simple presentational components

## Architecture Overview

### Technology Stack
- **Framework:** Next.js 15 with App Router and Turbopack
- **Language:** TypeScript 5.8.3 with strict mode
- **Database:** Supabase PostgreSQL with Prisma ORM
- **UI:** React 19, Shadcn UI, Radix UI, Tailwind CSS 4
- **State Management:** Server Components, React Context, Zustand, TanStack Query
- **Authentication:** Supabase Auth with SSR
- **Testing:** Hybrid testing with Vitest (unit/integration) and Playwright (E2E) with MCP integration
- **Code Quality:** Biome for comprehensive linting, formatting, and import organization with Husky pre-commit hooks

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
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
├── styles/               # Global styles
└── tests/                # E2E tests and test utilities
```

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Common Information For MCP use:
- **Linear MCP Quick Reference:**
  - Project name: Dental Dashboard (always include the project when creating Linear issues)
  - Project ID: 31deeedb-112f
  - Full Project ID: dental-dashboard-31deeedb112f
  - Team: AOJDevStudio
  - Team ID: 6b3573d9-0510-4503-b569-b92b37a36105

- **Supabase MCP Quick Reference:**
  - Organization name: KC Ventures Consulting Group
  - Organization slug: hbcnwcsjguowrjnugzye
  - Project name: dashboard
  - Project ID: yovbdmjwrrgardkgrenc
  - Project URL: https://yovbdmjwrrgardkgrenc.supabase.co

## 🛡️ DATABASE SAFETY AND ENVIRONMENT PROTECTION

### CRITICAL: Database Environment Safety
This project implements strict database safety protocols to prevent test data contamination in production.

#### Environment Isolation Rules
- **Production Database**: Real KamDental clinic data only (`supabase.co` URLs)
- **Staging Database**: Production-like testing environment (planned)
- **Local Test Database**: Development and testing only (`localhost:54322`)

#### REQUIRED Safety Checks Before Database Operations
1. **Always validate environment** before any database operations
2. **Use test environment guard** for test data operations:
   ```typescript
   import { validateTestEnvironment } from '@/lib/utils/test-environment-guard';
   validateTestEnvironment(); // Throws if production detected
   ```
3. **Check for test data contamination** if suspicious activity:
   ```bash
   node scripts/scan-contamination.js
   ```

## Performance & Security

### **Measure First**:
- No premature optimization
- Use React DevTools Profiler for performance bottlenecks
- Benchmark with real data before claiming improvements
- Monitor Core Web Vitals

### **Security Always**:
- Validate all inputs (client AND server)
- Use crypto.getRandomValues() for randomness
- Sanitize user content before rendering
- Parameterized queries for database operations (never concatenate!)
- Proper authentication/authorization boundaries

## TypeScript Best Practices

1. **Enforce Strict Null Checks:**
   - Always verify that a variable is not null or undefined before using it
   - Use conditional checks, optional chaining (?.), and the nullish coalescing operator (??)

2. **Define and Validate Types for External Data:**
   - For any data coming from an external source (APIs, raw SQL, etc.), create a specific interface or type
   - Use Zod to parse this data at the boundary of your application

3. **Write Type-Safe Prisma Queries:**
   - Rely on the auto-generated types from your Prisma client
   - Use IDE autocompletion to prevent errors in include or select clauses

4. **Integrate Type Checking into Your Workflow:**
   - Run `pnpm typecheck` regularly during development
   - Pre-commit hooks automatically run Biome formatting and tests before commits
   - Use `pnpm code-quality` for full quality pipeline before pushing changes

## Code Quality Pipeline

### Biome Configuration
The project uses a comprehensive Biome setup (`.biome.json`) with:

**Core Features:**
- **VCS Integration:** Git-aware linting with automatic ignore file handling
- **Import Organization:** Automatic import sorting and organization
- **Multi-language Support:** JavaScript/TypeScript, JSON, and CSS formatting

**Rule Categories (300+ rules):**
- **Accessibility:** Ensures WCAG compliance and semantic HTML
- **Performance:** Prevents performance anti-patterns (barrel files, unnecessary re-exports)
- **Security:** XSS prevention and secure coding practices
- **Complexity:** Maintains code readability and cognitive load
- **Style:** Consistent code formatting and naming conventions
- **Correctness:** Prevents runtime errors and type issues

## Communication Protocol

### Progress Updates:
```
✓ Implemented user authentication (all tests passing)
✓ Added rate limiting middleware  
✗ Found issue with session persistence - investigating
```

### Suggesting Improvements:
"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Critical Development Issues

### ⚠️ Database Reseeding Breaks Google Apps Script Sync
**CRITICAL:** Database reseeding generates new clinic IDs, breaking Google Apps Script sync with 500 errors.

**Symptoms:**
- Google Apps Script sync returns 500 errors
- Error: "JSON object requested, multiple (or no) rows returned" (PGRST116)
- No data syncs despite correct payload structure

**Root Cause:** Google Apps Script properties contain old clinic IDs after database reseed.

**Immediate Fix:**
1. Get current clinic IDs: `SELECT id, name FROM clinics ORDER BY name;`
2. Update Google Apps Script properties:
   - `LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID`
   - `LOCATION_FINANCIAL_HUMBLE_CLINIC_ID`
3. Or run Google Apps Script setup wizard again

**Current Clinic IDs (after latest reseed):**
- **Baytown**: `cmc3jcrs20001i2ht5sn89v66`
- **Humble**: `cmc3jcrhe0000i2ht9ymqtmzb`

## Development Guidelines

### Code Writing Guidelines
- Every time you write new code you must run a typecheck and biome check and fix any issues related to the code you wrote
- Run `pnpm biome:check` after every major code implementation

### Component Development
- Use Server Components by default, Client Components only when needed
- Follow the component structure in `docs/rules`
- Use absolute imports with `@/` prefix
- Group imports in order: React/Next.js, third-party, local absolute, local relative, types

### Database Development
1. **Schema Changes:**
   - For rapid iteration: `pnpm prisma:push`
   - For versioned changes: `pnpm prisma migrate dev --name descriptive_name`
2. **After schema changes:** Always run `pnpm prisma:generate`
3. **Data seeding:** Use `pnpm dlx tsx prisma/seed.ts` for reliable seeding

### API Development
- API routes are located in `src/app/api/`
- Use the `withAuth` middleware for protected routes with role-based access control
- Follow RESTful conventions for route naming
- Use Zod for request/response validation
- Implement proper error handling with `ApiError` and `ApiResponse` utilities
- Use standardized pagination with `apiPaginated` and `getPaginationParams`
- Apply multi-tenant security with clinic-based data isolation

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.