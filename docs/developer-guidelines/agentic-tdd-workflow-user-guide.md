# Agentic TDD Workflow - User Guide (Protected Main Version)

## Complete Workflow: From Protected Main Branch to PR

### Prerequisites
- You have claude-code installed and configured
- Your project has the agentic TDD commands in `/cc-commands/`
- You have MCP tools (zen, context7) available
- **Your main branch is protected** (requires PRs, no direct commits)
- You have permissions to create feature branches and push to them

### Step-by-Step Process

#### 1. Starting Point (Protected Main Branch)
```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Verify clean working directory
git status  # Should show "working tree clean"

# Verify you're on protected main
git branch --show-current  # Should show "main"
```

**⚠️ Critical**: With protected main, the workflow creates a feature branch first, then all work happens in that ecosystem.

#### 2. Initialize the Agentic TDD Workflow
```bash
# Run the init command with your feature name
claude /project:init-agentic-tdd my-awesome-feature
```

This now creates:
1. **Feature branch**: `feature/my-awesome-feature-base` (pushed to remote)
2. **Shared directory**: `shared/` in the feature branch (committed and pushed)
3. **Worktrees**: Three parallel worktrees branching from the feature branch
   - `trees/task-planner/` on branch `task-planner-my-awesome-feature`
   - `trees/test-writer/` on branch `test-writer-my-awesome-feature`
   - `trees/code-writer/` on branch `code-writer-my-awesome-feature`

#### 3. Wave 1 - Task Planning (Fresh Claude Session)
```bash
# Open NEW claude-code session in task-planner directory
cd trees/task-planner
claude /project:wave1-task-planning path/to/your-prd.md
```

#### 4. Wave 2 - Test Writing (Fresh Claude Session)
```bash
# Open NEW claude-code session in test-writer directory
cd trees/test-writer
claude /project:wave2-test-writing
```

#### 5. Wave 3 - Code Writing (Fresh Claude Session)
```bash
# Open NEW claude-code session in code-writer directory
cd trees/code-writer
claude /project:wave3-code-writing
```

#### 6. Optional Wave 4 - Quality Review (Fresh Claude Session)
```bash
# If you want comprehensive quality review
cd trees/code-writer  # or any worktree
claude /project:quality-review
```

#### 7. Cleanup and Integration (Back to Main)
```bash
# Go back to your main project directory (not in any worktree)
cd ../../  # Back to project root
claude /project:cleanup-agentic-tdd my-awesome-feature
```

This will:
- Integrate all code into the feature branch `feature/my-awesome-feature-base`
- Run final tests and verification on the feature branch
- Create a pull request from `feature/my-awesome-feature-base` → `main`
- Clean up all temporary worktrees and branches
- Archive the workflow artifacts
- Return you to the clean main branch

### Your Git State Throughout (Protected Main)

| Phase | Your Location | Active Branches | Main Branch Status |
|-------|---------------|-----------------|-------------------|
| Start | `main` | `main` | Clean & Protected |
| After Init | `main` | `main` + `feature/my-awesome-feature-base` + 3 worktree branches | Clean & Protected |
| During Waves | `trees/*/` | Working in parallel branches from feature base | Clean & Protected |
| After Cleanup | `main` | `main` + `feature/my-awesome-feature-base` | Clean & Protected |

### What Each Directory Contains (Protected Main)

```
project-root/                           # Protected main branch (never touched)
├── feature/my-awesome-feature-base/    # Base feature branch workspace
│   ├── shared/                         # Coordination infrastructure
│   │   ├── coordination/               # Status files, handoffs
│   │   ├── artifacts/                  # Tasks, tests, reports
│   │   └── reports/                    # Final deliverables
│   └── [project files from main]      # Project code copied from main
├── trees/                              # Temporary parallel workspaces
│   ├── task-planner/                   # Branches from feature base
│   ├── test-writer/                    # Branches from feature base
│   └── code-writer/                    # Branches from feature base
└── [your normal files]                 # Protected main (untouched)
```

### Key Differences from Regular Workflow

✅ **Protected Main Benefits**:
- Main branch is never modified during development
- All coordination happens in feature branch ecosystem
- Enterprise-compliant git workflow
- Full audit trail through feature branch commits
- Can handle any level of branch protection

✅ **DO**: Let init create the feature branch automatically  
✅ **DO**: Work in the `trees/` directories during waves  
✅ **DO**: Trust cleanup to integrate everything properly  
✅ **DO**: Review the PR that gets created automatically  

❌ **DON'T**: Try to create a feature branch manually before init  
❌ **DON'T**: Work directly in main (it's protected anyway)  
❌ **DON'T**: Try to commit to main during the process  
❌ **DON'T**: Delete the base feature branch until PR is merged  

### Expected Timeline (Same as Regular)

- **Init**: 30 seconds (+ time to push feature branch)
- **Wave 1** (Task Planning): 10-20 minutes
- **Wave 2** (Test Writing): 15-30 minutes  
- **Wave 3** (Code Writing): 20-45 minutes
- **Wave 4** (Quality Review): 10-15 minutes (optional)
- **Cleanup**: 2-5 minutes (+ time to push final changes)

### Final Result (Protected Main)

After cleanup, you'll have:
- **Protected main branch**: Completely untouched and clean
- **Feature branch**: `feature/my-awesome-feature-base` with all integrated work
- **Pull Request**: Automatically created from feature branch to main
- **All artifacts**: Archived in `.agentic-tdd-archives/`
- **Clean workspace**: No temporary files or branches left behind

### Enterprise Compliance

This protected main workflow ensures:
- ✅ **Branch Protection**: Main branch never directly modified
- ✅ **Code Review**: All changes go through PR process
- ✅ **Audit Trail**: Complete git history of all development
- ✅ **CI/CD Integration**: Feature branch can run full CI pipeline
- ✅ **Team Collaboration**: Standard PR review workflow
- ✅ **Rollback Safety**: Easy to abandon or modify before merge

### If Something Goes Wrong

**Emergency cleanup (protects main branch):**
```bash
# Ensure you're on main first
git checkout main

# Emergency cleanup (removes everything, keeps main safe)
git worktree remove trees/task-planner --force 2>/dev/null
git worktree remove trees/test-writer --force 2>/dev/null
git worktree remove trees/code-writer --force 2>/dev/null
rm -rf trees/ shared/
git worktree prune

# Feature branch remains for manual cleanup if needed
# You can delete it with: git push origin --delete feature/my-awesome-feature-base
```

The beauty of this protected main approach is that your main branch is absolutely safe throughout the entire process, and you get all the benefits of enterprise git workflows while still having the parallel development power of the agentic TDD system!