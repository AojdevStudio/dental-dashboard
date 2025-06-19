# Wave 3: Code Writing Agent

Implement production code to make failing tests pass, completing the TDD cycle.

**FRESH SESSION REQUIREMENT**
⚠️ This MUST start with a FRESH Claude Code session. Do not continue from Wave 2.

**CRITICAL**: This wave MUST create final reports in the `shared/` directory for Wave 4 to function.

**PREREQUISITE CHECK**

VERIFY Wave 2 completion:
- CHECK `shared/coordination/handoff-signals.json` test_writing_complete is true
- CONFIRM failing tests exist and red phase verified
- READ `shared/coordination/wave2-handoff.md` for implementation guidance
- VERIFY MCP availability from previous waves

If Wave 2 not complete, EXIT with message: "❌ Wave 2 must complete before starting Wave 3"

**SHARED DIRECTORY REMINDER**
⚠️ **CRITICAL**: All reports and coordination files MUST be written to the `shared/` directory.
- Reports go in: `shared/reports/`
- Coordination goes in: `shared/coordination/`
- Artifacts go in: `shared/artifacts/`

VERIFY shared directory access:
- RUN `ls -la shared/` to confirm directory exists
- RUN `touch shared/reports/wave3-test.txt && rm shared/reports/wave3-test.txt` to verify write access

**PHASE 1: IMPLEMENTATION STRATEGY WITH MCP ENHANCEMENT**

ANALYZE test requirements:
- RUN `pnpm test` to see current failing state
- READ `shared/artifacts/tests/test-coverage-report.md` for test overview
- SCAN test files to understand expected interfaces and behavior
- REVIEW `shared/artifacts/tasks/task-dependency-order.json` for implementation order

SETUP MCP tools for enhanced implementation:
- VERIFY zen availability: "use zen to check system status"
- VERIFY context7 availability: "use context7 to verify setup"
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
   - USE context7 for current framework documentation
   - GET latest best practices for framework/library
   - IMPLEMENT minimal code following current standards
   - DOCUMENT implementation decisions

4. **CONTINUOUS QUALITY ASSURANCE WITH ZEN**
   - REVIEW implementation approach with zen
   - GET multi-model perspective for complex logic
   - VALIDATE algorithms and edge cases

5. **VERIFY GREEN PHASE**
   - Run tests for this task: `pnpm test {test-pattern}`
   - Confirm all task tests pass
   - Document any test modifications needed

6. **INTEGRATION CHECK**
   - Run full test suite: `pnpm test`
   - Fix any integration issues
   - USE zen for integration validation if needed

**PHASE 3: QUALITY REFINEMENT WITH ZEN REVIEW**

After all tests pass, improve code quality with MCP assistance:

- **COMPREHENSIVE CODE REVIEW with zen**
  - RUN `zen!codereview` for comprehensive analysis
  - ADDRESS critical and high-priority issues
  - LEVERAGE multi-model perspectives for complex refactoring

- **REFACTOR with up-to-date patterns**
  - USE context7 for latest refactoring patterns
  - EXTRACT common patterns with zen guidance
  - IMPROVE naming and structure
  - ADD proper error handling

- **ENHANCED DOCUMENTATION**
  - GET current documentation standards with context7
  - GENERATE comprehensive documentation with zen assistance

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

**PHASE 5: MANDATORY REPORT CREATION**

⚠️ **CRITICAL PHASE**: These reports are REQUIRED for Wave 4 and cleanup to function.

**STEP 5A: Create Final TDD Report (MANDATORY)**

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

## MCP Enhancement Summary
- Context7 usage: {framework documentation accessed}
- Zen review sessions: {number and focus areas}
- Multi-model validation: {complex decisions validated}

## Recommendations for Merge
1. Code review focus areas
2. Deployment considerations
3. Monitoring requirements
4. Documentation updates needed

## Implementation Artifacts
- Implementation plan: shared/artifacts/code/implementation-plan.md
- Task completion status: See task files in shared/artifacts/tasks/
- Test results: All {X} tests passing
- Code quality: zen!codereview completed with {score}/100

## Ready for Quality Review
This implementation is ready for Wave 4 Quality Review or final cleanup.
All acceptance criteria met, tests passing, and code quality validated.
```

**STEP 5B: Update Coordination Files (MANDATORY)**

UPDATE `shared/coordination/wave-status.json`:
```json
{
  "feature_name": "{FEATURE_NAME}",
  "current_wave": "3",
  "wave1_complete": true,
  "wave2_complete": true,
  "wave3_complete": true,
  "completed_at": "{current_timestamp}",
  "final_report_created": true
}
```

UPDATE `shared/coordination/handoff-signals.json`:
```json
{
  "task_planning_complete": true,
  "test_writing_complete": true,
  "code_writing_complete": true,
  "final_report_ready": true,
  "wave3_artifacts": {
    "final_report": "shared/reports/final-tdd-report.md",
    "implementation_plan": "shared/artifacts/code/implementation-plan.md",
    "tests_passing": true,
    "quality_gates": "passed"
  }
}
```

CREATE `shared/coordination/wave3-completion.md`:
```markdown
# Wave 3 Completion Summary

