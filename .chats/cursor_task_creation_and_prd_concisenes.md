# Task Creation and PRD Conciseness
_Exported on 5/21/2025 at 22:04:13 CDT from Cursor (0.50.5)_

---

**User**

/plan we are going to create tasks using this method @.task-magic/_index.mdc @tasks.mdc @plans.mdc so i've moved the contents of the new PRD into @PLAN.MD but it might need to be condensed to define the project's vision and core goals but **must not become a lengthy PRD itself**. As It provides essential context by linking to comprehensive feature plans.

---

**Cursor**

Accessing Task Magic system overview...

Okay, I understand you want to update `.ai/plans/PLAN.MD` to be a more concise vision and goals document, linking to detailed specifications, and then proceed to create tasks using the Task Magic system, particularly based on the `.dev/refactoring-plan.md`.

First, I'll propose a condensed version of your current `.ai/plans/PLAN.MD`. This version will focus on the high-level vision, core goals, and scope, while directing to other documents for detailed specifications.

Here's the proposed condensed content for `.ai/plans/PLAN.MD`:

```markdown
# PRD: Dental Practice Analytics Dashboard - MVP Vision & Core Goals

**Version:** 1.1-MVP-Vision
**Date:** {{Current Date}}

**MVP Focus Note:**
This document outlines the vision and core goals for the Minimum Viable Product (MVP) of the Dental Practice Analytics Dashboard. It serves as a high-level guide, with detailed specifications, features, and plans located in dedicated documents within the `.dev/` directory. This approach ensures the MVP delivers core value efficiently, deferring advanced features to post-MVP phases.

## 1. Overall Vision

The Dental Practice Analytics Dashboard (MVP) aims to be a centralized web application that visualizes and analyzes key performance indicators (KPIs) from dental practices. By connecting to existing Google Spreadsheets, it will transform raw data into actionable insights, presented through intuitive, fixed-layout visualizations. The MVP will function as a read-only dashboard, addressing the critical need for cohesive data analysis and real-time performance visibility.

**Key Reference Documents:**
*   **Target File Structure:** `.dev/file-system.md`
*   **Database Schema:** `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`
*   **Detailed Feature Specs:** `.dev/feature-spec.md`
*   **MVP Scope Details:** `.dev/mvp.md`

## 2. Target Audience (MVP Summary)

The MVP will serve:
*   **Office Managers:** For overall practice performance monitoring.
*   **Dentists/Providers:** For visibility into individual core performance.
*   **Front Desk Staff:** For essential appointment and call metrics.
Each role will have tailored, fixed-layout dashboard views.

## 3. MVP Core Goals & Feature Areas

The MVP is centered around delivering the following core functionalities (details in `.dev/mvp.md` and `.dev/feature-spec.md`):

1.  **Google Sheets Integration Core:** Secure OAuth connection, basic data extraction, and standardized metric mapping.
2.  **Essential KPI Dashboard:** Fixed dashboard layouts for core metrics with basic filtering (financial, patient, appointment, provider, call tracking).
3.  **Multi-Tenant User Management:** Role-based access control (RBAC) with clinic-based data isolation.
4.  **Data Synchronization & Processing:** Automated background processing for Google Sheets data and essential metric calculations.
5.  **Goal Tracking & Reporting (Basic):** Simple goal setting for key metrics and performance tracking against targets.

## 4. Technologies & Architecture Approach (Summary)

*   **Frontend:** Next.js, shadcn/ui, Tailwind CSS, Recharts.
*   **Backend Logic:** Next.js API Routes & Supabase Edge Functions (handling complex calculations and business logic).
*   **Database:** Supabase PostgreSQL with Prisma ORM.
*   **Authentication:** Supabase Auth.
*   **State Management:** React Query (TanStack Query); Zustand (minimal global UI).
*   **Key Libraries:** Google API Client, date-fns, Zod.
*   **Package Manager:** pnpm.
*   **Testing:** Vitest.
*   **Deployment:** Vercel.

## 5. What is NOT in the MVP (Scope Boundaries)

To maintain focus, the following are **out of scope** for this MVP:
*   Advanced Dashboard Customization (dashboards are fixed).
*   Advanced Filtering/Analysis beyond basic views.
*   Form-Based Data Entry (all data via Google Sheets).
*   Advanced Goal Features (complex hierarchies, forecasting).
*   Extensive Export Capabilities.
*   Large-Scale Historical Data Import (MVP focuses on manageable datasets).
*   Complex UI for Column Mapping (focus on pre-defined templates).

## 6. Success Criteria for MVP

*   Secure connection to Google Sheets is functional.
*   Core MVP KPIs are accurately extracted, processed, and displayed.
*   Users can view relevant KPIs on role-based, fixed-layout dashboards.
*   Basic filtering (time, clinic, provider) is operational.
*   System is stable for up to 50 concurrent users.
*   Multi-tenant data isolation is secure.
```

