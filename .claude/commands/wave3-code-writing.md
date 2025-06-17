# Wave 3: Code Writing Agent

Implement production code to make failing tests pass, completing the TDD cycle.

**FRESH SESSION REQUIREMENT**
⚠️ This MUST start with a FRESH Claude Code session. Do not continue from Wave 2.

**PREREQUISITE CHECK**

VERIFY Wave 2 completion:
- CHECK `shared/coordination/handoff-signals.json` test_writing_complete is true
- CONFIRM failing tests exist and red phase verified
- READ `shared/coordination/wave2-handoff.md` for implementation guidance
- VERIFY MCP availability from previous waves

If Wave 2 not complete, EXIT with message: "❌ Wave 2 must complete before starting Wave 3"

**PHASE 1: IMPLEMENTATION STRATEGY WITH MCP ENHANCEMENT**

ANALYZE test requirements:
- RUN `pnpm test` to see current failing state
- READ `shared/artifacts/tests/test-coverage-report.md` for test overview
- SCAN test files to understand expected interfaces and behavior
- REVIEW `shared/artifacts/tasks/task-dependency-order.json` for implementation order

SETUP MCP tools for enhanced implementation:
- VERIFY zen availability: "use zen to check system status"
- VERIFY context7 availability: "use context7 to verify documentation access"
- PREPARE for up-to-date implementation patterns and continuous review

CREATE implementation plan at `shared/artifacts/code/implementation-plan.md`:
```markdown
# Implementation Plan

## Current State
- Total failing tests: {count}
- Test categories: {unit/integration/e2e counts}
- Implementation order: {based on task dependencies}

## Implementation Strategy
1. Start with foundation tasks (no dependencies)
2. Implement minimal code to pass tests
3. Refactor for quality after green phase
4. Verify integration points

## File Creation Plan
- New files to create: {list}
- Existing files to modify: {list}  
- Dependencies to install: {list}

## Risk Areas
- Complex integration points
- Performance requirements
- Security considerations
```

**PHASE 2: SYSTEMATIC IMPLEMENTATION WITH MCP ENHANCEMENT**

Follow task dependency order from Wave 1:

For each task in `shared/artifacts/tasks/task-dependency-order.json`:

1. **READ task specification completely**
   - Review acceptance criteria
   - Understand technical requirements
   - Note implementation suggestions

2. **IDENTIFY failing tests for this task**
   - Find corresponding test files
   - Run specific test subset: `pnpm test {test-pattern}`
   - Analyze failure messages

3. **IMPLEMENT WITH UP-TO-DATE PATTERNS**
   - USE context7 for current framework documentation: "use context7 for {framework} implementation patterns"
   - GET latest best practices: "use context7 for {library} current version patterns"
   - IMPLEMENT minimal code following current standards
   - DOCUMENT implementation decisions

4. **CONTINUOUS QUALITY ASSURANCE WITH ZEN**
   - REVIEW implementation approach: "zen review this implementation strategy"
   - GET multi-model perspective: "zen use Gemini for deep analysis of this logic"
   - VALIDATE complex algorithms: "zen use O3 for debugging this approach"

5. **VERIFY GREEN PHASE**
   - Run tests for this task: `pnpm test {test-pattern}`
   - Confirm all task tests pass
   - Document any test modifications needed

6. **INTEGRATION CHECK WITH ZEN REVIEW**
   - Run full test suite: `pnpm test`
   - USE zen for integration validation: "zen!codereview integration points"
   - Fix any integration issues with MCP assistance

Example enhanced implementation cycle:
```typescript
// 1. Read failing test
test('should calculate total price with tax', () => {
  const calculator = new PriceCalculator();
  expect(calculator.calculateTotal(100, 0.08)).toBe(108);
});

// 2. Get current patterns with context7
// "use context7 for TypeScript class implementation best practices"

// 3. Implement with zen review
// "zen review this implementation approach before I code it"
export class PriceCalculator {
  calculateTotal(price: number, taxRate: number): number {
    return price + (price * taxRate);
  }
}

// 4. Zen validation
// "zen!codereview this implementation for edge cases and improvements"
```

**PHASE 3: QUALITY REFINEMENT WITH ZEN REVIEW**

After all tests pass, improve code quality with MCP assistance:

- **COMPREHENSIVE CODE REVIEW with zen**
  - RUN `zen!codereview` for comprehensive analysis
  - GET severity-based issue prioritization
  - ADDRESS critical and high-priority issues
  - LEVERAGE multi-model perspectives for complex refactoring decisions

