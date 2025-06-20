---
id: 006
title: "Step 3.4: Refactor src/hooks/, src/types/, src/styles/"
status: done
priority: medium
area: refactoring
assignee:
created_at: "2025-05-22T22:47:18-05:00"
updated_at: "2025-05-22T23:34:55-05:00"
completed_at: "2025-05-22T23:34:55-05:00"
due_date:
description: >
  Ensure `src/hooks/`, `src/types/`, and `src/styles/` directories align with the 
  new structure defined in `.dev/file-system.md`, and their contents are appropriately placed.
related_files:
  - .dev/refactoring-plan.md
  - .dev/file-system.md
  - src/hooks/
  - src/types/
  - src/styles/
sub_tasks:
  - "[x] Review current files in `src/hooks/` and map/move them to the new structure if necessary. (Completed: 2025-05-22)"
  - "[ ] Review current files in `src/types/` and map/move them to new structure (e.g., `src/lib/database/schemas/` or more granular type files like `src/lib/types/metrics.ts`)."
  - "[ ] Review current files in `src/styles/` and ensure alignment with new structure and global styling approach."
  - "[ ] Run `biome check --apply-unsafe src/` (or more targeted checks) after moves and manually verify import paths."
  - "[ ] Test application for any issues related to these changes."
dependencies:
  - task005_refactor_src_lib_directory.md
---

## Notes

- This step is about ensuring consistency for these specific directories.
- Changes to `src/types/` might be more significant if types are co-located with their respective domains (e.g., in `src/lib/database/schemas/`). 