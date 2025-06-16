# PRD: Dental Practice Analytics Dashboard - MVP

**Version:** 1.0-MVP
**Date:** {{Current Date}}

**Critique & MVP Focus Note (from original PRD):**
This PRD outlines a focused Minimum Viable Product (MVP) for the Dental Practice Analytics Dashboard. The primary goal is to deliver core value quickly by concentrating on essential features and a streamlined architecture. Advanced features, particularly extensive dashboard customization, are explicitly deferred to post-MVP phases. This document supersedes previous PRD versions for MVP development.

## 1. Overview

The Dental Practice Analytics Dashboard (MVP) is a centralized web application designed to visualize and analyze key performance indicators (KPIs) from dental practices. It connects to existing Google Spreadsheets via API, transforms raw data into actionable insights, and presents them through intuitive, fixed-layout visualizations. The MVP system will serve as a read-only dashboard.

This solution addresses the critical need for cohesive data analysis across multiple dental practices and provides real-time performance visibility against established goals, focusing initially on essential metrics and core functionality.

**Target File Structure:** Development will adhere to the project structure defined in `.dev/file-system.md`.
**Target Database Schema:** The database implementation will follow `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`.
**Detailed Feature Specifications:** Specific implementation details for features are located in `.dev/feature-spec.md`.

## 2. Target Audience (MVP)

The primary users for the MVP will be:

*   **Office Managers:** Responsible for overall practice performance monitoring and financial oversight. They need comprehensive views across core metrics.
*   **Dentists/Providers:** Need visibility into their individual core performance metrics.
*   **Front Desk Staff:** Require access to essential appointment and call metrics.

Each user type will have tailored, **fixed-layout** dashboard views appropriate to their role.

## 3. MVP Core Features

The MVP will focus on the following core features, as detailed in `.dev/mvp.md` and `.dev/feature-spec.md`:

### 3.1. Google Sheets Integration Core
*   **Goal:** Secure OAuth connection to Google Sheets API with basic data extraction and standardized metric mapping for essential dental practice KPIs.
*   **Details:**
    *   OAuth 2.0 authentication flow.
    *   Spreadsheet discovery and selection.
    *   Pre-defined column mapping templates (details in `.dev/feature-spec.md`).
    *   Automated data extraction and basic transformation (primarily via Supabase Edge Functions).
    *   Manual data sync with status indicators and error logging (Winston).
    *   Support for multiple spreadsheets per clinic.
    *   Error handling and retry mechanisms.
*   **Logic Placement:** Backend-focused (Next.js API Routes, Supabase Edge Functions).

### 3.2. Essential KPI Dashboard
*   **Goal:** Fixed dashboard layouts displaying core dental practice metrics with basic filtering and time period selection.
*   **Details:**
    *   Pre-built, **non-configurable** dashboard templates for each user role.
    *   Core financial metrics (production, collections, payments).
    *   Key patient metrics (active patients, new patients, recare rates).
    *   Essential appointment analytics (total kept, cancellation rates, hygiene breakdown).
    *   Basic provider performance (production by provider).
    *   Core call tracking performance (unscheduled treatment, hygiene reactivation).
    *   Time period filtering (daily, weekly, monthly, quarterly).
    *   Clinic and provider-level filtering.
*   **Logic Placement:** Data fetching via Next.js API routes, calculations primarily in Supabase Edge Functions or optimized database queries. Frontend (Recharts) for visualization only.

### 3.3. Multi-Tenant User Management
*   **Goal:** Role-based access control (RBAC) supporting multiple dental practices with provider-specific data isolation.
*   **Details:**
    *   Clinic-based user organization and data isolation (Supabase RLS).
    *   Defined roles: Office Manager, Dentist, Front Desk, Admin.
    *   Provider association.
    *   Basic user profile management and invitation system.
    *   Session management (JWT).
*   **Logic Placement:** Supabase Auth, RLS policies, Next.js API routes for user management actions.

### 3.4. Data Synchronization & Processing (MVP Scope)
*   **Goal:** Automated background processing for Google Sheets data transformation and essential metric calculations.
*   **Details:**
    *   Scheduled data synchronization (Supabase cron jobs).
    *   Data transformation pipeline (Supabase Edge Functions).
    *   Historical data import for limited datasets (e.g., < 1000 rows initially, as per `.dev/mvp.md`).
    *   Data validation and error handling with logging.
    *   Metric calculation engine for core KPIs (Supabase Edge Functions).
*   **Logic Placement:** Primarily Supabase Edge Functions and cron jobs.

