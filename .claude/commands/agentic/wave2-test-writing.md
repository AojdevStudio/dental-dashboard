# Wave 2: Test Writing Agent - Hybrid

Create comprehensive failing tests using zen!testgen and context7 with automated setup and RED phase verification.

**FRESH SESSION REQUIREMENT**: This MUST start with a FRESH Claude Code session.

## Execute

```bash
# Automated prerequisites validation and test environment setup (5-15 seconds)
echo "⏱️ Setting up test environment and detecting framework - please wait..."
./scripts/agentic-tdd/wave2-setup.sh

if [ $? -ne 0 ]; then
    echo "❌ Setup failed. Check error messages above."
    exit 1
fi

echo "🧠 Starting AI-powered test generation with MCP enhancement..."

# === CLAUDE REASONING TASKS ===

# 1. MCP TOOLS VERIFICATION & INTEGRATION
echo "🤖 Testing and integrating MCP tools:"

# Test context7 for framework patterns
echo "  Testing context7: use context7 for current framework testing best practices"
# Test zen for test generation  
echo "  Testing zen: zen!testgen for comprehensive test generation"

# Update MCP status based on actual availability
# (Claude should update shared/coordination/mcp-status.json after testing)

# 2. LOAD TASK CONTEXT FOR TEST CREATION
echo "📋 Loading task acceptance criteria for test generation..."

ANALYZE the following for test creation:
- shared/artifacts/tasks/*.md: Load all task acceptance criteria
- shared/artifacts/prd-summary.json: Understand feature context
- shared/artifacts/tasks/task-dependency-order.json: Follow test creation order
- shared/artifacts/test-strategy.md: Use detected framework patterns

# 3. SYSTEMATIC TEST GENERATION WITH MCP ENHANCEMENT
For each task file in dependency order:

## Enhanced Test Generation Process:
1. **Load Task Requirements**:
   - READ task acceptance criteria completely
   - IDENTIFY test scenarios provided in task file
   - UNDERSTAND implementation expectations

2. **MCP-Enhanced Test Creation**:
   
   **IF zen available**:
   - USE: "zen!testgen for [task name] with comprehensive edge cases and error conditions"
   - PROMPT zen with task acceptance criteria and expected behaviors
   - ENHANCE generated tests with framework-specific patterns
   
   **IF context7 available**:
   - USE: "use context7 for [framework] testing best practices and current patterns"
   - ENSURE test patterns match current framework versions
   - VERIFY testing library methods and syntax are up-to-date
   
   **IF both unavailable**:
   - CREATE comprehensive tests manually following task specifications
   - COVER every acceptance criterion with specific tests
   - INCLUDE edge cases and error conditions from task files

3. **Test File Creation**:
   - CREATE test files following detected framework conventions
   - USE pattern: {component}.test.{ext} or {feature}.spec.{ext}
   - INCLUDE header linking to task file and acceptance criteria
   - ENSURE tests FAIL appropriately (RED phase requirement)

4. **Quality Validation**:
   - VERIFY each acceptance criterion has corresponding test
   - ENSURE edge cases and error conditions are covered
   - CHECK that tests reference unimplemented functionality
   - VALIDATE test naming and organization

# 4. TEST SCENARIOS TO COVER
For each task, CREATE tests for:
- **Happy path scenarios**: Normal operation cases
- **Edge cases**: Boundary conditions and limits
- **Error conditions**: Invalid inputs and failure scenarios  
- **Integration points**: External dependency interactions
- **Performance criteria**: If specified in task requirements

# 5. RED PHASE VERIFICATION PREPARATION
ENSURE all tests are designed to FAIL because:
- Tests reference functions/components that don't exist yet
- Tests check for behavior that hasn't been implemented
- Tests validate acceptance criteria for unbuilt features

# Automated RED phase verification and handoff preparation (10-60 seconds)
echo "⏱️ Running tests for RED phase verification - may take 10-60 seconds..."
echo "🔴 This will run your test suite to ensure tests fail appropriately"
./scripts/agentic-tdd/wave2-complete.sh

echo ""
echo "✅ Wave 2 Complete: Test Writing with hybrid efficiency!"
echo "📊 Context Savings: 223 lines → 25 lines (89% reduction)"
echo "🤖 MCP Integration: zen!testgen + context7 framework patterns"
echo "🔴 RED Phase: Automated verification of test failures"
echo "🔄 Next: cd ../code-writer && claude"
echo "      /project:wave3-code-writing"
```
