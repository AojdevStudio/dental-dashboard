# CLAUDE.md - Dental Dashboard Development Partnership & Protocol Guide

This file provides comprehensive guidance to Claude Code (claude.ai/code) for the Dental Dashboard project - a multi-tenant dental practice insights dashboard.

## 🏥 PROJECT CONTEXT

**What We're Building**: A production-grade dental practice dashboard that provides comprehensive data visualization and KPI tracking for dental clinics. The application integrates with Google Sheets for data synchronization and provides multi-clinic management capabilities with role-based access control.

**Key Business Value**: 
- Centralizes practice performance metrics
- Automates data collection from Google Sheets
- Provides real-time insights for dental practice management
- Supports multi-location clinic administration

**Target Users**: Dental clinic owners, practice managers, office administrators, dentists, and hygienists who need data-driven insights to optimize operations and patient care.

# Architecture Documentation Index

docs/architecture

## Overview

This index provides a comprehensive guide to all architecture documentation for the Dental Dashboard project. Documents are organized by category to help AI agents and developers quickly find the information they need.

## Quick Navigation

### Core Architecture
- [Unified Project Structure](./unified-project-structure.md) - Complete directory layout and file organization
- [Technology Stack](./tech-stack.md) - All technologies, versions, and dependencies
- [Coding Standards](./coding-standards.md) - Code style, naming conventions, and best practices
- [Testing Strategy](./testing-strategy.md) - Test organization, patterns, and requirements

### Backend Architecture
- [Backend Architecture](./backend-architecture.md) - Service layer patterns and API structure
- [REST API Specifications](./rest-api-spec.md) - Complete API endpoint documentation
- [Data Models](./data-models.md) - Business entities and validation rules
- [Database Schema](./database-schema.md) - PostgreSQL tables, relationships, and migrations
- [External APIs](./external-apis.md) - Google Sheets and third-party integrations

### Frontend Architecture
- [Frontend Architecture](./frontend-architecture.md) - React patterns and component hierarchy
- [Component Specifications](./components.md) - UI component library and patterns
- [Core Workflows](./core-workflows.md) - User journeys and interaction flows
- [UI/UX Specifications](./ui-ux-spec.md) - Design system and visual guidelines

### Security & Performance
- [Security Considerations](./security-considerations.md) - RLS, authentication, and data protection
- [Performance Guidelines](./performance-guidelines.md) - Optimization strategies and patterns
- [Deployment Guide](./deployment-guide.md) - Production deployment and operations

### Troubleshooting & Maintenance
- [Troubleshooting Guide](./troubleshooting-guide.md) - Common issues and solutions
- [Code Review Checklist](./code-review-checklist.md) - Review standards and practices
- [Changelog Conventions](./changelog-conventions.md) - Version control and release notes

## Reading Order Recommendations

### For New AI Agents/Developers
1. Start with [Technology Stack](./tech-stack.md) to understand the tools
2. Review [Unified Project Structure](./unified-project-structure.md) for code organization
3. Study [Coding Standards](./coding-standards.md) for consistency
4. Choose backend or frontend path based on your task

### For Backend Development
1. [Backend Architecture](./backend-architecture.md) - Understand service patterns
2. [Database Schema](./database-schema.md) - Learn data structure
3. [REST API Specifications](./rest-api-spec.md) - API implementation details
4. [Security Considerations](./security-considerations.md) - Critical for multi-tenant features

### For Frontend Development
1. [Frontend Architecture](./frontend-architecture.md) - React and state patterns
2. [Component Specifications](./components.md) - UI building blocks
3. [Core Workflows](./core-workflows.md) - User interaction patterns
4. [UI/UX Specifications](./ui-ux-spec.md) - Visual consistency

### For Full-Stack Features
1. Review both backend and frontend sections
2. Pay special attention to [Data Models](./data-models.md) for end-to-end consistency
3. Understand [Testing Strategy](./testing-strategy.md) for comprehensive coverage

## Key Architectural Decisions

