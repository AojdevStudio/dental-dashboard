# Task: Migrate Server Component Tests to Playwright MCP

## Description
Systematically migrate failing Server Component tests from Vitest to Playwright MCP. This involves rewriting tests to use E2E testing patterns, implementing proper async handling, and ensuring tests validate the same functionality in a browser environment.

## Dependencies
- test-suite-modernization_test-categorization-audit.md
- test-suite-modernization_e2e-test-utilities.md

## Acceptance Criteria
- [ ] Migrate first batch of 10-15 Server Component tests
- [ ] Implement E2E testing patterns for async components
- [ ] Ensure migrated tests pass consistently
- [ ] Maintain test coverage for migrated components
- [ ] Update test file organization
- [ ] Remove or skip old failing Vitest tests

## Technical Requirements
- Implementation approach: Incremental migration with validation
- Performance constraints: Migrated tests should run efficiently
- Security considerations: Preserve security test scenarios

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Migrated tests passing at 95%+ rate
- [ ] No regression in test coverage
- [ ] Code review completed
- [ ] Test execution time acceptable

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Async data fetching in Server Components
- Server-side rendering validation
- Error boundary testing
- Loading state verification
- Multi-tenant data isolation

## Implementation Notes
- Follow migration pattern from PRD:
  ```typescript
  // From: Vitest with async issues
  // To: Playwright MCP with browser testing
  ```
- Use established E2E utilities
- Group related tests together
- Implement proper test isolation
- Maximum 2-3 test files per session
- Each test file ~50-100 lines