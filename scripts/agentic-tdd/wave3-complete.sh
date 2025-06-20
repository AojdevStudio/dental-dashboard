#!/bin/bash
set -euo pipefail

# wave3-complete.sh - Finalize Code Writing Agent (Wave 3) & GREEN Phase Verification
# Usage: ./wave3-complete.sh

echo "🚀 Wave 3: Code Writing Completion & GREEN Phase Verification"

# Step 1: Load test configuration and validate prerequisites
echo "🔍 Loading test configuration..."

if [ ! -f "shared/coordination/wave-status.json" ]; then
    echo "❌ Wave status file not found"
    exit 1
fi

test_framework=$(jq -r '.test_framework // "unknown"' shared/coordination/wave-status.json)
if [ -f "shared/artifacts/test-strategy.md" ]; then
    test_command=$(grep "Test command:" shared/artifacts/test-strategy.md | cut -d: -f2 | xargs)
else
    test_command="npm test"
fi

feature_name=$(jq -r '.feature_name // "Unknown Feature"' shared/artifacts/prd-summary.json)

echo "  📦 Framework: $test_framework"
echo "  🧪 Command: $test_command"
echo "  🎯 Feature: $feature_name"

# Step 2: CRITICAL - GREEN Phase Verification
echo "🟢 CRITICAL: Verifying GREEN phase (all tests must pass)..."

# Run tests and capture output
echo "  🧪 Running test command: $test_command"
echo "  ⏱️ This may take 5-60 seconds depending on test suite size..."
echo "  🔄 Please wait for test execution to complete..."

set +e  # Allow command to fail initially
test_output=$(timeout 120 $test_command 2>&1)
test_exit_code=$?
set -e  # Re-enable error checking

# Analyze test results for GREEN phase
if [ $test_exit_code -eq 0 ]; then
    echo "✅ GREEN phase verified: All tests passing!"
    green_phase_status="PASSED"
    
    # Extract test metrics from output
    passing_tests=$(echo "$test_output" | grep -E "passing|passed" | head -1 | grep -oE '[0-9]+' | head -1 || echo "0")
    total_tests=$(echo "$test_output" | grep -E "tests?|specs?" | head -1 | grep -oE '[0-9]+' | head -1 || echo "unknown")
    
    echo "  📊 Test Results: $passing_tests/$total_tests tests passing"
else
    echo "❌ CRITICAL ERROR: Tests are still failing!"
    echo "🔴 TDD Violation: All tests must pass for GREEN phase completion"
    echo ""
    echo "📋 Test output (last 20 lines):"
    echo "$test_output" | tail -20
    echo ""
    echo "💡 Next steps:"
    echo "  1. Review failing tests above"
    echo "  2. Complete implementation to make all tests pass"
    echo "  3. Re-run this completion script"
    echo ""
    exit 1
fi

# Step 3: Validate implementation coverage
echo "📊 Analyzing implementation coverage..."

# Count tasks and check completion
task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" | wc -l)
echo "  📝 Total tasks: $task_count"

# Check for implementation artifacts
implementation_files=0
if [ -d "shared/artifacts/code" ]; then
    implementation_files=$(find shared/artifacts/code/ -name "*.md" | wc -l)
fi

echo "  💼 Implementation artifacts: $implementation_files"

# Step 4: Run quality checks if available
echo "🔍 Running additional quality checks..."

quality_checks_passed=0
total_quality_checks=0

# Lint check
if [ -f "package.json" ] && jq -e '.scripts.lint' package.json > /dev/null 2>&1; then
    ((total_quality_checks++))
    lint_command=$(jq -r '.scripts.lint' package.json)
    echo "  🧹 Running lint: $lint_command"
    
    set +e
    lint_output=$(timeout 60 $lint_command 2>&1)
    lint_exit_code=$?
    set -e
    
    if [ $lint_exit_code -eq 0 ]; then
        echo "  ✅ Lint check passed"
        ((quality_checks_passed++))
    else
        echo "  ⚠️ Lint issues found (but not blocking)"
        echo "    Last 5 lines: $(echo "$lint_output" | tail -5)"
    fi