### Technology Choices
- **Framework**: Next.js 15 with App Router for modern React development
- **Database**: Supabase PostgreSQL with Prisma ORM for type safety
- **UI Library**: Shadcn UI with Tailwind CSS for consistent design
- **State Management**: TanStack Query + Zustand for efficient data flow
- **Authentication**: Supabase Auth with Row Level Security

### Design Patterns
- **Multi-tenancy**: Clinic-based data isolation using RLS
- **API Design**: RESTful endpoints with standardized error handling
- **Component Architecture**: Atomic design with reusable UI components
- **Data Flow**: Unidirectional with server state management

### Development Practices
- **Code Quality**: Biome for linting and formatting
- **Type Safety**: Strict TypeScript with no `any` types
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Documentation**: JSDoc for code, Markdown for guides

## Document Maintenance

Each architecture document includes:
- **Last Updated**: Date of last modification
- **Scope**: What the document covers
- **Examples**: Real code references from the project
- **Related Resources**: Links to connected documentation

When updating architecture:
1. Modify the relevant document
2. Update cross-references in related docs
3. Add entries to changelog if significant
4. Verify examples still match codebase

## Integration Points

### With Development Workflow
- PRDs in `/docs/prds/` define features
- Architecture docs guide implementation
- Code follows patterns defined here

### With UX Design
- `docs/architecture/ui-ux-spec.md` defines the design system
- Use Shadcn-ui MCP for all UI-UX design work

## 🚨 CRITICAL DEVELOPMENT PARTNERSHIP PROTOCOLS

### Core Meta-Cognitive Protocol
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Understand** - What problem are we solving? Read relevant docs/PRDs first
2. **Research** - Explore codebase, understand existing patterns
3. **Plan** - Create detailed implementation plan and verify with user
4. **Implement** - Execute plan with validation checkpoints
5. **Verify** - Ensure all quality checks pass

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

### Automated Quality Enforcement
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**
- Zero tolerance for errors, formatting issues, linting problems, or type errors
- When hooks fail (exit code 2), STOP and fix ALL issues immediately
- Your code must be 100% clean before continuing

**Reality Checkpoints** - Run after each feature:
```bash
pnpm format && pnpm test && pnpm typecheck && pnpm biome:check
```

### Multi-Agent Collaboration Protocol
Leverage multiple agents for complex tasks:
- Spawn agents to explore different parts of the codebase in parallel
- Use one agent for tests while another implements features
- Say: "I'll spawn agents to tackle different aspects of this problem"

Example delegation patterns:
- "I'll have an agent investigate the database schema while I analyze the API structure"
- "One agent will identify provider-related components while another checks the metrics system"

### Deep Thinking Protocol
For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity:
- "Let me ultrathink about this multi-tenant architecture before proposing a solution"
- "This RLS implementation requires ultrathinking to ensure security"

## 📋 TASK MANAGEMENT PROTOCOL

Use the TodoWrite tool proactively for:
- Complex multi-step tasks (3+ steps)
- Non-trivial implementations
- When the user provides multiple tasks
- After receiving new instructions

Mark tasks as:
- `in_progress` - BEFORE starting work (only one at a time)
- `completed` - IMMEDIATELY after finishing
- Create new tasks for discovered work

## 🏗️ ARCHITECTURE-SPECIFIC PROTOCOLS

### Next.js 15 App Router Protocol
- **Server Components by default** - Use Client Components only when needed
- **Route Groups**: `(auth)` for authentication, `(dashboard)` for main app
- **API Routes**: Located in `src/app/api/`, use standardized patterns
- **Middleware**: Authentication via `middleware.ts` with Supabase SSR
- **Loading States**: Always implement `loading.tsx` for Suspense
- **Error Boundaries**: Always implement `error.tsx` for error handling

### Supabase Multi-Tenant Protocol
- **Row Level Security (RLS)**: MANDATORY for all data access
- **Auth Context**: Use `getAuthContextByAuthId` for user clinic access
- **Clinic Isolation**: All queries must respect `authContext.clinicIds`
- **Provider Access**: Check `authContext.providerIds` for provider-specific data
- **Role Validation**: Verify roles via `UserClinicRole` model

