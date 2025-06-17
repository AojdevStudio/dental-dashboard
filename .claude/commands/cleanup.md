# Cleanup Agentic Parallel

Merge results and cleanup worktrees after agentic TDD completion.

## Variables
FEATURE_NAME: $ARGUMENTS

## Execute these tasks

VERIFY all tests pass in code-writer worktree:
- RUN `cd trees/FEATURE_NAME-code-writer && pnpm test`

CREATE feature branch:
- RUN `git checkout main && git pull origin main`
- RUN `git checkout -b feature/FEATURE_NAME-complete`

MERGE results from all worktrees:
- COPY task files from `trees/FEATURE_NAME-task-planner/task_output_dir/*` to `./tasks/`
- COPY test files from `trees/FEATURE_NAME-test-writer/src/**/*.test.ts` to `./src/`
- COPY production code from `trees/FEATURE_NAME-code-writer/src/**/*.ts` to `./src/`

COMMIT and push:
- RUN `git add . && git commit -m "feat: implement FEATURE_NAME via agentic TDD"`
- RUN `git push origin feature/FEATURE_NAME-complete`

CLEANUP worktrees:
- RUN `git worktree remove trees/FEATURE_NAME-task-planner`
- RUN `git worktree remove trees/FEATURE_NAME-test-writer`
- RUN `git worktree remove trees/FEATURE_NAME-code-writer`
- RUN `rm -rf trees/`

CREATE pull request:
- RUN `gh pr create --title "Implement FEATURE_NAME" --body "Agentic TDD implementation"`