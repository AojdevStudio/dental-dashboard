# Verify Wave

Check completion status and readiness for next wave in agentic TDD workflow.

## Variables
WAVE_NUMBER: $ARGUMENTS

**WAVE STATUS CHECK**

READ current status:
- LOAD `shared/coordination/wave-status.json`
- LOAD `shared/coordination/handoff-signals.json` 
- LOAD `shared/coordination/verification-results.json`

**WAVE-SPECIFIC VERIFICATION**

IF WAVE_NUMBER = 1 (Task Planning):
- VERIFY `shared/artifacts/prd-summary.json` exists and has required fields
- COUNT task files in `shared/artifacts/tasks/`
- CHECK `shared/artifacts/tasks/task-dependency-order.json` exists
- VERIFY `shared/coordination/wave1-handoff.md` exists
- CHECK MCP status documentation in handoff
- RUN validation: Each task file has title, description, dependencies, acceptance_criteria, definition_of_done

IF WAVE_NUMBER = 2 (Test Writing):  
- VERIFY `shared/coordination/handoff-signals.json` task_planning_complete = true
- COUNT test files created
- RUN `pnpm test` and verify tests fail (RED phase)
- CHECK `shared/artifacts/tests/test-coverage-report.md` exists
- VERIFY `shared/coordination/wave2-handoff.md` exists
- VALIDATE test files reference task acceptance criteria
- CHECK MCP usage documentation:
  - zen!testgen usage notes
  - context7 framework integration details

IF WAVE_NUMBER = 3 (Code Writing):
- VERIFY `shared/coordination/handoff-signals.json` test_writing_complete = true  
- RUN `pnpm test` and verify tests pass (GREEN phase)
- CHECK `shared/reports/final-tdd-report.md` exists
- VERIFY `shared/coordination/wave3-completion.md` exists
- RUN quality checks: `pnpm lint`, `pnpm typecheck` (if available)
- CHECK MCP usage documentation:
  - context7 pattern usage notes
  - zen!codereview integration results

IF WAVE_NUMBER = 4 (Quality Review):
- VERIFY `shared/coordination/handoff-signals.json` code_writing_complete = true
- CHECK `shared/reports/quality-assurance-report.md` exists
- VERIFY comprehensive zen!codereview results documented
- VALIDATE multi-model analysis completion (Gemini + O3)
- RUN final quality gates: tests, lint, typecheck, security
- CHECK quality score and issue resolution status
- VERIFY deployment readiness checklist completion

**UPDATE VERIFICATION RESULTS**

UPDATE `shared/coordination/verification-results.json` with results:
```json
{
  "wave1": {
    "verified": true/false,
    "timestamp": "ISO timestamp",
    "issues": ["list of any issues found"],
    "artifacts_verified": ["list of artifacts checked"],
    "mcp_status": {"context7": "available/unavailable", "zen": "available/unavailable"},
    "ready_for_next_wave": true/false
  },
  "wave2": {
    "verified": true/false,
    "timestamp": "ISO timestamp", 
    "issues": ["list of any issues found"],
    "artifacts_verified": ["list of artifacts checked"],
    "mcp_usage": {"zen_testgen": "used/unused", "context7_frameworks": "used/unused"},
    "red_phase_confirmed": true/false,
    "ready_for_next_wave": true/false
  },
  "wave3": {
    "verified": true/false,
    "timestamp": "ISO timestamp",
    "issues": ["list of any issues found"], 
    "artifacts_verified": ["list of artifacts checked"],
    "mcp_usage": {"context7_patterns": "used/unused", "zen_review": "used/unused"},
    "green_phase_confirmed": true/false,
    "ready_for_next_wave": true/false
  },
  "wave4": {
    "verified": true/false,
    "timestamp": "ISO timestamp",
    "issues": ["list of any issues found"],
    "artifacts_verified": ["list of artifacts checked"],
    "quality_score": "score/100",
    "zen_comprehensive_review": "complete/incomplete",
    "multi_model_analysis": "complete/incomplete",
    "deployment_ready": true/false
  }
}
```

**OUTPUT VERIFICATION REPORT**

DISPLAY verification status:
```
🔍 Wave {WAVE_NUMBER} Verification Report

Status: ✅ PASSED / ❌ FAILED
Artifacts checked: {count}
Issues found: {count}
MCP Integration: {context7 status} + {zen status}

{Detailed breakdown of checks}

{If Wave 2 or 3, include MCP usage summary}
🤖 MCP Tool Usage:
- Context7: {usage details}
- Zen: {usage details}

{If Wave 4, include quality metrics}
📊 Quality Metrics:
- Quality Score: {score}/100
- Critical Issues: {count} resolved
- Multi-model Analysis: Complete

{If passed}:
✅ Wave {WAVE_NUMBER} ready for handoff
{If not final wave}:
Next: cd trees/wave{WAVE_NUMBER+1}-{name}/ && claude  # Fresh session!
{If Wave 3 complete}:
Optional: claude /project:quality-review  # Fresh session!
OR: claude /project:cleanup-agentic-tdd {feature-name}
{If Wave 4 complete}:
Next: claude /project:cleanup-agentic-tdd {feature-name}

{If failed}:
❌ Issues must be resolved before proceeding
{List specific issues and remediation steps}
⚠️  Remember: Use fresh Claude sessions between waves
```