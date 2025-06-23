# Architecture Documentation Index

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

### With External Systems
- Google Sheets API integration patterns
- Supabase service configurations
- Vercel deployment requirements

---

**Navigation**: [Back to Main Index](../index.md)