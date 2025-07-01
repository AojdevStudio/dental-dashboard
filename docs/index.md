# Dental Dashboard Documentation Index

## Overview

Welcome to the comprehensive documentation for the Dental Practice Analytics Dashboard. This documentation is structured to serve both technical developers and non-technical stakeholders, providing clear guidance for AI agents and human developers working on this multi-tenant dental practice management system.

## 🎯 Project Purpose

The Dental Practice Analytics Dashboard is a centralized web application that transforms dental practice data from Google Sheets into actionable insights through intuitive visualizations. It serves multiple dental practices with secure, role-based access to key performance indicators (KPIs).

## 📖 Documentation Structure

### For Non-Technical Stakeholders

- [Product Requirements](./prds/doing/prd-mvp.md) - Understanding the MVP vision and goals
- [Business Context](./unified-dental/unified-dental-business-context.md) - Dental industry workflows and terminology
- [UX Guidelines](./ux-rubric.md) - User experience principles and design patterns

### For Technical Teams

#### Core Architecture Documentation
- [Architecture Index](./architecture/index.md) - Complete technical architecture guide
- [Technology Stack](./architecture/tech-stack.md) - Frameworks, libraries, and versions
- [Project Structure](./architecture/unified-project-structure.md) - Code organization and conventions
- [Coding Standards](./architecture/coding-standards.md) - Development best practices

#### Backend Documentation
- [Backend Architecture](./architecture/backend-architecture.md) - Service patterns and structure
- [API Specifications](./architecture/rest-api-spec.md) - Endpoint documentation
- [Database Schema](./architecture/database-schema.md) - Data models and relationships
- [Data Models](./architecture/data-models.md) - Entity definitions and validation

#### Frontend Documentation
- [Frontend Architecture](./architecture/frontend-architecture.md) - React patterns and state management
- [Component Specifications](./architecture/components.md) - UI component library
- [Core Workflows](./architecture/core-workflows.md) - User interaction flows
- [UI/UX Specifications](./architecture/ui-ux-spec.md) - Design system and guidelines

#### Security & Operations
- [Security Considerations](./architecture/security-considerations.md) - RLS and multi-tenant patterns
- [Deployment Guide](./architecture/deployment-guide.md) - Production deployment process
- [Testing Strategy](./architecture/testing-strategy.md) - Test approaches and requirements
- [Performance Guidelines](./architecture/performance-guidelines.md) - Optimization patterns

### Development Workflows

#### BMAD Methodology
- [BMAD Integration Plan](./architecture/bmad-brownfield-integration-plan.md) - Agile TDD workflow
- [Developer Guidelines](./developer-guidelines/) - Best practices and patterns
- [Agentic TDD Workflow](./developer-guidelines/agentic-tdd-workflow-user-guide.md) - AI-assisted development

#### Current Development Status
- **Project Completion**: ~50% (MVP Phase 1 Complete, Phase 2-3 In Progress)
- **Active PRDs**: See [Doing Folder](./prds/doing/)
- **Completed Features**: See [Done Folder](./prds/done/)

## 🚀 Quick Start for AI Agents

1. **Understand the Project**: Start with the [MVP PRD](./prds/doing/prd-mvp.md)
2. **Review Architecture**: Check [Architecture Index](./architecture/index.md)
3. **Follow Standards**: Use [Coding Standards](./architecture/coding-standards.md)
4. **Check Current Tasks**: Review active PRDs in [Doing Folder](./prds/doing/)
5. **Test Your Changes**: Follow [Testing Strategy](./architecture/testing-strategy.md)

## 🔑 Key Technical Decisions

- **Frontend**: Next.js 15 with App Router, Shadcn UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions), Prisma ORM
- **State Management**: TanStack Query for server state, Zustand for UI state
- **Testing**: Vitest for unit/integration, Playwright for E2E
- **Security**: Row Level Security (RLS) for multi-tenant isolation
- **Code Quality**: Biome for linting/formatting, Husky for pre-commit hooks

## 📊 Project Status

### Completed Features
- ✅ Authentication system with Supabase Auth
- ✅ Multi-tenant database architecture with RLS
- ✅ Provider management system
- ✅ Location financial tracking
- ✅ Basic dashboard layout and navigation
- ✅ Dark mode support
- ✅ Core visualization components

### In Progress
- 🔄 Google Sheets integration refinement
- 🔄 Essential KPI calculations
- 🔄 Fixed role-based dashboards
- 🔄 Goal tracking system

### Upcoming
- 📋 Advanced filtering and analysis
- 📋 Export capabilities
- 📋 Performance optimizations
- 📋 Comprehensive testing suite

## 🛠️ Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm typecheck        # Run TypeScript checking

# Code Quality
pnpm biome:check      # Check code quality
pnpm biome:fix        # Auto-fix issues
pnpm lint:fix         # Fix linting issues

# Database
pnpm prisma:push      # Push schema changes
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open database GUI

# Testing
pnpm test            # Run tests
pnpm test:e2e        # Run E2E tests
```

## 📚 Additional Resources

- [Google Services Setup](./guides/google-services-setup.md) - OAuth configuration
- [RLS Implementation Guide](./implementation-guides/rls-implementation-guide.md) - Security setup
- [Migration Guides](./migration/) - Database migration documentation
- [Troubleshooting](./architecture/troubleshooting-guide.md) - Common issues and solutions

## 🤝 Contributing

Before contributing, please:
1. Review the [Code Review Guidelines](./developer-guidelines/code-review-guidelines.md)
2. Follow the [Null Safety Guidelines](./developer-guidelines/null-safety-guidelines.md)
3. Understand the [BMAD Workflow](./bmad-integration/)
4. Check active tasks in Linear or PRD documents

---

**Last Updated**: December 2024
**Documentation Version**: BMAD v4 Baseline