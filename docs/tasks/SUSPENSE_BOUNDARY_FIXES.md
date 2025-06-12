# Task List: Resolve Missing Suspense Boundary Errors

This document outlines the tasks required to fix the `Missing Suspense boundary with useSearchParams` error that occurs during the build process.

## Summary

The Next.js `useSearchParams()` hook causes pages to opt-into client-side rendering. To prevent a poor user experience (like a blank page), Next.js requires that any component using this hook be wrapped in a `<Suspense>` boundary. This allows the rest of the page to be streamed from the server while the dynamic component loads.

The build process has identified two places where this rule is violated.

## Priority & Timeline Assessment

- **Priority**: High (This is a build-blocking error)
- **Timeline**: 1 day

## Task Breakdown

### Task 1: Fix Authentication Callback Page

- **File to Modify**: `src/app/(auth)/callback/page.tsx`
- **User Story**: As a user, when I am redirected back to the application after authenticating, I want to see a loading indicator while my session is being verified, without causing a build error.
- **Functional Expectation**: The authentication callback page must wrap the component logic that uses `useSearchParams` within a `<Suspense>` boundary. The existing loading animation should be used as the `fallback` for Suspense.

**Implementation Plan:**
1.  Open `src/app/(auth)/callback/page.tsx`.
2.  Create a new component inside the file called `AuthCallbackHandler` that contains all the existing logic from the `AuthCallbackPage` component.
3.  The `AuthCallbackPage` component should be updated to render the `AuthCallbackHandler` component wrapped in `<Suspense>`.
4.  The existing loading UI should be extracted into a `Loading` component and used as the `fallback` prop for `<Suspense>`.

### Task 2: Fix Dashboard Filter Bar

- **File to Modify**: `src/components/dashboard/dashboard-layout.tsx`
- **User Story**: As a user, when I load a dashboard page with filters, I want the page to load gracefully, with a loading indicator for the filter bar, without causing a build error.
- **Functional Expectation**: The `<FilterBar />` component, which uses `useSearchParams`, must be wrapped in a `<Suspense>` boundary where it is used.

**Implementation Plan:**
1. Open `src/components/dashboard/dashboard-layout.tsx`.
2. Locate where the `<FilterBar />` component is rendered.
3. Wrap the `<FilterBar />` component with `<React.Suspense>`.
4. Provide a suitable `fallback` component to be displayed while the `FilterBar` is loading (e.g., a skeleton loader).

## Affected Files

- `src/app/(auth)/callback/page.tsx`
- `src/components/dashboard/dashboard-layout.tsx`

## Acceptance Criteria

- [x] `pnpm build` completes successfully without any `Missing Suspense boundary` errors.
- [x] The authentication callback flow works as expected.
- [x] Dashboard pages containing the filter bar load correctly, showing a loading fallback for the filter bar initially. 