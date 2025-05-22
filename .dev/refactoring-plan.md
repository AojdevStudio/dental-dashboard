# MVP Structural Refactoring Plan

This document outlines the plan for refactoring the codebase to align with the new target file structure defined in `.dev/file-system.md` and the MVP scope defined in `.dev/prd-mvp.md`.

## 1. Branching Strategy

*   **Main Refactoring Branch:** A dedicated feature branch named `feature/mvp-structure-refactor` will be created from the current main development branch (e.g., `main` or `develop`).
*   **Sub-Branches (Optional but Recommended):** For each major incremental step (see section 3), consider creating sub-branches off `feature/mvp-structure-refactor` (e.g., `feature/mvp-structure-refactor/app-layout`, `feature/mvp-structure-refactor/components`). This allows for smaller, more manageable Pull Requests if working in a team, or safer checkpoints.
*   **Pull Requests:** Once a significant portion of the refactor is complete and tested on its branch, it will be merged into `feature/mvp-structure-refactor`. Finally, `feature/mvp-structure-refactor` will be merged into the main development branch after thorough review and testing.

## 2. Pre-requisites

*   The new MVP PRD (`.dev/prd-mvp.md`) is finalized and agreed upon.
*   The target file structure (`.dev/file-system.md`) is confirmed.
*   The location of backend logic (API Routes, Supabase Edge Functions) is clearly understood, referencing:
    *   `.dev/feature-spec.md`
    *   `.dev/database-schema-design.md`
    *   `.dev/database-schema-metrics.md`

## 3. Incremental Refactoring Steps & File Migration Plan

The refactoring will be done incrementally. After each step, aim to have the application in a runnable state, if possible, and run basic tests. Biome will be used to update import paths where feasible, followed by manual verification.

**Target Structure Reference:** `.dev/file-system.md`
**Old Structure Reference (Implied):** Project structure previously outlined in `prd.txt` (the one at the end of the original `prd.txt`).

### Step 3.1: Refactor `src/app/` Directory