### Database Operations Protocol
```typescript
// ALWAYS use auth context
const authContext = await getAuthContextByAuthId(user.id);

// ALWAYS filter by authorized clinics
const data = await prisma.model.findMany({
  where: {
    clinicId: { in: authContext.clinicIds },
    // Additional filters
  }
});

// NEVER use raw SQL without parameterization
// ALWAYS validate environment before test operations
```

### Google Sheets Integration Protocol
1. **OAuth Flow**: `/api/google/connect` → Google Auth → `/api/google/callback`
2. **Column Mapping**: Always validate mappings before sync
3. **Sync Resilience**: Handle partial failures gracefully
4. **Token Management**: Store securely in `DataSource` model
5. **Error Recovery**: Log failures to sync history

## 🛡️ SECURITY & SAFETY PROTOCOLS

### Database Environment Safety
```typescript
// CRITICAL: Always validate environment for test operations
import { validateTestEnvironment } from '@/lib/utils/test-environment-guard';
validateTestEnvironment(); // Throws if production detected
```

### API Security Protocol
- All routes must use `withAuth` middleware
- Role-based access: `requireClinicAdmin`, `requireAdmin`
- Input validation with Zod schemas
- Standardized error responses with `ApiError`
- No direct database access in routes

### Critical Security Rules
- **NO** any or unknown without type guards
- **NO** non-null assertions (!) without justification
- **NO** storing secrets in code
- **NO** raw SQL concatenation
- **ALWAYS** parameterize queries
- **ALWAYS** validate external data with Zod

## 💻 DEVELOPMENT WORKFLOW PROTOCOLS

### Code Quality Pipeline
```bash
# Before ANY commit
pnpm format          # Biome formatting
pnpm test           # Vitest unit tests
pnpm typecheck      # TypeScript checking
pnpm biome:check    # Comprehensive linting

# Full quality check
pnpm code-quality   # Runs all checks + build
```

### Testing Protocol
- **Unit Tests**: Complex business logic with Vitest
- **Integration Tests**: API routes and database operations
- **Cloud Testing**: All tests use cloud Supabase branch
- **Test Patterns**: Co-locate tests with components
- **Coverage**: Run `pnpm test:coverage` for reports

### Git Workflow Protocol
1. **Feature Branches**: Always work on feature branches
2. **Commit Messages**: Clear, descriptive with conventional commits
3. **PR Ready**: All quality checks must pass
4. **Never Force Push**: Preserve git history

## 🎯 FEATURE-SPECIFIC PROTOCOLS

### Provider Management Protocol
- Providers belong to clinics via many-to-many relationships
- Support multi-location providers
- Track provider types: dentist, hygienist, specialist
- Metrics are provider-specific when applicable

### Metrics & KPI Protocol
- **Financial Metrics**: Production, collection, adjustments
- **Patient Metrics**: New, active, retention rates
- **Appointment Metrics**: Scheduled, completed, no-shows
- **Aggregations**: Pre-compute daily/weekly/monthly
- **Real-time Updates**: Use TanStack Query for caching

### Dashboard Customization Protocol
- User-specific dashboard configurations
- Widget positioning and sizing
- Metric selection per widget
- Responsive grid system
- Persist layout in database

## 🔧 TECHNOLOGY-SPECIFIC PROTOCOLS

### React 19 & TypeScript Protocol
```typescript
// REQUIRED: Explicit return types
function calculateMetric(value: number): MetricResult {
  // Implementation
}

// REQUIRED: Proper error handling
try {
  const result = await riskyOperation();
} catch (error) {
  // Use Error objects, not strings
  throw new Error(`Operation failed: ${error.message}`);
}

// FORBIDDEN: Array index as key
items.map((item) => <Item key={item.id} />); // ✅
items.map((item, index) => <Item key={index} />); // ❌
```

### Prisma ORM Protocol
- Run `pnpm prisma:generate` after schema changes
- Use transactions for multi-table operations
- Implement proper error handling
- Use type-safe query builders
- Avoid N+1 queries with proper includes

