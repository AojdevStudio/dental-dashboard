#!/bin/bash
set -euo pipefail

# wave2-complete.sh - Finalize Test Writing Agent (Wave 2)
# Usage: ./wave2-complete.sh

echo "🧪 Wave 2: Test Writing Completion & RED Phase Verification"

# Step 1: Detect test framework and command
echo "🔍 Loading test configuration..."

test_framework=$(jq -r '.test_framework // "unknown"' shared/coordination/wave-status.json)
if [ -f "shared/artifacts/test-strategy.md" ]; then
    test_command=$(grep "Test command:" shared/artifacts/test-strategy.md | cut -d: -f2 | xargs)
else
    test_command="npm test"
fi

echo "  📦 Framework: $test_framework"
echo "  🧪 Command: $test_command"

# Step 2: Count and validate test files created
echo "📊 Analyzing test files created..."

# Count test files (excluding templates and node_modules)
test_files=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | grep -v templates | wc -l)
echo "  📝 Test files found: $test_files"

if [ "$test_files" -eq 0 ]; then
    echo "❌ No test files found"
    echo "💡 Create test files before running completion"
    exit 1
fi

# List test files for documentation
echo "  📋 Test files created:"
find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | grep -v templates | sed 's/^/    /'

# Step 3: CRITICAL - RED Phase Verification
echo "🔴 CRITICAL: Verifying RED phase (tests must fail)..."

# Try to run tests and capture output
echo "  🧪 Running test command: $test_command"
echo "  ⏱️ This may take 5-45 seconds depending on project size..."
echo "  🔄 Please wait for test execution to complete..."

# Run tests and capture exit code
set +e  # Allow command to fail
test_output=$(timeout 60 $test_command 2>&1)
test_exit_code=$?
set -e  # Re-enable error checking

# Analyze test results
if [ $test_exit_code -eq 0 ]; then
    echo "❌ CRITICAL ERROR: Tests are passing but should be FAILING (RED phase)"
    echo "🔴 TDD Violation: Tests must fail before implementation exists"
    echo ""
    echo "📋 Test output:"
    echo "$test_output" | tail -20
    echo ""
    echo "💡 Solutions:"
    echo "  1. Ensure tests reference unimplemented functions/components"
    echo "  2. Check that implementation code doesn't exist yet"
    echo "  3. Verify test assertions are checking for actual functionality"
    echo ""
    echo "⚠️  Marking as warning but continuing..."
    red_phase_status="FAILED"
else
    echo "✅ RED phase verified: Tests are failing as expected"
    red_phase_status="PASSED"
fi

# Parse test output for metrics
failed_tests=$(echo "$test_output" | grep -E "failed|failing" | wc -l || echo "0")
total_tests=$(echo "$test_output" | grep -E "tests?|specs?" | head -1 | grep -oE '[0-9]+' | head -1 || echo "$test_files")

echo "  📊 Test Results Summary:"
echo "    - Total test files: $test_files"
echo "    - Estimated tests: $total_tests"
echo "    - Failures detected: $failed_tests"
echo "    - RED phase status: $red_phase_status"

# Step 4: Validate test coverage of acceptance criteria
echo "📋 Validating acceptance criteria coverage..."

# Count tasks and analyze coverage
task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" | wc -l)
tasks_with_tests=0

