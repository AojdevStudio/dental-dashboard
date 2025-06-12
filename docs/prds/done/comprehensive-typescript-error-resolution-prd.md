# PRD: Comprehensive TypeScript Error Resolution

## 1. Document Information

-   **Issue ID:** TS-FIX-356
-   **Title:** Comprehensive TypeScript Error Resolution and Codebase Stabilization
-   **Priority:** **Critical**
-   **Timeline**: 3-5 Days
-   **Status**: Scoped
-   **Owner**: Senior Technical PM

## 2. Executive Summary

The codebase currently has **356 TypeScript errors** across 35 files, which prevents the project from building successfully and blocks all development and deployment pipelines. The errors span a range of issues, including improper type assignments in tests, null-safety issues, incorrect API route signatures, and environment-specific type conflicts (Deno vs. Node.js).

This document outlines a systematic, three-phased approach to eliminate all TypeScript errors. The strategy focuses on first stabilizing the build by addressing configuration and test-related issues, then fixing application code, and finally validating the entire codebase. An **AI Guardrails Implementation Strategy** will be strictly enforced to ensure that fixes are applied incrementally and safely, without introducing functional regressions. This plan will unblock the development team and significantly improve long-term code quality and maintainability.

## 3. Background and Strategic Fit

The inability to get a clean build is a critical blocker. Resolving these errors is not just about technical correctness; it is a prerequisite for any future feature development, bug fixing, and deployment. By systematically addressing this technical debt, we will restore development velocity, re-enable our CI/CD pipeline, and establish a higher standard of code quality that will prevent similar issues in the future.

## 4. Goals and Success Metrics

### Goals
-   Achieve a successful `pnpm tsc --noEmit` run with zero errors.
-   Ensure no functional regressions are introduced during the fix process.
-   Correctly configure the TypeScript environment to handle both Node.js (Next.js) and Deno (Supabase Functions) contexts.
-   Improve the overall type safety and quality of the codebase.

### Success Metrics
-   **Primary**: `pnpm build` and `pnpm tsc --noEmit --skipLibCheck` complete successfully with 0 errors.
-   **Primary**: All existing automated tests pass.
-   **Secondary**: Manual testing of core application flows reveals no new bugs.
-   **Quality**: The number of `any` and `unknown` types used in mock data for tests is significantly reduced.

## 5. Error Analysis & Affected Files

The 356 errors are heavily concentrated in test files, which account for over 80% of the total issues. This suggests a systemic problem with how test data and mocks are typed.

### High-Level Error Categories:
-   **`TS2345` (Argument Mismatch)**: Widespread in tests where mock data (`as unknown`) does not match Prisma's expected types.
-   **`TS18048` (Possibly 'undefined')**: Variables are used without being checked for `undefined`, a common null-safety issue.
-   **`TS2339` (Property does not exist)**: Attempting to access properties on incorrectly typed objects.
-   **`TS2307` (Cannot find module)**: Module resolution issues, particularly for Supabase functions and test utilities.
-   **`TS2322` (Type Mismatch)**: Incorrect types assigned to variables, often related to Prisma model differences.
-   **Environment Conflicts**: Deno-specific globals (`Deno.serve`, `Deno.env`) are not recognized in the main TypeScript configuration.

### Top 10 Most Affected Files:

| File                                                                | Errors | Primary Issue(s)                                   |
| ------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `src/lib/database/__tests__/security/security.test.ts`              | 101    | `TS18048` (null safety), `TS2345` (mock data)      |
| `src/lib/database/__tests__/performance/performance.test.ts`        | 57     | `TS2345` (mock data), `TS2571` (`unknown` object)   |
| `src/lib/database/__tests__/data-migration.test.ts`                 | 51     | `TS2345` (mock data)                               |
| `src/lib/database/__tests__/integration/multi-tenant-integration.test.ts` | 28     | `TS18048` (null safety)                            |
| `src/app/api/__tests__/api-integration.test.ts`                     | 23     | `TS2345`, `TS2322` (API responses)                 |
| `src/components/goals/goal-form.tsx`                                | 11     | Form and event handler typing issues.              |
| `src/lib/database/__tests__/query-layer.test.ts`                    | 10     | `TS2345` (mock data)                               |
| `src/app/api/metrics/route.ts`                                      | 7      | `TS2345` (Next.js API route signature)             |
| `src/components/dashboard/dashboard-grid.tsx`                       | 7      | Component prop typing issues.                      |
| `src/lib/database/queries/users.ts`                                 | 7      | Prisma query and `null` handling issues.           |

## 6. Implementation Plan

The resolution will be executed in three distinct phases to manage risk and provide clear checkpoints.

