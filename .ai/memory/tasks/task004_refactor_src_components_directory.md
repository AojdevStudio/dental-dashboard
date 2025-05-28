---
id: 004
title: "Step 3.2: Refactor src/components/ Directory"
status: todo
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Reorganize the `src/components/` directory into new domain-specific subdirectories 
  as per Step 3.2 of `.dev/refactoring-plan.md`.
related_files:
  - .dev/refactoring-plan.md
  - .dev/file-system.md
  - src/components/
sub_tasks:
  - "[ ] Verify `src/components/ui/...` against new structure (likely remains)."
  - "[ ] Map `src/components/charts/...` to specific components like `src/components/dashboard/kpi-chart.tsx`."
  - "[ ] Break down `src/components/dashboards/...` into more specific components under `src/components/dashboard/` (e.g., `metric-card.tsx`, `financial-overview.tsx`)."
  - "[ ] Map `src/components/forms/...` to `src/components/ui/form.tsx` or specific forms (e.g., `src/components/auth/login-form.tsx`)."
  - "[ ] Map `src/components/layout/...` to `src/components/common/navigation.tsx`, `sidebar.tsx`, `header.tsx`."
  - "[ ] Map `src/components/auth/...` to new structure (e.g., `login-form.tsx`)."
  - "[ ] Deprecate/refactor `src/components/metrics/...` in favor of specific dashboard components."
  - "[ ] Create new component groups like `src/components/google-sheets/`, `src/components/goals/`, `src/components/users/` and populate/move relevant components."
  - "[ ] Run `biome check --apply-unsafe src/components/` after moves and manually verify import paths."
  - "[ ] Test application functionality related to refactored components."
dependencies:
  - task003_refactor_src_app_directory.md
---

## Notes

- Focus on creating a clear, domain-driven structure within `src/components/`.
- Refer to `.dev/file-system.md` for target component groupings. 