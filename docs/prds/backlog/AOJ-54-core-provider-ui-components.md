# PRD: Core Provider UI Components

## 1. Summary

This document outlines the requirements for creating a set of reusable UI components to display provider information on the "Providers" page. This feature is essential for allowing clinic administrators to view and manage their staff effectively. The components will be built using the existing `shadcn/ui` library to ensure design consistency and will include functionality for displaying provider details, key performance metrics, and quick actions. The implementation will cover loading, error, and empty states.

## 2. Priority & Timeline Assessment

-   **Priority**: **High**
    -   **Reasoning**: This is a core feature for the dental dashboard, directly impacting the user's ability to manage providers, which is a primary function of the application.
-   **Timeline**: **2-3 Days**
    -   **Reasoning**: The complexity is medium, involving the creation of several interconnected components. The timeline aligns with fast-shipping standards for high-priority features.

## 3. User Stories

-   **As a Clinic Administrator, I want to see a list of all providers in a clear and organized grid, so that I can quickly get an overview of my staff.**
-   **As a Clinic Administrator, I want to view key performance metrics for each provider at a glance, so that I can assess their performance.**
-   **As a Clinic Administrator, I want to be able to perform common actions for a provider (e.g., edit, view details), so that I can manage them efficiently.**

## 4. Functional Expectations

### Component Breakdown:

-   **`provider-card.tsx`**: A card component to display a single provider's information, including their photo (using `avatar.tsx`), name, role (using `badge.tsx`), and other key details.
-   **`provider-grid.tsx`**: A responsive grid layout that arranges multiple `provider-card` components.
-   **`provider-metrics.tsx`**: A component within the provider card to display KPIs using the existing `metric-card.tsx`.
-   **`provider-actions.tsx`**: A dropdown menu or set of buttons (using `dropdown-menu.tsx` or `button.tsx`) for actions like "View Profile" or "Edit".

### State Handling:

-   **Loading State**: The grid should display skeleton loaders (`skeleton.tsx`) while provider data is being fetched.
-   **Error State**: A clear error message and a "Retry" option should be displayed if data fetching fails.
-   **Empty State**: A helpful message should be shown when there are no providers to display.

### Acceptance Criteria:

-   All components must be fully typed using TypeScript. A `Provider` interface/type must be defined.
-   Components must be responsive and functional on modern desktop browsers.
-   The UI must be consistent with the existing design system (`shadcn/ui`).
-   Code must be well-documented with JSDoc3 comments.

## 5. Affected Files

### New Files:

-   `src/components/providers/provider-card.tsx`
-   `src/components/providers/provider-grid.tsx`
-   `src/components/providers/provider-metrics.tsx`
-   `src/components/providers/provider-actions.tsx`
-   `src/lib/types/provider.ts` (or similar, to define the Provider data structure)

### Modified Files:

-   `src/app/(dashboard)/settings/providers/page.tsx`: To integrate and render the new `provider-grid.tsx` component.
-   `src/lib/database/queries/providers.ts`: May require a new query to fetch the necessary data for the provider components.

## 6. Implementation Strategy

1.  **Define Data Structure**: Create a `Provider` interface in `src/lib/types/provider.ts` that includes all necessary fields (e.g., `id`, `name`, `role`, `avatarUrl`, `metrics`).
2.  **Develop Bottom-Up**:
    -   Start by building the smallest, most reusable component: `provider-card.tsx`. Use mock data to develop the UI.
    -   Develop `provider-metrics.tsx` and `provider-actions.tsx` and integrate them into the card.
3.  **Compose the Grid**: Build `provider-grid.tsx` to responsively display a list of `provider-card` components, still using mock data.
4.  **Implement State Handling**: Add loading, empty, and error state handling to `provider-grid.tsx`.
5.  **Integrate Data**: Connect the `provider-grid.tsx` to a data-fetching hook or function that retrieves real provider data.
6.  **Final Integration**: Replace any placeholder content on `src/app/(dashboard)/settings/providers/page.tsx` with the completed `provider-grid.tsx` component.

## 7. AI Guardrails Implementation Strategy

Given that this feature affects multiple files and involves creating new, typed components, the following guardrails should be applied during AI-assisted development:

-   **File-level Constraints**: When working on a component, instruct the AI to only import from `react`, `clsx`, `lucide-react`, `@radix-ui`, and other approved `shadcn/ui` components. All data-related types must be imported from `src/lib/types`.
-   **Change Type Isolation**: Separate tasks into distinct sessions. For example, one session for creating the `Provider` type, another for building the `provider-card.tsx` UI with mock data, and a final one for data integration.
-   **Incremental Validation**: After creating each component, run the linter and type-checker (`pnpm lint`) to ensure no new issues are introduced.
-   **Safety Prompts**: Use prompts that reinforce the rules, such as: "Create the `provider-card.tsx` component. It should be a client component and use the `Provider` type from `src/lib/types`. Do not include any data-fetching logic."

## 8. Risk Assessment & Mitigation

-   **Risk**: The `Provider` data model may be incomplete or change in the future.
    -   **Mitigation**: Define the `Provider` type in a central `types` file. This makes it easy to update and ensures all components use the same structure.
-   **Risk**: UI components may become inconsistent with the overall design.
    -   **Mitigation**: Strictly adhere to using `shadcn/ui` components and follow the existing design patterns in the application. Conduct a UI review before merging.
-   **Risk**: Performance issues if the list of providers grows very large.
    -   **Mitigation**: For this initial implementation, performance is not a primary concern. However, design the `provider-grid.tsx` to accept a paginated or virtualized list in the future without major refactoring.
