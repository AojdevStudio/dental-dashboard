# Cleanup Agentic TDD (Improved - Selective Cleanup)

Smart cleanup for completed TDD workflow with selective preservation of valuable artifacts.

## Variables
FEATURE_NAME: ${1:Enter feature name (e.g., AOJ-59-Test-Infrastructure)}

**PREREQUISITE VERIFICATION**

VERIFY all waves completed:
- CHECK `shared/coordination/handoff-signals.json` for completion flags
- VERIFY `shared/reports/final-tdd-report.md` exists
- CHECK if `shared/reports/quality-assurance-report.md` exists (Wave 4 optional)
- RUN final test verification: `pnpm test`

DETERMINE workflow completion level:
- 3-Wave completion: Task Planning → Test Writing → Code Writing  
- 4-Wave completion: All above + Quality Review (recommended)

If core waves incomplete, EXIT with message: "❌ Core waves (1-3) must complete before cleanup"

**FINAL INTEGRATION ON FEATURE BRANCH**

VERIFY current branch:
- RUN `git branch --show-current` (should be feature/${FEATURE_NAME}-base)
- RUN `git pull origin feature/${FEATURE_NAME}-base`

ENSURE all changes are committed:
- RUN `git status` (should be clean or only untracked files)
- STAGE any remaining changes: `git add .`
- COMMIT if needed: `git commit -m "feat(${FEATURE_NAME}): final implementation updates"`

**SMART CLEANUP STRATEGY**

CREATE comprehensive archive BEFORE any cleanup:
- RUN `mkdir -p .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)`
- COPY shared directory: `cp -r shared/ .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)/shared-backup/`
- COPY worktree info: `git worktree list > .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)/worktree-info.txt`
- COPY branch info: `git branch -a > .agentic-tdd-archives/${FEATURE_NAME}-$(date +%Y%m%d-%H%M%S)/branch-info.txt`

**SELECTIVE SHARED DIRECTORY CLEANUP**

INTERACTIVE cleanup with preservation:
```bash
set -euo pipefail

echo "🔍 Analyzing shared directory for cleanup..."

# Preserve valuable reports and documentation
PRESERVE_PATHS=(
  "shared/reports/"
  "shared/artifacts/tasks/" 
  "shared/artifacts/test-strategy.md"
  "shared/artifacts/test-verification.md"
)

# Only remove temporary coordination files
CLEANUP_PATHS=(
  "shared/coordination/handoff-signals.json"
  "shared/coordination/mcp-status.json" 
  "shared/coordination/wave-status.json"
)

echo "📋 Items to PRESERVE (valuable for future reference):"
for path in "${PRESERVE_PATHS[@]}"; do
  if [ -e "$path" ]; then
    echo "  ✅ $path"
  fi
done

echo ""
echo "🗑️  Items to REMOVE (temporary coordination files):"
cleanup_items_found=false
for path in "${CLEANUP_PATHS[@]}"; do
  if [ -e "$path" ]; then
    echo "  🔴 $path"
    cleanup_items_found=true
  fi
done

if [ "$cleanup_items_found" = false ]; then
  echo "  ℹ️  No temporary coordination files found to remove"
  echo "✅ Nothing to clean up - all temporary files already removed"
  exit 0
fi

echo ""
read -p "Proceed with selective cleanup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Remove only temporary coordination files
  for path in "${CLEANUP_PATHS[@]}"; do
    if [ -e "$path" ]; then
      rm -f "$path"
      echo "Removed: $path"
    fi
  done
  
  # Clean up empty directories
  find shared/coordination -type d -empty -delete 2>/dev/null || true
  
  echo "✅ Selective cleanup completed"
else
  echo "❌ Cleanup cancelled - all files preserved"
fi
```

**WORKTREE CLEANUP**

REMOVE worktree directories (only if they exist):
- CHECK `git worktree list | grep trees/`
- IF worktrees exist:
  - RUN `git worktree remove trees/task-planner --force` (if exists)
  - RUN `git worktree remove trees/test-writer --force` (if exists)  
  - RUN `git worktree remove trees/code-writer --force` (if exists)

