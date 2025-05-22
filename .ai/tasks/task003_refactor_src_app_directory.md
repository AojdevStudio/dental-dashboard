---
id: 003
title: "Step 3.1: Refactor src/app/ Directory"
status: in progress
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Reorganize the `src/app/` directory, including `(auth)`, `(dashboard)`, `api/`, 
  and top-level layouts/pages, as per Step 3.1 of `.dev/refactoring-plan.md`.
related_files:
  - .dev/refactoring-plan.md
  - .dev/file-system.md
  - src/app/
sub_tasks:
  - "[x] Verify/update `src/app/layout.tsx` based on new structure."
  - "[x] Verify/update `src/app/page.tsx` based on new structure."
  - "[x] Refactor `src/app/(auth)/...` contents according to `.dev/file-system.md` (e.g., login, register, reset-password, callback routes)."
  - "[x] Refactor `src/app/(dashboard)/...` contents according to `.dev/file-system.md` (e.g., dashboard page, layout, settings, integrations, goals, reports)."
  - "[x] Create new dashboard subdirectories as needed (integrations/, goals/, reports/)."
  - "[x] Map all existing API routes from `src/app/api/...` to the new granular structure in `.dev/file-system.md`."
  - "[~] Identify and relocate any page component logic to new API routes where appropriate."
  - "[x] Run `biome check --apply-unsafe src/app/` after moves and manually verify import paths."
  - "[ ] Test application functionality related to `src/app/` routes and layouts."
dependencies:
  - task002_prerequisites_verification.md
---

## Notes

- This is a major structural change. Proceed carefully, testing incrementally if possible.
- Pay close attention to the specific file mappings mentioned in `.dev/refactoring-plan.md` for `src/app/(auth)` and `src/app/(dashboard)`.
- The new API route structure under `src/app/api/` needs careful mapping from the old structure. 
- **Update {{Current Date}}:** Structural refactoring of `src/app/` largely complete. Old directories removed, new structure created with pages/layouts/API routes (many as placeholders). Biome check applied. Remaining work involves detailed logic migration for some API routes, deeper review for logic in page components, manual import path verification, and full testing. 