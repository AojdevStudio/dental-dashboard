# Google Sheets Integration Cleanup - Technical Debt Removal PRD

## Goals and Background Context

### Goals

- Remove Google Sheets pull-based integration code from the dental dashboard application
- Preserve Google Apps Script deployment infrastructure for one-way data flow (Sheets → Supabase)
- Eliminate OAuth complexity and column mapping UI from dashboard
- Reduce codebase complexity and maintenance burden
- Maintain existing data ingestion from Google Sheets via Apps Script
- Improve application performance by removing unused integration overhead

### Background Context

The current dental dashboard includes a complex Google Sheets integration system designed for bidirectional data synchronization. However, the business strategy has evolved to use a simpler one-way data flow where Google Apps Scripts push data from spreadsheets directly to Supabase, and the dashboard reads exclusively from the database.

This architectural decision eliminates the need for OAuth flows, column mapping interfaces, and Google Sheets API dependencies within the dashboard application. The existing Google Apps Script infrastructure will continue to handle data ingestion, making the dashboard-side integration code unnecessary technical debt.

Removing this code will simplify the application architecture, reduce bundle size, eliminate unused dependencies, and reduce potential security surface area while maintaining all current data functionality.

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-07-28 | 1.0 | Initial PRD creation | John (PM) |

## Requirements

### Functional

- FR1: Remove all Google Sheets OAuth integration code from dashboard application
- FR2: Remove column mapping UI components and related database queries
- FR3: Preserve all Google Apps Script deployment files and infrastructure
- FR4: Maintain data tables that receive data from Google Apps Scripts
- FR5: Remove Google Sheets API dependencies from package.json
- FR6: Remove Google OAuth client configuration from dashboard environment
- FR7: Update documentation to reflect simplified data flow architecture
- FR8: Ensure existing dashboard functionality remains unaffected

### Non Functional

- NFR1: Zero impact on data ingestion from Google Sheets via Apps Script
- NFR2: Maintain all existing provider performance and KPI dashboards
- NFR3: Reduce bundle size by removing unused Google APIs dependencies
- NFR4: Eliminate potential OAuth security vectors in dashboard application
- NFR5: Simplify deployment by removing Google OAuth configuration requirements
- NFR6: Maintain backwards compatibility for all dashboard API endpoints
- NFR7: Complete cleanup without requiring database migrations

## Technical Assumptions

### Repository Structure
Monorepo with existing Next.js application and separate Google Apps Script deployment folder

### Service Architecture
Simplified data flow: Google Sheets → Apps Script → Supabase ← Dashboard (read-only)

### Testing Requirements
- Regression testing to ensure dashboard functionality remains intact
- Validation that Google Apps Script deployment continues to work
- Integration testing for dashboard data consumption from Supabase

### Additional Technical Assumptions and Requests
- Preserve all Supabase database tables that receive Apps Script data
- Maintain existing Prisma schema for data tables (no schema changes needed)
- Keep Google Apps Script health monitoring and deployment tools
- Update build pipeline to remove Google OAuth environment variables

## Epics

### Epic List

1. **Frontend Cleanup**: Remove Google Sheets integration UI and OAuth flows
2. **Backend Cleanup**: Remove Google Sheets API endpoints and dependencies
3. **Documentation and Deployment**: Update docs and deployment configs

## Epic 1: Frontend Cleanup

Remove all Google Sheets integration user interface components, OAuth flows, and related frontend code while preserving dashboard functionality that reads from Supabase.

### Story 1.1: Google Sheets Integration UI Removal

As a **Frontend Developer**,
I want to **remove all Google Sheets integration UI components from the dashboard**,
so that **the application has a cleaner interface without unused features**.

#### Acceptance Criteria

- AC1: Remove Google OAuth login/connection UI components
- AC2: Remove column mapping interface and related forms
- AC3: Remove Google Sheets data source management pages
- AC4: Update navigation to remove Google Sheets integration menu items
- AC5: Remove any Google Sheets status indicators or connection widgets
- AC6: Ensure all remaining dashboard pages function normally
- AC7: Update any help text or documentation that references Google Sheets integration

### Story 1.2: OAuth Flow and Authentication Cleanup

As a **Frontend Developer**,
I want to **remove Google OAuth authentication flows from the dashboard**,
so that **the application no longer handles Google authentication complexity**.

#### Acceptance Criteria

- AC1: Remove Google OAuth callback handling pages/components
- AC2: Remove Google authentication state management (context/store)
- AC3: Remove Google OAuth redirect logic and route handlers
- AC4: Clean up any Google authentication error handling
- AC5: Remove Google OAuth tokens from client-side storage/state
- AC6: Ensure user authentication (Supabase Auth) remains unaffected
- AC7: Remove any Google OAuth-related environment variable usage

## Epic 2: Backend Cleanup

