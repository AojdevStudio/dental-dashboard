---
id: 006.1
title: "Refactor src/hooks/ directory"
parent_task: 006
status: done
priority: medium
area: refactoring
created_at: "2025-05-22T22:47:18-05:00"
updated_at: "2025-05-22T22:47:18-05:00"
completed_at: "2025-05-22T22:47:18-05:00"
description: >
  Reviewed current files in `src/hooks/` and mapped/moved them to the new structure.
  This involved renaming files (e.g., useAuth.ts to use-auth.ts), updating internal import paths,
  deleting unused files (useSupabase.ts), and creating new placeholder hooks.
related_files:
  - src/hooks/
  - src/hooks/use-auth.ts
  - src/hooks/use-filters.ts
test_strategy: "Verified by applying the diff and ensuring no build errors. Further testing as part of parent task."
---

## Notes

This sub-task covers the specific refactoring actions performed on the `src/hooks/` directory as per the provided diff.