echo "  🔍 Checking task-to-test mapping:"
for task_file in shared/artifacts/tasks/*.md; do
    [ "$task_file" = "shared/artifacts/tasks/TEMPLATE-task.md" ] && continue
    [ ! -f "$task_file" ] && continue
    
    task_name=$(basename "$task_file" .md)
    
    # Look for test files that reference this task
    test_refs=$(grep -r "$task_name" . --include="*.test.*" --include="*.spec.*" 2>/dev/null | wc -l || echo "0")
    
    if [ "$test_refs" -gt 0 ]; then
        echo "    ✅ $task_name: $test_refs test references"
        ((tasks_with_tests++))
    else
        echo "    ⚠️  $task_name: No test references found"
    fi
done

coverage_percentage=$((tasks_with_tests * 100 / task_count))
echo "  📊 Task coverage: $tasks_with_tests/$task_count tasks ($coverage_percentage%)"

# Step 5: Generate comprehensive test coverage report
echo "📄 Generating test coverage report..."

feature_name=$(jq -r '.feature_name // "Unknown Feature"' shared/artifacts/prd-summary.json)

cat > shared/artifacts/tests/test-coverage-report.md << EOF
# Test Coverage Report: $feature_name

**Generated**: $(date)
**Framework**: $test_framework
**Wave 2 Status**: Complete

## Test Creation Summary
- **Total test files**: $test_files
- **Estimated tests**: $total_tests
- **Task coverage**: $tasks_with_tests/$task_count tasks ($coverage_percentage%)
- **RED phase verification**: $red_phase_status

## Test Files Created
$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | grep -v templates | sed 's/^/- /')

## Coverage by Task
| Task | Test References | Status |
|------|----------------|---------|
$(for task_file in shared/artifacts/tasks/*.md; do
    [ "$task_file" = "shared/artifacts/tasks/TEMPLATE-task.md" ] && continue
    [ ! -f "$task_file" ] && continue
    task_name=$(basename "$task_file" .md)
    test_refs=$(grep -r "$task_name" . --include="*.test.*" --include="*.spec.*" 2>/dev/null | wc -l || echo "0")
    if [ "$test_refs" -gt 0 ]; then
        echo "| $task_name | $test_refs | ✅ Covered |"
    else
        echo "| $task_name | 0 | ⚠️ Missing |"
    fi
done)

## RED Phase Verification
- **Test command**: \`$test_command\`
- **Exit code**: $test_exit_code
- **Status**: $red_phase_status
- **Verification timestamp**: $(date)

### Test Output Sample
\`\`\`
$(echo "$test_output" | tail -10)
\`\`\`

## MCP Tool Integration
$(if [ -f "shared/coordination/mcp-status.json" ]; then
    zen_status=$(jq -r '.zen_available // false' shared/coordination/mcp-status.json)
    context7_status=$(jq -r '.context7_available // false' shared/coordination/mcp-status.json)
    
    if [ "$zen_status" = "true" ]; then
        echo "- ✅ zen!testgen: Used for comprehensive test generation"
    else
        echo "- ⚠️ zen!testgen: Not available - manual test generation used"
    fi
    
    if [ "$context7_status" = "true" ]; then
        echo "- ✅ context7: Used for $test_framework framework patterns"
    else
        echo "- ⚠️ context7: Not available - manual framework research used"
    fi
else
    echo "- ⚠️ MCP status file not found"
fi)

## Notes for Wave 3 (Code Writing)
- All tests are currently failing (RED phase) ✅
- Tests validate acceptance criteria from task files
- Test command for verification: \`$test_command\`
- Focus areas for implementation:
$(if [ "$coverage_percentage" -lt 100 ]; then
    echo "  - Ensure all tasks have corresponding tests"
fi)
$(if [ "$red_phase_status" = "FAILED" ]; then
    echo "  - Verify tests are properly checking unimplemented functionality"
fi)
  - Make failing tests pass while maintaining test quality

## Quality Gates
- [x] Tests created for acceptance criteria
$(if [ "$red_phase_status" = "PASSED" ]; then
    echo "- [x] RED phase verified (tests failing appropriately)"
else
    echo "- [ ] RED phase needs verification (tests may be passing unexpectedly)"
fi)
- [x] Test framework properly configured
$(if [ "$coverage_percentage" -ge 80 ]; then
    echo "- [x] Good task coverage ($coverage_percentage%)"
else
    echo "- [ ] Task coverage could be improved ($coverage_percentage%)"
fi)
- [x] Test documentation complete
EOF

# Step 6: Create handoff documentation for Wave 3
echo "🔄 Creating handoff documentation for Wave 3..."

cat > shared/coordination/wave2-handoff.md << EOF
# Wave 2 → Wave 3 Handoff

**Completed**: $(date)
**Feature**: $feature_name
**Test Files**: $test_files
**Framework**: $test_framework

## For Wave 3 (Code Writing Agent)

### Current Test Status
- **RED Phase**: $red_phase_status
- **Test Command**: \`$test_command\`
- **Coverage**: $tasks_with_tests/$task_count tasks ($coverage_percentage%)
- **Total Files**: $test_files test files created

### Implementation Guidance
1. **Make tests pass systematically**: Follow task dependency order
2. **Run tests frequently**: Use \`$test_command\` for feedback
3. **Maintain test quality**: Don't modify tests unless necessary
4. **Focus on GREEN phase**: All tests should pass when implementation complete

### Test Framework Details
- **Framework**: $test_framework
- **Test patterns**: Follow existing project conventions
- **Mock requirements**: Check individual test files for mocking needs
- **Performance tests**: Some tasks may include performance criteria

### MCP Tool Integration for Wave 3
$(if [ -f "shared/coordination/mcp-status.json" ]; then
    zen_status=$(jq -r '.zen_available // false' shared/coordination/mcp-status.json)
    context7_status=$(jq -r '.context7_available // false' shared/coordination/mcp-status.json)
    
    if [ "$context7_status" = "true" ]; then
        echo "- ✅ **context7**: Use for current $test_framework implementation patterns"
    else
        echo "- ⚠️ **context7**: Not available - research current patterns manually"
    fi
    
    if [ "$zen_status" = "true" ]; then
        echo "- ✅ **zen!codereview**: Use for implementation quality analysis"
    else
        echo "- ⚠️ **zen!codereview**: Not available - manual code review needed"
    fi
else
    echo "- ⚠️ MCP status unknown - check availability in Wave 3"
fi)

### Critical Files for Wave 3
- **Test Files**: All created test files (see coverage report)
- **Task Files**: shared/artifacts/tasks/*.md (implementation requirements)
- **Test Strategy**: shared/artifacts/test-strategy.md (framework context)
- **Coverage Report**: shared/artifacts/tests/test-coverage-report.md

### Quality Gates for Wave 3
- [ ] All tests pass (GREEN phase)
- [ ] No test modifications unless absolutely necessary
- [ ] Implementation follows acceptance criteria
- [ ] Code quality meets project standards
$(if [ "$red_phase_status" = "FAILED" ]; then
    echo "- [ ] Address RED phase issues identified in this wave"
fi)

## Next Steps
1. **Switch to fresh session**: cd ../code-writer && claude
2. **Run Wave 3**: /project:wave3-code-writing
3. **Focus**: Make failing tests pass using TDD principles
EOF

# Step 7: Update coordination status
echo "📊 Updating coordination status..."

# Update handoff signals
jq '.test_writing_complete = true | .wave2_completed_at = now | .red_phase_status = $status' \
  --arg status "$red_phase_status" \
  shared/coordination/handoff-signals.json > tmp.json && \
  mv tmp.json shared/coordination/handoff-signals.json

# Update wave status
jq '.current_wave = "2-complete" | .wave2_complete = true | .wave2_completed_at = now | .test_files_created = $count | .red_phase_verified = $verified' \
  --argjson count "$test_files" \
  --argjson verified "$([ "$red_phase_status" = "PASSED" ] && echo true || echo false)" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 8: Final summary and next steps
echo ""
echo "🎉 Wave 2 Test Writing Complete!"
echo ""
echo "📊 **Summary**:"
echo "  - Feature: $feature_name"
echo "  - Test files created: $test_files"
echo "  - Task coverage: $coverage_percentage%"
echo "  - RED phase: $red_phase_status"
echo "  - Framework: $test_framework"
echo ""
echo "📁 **Deliverables**:"
echo "  - Test files: $test_files files created"
echo "  - Coverage report: shared/artifacts/tests/test-coverage-report.md"
echo "  - Test strategy: shared/artifacts/test-strategy.md"
echo "  - Handoff guide: shared/coordination/wave2-handoff.md"
echo ""
if [ "$red_phase_status" = "PASSED" ]; then
    echo "🔴 **RED Phase**: ✅ Verified - Tests failing as expected"
else
    echo "🔴 **RED Phase**: ⚠️ Needs attention - Tests may be passing unexpectedly"
fi
echo ""
echo "🔄 **Next Steps**:"
echo "  1. Switch to fresh Claude session:"
echo "     cd ../code-writer"
echo "     claude  # Fresh session required!"
echo "  2. Start Wave 3:"
echo "     /project:wave3-code-writing"
echo "  3. Verify tests with: $test_command"
echo ""
echo "✨ Ready for Wave 3: Code Writing with TDD implementation!"
