# PRD: Resolve Biome Linting Issues in API & Dashboard

## 1. Summary

This document outlines the requirements for a technical debt initiative to resolve all Biome linting errors and warnings across the `src/app/api/` and `src/app/(dashboard)/` directories. The primary goal is to improve code quality, maintainability, and type safety, while ensuring the CI/CD pipeline can run without linting failures. This effort will address issues ranging from performance and style to cognitive complexity and correctness.

## 2. Priority & Timeline Assessment

-   **Priority**: **High**
    -   **Justification**: The existing linting issues represent significant technical debt that complicates development, hides potential bugs (especially `noExplicitAny` and incorrect `useAwait` usage), and degrades overall codebase health. A clean, lint-free codebase is essential for developer velocity and long-term stability.
-   **Timeline**: **2-3 Days**
    -   **Justification**: While some fixes are mechanical, refactoring functions with high cognitive complexity requires careful, focused effort. This timeline accounts for a phased approach with incremental validation to mitigate risks.

## 3. User Stories

-   **As a developer**, I want to eliminate all Biome linting errors and warnings in the API and Dashboard directories, so that the codebase is cleaner, more maintainable, and the CI/CD pipeline can pass reliably.
-   **As a developer**, I want to refactor functions with high cognitive complexity, so that they are easier to understand, test, and modify in the future without introducing bugs.
-   **As a developer**, I want to ensure all `async` functions are used correctly with `await`, so that potential race conditions and unhandled promise errors are avoided.
-   **As a developer**, I want to replace all uses of `any` with specific, strict types, so that we can leverage TypeScript's static analysis to prevent type-related bugs at compile time.

## 4. Functional Expectations

The project is considered complete when the following acceptance criteria are met:

-   Running `pnpm biome check src/app/api/` results in zero errors and zero warnings.
-   Running `pnpm biome check src/app/\(dashboard\)/` results in zero errors and zero warnings.
-   All existing application functionality remains intact, with no regressions introduced by the refactoring.

## 5. Affected Files

This initiative will impact all files with reported Biome diagnostics within the following directories:

-   `src/app/api/`
-   `src/app/(dashboard)/`

## 6. Implementation Strategy

A phased approach is recommended to manage risk and ensure changes are made systematically. Work should be committed after each phase is complete and verified.

### Phase 1: Performance & Async Fixes (Low Risk)

1.  **Fix `noForEach` violations**: Replace all instances of `.forEach()` with `for...of` loops. This is a mechanical change that improves performance.
2.  **Fix `useAwait` violations**: Add the `await` keyword where necessary or remove the `async` modifier from functions that do not contain any `await` expressions.

### Phase 2: Correctness & Style Fixes (Low-Medium Risk)

1.  **Fix `noUnusedVariables` & `noUnusedFunctionParameters`**: Remove any declared variables or function parameters that are not being used.
2.  **Fix `noNonNullAssertion`**: Remove `!` non-null assertions and replace them with proper null-checking logic (e.g., conditional checks, optional chaining `?.`).

### Phase 3: Type Safety Improvements (Medium Risk)

1.  **Fix `noExplicitAny`**: Replace all uses of the `any` type with specific interfaces, types, or inferred types from libraries like Prisma.
2.  **Fix `noEvolvingTypes`**: Provide explicit type annotations for variables that Biome identifies as having an evolving type (e.g., `let clinics: Clinic[] = [];`).

### Phase 4: Cognitive Complexity Refactoring (High Risk)

1.  **Address `noExcessiveCognitiveComplexity`**: Refactor the most complex functions one at a time.
2.  Break down large functions into smaller, single-responsibility helper functions.
3.  Focus on improving readability and simplifying logic. Each refactored function should be tested carefully to ensure no logic regressions are introduced.

## 7. AI Guardrails Implementation Strategy

Due to the high number of affected files and the inclusion of complex refactoring, the following guardrails must be employed when using an AI assistant:

-   **File-level Constraints**: Work on one file or one category of error at a time (e.g., "Fix all `noForEach` issues in this file"). Do not attempt to fix all issues in all files in a single step.
-   **Change Type Isolation**: Keep mechanical fixes (like syntax changes) separate from logical refactoring (like reducing complexity). Commit these changes separately.
-   **Incremental Validation**: After modifying a file, immediately run `pnpm biome check <file_path>` to confirm the specific issue has been resolved without introducing new ones.
-   **Safety Prompts for AI Sessions**: Use clear, constraining prompts. For example:
    -   "In `[file]`, replace the `.forEach` loop on line `[N]` with a `for...of` loop. Do not alter any other logic."
    -   "The function `[name]` in `[file]` has a cognitive complexity of `[X]`. Please refactor it into smaller helper functions while preserving the exact original behavior."

## 8. Risk Assessment & Mitigation

-   **Risk**: High probability of introducing functional regressions, especially during the complexity refactoring phase.
-   **Mitigation**:
    -   Adhere strictly to the phased implementation strategy.
    -   Commit changes after each verified phase.
    -   For highly complex functions, consider adding temporary unit tests with `vitest` to cover the existing logic before refactoring, ensuring the new implementation produces the same outputs.
    -   Conduct a full manual regression test of the related features (e.g., login, dashboard display) after all changes are complete.

## 9. Linear Integration Prep

-   **Suggested Issue Title**: `Tech Debt: Resolve all Biome linting issues in API and Dashboard directories`
-   **Priority**: `High`
-   **Labels**: `technical-debt`, `refactoring`, `code-quality`
-   **Assignee**: `[Developer Name]`
-   **Due Date Recommendation**: 3 days from start date. 