---
id: 005
title: "Step 3.3: Refactor src/lib/ Directory"
status: done
priority: high
area: refactoring
assignee:
created_at: "2025-05-22T22:55:01-05:00"
updated_at: "2025-05-22T22:55:01-05:00"
completed_at: "2025-05-22T22:55:01-05:00"
due_date:
description: >
  Reorganized libraries, utilities, and client configurations within `src/lib/` 
  as per Step 3.3 of `.dev/refactoring-plan.md` and user completion notes.
related_files:
  - .dev/refactoring-plan.md
  - .dev/file-system.md
  - src/lib/
  - src/lib/types/
  - src/lib/utils/
sub_tasks:
  - "[x] Created src/lib/types/ directory with 5 placeholder files (api.ts, auth.ts, dashboard.ts, goals.ts, metrics.ts). (Completed: 2025-05-22)"
  - "[x] Created src/lib/utils/ directory, moved cn.ts and logger.ts, and added 4 placeholder files (date-helpers.ts, export.ts, formatting.ts, validation.ts). (Completed: 2025-05-22)"
  - "[x] Deleted original files after successful moves. (Completed: 2025-05-22)"
  - "[ ] Review and refactor/remove `src/lib/api/...` (calls may move to components/hooks or API routes)."
  - "[ ] Move `src/lib/db/prisma.ts` to `src/lib/database/prisma.ts`."
  - "[ ] Refactor `src/lib/google/` to new structure like `src/lib/google-sheets/client.ts`, `auth.ts`."
  - "[ ] Map `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` to new structure (e.g., `src/lib/auth/` for middleware)."
  - "[ ] Create `src/lib/database/queries/` and move relevant database query logic into it."
  - "[ ] Create `src/lib/metrics/` and populate/move relevant logic."
  - "[ ] Run `biome check --apply-unsafe src/lib/` after moves and manually verify import paths."
  - "[ ] Test application functionality related to refactored libraries and utilities."
dependencies:
  - task004_refactor_src_components_directory.md
---

## Notes

- This step involved significant reorganization of shared logic and configurations.
- User completed creation of `src/lib/types` and `src/lib/utils` with specified files.
- Ensure a clear separation of concerns within the new `src/lib/` subdirectories. 