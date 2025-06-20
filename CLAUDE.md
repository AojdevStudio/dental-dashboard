# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant dental practice dashboard built with Next.js 15, TypeScript, Supabase, and Prisma. The application provides comprehensive data visualization and KPI tracking for dental clinics, with Google Sheets integration for data sync.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run Next.js ESLint linter
- `pnpm lint:fix` - Fix Biome linting issues automatically
- `pnpm format` - Format code with Biome
- `pnpm imports:fix` - Organize and fix import statements
- `pnpm biome:check` - Check code with Biome (linting + formatting)
- `pnpm biome:fix` - Auto-fix Biome issues
- `pnpm biome:format` - Format code with Biome
- `pnpm biome:lint` - Run Biome linter only
- `pnpm pre-commit` - Manual pre-commit check (Biome + tests)
- `pnpm code-quality` - Full quality pipeline (Biome + tests + build)
- `pnpm typecheck` - Run TypeScript type checking

### Database Operations
- `pnpm prisma:generate` - Generate Prisma client after schema changes
- `pnpm prisma:push` - Push schema changes to database (development)
- `pnpm prisma:studio` - Open Prisma Studio for data inspection
- `pnpm prisma:seed` - Seed database with initial data
- `pnpm dlx tsx prisma/seed.ts` - Alternative seed command

### Testing
- `pnpm test` - Run unit tests with Vitest using local Supabase database
- `pnpm test:watch` - Run tests in watch mode with local database
- `pnpm test:coverage` - Generate test coverage report with local database
- `pnpm test:e2e` - Run end-to-end tests with Playwright
- `pnpm test:ui` - Run Playwright UI mode for interactive testing
- `pnpm test:start` - Start local Supabase for testing
- `pnpm test:stop` - Stop local Supabase
- `pnpm test:reset` - Reset local test database to clean state

### Data Migration Scripts
- `pnpm migrate:uuid` - Run UUID migration script
- `pnpm migrate:validate` - Validate migration integrity
- `pnpm migrate:rollback` - Rollback UUID migration

### Security & RLS Scripts
- `node apply-rls-fixed.mjs` - Apply Row Level Security policies to database
- `node force-rls.mjs` - Force enable RLS on all tables
- `node debug-rls.mjs` - Debug and validate RLS configuration
- `node check-rls.cjs` - Check current RLS status and policies

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
- **API Layer:** Standardized API utilities with error handling, pagination, and validation

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
    ├── e2e/              # Playwright end-to-end tests
    ├── setup/            # Global test setup and teardown
    ├── utils/            # Test utilities and factories
    └── fixtures/         # Test data and fixtures
