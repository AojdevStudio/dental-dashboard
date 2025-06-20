#!/bin/bash
set -euo pipefail

# wave1-setup.sh - Setup for Task Planning Agent (Wave 1)
# Usage: ./wave1-setup.sh "prd-file-path"

PRD_FILE="${1:-}"

echo "📋 Wave 1: Task Planning Agent Setup"

# Step 1: Validate prerequisites
echo "🔍 Checking prerequisites..."

if [ ! -d "shared" ]; then
    echo "❌ Error: shared directory not found"
    echo "💡 Run: /project:init-agentic-tdd first"
    exit 1
fi

if [ -z "$PRD_FILE" ]; then
    echo "❌ Error: PRD file path is required"
    echo "Usage: $0 'path/to/prd.md'"
    exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
    echo "❌ Error: PRD file not found: $PRD_FILE"
    exit 1
fi

# Step 2: Validate fresh session environment
echo "⚡ Validating fresh session environment..."

# Check if we're in the right worktree
if [ ! -f "shared/coordination/wave-status.json" ]; then
    echo "❌ Error: Wave status file not found"
    echo "💡 Ensure you're in the correct worktree: trees/task-planner"
    exit 1
fi

# Verify we're starting Wave 1
current_wave=$(jq -r '.current_wave' shared/coordination/wave-status.json 2>/dev/null || echo "unknown")
if [ "$current_wave" != "init" ] && [ "$current_wave" != "1" ]; then
    echo "⚠️  Warning: Expected init or wave 1, found: $current_wave"
fi

# Step 3: Test MCP tool availability
echo "🤖 Testing MCP tool availability..."

# Create MCP status file
cat > shared/coordination/mcp-status.json << EOF
{
  "context7_available": false,
  "zen_available": false,
  "checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "check_commands": {
    "context7": "use context7 to verify setup",
    "zen": "use zen to check system status"
  }
}
EOF

# Step 4: Create PRD analysis workspace
echo "📄 Preparing PRD analysis workspace..."

# Copy PRD to shared location for reference
cp "$PRD_FILE" "shared/artifacts/prd-original.md"

# Create PRD summary template
cat > shared/artifacts/prd-summary.json << 'EOF'
{
  "feature_name": "",
  "core_requirements": [],
  "technical_constraints": [],
  "user_experience_goals": [],
  "performance_requirements": [],
  "security_considerations": [],
  "edge_cases": [],
  "integration_points": [],
  "success_criteria": []
}
EOF

# Step 5: Create task decomposition workspace
echo "📝 Setting up task decomposition workspace..."

# Ensure tasks directory exists
mkdir -p shared/artifacts/tasks

# Create task template for reference
cat > shared/artifacts/tasks/TEMPLATE-task.md << 'EOF'
# Task: {Title}

## Description
Detailed description of what needs to be implemented

## Dependencies
- List of other tasks that must complete first
- External dependencies (APIs, libraries, etc.)

## Acceptance Criteria
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2  
- [ ] Specific, testable criterion 3

## Technical Requirements
- Implementation approach
- Performance constraints
- Security considerations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code review completed
- [ ] Documentation updated

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Happy path scenarios
- Edge cases to test
- Error conditions to handle
- Performance test cases

## Implementation Notes
- Suggested approach
- Code patterns to follow
- Files to modify/create
- Potential gotchas
EOF

# Step 6: Prepare dependency tracking
echo "🔗 Setting up dependency tracking..."

# Create dependency order template
cat > shared/artifacts/tasks/task-dependency-order.json << 'EOF'
{
  "execution_order": [
    {
      "phase": 1,
      "tasks": [],
      "description": "Foundation tasks with no dependencies"
    }
  ],
  "critical_path": [],
  "parallel_opportunities": []
}
EOF

# Step 7: Update wave status
echo "📊 Updating wave status..."

# Update coordination files
jq '.current_wave = "1" | .wave1_started_at = now | .wave1_prd_file = $prd' \
  --arg prd "$PRD_FILE" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 8: Display context for Claude
echo "🧠 Preparing context for AI analysis..."

echo ""
echo "====== WAVE 1 SETUP COMPLETE ======"
echo ""
echo "📄 PRD File: $PRD_FILE"
echo "📂 Working Directory: $(pwd)"
echo "🎯 Claude Focus Areas:"
echo "  1. Analyze PRD requirements and constraints"
echo "  2. Decompose into atomic, testable tasks"
echo "  3. Create comprehensive acceptance criteria"
echo "  4. Establish task dependencies and execution order"
echo ""
echo "📁 Key Files:"
echo "  - PRD Copy: shared/artifacts/prd-original.md"
echo "  - Summary Template: shared/artifacts/prd-summary.json"
echo "  - Task Template: shared/artifacts/tasks/TEMPLATE-task.md"
echo "  - Dependency Template: shared/artifacts/tasks/task-dependency-order.json"
echo ""
echo "🤖 MCP Commands to Test:"
echo "  - use context7 to verify setup"
echo "  - use zen to check system status"
echo ""
echo "✅ Ready for Claude reasoning and task decomposition!"
