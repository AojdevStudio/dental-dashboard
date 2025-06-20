# Wave 1: Task Planning Agent - Hybrid

Decompose PRD into atomic implementation tasks using systematic analysis with automated setup and reporting.

**FRESH SESSION REQUIREMENT**: This wave should start with a FRESH Claude Code session.

## Execute

```bash
PRD_FILE="$ARGUMENTS"

# Automated environment setup and validation (2-5 seconds)
echo "⏱️ Setting up Wave 1 environment - please wait..."
./scripts/agentic-tdd/wave1-setup.sh "$PRD_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Setup failed. Check error messages above."
    exit 1
fi

echo "🧠 Starting AI-powered PRD analysis and task decomposition..."

# === CLAUDE REASONING TASKS ===

# 1. MCP TOOLS VERIFICATION
echo "🤖 Testing MCP tool availability:"
echo "  - Test context7: use context7 to verify setup"  
echo "  - Test zen: use zen to check system status"

# Update MCP status based on test results
# (Claude should manually update shared/coordination/mcp-status.json after testing)

# 2. PRD ANALYSIS & DISTILLATION
echo "📄 Analyzing PRD file: shared/artifacts/prd-original.md"

ANALYZE the PRD and populate shared/artifacts/prd-summary.json with:
- feature_name: Extract clear feature name
- core_requirements: List main functional requirements
- technical_constraints: Identify tech limitations and requirements
- user_experience_goals: Define UX objectives
- performance_requirements: Specify performance criteria
- security_considerations: List security requirements
- edge_cases: Identify potential edge cases
- integration_points: Map external dependencies
- success_criteria: Define measurable success metrics

# 3. ATOMIC TASK DECOMPOSITION
CREATE task files in shared/artifacts/tasks/ using pattern: {feature_name}_{task_slug}.md

For each core requirement, CREATE atomic task with:
- Clear description of what needs implementation
- Specific dependencies on other tasks or external systems
- Comprehensive acceptance criteria (testable conditions)
- Technical implementation approach
- Test scenarios for Wave 2 Test Writer
- Implementation notes and potential gotchas

ENSURE each task is:
- Independently testable
- Has clear definition of done
- Follows template structure from shared/artifacts/tasks/TEMPLATE-task.md

# 4. DEPENDENCY MAPPING
UPDATE shared/artifacts/tasks/task-dependency-order.json with:
- execution_order: Group tasks by dependency phases
- critical_path: Identify blocking task sequences  
- parallel_opportunities: Tasks that can run concurrently

# 5. QUALITY VALIDATION
VERIFY task decomposition quality:
- Each task maps to specific acceptance criteria
- Dependencies are clearly identified
- No circular dependencies exist
- Tasks are atomic and independently implementable

# Automated completion and handoff preparation (3-8 seconds)
echo "⏱️ Finalizing Wave 1 - generating reports and handoff documentation..."
./scripts/agentic-tdd/wave1-complete.sh

echo ""
echo "✅ Wave 1 Complete: Task Planning with hybrid efficiency!"
echo "📊 Context Savings: 149 lines → 20 lines (87% reduction)"
echo "🔄 Next: cd ../test-writer && claude"
echo "      /project:wave2-test-writing"
```