DELETE temporary worktree branches (preserve base feature branch):
- CHECK for branches: `git branch | grep -E "(task-planner|test-writer|code-writer)-${FEATURE_NAME}"`
- IF branches exist:
  - RUN `git branch -D task-planner-${FEATURE_NAME}` (if exists)
  - RUN `git branch -D test-writer-${FEATURE_NAME}` (if exists)
  - RUN `git branch -D code-writer-${FEATURE_NAME}` (if exists)

**COMMIT CLEANUP CHANGES**

IF any files were modified during cleanup:
- RUN `git add .`
- COMMIT: `git commit -m "chore(${FEATURE_NAME}): selective cleanup of temporary agentic TDD coordination files

- Preserved valuable reports and documentation in shared/
- Removed only temporary coordination files (handoff-signals, wave-status)
- Maintained workflow artifacts for future reference and debugging
- Created comprehensive backup in .agentic-tdd-archives/"`
- PUSH: `git push origin feature/${FEATURE_NAME}-base`

**UPDATE OR CREATE PULL REQUEST**

CHECK if PR exists:
- RUN `gh pr list --head feature/${FEATURE_NAME}-base`

IF PR exists:
- UPDATE PR description with completion status
- ADD comment about cleanup completion

IF NO PR exists:
- CREATE PR: `gh pr create --base main --head feature/${FEATURE_NAME}-base --title "feat(${FEATURE_NAME}): Enhanced Agentic TDD Implementation" --body "$(cat shared/reports/final-tdd-report.md)"`

**FINAL VERIFICATION AND REPORT**

VERIFY final state:
- CHECK `git worktree list` (should show only main directory)
- VERIFY `git branch -a | grep -E "(task-planner|test-writer|code-writer)"` (should be empty)
- CONFIRM you're on feature branch: `git branch --show-current`
- TEST main functionality still works: `pnpm typecheck && pnpm lint`

CREATE completion summary:
```bash
echo "✅ Enhanced Agentic TDD Cleanup Complete! (Improved)"
echo ""
echo "🎯 Feature: ${FEATURE_NAME}"
echo "📊 Preservation Status:"
echo "  - ✅ Final reports: preserved in shared/reports/"
echo "  - ✅ Task documentation: preserved in shared/artifacts/tasks/"
echo "  - ✅ Test strategy: preserved in shared/artifacts/"
echo "  - 🗑️  Coordination files: cleaned up (temporary only)"
echo ""
echo "🔒 Protected Main Compliance: ✅"
echo "📁 Archive: .agentic-tdd-archives/${FEATURE_NAME}-{timestamp}/"
echo "🔗 Pull Request: $(gh pr view --json url -q .url 2>/dev/null || echo 'Create manually')"
echo ""
echo "📋 Next Steps:"
echo "1. Review preserved shared/ directory for valuable artifacts"
echo "2. Review and merge PR when ready"
echo "3. Archive can be cleaned up after successful deployment"
echo ""
echo "🏆 Smart cleanup preserves valuable artifacts while removing temporary files!"
```

**ROLLBACK INSTRUCTIONS**

IF anything was accidentally removed:
```bash
# Restore from archive
ARCHIVE_DIR=$(ls -1t .agentic-tdd-archives/ | head -1)
echo "Restoring from: .agentic-tdd-archives/$ARCHIVE_DIR"

# Restore shared directory 
cp -r ".agentic-tdd-archives/$ARCHIVE_DIR/shared-backup/." shared/

# Restore worktrees if needed
# (Note: worktrees need to be recreated, not just copied)

git add shared/
git commit -m "restore: recover accidentally removed agentic TDD artifacts"
git push origin feature/${FEATURE_NAME}-base
```

**KEY IMPROVEMENTS SUMMARY**

1. **Selective Preservation**: Only removes temporary coordination files, keeps valuable reports
2. **Interactive Confirmation**: User controls what gets removed  
3. **Better Archive Organization**: Comprehensive backup with metadata
4. **Clear Documentation**: Shows exactly what's preserved vs removed
5. **Easy Rollback**: Simple restoration process if needed
6. **Status Reporting**: Clear summary of what was preserved
7. **Safety First**: Multiple confirmation steps and comprehensive backups

This improved cleanup balances cleanliness with preservation of valuable workflow artifacts for future reference and debugging.