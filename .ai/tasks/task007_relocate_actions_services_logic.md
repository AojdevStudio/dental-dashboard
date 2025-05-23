---
id: task007
title: "Step 3.5: Relocate Logic from src/actions/ and src/services/"
status: "Done"
assignee: "AI"
priority: "High"
creation_date: "2024-07-21T10:00:00Z"
updated_at: "2025-05-22T23:34:55-05:00"
completed_at: "2025-05-22T23:34:55-05:00"
due_date: ""
description: "Relocate all logic from the legacy `src/actions/` and `src/services/` directories to their new locations (Next.js API Routes, Supabase Edge Functions, or utility modules in `src/lib/`) as per the refactoring plan. This is critical as these directories will be removed from the frontend structure."
tags: ["refactoring", "backend", "api", "architecture"]
parent_task: ""
sub_tasks:
  - "Identify all functionality in `src/actions/*.ts`."
  - "Identify all functionality in `src/services/**/*.ts`."
  - "For each piece of functionality, determine its new location based on `.dev/file-system.md` and `.dev/refactoring-plan.md` (API route, Edge Function, lib utility)."
  - "Refactor the code to fit its new environment (e.g., using `req`, `res` for API routes, Supabase function signatures)."
  - "Update all call sites in the frontend to use the new API endpoints or refactored utility functions."
  - "Remove the old `src/actions/` and `src/services/` directories once all logic is migrated and verified."
  - "Thoroughly test all affected functionalities end-to-end."
relevant_files:
  - ".dev/refactoring-plan.md"
  - ".dev/file-system.md"
  - "src/actions/"
  - "src/services/"
  - "src/app/api/"
  - "supabase/functions/"
acceptance_criteria:
  - "All logic from `src/actions/` and `src/services/` is successfully migrated to appropriate new locations."
  - "Old `src/actions/` and `src/services/` directories are removed."
  - "All functionalities previously handled by these directories are working correctly via their new implementations (API routes, Edge Functions, utils)."
  - "Application builds successfully and all tests pass."
--- 