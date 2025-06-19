# Cleanup Agentic TDD (Protected Main Version)

Merge completed TDD workflow results and cleanup infrastructure for projects with protected main branches.

## Variables
FEATURE_NAME: $ARGUMENTS

**PREREQUISITE VERIFICATION**

VERIFY all waves completed:
- CHECK `shared/coordination/handoff-signals.json` for completion flags
- VERIFY `shared/reports/final-tdd-report.md` exists
- CHECK if `shared/reports/quality-assurance-report.md` exists (Wave 4 optional)
- RUN final test verification: `cd trees/code-writer && pnpm test`

DETERMINE workflow completion level:
- 3-Wave completion: Task Planning → Test Writing → Code Writing
- 4-Wave completion: All above + Quality Review (recommended)

If core waves incomplete, EXIT with message: "❌ Core waves (1-3) must complete before cleanup"

**FINAL INTEGRATION ON FEATURE BRANCH**

SWITCH to base feature branch:
- RUN `git checkout feature/${FEATURE_NAME}-base`
- RUN `git pull origin feature/${FEATURE_NAME}-base`

INTEGRATE all wave results into base feature branch:
- COPY task documentation: `cp -r shared/artifacts/tasks/* ./docs/tasks/` (create dir if needed)
- COPY test files from test-writer worktree to appropriate locations based on codebase structure
- COPY production code from code-writer worktree to main codebase
- COPY final report: `cp shared/reports/final-tdd-report.md ./docs/features/`
- COPY quality report if exists: `cp shared/reports/quality-assurance-report.md ./docs/features/` (if Wave 4 completed)

VERIFY integration on feature branch:
- RUN `pnpm install` (in case of new dependencies)
- RUN `pnpm test` (all tests should pass)
- RUN `pnpm lint` (code should be clean) 
- RUN `pnpm typecheck` (types should be valid)

**CREATE COMPREHENSIVE COMMIT ON FEATURE BRANCH**

STAGE all changes:
- RUN `git add .`

CREATE structured commit message:
```
feat(${FEATURE_NAME}): implement via enhanced agentic TDD workflow

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

Protected Main Workflow:
- All work completed in feature branch ecosystem
- Main branch never directly modified
- Enterprise-compliant git workflow maintained

Co-authored-by: Enhanced-Agentic-TDD-Workflow <agentic@tdd.workflow>
Co-authored-by: Context7-MCP <context7@upstash.com>
Co-authored-by: Zen-MCP <zen@beehiveinnovations.com>
```

COMMIT changes:
- RUN `git commit -m "{structured commit message}"`

PUSH updated feature branch:
- RUN `git push origin feature/${FEATURE_NAME}-base`

**CREATE PULL REQUEST AGAINST MAIN**

CREATE pull request from feature branch to main:
- RUN `gh pr create --base main --head feature/${FEATURE_NAME}-base --title "feat(${FEATURE_NAME}): Agentic TDD Implementation" --body "$(cat shared/reports/final-tdd-report.md)"`

**CLEANUP WORKTREES AND SHARED INFRASTRUCTURE**

REMOVE worktree directories (this also removes symlinks):
- RUN `git worktree remove trees/task-planner --force`
- RUN `git worktree remove trees/test-writer --force`  
- RUN `git worktree remove trees/code-writer --force`

DELETE temporary worktree branches (keep base feature branch):
- RUN `git branch -D task-planner-${FEATURE_NAME}`
- RUN `git branch -D test-writer-${FEATURE_NAME}`
- RUN `git branch -D code-writer-${FEATURE_NAME}`

**ARCHIVE WORKFLOW ARTIFACTS**

CREATE workflow archive before cleanup:
- RUN `mkdir -p .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)`
- COPY all shared artifacts: `cp -r shared/* .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)/`
- ADD archive to .gitignore if not already present: `echo ".agentic-tdd-archives/" >> .gitignore`

REMOVE infrastructure from feature branch:
- RUN `rm -rf trees/`
- RUN `rm -rf shared/`
- RUN `git add .`
- RUN `git commit -m "chore(${FEATURE_NAME}): cleanup agentic TDD infrastructure"`
- RUN `git push origin feature/${FEATURE_NAME}-base`

**RETURN TO MAIN BRANCH**

SWITCH back to main branch:
- RUN `git checkout main`

**FINAL VERIFICATION**

VERIFY cleanup completed:
- CHECK `git worktree list` shows no agentic worktrees
- VERIFY `git branch -a` shows only base feature branch remains
- CONFIRM you're back on main branch: `git branch --show-current`
- VERIFY feature branch exists: `git branch -r | grep feature/${FEATURE_NAME}-base`
- TEST pull request link works

OUTPUT completion report:
```
✅ Enhanced Agentic TDD Cleanup Complete! (Protected Main)

🎯 Feature: ${FEATURE_NAME}
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

🔒 Protected Main Compliance:
  - Main branch never directly modified
  - All work in feature branch ecosystem
  - Enterprise git workflow maintained

🔗 Pull Request: {PR URL} (feature/${FEATURE_NAME}-base → main)
📁 Archive: .agentic-tdd-archives/${FEATURE_NAME}-{timestamp}

📋 Next Steps:
1. Review PR: {PR URL}
2. Request code review from team
3. Ensure CI/CD passes on feature branch
4. Merge PR when approved (squash recommended)
5. Delete feature branch after merge

🏆 Enhanced Agentic TDD workflow completed successfully!
   Protected main + Fresh sessions + MCP tools = Enterprise-grade development
```

**TROUBLESHOOTING PROTECTED MAIN**

If you get permission errors during cleanup:
- Ensure you have push permissions to the feature branch
- Verify you're not accidentally trying to commit to main
- Check branch protection rules don't block feature branch updates

If PR creation fails:
- Manually create PR: Go to GitHub and create PR from `feature/${FEATURE_NAME}-base` to `main`
- Ensure you have repository permissions to create PRs

If cleanup leaves artifacts:
- Manually remove: `rm -rf trees/ shared/`
- Force cleanup worktrees: `git worktree prune`
- The feature branch preserves all important artifacts