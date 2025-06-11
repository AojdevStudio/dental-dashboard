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
- `pnpm lint` - Run Biome linter
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking

### Database Operations
- `pnpm prisma:generate` - Generate Prisma client after schema changes
- `pnpm prisma:push` - Push schema changes to database (development)
- `pnpm prisma:studio` - Open Prisma Studio for data inspection
- `pnpm prisma:seed` - Seed database with initial data
- `pnpm dlx tsx prisma/seed.ts` - Alternative seed command

### Testing
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report

### Data Migration Scripts
- `pnpm migrate:uuid` - Run UUID migration script
- `pnpm migrate:validate` - Validate migration integrity
- `pnpm migrate:rollback` - Rollback UUID migration

## Architecture Overview

### Technology Stack
- **Framework:** Next.js 15 with App Router and Turbopack
- **Language:** TypeScript 5.8.3 with strict mode
- **Database:** Supabase PostgreSQL with Prisma ORM
- **UI:** React 19, Shadcn UI, Radix UI, Tailwind CSS 4
- **State Management:** Server Components, React Context, Zustand, TanStack Query
- **Authentication:** Supabase Auth with SSR
- **Testing:** Vitest with jsdom environment
- **Code Quality:** Biome for linting and formatting

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
└── styles/               # Global styles
```

### Database Architecture
- **Multi-tenant design** with clinic-based data isolation
- **Row Level Security (RLS)** for data access control
- **UUID migration in progress** (dual CUID/UUID support)
- **Prisma as exclusive data access layer** (Supabase Data API disabled)

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
- Use the `withAuth` middleware for protected routes
- Follow RESTful conventions for route naming
- Use Zod for request/response validation
- Implement proper error handling with `ApiError` and `ApiResponse`

## Supabase Project Details
- **Project ID:** yovbdmjwrrgardkgrenc
- **Project Name:** dashboard

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
   - Set up pre-commit hooks that run TypeScript check and Biome formatting

## Development Guidelines

### Code Quality Standards
- Follow Biome configuration for consistent formatting
- Use structured logging with Winston (configured in `src/lib/utils/logger.ts`)
- Implement comprehensive error handling
- Write unit tests for utilities and integration tests for API routes

### Component Development
- Use Server Components by default, Client Components only when needed
- Follow the component structure in `docs/rules/structure/`
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
5. Return responses using `ApiResponse` utility

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

- Unit tests for utilities and pure functions
- Integration tests for API routes and database operations
- Component tests for complex UI interactions
- Use `vitest.config.ts` for unit tests, `vitest.integration.config.ts` for integration tests

## Important Notes

- **Data Access:** Use Prisma exclusively; Supabase Data API is disabled
- **Authentication:** Supabase Auth with SSR configuration
- **Multi-tenancy:** All data operations must respect clinic-based isolation
- **Migration Status:** Currently migrating from CUID to UUID identifiers
- **Google Integration:** OAuth flow for Sheets API access is implemented