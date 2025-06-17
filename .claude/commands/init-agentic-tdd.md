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
- RUN `git worktree add -b task-planner ./trees/task-planner`
- COPY `.env` to `./trees/task-planner/.env` (if exists)
- RUN `cd ./trees/task-planner` then `pnpm install`
- CREATE directory `./trees/task-planner/tasks`

CREATE second worktree (Test Writer):
- RUN `git worktree add -b test-writer ./trees/test-writer`
- COPY `.env` to `./trees/test-writer/.env` (if exists)
- RUN `cd ./trees/test-writer` then `pnpm install`
- CREATE directory `./trees/test-writer/tasks`

CREATE third worktree (Code Writer):
- RUN `git worktree add -b code-writer ./trees/code-writer`
- COPY `.env` to `./trees/code-writer/.env` (if exists)
- RUN `cd ./trees/code-writer` then `pnpm install`
- CREATE directory `./trees/code-writer/tasks`

VERIFY setup by running `git worktree list`