### 3.5. Goal Tracking & Reporting (Basic MVP)
*   **Goal:** Basic goal setting for key metrics and performance tracking against targets.
*   **Details:**
    *   Goal definition by clinic and provider for essential KPIs.
    *   Time-based goal tracking (monthly, quarterly).
    *   Simple variance reporting and visual progress indicators on fixed dashboards.
*   **Logic Placement:** Data storage via Prisma, calculations via Supabase Edge Functions, display on fixed dashboards.

## 4. Technologies & Architecture Approach

*   **Package Manager:** pnpm (as per `prd.txt`).
*   **Frontend:** Next.js, shadcn/ui, Tailwind CSS, Recharts.
*   **Backend Logic:** Primarily Next.js API Routes and Supabase Edge Functions. **Complex calculations, data transformations, and business logic will reside on the backend.** The frontend is responsible for presentation and user interaction, fetching data from API endpoints.
*   **Database:** Supabase PostgreSQL with Prisma ORM.
*   **Authentication:** Supabase Auth.
*   **State Management:** React Query (TanStack Query) for server state; Zustand for minimal global UI state if necessary.
*   **Testing:** Vitest.
*   **Deployment:** Vercel.
*   **Key Libraries:** Google API Client, date-fns, Zod, Axios (if needed for non-Next.js backend calls).

## 5. MVP Development Phases (High-Level)

This outlines the progression for building the MVP. Detailed tasks will be derived from `.dev/mvp.md` and `.dev/feature-spec.md`.

*   **Phase MVP-1: Foundation & Core Setup (Completed/Ongoing)**
    *   Project infrastructure (Task 1 - Done).
    *   Database schema implementation (Task 2 - Done, to be verified against `.dev/database-schema-*.md`).
    *   Authentication with Supabase Auth (Task 3 - Done).
    *   Initial Google Sheets API setup and OAuth (Task 4 - Done).

*   **Phase MVP-2: Core Google Sheets Integration & Data Pipeline**
    *   Refine Google Sheets connection, discovery, and basic data extraction as per `.dev/feature-spec.md`.
    *   Implement MVP-scoped column mapping (focus on pre-defined templates).
    *   Build initial data transformation and synchronization pipeline (Supabase Edge Functions).
    *   Store standardized data in metrics tables (`.dev/database-schema-metrics.md`).

*   **Phase MVP-3: Essential KPI Calculation & Fixed Dashboards**
    *   Develop backend logic (Edge Functions, API Routes) for calculating core MVP KPIs.
    *   Implement fixed, role-based dashboard layouts using ShadCN UI and Recharts.
    *   Integrate basic filtering (time, clinic, provider).

*   **Phase MVP-4: Basic Goal Tracking & User Management Refinement**
    *   Implement MVP-level goal definition and tracking.
    *   Refine user invitation and management systems.
    *   Ensure RLS policies are correctly implemented and tested for multi-tenancy.

*   **Phase MVP-5: Testing, Refinement & Deployment Prep**
    *   End-to-end testing of all MVP features.
    *   Performance testing for 50 concurrent users (as per `mvp.md`).
    *   Finalize documentation.
    *   Prepare for deployment.

## 6. What is NOT in the MVP

The following features, though potentially part of the larger vision, are explicitly **out of scope** for this MVP:

*   **Advanced Dashboard Customization:** User-configurable widgets, drag-and-drop layouts, saved views, widget palettes. Dashboards are fixed.
*   **Advanced Filtering/Analysis:** Complex trend analysis beyond simple historical views, deep drill-downs beyond initial navigation.
*   **Form-Based Data Entry:** All data comes from Google Sheets for MVP.
*   **Advanced Goal Features:** Complex goal hierarchies, detailed forecasting beyond simple projections, automated alerts (beyond basic indicators on dashboards).
*   **Export Capabilities (Beyond Basic if any):** Full PDF/CSV export for all views might be deferred or simplified.
*   **Extensive Historical Data Import:** MVP focuses on a manageable dataset.
*   **Complex UI for Column Mapping:** Focus on pre-defined templates or a very simplified interface if custom mapping is essential for MVP.

## 7. Success Criteria for MVP

*   Users can securely connect their Google Sheets.
*   Core KPIs (as defined for MVP) are accurately extracted, processed, and stored.
*   Users can view their relevant core KPIs on role-based, fixed-layout dashboards.
*   Basic filtering (time, clinic, provider) functions correctly.
*   System is stable and performs adequately for up to 50 concurrent users.
*   Multi-tenant data isolation is secure. 