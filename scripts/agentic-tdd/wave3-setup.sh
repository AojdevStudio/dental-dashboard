#!/bin/bash
set -euo pipefail

# wave3-setup.sh - Setup for Code Writing Agent (Wave 3)
# Usage: ./wave3-setup.sh

echo "🛠️ Wave 3: Code Writing Agent Setup"

# Step 1: Validate Wave 2 completion
echo "🔍 Checking Wave 2 completion..."

if [ ! -d "shared" ]; then
    echo "❌ Error: shared directory not found"
    echo "💡 Ensure you're in the correct worktree: trees/code-writer"
    exit 1
fi

# Check Wave 2 completion
if [ ! -f "shared/coordination/handoff-signals.json" ]; then
    echo "❌ Error: Handoff signals file not found"
    exit 1
fi

test_writing_complete=$(jq -r '.test_writing_complete // false' shared/coordination/handoff-signals.json)
if [ "$test_writing_complete" != "true" ]; then
    echo "❌ Wave 2 must complete before starting Wave 3"
    echo "💡 Run Wave 2 first: cd ../test-writer && /project:wave2-test-writing"
    exit 1
fi

# Verify required Wave 2 artifacts
required_artifacts=(
    "shared/artifacts/tests/test-coverage-report.md"
    "shared/coordination/wave2-handoff.md"
    "shared/artifacts/test-strategy.md"
)

missing_artifacts=()
for artifact in "${required_artifacts[@]}"; do
    if [ ! -f "$artifact" ]; then
        missing_artifacts+=("$artifact")
    fi
done

