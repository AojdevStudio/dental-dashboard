# Init Agentic Parallel

Initialize three parallel git worktree directories with shared coordination infrastructure for concurrent agentic TDD development.

## Variables
FEATURE_NAME: $ARGUMENTS

## Execute these tasks

CREATE shared coordination infrastructure:
- CREATE directory `shared/`
- CREATE directory `shared/coordination/`
- CREATE directory `shared/artifacts/`
- CREATE directory `shared/artifacts/tasks/`
- CREATE directory `shared/reports/`
- CREATE file `shared/coordination/wave-status.json` with content:
  ```json
  {
    "feature_name": "${FEATURE_NAME}",
    "current_wave": "init",
    "wave1_complete": false,
    "wave2_complete": false,
    "wave3_complete": false,
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
  ```
- CREATE file `shared/coordination/handoff-signals.json` with content: `{}`
- CREATE file `shared/coordination/mcp-status.json` with content: `{}`

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> Use absolute paths for all commands

CREATE first worktree (Task Planner):
- RUN `git worktree add -b task-planner-${FEATURE_NAME} ./trees/task-planner`
- COPY `.env` to `./trees/task-planner/.env` (if exists)
- RUN `cd ./trees/task-planner` then `pnpm install`
- CREATE symlink `cd ./trees/task-planner && ln -sf ../../shared shared`

CREATE second worktree (Test Writer):
- RUN `git worktree add -b test-writer-${FEATURE_NAME} ./trees/test-writer`
- COPY `.env` to `./trees/test-writer/.env` (if exists)  
- RUN `cd ./trees/test-writer` then `pnpm install`
- CREATE symlink `cd ./trees/test-writer && ln -sf ../../shared shared`

CREATE third worktree (Code Writer):
- RUN `git worktree add -b code-writer-${FEATURE_NAME} ./trees/code-writer`
- COPY `.env` to `./trees/code-writer/.env` (if exists)
- RUN `cd ./trees/code-writer` then `pnpm install`  
- CREATE symlink `cd ./trees/code-writer && ln -sf ../../shared shared`

VERIFY setup:
- RUN `git worktree list`
- VERIFY shared directory exists: `ls -la shared/`
- VERIFY symlinks work: `ls -la trees/*/shared`
- TEST shared write access: `echo "test" > shared/coordination/init-test.txt`
- VERIFY all worktrees can see test file: `ls trees/*/shared/coordination/init-test.txt`
- CLEANUP test file: `rm shared/coordination/init-test.txt`

## Post-Setup Notes

After running this initialization, each worktree will have:
- Full project code in its own git branch
- Symlinked access to the shared coordination directory
- Independent node_modules and .env files
- Ability to communicate with other waves through shared JSON files

## Troubleshooting

If symlinks don't work on your system:
- On Windows: Use `mklink /D shared ..\..\shared` instead of `ln -sf`
- Alternative: Use relative paths in your wave commands to access `../../shared/`

## Directory Structure

```
project-root/
├── shared/                     # Truly shared between all worktrees
│   ├── coordination/           # Wave status and handoff signals
│   ├── artifacts/              # Tasks, tests, implementation artifacts
│   └── reports/                # Final wave reports
├── trees/                      # Parallel worktrees
│   ├── task-planner/
│   │   ├── shared -> ../../shared  # Symlink to shared directory
│   │   └── [project files]
│   ├── test-writer/
│   │   ├── shared -> ../../shared  # Symlink to shared directory
│   │   └── [project files]
│   └── code-writer/
│       ├── shared -> ../../shared  # Symlink to shared directory
│       └── [project files]
└── [main project files]
```