I will now apply this condensed version to your `.ai/plans/PLAN.MD` file.


```markdown
# PRD: Dental Practice Analytics Dashboard - MVP Vision & Core Goals

**Version:** 1.1-MVP-Vision
**Date:** {{Current Date}}

**MVP Focus Note:**
This document outlines the vision and core goals for the Minimum Viable Product (MVP) of the Dental Practice Analytics Dashboard. It serves as a high-level guide, with detailed specifications, features, and plans located in dedicated documents within the `.dev/` directory. This approach ensures the MVP delivers core value efficiently, deferring advanced features to post-MVP phases.

## 1. Overall Vision

The Dental Practice Analytics Dashboard (MVP) aims to be a centralized web application that visualizes and analyzes key performance indicators (KPIs) from dental practices. By connecting to existing Google Spreadsheets, it will transform raw data into actionable insights, presented through intuitive, fixed-layout visualizations. The MVP will function as a read-only dashboard, addressing the critical need for cohesive data analysis and real-time performance visibility.

**Key Reference Documents:**
*   **Target File Structure:** `.dev/file-system.md`
*   **Database Schema:** `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`
*   **Detailed Feature Specs:** `.dev/feature-spec.md`
*   **MVP Scope Details:** `.dev/mvp.md`

## 2. Target Audience (MVP Summary)

The MVP will serve:
*   **Office Managers:** For overall practice performance monitoring.
*   **Dentists/Providers:** For visibility into individual core performance.
*   **Front Desk Staff:** For essential appointment and call metrics.
Each role will have tailored, fixed-layout dashboard views.

## 3. MVP Core Goals & Feature Areas

The MVP is centered around delivering the following core functionalities (details in `.dev/mvp.md` and `.dev/feature-spec.md`):

1.  **Google Sheets Integration Core:** Secure OAuth connection, basic data extraction, and standardized metric mapping.
2.  **Essential KPI Dashboard:** Fixed dashboard layouts for core metrics with basic filtering (financial, patient, appointment, provider, call tracking).
3.  **Multi-Tenant User Management:** Role-based access control (RBAC) with clinic-based data isolation.
4.  **Data Synchronization & Processing:** Automated background processing for Google Sheets data and essential metric calculations.
5.  **Goal Tracking & Reporting (Basic):** Simple goal setting for key metrics and performance tracking against targets.

## 4. Technologies & Architecture Approach (Summary)

*   **Frontend:** Next.js, shadcn/ui, Tailwind CSS, Recharts.
*   **Backend Logic:** Next.js API Routes & Supabase Edge Functions (handling complex calculations and business logic).
*   **Database:** Supabase PostgreSQL with Prisma ORM.
*   **Authentication:** Supabase Auth.
*   **State Management:** React Query (TanStack Query); Zustand (minimal global UI).
*   **Key Libraries:** Google API Client, date-fns, Zod.
*   **Package Manager:** pnpm.
*   **Testing:** Vitest.
*   **Deployment:** Vercel.

## 5. What is NOT in the MVP (Scope Boundaries)

To maintain focus, the following are **out of scope** for this MVP:
*   Advanced Dashboard Customization (dashboards are fixed).
*   Advanced Filtering/Analysis beyond basic views.
*   Form-Based Data Entry (all data via Google Sheets).
*   Advanced Goal Features (complex hierarchies, forecasting).
*   Extensive Export Capabilities.
*   Large-Scale Historical Data Import (MVP focuses on manageable datasets).
*   Complex UI for Column Mapping (focus on pre-defined templates).

## 6. Success Criteria for MVP

*   Secure connection to Google Sheets is functional.
*   Core MVP KPIs are accurately extracted, processed, and displayed.
*   Users can view relevant KPIs on role-based, fixed-layout dashboards.
*   Basic filtering (time, clinic, provider) is operational.
*   System is stable for up to 50 concurrent users.
*   Multi-tenant data isolation is secure.
```

