---
id: task006
title: "Step 3.4: Refactor src/hooks/, src/types/, src/styles/"
status: "To Do"
assignee: "AI"
priority: "High"
creation_date: "{{current_date}}"
due_date: ""
description: "Refactor the `src/hooks/`, `src/types/`, and `src/styles/` directories to align with the new target file structure defined in `.dev/file-system.md` and the MVP scope. Ensure contents are appropriately placed and import paths are updated."
tags: ["refactoring", "frontend", "structure"]
parent_task: ""
sub_tasks:
  - "Review current files in `src/hooks/` and map to new structure/locations."
  - "Review current files in `src/types/` and map to new structure/locations (e.g., `src/lib/database/schemas/`, `src/lib/types/metrics.ts`)."
  - "Review current files in `src/styles/` and map to new structure/locations."
  - "Move/rename files as identified."
  - "Update all import statements in the codebase affected by these changes."
  - "Run `biome check --apply-unsafe src/` or more targeted biome commands after moves."
  - "Verify changes and test affected parts of the application."
relevant_files:
  - ".dev/refactoring-plan.md"
  - ".dev/file-system.md"
  - "src/hooks/"
  - "src/types/"
  - "src/styles/"
acceptance_criteria:
  - "All files from `src/hooks/`, `src/types/`, and `src/styles/` are reorganized according to `.dev/file-system.md`."
  - "All related import paths are updated throughout the codebase."
  - "The application builds successfully after changes."
  - "No linting errors related to these directories remain."
--- 