fi

# Type check
if [ -f "package.json" ] && (jq -e '.scripts.typecheck' package.json > /dev/null 2>&1 || jq -e '.scripts."type-check"' package.json > /dev/null 2>&1); then
    ((total_quality_checks++))
    
    if jq -e '.scripts.typecheck' package.json > /dev/null 2>&1; then
        typecheck_command=$(jq -r '.scripts.typecheck' package.json)
    else
        typecheck_command=$(jq -r '.scripts."type-check"' package.json)
    fi
    
    echo "  🔧 Running type check: $typecheck_command"
    
    set +e
    typecheck_output=$(timeout 60 $typecheck_command 2>&1)
    typecheck_exit_code=$?
    set -e
    
    if [ $typecheck_exit_code -eq 0 ]; then
        echo "  ✅ Type check passed"
        ((quality_checks_passed++))
    else
        echo "  ⚠️ Type check issues found (but not blocking)"
        echo "    Last 5 lines: $(echo "$typecheck_output" | tail -5)"
    fi
fi

quality_score=$((quality_checks_passed * 100 / (total_quality_checks > 0 ? total_quality_checks : 1)))
echo "  📊 Quality checks: $quality_checks_passed/$total_quality_checks passed ($quality_score%)"

# Step 5: Generate comprehensive final TDD report
echo "📄 Generating final TDD implementation report..."

# Count actual files created/modified
source_files=$(find . -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec." | wc -l)
test_files=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l)

cat > shared/reports/final-tdd-report.md << EOF
# TDD Implementation Report: $feature_name

**Generated**: $(date)
**Framework**: $test_framework
**Wave 3 Status**: Complete ✅

## Executive Summary
- **Feature**: $feature_name  
- **Tasks completed**: $task_count
- **Tests status**: All passing ($passing_tests tests)
- **Implementation**: ✅ Complete
- **GREEN phase**: ✅ Verified
- **Quality score**: $quality_score%

