### Document Information
- **Issue ID:** AOJ-52
- **Title:** Enhance Providers API with Advanced Database Integration
- **Priority:** High
- **Due Date:** 2-3 days from start
- **Created:** 2025-06-11
- **Author:** AOJ Sr.
- **Status:** Draft

### Executive Summary
This document outlines the plan to address issue AOJ-52 by refactoring the `/api/providers/route.ts` endpoint. The current implementation performs basic database queries, failing to leverage the more sophisticated `getProvidersWithLocations()` database function that provides richer, relational data. The plan is to update the API to use this function, introduce robust filtering and pagination, and ensure type safety. Implementation will follow a strict AI guardrails strategy, focusing on one layer at a time (API, then hooks) to minimize risk and ensure stability.

### Background and Strategic Fit
#### Current State
- The `/api/providers/route.ts` endpoint returns a flat list of providers.
- It does not include valuable relational data like clinic or location assignments.
- It lacks critical filtering (by clinic, type, status) and pagination capabilities required for the new Providers Dashboard UI.
- This gap between backend capability and API implementation is a primary blocker for frontend development (AOJ-55, AOJ-57).

#### Desired State
- The API will return a rich, nested data structure for providers, including their assigned locations.
- The endpoint will accept query parameters for filtering by `clinicId`, `locationId`, `providerType`, and `status`.
- The API will support pagination to handle potentially large provider lists efficiently.
- The API will be fully type-safe and serve as a stable foundation for the frontend.

### Goals and Success Metrics
#### Goals
1. **Integrate Advanced Queries:** Replace the simple query in the providers API with the `getProvidersWithLocations()` database function.
2. **Implement Filtering & Pagination:** Enable robust data filtering and pagination via URL query parameters.
3. **Maintain Stability:** Ensure the changes are non-breaking to any existing consumers of the API and are thoroughly tested.

#### Success Metrics
1. **Primary:** The API response for a provider includes a `locations` array with associated location details.
2. **Primary:** The API correctly filters results when `clinicId`, `providerType`, or `status` query parameters are provided.
3. **Secondary:** The API endpoint maintains or improves its response time under load.
4. **Secondary:** 100% of the new API logic is covered by integration tests.

### Detailed Requirements
#### 1. API Route Enhancement
##### 1.1 Affected Files
- `src/app/api/providers/route.ts` - **High Risk**: Core API endpoint logic will be overhauled.
- `src/lib/database/queries/providers.ts` - **Low Risk**: Read-only to understand the function signature of `getProvidersWithLocations`.
- `src/lib/types/providers.ts` - **Medium Risk**: Types will need to be updated or created to reflect the new API response structure.
- `src/hooks/use-providers.ts` - **Medium Risk**: Will require updates to align with the new API filtering and data structure.

##### 1.2 Technical Standards
- All new API logic must be strictly typed.
- URL Search Parameters (`URLSearchParams`) should be used for parsing query strings.
- Zod can be used for validating incoming query parameters.
- Prisma queries must be optimized and efficient.

### AI Guardrails Implementation Strategy
Given the modification of a core API, a strict guardrails strategy is mandatory.
- **File-level Constraints**: Work will be scoped to one file at a time. The session will start with `route.ts`, followed by `providers.ts` (types), and finally `use-providers.ts`.
- **Change Type Isolation**: The change will be broken down: first, integrate the new database function; second, add parameter parsing; third, add filtering logic. This will be done in separate, sequential steps.
- **Incremental Validation**: After modifying `route.ts`, the endpoint will be tested manually with `curl` to validate its functionality before any frontend changes are made. After `use-providers.ts` is updated, the associated UI components will be tested to confirm they receive data correctly.
- **Safety Prompts for AI Sessions**: "Safely refactor `src/app/api/providers/route.ts` to use the `getProvidersWithLocations` function. Do not add filtering logic yet. Show me the diff before applying."

### Implementation Plan
#### Phase 1: Backend - API Refactoring & Validation
- **Scope**: Modify `src/app/api/providers/route.ts` to replace the existing Prisma query with a call to `getProvidersWithLocations()`. Add logic to handle new query parameters for filtering and pagination. Update types in `src/lib/types/providers.ts`.
- **Duration**: 1 Day
- **Validation**:
  - Manually test the API endpoint using `curl` or a similar tool.
  - Verify that the response includes nested location data.
  - Test each filter (`clinicId`, `providerType`, `status`) individually and in combination.
  - Write integration tests for the API endpoint.

#### Phase 2: Frontend - Hook Adaptation
- **Scope**: Update the `use-providers.ts` custom hook to work with the new API response structure and to pass filter parameters to the API.
- **Duration**: 1 Day
- **Validation**:
  - Ensure any component using `use-providers` still renders correctly.
  - Write unit tests for the hook to verify it correctly formats API requests and processes responses.

### Risks and Mitigation
- **Risk**: Breaking changes for existing consumers of the API.
  - **Mitigation**: Before starting, a global search will be conducted to identify all current usages of `/api/providers`. The new implementation will be designed to be as backward-compatible as possible. If significant breaking changes are unavoidable, we will consider versioning the API (e.g., `/api/v2/providers`).
- **Risk**: Performance degradation from more complex queries.
  - **Mitigation**: The `getProvidersWithLocations` query will be analyzed for performance. Caching strategies at the API level will be considered if necessary.

### Acceptance Criteria
- The `/api/providers` GET endpoint successfully uses the `getProvidersWithLocations` database function.
- The API returns provider data that includes a nested array of their assigned locations.
- The API can be filtered by `clinicId`, `locationId`, `providerType`, and `status` via URL query parameters.
- The API supports pagination via `page` and `limit` query parameters.
- All new logic is covered by appropriate tests.
- The `use-providers.ts` hook is updated to work with the enhanced API. 