```markdown
# PRD: Dental Practice Analytics Dashboard - MVP Vision & Core Goals

**Version:** 1.1-MVP-Vision
**Date:** {{Current Date}}

**MVP Focus Note:**
This document outlines the vision and core goals for the Minimum Viable Product (MVP) of the Dental Practice Analytics Dashboard. It serves as a high-level guide, with detailed specifications, features, and plans located in dedicated documents within the `.dev/` directory. This approach ensures the MVP delivers core value efficiently, deferring advanced features to post-MVP phases.

## 1. Overall Vision

The Dental Practice Analytics Dashboard (MVP) aims to be a centralized web application that visualizes and analyzes key performance indicators (KPIs) from dental practices. By connecting to existing Google Spreadsheets, it will transform raw data into actionable insights, presented through intuitive, fixed-layout visualizations. The MVP will function as a read-only dashboard, addressing the critical need for cohesive data analysis and real-time performance visibility.

**Key Reference Documents:**
*   **Target File Structure:** `.dev/file-system.md`
*   **Database Schema:** `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`
*   **Detailed Feature Specs:** `.dev/feature-spec.md`
*   **MVP Scope Details:** `.dev/mvp.md`

## 2. Target Audience (MVP Summary)

The MVP will serve:
*   **Office Managers:** For overall practice performance monitoring.
*   **Dentists/Providers:** For visibility into individual core performance.
*   **Front Desk Staff:** For essential appointment and call metrics.
Each role will have tailored, fixed-layout dashboard views.

## 3. MVP Core Goals & Feature Areas

The MVP is centered around delivering the following core functionalities (details in `.dev/mvp.md` and `.dev/feature-spec.md`):

1.  **Google Sheets Integration Core:** Secure OAuth connection, basic data extraction, and standardized metric mapping.
2.  **Essential KPI Dashboard:** Fixed dashboard layouts for core metrics with basic filtering (financial, patient, appointment, provider, call tracking).
3.  **Multi-Tenant User Management:** Role-based access control (RBAC) with clinic-based data isolation.
4.  **Data Synchronization & Processing:** Automated background processing for Google Sheets data and essential metric calculations.
5.  **Goal Tracking & Reporting (Basic):** Simple goal setting for key metrics and performance tracking against targets.

## 4. Technologies & Architecture Approach (Summary)

*   **Frontend:** Next.js, shadcn/ui, Tailwind CSS, Recharts.
*   **Backend Logic:** Next.js API Routes & Supabase Edge Functions (handling complex calculations and business logic).
*   **Database:** Supabase PostgreSQL with Prisma ORM.
*   **Authentication:** Supabase Auth.
*   **State Management:** React Query (TanStack Query); Zustand (minimal global UI).
*   **Key Libraries:** Google API Client, date-fns, Zod.
*   **Package Manager:** pnpm.
*   **Testing:** Vitest.
*   **Deployment:** Vercel.

## 5. What is NOT in the MVP (Scope Boundaries)

To maintain focus, the following are **out of scope** for this MVP:
*   Advanced Dashboard Customization (dashboards are fixed).
*   Advanced Filtering/Analysis beyond basic views.
*   Form-Based Data Entry (all data via Google Sheets).
*   Advanced Goal Features (complex hierarchies, forecasting).
*   Extensive Export Capabilities.
*   Large-Scale Historical Data Import (MVP focuses on manageable datasets).
*   Complex UI for Column Mapping (focus on pre-defined templates).

## 6. Success Criteria for MVP

*   Secure connection to Google Sheets is functional.
*   Core MVP KPIs are accurately extracted, processed, and displayed.
*   Users can view relevant KPIs on role-based, fixed-layout dashboards.
*   Basic filtering (time, clinic, provider) is operational.
*   System is stable for up to 50 concurrent users.
*   Multi-tenant data isolation is secure.

```

