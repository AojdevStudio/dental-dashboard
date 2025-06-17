# Wave 2: Test Writing Agent

Create comprehensive failing tests using zen!testgen and up-to-date framework documentation.

**FRESH SESSION REQUIREMENT**
⚠️ This MUST start with a FRESH Claude Code session. Do not continue from Wave 1.

**PREREQUISITE CHECK**

VERIFY Wave 1 completion:
- CHECK `shared/coordination/handoff-signals.json` task_planning_complete is true
- CONFIRM `shared/artifacts/tasks/` contains task files
- READ `shared/coordination/wave1-handoff.md` for context
- VERIFY MCP availability from `shared/coordination/mcp-status.json`

If Wave 1 not complete, EXIT with message: "❌ Wave 1 must complete before starting Wave 2"

**PHASE 1: CONTEXT LOADING & MCP SETUP**

LOAD task planning context from shared artifacts:
- READ `shared/artifacts/prd-summary.json` for feature understanding
- READ `shared/artifacts/tasks/task-dependency-order.json` for execution order
- SCAN all task files in `shared/artifacts/tasks/` to understand scope
- IDENTIFY test frameworks and patterns used in codebase

VERIFY MCP tools for enhanced testing:
- TEST zen availability: "use zen to check system status"
- TEST context7 availability: "use context7 to verify setup"
- DOCUMENT MCP status for this wave

**PHASE 2: TEST STRATEGY PLANNING**

CREATE test strategy at `shared/artifacts/test-strategy.md`:
```markdown
# Test Strategy for {Feature}

## Test Framework Setup
- Primary framework: {detected framework}
- Test file locations: {determined paths}
- Naming conventions: {established patterns}

## Coverage Strategy
- Unit tests for each acceptance criterion
- Integration tests for component interactions
- Edge case tests for error conditions
- Performance tests where specified

## Test Organization
- One test file per task (when appropriate)
- Grouped test suites for related functionality
- Clear test naming for traceability to acceptance criteria

## Mocking Strategy
- External dependencies to mock
- Internal components to isolate
- Data setup requirements
```

**PHASE 3: GENERATE FAILING TESTS WITH MCP ENHANCEMENT**

For each task file in dependency order:

READ task file completely, then:
- IDENTIFY all acceptance criteria
- ANALYZE test scenarios provided
- DETERMINE appropriate test file location

ENHANCED TEST GENERATION with MCP tools:

IF zen MCP available:
- USE `zen!testgen` with task acceptance criteria and edge cases
- PROMPT: "zen!testgen for this task with comprehensive edge cases and error conditions"
- ENHANCE generated tests with framework-specific patterns

IF context7 MCP available:
- GET up-to-date testing documentation: "use context7 for {framework} testing best practices"
- ENSURE test patterns match current framework versions
- VERIFY testing library methods and syntax are current

IF both MCP tools unavailable:
- MANUALLY create comprehensive test files following task specifications
- COVER every acceptance criterion with specific tests
- INCLUDE edge cases and error conditions from task file

MULTI-MODEL VALIDATION (if zen available):
- USE zen for test strategy review: "zen review this test approach for completeness"
- GET different AI perspectives on edge cases and coverage
- LEVERAGE Gemini's thinking for complex test scenarios

Test file naming pattern: 
- `{component}.test.ts` for unit tests
- `{feature}.integration.test.ts` for integration tests
- `{feature}.e2e.test.ts` for end-to-end tests

Each test file MUST include:
```typescript
// Test file header linking to task
/**
 * Tests for: {Task Title}
 * Task file: shared/artifacts/tasks/{task_file}
 * 
 * Acceptance Criteria Coverage:
 * - [ ] AC1: Description of criterion 1
 * - [ ] AC2: Description of criterion 2
 * - [ ] AC3: Description of criterion 3
 */

describe('{Feature/Component}', () => {
  // Setup and teardown
  beforeEach(() => {
    // Test setup
  });

  afterEach(() => {
    // Test cleanup
  });

  // Tests for each acceptance criterion
  describe('Acceptance Criterion 1', () => {
    it('should handle happy path scenario', () => {
      // Failing test - no implementation yet
      expect(implementedFunction()).toBe(expectedResult);
    });

    it('should handle edge case scenario', () => {
      // Failing test for edge case
      expect(implementedFunction(edgeInput)).toBe(expectedEdgeResult);
    });
  });

  // Error condition tests
  describe('Error Handling', () => {
    it('should throw appropriate error for invalid input', () => {
      expect(() => implementedFunction(invalidInput))
        .toThrow('Expected error message');
    });
  });
});
```

**PHASE 4: TEST VERIFICATION (RED PHASE)**

CRITICAL: Verify all tests fail as expected:
- RUN `pnpm test` or equivalent test command
- CONFIRM all new tests fail (RED phase of TDD)
- DOCUMENT failing test count and reasons in `shared/artifacts/test-verification.md`

If tests pass unexpectedly:
- INVESTIGATE why (implementation already exists?)
- ADJUST tests to ensure they fail appropriately
- DOCUMENT findings for Code Writer

**PHASE 5: TEST DOCUMENTATION**

CREATE comprehensive test documentation at `shared/artifacts/tests/test-coverage-report.md`:
```markdown
# Test Coverage Report

## Tests Created
- {X} unit test files
- {Y} integration test files  
- {Z} end-to-end test files

## Coverage by Task
| Task | Test File | Acceptance Criteria Covered | Status |
|------|-----------|------------------------------|---------|
| task1 | component1.test.ts | 5/5 | ✅ All failing |
| task2 | component2.test.ts | 3/3 | ✅ All failing |

## Red Phase Verification
- Total tests: {count}
- All tests failing: ✅
- Test command: `{command used}`
- Verification timestamp: {timestamp}

## Notes for Code Writer
- Key test patterns established
- Mock requirements identified
- Performance test expectations
- Integration points to implement
```

**PHASE 6: HANDOFF PREPARATION & CONTEXT MANAGEMENT**

UPDATE coordination files:
- SET `shared/coordination/wave-status.json` current_wave to 2
- SET `shared/coordination/handoff-signals.json` test_writing_complete to true
- CREATE `shared/coordination/wave2-handoff.md` with:
  - Summary of tests created
  - Red phase verification results
  - Key implementation guidance for Code Writer
  - Test execution commands
  - Mock setup requirements
  - MCP tool recommendations for implementation

PREPARE for fresh session handoff:
- RUN `/compact preserve test strategy, red phase verification, and implementation guidance`
- ENSURE all test files and documentation are in shared/ directory
- DOCUMENT MCP tool usage patterns for next wave
- CLEAR context to prepare for Wave 3 fresh session

**PHASE 7: FINAL VERIFICATION**

VERIFY deliverables:
- ALL tests fail when run
- TEST files exist for each task
- COVERAGE report is complete
- HANDOFF documentation is clear

OUTPUT completion message:
```
✅ Wave 2 Complete: Test Writing  
🔴 {X} failing tests created (RED phase confirmed)
📊 Coverage: {Y} tasks, {Z} acceptance criteria
🧪 Test command: pnpm test
🤖 MCP Enhancement: zen!testgen + context7 integration
🧹 Context compacted for handoff

⚠️  CRITICAL: Start Wave 3 with FRESH SESSION
cd ../wave3-code-writing
claude  # NEW session - do not continue this one!
/project:wave3-code-writing
```