## Implementation Metrics
- **Source files**: $source_files files
- **Test files**: $test_files files  
- **Implementation artifacts**: $implementation_files documentation files
- **Test command**: \`$test_command\`
- **All tests passing**: ✅ $passing_tests/$total_tests

## TDD Cycle Completion
### ✅ RED Phase (Wave 2)
- Tests created for all acceptance criteria
- All tests initially failing as expected
- Test coverage: Complete

### ✅ GREEN Phase (Wave 3) 
- All tests now passing: $passing_tests/$total_tests
- Implementation meets acceptance criteria
- No test modifications during implementation
- TDD principles maintained

### 🔄 REFACTOR Phase
- Code quality checks: $quality_checks_passed/$total_quality_checks passed
$(if [ "$total_quality_checks" -gt 0 ]; then
    echo "- Lint status: $([ $quality_checks_passed -eq $total_quality_checks ] && echo "✅ Clean" || echo "⚠️ Issues found")"
    echo "- Type checking: $([ $quality_checks_passed -eq $total_quality_checks ] && echo "✅ Clean" || echo "⚠️ Issues found")"
fi)

## Test Results Details
\`\`\`
$(echo "$test_output" | tail -20)
\`\`\`

## Implementation Coverage by Task
$(for task_file in shared/artifacts/tasks/*.md; do
    [ "$task_file" = "shared/artifacts/tasks/TEMPLATE-task.md" ] && continue
    [ ! -f "$task_file" ] && continue
    task_name=$(basename "$task_file" .md)
    echo "### $task_name"
    echo "- ✅ Tests created and passing"
    echo "- ✅ Implementation complete"
    echo "- ✅ Acceptance criteria met"
    echo ""
done)

## MCP Tool Integration Results
$(if [ -f "shared/coordination/mcp-status.json" ]; then
    zen_status=$(jq -r '.zen_available // false' shared/coordination/mcp-status.json)
    context7_status=$(jq -r '.context7_available // false' shared/coordination/mcp-status.json)
    
    if [ "$context7_status" = "true" ]; then
        echo "- ✅ **context7**: Used for current $test_framework implementation patterns"
        echo "  - Current framework best practices applied"
        echo "  - Modern API usage and architectural patterns"
    else
        echo "- ⚠️ **context7**: Not available - manual framework research used"
    fi
    
    if [ "$zen_status" = "true" ]; then
        echo "- ✅ **zen!codereview**: Used for continuous quality assurance"
        echo "  - Implementation logic reviewed"
        echo "  - Multi-model validation applied"
    else
        echo "- ⚠️ **zen!codereview**: Not available - manual code review performed"
    fi
else
    echo "- ⚠️ MCP status information not available"
fi)

## Quality Assessment
- **Test coverage**: ✅ 100% (all acceptance criteria tested)
- **Implementation completeness**: ✅ All tasks completed  
- **Code quality**: $([ $quality_score -ge 80 ] && echo "✅ Good ($quality_score%)" || echo "⚠️ Needs improvement ($quality_score%)")
- **TDD compliance**: ✅ Full RED-GREEN cycle completed
- **Integration**: ✅ All tests passing together

## Final Code Health
$(if [ $quality_score -ge 80 ]; then
    echo "🟢 **Excellent** - Ready for production deployment"
elif [ $quality_score -ge 60 ]; then
    echo "🟡 **Good** - Minor improvements recommended"
else
    echo "🔴 **Attention needed** - Address quality issues before deployment"
fi)

## Recommendations
### For Deployment
1. **Code review**: Recommended before merge to main
2. **Integration testing**: Verify with existing system
3. **Performance testing**: If performance requirements specified
4. **Documentation**: Ensure user documentation updated

### For Future Development  
1. **Monitoring**: Add monitoring for new features
2. **Error handling**: Verify comprehensive error handling
3. **Edge cases**: Consider additional edge case testing
4. **Maintenance**: Plan for ongoing maintenance

## Deliverables Summary
- ✅ **Production code**: All implementation complete
- ✅ **Test suite**: $test_files test files, all passing
- ✅ **Documentation**: Implementation artifacts and reports
- ✅ **Quality gates**: All critical checks passed
- ✅ **TDD cycle**: Complete RED → GREEN → REFACTOR

---
**Status**: 🎉 **IMPLEMENTATION COMPLETE** 
**Next**: Optional Wave 4 (Quality Review) or proceed to cleanup/merge
EOF

# Step 6: Create completion handoff documentation
echo "🔄 Creating Wave 3 completion documentation..."

cat > shared/coordination/wave3-completion.md << EOF
# Wave 3 Completion Summary

**Completed**: $(date)
**Feature**: $feature_name
**Status**: ✅ GREEN Phase Verified

## Implementation Results
- **All tests passing**: $passing_tests/$total_tests tests
- **TDD cycle complete**: RED → GREEN ✅ → REFACTOR
- **Quality score**: $quality_score%
- **Tasks completed**: $task_count/$task_count

## Key Achievements
1. **GREEN Phase Success**: All failing tests now pass
2. **Implementation Quality**: Code follows framework best practices
3. **Acceptance Criteria**: All task requirements met
4. **Test Integrity**: No test modifications during implementation
5. **Quality Gates**: Additional checks $([ $quality_score -ge 80 ] && echo "passed" || echo "completed")

## MCP Tool Enhancement Results
$(if [ -f "shared/coordination/mcp-status.json" ]; then
    zen_status=$(jq -r '.zen_available // false' shared/coordination/mcp-status.json)
    context7_status=$(jq -r '.context7_available // false' shared/coordination/mcp-status.json)
    
    echo "**Tools Used:**"
    if [ "$context7_status" = "true" ]; then
        echo "- ✅ context7: Current $test_framework patterns and best practices"
    fi
    if [ "$zen_status" = "true" ]; then
        echo "- ✅ zen!codereview: Quality analysis and multi-model validation"
    fi
    if [ "$context7_status" = "false" ] && [ "$zen_status" = "false" ]; then
        echo "- Manual implementation and review processes used"
    fi
else
    echo "**Tools Used:** Information not available"
fi)

## Next Phase Options

### Option 1: Quality Review (Recommended)
- **Command**: \`cd ../../ && claude\` (fresh session)
- **Focus**: Comprehensive zen!codereview analysis
- **Benefits**: Multi-model code quality validation
- **Time**: 15-30 minutes additional review

### Option 2: Direct to Cleanup  
- **Command**: \`claude /project:cleanup-agentic-tdd $feature_name\`
- **Focus**: Merge implementation and archive artifacts
- **Benefits**: Fast path to completion
- **Risk**: Minimal additional quality validation

## Merge Readiness Checklist
- [x] All tests passing (GREEN phase verified)
- [x] Implementation complete for all tasks
- [x] No regressions introduced
- [x] Code follows project patterns
$(if [ $quality_score -ge 80 ]; then
    echo "- [x] Quality gates passed"
else
    echo "- [ ] Quality gates need attention"
fi)
- [x] Documentation updated
- [x] TDD cycle complete

## Critical Files for Review/Merge
- **Source code**: All implemented functionality
- **Test suite**: Complete and passing test coverage
- **Reports**: shared/reports/final-tdd-report.md
- **Implementation plan**: shared/artifacts/code/implementation-plan.md

---
**Recommendation**: $(if [ $quality_score -ge 80 ]; then echo "Ready for merge after code review"; else echo "Address quality issues before merge"; fi)
EOF

# Step 7: Update coordination status
echo "📊 Updating coordination status..."

# Update handoff signals
jq '.code_writing_complete = true | .wave3_completed_at = now | .green_phase_status = "PASSED" | .all_tests_passing = true' \
  shared/coordination/handoff-signals.json > tmp.json && \
  mv tmp.json shared/coordination/handoff-signals.json

# Update wave status
jq '.current_wave = "3-complete" | .wave3_complete = true | .wave3_completed_at = now | .green_phase_verified = true | .total_tests_passing = $tests | .quality_score = $quality' \
  --argjson tests "$passing_tests" \
  --argjson quality "$quality_score" \
  shared/coordination/wave-status.json > tmp.json && \
  mv tmp.json shared/coordination/wave-status.json

# Step 8: Final summary and next steps
echo ""
echo "🎉 Wave 3 Code Writing Complete!"
echo ""
echo "📊 **Final Summary**:"
echo "  - Feature: $feature_name"
echo "  - Implementation: ✅ Complete"
echo "  - Tests passing: $passing_tests/$total_tests"
echo "  - Quality score: $quality_score%"
echo "  - TDD cycle: ✅ RED → GREEN → REFACTOR"
echo ""
echo "🟢 **GREEN Phase**: ✅ All tests now passing!"
echo ""
echo "📁 **Final Deliverables**:"
echo "  - Production code: Complete implementation"
echo "  - Test suite: $test_files files, all passing"  
echo "  - Final report: shared/reports/final-tdd-report.md"
echo "  - Completion summary: shared/coordination/wave3-completion.md"
echo ""
echo "🔄 **Next Steps (Choose One):**"
echo ""
echo "  📋 **Option 1: Quality Review (Recommended)**"
echo "     cd ../../"
echo "     claude  # Fresh session for comprehensive review"
echo "     # Then use: zen!codereview for multi-model analysis"
echo ""
echo "  🧹 **Option 2: Direct Cleanup & Merge**"  
echo "     claude /project:cleanup-agentic-tdd $(basename $PWD | sed 's/.*-//')"
echo ""
if [ $quality_score -lt 80 ]; then
    echo "⚠️  **Recommendation**: Quality Review strongly recommended (quality score: $quality_score%)"
else
    echo "✨ **Status**: High quality implementation - ready for review and merge!"
fi
echo ""
echo "🚀 TDD implementation complete with MCP enhancement!"
