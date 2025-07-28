# Story 1.2: Secure Provider Performance Query Implementation

## Status: Draft

## Story

- As a **Backend Developer**
- I want to **replace the unsafe SQL queries in `getProviderPerformanceByLocation` with secure Prisma queries**
- so that **the application is protected from SQL injection attacks**

## Acceptance Criteria (ACs)

- AC1: Replace `$queryRawUnsafe` calls on lines 377-392 with secure alternatives
- AC2: Implement parameterized queries using Prisma's `$queryRaw` with tagged templates or native query builder
- AC3: Maintain exact same output format and data structure as current implementation
- AC4: Preserve all existing filtering logic (providerId, locationId, clinicId, dateRange, providerType)
- AC5: Ensure dentist and hygienist performance calculations remain accurate
- AC6: Validate that location-specific production calculations (Humble vs Baytown) work correctly
- AC7: Maintain performance characteristics comparable to current raw SQL queries

## Tasks / Subtasks

- [ ] Task 1: Implement secure dentist performance query (AC1, AC2, AC5, AC6)
  - [ ] Replace `$queryRawUnsafe` with `$queryRaw` using tagged templates
  - [ ] Implement parameterized query for dentist production calculations
  - [ ] Preserve location-specific logic (Humble vs Baytown production fields)
  - [ ] Maintain aggregation functions (SUM, AVG, COUNT) with proper grouping
- [ ] Task 2: Implement secure hygienist performance query (AC1, AC2, AC5)
  - [ ] Replace `$queryRawUnsafe` with secure parameterized alternative
  - [ ] Implement hygienist production query with proper parameter binding
  - [ ] Preserve production calculation logic and goal comparisons
  - [ ] Maintain date range filtering with secure parameter handling
- [ ] Task 3: Preserve functionality and output format (AC3, AC4)
  - [ ] Ensure `RawDentistPerformanceRow` interface compatibility
  - [ ] Ensure `RawHygienistPerformanceRow` interface compatibility
  - [ ] Maintain all query parameters (providerId, locationId, clinicId, dates, providerType)
  - [ ] Preserve result transformation logic in `getProviderPerformanceByLocation`
- [ ] Task 4: Performance validation and optimization (AC7)
  - [ ] Benchmark query execution time before and after changes
  - [ ] Optimize parameterized queries if performance degrades
  - [ ] Validate query plans are efficient with new implementation
  - [ ] Test with representative data volumes

## Dev Notes

**Critical Implementation Details:**
- Current vulnerable code: Lines 377-392 in `/src/lib/database/queries/providers.ts`
- Must preserve exact business logic for dental practice KPI calculations
- Location-specific fields: `verified_production_humble` vs `verified_production_baytown`
- Return format must match existing `ProviderPerformanceMetrics[]` interface

**Prisma Security Patterns:**
Use tagged template literals: `prisma.$queryRaw\`SELECT * FROM table WHERE id = ${userId}\``
Or use Prisma query builder where possible for complex aggregations

**Source Tree Context:**
- Function: `getProviderPerformanceByLocation` 
- Interfaces: `RawDentistPerformanceRow`, `RawHygienistPerformanceRow`
- Related API: Provider performance endpoints
- Database tables: `providers`, `dentist_production`, `hygiene_production`, `locations`

### Testing

Dev Note: Story Requires the following tests:

- [ ] Jest Unit Tests: (nextToFile: true), coverage requirement: 90%
- [ ] Jest with in memory db Integration Test: location: `/tests/providers/secure-performance-queries.test.ts`
- [ ] Security validation tests for parameter injection attempts

Manual Test Steps:
- Run provider performance API endpoints with various parameter combinations
- Validate output matches original format exactly
- Test with production-like data volumes for performance comparison
- Attempt SQL injection with malicious parameters to confirm protection

## Dev Agent Record

### Agent Model Used: {{Agent Model Name/Version}}

### Debug Log References

[[LLM: (Dev Agent) If the debug is logged to during the current story progress, create a table with the debug log and the specific task section in the debug log - do not repeat all the details in the story]]

### Completion Notes List

[[LLM: (Dev Agent) Anything the SM needs to know that deviated from the story that might impact drafting the next story.]]

### Change Log

[[LLM: (Dev Agent) Track document versions and changes during development that deviate from story dev start]]

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |