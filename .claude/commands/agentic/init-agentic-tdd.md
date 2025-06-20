# Init Agentic TDD - Hybrid Slash Command

Initialize parallel git worktrees for agentic TDD development with automated setup and enterprise-grade error handling.

## Execute

```bash
FEATURE_NAME="$ARGUMENTS"

# Validate feature name provided
if [ -z "$FEATURE_NAME" ]; then
    echo "❌ Error: Feature name is required"
    echo "Usage: /project:init-agentic-tdd 'my-feature-name'"
    exit 1
fi

echo "🚀 Starting Hybrid Agentic TDD Setup for: $FEATURE_NAME"
echo "📊 Context Efficiency: Using script automation + AI guidance"

# Execute automated setup script (may take 10-30 seconds)
echo "⏱️ Executing setup script - please wait 10-30 seconds..."
./scripts/agentic-tdd/init-agentic-tdd.sh "$FEATURE_NAME"

# Validate success and provide intelligent guidance
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Hybrid Init Complete!"
    echo "📊 Context Savings: 34 lines → 8 lines (76% reduction)"
    echo "🏗️  Architecture: Script automation + AI reasoning"
    echo ""
    echo "🔍 What was automated:"
    echo "  ✅ Git worktree creation with parallel processing"
    echo "  ✅ Shared coordination infrastructure setup"
    echo "  ✅ Environment configuration (.env, dependencies)"
    echo "  ✅ Cross-worktree communication validation"
    echo ""
    echo "🔄 Next Steps:"
    echo "  1. cd trees/task-planner"
    echo "  2. claude  # Start fresh Claude session"
    echo "  3. /project:wave1-task-planning path/to/prd.md"
    echo ""
    echo "✨ Ready for Wave 1: Task Planning with MCP enhancement!"
else
    echo ""
    echo "❌ Setup failed. Check error messages above."
    echo "🔧 Debug: Test script independently:"
    echo "   ./scripts/agentic-tdd/init-agentic-tdd.sh '$FEATURE_NAME'"
    exit 1
fi
```
