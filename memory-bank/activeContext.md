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
- {{Current Date}}: PLAN: Extensively updated all memory bank files (`projectbrief.md`, `techContext.md`, `systemPatterns.md`, `progress.md`, `activeContext.md`) to reflect the new MVP project direction based on documents in `.dev/` and `.ai/plans/`.
- 2025-05-18: EXECUTE: Completed Task 7 (Base Dashboard Layout & Navigation) and Task 4 (Google Sheets API services and routes).

## Mode: PLAN (Transitioning to EXECUTE)

**Objective:** Ensure memory bank is fully aligned with the new MVP direction and prepare for the next phase of development: Core Google Sheets Integration & Data Pipeline.

**Current Task:** Finalize memory updates and define immediate next steps for PRD Phase MVP-2.

**Current Focus:** Confirming the plan for implementing Google Sheets column mapping and the data transformation pipeline using Supabase Edge Functions.

**Blockers:** None for planning. For execution, clarity on specific mapping templates is needed.

**Next Steps (for EXECUTE mode):**
- Focus on PRD Phase MVP-2: "Core Google Sheets Integration & Data Pipeline".
- Task: Implement pre-defined column mapping logic for Google Sheets.
- Task: Develop Supabase Edge Functions for data extraction, transformation (based on mappings), and validation.
- Task: Implement logic to store transformed data into Supabase metric tables.
- Task: Implement initial manual data synchronization triggers.

## Current Task
- Preparing to EXECUTE tasks for **PRD Phase MVP-2: Core Google Sheets Integration & Data Pipeline**.
  - Sub-focus 1: Implement pre-defined column mapping selection and storage.
  - Sub-focus 2: Develop data transformation pipeline (Supabase Edge Functions).
  - Sub-focus 3: Implement data storage into metrics tables.

## Current Focus
- Reviewing `.dev/feature-spec.md` for column mapping template details.
- Planning the structure of Supabase Edge Functions for the transformation pipeline.

## Blockers
- Detailed specifications for pre-defined column mapping templates, if not yet fully defined in `.dev/feature-spec.md`.

## Next Steps
- Begin implementation of column mapping logic.
- Start development of Supabase Edge Functions for data extraction and transformation.

---

*This document captures the current state of work and immediate next steps.* 