if [ ${#missing_artifacts[@]} -gt 0 ]; then
    echo "❌ Missing required Wave 2 artifacts:"
    printf '  - %s\n' "${missing_artifacts[@]}"
    exit 1
fi

# Step 2: Analyze current failing test state
echo "🧪 Analyzing current test state..."

# Get test framework and command from Wave 2
test_framework=$(jq -r '.test_framework // "unknown"' shared/coordination/wave-status.json)
if [ -f "shared/artifacts/test-strategy.md" ]; then
    test_command=$(grep "Test command:" shared/artifacts/test-strategy.md | cut -d: -f2 | xargs || echo "npm test")
else
    test_command="npm test"
fi

echo "  📦 Framework: $test_framework"
echo "  🧪 Test Command: $test_command"

# Run initial test to see current failing state
echo "  🔴 Running initial test to verify RED phase..."
echo "  ⏱️ This may take 5-45 seconds depending on test suite size..."

set +e  # Allow tests to fail
initial_test_output=$(timeout 60 $test_command 2>&1)
initial_test_exit_code=$?
set -e

if [ $initial_test_exit_code -eq 0 ]; then
    echo "  ⚠️ WARNING: Tests are passing - expected failures for RED phase"
else
    echo "  ✅ RED phase confirmed: Tests are failing as expected"
fi

# Count test metrics
test_files=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l)
echo "  📊 Test files: $test_files"

# Step 3: Load implementation context
echo "📋 Loading implementation context..."

# Count tasks to implement
task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" | wc -l)
feature_name=$(jq -r '.feature_name // "Unknown Feature"' shared/artifacts/prd-summary.json)

echo "  🎯 Feature: $feature_name"
echo "  📝 Tasks to implement: $task_count"

# Step 4: Test development environment
echo "🔧 Testing development environment..."

# Check for linting capability
lint_available=false
if [ -f "package.json" ]; then
    if jq -e '.scripts.lint' package.json > /dev/null 2>&1; then
        lint_available=true
        lint_command=$(jq -r '.scripts.lint' package.json)
        echo "  ✅ Linting available: $lint_command"
    else
        echo "  ⚠️ No lint script found in package.json"
    fi
fi

# Check for type checking capability
typecheck_available=false
if [ -f "package.json" ]; then
    if jq -e '.scripts.typecheck' package.json > /dev/null 2>&1; then
        typecheck_available=true
        typecheck_command=$(jq -r '.scripts.typecheck' package.json)
        echo "  ✅ Type checking available: $typecheck_command"
    elif jq -e '.scripts."type-check"' package.json > /dev/null 2>&1; then
        typecheck_available=true
        typecheck_command=$(jq -r '.scripts."type-check"' package.json)
        echo "  ✅ Type checking available: $typecheck_command"
    else
        echo "  ⚠️ No typecheck script found in package.json"
    fi
fi

# Step 5: Load MCP tool status and update for Wave 3
echo "🤖 Loading MCP tool status for Wave 3..."

mcp_status_file="shared/coordination/mcp-status.json"
if [ -f "$mcp_status_file" ]; then
    context7_status=$(jq -r '.context7_available // false' "$mcp_status_file")
    zen_status=$(jq -r '.zen_available // false' "$mcp_status_file")
else
    context7_status="false"
    zen_status="false"
fi

# Update MCP status for Wave 3
cat > "$mcp_status_file" << EOF
{
  "context7_available": $context7_status,
  "zen_available": $zen_status,
  "wave3_checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "test_framework": "$test_framework",
  "wave3_mcp_commands": {
    "context7_patterns": "use context7 for $test_framework implementation patterns",
    "zen_codereview": "zen!codereview for comprehensive quality analysis",
    "context7_current": "use context7 for current framework version best practices"
  },
  "development_tools": {
    "lint_available": $lint_available,
    "typecheck_available": $typecheck_available,
    "test_command": "$test_command"
  }
}
EOF

# Step 6: Create implementation workspace
echo "📁 Creating implementation workspace..."

mkdir -p shared/artifacts/code

# Create implementation plan template
cat > shared/artifacts/code/implementation-plan.md << EOF
# Implementation Plan: $feature_name

**Generated**: $(date)
**Framework**: $test_framework
**Status**: Wave 3 Starting

## Current State
- **Total test files**: $test_files
- **Tasks to implement**: $task_count
- **Initial test status**: $([ $initial_test_exit_code -eq 0 ] && echo "PASSING (unexpected)" || echo "FAILING (expected)")
- **Test command**: \`$test_command\`

## Implementation Strategy
1. **Follow dependency order**: Implement tasks based on shared/artifacts/tasks/task-dependency-order.json
2. **TDD approach**: Make one test pass at a time
3. **Continuous verification**: Run tests after each implementation
4. **Quality gates**: Lint and typecheck after major changes

## Development Tools Available
$(if [ "$lint_available" = "true" ]; then echo "- ✅ Linting: \`$lint_command\`"; else echo "- ⚠️ Linting: Not configured"; fi)
$(if [ "$typecheck_available" = "true" ]; then echo "- ✅ Type checking: \`$typecheck_command\`"; else echo "- ⚠️ Type checking: Not configured"; fi)
- ✅ Testing: \`$test_command\`

## MCP Tool Integration Strategy
$(if [ "$context7_status" = "true" ]; then
    echo "- ✅ **context7**: Use for current $test_framework implementation patterns"
    echo "  - Get latest framework best practices"
    echo "  - Ensure current API usage and syntax"
    echo "  - Follow modern architectural patterns"
else
    echo "- ⚠️ **context7**: Not available - manual framework research needed"
fi)

$(if [ "$zen_status" = "true" ]; then
    echo "- ✅ **zen!codereview**: Use for continuous quality assurance"
    echo "  - Review complex implementation logic"
    echo "  - Multi-model validation for difficult decisions"
    echo "  - Performance and security analysis"
else
    echo "- ⚠️ **zen!codereview**: Not available - manual code review needed"
fi)

## Implementation Phases
1. **Setup Phase**: Understand test requirements and create implementation strategy
2. **Core Implementation**: Make failing tests pass systematically
3. **Quality Refinement**: Use zen!codereview and context7 for improvements
4. **Final Verification**: Comprehensive testing and quality checks

## Success Criteria
- [ ] All tests pass (GREEN phase achieved)
- [ ] Code follows framework best practices
- [ ] Lint and type checking clean
- [ ] All task acceptance criteria met
- [ ] Quality review completed
EOF

# Step 7: Prepare task implementation order
echo "📊 Analyzing task implementation order..."

# Load and display dependency order
if [ -f "shared/artifacts/tasks/task-dependency-order.json" ]; then
    echo "  📋 Task execution phases:"
    jq -r '.execution_order[] | "    Phase \(.phase): \(.tasks | join(", "))"' shared/artifacts/tasks/task-dependency-order.json
    
    critical_path=$(jq -r '.critical_path | join(" → ")' shared/artifacts/tasks/task-dependency-order.json)
    if [ "$critical_path" != "null" ] && [ -n "$critical_path" ]; then
        echo "  🔗 Critical path: $critical_path"
    fi
else
    echo "  ⚠️ No dependency order found - implement tasks individually"
fi

# Step 8: Update wave status
echo "📊 Updating wave status..."

jq '.current_wave = "3" | .wave3_started_at = now | .initial_test_status = $status' \
  --arg status "$([ $initial_test_exit_code -eq 0 ] && echo "passing" || echo "failing")" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 9: Display implementation context for Claude
echo "🧠 Preparing context for AI implementation..."

echo ""
echo "====== WAVE 3 SETUP COMPLETE ======"
echo ""
echo "📊 **Implementation Context**:"
echo "  - Feature: $feature_name"
echo "  - Tasks to implement: $task_count"
echo "  - Test files: $test_files"
echo "  - Initial state: $([ $initial_test_exit_code -eq 0 ] && echo "Tests passing (unexpected)" || echo "Tests failing (expected)")"
echo ""
echo "🎯 **Claude Focus Areas**:"
echo "  1. Analyze test requirements and understand expected interfaces"
echo "  2. Follow task dependency order for systematic implementation"
echo "  3. Use context7 for current framework implementation patterns"
echo "  4. Implement minimal code to make tests pass (TDD approach)"
echo "  5. Use zen!codereview for quality validation of complex logic"
echo "  6. Achieve GREEN phase with all tests passing"
echo ""
echo "📁 **Key Files for Implementation**:"
echo "  - Test files: All *.test.* and *.spec.* files"
echo "  - Task requirements: shared/artifacts/tasks/*.md"
echo "  - Dependency order: shared/artifacts/tasks/task-dependency-order.json"
echo "  - Implementation plan: shared/artifacts/code/implementation-plan.md"
echo "  - Test coverage: shared/artifacts/tests/test-coverage-report.md"
echo ""
echo "🛠️ **Development Commands**:"
echo "  - Run tests: $test_command"
$(if [ "$lint_available" = "true" ]; then echo "  - Lint code: $lint_command"; fi)
$(if [ "$typecheck_available" = "true" ]; then echo "  - Type check: $typecheck_command"; fi)
echo ""
echo "🤖 **MCP Commands to Use**:"
if [ "$context7_status" = "true" ]; then
    echo "  ✅ use context7 for $test_framework implementation patterns"
else
    echo "  ⚠️ Context7 not available - research patterns manually"
fi

if [ "$zen_status" = "true" ]; then
    echo "  ✅ zen!codereview for implementation quality analysis"
else
    echo "  ⚠️ Zen not available - manual code review needed"
fi
echo ""
echo "🎯 **TDD Goal**: Make all failing tests pass while maintaining code quality"
echo "✅ Ready for systematic TDD implementation with MCP enhancement!"
