# Project Brief: Dental Practice Analytics Dashboard
*Version: 1.0*
*Created: 2025-05-17*
*Last Updated: {{Current Date}}*

## Project Overview
The Dental Practice Analytics Dashboard (MVP) is a centralized web application designed to visualize and analyze key performance indicators (KPIs) from dental practices. It connects to existing Google Spreadsheets via API, transforms raw data into actionable insights, and presents them through intuitive, **fixed-layout** visualizations. The MVP system will serve as a **read-only dashboard**, addressing the critical need for cohesive data analysis and real-time performance visibility against established goals. This document provides a high-level overview; detailed specifications are in `.dev/` and `.ai/plans/` directories.

## Core MVP Requirements
The MVP will focus on the following core features, as detailed in `.dev/mvp.md`, `.dev/feature-spec.md`, and `.ai/plans/PLAN.MD`:

1.  **Google Sheets Integration Core:** Secure OAuth connection to Google Sheets API with basic data extraction and standardized metric mapping for essential dental practice KPIs.
2.  **Essential KPI Dashboard:** Fixed dashboard layouts displaying core dental practice metrics (financial, patient, appointment, provider, call tracking) with basic filtering and time period selection.
3.  **Multi-Tenant User Management:** Role-based access control (RBAC) supporting multiple dental practices with provider-specific data isolation.
4.  **Data Synchronization & Processing (MVP Scope):** Automated background processing for Google Sheets data transformation and essential metric calculations.
5.  **Goal Tracking & Reporting (Basic MVP):** Basic goal setting for key metrics and performance tracking against established targets.

## Success Criteria for MVP
-   Users can securely connect their Google Sheets.
-   Core KPIs (as defined for MVP) are accurately extracted, processed, and stored.
-   Users can view their relevant core KPIs on role-based, fixed-layout dashboards.
-   Basic filtering (time, clinic, provider) functions correctly.
-   System is stable and performs adequately for up to 50 concurrent users.
-   Multi-tenant data isolation is secure.

## Scope
### In Scope (MVP)
-   Secure Google Sheets API connection, data extraction, and pre-defined mapping templates.
-   Fixed, role-based dashboards for essential KPIs (financial, patient, appointments, provider, call tracking).
-   Basic filtering (time, clinic, provider).
-   Multi-tenant user management with RLS.
-   Automated data sync and MVP-scoped metric calculations (Supabase Edge Functions).
-   Basic goal setting and progress display on fixed dashboards.
-   Read-only dashboard functionality.

### Out of Scope (MVP)
The following are explicitly **out of scope** for this MVP, as per `.dev/prd-mvp.md`:
-   **Advanced Dashboard Customization:** User-configurable widgets, drag-and-drop layouts, saved views.
-   **Advanced Filtering/Analysis:** Complex trend analysis beyond simple historical views, deep drill-downs.
-   **Form-Based Data Entry:** All data comes from Google Sheets for MVP.
-   **Advanced Goal Features:** Complex goal hierarchies, detailed forecasting.
-   **Extensive Export Capabilities:** Full PDF/CSV export might be deferred or simplified.
-   **Large-Scale Historical Data Import:** MVP focuses on manageable datasets (e.g., < 1000 rows initially).
-   **Complex UI for Column Mapping:** Focus on pre-defined templates.
-   Direct integration with Practice Management Software (PMS) beyond Google Sheets.
-   Patient scheduling or direct patient communication tools.
-   Billing or insurance claim processing.
-   Advanced AI-driven predictive analytics.

## Timeline (MVP Development Phases)
Based on `.dev/prd-mvp.md`, high-level MVP phases:

*   **Phase MVP-1: Foundation & Core Setup** (Partially Completed: Project infra, DB schema, Auth, Initial Google Sheets API)
*   **Phase MVP-2: Core Google Sheets Integration & Data Pipeline** (Refine connection, implement mapping, build transformation pipeline)
*   **Phase MVP-3: Essential KPI Calculation & Fixed Dashboards** (Develop backend logic for KPIs, implement fixed dashboards and basic filtering)
*   **Phase MVP-4: Basic Goal Tracking & User Management Refinement** (Implement MVP goal tracking, refine user management, test RLS)
*   **Phase MVP-5: Testing, Refinement & Deployment Prep** (End-to-end testing, performance testing, documentation, deployment prep)

## Stakeholders (Target Audience for MVP)
-   **Office Managers:** Responsible for overall practice performance monitoring and financial oversight.
-   **Dentists/Providers:** Need visibility into their individual core performance metrics.
-   **Front Desk Staff:** Require access to essential appointment and call metrics.

---

*This document serves as the foundation for the project and informs all other memory files.* 