### State Management Protocol
- **Server State**: TanStack Query for API data
- **Client State**: Zustand for global UI state
- **Form State**: React Hook Form with Zod
- **URL State**: Next.js query params
- **Auth State**: Supabase Auth hooks

## 🚀 PERFORMANCE PROTOCOLS

### Optimization Checklist
- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Lazy load heavy components
- [ ] Optimize images with Next.js Image
- [ ] Use database indexes for frequent queries
- [ ] Implement request deduplication

### Monitoring Protocol
- Winston logging for server-side
- Client logger for browser errors
- Track Core Web Vitals
- Monitor API response times
- Alert on error thresholds

## 📝 DOCUMENTATION PROTOCOLS

### Code Documentation
```typescript
/**
 * Calculates provider efficiency metrics
 * @param providerId - The provider's UUID
 * @param dateRange - Start and end dates for calculation
 * @returns Provider efficiency metrics including production per hour
 * @throws {ApiError} If provider not found or unauthorized
 */
export async function calculateProviderEfficiency(
  providerId: string,
  dateRange: DateRange
): Promise<ProviderEfficiency> {
  // Implementation
}
```

### PR Documentation Template
```markdown
## Summary
Brief description of changes

## Changes Made
- Specific change 1
- Specific change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(If UI changes)
```

## 🔄 CONTINUOUS IMPROVEMENT PROTOCOL

### Learning Capture
- Document new patterns in `/docs`
- Update this CLAUDE.md with learnings
- Share knowledge in PR descriptions
- Create reusable components

### Code Review Checklist
- [ ] Follows established patterns
- [ ] Includes proper error handling
- [ ] Has appropriate test coverage
- [ ] Respects multi-tenant boundaries
- [ ] Implements proper authorization
- [ ] Uses TypeScript strictly
- [ ] Handles edge cases

## 🎯 QUICK START COMMANDS

```bash
# Development
pnpm dev                    # Start dev server
pnpm prisma:studio         # Inspect database

# Testing
pnpm test                  # Run tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report

# Code Quality
pnpm format               # Format code
pnpm typecheck           # Check types
pnpm biome:check         # Lint code
pnpm code-quality        # Full pipeline

# Database
pnpm prisma:push         # Push schema changes
pnpm prisma:generate     # Generate client
pnpm prisma:seed         # Seed database

# Google Apps Script
pnpm gas:deploy          # Deploy scripts
pnpm gas:health         # Check health

# Debugging
pnpm null-safety:report  # Find nullish issues
pnpm security:scan      # Security audit
```

## 🔗 KEY INTEGRATIONS

### Linear (Project Management)
- Project: Dental Dashboard
- Team: AOJDevStudio
- Project ID: `31deeedb-112f-4203-b569-b92b37a36105`

### Supabase (Backend)
- Organization: KC Ventures Consulting Group
- Project: dashboard
- URL: `https://yovbdmjwrrgardkgrenc.supabase.co`

### Current Clinic IDs (Production)
- Baytown: `cmc3jcrs20001i2ht5sn89v66`
- Humble: `cmc3jcrhe0000i2ht9ymqtmzb`

## 🚨 CRITICAL ISSUES & SOLUTIONS

### Database Reseeding Breaks Google Apps Script
**Problem**: New clinic IDs after reseed break GAS sync
**Solution**: Update Script Properties with new IDs or re-run setup wizard

### TypeScript Strict Mode
**Problem**: Legacy code with type issues
**Solution**: Fix incrementally, never use @ts-ignore

### RLS Performance
**Problem**: Complex policies slow queries
**Solution**: Use auth context pattern, optimize with indexes

## 🤝 WORKING TOGETHER

- When stuck, ask: "I see two approaches: [A] vs [B]. Which do you prefer?"
- Document assumptions in code comments
- Prefer clarity over cleverness
- Delete old code when replacing
- Keep PRs focused and small

Remember: We're building a production system that real dental practices depend on. Quality, security, and reliability are non-negotiable.

---
*This file should be re-read whenever context gets long or after 30+ minutes of work.*