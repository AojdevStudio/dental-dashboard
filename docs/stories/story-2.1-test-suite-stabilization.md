# Story 2.1: Test Suite Stabilization and Reliability

## Status: Draft

## Story

- As a developer working on the dental dashboard MVP
- I want a stable, reliable test suite with 95%+ pass rate
- so that I can develop new features confidently without test failures blocking my progress

## Background Context
**Priority**: P0 - BLOCKING (All development work is impacted)  
**Current Problem**: Test suite has 78% pass rate (16 failing, 14 passing out of 205 tests) with critical environment setup issues  
**Technical Context**: Cloud-first testing architecture with sophisticated multi-tenant setup, but blocking configuration issues prevent reliable execution

## Acceptance Criteria (ACs)

1. **Test Environment Setup Fixed**: All tests pass without `vi is not defined` errors from missing vitest imports
2. **Navigation Mock Consolidation**: Centralized navigation mocks eliminate "Not implemented: navigation" JSDOM errors  
3. **API Integration Stability**: Provider API calls return successful responses during tests (no 500 errors)
4. **Consistent Pass Rate**: Test suite achieves 95%+ pass rate on consecutive runs
5. **Simplified Test Runner**: Remove custom test runner complexity while preserving cloud database validation
6. **Documentation Updated**: Clear test execution guidelines for developers

## Tasks / Subtasks

- [ ] **Fix Critical Test Environment Issues** (AC: 1, 2, 3)
  - [ ] Add missing `import { vi } from 'vitest'` to `src/vitest-setup.integration.ts`
  - [ ] Create centralized `__mocks__/next/navigation.ts` for consistent navigation mocking
  - [ ] Remove duplicate navigation mocks from individual test files (`sidebar.test.tsx`)
  - [ ] Debug environment validation schema conflicts causing API 500 errors
  - [ ] Verify all 205 tests pass consistently

- [ ] **Simplify Test Architecture** (AC: 5)
  - [ ] Replace custom `scripts/utilities/test-runner.js` with direct vitest CLI usage
  - [ ] Preserve essential cloud database connection verification in simplified form
  - [ ] Update package.json test scripts to use direct vitest commands
  - [ ] Maintain environment safety validations without complex wrapper

- [ ] **Unify Environment Validation** (AC: 3, 4) 
  - [ ] Consolidate environment validation logic into single `lib/utils/environment.ts` module
  - [ ] Ensure consistent Zod schemas between test and runtime validation
  - [ ] Update all test setup files to use unified validation approach
  - [ ] Verify API integration tests work with unified validation

- [ ] **Update Documentation and Scripts** (AC: 6)
  - [ ] Update CLAUDE.md with simplified test execution commands
  - [ ] Document the cloud-first testing approach for new developers
  - [ ] Create troubleshooting guide for common test issues
  - [ ] Verify all test commands work as documented

## Dev Notes

### Current Test Architecture Analysis
**Source**: Comprehensive test suite investigation and architecture analysis

**Critical Issues Identified**:
- **Missing Import**: `vitest-setup.integration.ts` uses `vi.mock()` and `vi.setConfig()` without importing `vi` from 'vitest'
- **Navigation Mock Conflicts**: JSDOM environment conflicts with browser navigation APIs, mocks scattered across files
- **API Integration Failures**: Environment validation differences between test and runtime causing 500 errors

**Architecture Strengths to Preserve**:
- Cloud-first testing approach using Supabase branch database (no local dependencies)
- Multi-config strategy: separate vitest configs for unit (JSDOM) vs integration (Node) tests  
- Strong environment isolation preventing production contamination
- Comprehensive environment validation using Zod schemas

**File Locations Based on Project Structure**:
- Test setup files: `src/vitest-setup.ts`, `src/vitest-setup.integration.ts`, `vitest.setup.ts`
- Test configs: `vitest.config.ts`, `vitest.integration.config.ts`
- Custom test runner: `scripts/utilities/test-runner.js` (to be simplified)
- Navigation mocks: Create `__mocks__/next/navigation.ts` (new centralized location)

### Cloud Database Configuration
**Source**: `.env.test` and vitest setup analysis

The project uses cloud-only testing with:
- All tests use cloud Supabase branch database configured in `.env.test`
- No local Supabase dependencies in CI/CD pipeline
- Faster test execution without local database startup/teardown
- Consistent environment between local development and CI

### Testing

Dev Note: Story Requires the following tests:

- [ ] Vitest Unit Tests: (nextToFile: true), coverage requirement: 90%
- [ ] Vitest Integration Test: location: `src/lib/utils/__tests__/environment.test.ts`
- [ ] E2E Test: location: `tests/test-suite-reliability.spec.ts`

Manual Test Steps:
- Run `pnpm test` and verify 95%+ pass rate
- Run `pnpm test:integration` and verify all API tests pass
- Run tests multiple times to confirm consistent results
- Verify simplified test commands work without custom runner

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