# PRD: Dental Practice Analytics Dashboard - MVP Vision & Core Goals

**Version:** 1.1-MVP-Vision
**Date:** {{Current Date}}

**MVP Focus Note:**
This document outlines the vision and core goals for the Minimum Viable Product (MVP) of the Dental Practice Analytics Dashboard. It serves as a high-level guide, with detailed specifications, features, and plans located in dedicated documents within the `.dev/` directory. This approach ensures the MVP delivers core value efficiently, deferring advanced features to post-MVP phases.

## 1. Overall Vision

The Dental Practice Analytics Dashboard (MVP) aims to be a centralized web application that visualizes and analyzes key performance indicators (KPIs) from dental practices. By connecting to existing Google Spreadsheets, it will transform raw data into actionable insights, presented through intuitive, fixed-layout visualizations. The MVP will function as a read-only dashboard, addressing the critical need for cohesive data analysis and real-time performance visibility.

**Key Reference Documents:**
*   **Target File Structure:** `.dev/file-system.md`
*   **Database Schema:** `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`
*   **Detailed Feature Specs:** `.dev/feature-spec.md`
*   **MVP Scope Details:** `.dev/mvp.md`

## 2. Target Audience (MVP Summary)

The MVP will serve:
*   **Office Managers:** For overall practice performance monitoring.
*   **Dentists/Providers:** For visibility into individual core performance.
*   **Front Desk Staff:** For essential appointment and call metrics.
Each role will have tailored, fixed-layout dashboard views.

## 3. MVP Core Goals & Feature Areas

The MVP is centered around delivering the following core functionalities (details in `.dev/mvp.md` and `.dev/feature-spec.md`):

1.  **Google Sheets Integration Core:** Secure OAuth connection, basic data extraction, and standardized metric mapping.
2.  **Essential KPI Dashboard:** Fixed dashboard layouts for core metrics with basic filtering (financial, patient, appointment, provider, call tracking).
3.  **Multi-Tenant User Management:** Role-based access control (RBAC) with clinic-based data isolation.
4.  **Data Synchronization & Processing:** Automated background processing for Google Sheets data and essential metric calculations.
5.  **Goal Tracking & Reporting (Basic):** Simple goal setting for key metrics and performance tracking against targets.

## 4. Technologies & Architecture Approach (Summary)

*   **Frontend:** Next.js, shadcn/ui, Tailwind CSS, Recharts.
*   **Backend Logic:** Next.js API Routes & Supabase Edge Functions (handling complex calculations and business logic).
*   **Database:** Supabase PostgreSQL with Prisma ORM.
*   **Authentication:** Supabase Auth.
*   **State Management:** React Query (TanStack Query); Zustand (minimal global UI).
*   **Key Libraries:** Google API Client, date-fns, Zod.
*   **Package Manager:** pnpm.
*   **Testing:** Vitest.
*   **Deployment:** Vercel.

## 5. What is NOT in the MVP (Scope Boundaries)

To maintain focus, the following are **out of scope** for this MVP:
*   Advanced Dashboard Customization (dashboards are fixed).
*   Advanced Filtering/Analysis beyond basic views.
*   Form-Based Data Entry (all data via Google Sheets).
*   Advanced Goal Features (complex hierarchies, forecasting).
*   Extensive Export Capabilities.
*   Large-Scale Historical Data Import (MVP focuses on manageable datasets).
*   Complex UI for Column Mapping (focus on pre-defined templates).

## 6. Success Criteria for MVP

*   Secure connection to Google Sheets is functional.
*   Core MVP KPIs are accurately extracted, processed, and displayed.
*   Users can view relevant KPIs on role-based, fixed-layout dashboards.
*   Basic filtering (time, clinic, provider) is operational.
*   System is stable for up to 50 concurrent users.
*   Multi-tenant data isolation is secure. 