The `.ai/plans/PLAN.MD` file has been updated to the condensed version.

Now, let's proceed with creating tasks based on the `.dev/refactoring-plan.md`.

I will create two initial task files in the `.ai/tasks/` directory and update the master `.ai/TASKS.md` file.

**Task 1: Branching Strategy Setup**
This task will cover setting up the main refactoring branch as outlined in section 1 of the refactoring plan.

**Task 2: Pre-requisites Verification**
This task will involve verifying that all pre-requisites listed in section 2 of the refactoring plan are met.

I'll create the individual task files first.

Creating `task001_branching_strategy_setup.md`:


```markdown
---
id: 001
title: Setup Refactoring Branching Strategy
status: todo
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Implement the branching strategy as defined in section 1 of `.dev/refactoring-plan.md`.
  This involves creating the main `feature/mvp-structure-refactor` branch and establishing
  the process for sub-branches if deemed necessary.
related_files:
  - .dev/refactoring-plan.md
sub_tasks:
  - "[ ] Create the main feature branch `feature/mvp-structure-refactor` from the current main development branch."
  - "[ ] Document the decision on using sub-branches for incremental steps (optional but recommended in plan)."
  - "[ ] Confirm the Pull Request strategy for merging into `feature/mvp-structure-refactor` and eventually into the main development branch."
dependencies: []
---

## Notes

- Ensure the main development branch (e.g., `main` or `develop`) is up-to-date before creating the feature branch.
- If sub-branches are used, clearly define their naming convention (e.g., `feature/mvp-structure-refactor/app-layout`).

```

Creating `task002_prerequisites_verification.md`:


```markdown
---
id: 002
title: Verify Refactoring Pre-requisites
status: todo
priority: high
area: refactoring
assignee:
created_date: {{Current Date}}
due_date:
description: >
  Verify that all pre-requisites outlined in section 2 of `.dev/refactoring-plan.md` are met
  before starting the incremental refactoring steps.
related_files:
  - .dev/refactoring-plan.md
  - .dev/prd-mvp.md
  - .dev/file-system.md
  - .dev/feature-spec.md
  - .dev/database-schema-design.md
  - .dev/database-schema-metrics.md
sub_tasks:
  - "[ ] Confirm the new MVP PRD (`.dev/prd-mvp.md`) is finalized and agreed upon."
  - "[ ] Confirm the target file structure (`.dev/file-system.md`) is confirmed."
  - "[ ] Confirm the location of backend logic (API Routes, Supabase Edge Functions) is clearly understood, referencing the specified `.dev` documents."
dependencies:
  - task001_branching_strategy_setup.md
---

## Notes

- This task is critical to ensure the refactoring process starts with a clear and stable foundation.
- Any discrepancies or pending decisions related to these prerequisites should be addressed before proceeding to Step 3 of the refactoring plan.

```

Now, I'll create and update the master `.ai/TASKS.md` file.


---

**User**

i have to merge some branches first before we move any forward.. the google branch and the documentation branches need to be merged! 

---

**Cursor**

Okay, I understand. Merging branches is an important step.

I will pause the task creation process for the refactoring plan. Please let me know when you have completed merging the `google` and `documentation` branches and are ready to continue with generating the refactoring tasks.

Once you're ready, we can pick up where we left off: creating the master `.ai/TASKS.md` file and then proceeding to break down the subsequent steps from `.dev/refactoring-plan.md` into individual task files.

---

**User**

i need your help with that please

---

**Cursor**

Okay, I can help you with that. To make sure I run the correct commands, please provide me with the following information:

1.  **Exact name of the 'google' branch:**
2.  **Exact names of the 'documentation' branches:** (If there are multiple)
3.  **Target branch:** Which branch do you want to merge these into? (e.g., `main`, `develop`, or another specific branch)
4.  **Current branch:** What is your current Git branch? (If you know it)

Once I have this information, I can suggest the appropriate `git` commands.

---

**User**

1. feature/google
2. documentation
3. target branch is going to be the main 
4. current branch we are on the is feature/google branch

---

**Cursor**

Okay, thank you for the information. We're currently on the `feature/google` branch, and we want to merge both `feature/google` and `documentation` into `main`.