- **REFACTOR with up-to-date patterns**
  - USE context7 for latest refactoring patterns: "use context7 for {framework} refactoring best practices"
  - EXTRACT common patterns with zen guidance
  - IMPROVE naming and structure with multi-AI perspective
  - ADD proper error handling following current standards

- **ENHANCED DOCUMENTATION with context7**
  - GET current documentation standards: "use context7 for JSDoc best practices"
  - GENERATE comprehensive JSDoc with zen assistance:
```typescript
/**
 * Calculates the total price including tax
 * @param price - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price including tax
 * @throws {Error} If price is negative or taxRate is invalid
 */
calculateTotal(price: number, taxRate: number): number {
  // Implementation with zen-reviewed error handling
}
```

- **PERFORMANCE & SECURITY with multi-model analysis**
  - USE zen for performance analysis if requirements specify
  - LEVERAGE Gemini's deep thinking for security considerations
  - OPTIMIZE with O3's logical reasoning for complex algorithms

**PHASE 4: FINAL VERIFICATION**

COMPREHENSIVE testing and validation:

1. **RUN complete test suite**
   ```bash
   pnpm test
   pnpm test:coverage  # if available
   pnpm lint
   pnpm typecheck
   ```

2. **VERIFY all acceptance criteria met**
   - Cross-reference with original task files
   - Confirm each acceptance criterion has passing test
   - Document any deviations with justification

3. **INTEGRATION testing**
   - Test feature end-to-end if possible
   - Verify with existing application flow
   - Check for performance regressions

4. **CODE quality checks**
   - Ensure consistent with codebase patterns
   - Verify proper error handling
   - Confirm security best practices

**PHASE 5: IMPLEMENTATION REPORT**

CREATE comprehensive report at `shared/reports/final-tdd-report.md`:
```markdown
# TDD Implementation Report: {Feature Name}

## Executive Summary
- Feature: {name}
- Tasks completed: {X}/{Y}
- Tests passing: {A}/{B}
- Implementation time: {duration}
- Quality gates: ✅ All passed

## Implementation Details

### Tasks Completed
| Task | Files Modified | Tests Passing | Acceptance Criteria Met |
|------|----------------|---------------|------------------------|
| task1 | file1.ts, file2.ts | 5/5 | ✅ 3/3 |
| task2 | file3.ts | 3/3 | ✅ 2/2 |

### Code Changes Summary
- Files created: {list}
- Files modified: {list}
- Lines of code added: {count}
- Test coverage: {percentage}

### Quality Metrics
- All tests passing: ✅
- Lint checks: ✅  
- Type checking: ✅
- Performance requirements: ✅
- Security requirements: ✅

### Technical Decisions
- Key architectural choices made
- Trade-offs and rationale
- Areas for future improvement

### Integration Points
- External dependencies added
- API integrations completed
- Database schema changes (if any)

## Recommendations for Merge
1. Code review focus areas
2. Deployment considerations
3. Monitoring requirements
4. Documentation updates needed
```

**PHASE 6: HANDOFF PREPARATION & CONTEXT MANAGEMENT**

UPDATE coordination files:
- SET `shared/coordination/wave-status.json` current_wave to 3, completed_waves to [1,2,3]
- SET `shared/coordination/handoff-signals.json` code_writing_complete to true
- CREATE `shared/coordination/wave3-completion.md` with:
  - Implementation summary and key decisions
  - Zen code review results and addressed issues
  - Merge readiness checklist
  - Areas requiring final quality review

PREPARE for optional Wave 4 (Quality Review):
- RUN `/compact preserve implementation notes, key architectural decisions, and quality improvements`
- DOCUMENT all worktree artifacts to preserve
- PREPARE for comprehensive quality review with zen!codereview
- CLEAN context for final review session

**PHASE 7: COMPLETION VERIFICATION**

FINAL verification checklist:
- [ ] All original acceptance criteria met
- [ ] Complete test suite passing
- [ ] No regressions introduced  
- [ ] Code quality standards met
- [ ] Documentation updated
- [ ] Implementation report complete

OUTPUT completion message:
```
✅ Wave 3 Complete: Code Writing
🟢 All tests passing (GREEN phase confirmed)
📊 {X} tasks completed, {Y} acceptance criteria met
🤖 MCP Enhancement: context7 + zen!codereview integration
🧹 Context compacted for handoff

🔄 OPTIONAL: Wave 4 Quality Review (Recommended)
cd ../../
claude  # NEW session for comprehensive review!
/project:quality-review

OR proceed to cleanup:
claude /project:cleanup-agentic-tdd {feature-name}
```