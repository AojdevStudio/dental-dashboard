# Init Agentic Parallel (Protected Main Version)

Initialize three parallel git worktree directories with shared coordination infrastructure for concurrent agentic TDD development on projects with protected main branches.

## Variables
FEATURE_NAME: $ARGUMENTS

## Execute these tasks

**STEP 1: CREATE FEATURE BRANCH WORKSPACE**

CREATE base feature branch from main:
- VERIFY you're on main: `git branch --show-current`
- ENSURE main is up to date: `git pull origin main`
- CREATE feature branch: `git checkout -b feature/${FEATURE_NAME}-base`
- PUSH base branch: `git push -u origin feature/${FEATURE_NAME}-base`

**STEP 2: CREATE SHARED COORDINATION INFRASTRUCTURE**

CREATE shared coordination infrastructure in feature branch:
- CREATE directory `shared/`
- CREATE directory `shared/coordination/`
- CREATE directory `shared/artifacts/`
- CREATE directory `shared/artifacts/tasks/`
- CREATE directory `shared/reports/`
- CREATE file `shared/coordination/wave-status.json` with content:
  ```json
  {
    "feature_name": "${FEATURE_NAME}",
    "base_branch": "feature/${FEATURE_NAME}-base",
    "current_wave": "init",
    "wave1_complete": false,
    "wave2_complete": false,
    "wave3_complete": false,
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
  ```
- CREATE file `shared/coordination/handoff-signals.json` with content: `{}`
- CREATE file `shared/coordination/mcp-status.json` with content: `{}`

COMMIT shared infrastructure:
- RUN `git add shared/`
- RUN `git commit -m "feat(${FEATURE_NAME}): initialize agentic TDD coordination infrastructure"`
- RUN `git push origin feature/${FEATURE_NAME}-base`

**STEP 3: CREATE PARALLEL WORKTREES**

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> All worktrees branch from the feature branch, not main

CREATE first worktree (Task Planner):
- RUN `git worktree add -b task-planner-${FEATURE_NAME} ./trees/task-planner feature/${FEATURE_NAME}-base`
- COPY `.env` to `./trees/task-planner/.env` (if exists)
- RUN `cd ./trees/task-planner` then `pnpm install`
- CREATE symlink `cd ./trees/task-planner && ln -sf ../../shared shared`

CREATE second worktree (Test Writer):
- RUN `git worktree add -b test-writer-${FEATURE_NAME} ./trees/test-writer feature/${FEATURE_NAME}-base`
- COPY `.env` to `./trees/test-writer/.env` (if exists)  
- RUN `cd ./trees/test-writer` then `pnpm install`
- CREATE symlink `cd ./trees/test-writer && ln -sf ../../shared shared`

CREATE third worktree (Code Writer):
- RUN `git worktree add -b code-writer-${FEATURE_NAME} ./trees/code-writer feature/${FEATURE_NAME}-base`
- COPY `.env` to `./trees/code-writer/.env` (if exists)
- RUN `cd ./trees/code-writer` then `pnpm install`  
- CREATE symlink `cd ./trees/code-writer && ln -sf ../../shared shared`

**STEP 4: VERIFY SETUP**

VERIFY setup:
- RUN `git worktree list`
- VERIFY shared directory exists: `ls -la shared/`
- VERIFY symlinks work: `ls -la trees/*/shared`
- TEST shared write access: `echo "test" > shared/coordination/init-test.txt`
- VERIFY all worktrees can see test file: `ls trees/*/shared/coordination/init-test.txt`
- CLEANUP test file: `rm shared/coordination/init-test.txt`
- VERIFY base branch is pushed: `git branch -r | grep feature/${FEATURE_NAME}-base`

## Post-Setup Notes

After running this initialization with protected main:
- Your main branch remains untouched and protected
- All work happens in feature branch ecosystem
- Each worktree has full project code from the feature branch
- Shared coordination works through symlinks
- Final cleanup will create PR against main

## Protected Main Branch Benefits

This approach:
✅ Never touches protected main branch working directory  
✅ All coordination happens in feature branch space  
✅ Supports enterprise git workflows  
✅ Maintains full audit trail through feature branch commits  
✅ Cleanup can create PR without main branch access  

## Directory Structure (Protected Main Version)

```
project-root/                           # Clean main branch (never modified)
├── feature/${FEATURE_NAME}-base/       # Base feature branch (has shared/)
│   ├── shared/                         # Coordination infrastructure
│   │   ├── coordination/               # Wave status and handoff signals
│   │   ├── artifacts/                  # Tasks, tests, implementation artifacts
│   │   └── reports/                    # Final wave reports
│   └── [project files from main]      # Project code copied from main
├── trees/                              # Parallel worktrees (branch from feature base)
│   ├── task-planner/                   # Branch: task-planner-${FEATURE_NAME}
│   │   ├── shared -> ../../shared      # Symlink to shared directory
│   │   └── [project files]            # Full project copy
│   ├── test-writer/                    # Branch: test-writer-${FEATURE_NAME}
│   │   ├── shared -> ../../shared      # Symlink to shared directory
│   │   └── [project files]            # Full project copy
│   └── code-writer/                    # Branch: code-writer-${FEATURE_NAME}
│       ├── shared -> ../../shared      # Symlink to shared directory
│       └── [project files]            # Full project copy
└── [main project files]               # Untouched main branch
```

## Troubleshooting Protected Main

If you get permission errors:
- Ensure you're not in main branch when running init
- Verify you have push permissions to create feature branches
- Check that branch protection rules allow feature branch creation

If symlinks don't work:
- On Windows: Use `mklink /D shared ..\..\shared` instead of `ln -sf`
- Alternative: Use relative paths `../../shared/` in wave commands