### Phase 1: Configuration and Environment Fixes (Est: 1 Day)
This phase focuses on fixing the foundational issues that cause widespread or environment-specific errors.

1.  **Isolate Supabase Functions**: Create a dedicated `tsconfig.json` for the `upload/supabase/functions` directory that includes Deno types. This will resolve the `TS2304` errors for `Deno` globals.
2.  **Fix Module Resolution**: Address the `TS2307` "Cannot find module" errors by correcting import paths or `tsconfig.json` path aliases.
3.  **Address Test-Setup Errors**: Fix the `TS2349` error in `verify-multi-tenant-tables.ts` by ensuring the Prisma model `count` is called correctly.

**Validation**: After this phase, all environment and module resolution errors should be gone. The total error count should decrease significantly.

### Phase 2: Systematic Test File Remediation (Est: 2-3 Days)
This phase tackles the largest source of errors: the test files. We will proceed file by file, starting with the highest error counts.

1.  **`security.test.ts` (101 errors)**:
    -   Add null checks for `adminUser`, `userClinicA`, etc. before access to fix `TS18048`.
    -   Correctly type `authContext` objects to match the `AuthContext` interface, fixing `TS2345`.
2.  **`performance.test.ts` (57 errors)**:
    -   Replace `as unknown` with properly typed mock objects that match Prisma's return types. For this, I will use my documentation retrieval capabilities to get the exact Prisma types.
    -   Provide explicit types for objects (`auditLog`) that are currently `unknown` to fix `TS2571`.
3.  **`data-migration.test.ts` (51 errors)**:
    -   Similar to above, replace all `as unknown` casts with strongly-typed mock data.
4.  **Continue for all test files**: Apply the same principles to the remaining test files.

**Validation**: After each file is fixed, run `pnpm tsc --noEmit` to ensure only the target errors were fixed and no new ones were introduced.

### Phase 3: Application Code Remediation (Est: 1 Day)
With tests cleaned up, this phase focuses on the remaining errors in the core application logic.

1.  **Database Queries (`src/lib/database/queries`)**:
    -   Fix null-handling issues (`TS2345`, `TS2322`) where a `null` value could be passed to a function expecting a `string`.
    -   Correct Prisma query `include` and data transformation logic. I will use documentation to look up correct patterns for `transformProviderData`.
2.  **API Routes (`src/app/api`)**:
    -   Correct the function signatures for Next.js 15 API routes. I will use documentation for `Request` and `NextResponse` types.
3.  **Components (`src/components`)**:
    -   Fix component prop types, especially for generic components like `select.tsx`.
    -   Ensure event handlers in `goal-form.tsx` are correctly typed.

**Validation**: A final `pnpm tsc --noEmit` run should return zero errors. A full manual test of the application should be performed.

## 7. AI Guardrails Implementation Strategy

To ensure a safe and controlled implementation, the following guardrails will be used for every step.

-   **File-level Constraints**: Each AI session will modify **only one file at a time**. This minimizes the blast radius of any potential mistake.
-   **Change Type Isolation**: Fixes will be isolated by type. A session will focus *only* on fixing null-safety issues, or *only* on fixing mock data types, not both at once.
-   **Incremental Validation**: After each file is modified, `pnpm tsc --noEmit` will be run to validate that the changes had the intended effect.
-   **Safety Prompts**: Prompts will be highly specific, e.g., "In `security.test.ts`, add a null check for the `adminUser` variable before it is used on line 130" or "In `performance.test.ts`, replace the `as unknown` cast on line 123 with a correctly typed mock object for the Prisma `MetricValue` model."
-   **Documentation-Driven Fixes**: For library-specific issues, I will state my intent clearly: "I will now retrieve the official documentation for Prisma's `findMany` return type to correctly mock the data in `performance.test.ts`."

## 8. Risks and Mitigation

-   **Risk**: Introducing functional regressions while fixing type errors.
    -   **Mitigation**: The phased approach, single-file modifications, and constant validation via `tsc` and existing tests will minimize this risk. A full manual testing pass at the end is the final backstop.
-   **Risk**: Fixes become more complex than anticipated, extending the timeline.
    -   **Mitigation**: The plan prioritizes the largest and most systemic issues first. By tackling the test files first, we build momentum and clarify the remaining work. If a fix is too complex, it will be flagged for manual developer review.

## 9. Linear Metadata

-   **Issue Title**: [TS-FIX-356] Comprehensive TypeScript Error Resolution
-   **Priority**: Critical
-   **Labels**: `technical-debt`, `typescript`, `build-fix`, `type-safety`
-   **Complexity**: High
-   **Due Date**: 5 days from start 