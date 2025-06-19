# Agentic TDD Workflow - User Guide

## Complete Workflow: From Main Branch to PR

### Prerequisites
- You have claude-code installed and configured
- Your project has the agentic TDD commands in `/cc-commands/`
- You have MCP tools (zen, context7) available
- You're on the `main` branch with a clean working directory

### Step-by-Step Process

#### 1. Starting Point (Main Branch)
```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Verify clean working directory
git status  # Should show "working tree clean"
```

**⚠️ Important**: You do NOT create a feature branch manually. The workflow handles all branching for you.

#### 2. Initialize the Agentic TDD Workflow
```bash
# Run the init command with your feature name
claude /project:init-agentic-tdd my-awesome-feature
```

This creates:
- `shared/` directory for coordination
- `trees/task-planner/` worktree on branch `task-planner-my-awesome-feature`
- `trees/test-writer/` worktree on branch `test-writer-my-awesome-feature`
- `trees/code-writer/` worktree on branch `code-writer-my-awesome-feature`

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
- Create final feature branch `feature/my-awesome-feature-agentic-tdd`
- Integrate all code from the worktrees
- Run final tests and verification
- Create a pull request
- Clean up all temporary worktrees and branches
- Archive the workflow artifacts

### Your Git State Throughout

| Phase | Your Location | Active Branches |
|-------|---------------|-----------------|
| Start | `main` | `main` |
| After Init | `main` | `main` + 3 worktree branches |
| During Waves | `trees/*/` | Working in parallel branches |
| After Cleanup | `main` | `main` + `feature/my-awesome-feature-agentic-tdd` |

### What Each Directory Contains

```
project-root/               # Your main branch (unchanged during waves)
├── shared/                 # Coordination between waves
│   ├── coordination/       # Status files, handoffs
│   ├── artifacts/          # Tasks, tests, reports
│   └── reports/           # Final deliverables
├── trees/                 # Temporary parallel workspaces
│   ├── task-planner/      # Full project copy for task planning
│   ├── test-writer/       # Full project copy for test writing
│   └── code-writer/       # Full project copy for implementation
└── [your normal files]    # Untouched during the workflow
```

### Key Points

✅ **DO**: Start from main branch with clean working directory  
✅ **DO**: Use fresh Claude sessions for each wave  
✅ **DO**: Work in the appropriate `trees/` directory for each wave  
✅ **DO**: Let cleanup handle the final integration  

❌ **DON'T**: Create a feature branch manually before init  
❌ **DON'T**: Work directly in main during waves  
❌ **DON'T**: Manually merge worktree branches  
❌ **DON'T**: Skip the cleanup step  

### If Something Goes Wrong

**If you need to abort mid-workflow:**
```bash
# Emergency cleanup (removes everything)
git worktree remove trees/task-planner --force
git worktree remove trees/test-writer --force
git worktree remove trees/code-writer --force
rm -rf trees/ shared/
git worktree prune
```

**If init fails:**
```bash
# Clean up partial initialization
rm -rf trees/ shared/
git worktree prune
# Then try init again
```

### Expected Timeline

- **Init**: 30 seconds
- **Wave 1** (Task Planning): 10-20 minutes
- **Wave 2** (Test Writing): 15-30 minutes  
- **Wave 3** (Code Writing): 20-45 minutes
- **Wave 4** (Quality Review): 10-15 minutes (optional)
- **Cleanup**: 2-5 minutes

### Final Result

After cleanup, you'll have:
- Clean main branch (unchanged)
- Feature branch ready for review: `feature/my-awesome-feature-agentic-tdd`
- Pull request created automatically
- All artifacts archived in `.agentic-tdd-archives/`
- No temporary files or branches left behind

The beauty of this workflow is that your main branch stays clean throughout the entire process, and all the parallel work happens in isolated environments that get properly integrated at the end!