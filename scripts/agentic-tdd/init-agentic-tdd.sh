#!/bin/bash
set -euo pipefail

# init-agentic-tdd.sh - Automated setup for agentic TDD workflow
# Usage: ./init-agentic-tdd.sh "feature-name"

FEATURE_NAME="${1:-}"

# Validation
if [ -z "$FEATURE_NAME" ]; then
    echo "❌ Error: Feature name is required"
    echo "Usage: $0 'feature-name'"
    exit 1
fi

# Sanitize feature name (replace spaces/special chars with hyphens)
FEATURE_NAME=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

echo "🚀 Initializing Agentic TDD for: $FEATURE_NAME"

# Step 1: Verify we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Step 2: Check if we're on develop branch
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "develop" ]]; then
    echo "⚠️  Warning: Not on develop branch (currently on: $current_branch)"
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborting. Switch to develop branch first."
        exit 1
    fi
fi

# Step 3: Create base feature branch and shared infrastructure
echo "📋 Creating base feature branch..."
git checkout -b "feature/${FEATURE_NAME}-base" 2>/dev/null || {
    echo "❌ Error: Branch 'feature/${FEATURE_NAME}-base' already exists"
    exit 1
}

# Step 4: Create shared coordination infrastructure
echo "🗂️  Creating shared coordination infrastructure..."
mkdir -p shared/{coordination,artifacts/{tasks,tests,code},reports}

# Create initial coordination files
cat > shared/coordination/wave-status.json << EOF
{
  "feature_name": "${FEATURE_NAME}",
  "base_branch": "feature/${FEATURE_NAME}-base",
  "current_wave": "init",
  "wave1_complete": false,
  "wave2_complete": false,
  "wave3_complete": false,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

cat > shared/coordination/handoff-signals.json << EOF
{
  "task_planning_complete": false,
  "test_writing_complete": false,
  "code_writing_complete": false,
  "final_report_ready": false
}
EOF

cat > shared/coordination/mcp-status.json << EOF
{
  "context7_available": false,
  "zen_available": false,
  "last_checked": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Commit shared infrastructure
git add shared/
git commit -m "feat(${FEATURE_NAME}): initialize agentic TDD coordination infrastructure"

# Step 5: Create parallel worktrees
echo "🌳 Creating parallel worktrees..."
echo "⏱️ This may take 10-20 seconds for git operations..."
mkdir -p trees

# Create worktrees in parallel for speed
echo "  Creating task-planner worktree..."
git worktree add -b "task-planner-${FEATURE_NAME}" ./trees/task-planner "feature/${FEATURE_NAME}-base" &

echo "  Creating test-writer worktree..."
git worktree add -b "test-writer-${FEATURE_NAME}" ./trees/test-writer "feature/${FEATURE_NAME}-base" &

echo "  Creating code-writer worktree..."
git worktree add -b "code-writer-${FEATURE_NAME}" ./trees/code-writer "feature/${FEATURE_NAME}-base" &

# Wait for all worktrees to be created
wait

# Step 6: Setup each worktree environment
echo "⚙️  Setting up worktree environments..."

for tree in task-planner test-writer code-writer; do
    echo "  Setting up $tree..."
    
    # Copy .env if it exists
    if [ -f .env ]; then
        cp .env "./trees/$tree/.env"
        echo "    ✅ Copied .env"
    fi
    
    # Remove any existing shared directory and create symlink
    cd "./trees/$tree"
    rm -rf shared
    ln -sf ../../shared shared
    echo "    ✅ Linked shared directory"
    
    # Install dependencies if package.json exists
    if [ -f package.json ]; then
        echo "    📦 Installing dependencies (may take 5-20 seconds)..."
        pnpm install > /dev/null 2>&1 || npm install > /dev/null 2>&1 || {
            echo "    ⚠️  Could not install dependencies automatically"
        }
    fi
    
    # Create tasks directory
    mkdir -p tasks
    echo "    ✅ Created tasks directory"
    
    cd ../..
done

# Step 7: Final verification
echo "🔍 Verifying setup..."

# Check worktrees
echo "Git worktrees:"
git worktree list

# Check shared directory access
echo ""
echo "Shared directory structure:"
find shared -type f | head -10

# Test shared directory access from worktrees
echo ""
echo "Testing shared directory access from worktrees:"
for tree in task-planner test-writer code-writer; do
    if [ -L "./trees/$tree/shared" ]; then
        echo "  ✅ $tree: shared directory accessible"
    else
        echo "  ❌ $tree: shared directory NOT accessible"
    fi
done

# Create test file to verify cross-worktree communication
test_file="shared/coordination/init-test-$(date +%s).txt"
echo "test" > "$test_file"
for tree in task-planner test-writer code-writer; do
    if [ -f "./trees/$tree/$test_file" ]; then
        echo "  ✅ $tree: can access shared files"
    else
        echo "  ❌ $tree: cannot access shared files"
    fi
done
rm "$test_file"

echo ""
echo "🎉 Agentic TDD initialization complete!"
echo ""
echo "📊 Summary:"
echo "  Feature: $FEATURE_NAME"
echo "  Base branch: feature/${FEATURE_NAME}-base"
echo "  Worktrees: trees/{task-planner,test-writer,code-writer}"
echo "  Shared coordination: shared/"
echo ""
echo "🔄 Next Steps:"
echo "  1. cd trees/task-planner"
echo "  2. claude  # Start fresh Claude session"
echo "  3. /project:wave1-task-planning path/to/prd.md"
echo ""
echo "✨ Ready for Wave 1: Task Planning!"
