# Task: Update Vitest Configuration for Hybrid Approach

## Description
Modify vitest.config.ts and vitest.integration.config.ts to properly exclude Server Component tests and optimize for the hybrid testing approach. Configure test exclusion patterns, update test environment settings, and ensure smooth integration with Playwright MCP tests.

## Dependencies
- test-suite-modernization_migrate-server-component-tests.md

## Acceptance Criteria
- [ ] Update vitest.config.ts to exclude Server Component test patterns
- [ ] Configure proper test file glob patterns
- [ ] Update test environment configuration
- [ ] Optimize test execution settings
- [ ] Add clear comments explaining exclusions
- [ ] Ensure remaining Vitest tests pass

## Technical Requirements
- Implementation approach: Careful configuration updates with validation
- Performance constraints: Optimize for faster test execution
- Security considerations: Maintain test isolation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Vitest tests run without Server Component failures
- [ ] Configuration validates without errors
- [ ] Test execution time improved
- [ ] Documentation updated

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Verify excluded tests are not executed
- Ensure included tests run correctly
- Validate configuration syntax
- Test parallel execution settings
- Check coverage reporting still works

## Implementation Notes
- Add exclusion patterns for Server Component tests:
  ```typescript
  exclude: [
    '**/server-components/**',
    '**/*.server.test.tsx'
  ]
  ```
- Update test environment settings
- Configure reporters for better output
- Maximum changes: 20-30 lines
- HIGH RISK: Test thoroughly after changes