```

### Database Architecture
- **Multi-tenant design** with clinic-based data isolation
- **Row Level Security (RLS)** for data access control with automated policy enforcement
- **UUID migration in progress** (dual CUID/UUID support)
- **Prisma as exclusive data access layer** (Supabase Data API disabled)
- **Context-aware RLS** using `get_current_clinic_id()` PostgreSQL function
- **Transaction-based RLS testing** with isolated multi-tenant validation

## Workflow Guidance

### Project Management
- When starting work on a PRD (Product Requirements Document), move it from the backlog folder to the doing folder
- Once a PRD is completed, move it to the done folder
- After completion, write a summary and place it in ~/.claude/completed

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

## Common Information For MCP use:
- Linear MCP Quick Reference:
Project name: Dental Dashboard (always include the project when creating Linear issues)
Project ID: 31deeedb-112f
Full Project ID: dental-dashboard-31deeedb112f
Team: AOJDevStudio
Team ID: 6b3573d9-0510-4503-b569-b92b37a36105

- Supabase MCP Quick Reference:
Organization name: KC Ventures Consulting Group
Organization slug: hbcnwcsjguowrjnugzye
Project name: dashboard
Project ID: yovbdmjwrrgardkgrenc
Project URL: https://yovbdmjwrrgardkgrenc.supabase.co

## TypeScript Best Practices

1. **Enforce Strict Null Checks:**
   - Always verify that a variable is not null or undefined before using it
   - Use conditional checks, optional chaining (?.), and the nullish coalescing operator (??)

2. **Define and Validate Types for External Data:**
   - For any data coming from an external source (APIs, raw SQL, etc.), create a specific interface or type
   - Use Zod to parse this data at the boundary of your application

3. **Use Environment-Specific tsconfig.json Files:**
   - Create separate tsconfig.json files for different execution environments
   - For Supabase functions, include Deno types and extend the base tsconfig.json

4. **Write Type-Safe Prisma Queries:**
   - Rely on the auto-generated types from your Prisma client
   - Use IDE autocompletion to prevent errors in include or select clauses

5. **Integrate Type Checking into Your Workflow:**
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

**Smart Overrides:**
- Test files: Allow `console` statements and `any` types for testing flexibility
- Config files: Allow default exports and Node.js modules
- Type definition files: Relaxed namespace and interface rules

### Husky Pre-commit Hooks
Automated quality control via `.husky/pre-commit`:
1. **Auto-fix Issues:** Runs `pnpm biome:fix` to resolve formatting and linting
2. **Run Tests:** Ensures no regressions with `pnpm test --run`
3. **Stage Changes:** Automatically adds fixed files to the commit

### Quality Commands
- `pnpm biome:check` - Full check without fixes
- `pnpm biome:fix` - Auto-fix all issues
- `pnpm imports:fix` - Organize imports specifically
- `pnpm pre-commit` - Manual pre-commit simulation
- `pnpm code-quality` - Complete quality pipeline (Biome + tests + build)

## Development Guidelines

### Code Quality Standards
- **Biome Configuration:** Comprehensive setup with 300+ rules covering accessibility, performance, security, and style
- **Automated Quality Control:** Husky pre-commit hooks automatically run Biome fixes and tests
- **Import Organization:** Auto-organized imports with `pnpm imports:fix` command
- **Multi-language Support:** JavaScript/TypeScript, JSON, and CSS formatting and linting
- **Smart Overrides:** Context-aware rules for test files, config files, and type definitions
- Use structured logging with Winston (configured in `src/lib/utils/logger.ts`)
- Implement comprehensive error handling
- Write unit tests for utilities and integration tests for API routes

### Component Development
- Use Server Components by default, Client Components only when needed
- Follow the component structure in `docs/rules`
- Use absolute imports with `@/` prefix
- Group imports in order: React/Next.js, third-party, local absolute, local relative, types

### Security Considerations
- Never log sensitive information (passwords, API keys, PII)
- Use environment variables for configuration
- Implement proper authentication and authorization
- Follow RLS patterns for data access control

## Common Tasks

### Adding a New API Route
1. Create route file in appropriate `src/app/api/` directory
2. Implement HTTP methods as named exports (GET, POST, etc.)
3. Add authentication with `withAuth` middleware if needed
4. Use Zod schemas for request validation
5. Return responses using `ApiResponse` utilities (`apiSuccess`, `apiError`, `apiPaginated`)
6. Apply multi-tenant filtering with clinic-based access control
7. Use `getPaginationParams` for paginated endpoints
8. Implement proper error handling with `handleApiError`

### Adding a New Component
1. Place in appropriate `src/components/` subdirectory
2. Follow naming conventions (PascalCase for components)
3. Use TypeScript interfaces for props
4. Include proper JSDoc comments if complex
5. Add unit tests for utilities, integration tests for complex logic

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma:push` for development
3. Run `pnpm prisma:generate` to update client
4. Update related TypeScript types if needed
5. Create proper migration with `pnpm prisma migrate dev` for production

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI

## Testing Strategy

### Test Infrastructure (AOJ-59)
- **Hybrid Testing Architecture:** Vitest for unit/integration tests, Playwright for E2E tests
- **Local Test Database:** Docker-based Supabase for isolated testing environment
- **Environment Isolation:** Development uses cloud database, testing uses local database
- **MCP Integration:** AI-powered test generation and validation using Model Context Protocol
- **Advanced Test Organization:** Separate configurations for unit, integration, and E2E tests
- **Cross-browser Testing:** Chrome, mobile Chrome with responsive testing capabilities
- **Performance Testing:** Automated performance benchmarks and optimization validation

### Local Test Database Setup
- **Automatic Management:** Tests automatically start/stop local Supabase
- **Environment Variables:** `.env.test` for test-specific configuration
- **Database Isolation:** localhost:54322 for PostgreSQL, localhost:54321 for Supabase API
- **Schema Deployment:** Prisma schema automatically applied to local database
- **Production Safety:** Zero risk to production data, complete environment isolation

### Test Types and Structure
- **Unit Tests:** Pure functions, utilities, isolated components (`src/**/__tests__/`)
- **Integration Tests:** API routes, database operations, multi-component interactions
- **E2E Tests:** Full user workflows, authentication, browser compatibility (`tests/e2e/`)
- **RLS Security Tests:** Multi-tenant data isolation and security policy validation
- **Performance Tests:** Database query optimization and response time benchmarks

### Test Configuration Files
- `vitest.config.ts` - Unit test configuration with jsdom environment and `.env.test` loading
- `vitest.integration.config.ts` - Integration test configuration for local database testing
- `playwright.config.ts` - E2E test configuration with cross-browser support
- `tests/setup/global-setup.ts` - Global test environment initialization
- `tests/setup/global-teardown.ts` - Test cleanup and resource management
- `.env.test` - Local test database configuration (localhost Supabase)
- `.env` - Production environment variables and MCP credentials

### Test Data Management
- **Test Fixtures:** Structured test data with multi-tenant isolation (`tests/fixtures/`)
- **Test Factories:** Dynamic test data generation for comprehensive coverage
- **Database Reset:** Automated local test database setup and teardown for isolation
- **RLS Context Testing:** Transaction-based context switching for security validation
- **Local Database Control:** Full control over test data scenarios and database state

