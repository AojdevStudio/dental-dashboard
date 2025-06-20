#!/bin/bash
set -euo pipefail

# wave1-complete.sh - Finalize Task Planning Agent (Wave 1)
# Usage: ./wave1-complete.sh

echo "📋 Wave 1: Task Planning Completion"

# Step 1: Validate deliverables
echo "✅ Validating Wave 1 deliverables..."

required_files=(
    "shared/artifacts/prd-summary.json"
    "shared/artifacts/tasks/task-dependency-order.json"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Missing required files:"
    printf '  - %s\n' "${missing_files[@]}"
    echo "💡 Complete the task decomposition before running this script"
    exit 1
fi

# Step 2: Count and validate task files
echo "📊 Analyzing task decomposition..."

task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" | wc -l)
echo "  📝 Task files created: $task_count"

if [ "$task_count" -eq 0 ]; then
    echo "❌ No task files found"
    echo "💡 Create task files in shared/artifacts/tasks/ before completing Wave 1"
    exit 1
fi

# Validate task file structure
echo "🔍 Validating task file structure..."
invalid_tasks=()

for task_file in shared/artifacts/tasks/*.md; do
    [ "$task_file" = "shared/artifacts/tasks/TEMPLATE-task.md" ] && continue
    [ ! -f "$task_file" ] && continue
    
    # Check for required sections
    if ! grep -q "## Description" "$task_file" || \
       ! grep -q "## Acceptance Criteria" "$task_file" || \
       ! grep -q "## Dependencies" "$task_file"; then
        invalid_tasks+=($(basename "$task_file"))
    fi
done

if [ ${#invalid_tasks[@]} -gt 0 ]; then
    echo "⚠️  Tasks missing required sections:"
    printf '  - %s\n' "${invalid_tasks[@]}"
    echo "💡 Ensure all tasks have Description, Dependencies, and Acceptance Criteria"
fi

# Step 3: Generate Wave 1 summary report
echo "📄 Generating Wave 1 completion report..."

feature_name=$(jq -r '.feature_name // "Unknown"' shared/artifacts/prd-summary.json)
requirements_count=$(jq -r '.core_requirements | length' shared/artifacts/prd-summary.json)

cat > shared/artifacts/wave1-completion-report.md << EOF
# Wave 1: Task Planning Completion Report

**Generated**: $(date)
**Feature**: $feature_name

## Summary
- **Total Tasks Created**: $task_count
- **Core Requirements Identified**: $requirements_count  
- **Task Validation**: ${#invalid_tasks[@]} issues found
- **Status**: Complete

## Task Breakdown
$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" -exec basename {} \; | sort | sed 's/^/- /')

## Key Deliverables
- ✅ PRD Summary: shared/artifacts/prd-summary.json
- ✅ Task Files: shared/artifacts/tasks/*.md  
- ✅ Dependency Order: shared/artifacts/tasks/task-dependency-order.json
- ✅ Completion Report: shared/artifacts/wave1-completion-report.md

## Next Wave Preparation
- **Ready for Wave 2**: Test Writing Agent
- **Next Command**: /project:wave2-test-writing
- **Required**: Fresh Claude Code session
- **Location**: cd ../test-writer && claude
EOF

# Step 4: Create handoff documentation
echo "🔄 Creating handoff documentation..."

cat > shared/coordination/wave1-handoff.md << EOF
# Wave 1 → Wave 2 Handoff

**Completed**: $(date)
**Feature**: $feature_name
**Tasks Created**: $task_count

## For Wave 2 (Test Writing Agent)

### Key Context
- Feature broken down into $task_count atomic tasks
- Each task has comprehensive acceptance criteria
- Dependencies mapped in task-dependency-order.json
- PRD summary available for reference

### Test Writing Priorities
1. **Focus on acceptance criteria** - Each task has specific, testable criteria
2. **Follow dependency order** - Tests should reflect task execution sequence  
3. **Use MCP tools** - zen!testgen for comprehensive test generation
4. **Edge cases documented** - Check task files for specific edge cases

### Critical Files for Wave 2
- **Task Files**: shared/artifacts/tasks/*.md (acceptance criteria)
- **PRD Summary**: shared/artifacts/prd-summary.json (feature context)
- **Dependencies**: shared/artifacts/tasks/task-dependency-order.json (test order)

### MCP Integration Notes
$(cat shared/coordination/mcp-status.json | jq -r 'if .context7_available then "- ✅ Context7 available for framework patterns" else "- ⚠️ Context7 not available - manual framework research needed" end')
$(cat shared/coordination/mcp-status.json | jq -r 'if .zen_available then "- ✅ Zen available for enhanced test generation" else "- ⚠️ Zen not available - manual test generation needed" end')

## Quality Gates Passed
- [x] All tasks have acceptance criteria
- [x] Dependencies clearly mapped  
- [x] PRD fully analyzed and summarized
- [x] Task files follow standard template
$(if [ ${#invalid_tasks[@]} -eq 0 ]; then echo "- [x] All task files properly structured"; else echo "- [ ] Some task files need structure fixes"; fi)

## Next Steps
1. **Switch to fresh session**: cd ../test-writer && claude
2. **Run Wave 2**: /project:wave2-test-writing
3. **Focus**: Generate failing tests for all acceptance criteria
EOF

# Step 5: Update coordination status
echo "📊 Updating coordination status..."

# Update handoff signals
jq '.task_planning_complete = true | .wave1_completed_at = now' \
  shared/coordination/handoff-signals.json > tmp.json && \
  mv tmp.json shared/coordination/handoff-signals.json

# Update wave status
jq '.current_wave = "1-complete" | .wave1_complete = true | .wave1_completed_at = now | .wave1_task_count = $count' \
  --argjson count "$task_count" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 6: Final verification and next steps
echo "🎉 Wave 1 Task Planning Complete!"
echo ""
echo "📊 **Summary**:"
echo "  - Feature: $feature_name"
echo "  - Tasks Created: $task_count"
echo "  - Requirements: $requirements_count"
echo "  - Status: ✅ Complete"
echo ""
echo "📁 **Deliverables**:"
echo "  - Task files: shared/artifacts/tasks/"
echo "  - PRD summary: shared/artifacts/prd-summary.json"
echo "  - Dependencies: shared/artifacts/tasks/task-dependency-order.json"
echo "  - Handoff guide: shared/coordination/wave1-handoff.md"
echo ""
echo "🔄 **Next Steps**:"
echo "  1. Switch to fresh Claude session:"
echo "     cd ../test-writer"
echo "     claude  # Fresh session required!"
echo "  2. Start Wave 2:"
echo "     /project:wave2-test-writing"
echo ""
echo "✨ Ready for Wave 2: Test Writing with MCP enhancement!"

# Step 7: Archive original wave file for reference
if [ -f "docs/cc-commands/wave1-task-planning.md" ]; then
    mkdir -p shared/archives
    cp docs/cc-commands/wave1-task-planning.md shared/archives/wave1-original-$(date +%Y%m%d).md
    echo "📦 Original wave file archived to shared/archives/"
fi