Here's the sequence of commands I recommend. I'll propose them one by one.

First, let's make sure your local `main` branch is up-to-date with the remote repository and then switch to it.


It looks like you have uncommitted changes in `prd.txt` and an untracked file `repomix-output.xml` that are preventing the branch checkout.

You have a few options:

1.  **Commit the changes:** If the changes in `prd.txt` are complete and you want to save them.
    *   Command: `git add prd.txt && git commit -m "Your commit message"`
    *   Then decide what to do with `repomix-output.xml` (commit it, or remove/move it).
2.  **Stash the changes:** If the changes are not ready to be committed but you want to save them temporarily.
    *   Command: `git stash push -u prd.txt repomix-output.xml` (the `-u` includes untracked files like `repomix-output.xml` if you want to stash it too, otherwise just `git stash push prd.txt`)
3.  **Discard the changes (if you don't need them):**
    *   For `prd.txt`: `git checkout -- prd.txt`
    *   For `repomix-output.xml`: `rm repomix-output.xml` (or move it out of the repo)

Please let me know how you'd like to proceed with these files, or if you'd like me to run one of these commands for you.

---

**User**

ok i committed them

---

**Cursor**

Great, now that you've committed those changes, we can try switching to the `main` branch and pulling the latest changes again.

Excellent! We are now on the `main` branch, and it's been updated with the latest changes from `origin/main`.

Next, we'll merge the `feature/google` branch into `main`.


We have a merge conflict with `repomix-output.xml`.

It seems `repomix-output.xml` was deleted in `main` (HEAD) but was modified in `feature/google`. Git has kept the version from `feature/google` in your working directory.

You need to decide which version of `repomix-output.xml` you want to keep, or if you want to combine them or delete it altogether.

Please inspect `repomix-output.xml` and then tell me how you want to resolve this. For example:
*   "Keep the version from `feature/google`" (which is currently in your working directory)
*   "Delete `repomix-output.xml`"
*   "I've manually resolved it" (after you edit the file to your liking)

Once you've decided and (if necessary) edited the file:
1.  If you keep/edit it: `git add repomix-output.xml`
2.  If you delete it: `git rm repomix-output.xml`

After staging the resolution, you'll need to complete the merge with `git commit`.

Let me know how you'd like to proceed or if you want me to run the `git add` or `git rm` command.

---

**User**

delete repomix

---

**Cursor**

Okay, we will delete `repomix-output.xml` to resolve the conflict.

`repomix-output.xml` has been removed.

Now, we need to complete the merge by committing the changes. I'll use a generic commit message, but you can change it if you prefer something more specific.

The `feature/google` branch has been successfully merged into `main`.

Next, we'll merge the `documentation` branch into `main`.


It seems there isn't a local branch named `documentation`. Git is suggesting `origin/documentation`, which is likely the remote tracking branch.

Did you mean to merge `origin/documentation`?

If so, the command would be `git merge origin/documentation`.

Alternatively, if `documentation` is a branch that exists on the remote but you haven't fetched it or created a local tracking branch, you might need to run `git fetch origin` first, and then either `git checkout documentation` (to create a local branch) followed by `git checkout main` and `git merge documentation`, or directly `git merge origin/documentation`.

Please clarify if you want to merge `origin/documentation`.

---

**User**

the documentation branch is remote? 

---

**Cursor**

Yes, based on the previous command's output (`merge: documentation - not something we can merge. Did you mean this? origin/documentation`), it's highly likely that `documentation` is a branch that exists on your remote repository (usually named `origin`) and you don't have a local branch with that exact name, or your local list of remote branches is not up to date.

Let's first ensure your local Git repository knows about all the branches on the remote. This command will fetch all remote branches and their current states.

Okay, the fetch is complete. Now your local repository has the latest information about branches on `origin`.

We can now proceed to merge `origin/documentation` into your current `main` branch.

---

**User**

do dont think i have an origin branch. 

---

**Cursor**

It's standard practice for `origin` to be the default name for the remote repository when you clone a project. The previous commands like `git pull origin main` and `git fetch origin` seemed to indicate that `origin` is indeed set up as your remote.

To be certain, let's list your configured remotes. This will show us the names of your remote repositories and their URLs.

The output confirms that you do have a remote named `origin`, and it points to `https://github.com/AojdevStudio/dental-dashboard.git`.

This means the `documentation` branch we're trying to merge likely exists on that GitHub repository. The interruption during the last `git merge origin/documentation` command might have been a network hiccup or some other transient issue.

Let's try merging `origin/documentation` again. We are currently on the `main` branch, which is the correct place to be for this merge.

Ah, it seems the previous interrupted merge (when we tried to merge `feature/google`) left the repository in a state where a merge is still technically in progress (`MERGE_HEAD exists`).

Even though we committed the resolution for `repomix-output.xml`, there might be other changes from that `feature/google` merge that Git expects to be part of that specific merge commit.

Usually, if all conflicts are resolved and staged, `git commit` (without `-m` to open an editor for the commit message, or with `-m` if you prefer) should finalize the merge. We did run `git commit -m "Merge branch feature/google into main"`, which appeared successful.

It's possible there were other unstaged changes from the `feature/google` merge that weren't included in that commit, or Git is being cautious.

Let's check the status to see what Git thinks is going on.

The `git status` output is very informative. It shows:
1.  We are on branch `main`.
2.  Our `main` branch is ahead of `origin/main` by 5 commits (this includes the merge commit we just made for `feature/google`).
3.  Crucially: "All conflicts fixed but you are still merging. (use "git commit" to conclude merge)".
4.  There's a long list of "Changes to be committed". These are all the files that came in from the `feature/google` branch.

This means that when we ran `git commit -m "Merge branch feature/google into main"`, it only created the merge commit itself, but it didn't include all the actual file changes from `feature/google` in that commit. This is unusual; typically, a `git commit` after resolving conflicts during a merge finalizes everything.

The `MERGE_HEAD` file still existing is the primary indicator that Git considers the merge incomplete.

To fix this, we need to properly conclude the current merge operation, which will include all the listed changes. Since `git status` says "All conflicts fixed", we should be able to just run `git commit`. This time, I'll run it without the `-m` flag. This will open your default Git commit message editor, pre-filled with a standard merge commit message. You can inspect it, make changes if you wish, and then save and close the editor to finalize the commit.

It seems you've backgrounded the `git commit` command, which means the text editor for the commit message is likely open, waiting for your input.

Please complete the commit message in your editor and save/close it.

Once you've done that, we can proceed to merge the `documentation` branch. Let me know when you're ready.

---

**User**

ok we are all caught up.. lets continue with task creation now. @plans.mdc @tasks.mdc @_index.mdc 

---

**Cursor**

Accessing Task Magic system overview...

Excellent! Glad to hear the merge is complete and you're ready to continue.

We had already created the first two task files:
*   `task001_branching_strategy_setup.md`
*   `task002_prerequisites_verification.md`

Now, I will create the master `.ai/TASKS.md` file and include these two tasks.


```markdown
# Project Tasks

This file tracks the overall progress of tasks for the project. 
Individual task details are in the `.ai/tasks/` directory.

## Task List

### Phase 1: Refactoring Setup & Prerequisites

- [ ] **task001_branching_strategy_setup.md**: Setup Refactoring Branching Strategy
- [ ] **task002_prerequisites_verification.md**: Verify Refactoring Pre-requisites

### Phase 2: Incremental Refactoring (from .dev/refactoring-plan.md)

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._

### Phase 3: Design System Foundation (from .dev/refactoring-plan.md)

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._

### Phase 4: Component-Level Design & MVP Styling (from .dev/refactoring-plan.md)

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._

### Phase 5: Testing (from .dev/refactoring-plan.md)

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._

### Phase 6: Post-Refactor & Design Implementation (from .dev/refactoring-plan.md)

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._

## Completed Tasks

_Moved from the main list upon completion._

```

The master `.ai/TASKS.md` file has been created.

Now, let's continue creating tasks for the "Incremental Refactoring Steps" from section 3 of `.dev/refactoring-plan.md`.

The first main step is **Step 3.1: Refactor `src/app/` Directory**. I'll break this down.

Creating `task003_refactor_src_app_directory.md`:
This will be a parent task for the `src/app/` refactor. The sub-tasks within `refactoring-plan.md` for Step 3.1 are quite detailed, involving moving many specific files and subdirectories. We can represent these as sub-tasks within this main task file.

This will be a parent task for the `src/app/` refactor. The sub-tasks within `refactoring-plan.md` for Step 3.1 are quite detailed, involving moving many specific files and subdirectories. We can represent these as sub-tasks within this main task file.


```markdown
---
id: 003
title: "Step 3.1: Refactor src/app/ Directory"
status: todo
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
  - "[ ] Verify/update `src/app/layout.tsx` based on new structure."
  - "[ ] Verify/update `src/app/page.tsx` based on new structure."
  - "[ ] Refactor `src/app/(auth)/...` contents according to `.dev/file-system.md` (e.g., login, register, reset-password, callback routes)."
  - "[ ] Refactor `src/app/(dashboard)/...` contents according to `.dev/file-system.md` (e.g., dashboard page, layout, settings, integrations, goals, reports)."
  - "[ ] Create new dashboard subdirectories as needed (integrations/, goals/, reports/)."
  - "[ ] Map all existing API routes from `src/app/api/...` to the new granular structure in `.dev/file-system.md`."
  - "[ ] Identify and relocate any page component logic to new API routes where appropriate."
  - "[ ] Run `biome check --apply-unsafe src/app/` after moves and manually verify import paths."
  - "[ ] Test application functionality related to `src/app/` routes and layouts."
dependencies:
  - task002_prerequisites_verification.md
---

## Notes

- This is a major structural change. Proceed carefully, testing incrementally if possible.
- Pay close attention to the specific file mappings mentioned in `.dev/refactoring-plan.md` for `src/app/(auth)` and `src/app/(dashboard)`.
- The new API route structure under `src/app/api/` needs careful mapping from the old structure.

```

Now, I'll update `.ai/TASKS.md` to include this new task.


```markdown
// ... existing code ...
### Phase 1: Refactoring Setup & Prerequisites

- [ ] **task001_branching_strategy_setup.md**: Setup Refactoring Branching Strategy
- [ ] **task002_prerequisites_verification.md**: Verify Refactoring Pre-requisites

### Phase 2: Incremental Refactoring (from .dev/refactoring-plan.md)

- [ ] **task003_refactor_src_app_directory.md**: Step 3.1: Refactor src/app/ Directory

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._
// ... existing code ...
```

Next is **Step 3.2: Refactor `src/components/` Directory**.

Creating `task004_refactor_src_components_directory.md`:


```markdown
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

```

Updating `.ai/TASKS.md`:


```markdown
// ... existing code ...
### Phase 2: Incremental Refactoring (from .dev/refactoring-plan.md)

- [ ] **task003_refactor_src_app_directory.md**: Step 3.1: Refactor src/app/ Directory
- [ ] **task004_refactor_src_components_directory.md**: Step 3.2: Refactor src/components/ Directory

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._
// ... existing code ...
```

Next is **Step 3.3: Refactor `src/lib/` Directory**.

Creating `task005_refactor_src_lib_directory.md`:


```markdown
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

```

Updating `.ai/TASKS.md`:


```markdown
// ... existing code ...
### Phase 2: Incremental Refactoring (from .dev/refactoring-plan.md)

- [ ] **task003_refactor_src_app_directory.md**: Step 3.1: Refactor src/app/ Directory
- [ ] **task004_refactor_src_components_directory.md**: Step 3.2: Refactor src/components/ Directory
- [ ] **task005_refactor_src_lib_directory.md**: Step 3.3: Refactor src/lib/ Directory

_Tasks for this phase will be added based on the steps in `.dev/refactoring-plan.md`._
// ... existing code ...
```

Next is **Step 3.4: Refactor `src/hooks/`, `src/types/`, `src/styles/`**.

Creating `task006_refactor_hooks_types_styles.md`:


```markdown
---
id: 006
title: "Step 3.4: Refactor src/hooks/, src/types/, src/styles/"
status: todo
priority: medium
area: refactoring
assignee:
created_date: {{Current Date}}
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
  - "[ ] Review current files in `src/hooks/` and map/move them to the new structure if necessary."
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

```

Updating `.ai/TASKS.md`:


