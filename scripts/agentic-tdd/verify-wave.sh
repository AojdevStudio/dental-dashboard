#!/bin/bash
set -euo pipefail

# verify-wave.sh - Automated verification for agentic TDD waves
# Usage: ./verify-wave.sh <wave-number>

WAVE_NUMBER="${1:-}"

if [ -z "$WAVE_NUMBER" ]; then
    echo "❌ Error: Wave number required"
    echo "Usage: $0 1|2|3|4"
    exit 1
fi

echo "🔍 Wave $WAVE_NUMBER Verification"

# Initialize verification results
verification_file="shared/coordination/verification-results.json"
mkdir -p "shared/coordination"

if [ ! -f "$verification_file" ]; then
    echo '{}' > "$verification_file"
fi

# Common validation functions
validate_file_exists() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        echo "  ✅ $description: $file"
        return 0
    else
        echo "  ❌ $description missing: $file"
        return 1
    fi
}

validate_directory_exists() {
    local dir="$1"
    local description="$2"
    if [ -d "$dir" ]; then
        echo "  ✅ $description: $dir"
        return 0
    else
        echo "  ❌ $description missing: $dir"
        return 1
    fi
}

# Initialize verification results for this wave
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
issues=()
artifacts_verified=()

echo "📊 Starting verification checks for Wave $WAVE_NUMBER..."

case "$WAVE_NUMBER" in
    "1")
        echo "🎯 Verifying Wave 1: Task Planning"
        
        # Check core artifacts
        if validate_file_exists "shared/artifacts/prd-summary.json" "PRD Summary"; then
            artifacts_verified+=("prd-summary.json")
        else
            issues+=("PRD summary file missing")
        fi
        
        if validate_file_exists "shared/artifacts/tasks/task-dependency-order.json" "Task Dependencies"; then
            artifacts_verified+=("task-dependency-order.json")
        else
            issues+=("Task dependency order missing")
        fi
        
        if validate_file_exists "shared/coordination/wave1-handoff.md" "Wave 1 Handoff"; then
            artifacts_verified+=("wave1-handoff.md")
        else
            issues+=("Wave 1 handoff documentation missing")
        fi
        
        # Count task files
        task_count=$(find shared/artifacts/tasks/ -name "*.md" -not -name "TEMPLATE-*" 2>/dev/null | wc -l)
        echo "  📝 Task files found: $task_count"
        artifacts_verified+=("$task_count task files")
        
        if [ "$task_count" -eq 0 ]; then
            issues+=("No task files found")
        fi
        
        # Check MCP status
        mcp_status="unknown"
        if [ -f "shared/coordination/mcp-status.json" ]; then
            context7_status=$(jq -r '.context7_available // "unknown"' shared/coordination/mcp-status.json)
            zen_status=$(jq -r '.zen_available // "unknown"' shared/coordination/mcp-status.json)
            echo "  🤖 MCP Status - Context7: $context7_status, Zen: $zen_status"
            artifacts_verified+=("mcp-status.json")
        else
            issues+=("MCP status not documented")
        fi
        
        # Check handoff signals
        task_planning_complete="false"
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            task_planning_complete=$(jq -r '.task_planning_complete // false' shared/coordination/handoff-signals.json)
        fi
        
        ready_for_next_wave=$([ ${#issues[@]} -eq 0 ] && [ "$task_planning_complete" = "true" ] && echo "true" || echo "false")
        
        # Update verification results
        jq --argjson verified "$([ ${#issues[@]} -eq 0 ] && echo true || echo false)" \
           --arg timestamp "$timestamp" \
           --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
           --argjson artifacts "$(printf '%s\n' "${artifacts_verified[@]}" | jq -R . | jq -s .)" \
           --arg context7 "$context7_status" \
           --arg zen "$zen_status" \
           --argjson ready "$ready_for_next_wave" \
           '.wave1 = {
               "verified": $verified,
               "timestamp": $timestamp,
               "issues": $issues,
               "artifacts_verified": $artifacts,
               "mcp_status": {"context7": $context7, "zen": $zen},
               "ready_for_next_wave": $ready
           }' "$verification_file" > tmp.json && mv tmp.json "$verification_file"
        ;;
        
    "2")
        echo "🧪 Verifying Wave 2: Test Writing"
        
        # Check prerequisites
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            task_planning_complete=$(jq -r '.task_planning_complete // false' shared/coordination/handoff-signals.json)
            if [ "$task_planning_complete" != "true" ]; then
                issues+=("Wave 1 must complete before Wave 2")
            fi
        else
            issues+=("Handoff signals file missing")
        fi
        
        # Check test artifacts
        if validate_file_exists "shared/artifacts/tests/test-coverage-report.md" "Test Coverage Report"; then
            artifacts_verified+=("test-coverage-report.md")
        else
            issues+=("Test coverage report missing")
        fi
        
        if validate_file_exists "shared/coordination/wave2-handoff.md" "Wave 2 Handoff"; then
            artifacts_verified+=("wave2-handoff.md")
        else
            issues+=("Wave 2 handoff documentation missing")
        fi
        
        # Count test files
        test_files=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l)
        echo "  🧪 Test files found: $test_files"
        artifacts_verified+=("$test_files test files")
        
        if [ "$test_files" -eq 0 ]; then
            issues+=("No test files found")
        fi
        
        # RED phase verification
        red_phase_confirmed="false"
        if [ "$test_files" -gt 0 ]; then
            echo "  🔴 Checking RED phase (tests should fail)..."
            test_command="npm test"
            if [ -f "shared/artifacts/test-strategy.md" ]; then
                test_command=$(grep "Test command:" shared/artifacts/test-strategy.md | cut -d: -f2 | xargs || echo "npm test")
            fi
            
            set +e
            timeout 60 $test_command > /dev/null 2>&1
            test_exit_code=$?
            set -e
            
            if [ $test_exit_code -ne 0 ]; then
                echo "  ✅ RED phase confirmed: Tests failing as expected"
                red_phase_confirmed="true"
            else
                echo "  ⚠️ RED phase issue: Tests passing (should be failing)"
                issues+=("RED phase not confirmed - tests should be failing")
            fi
        fi
        
        # Check MCP usage
        zen_testgen_used="unknown"
        context7_used="unknown"
        if [ -f "shared/coordination/mcp-status.json" ]; then
            zen_testgen_used=$(jq -r '.wave2_zen_testgen_used // "unknown"' shared/coordination/mcp-status.json)
            context7_used=$(jq -r '.wave2_context7_used // "unknown"' shared/coordination/mcp-status.json)
            echo "  🤖 MCP Usage - zen!testgen: $zen_testgen_used, context7: $context7_used"
        fi
        
        test_writing_complete="false"
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            test_writing_complete=$(jq -r '.test_writing_complete // false' shared/coordination/handoff-signals.json)
        fi
        
        ready_for_next_wave=$([ ${#issues[@]} -eq 0 ] && [ "$test_writing_complete" = "true" ] && echo "true" || echo "false")
        
        # Update verification results
        jq --argjson verified "$([ ${#issues[@]} -eq 0 ] && echo true || echo false)" \
           --arg timestamp "$timestamp" \
           --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
           --argjson artifacts "$(printf '%s\n' "${artifacts_verified[@]}" | jq -R . | jq -s .)" \
           --arg zen_testgen "$zen_testgen_used" \
           --arg context7_frameworks "$context7_used" \
           --argjson red_phase "$red_phase_confirmed" \
           --argjson ready "$ready_for_next_wave" \
           '.wave2 = {
               "verified": $verified,
               "timestamp": $timestamp,
               "issues": $issues,
               "artifacts_verified": $artifacts,
               "mcp_usage": {"zen_testgen": $zen_testgen, "context7_frameworks": $context7_frameworks},
               "red_phase_confirmed": $red_phase,
               "ready_for_next_wave": $ready
           }' "$verification_file" > tmp.json && mv tmp.json "$verification_file"
        ;;
        
    "3")
        echo "🚀 Verifying Wave 3: Code Writing"
        
        # Check prerequisites
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            test_writing_complete=$(jq -r '.test_writing_complete // false' shared/coordination/handoff-signals.json)
            if [ "$test_writing_complete" != "true" ]; then
                issues+=("Wave 2 must complete before Wave 3")
            fi
        else
            issues+=("Handoff signals file missing")
        fi
        
        # Check implementation artifacts
        if validate_file_exists "shared/reports/final-tdd-report.md" "Final TDD Report"; then
            artifacts_verified+=("final-tdd-report.md")
        else
            issues+=("Final TDD report missing")
        fi
        
        if validate_file_exists "shared/coordination/wave3-completion.md" "Wave 3 Completion"; then
            artifacts_verified+=("wave3-completion.md")
        else
            issues+=("Wave 3 completion documentation missing")
        fi
        
        # GREEN phase verification
        green_phase_confirmed="false"
        test_command="npm test"
        if [ -f "shared/artifacts/test-strategy.md" ]; then
            test_command=$(grep "Test command:" shared/artifacts/test-strategy.md | cut -d: -f2 | xargs || echo "npm test")
        fi
        
        echo "  🟢 Checking GREEN phase (tests should pass)..."
        set +e
        timeout 120 $test_command > /dev/null 2>&1
        test_exit_code=$?
        set -e
        
        if [ $test_exit_code -eq 0 ]; then
            echo "  ✅ GREEN phase confirmed: All tests passing"
            green_phase_confirmed="true"
        else
            echo "  ❌ GREEN phase failed: Tests still failing"
            issues+=("GREEN phase not achieved - tests still failing")
        fi
        
        # Quality checks
        quality_checks_passed=0
        total_quality_checks=0
        
        if [ -f "package.json" ] && jq -e '.scripts.lint' package.json > /dev/null 2>&1; then
            ((total_quality_checks++))
            echo "  🧹 Running lint check..."
            set +e
            timeout 60 $(jq -r '.scripts.lint' package.json) > /dev/null 2>&1
            lint_exit_code=$?
            set -e
            
            if [ $lint_exit_code -eq 0 ]; then
                ((quality_checks_passed++))
                echo "  ✅ Lint check passed"
            else
                echo "  ⚠️ Lint issues found"
            fi
        fi
        
        if [ -f "package.json" ] && (jq -e '.scripts.typecheck' package.json > /dev/null 2>&1 || jq -e '.scripts."type-check"' package.json > /dev/null 2>&1); then
            ((total_quality_checks++))
            echo "  🔧 Running type check..."
            set +e
            if jq -e '.scripts.typecheck' package.json > /dev/null 2>&1; then
                timeout 60 $(jq -r '.scripts.typecheck' package.json) > /dev/null 2>&1
            else
                timeout 60 $(jq -r '.scripts."type-check"' package.json) > /dev/null 2>&1
            fi
            typecheck_exit_code=$?
            set -e
            
            if [ $typecheck_exit_code -eq 0 ]; then
                ((quality_checks_passed++))
                echo "  ✅ Type check passed"
            else
                echo "  ⚠️ Type check issues found"
            fi
        fi
        
        quality_score=$((quality_checks_passed * 100 / (total_quality_checks > 0 ? total_quality_checks : 1)))
        echo "  📊 Quality score: $quality_score% ($quality_checks_passed/$total_quality_checks checks passed)"
        
        # Check MCP usage
        context7_patterns_used="unknown"
        zen_review_used="unknown"
        if [ -f "shared/coordination/mcp-status.json" ]; then
            context7_patterns_used=$(jq -r '.wave3_context7_patterns_used // "unknown"' shared/coordination/mcp-status.json)
            zen_review_used=$(jq -r '.wave3_zen_review_used // "unknown"' shared/coordination/mcp-status.json)
            echo "  🤖 MCP Usage - context7 patterns: $context7_patterns_used, zen review: $zen_review_used"
        fi
        
        code_writing_complete="false"
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            code_writing_complete=$(jq -r '.code_writing_complete // false' shared/coordination/handoff-signals.json)
        fi
        
        ready_for_next_wave=$([ ${#issues[@]} -eq 0 ] && [ "$code_writing_complete" = "true" ] && echo "true" || echo "false")
        
        # Update verification results
        jq --argjson verified "$([ ${#issues[@]} -eq 0 ] && echo true || echo false)" \
           --arg timestamp "$timestamp" \
           --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
           --argjson artifacts "$(printf '%s\n' "${artifacts_verified[@]}" | jq -R . | jq -s .)" \
           --arg context7_patterns "$context7_patterns_used" \
           --arg zen_review "$zen_review_used" \
           --argjson green_phase "$green_phase_confirmed" \
           --argjson ready "$ready_for_next_wave" \
           --argjson quality_score "$quality_score" \
           '.wave3 = {
               "verified": $verified,
               "timestamp": $timestamp,
               "issues": $issues,
               "artifacts_verified": $artifacts,
               "mcp_usage": {"context7_patterns": $context7_patterns, "zen_review": $zen_review},
               "green_phase_confirmed": $green_phase,
               "quality_score": $quality_score,
               "ready_for_next_wave": $ready
           }' "$verification_file" > tmp.json && mv tmp.json "$verification_file"
        ;;
        
    "4")
        echo "🏆 Verifying Wave 4: Quality Review"
        
        # Check prerequisites
        if [ -f "shared/coordination/handoff-signals.json" ]; then
            code_writing_complete=$(jq -r '.code_writing_complete // false' shared/coordination/handoff-signals.json)
            if [ "$code_writing_complete" != "true" ]; then
                issues+=("Wave 3 must complete before Wave 4")
            fi
        else
            issues+=("Handoff signals file missing")
        fi
        
        # Check quality artifacts
        if validate_file_exists "shared/reports/quality-assurance-report.md" "Quality Assurance Report"; then
            artifacts_verified+=("quality-assurance-report.md")
        else
            issues+=("Quality assurance report missing")
        fi
        
        # Check comprehensive zen review
        zen_comprehensive_review="incomplete"
        if [ -f "shared/coordination/mcp-status.json" ]; then
            zen_comprehensive_review=$(jq -r '.wave4_zen_comprehensive_review // "incomplete"' shared/coordination/mcp-status.json)
            echo "  🤖 Zen comprehensive review: $zen_comprehensive_review"
        fi
        
        # Multi-model analysis check
        multi_model_analysis="incomplete"
        if [ -f "shared/coordination/mcp-status.json" ]; then
            multi_model_analysis=$(jq -r '.wave4_multi_model_analysis // "incomplete"' shared/coordination/mcp-status.json)
            echo "  🧠 Multi-model analysis: $multi_model_analysis"
        fi
        
        # Final quality score
        final_quality_score=0
        if [ -f "shared/reports/quality-assurance-report.md" ]; then
            final_quality_score=$(grep -oE "Quality Score: [0-9]+" shared/reports/quality-assurance-report.md | grep -oE "[0-9]+" | head -1 || echo "0")
        fi
        echo "  📊 Final quality score: $final_quality_score/100"
        
        deployment_ready=$([ ${#issues[@]} -eq 0 ] && [ "$zen_comprehensive_review" = "complete" ] && [ $final_quality_score -ge 80 ] && echo "true" || echo "false")
        
        # Update verification results
        jq --argjson verified "$([ ${#issues[@]} -eq 0 ] && echo true || echo false)" \
           --arg timestamp "$timestamp" \
           --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
           --argjson artifacts "$(printf '%s\n' "${artifacts_verified[@]}" | jq -R . | jq -s .)" \
           --argjson quality_score "$final_quality_score" \
           --arg zen_comprehensive_review "$zen_comprehensive_review" \
           --arg multi_model_analysis "$multi_model_analysis" \
           --argjson deployment_ready "$deployment_ready" \
           '.wave4 = {
               "verified": $verified,
               "timestamp": $timestamp,
               "issues": $issues,
               "artifacts_verified": $artifacts,
               "quality_score": $quality_score,
               "zen_comprehensive_review": $zen_comprehensive_review,
               "multi_model_analysis": $multi_model_analysis,
               "deployment_ready": $deployment_ready
           }' "$verification_file" > tmp.json && mv tmp.json "$verification_file"
        ;;
        
    *)
        echo "❌ Invalid wave number: $WAVE_NUMBER"
        echo "Valid waves: 1 (Task Planning), 2 (Test Writing), 3 (Code Writing), 4 (Quality Review)"
        exit 1
        ;;
esac

# Display results
echo ""
echo "🔍 Wave $WAVE_NUMBER Verification Complete"
echo "📊 Issues found: ${#issues[@]}"
echo "📁 Artifacts verified: ${#artifacts_verified[@]}"

if [ ${#issues[@]} -eq 0 ]; then
    echo "✅ Wave $WAVE_NUMBER verification PASSED"
    echo "📋 All required artifacts present and valid"
    echo "🤖 MCP tool integration documented"
    echo "✨ Ready for AI analysis and next phase guidance"
    exit 0
else
    echo "❌ Wave $WAVE_NUMBER verification FAILED"
    echo "🔧 Issues requiring attention:"
    for issue in "${issues[@]}"; do
        echo "  - $issue"
    done
    echo "⚠️ Resolve issues before proceeding"
    exit 1
fi