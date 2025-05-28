# Active Context: Dental Practice Analytics Dashboard
*Version: 1.0*
*Created: 2025-05-17*
*Last Updated: {{Current Date}}*
*Current RIPER Mode: PLAN (Transitioning to EXECUTE)*

## Active Context (RIPER Workflow)

**Current Mode:** PLAN (Completed memory updates, preparing for EXECUTE)
**Current Focus:** Transitioning to implement the Core Google Sheets Integration & Data Pipeline (PRD Phase MVP-2).
**Key Objectives:** 
- Implement pre-defined column mapping templates for Google Sheets data.
- Develop the data transformation pipeline using Supabase Edge Functions.
- Ensure extracted and transformed data is correctly stored in the designated Supabase tables (`financial_metrics`, `patient_metrics`, etc., as per `.dev/database-schema-metrics.md`).

**Relevant Files & Rules:**
- `.dev/prd-mvp.md` (Overall MVP Plan)
- `.dev/mvp.md` (MVP Feature Details)
- `.dev/feature-spec.md` (Especially Google Sheets column mapping and data transformation)
- `.dev/database-schema-design.md` (Spreadsheet connection and mapping tables)
- `.dev/database-schema-metrics.md` (Target tables for transformed data)
- `.ai/plans/PLAN.MD` (Condensed MVP vision)
- `memory-bank/systemPatterns.md` (For data flow and Edge Function architecture)
- Potentially `.cursor/rules/.stack/supabase-edge-functions.mdc` (if available and relevant for Edge Function development guidelines)

**Pending Decisions / Blockers:**
- Confirm specific pre-defined column mapping templates if not yet finalized in `.dev/feature-spec.md`.
- Detailed error handling strategy for the data transformation pipeline in Edge Functions.

**Next Steps (Transitioning to EXECUTE mode):**
1.  **Column Mapping Implementation:** Develop UI components or backend logic to apply pre-defined mapping templates to selected Google Sheets (as per `.dev/feature-spec.md`). Store these mappings (e.g., in `column_mappings` table from `.dev/database-schema-design.md`).
2.  **Data Transformation Edge Functions:** Create Supabase Edge Functions to:
    a.  Fetch raw data from Google Sheets based on stored connections and mappings.
    b.  Apply transformation rules (data type coercion, standardization) to align with target metric table schemas.
    c.  Implement validation (Zod) for transformed data.
3.  **Data Storage Logic:** Ensure transformed data is correctly and efficiently upserted into the respective metrics tables in Supabase (e.g., `financial_metrics`, `patient_metrics`).
4.  **Synchronization Trigger:** Set up initial manual triggers for the sync process (Supabase cron jobs will be part of a later task in this phase).

## Recent Changes
- {{Current Date}}: EXECUTE: Completed major structural refactoring of `src/app/` directory as per Task 003 (`task003_refactor_src_app_directory.md`). Moved (auth) and (dashboard) pages/layouts, reorganized API routes to new granular structure with placeholders. Ran Biome to fix imports. Remaining work: detailed logic migration for some APIs, manual import/logic verification, and testing.
- {{Current Date}}: PLAN: Extensively updated all memory bank files (`projectbrief.md`, `techContext.md`, `systemPatterns.md`, `progress.md`, `activeContext.md`) to reflect the new MVP project direction based on documents in `.dev/` and `.ai/plans/`.
- 2025-05-18: EXECUTE: Completed Task 7 (Base Dashboard Layout & Navigation) and Task 4 (Google Sheets API services and routes).

## Mode: EXECUTE

**Objective:** Implement the refactoring of the `src/app` directory (Task 003).

**Current Task:** Completed structural changes for Task 003. Next steps involve developer review, logic migration for specific API routes, and testing.

**Current Focus:** Concluding Task 003 operations.

**Blockers:** None for current AI operations. Developer action required for next steps.

**Next Steps (for Developer):**
- Review all changes made to `src/app/`.
- Manually verify import paths adjusted by Biome.
- Migrate logic from old API routes (if any remnants or if placeholders need actual implementation) into the new granular API structure (e.g., `src/app/api/google-sheets/...`, `src/app/api/clinics/...`, `src/app/api/users/...`).
- Review `src/app/auth/callback/page.tsx` and other pages for any server-side logic that should be in API routes (though initial check suggests client-side Supabase usage is appropriate here).
- Thoroughly test all application functionality related to `src/app/` routes, layouts, and API interactions.
- Address any remaining TODOs in placeholder files.

---

*This document captures the current state of work and immediate next steps.* 