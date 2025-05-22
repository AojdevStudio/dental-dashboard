---
id: 005
title: "Step 3.3: Refactor src/lib/ Directory"
status: todo
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Reorganize libraries, utilities, and client configurations within `src/lib/` 
  as per Step 3.3 of `.dev/refactoring-plan.md`.
related_files:
  - .dev/refactoring-plan.md
  - .dev/file-system.md
  - src/lib/
sub_tasks:
  - "[ ] Review and refactor/remove `src/lib/api/...` (calls may move to components/hooks or API routes)."
  - "[ ] Move `src/lib/db/prisma.ts` to `src/lib/database/prisma.ts`."
  - "[ ] Refactor `src/lib/google/` to new structure like `src/lib/google-sheets/client.ts`, `auth.ts`."
  - "[ ] Map `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` to new structure (e.g., `src/lib/auth/` for middleware)."
  - "[ ] Create `src/lib/database/queries/` and move relevant database query logic into it."
  - "[ ] Create `src/lib/database/schemas/` (or use `src/lib/types/`) for type definitions."
  - "[ ] Create `src/lib/metrics/` and populate/move relevant logic."
  - "[ ] Create `src/lib/utils/` and populate/move relevant utility functions."
  - "[ ] Run `biome check --apply-unsafe src/lib/` after moves and manually verify import paths."
  - "[ ] Test application functionality related to refactored libraries and utilities."
dependencies:
  - task004_refactor_src_components_directory.md
---

## Notes

- This step involves significant reorganization of shared logic and configurations.
- Ensure a clear separation of concerns within the new `src/lib/` subdirectories. 