*   **Goal:** Reorganize the `app/` directory, including `(auth)`, `(dashboard)`, `api/`, and top-level layouts/pages.
*   **Files to Move/Rename (Source -> Target in `.dev/file-system.md`):**
    *   `src/app/layout.tsx` -> (Verify if changes needed based on new structure)
    *   `src/app/page.tsx` -> (Verify if changes needed based on new structure)
    *   **`src/app/(auth)/...`**
        *   `src/app/auth/login/page.tsx` -> `src/app/(auth)/login/page.tsx`
        *   `src/app/auth/signup/page.tsx` -> `src/app/(auth)/register/page.tsx` (Note: `register` in new structure)
        *   `src/app/auth/reset-password/...` -> (Map to new structure if kept for MVP)
        *   `src/app/auth/callback/route.ts` -> `src/app/api/auth/google/callback/route.ts` (or similar, needs clarification from `file-system.md`'s api routes)
        *   (Add other files from old auth structure and map them)
    *   **`src/app/(dashboard)/...`**
        *   `src/app/(dashboard)/page.tsx` -> `src/app/(dashboard)/dashboard/page.tsx`
        *   `src/app/(dashboard)/layout.tsx` -> `src/app/(dashboard)/layout.tsx` (Verify contents)
        *   `src/app/(dashboard)/clinics/...` -> `src/app/(dashboard)/settings/clinic/page.tsx` (or map to other new sections like `reports/` or specific dashboard views if they exist)
        *   `src/app/(dashboard)/providers/...` -> `src/app/(dashboard)/settings/providers/page.tsx` (and `[providerId]/page.tsx`)
        *   `src/app/(dashboard)/metrics/...` -> (Likely removed or rethought as specific views, not a generic folder)
        *   `src/app/(dashboard)/settings/...` -> `src/app/(dashboard)/settings/page.tsx` (and its sub-routes)
        *   (Create new folders like `integrations/`, `goals/`, `reports/` as per `.dev/file-system.md` and plan for their content)
    *   **`src/app/api/...`**
        *   (Map all existing API routes to the new, more granular structure in `.dev/file-system.md` under `src/app/api/`)
*   **Logic Relocation:**
    *   Identify any logic in page components that should move to new API routes.
*   **Biome Command (Example):** `biome check --apply-unsafe src/app/` (Run after moves)

### Step 3.2: Refactor `src/components/` Directory

*   **Goal:** Reorganize components into new domain-specific subdirectories.
*   **Files to Move/Rename (Source -> Target in `.dev/file-system.md`):**
    *   `src/components/ui/...` -> (Likely remains, verify against new structure)
    *   `src/components/charts/...` -> `src/components/dashboard/kpi-chart.tsx` (example, map specific charts)
    *   `src/components/dashboards/...` -> Break down into more specific components under `src/components/dashboard/` (e.g., `metric-card.tsx`, `financial-overview.tsx`)
    *   `src/components/forms/...` -> `src/components/ui/form.tsx` or map to specific forms like `src/components/auth/login-form.tsx`
    *   `src/components/layout/...` -> `src/components/common/navigation.tsx`, `sidebar.tsx`, `header.tsx`
    *   `src/components/auth/...` -> (Map to new structure, e.g., `login-form.tsx`)
    *   `src/components/metrics/...` -> (Likely deprecated in favor of more specific dashboard components)
    *   (Create new component groups like `src/components/google-sheets/`, `src/components/goals/`, `src/components/users/` and populate/move relevant components)
*   **Biome Command (Example):** `biome check --apply-unsafe src/components/`

### Step 3.3: Refactor `src/lib/` Directory

*   **Goal:** Reorganize libraries, utilities, and client configurations.
*   **Files to Move/Rename (Source -> Target in `.dev/file-system.md`):**
    *   `src/lib/api/...` -> (Likely removed or rethought if API calls are direct from components/hooks or API routes handle client-side calls)
    *   `src/lib/db/prisma.ts` -> `src/lib/database/prisma.ts`
    *   `src/lib/google/` (old structure) -> `src/lib/google-sheets/client.ts`, `auth.ts`, etc.
    *   `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` -> (Map to new structure, potentially `src/lib/auth/` for some parts like middleware)
    *   (Create `src/lib/database/queries/`, `src/lib/database/schemas/`, `src/lib/metrics/`, `src/lib/utils/` and populate them by moving/refactoring existing utilities and creating new ones).
*   **Logic Relocation:**
    *   Ensure database query logic moves into `src/lib/database/queries/`.
    *   Ensure type definitions for schemas are in `src/lib/database/schemas/` or `src/lib/types/`.
*   **Biome Command (Example):** `biome check --apply-unsafe src/lib/`

### Step 3.4: Refactor `src/hooks/`, `src/types/`, `src/styles/` (Verify against `.dev/file-system.md`)

*   **Goal:** Ensure these directories align with the new structure and their contents are appropriately placed.
*   **Files to Move/Rename:**
    *   (Review current files and map them to the new structure. For example, `src/types/database.ts` might be split or moved into `src/lib/database/schemas/` or a more granular `src/lib/types/metrics.ts` etc.)
*   **Biome Command (Example):** `biome check --apply-unsafe src/` (for broader changes)

### Step 3.5: Address `src/actions/` and `src/services/` (Logic Relocation)

*   **Goal:** Since these directories are intentionally absent in the new frontend structure, ensure all their logic is correctly relocated to Next.js API Routes or Supabase Edge Functions.
*   **Process:**
    1.  Identify all functionality previously in `src/actions/*.ts` and `src/services/**/*.ts`.
    2.  For each piece of functionality, determine its new location:
        *   If it's a server-side mutation or query directly related to a user action, it might become an API route handler.
        *   If it's a complex calculation or data transformation, it might become a Supabase Edge Function, or logic within an API route.
        *   If it's a utility function, it might move to `src/lib/utils/` or a relevant subdirectory in `src/lib/`.
    3.  Refactor the code to fit its new environment (e.g., using `req`, `res` for API routes).
    4.  Update all call sites to use the new API endpoints or refactored utility functions.

## 4. Design System Foundation Implementation

**Goal:** Configure the foundational elements of the new design system based on `.dev/design-brief.md`. This phase occurs *after* the structural refactoring (Phase 3) is largely complete and stable.

**Reference Design Brief:** `.dev/design-brief.md`

### Step 4.1: Update `tailwind.config.js` (or `.ts`)
*   **Colors:** Define the new explicit color palette from the design brief within `theme.extend.colors`. Use semantic names (e.g., `primary-blue`, `success-green`).
*   **Fonts:** Update `theme.extend.fontFamily` to include "Inter" and the chosen monospace font. Ensure "Inter" is appropriately imported or available.
*   **Border Radius:** Update `theme.extend.borderRadius` to match common values from the brief (e.g., `8px`, `12px`).
*   **Box Shadows:** Define custom box shadows from the brief in `theme.extend.boxShadow`.
*   **Verification:** After changes, restart the development server.

### Step 4.2: Update `src/styles/globals.css`
*   **Font Import:** Ensure the "Inter" web font (e.g., from Google Fonts) is imported if not already globally available.
*   **CSS Variables for Colors (ShadCN Compatibility):**
    *   **Light Mode (`:root`):** Map the new design brief's light mode colors to the CSS variables expected by ShadCN UI and defined in the `@theme inline` block. Convert hex/RGB from the brief to OKLCH values if maintaining that format, or use direct hex values if preferred (though OKLCH is current).
    *   **Dark Mode (`.dark`):** Similarly, map the brief's dark mode colors to the CSS variables in the `.dark {}` block.
    *   Define any additional global CSS variables for colors from the brief that might be useful outside of Tailwind's direct utility classes.
*   **Base Layer Styles:** Review and adjust styles in `@layer base` (e.g., global border application `*`) to align with the design brief's more component-specific approach to borders.
*   **Verification:** Check if basic ShadCN components (Button, Card, Input) pick up the new theme.

### Step 4.3: Initial Theming Test
*   Create a test page or use an existing simple page.
*   Apply a few basic ShadCN components (Button, Input, Card).
*   Apply new Tailwind utility classes for colors, fonts, and spacing.
*   Verify that the foundational theme (colors, fonts) is correctly applied in both light and dark modes.

## 5. Component-Level Design Implementation & MVP Feature Styling

**Goal:** Meticulously apply the new design system to all existing and new MVP components, ensuring adherence to `.dev/design-brief.md`. This phase runs concurrently with or immediately follows the development of MVP features within the new structure.

### Step 5.1: Iterative Component Styling
*   For each component in the MVP (both existing refactored components and newly built ones):
    *   **Typography:** Apply Tailwind utilities to match font sizes, weights, line heights, and colors specified in the design brief.
    *   **Spacing & Layout:** Use Tailwind utilities for padding, margins, and layout to match the brief's spacing system and component designs.
    *   **Colors:** Apply new Tailwind color utilities (`bg-primary-blue`, `text-success-green`, etc.).
    *   **Borders & Shadows:** Apply configured `rounded-*` and `shadow-*` utilities.
    *   **Icons:** Ensure Lucide React icons are used with correct styling (size, color) as per the brief.
*   **Focus:** Start with shared layout components (navigation, sidebar, headers), then common UI elements (buttons, inputs, cards), then specific dashboard/feature components.

### Step 5.2: ShadCN UI Component Fine-Tuning
*   Review all instances of ShadCN UI components.
*   While they will inherit the base theme, apply additional Tailwind utilities as needed to precisely match the padding, margins, or other visual details specified for similar components in the design brief.

### Step 5.3: Responsive Design Implementation
*   Apply Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to utility classes to ensure components and layouts adapt as per the "Responsive Design Considerations" in the design brief.
*   Test thoroughly on different viewport sizes.

### Step 5.4: Accessibility Review
*   As components are styled, continuously verify:
    *   Color contrast ratios.
    *   Text legibility and scalability.
    *   Correct alternative text for images/icons (if not handled by icon library).
    *   Keyboard navigation and clear focus indicators.

### Step 5.5: Dark Mode Verification
*   For each styled component, verify its appearance and usability in dark mode, ensuring it correctly uses the dark mode theme variables and maintains accessibility.

## 6. Testing Strategy (Extended)

*   **Unit Tests:** Run existing unit tests after each incremental step for the affected modules. Update tests as needed to reflect new file paths and any refactored logic.
*   **Integration Tests:** If integration tests exist, run them, focusing on areas where file structures and inter-module communication have changed.
*   **Visual Regression Testing (Highly Recommended):**
    *   After Phase 4 (Design System Foundation) and iteratively during Phase 5, implement visual regression tests (e.g., using Playwright with image comparison or a dedicated service like Percy/Chromatic). This is crucial for catching unintended visual changes when applying a new design system.
*   **Manual Testing:** After each major step (e.g., completing `src/app/` refactor), perform manual click-through testing of key functionalities to ensure the application is still working.
*   **Accessibility Audits:** Conduct accessibility audits (e.g., using Axe DevTools, Lighthouse) periodically during and after Phase 5.
*   **Build Check:** Regularly run `pnpm build` (or your build command) to catch type errors and build issues early.

## 7. Post-Refactor & Design Implementation

*   Full regression testing of the application (functional and visual).
*   Thorough review against `.dev/design-brief.md` for all MVP screens and components.
*   Update all project documentation, including any UI component libraries or style guides.
*   Communicate changes to the team.
*   Celebrate! This is a major overhaul. 