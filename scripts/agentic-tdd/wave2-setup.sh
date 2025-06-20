#!/bin/bash
set -euo pipefail

# wave2-setup.sh - Setup for Test Writing Agent (Wave 2)
# Usage: ./wave2-setup.sh

echo "🧪 Wave 2: Test Writing Agent Setup"

# Step 1: Validate prerequisites
echo "🔍 Checking Wave 1 completion..."

if [ ! -d "shared" ]; then
    echo "❌ Error: shared directory not found"
    echo "💡 Ensure you're in the correct worktree: trees/test-writer"
    exit 1
fi

# Check Wave 1 completion
if [ ! -f "shared/coordination/handoff-signals.json" ]; then
    echo "❌ Error: Handoff signals file not found"
    exit 1
fi

task_planning_complete=$(jq -r '.task_planning_complete // false' shared/coordination/handoff-signals.json)
if [ "$task_planning_complete" != "true" ]; then
    echo "❌ Wave 1 must complete before starting Wave 2"
    echo "💡 Run Wave 1 first: cd ../task-planner && /project:wave1-task-planning"
    exit 1
fi

# Verify required artifacts exist
required_artifacts=(
    "shared/artifacts/prd-summary.json"
    "shared/artifacts/tasks/task-dependency-order.json"
    "shared/coordination/wave1-handoff.md"
)

missing_artifacts=()
for artifact in "${required_artifacts[@]}"; do
    if [ ! -f "$artifact" ]; then
        missing_artifacts+=("$artifact")
    fi
done

