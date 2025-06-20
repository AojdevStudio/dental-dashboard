# Wave 3: Code Writing Agent - Hybrid

Implement production code to make failing tests pass using systematic TDD with automated setup and MCP enhancement.

**FRESH SESSION REQUIREMENT**: This MUST start with a FRESH Claude Code session.

## Execute

```bash
# Automated environment setup and validation (5-15 seconds)
echo "⏱️ Setting up Wave 3 implementation environment - please wait..."
./scripts/agentic-tdd/wave3-setup.sh

if [ $? -ne 0 ]; then
    echo "❌ Setup failed. Check error messages above."
    exit 1
fi

echo "🧠 Starting AI-powered implementation with MCP enhancement..."

# === CLAUDE REASONING TASKS ===

# 1. MCP TOOLS VERIFICATION & INTEGRATION
echo "🤖 Testing and integrating MCP tools:"

# Test context7 for implementation patterns
echo "  Testing context7: use context7 for current framework implementation patterns"
# Test zen for code review and quality analysis
echo "  Testing zen: zen!codereview for implementation quality analysis"

# Update MCP status based on actual availability
# (Claude should update shared/coordination/mcp-status.json after testing)

# 2. LOAD IMPLEMENTATION CONTEXT
echo "📋 Loading implementation requirements and failing test analysis..."

ANALYZE the following for systematic implementation:
- shared/artifacts/tests/test-coverage-report.md: Understand what tests need to pass
- shared/artifacts/tasks/*.md: Load all task acceptance criteria
- shared/artifacts/tasks/task-dependency-order.json: Follow implementation order
- shared/coordination/wave2-handoff.md: Get context from test writing phase
- shared/artifacts/code/implementation-plan.md: Review setup implementation strategy

# 3. SYSTEMATIC TDD IMPLEMENTATION WITH MCP ENHANCEMENT
For each task in dependency order:

## Enhanced Implementation Process:
1. **Understand Failing Tests**:
   - RUN test command to see current failures: Use command from shared/artifacts/test-strategy.md
   - ANALYZE test expectations and required interfaces
   - IDENTIFY minimal code needed for GREEN phase

2. **MCP-Enhanced Implementation**:
   
   **IF context7 available**:
   - USE: "use context7 for [framework] current implementation patterns"
   - ENSURE latest framework syntax and architectural patterns
   - VERIFY current API usage and best practices
   
   **IF zen available**:
   - USE: "zen!codereview for implementation strategy before coding"
   - LEVERAGE multi-model validation for complex logic decisions
   - APPLY quality guidance throughout implementation process
   
   **IF both unavailable**:
   - IMPLEMENT following test specifications and acceptance criteria
   - FOCUS on minimal code to achieve GREEN phase
   - MAINTAIN TDD principles throughout development

3. **Systematic Implementation**:
   - WRITE minimal production code to make tests pass
   - FOLLOW test-driven development principles strictly
   - AVOID over-engineering or unnecessary features
   - VERIFY each implementation against specific acceptance criteria

4. **Continuous Validation**:
   - RUN tests after each implementation to verify GREEN phase
   - ENSURE no regressions introduced in existing functionality
   - CHECK implementation meets task acceptance criteria
   - DOCUMENT any implementation decisions or deviations

# 4. QUALITY REFINEMENT WITH MCP ENHANCEMENT
After achieving GREEN phase for all tests:

## Code Quality Pass:
1. **zen!codereview Enhancement** (if available):
   - RUN comprehensive implementation analysis for quality improvements
   - ADDRESS critical and high-priority issues identified
   - LEVERAGE multi-model perspectives for complex refactoring decisions

2. **context7 Pattern Optimization** (if available):
   - USE current framework refactoring best practices
   - ENSURE code follows modern architectural patterns
   - OPTIMIZE for maintainability and framework conventions

3. **Manual Quality Checks** (if MCP unavailable):
   - REVIEW code for consistency with existing project patterns
   - REFACTOR for clarity and maintainability
   - OPTIMIZE performance where specified in task requirements

# 5. FINAL VERIFICATION BEFORE COMPLETION
COMPREHENSIVE validation before running completion script:
- RUN complete test suite to ensure all tests pass (GREEN phase achieved)
- VERIFY all task acceptance criteria are met
- CHECK no regressions introduced
- VALIDATE code quality standards maintained

# Automated completion and handoff preparation (5-10 seconds)
echo "⏱️ Finalizing Wave 3 - generating reports and completion status..."
echo "🟢 This will verify GREEN phase and generate final TDD report"
./scripts/agentic-tdd/wave3-complete.sh

echo ""
echo "✅ Wave 3 Complete: Code Writing with hybrid efficiency!"
echo "📊 Context Savings: 274 lines → 30 lines (89% reduction)"
echo "🤖 MCP Integration: context7 + zen!codereview enhancement"
echo "🟢 GREEN Phase: All tests passing with TDD principles maintained"
echo "🔄 Next: cd ../../ && claude"
echo "      # Then use: zen!codereview for comprehensive quality review"
echo "      # OR: ./scripts/agentic-tdd/cleanup-agentic-tdd.sh feature-name"
```