# PRD: [API] Provider Performance Metrics Endpoint (AOJ-53)

## 1. Document Information

-   **Priority**: High
-   **Timeline**: 1-2 Days
-   **Status**: Scoped
-   **Owner**: AOJ Sr

## 2. Executive Summary

This document outlines the requirements for creating a new API endpoint at `/api/providers/[id]/performance`. This endpoint will serve as the dedicated source for provider-specific performance analytics, leveraging existing database functions to deliver aggregated metrics. It will calculate goal achievement, aggregate production data, and provide variance percentages with flexible time-period filtering.

This is a backend-focused task involving the creation of a new API route and modifications to database queries. An **AI Guardrails Implementation Strategy** will be used to ensure changes are safe, tested, and do not impact existing systems.

## 3. Background and Strategic Fit

The "Providers Main Page" feature requires detailed, location-specific performance data that is not available through existing general-purpose endpoints. To support the rich analytics planned for the frontend, a dedicated, performant API endpoint is necessary. This new endpoint will provide the data foundation for performance charts, goal tracking visualizations, and comparative analytics, directly enabling a core component of the dashboard's value proposition.

## 4. Goals and Success Metrics

### Goals
-   Create a dedicated, performant API endpoint for provider performance metrics.
-   Leverage existing database functions (`getProviderPerformanceByLocation()`) to ensure consistency.
-   Provide flexible filtering by time period (daily, weekly, monthly).
-   Return a clean, well-structured JSON response for easy frontend consumption.

### Success Metrics
-   **API Performance**: Endpoint response time is under 500ms for all queries.
-   **Data Accuracy**: Metrics returned by the API match manual calculations against the database.
-   **Successful Integration**: The new endpoint is successfully consumed by the "Providers Main Page" feature without issues.
-   **Code Quality**: The implementation is well-tested, and new database queries are optimized.

## 5. Detailed Requirements

### Functional Expectations
-   **Endpoint**: A new `GET` endpoint at `/api/providers/[providerId]/performance`.
-   **Calculations**:
    -   Goal achievement percentages.
    -   Location-specific production data aggregation from `dentist_production` and `hygiene_production`.
    -   Variance percentage calculations (leveraging existing functions).
-   **Filtering**: The endpoint must accept a query parameter for the time period (e.g., `?period=monthly`).
-   **Response**: The endpoint will return a formatted JSON object containing all relevant performance metrics.

### Affected Files and Risk Assessment

| File/Path                                                    | Change Type  | Risk Level | Justification                                                                |
| ------------------------------------------------------------ | ------------ | ---------- | ---------------------------------------------------------------------------- |
| `src/app/api/providers/[providerId]/performance/route.ts`    | New File     | **Low**    | New, isolated API route. No risk to existing endpoints.                      |
| `src/lib/database/queries/providers.ts`                      | Modification | **High**   | Modifying/adding data access logic. High risk of performance issues if not optimized. |
| `src/lib/types/providers.ts`                                 | Modification | **Low**    | Adding new type definitions for the API response. Low impact.                |

## 6. AI Guardrails Implementation Strategy

While the number of files is small, the modification of core database queries triggers the need for AI Guardrails.

### File-level Constraints
-   **Session Scope**: Process one file at a time. Start with types, then the database query, then the API route.
-   **Change Size**: Limit changes to a maximum of 20-30 lines per AI request.

### Change Type Isolation
-   **Phase 1: Types & Queries**: Define the response type in `src/lib/types/providers.ts`. Then, create the new database query function in `src/lib/database/queries/providers.ts`.
-   **Phase 2: API Route**: Create the new API route file and implement the endpoint logic.

### Safety Prompts for AI Sessions
-   "Create a new, optimized function in `src/lib/database/queries/providers.ts` to fetch performance metrics. It should use the existing `getProviderPerformanceByLocation` function."
-   "Show me the minimal, targeted changes for adding the performance data types to `src/lib/types/providers.ts`."
-   "Create a new API route `src/app/api/providers/[providerId]/performance/route.ts` that uses the new query and handles errors gracefully."

### Incremental Validation
-   **After Query Creation**: Use `EXPLAIN ANALYZE` on the new query. Add a unit/integration test for the query function to validate its output against mock data.
-   **After API Creation**: Manually test the endpoint with a tool like Postman or `curl`. Test all time period filters and test for a non-existent provider ID to ensure error handling works.

## 7. Implementation Plan

### Phase 1: Database Query and Types
-   **Scope**: Add new types to `src/lib/types/providers.ts` for the performance metrics. Create a new function in `src/lib/database/queries/providers.ts` that calls existing database functions and aggregates data.
-   **Validation**: The new query function is tested, optimized, and returns the correct data structure.

### Phase 2: API Endpoint Implementation
-   **Scope**: Create the new route file at `src/app/api/providers/[providerId]/performance/route.ts`. Implement the `GET` handler, which calls the new database query, handles request parameters (like `period`), and returns a formatted JSON response.
-   **Validation**: The API endpoint is manually tested and returns correct data and status codes for valid requests, invalid requests, and error states.

## 8. Technical Considerations
-   **Reusability**: The core logic should leverage the existing `getProviderPerformanceByLocation()` database function as stated in the Linear issue.
-   **Error Handling**: The API must handle cases where the provider ID does not exist and return a `404 Not Found` error. It should also handle potential database errors gracefully.

## 9. Risks and Mitigation

-   **Risk**: Poor performance of the database query, especially with large datasets.
    -   **Mitigation**: Profile the new query using `EXPLAIN ANALYZE`. Ensure all columns used in `WHERE` clauses and `JOIN`s are properly indexed.
-   **Risk**: Inaccurate metric calculations.
    -   **Mitigation**: Write unit/integration tests for the query function that assert the correctness of the calculations against a known dataset.

## 10. Timeline and Milestones
-   **Total Estimated Time**: 1-2 Days
-   **Day 1**: Completion of Phase 1 (Database Query and Types) and Phase 2 (API Endpoint).
-   **Day 2**: Final testing and documentation.

## 11. Acceptance Criteria
-   A new `GET` endpoint exists at `/api/providers/[providerId]/performance`.
-   The endpoint returns complete performance metrics, including goal achievement and variance.
-   The endpoint supports filtering by time period (daily, weekly, monthly).
-   The endpoint includes proper error handling for missing provider data.
-   The implementation includes tests for the data access logic.

## 12. Linear Metadata

-   **Issue Title**: [AOJ-53] API: Provider Performance Metrics Endpoint
-   **Priority**: High
-   **Labels**: `api`, `backend`, `performance`, `providers`
-   **Complexity**: Medium 