if [ ${#missing_artifacts[@]} -gt 0 ]; then
    echo "❌ Missing required Wave 1 artifacts:"
    printf '  - %s\n' "${missing_artifacts[@]}"
    exit 1
fi

# Step 2: Count available tasks
task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" | wc -l)
echo "📝 Found $task_count task files to create tests for"

if [ "$task_count" -eq 0 ]; then
    echo "❌ No task files found from Wave 1"
    exit 1
fi

# Step 3: Detect test framework and project structure
echo "🔍 Detecting test framework and project structure..."

# Check for common test frameworks
test_framework="unknown"
test_command="npm test"
test_pattern="**/*.test.*"

if [ -f "package.json" ]; then
    # Check for specific frameworks
    if grep -q "vitest" package.json; then
        test_framework="vitest"
        test_command="vitest"
        test_pattern="**/*.{test,spec}.{js,ts}"
    elif grep -q "jest" package.json; then
        test_framework="jest"
        test_command="jest"
        test_pattern="**/*.{test,spec}.{js,ts}"
    elif grep -q "mocha" package.json; then
        test_framework="mocha"
        test_command="mocha"
        test_pattern="**/*.{test,spec}.{js,ts}"
    elif grep -q "cypress" package.json; then
        test_framework="cypress"
        test_command="cypress run"
        test_pattern="cypress/**/*.{cy,spec}.{js,ts}"
    fi
    
    # Try to get actual test command from package.json
    actual_test_cmd=$(jq -r '.scripts.test // empty' package.json 2>/dev/null)
    if [ -n "$actual_test_cmd" ]; then
        test_command="$actual_test_cmd"
    fi
fi

echo "  📦 Test Framework: $test_framework"
echo "  🧪 Test Command: $test_command"
echo "  📁 Test Pattern: $test_pattern"

# Step 4: Create test strategy workspace
echo "📋 Creating test strategy workspace..."

mkdir -p shared/artifacts/tests

# Create test strategy template
feature_name=$(jq -r '.feature_name // "Unknown Feature"' shared/artifacts/prd-summary.json)

cat > shared/artifacts/test-strategy.md << EOF
# Test Strategy for $feature_name

**Generated**: $(date)
**Framework**: $test_framework
**Command**: $test_command

## Test Framework Setup
- Primary framework: $test_framework
- Test command: $test_command
- Test file pattern: $test_pattern
- Test directory: $(find . -type d -name "__tests__" -o -name "test" -o -name "tests" | head -1 || echo "tests/")

## Coverage Strategy
- Unit tests for each acceptance criterion
- Integration tests for component interactions  
- Edge case tests for error conditions
- Performance tests where specified in tasks

## Test Organization
- One test file per task (when appropriate)
- Grouped test suites for related functionality
- Clear test naming for traceability to acceptance criteria

## Mocking Strategy
- External dependencies to mock: TBD (analyze during test creation)
- Internal components to isolate: TBD
- Data setup requirements: TBD

## MCP Tool Integration
- zen!testgen: For comprehensive test generation with edge cases
- context7: For up-to-date $test_framework testing patterns and best practices

## Red Phase Verification
- All tests must fail initially (RED phase of TDD)
- Failure reasons should be clear and actionable
- Test command: $test_command
EOF

# Step 5: Test MCP tool availability
echo "🤖 Testing MCP tool availability..."

# Load existing MCP status
mcp_status_file="shared/coordination/mcp-status.json"
if [ -f "$mcp_status_file" ]; then
    context7_status=$(jq -r '.context7_available // false' "$mcp_status_file")
    zen_status=$(jq -r '.zen_available // false' "$mcp_status_file")
else
    context7_status="false"
    zen_status="false"
fi

# Update MCP status for Wave 2
cat > "$mcp_status_file" << EOF
{
  "context7_available": $context7_status,
  "zen_available": $zen_status,
  "wave2_checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "test_framework": "$test_framework",
  "wave2_mcp_commands": {
    "context7_test": "use context7 for $test_framework testing best practices",
    "zen_testgen": "zen!testgen for comprehensive test generation",
    "context7_patterns": "use context7 for $test_framework current version patterns"
  }
}
EOF

# Step 6: Analyze existing test structure
echo "🔍 Analyzing existing test structure..."

# Find existing test files
existing_tests=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
echo "  📊 Existing test files: $existing_tests"

# Find test directories
test_dirs=$(find . -type d \( -name "__tests__" -o -name "test" -o -name "tests" \) 2>/dev/null || true)
if [ -n "$test_dirs" ]; then
    echo "  📁 Test directories found:"
    echo "$test_dirs" | sed 's/^/    /'
else
    echo "  📁 No standard test directories found"
fi

# Step 7: Create test file templates and organization
echo "📝 Preparing test file organization..."

# Create test templates directory
mkdir -p shared/artifacts/tests/templates

# Create basic test template
cat > shared/artifacts/tests/templates/test-template.js << 'EOF'
/**
 * Tests for: {Task Title}
 * Task file: shared/artifacts/tasks/{task_file}
 * 
 * Acceptance Criteria Coverage:
 * - [ ] AC1: Description of criterion 1
 * - [ ] AC2: Description of criterion 2
 * - [ ] AC3: Description of criterion 3
 */

describe('{Feature/Component}', () => {
  // Setup and teardown
  beforeEach(() => {
    // Test setup
  });

  afterEach(() => {
    // Test cleanup
  });

  // Tests for each acceptance criterion
  describe('Acceptance Criterion 1', () => {
    it('should handle happy path scenario', () => {
      // Failing test - no implementation yet
      expect(implementedFunction()).toBe(expectedResult);
    });

    it('should handle edge case scenario', () => {
      // Failing test for edge case
      expect(implementedFunction(edgeInput)).toBe(expectedEdgeResult);
    });
  });

  // Error condition tests
  describe('Error Handling', () => {
    it('should throw appropriate error for invalid input', () => {
      expect(() => implementedFunction(invalidInput))
        .toThrow('Expected error message');
    });
  });
});
EOF

# Step 8: Update wave status
echo "📊 Updating wave status..."

jq '.current_wave = "2" | .wave2_started_at = now | .test_framework = $framework' \
  --arg framework "$test_framework" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 9: Display context for Claude
echo "🧠 Preparing context for AI test generation..."

echo ""
echo "====== WAVE 2 SETUP COMPLETE ======"
echo ""
echo "📊 **Project Analysis**:"
echo "  - Feature: $feature_name"
echo "  - Tasks to test: $task_count"
echo "  - Test framework: $test_framework"
echo "  - Test command: $test_command"
echo "  - Existing tests: $existing_tests"
echo ""
echo "🎯 **Claude Focus Areas**:"
echo "  1. Load task acceptance criteria for test creation"
echo "  2. Use zen!testgen for comprehensive test generation"
echo "  3. Use context7 for current $test_framework patterns"
echo "  4. Create failing tests that validate all acceptance criteria"
echo "  5. Design edge cases and error condition tests"
echo ""
echo "📁 **Key Files for Analysis**:"
echo "  - Task files: shared/artifacts/tasks/*.md"
echo "  - PRD context: shared/artifacts/prd-summary.json"
echo "  - Dependency order: shared/artifacts/tasks/task-dependency-order.json"
echo "  - Test strategy: shared/artifacts/test-strategy.md"
echo ""
echo "🤖 **MCP Commands to Use**:"
if [ "$context7_status" = "true" ]; then
    echo "  ✅ use context7 for $test_framework testing best practices"
else
    echo "  ⚠️  Context7 not available - use manual framework research"
fi

if [ "$zen_status" = "true" ]; then
    echo "  ✅ zen!testgen for task acceptance criteria and edge cases"
else
    echo "  ⚠️  Zen not available - use manual test generation"
fi
echo ""
echo "🔴 **Remember**: All tests must FAIL initially (RED phase of TDD)"
echo "✅ Ready for AI-powered test generation with MCP enhancement!"
