# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Package Management (pnpm required)
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start development server with Turbopack
pnpm build                # Build for production
pnpm start                # Start production server
```

### Code Quality
```bash
pnpm lint                 # Run Biome linter
pnpm lint:fix             # Fix linting issues
pnpm format               # Format code with Biome
```

### Testing
```bash
pnpm test                 # Run tests once
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage
```

### Database (Prisma + Supabase)
```bash
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:push          # Push schema changes to database
pnpm prisma:studio        # Open Prisma Studio GUI
```

## High-Level Architecture

### Authentication Architecture
The project uses a **dual authentication system**:

1. **Supabase Auth** (Primary): Manages user sessions and application access
   - Cookie-based sessions with SSR support
   - Middleware protection at `/middleware.ts`
   - Server clients created per-request for security

2. **Google OAuth** (Secondary): For accessing Google Sheets API
   - OAuth 2.0 flow with offline access
   - Tokens stored encrypted in `DataSource` table
   - Per-user Google API access management

### API Architecture (Next.js App Router)
```
src/app/api/
├── auth/callback/        # Supabase OAuth callbacks
└── google/
    ├── auth/            # Google OAuth flow
    │   ├── login/       # Initiate OAuth
    │   └── callback/    # Handle OAuth response
    └── sheets/          # Google Sheets data access
        └── [spreadsheetId]/data/
```

### Service Layer Pattern
Business logic is separated from API routes:
- `src/services/google/`: Google API integration services
- `src/actions/`: Server actions for mutations
- `src/lib/`: Core utilities and client factories

### Data Flow
1. **Client Request** → API Route validates auth
2. **API Route** → Service layer for business logic
3. **Service** → External API (Google) or Database (Prisma)
4. **Response** → Structured JSON with proper error handling

### State Management
- **Server State**: React Query for caching and synchronization
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form with Zod validation

### Key Architectural Decisions
1. **Separation of Concerns**: Routes handle HTTP, services handle logic
2. **Type Safety**: Full TypeScript with Prisma-generated types
3. **Error Boundaries**: Consistent error handling across layers
4. **Security First**: Tokens in database, middleware protection
5. **Performance**: Parallel operations, efficient caching

### Database Schema Overview
Core entities managed by Prisma:
- `User`: Application users
- `DataSource`: Google Sheets connections with OAuth tokens
- `Clinic`, `Provider`: Business entities
- `MetricDefinition`, `MetricValue`: KPI tracking
- `Dashboard`, `Widget`: Visualization configuration

### Testing Strategy
- **Unit Tests**: Vitest for services and utilities
- **Integration Tests**: API route testing with mocked dependencies
- **Component Tests**: React Testing Library (when applicable)

## Important Notes

1. **Always use pnpm** - The project uses pnpm workspaces and won't work with npm/yarn
2. **Environment Variables**: Check `.env.example` for required configs
3. **Authentication Flow**: Always check user session before accessing protected resources
4. **Google API Limits**: Be mindful of rate limits when fetching spreadsheet data
5. **Type Generation**: Run `pnpm prisma:generate` after schema changes

## Development Guidelines

- We cannot use npm or npx commands in this repo.. always use pnpm

## Docs and Guide Management
- Always put docs and guides in the @docs directory

## Memory Management

- Use the Supabase MCP as much as possible to handle simple transactions

## Memories

- Use Prisma for the schema changes since this is a significant structural update that should be tracked.
- Use pnpm commands always, npm or npx is not allowed in this project.