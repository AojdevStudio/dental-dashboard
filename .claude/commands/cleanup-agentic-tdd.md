# Cleanup Agentic TDD

Merge completed TDD workflow results and cleanup infrastructure.

## Variables
FEATURE_NAME: $ARGUMENTS

**PREREQUISITE VERIFICATION**

VERIFY all waves completed:
- CHECK `shared/coordination/handoff-signals.json` for completion flags
- VERIFY `shared/reports/final-tdd-report.md` exists
- CHECK if `shared/reports/quality-assurance-report.md` exists (Wave 4 optional)
- RUN final test verification: `cd trees/wave3-code-writing && pnpm test`

DETERMINE workflow completion level:
- 3-Wave completion: Task Planning → Test Writing → Code Writing
- 4-Wave completion: All above + Quality Review (recommended)

If core waves incomplete, EXIT with message: "❌ Core waves (1-3) must complete before cleanup"

**FINAL INTEGRATION TEST**

PREPARE main branch for merge:
- RUN `git checkout main && git pull origin main`
- CREATE integration branch: `git checkout -b feature/FEATURE_NAME-agentic-tdd`

COPY artifacts systematically:
- COPY task documentation: `cp -r shared/artifacts/tasks/* ./docs/tasks/` (create dir if needed)
- COPY test files to appropriate locations based on codebase structure
- COPY production code from wave3 worktree to main codebase
- COPY final report: `cp shared/reports/final-tdd-report.md ./docs/features/`

VERIFY integration:
- RUN `pnpm install` (in case of new dependencies)
- RUN `pnpm test` (all tests should pass)
- RUN `pnpm lint` (code should be clean) 
- RUN `pnpm typecheck` (types should be valid)

**CREATE COMPREHENSIVE COMMIT**

STAGE all changes:
- RUN `git add .`

CREATE structured commit message:
```
feat(FEATURE_NAME): implement via enhanced agentic TDD workflow

Completed {3 or 4}-wave agentic TDD implementation with MCP enhancement:

Wave 1 - Task Planning:
- Decomposed PRD into {X} atomic tasks
- Established dependency ordering
- Created comprehensive acceptance criteria

Wave 2 - Test Writing (zen!testgen + context7):
- Generated {Y} failing tests with zen!testgen
- Enhanced with context7 framework documentation
- Verified proper test failure (RED phase)
- Covered {Z} acceptance criteria

Wave 3 - Code Writing (context7 + zen review):
- Implemented with context7 current patterns
- Continuous zen!codereview quality assurance
- Achieved GREEN phase ({A} tests passing)
- Multi-model validation for complex logic

{If Wave 4 completed:}
Wave 4 - Quality Review (zen!codereview):
- Comprehensive codebase analysis
- Multi-model quality assessment (Gemini + O3)
- Security and performance validation
- Quality score: {score}/100

MCP Tools Used:
- Context7: Up-to-date framework documentation and patterns
- Zen: Test generation, code review, and multi-model orchestration

Artifacts included:
- Task documentation in docs/tasks/
- Comprehensive test coverage with zen-generated edge cases
- Production code following current best practices
- {Quality assurance report in docs/features/}
- Final TDD report in docs/features/

Co-authored-by: Enhanced-Agentic-TDD-Workflow <agentic@tdd.workflow>
Co-authored-by: Context7-MCP <context7@upstash.com>
Co-authored-by: Zen-MCP <zen@beehiveinnovations.com>
```

COMMIT changes:
- RUN `git commit -m "{structured commit message}"`

**PUSH AND CREATE PULL REQUEST**

PUSH feature branch:
- RUN `git push origin feature/FEATURE_NAME-agentic-tdd`

CREATE pull request:
- RUN `gh pr create --title "feat(FEATURE_NAME): Agentic TDD Implementation" --body "$(cat shared/reports/final-tdd-report.md)"`

**CLEANUP WORKTREES**

REMOVE worktree directories:
- RUN `git worktree remove trees/wave1-task-planning`
- RUN `git worktree remove trees/wave2-test-writing`  
- RUN `git worktree remove trees/wave3-code-writing`

DELETE feature branches:
- RUN `git branch -D FEATURE_NAME-wave1-tasks`
- RUN `git branch -D FEATURE_NAME-wave2-tests`
- RUN `git branch -D FEATURE_NAME-wave3-code`

REMOVE infrastructure:
- RUN `rm -rf trees/`
- RUN `rm -rf shared/`

**ARCHIVE WORKFLOW ARTIFACTS**

CREATE workflow archive:
- RUN `mkdir -p .agentic-tdd-archives/FEATURE_NAME-$(date +%Y%m%d-%H%M%S)`
- COPY `shared/reports/final-tdd-report.md` to archive
- COPY coordination files for posterity
- ADD archive to .gitignore if not already present

**FINAL VERIFICATION**

VERIFY cleanup completed:
- CHECK `git worktree list` shows no agentic worktrees
- VERIFY `git branch -a` shows feature branches removed
- CONFIRM main branch is clean
- TEST pull request link works

OUTPUT completion report:
```
✅ Enhanced Agentic TDD Cleanup Complete!

🎯 Feature: FEATURE_NAME
📊 Results:
  - Waves completed: {3 or 4}
  - Tasks completed: {X}
  - Tests passing: {Y}  
  - Acceptance criteria met: {Z}
  - Quality gates: ✅ All passed

🤖 MCP Enhancement:
  - Context7: Up-to-date documentation integration
  - Zen: Test generation + code review + multi-model analysis
  - Quality Score: {score}/100 (if Wave 4 completed)

🔗 Pull Request: {PR URL}
📁 Archive: .agentic-tdd-archives/FEATURE_NAME-{timestamp}

📋 Next Steps:
1. Review PR: {PR URL}
2. Verify MCP tool integration in CI/CD
3. Request code review from team
4. Deploy to staging with enhanced monitoring
5. Merge when approved

🏆 Enhanced Agentic TDD workflow completed successfully!
   Fresh sessions + MCP tools = Superior code quality
```