## Implementation Status
- ✅ All tests passing (GREEN phase confirmed)
- ✅ All acceptance criteria met
- ✅ Code quality review completed
- ✅ Final report created

## Key Implementation Decisions
- {List major architectural or technical decisions made}
- {Document any deviations from original plan}
- {Note areas requiring special attention in review}

## MCP Tool Usage
- Context7: {frameworks/libraries researched}
- Zen: {number of review sessions, key findings}
- Multi-model: {complex decisions requiring multiple AI perspectives}

## Quality Metrics
- Test coverage: {percentage}
- Lint score: {clean/issues}
- Type safety: {status}
- Performance: {meets requirements}

## Next Steps
Ready for:
- ✅ Wave 4 Quality Review (recommended)
- ✅ Direct cleanup and merge
- ✅ Team code review

All required artifacts created in shared/ directory.
```

**STEP 5C: Verify Report Creation (MANDATORY)**

VERIFY all reports were created correctly:
```bash
# Verify final report exists and has content
ls -la shared/reports/final-tdd-report.md
wc -l shared/reports/final-tdd-report.md  # Should be substantial

# Verify coordination files updated
cat shared/coordination/wave-status.json | grep "wave3_complete"
cat shared/coordination/handoff-signals.json | grep "code_writing_complete"

# Verify completion summary exists
ls -la shared/coordination/wave3-completion.md
```

If any file is missing or empty:
⚠️ **STOP AND FIX**: Wave 4 and cleanup depend on these files existing.

**PHASE 6: COMPLETION VERIFICATION & HANDOFF**

FINAL verification checklist:
- [ ] All original acceptance criteria met
- [ ] Complete test suite passing
- [ ] No regressions introduced  
- [ ] Code quality standards met
- [ ] Documentation updated
- [ ] **CRITICAL**: Final report created at `shared/reports/final-tdd-report.md`
- [ ] **CRITICAL**: Coordination files updated in `shared/coordination/`
- [ ] **CRITICAL**: Wave 3 completion summary created

VERIFY shared directory state:
```bash
echo "=== SHARED DIRECTORY VERIFICATION ==="
find shared/ -type f -name "*.md" -o -name "*.json" | sort
echo ""
echo "=== REQUIRED FILES CHECK ==="
test -f shared/reports/final-tdd-report.md && echo "✅ Final report exists" || echo "❌ Final report MISSING"
test -f shared/coordination/wave3-completion.md && echo "✅ Completion summary exists" || echo "❌ Completion summary MISSING"
grep -q "code_writing_complete.*true" shared/coordination/handoff-signals.json && echo "✅ Handoff signal set" || echo "❌ Handoff signal MISSING"
```

OUTPUT completion message:
```
✅ Wave 3 Complete: Code Writing
🟢 All tests passing (GREEN phase confirmed)
📊 {X} tasks completed, {Y} acceptance criteria met
🤖 MCP Enhancement: context7 + zen!codereview integration
📋 Reports created in shared/reports/
🔄 Coordination files updated in shared/coordination/

✅ CRITICAL: All required files created for next phase
   - shared/reports/final-tdd-report.md
   - shared/coordination/wave3-completion.md
   - shared/coordination/handoff-signals.json (updated)

🔄 NEXT STEPS:
Option A - Quality Review (Recommended):
  cd ../../
  claude  # NEW session for comprehensive review!
  /project:quality-review

Option B - Direct Cleanup:
  cd ../../
  claude /project:cleanup-agentic-tdd {feature-name}
```

**TROUBLESHOOTING REPORT ISSUES**

If reports aren't being created in shared/:
1. Verify you're in the correct worktree: `pwd` should show `trees/code-writer`
2. Verify shared symlink: `ls -la shared` should show symlink to `../../shared`
3. Test shared write access: `echo "test" > shared/test.txt && rm shared/test.txt`
4. Use absolute paths if needed: `shared/reports/final-tdd-report.md`

If Claude Code tries to write reports in wrong location:
1. Explicitly state: "Write this file to the shared directory: shared/reports/filename.md"
2. Verify after creation: `ls -la shared/reports/`
3. Move if misplaced: `mv ./report.md shared/reports/`