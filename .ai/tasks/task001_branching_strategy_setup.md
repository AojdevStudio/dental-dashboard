---
id: 001
title: Setup Refactoring Branching Strategy
status: completed
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Implement the branching strategy as defined in section 1 of `.dev/refactoring-plan.md`,
  with adaptations as needed for Git's technical limitations.
  This involves creating the main `refactor` branch and establishing
  the process for sub-branches.
related_files:
  - .dev/refactoring-plan.md
  - .dev/branching-strategy.md
sub_tasks:
  - "[x] Create the main feature branch from the current main development branch (renamed from `feature/mvp-structure-refactor` to `refactor`)."
  - "[x] Document the decision on using sub-branches for incremental steps (using `-` instead of `/` due to Git limitations)."
  - "[x] Confirm the Pull Request strategy for merging into the main feature branch and eventually into the main development branch."
  - "[x] Create initial sub-branches for different components of the refactoring."
dependencies: []
---

## Notes

- Ensure the main development branch (e.g., `main` or `develop`) is up-to-date before creating the feature branch.
- Sub-branches are named using hyphens instead of slashes (e.g., `refactor-app-directory`) due to Git's limitation with hierarchical branch naming.
- The full PR strategy has been documented in `.dev/branching-strategy.md`.
- Created the following branches for different refactoring components:
  - `refactor-app-directory`
  - `refactor-components-directory`
  - `refactor-lib-directory`
  - `refactor-aux-directories`
  - `refactor-actions-services` 