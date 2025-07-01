# Technology Stack

## Overview

This document details all technologies, frameworks, libraries, and tools used in the Dental Dashboard project. Each technology is listed with its specific version, purpose, and key considerations for AI agents working with the codebase.

## Quick Reference

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Package Manager | pnpm | 8+ | Dependency management |
| Framework | Next.js | 15.3.2 | Full-stack React framework |
| Language | TypeScript | 5.8.3 | Type-safe JavaScript |
| Database | PostgreSQL | 15+ | Primary data store (via Supabase) |
| ORM | Prisma | 6.8.2 | Database access layer |
| UI Library | Shadcn UI | Latest | Component library |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| State Management | TanStack Query | 5.79.0 | Server state management |

## Core Technologies

### Runtime & Language

#### Node.js
- **Version**: 18.x or higher
- **Purpose**: Server-side JavaScript runtime
- **Key Files**: All `.js`, `.ts`, `.mjs` files
- **Considerations**: Use ES modules, async/await patterns

#### TypeScript
- **Version**: 5.8.3
- **Purpose**: Type safety and better developer experience
- **Configuration**: `tsconfig.json`
- **Key Settings**:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true
    }
  }
  ```
- **Important**: Never use `any` type, prefer `unknown` when needed

### Package Management

#### pnpm
- **Version**: 8.x
- **Purpose**: Fast, efficient package management
- **Key Commands**:
  ```bash
  pnpm install      # Install dependencies
  pnpm add [pkg]    # Add new dependency
  pnpm dev          # Start development
  ```
- **Workspace**: Configured in `pnpm-workspace.yaml`

## Frontend Stack

### Framework

#### Next.js
- **Version**: 15.3.2
- **Purpose**: React framework with SSR/SSG capabilities
- **Router**: App Router (not Pages Router)
- **Key Features Used**:
  - Server Components by default
  - API Routes for backend
  - Middleware for auth
  - Turbopack for fast builds

### UI & Styling

#### React
- **Version**: 19.1.0
- **Purpose**: UI component library
- **Patterns**: Functional components with hooks

#### Shadcn UI
- **Version**: Latest (component-based installation)
- **Purpose**: Accessible, customizable component library
- **Base**: Radix UI primitives
- **Components Location**: `src/components/ui/`
- **Configuration**: `components.json`

#### Tailwind CSS
- **Version**: 4.0
- **Purpose**: Utility-first CSS framework
- **Configuration**: `tailwind.config.js`
- **Global Styles**: `src/styles/globals.css`

#### Radix UI
- **Version**: Various (see package.json)
- **Purpose**: Unstyled, accessible UI primitives
- **Used Components**:
  - Dialog, Dropdown, Select, Tabs
  - Accordion, Avatar, Checkbox
  - And more...

### State Management

#### TanStack Query (React Query)
- **Version**: 5.79.0
- **Purpose**: Server state management
- **Key Features**:
  - Caching
  - Background refetching
  - Optimistic updates
- **Configuration**: Providers in `app/(dashboard)/providers.tsx`

#### Zustand
- **Version**: Latest
- **Purpose**: Client-side global state (minimal use)
- **Use Cases**: UI state, user preferences

## Backend Stack

### Database & ORM

#### Supabase
- **Version**: 2.49.8
- **Purpose**: PostgreSQL hosting, Auth, Realtime, Edge Functions
- **Components Used**:
  - PostgreSQL database
  - Authentication service
  - Row Level Security (RLS)
  - Edge Functions for complex logic

#### PostgreSQL
- **Version**: 15+
- **Purpose**: Primary database
- **Access**: Through Supabase only
- **Key Features**:
  - UUID support for multi-tenancy
  - RLS policies for security
  - JSON/JSONB for flexible data

#### Prisma
- **Version**: 6.8.2
- **Purpose**: Type-safe database access
- **Schema**: `prisma/schema.prisma`
- **Client Generation**: `pnpm prisma:generate`
- **Important**: Primary data access layer (not Supabase SDK)

### Authentication

#### Supabase Auth
- **Version**: Part of Supabase SDK
- **Purpose**: User authentication and session management
- **Features**:
  - Email/password auth
  - OAuth (Google)
  - JWT session tokens
  - SSR-compatible

### API Development

#### Next.js API Routes
- **Location**: `src/app/api/`
- **Purpose**: Backend endpoints
- **Pattern**: RESTful design
- **Middleware**: Custom auth wrapper

#### Zod
- **Version**: Latest
- **Purpose**: Runtime type validation
- **Use Cases**:
  - Request validation
  - Environment variables
  - Data parsing

## Development Tools

### Code Quality

#### Biome
- **Version**: Latest
- **Purpose**: Linting, formatting, import organization
- **Configuration**: `.biome.json`
- **Features**:
  - 300+ lint rules
  - Auto-formatting
  - Import sorting

#### Husky
- **Version**: Latest
- **Purpose**: Git hooks
- **Hooks**: Pre-commit quality checks

### Testing

#### Vitest
- **Version**: Latest
- **Purpose**: Unit and integration testing
- **Configuration**: `vitest.config.ts`
- **Test Pattern**: `*.test.ts`, `*.test.tsx`

#### Playwright
- **Version**: Latest
- **Purpose**: End-to-end testing
- **Configuration**: `playwright.config.ts`
- **Test Location**: `tests/e2e/`

### Logging & Monitoring

#### Winston
- **Version**: Latest
- **Purpose**: Structured logging
- **Configuration**: `src/lib/utils/logger.ts`
- **Log Levels**: error, warn, info, debug

## External Services

### Google APIs

#### Google Sheets API
- **Client**: `@googleapis/sheets` v9.8.0
- **Purpose**: Spreadsheet data import
- **Auth**: OAuth 2.0

#### Google Drive API
- **Client**: `@googleapis/drive` v12.1.0
- **Purpose**: File access and discovery

### AI/ML Services

#### OpenAI
- **Version**: 4.104.0
- **Purpose**: AI-powered features (if implemented)

#### Anthropic SDK
- **Version**: 0.39.0
- **Purpose**: Claude integration

## Deployment & Infrastructure

### Hosting

#### Vercel
- **Purpose**: Application hosting
- **Features**:
  - Automatic deployments
  - Edge functions
  - Analytics
- **Configuration**: `vercel.json` (if present)

### Environment Requirements

#### Node.js Version
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection
- `DIRECT_URL` - Direct DB connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase key
- `GOOGLE_REDIRECT_URI` - OAuth redirect

## Browser Requirements

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES2020 JavaScript
- CSS Grid and Flexbox
- LocalStorage
- Fetch API

## Version Constraints

### Critical Dependencies
Always check these versions when debugging:
1. Next.js - Must be 15.x for App Router
2. React - Must be 19.x for latest features
3. Prisma - Keep in sync with database schema
4. TypeScript - 5.8+ for latest type features

### Update Strategy
- Security updates: Immediate
- Minor updates: Monthly review
- Major updates: Quarterly planning

## Development Environment

### Recommended Tools
- VS Code with extensions:
  - Biome
  - Prisma
  - Tailwind CSS IntelliSense
  - TypeScript

### Local Development
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Start development server
pnpm dev

# Run type checking
pnpm typecheck
```

## Things to Avoid

- ❌ Using npm or yarn (use pnpm)
- ❌ Downgrading TypeScript below 5.8
- ❌ Direct database access (use Prisma)
- ❌ Client-side environment secrets
- ❌ Synchronous API calls

## Related Resources

- [Coding Standards](./coding-standards.md) - Language-specific guidelines
- [Testing Strategy](./testing-strategy.md) - Testing tool usage
- [Deployment Guide](./deployment-guide.md) - Production configuration

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)