Remove Google Sheets API endpoints, database queries for OAuth management, and related backend infrastructure while preserving data tables that receive Apps Script data.

### Story 2.1: Google Sheets API Endpoints Removal

As a **Backend Developer**,
I want to **remove all Google Sheets API endpoints from the dashboard backend**,
so that **the application no longer exposes unused Google integration endpoints**.

#### Acceptance Criteria

- AC1: Remove `/api/google/connect` and related OAuth endpoints
- AC2: Remove `/api/google/callback` OAuth callback endpoint
- AC3: Remove any Google Sheets data sync API endpoints in dashboard
- AC4: Remove Google Sheets metadata fetching endpoints
- AC5: Preserve all existing provider performance and KPI API endpoints
- AC6: Ensure remaining API endpoints function without Google Sheets dependencies
- AC7: Update API documentation to remove Google Sheets endpoints

### Story 2.2: Database Query and Schema Cleanup

As a **Backend Developer**,
I want to **remove Google Sheets OAuth management code while preserving data tables**,
so that **Apps Script data ingestion continues working but OAuth complexity is eliminated**.

#### Acceptance Criteria

- AC1: Remove `/src/lib/database/queries/google-sheets.ts` file
- AC2: Remove Google OAuth token management database queries
- AC3: Remove column mapping CRUD operations and related queries
- AC4: **PRESERVE** all data tables that receive data from Apps Script (production data)
- AC5: **PRESERVE** database schema for `dentist_production`, `hygiene_production`, etc.
- AC6: Remove `DataSource` and `ColumnMapping` table access (if only used for OAuth)
- AC7: Ensure provider performance queries continue working with preserved data tables

### Story 2.3: Dependency and Configuration Cleanup

As a **Backend Developer**,
I want to **remove Google Sheets API dependencies and OAuth configuration**,
so that **the application has a lighter dependency footprint and simpler deployment**.

#### Acceptance Criteria

- AC1: Remove `@googleapis/sheets` and `@googleapis/drive` from package.json
- AC2: Remove Google OAuth client configuration from environment variables
- AC3: Remove Google API authentication middleware and utilities
- AC4: Update environment variable documentation to remove Google OAuth vars
- AC5: Remove Google OAuth scopes and permissions configuration
- AC6: Ensure build process completes successfully without Google dependencies
- AC7: Update deployment scripts to remove Google OAuth environment requirements

## Epic 3: Documentation and Deployment

Update project documentation and deployment configurations to reflect the simplified architecture without Google Sheets dashboard integration.

### Story 3.1: Architecture Documentation Update

As a **Technical Writer**,
I want to **update all documentation to reflect the new simplified data flow**,
so that **future developers understand the one-way Apps Script integration model**.

#### Acceptance Criteria

- AC1: Update CLAUDE.md to remove Google Sheets integration development protocols
- AC2: Update README.md to reflect simplified data architecture
- AC3: Create data flow diagram showing: Google Sheets → Apps Script → Supabase ← Dashboard
- AC4: Update API documentation to remove Google Sheets endpoints
- AC5: Document that Google Apps Script deployment files remain active
- AC6: Update troubleshooting guides to remove Google OAuth issues
- AC7: Create migration notes explaining the architectural change

### Story 3.2: Deployment and Environment Cleanup

As a **DevOps Engineer**,
I want to **clean up deployment configurations to remove Google OAuth requirements**,
so that **deployments are simpler and more secure**.

#### Acceptance Criteria

- AC1: Remove Google OAuth environment variables from production deployment configs
- AC2: Update CI/CD pipeline to remove Google OAuth secret requirements
- AC3: **PRESERVE** Google Apps Script deployment pipeline and configurations
- AC4: Update environment setup documentation to remove Google OAuth steps
- AC5: Remove Google OAuth client secrets from secret management systems
- AC6: Validate that Apps Script health monitoring continues to work
- AC7: Test complete deployment without Google OAuth dependencies

## Checklist Results Report

**TECHNICAL DEBT CLEANUP PRD CHECKLIST:**
✅ Clear separation between removal (dashboard) and preservation (Apps Script)
✅ Zero business impact on data ingestion pipeline
✅ Maintains all dashboard functionality while removing complexity
✅ Stories properly sequenced (UI → Backend → Deployment)
✅ Explicit preservation requirements for critical infrastructure
✅ Bundle size and performance improvements identified
✅ Security surface area reduction achieved
✅ Documentation updates ensure future developer clarity

## Next Steps

### Design Architect Prompt

Not applicable - this is technical debt removal maintaining existing UI/UX patterns.

### Architect Prompt

"Implement the Google Sheets integration cleanup outlined in this PRD. Focus on removing dashboard-side Google Sheets code while preserving Google Apps Script infrastructure. Ensure zero impact on data ingestion pipeline and maintain all existing dashboard functionality that reads from Supabase. Priority: MEDIUM - technical debt cleanup after security fixes."