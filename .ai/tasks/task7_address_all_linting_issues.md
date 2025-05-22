---
id: 7
title: "Address all linting issues"
status: completed
priority: high
feature: Code Quality
created_at: 2025-05-21T20:19:05Z
---

## Description

This is a parent task that tracks all linting issues in the codebase. Each sub-task addresses a specific linting issue.

## Sub-Tasks

- [x] ID 7.1: Complete ID 1 - Fix linting issues in providers.tsx
- [x] ID 7.2: Complete ID 2 - Fix useExhaustiveDependencies warning in hover-card.tsx
- [x] ID 7.3: Complete ID 3 - Fix accessibility issues in MultiSelectCombobox.tsx
- [x] ID 7.4: Complete ID 4 - Make breadcrumb link focusable in breadcrumb.tsx
- [x] ID 7.5: Complete ID 5 - Convert string concatenation to template literals in counting-number.tsx
- [x] ID 7.6: Complete ID 6 - Fix TypeScript and performance issues in calendar.tsx

## Implementation Plan

1. Complete each sub-task in order
2. After each sub-task, run `pnpm lint` to verify the issue is resolved
3. Commit changes with a descriptive message
4. Update the status of the completed sub-task
5. Once all sub-tasks are complete, mark this task as complete

## Related Files

- `src/app/providers.tsx`
- `src/components/animate-ui/radix/hover-card.tsx`
- `src/components/dashboards/filters/MultiSelectCombobox.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/animate-ui/text/counting-number.tsx`
- `src/components/ui/calendar.tsx`

## Dependencies

None

## Notes

- Each sub-task contains detailed implementation instructions
- Run tests after each change to ensure no regressions
- Follow the project's coding standards and conventions
