# Init Agentic Parallel

Initialize three parallel git worktree directories for concurrent agentic TDD development.

## Variables
FEATURE_NAME: $ARGUMENTS

## Execute these tasks

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> Use absolute paths for all commands

CREATE first worktree (Task Planner):
- RUN `git worktree add -b FEATURE_NAME-task-planner ./trees/FEATURE_NAME-task-planner`
- COPY `.env` to `./trees/FEATURE_NAME-task-planner/.env` (if exists)
- RUN `cd ./trees/FEATURE_NAME-task-planner` then `pnpm install`
- CREATE directory `./trees/FEATURE_NAME-task-planner/tasks`

CREATE second worktree (Test Writer):
- RUN `git worktree add -b FEATURE_NAME-test-writer ./trees/FEATURE_NAME-test-writer`
- COPY `.env` to `./trees/FEATURE_NAME-test-writer/.env` (if exists)
- RUN `cd ./trees/FEATURE_NAME-test-writer` then `pnpm install`
- CREATE directory `./trees/FEATURE_NAME-test-writer/tasks`

CREATE third worktree (Code Writer):
- RUN `git worktree add -b FEATURE_NAME-code-writer ./trees/FEATURE_NAME-code-writer`
- COPY `.env` to `./trees/FEATURE_NAME-code-writer/.env` (if exists)
- RUN `cd ./trees/FEATURE_NAME-code-writer` then `pnpm install`
- CREATE directory `./trees/FEATURE_NAME-code-writer/tasks`

VERIFY setup by running `git worktree list`