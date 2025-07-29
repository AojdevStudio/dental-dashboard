# Task: Audit and Categorize Failing Tests

## Description
Perform comprehensive audit of all failing tests to categorize them by component type (Server Components vs Client Components vs Business Logic). Create a migration plan identifying which tests need to move to Playwright MCP and which can remain in Vitest.

## Dependencies
- test-suite-modernization_e2e-test-utilities.md
- test-suite-modernization_package-dependencies.md

## Acceptance Criteria
- [ ] Analyze all 115 failing tests and identify root causes
- [ ] Categorize tests into: Server Components, Client Components, Business Logic
- [ ] Create migration checklist for Server Component tests
- [ ] Document patterns of test failures
- [ ] Identify tests that can be fixed in Vitest
- [ ] Generate test migration priority list

## Technical Requirements
- Implementation approach: Systematic analysis of test failures
- Performance constraints: Complete audit efficiently
- Security considerations: Identify any security-related test failures

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Complete categorization spreadsheet created
- [ ] Migration plan documented
- [ ] Priority list established
- [ ] Patterns documented for future reference

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Server Component async operation failures
- Client Component rendering issues
- Business logic test failures
- Integration test categorization
- Mock/stub related failures

## Implementation Notes
- Create a structured document with test categorization
- Use clear criteria for determining test type:
  - Async Server Components → Playwright MCP
  - Sync Client Components → Vitest
  - Pure functions → Vitest
  - Full user flows → Playwright MCP
- Document common failure patterns
- Estimate migration effort for each category