## Important Notes

- **Data Access:** Use Prisma exclusively; Supabase Data API is disabled
- **Authentication:** Supabase Auth with SSR configuration
- **Multi-tenancy:** All data operations must respect clinic-based isolation
- **Migration Status:** Currently migrating from CUID to UUID identifiers
- **Google Integration:** OAuth flow for Sheets API access is implemented
- **API Standards:** Use standardized API utilities for consistent error handling and responses
- **Performance:** Database-level pagination is implemented for efficient large dataset handling
- **Provider Management:** Comprehensive provider-location relationship management is available

## Development Guidelines

### Code Writing Guidelines
- Every time you write new code you must run a typecheck and biome check and fix any issues related to the code you wrote

## New Features and API Endpoints

### Provider Management API
- **GET/POST /api/providers** - Paginated provider listing and creation with multi-tenant security
- **GET/POST/PATCH /api/providers/[providerId]/locations** - Provider-location relationship management
- **GET /api/providers/[providerId]/performance** - Comprehensive provider performance metrics

### API Utilities and Standards
- **Enhanced Error Handling:** `ApiError` class with status codes and error categorization
- **Response Utilities:** `apiSuccess`, `apiError`, `apiPaginated` for consistent API responses
- **Advanced Pagination:** Database-level pagination with metadata and performance optimization
- **Validation Helpers:** Date range, sort parameter, and UUID format validation
- **Security Middleware:** Enhanced `withAuth` middleware with role-based access control
- **Multi-tenant Security:** Automatic clinic-based data isolation and context validation

### Service Layer Architecture
- **Base Service Pattern:** Standardized service classes with validation
- **Goal Creation Strategies:** Template-based and regular goal creation patterns
- **Financial Services:** Location financial data management and import pipeline

### Performance Enhancements
- **Database-level Pagination:** Efficient handling of large datasets with metadata calculation
- **Parallel Query Execution:** Count and data queries executed in parallel for optimal performance
- **Multi-location Aggregation:** Provider performance across multiple locations with real-time metrics
- **Comprehensive Analytics:** Production tracking, goal achievement, variance analysis, and KPI dashboards
- **Query Optimization:** Advanced database indexing and query performance monitoring

## Advanced Features and Infrastructure

### Row Level Security (RLS) Implementation
- **Automated RLS Setup:** Scripts for applying and validating RLS policies across all tables
- **Context-aware Security:** PostgreSQL function `get_current_clinic_id()` for dynamic security context
- **Multi-tenant Isolation:** Transaction-based context switching with automatic tenant data filtering
- **RLS Testing Framework:** Comprehensive test suite for validating multi-tenant security policies
- **Policy Management:** Debug and validation tools for RLS configuration management

### Test Infrastructure Modernization (AOJ-59)
- **Hybrid Testing Framework:** Combined Vitest (unit/integration) and Playwright (E2E) architecture
- **MCP Integration:** Model Context Protocol for AI-powered test generation and validation
- **Advanced Test Organization:** Categorized test suites with performance, security, and integration focus
- **Cross-browser Validation:** Automated testing across Chrome, mobile devices, and responsive layouts
- **Test Data Factories:** Sophisticated test data generation with multi-tenant isolation support
- **Global Test Management:** Automated database reset, seeding, and cleanup for isolated test execution

### Shared Coordination System
- **Inter-process Communication:** Task coordination and handoff management for development workflows
- **Wave-based Development:** Structured development phases with automated handoff signals
- **MCP Status Tracking:** Model Context Protocol integration status and coordination
- **Artifact Management:** Centralized documentation and implementation artifact tracking
- **Development Workflow:** Enhanced project management with automated task dependencies

### Enhanced Security Features
- **Force RLS Scripts:** Automated enforcement of Row Level Security across all database tables
- **Security Validation:** Comprehensive security policy testing and validation framework
- **Context Isolation:** Advanced multi-tenant data isolation with transaction-based context management
- **Audit Trail:** Enhanced logging and security event tracking for compliance and monitoring

## Code Performance and Best Practices

- Avoid using the index of an array as key property in an element
- Prefer for...of instead of forEach. forEach may lead to performance issues when working with large arrays. When combined with functions like filter or map, this causes multiple iterations over the same type

## Work Guidelines

- Run `pnpm biome:check` after every major code implementation

## Import Best Practices
- An import should not be exported. Use export from instead. 'export from' makes it clearer that the intention is to re-export a variable.

## TypeScript Type Practices
- Do not use the 'any' type whatsoever. Sometimes you can use the type 'unknown' instead of the type 'any'

## Code Guidelines
- Regex literals are required to be declared at the top level

## JavaScript Variable Declaration Best Practices
- All variables must be explicitly declared before use.
- Avoid using undeclared or implicit global variables.
- Prefer `const` or `let` over `var` in JavaScript.
- Ensure all identifiers are defined within scope or imported.

## Additional Coding Practices
- Avoid classes that only contain static members