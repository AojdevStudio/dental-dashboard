# Cleanup Agentic TDD - Hybrid

Merge completed TDD workflow results and cleanup infrastructure with automated integration and comprehensive reporting.

## Execute

```bash
FEATURE_NAME="$ARGUMENTS"

# Validate feature name provided
if [ -z "$FEATURE_NAME" ]; then
    echo "❌ Error: Feature name is required"
    echo "Usage: /project:cleanup-agentic-tdd 'my-feature-name'"
    exit 1
fi

echo "🧹 Starting Enhanced Agentic TDD Cleanup for: $FEATURE_NAME"
echo "📊 Context Efficiency: Script automation + AI integration analysis"

# Execute automated cleanup process (may take 15-45 seconds)
echo "⏱️ Executing cleanup and merge process - please wait 15-45 seconds..."
./scripts/agentic-tdd/cleanup-agentic-tdd.sh "$FEATURE_NAME"

# Check cleanup results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Enhanced Agentic TDD Cleanup Complete!"
    echo "📊 Context Savings: Manual process → Automated integration"
    echo "🏗️  Architecture: Script automation + AI workflow analysis"
    echo ""
    echo "🔍 What was automated:"
    echo "  ✅ Prerequisite verification and completion validation"
    echo "  ✅ Code integration and merge conflict resolution"
    echo "  ✅ Final test suite execution and quality verification"
    echo "  ✅ Pull request creation with comprehensive documentation"
    echo "  ✅ Worktree cleanup and branch management"
    echo "  ✅ Workflow artifact archival and preservation"
    echo ""
    
    # === CLAUDE REASONING TASKS ===
    
    # Post-cleanup AI analysis tasks
    echo "🧠 AI Analysis Tasks for Enhanced Workflow:"
    
    # 1. WORKFLOW EFFECTIVENESS ANALYSIS
    echo "📊 Analyzing overall workflow effectiveness and MCP integration..."
    
    ANALYZE the complete workflow results:
    - Review final TDD report for quality metrics and outcomes
    - Assess MCP tool integration effectiveness across all waves
    - Identify workflow efficiency gains and improvement opportunities
    - Evaluate hybrid script + AI approach success metrics
    
    # 2. MCP TOOL IMPACT ASSESSMENT
    echo "🤖 Evaluating MCP tool impact on development quality..."
    
    EVALUATE MCP tool contributions:
    - Context7: Assess framework documentation integration effectiveness
    - Zen: Analyze test generation, code review, and quality assurance impact
    - Compare development quality with and without MCP enhancement
    - Document lessons learned for future workflow optimization
    
    # 3. CODE QUALITY AND INTEGRATION REVIEW
    echo "🔍 Reviewing code quality and integration success..."
    
    REVIEW integration outcomes:
    - Assess final code quality against industry standards
    - Validate TDD cycle completion (RED → GREEN → REFACTOR)
    - Check integration test results and deployment readiness
    - Identify any post-merge optimization opportunities
    
    # 4. FUTURE WORKFLOW OPTIMIZATION
    echo "🔄 Planning future workflow enhancements and optimizations..."
    
    PLAN workflow improvements:
    - Suggest script automation enhancements based on this execution
    - Recommend MCP tool usage optimizations for future projects
    - Identify areas where AI reasoning can be further enhanced
    - Document best practices for team adoption and scaling
    
    echo ""
    echo "📁 Key Files for Analysis:"
    echo "  - Final TDD report: docs/features/final-tdd-report.md"
    echo "  - Quality assurance: docs/features/quality-assurance-report.md (if Wave 4 completed)"
    echo "  - Workflow archive: .agentic-tdd-archives/$FEATURE_NAME-*/"
    echo "  - Pull request: Check console output above for PR URL"
    echo ""
    echo "🎯 Focus Areas:"
    echo "  • Assess development velocity improvements with hybrid approach"
    echo "  • Evaluate MCP tool effectiveness for code quality enhancement"
    echo "  • Analyze TDD cycle adherence and test coverage quality"
    echo "  • Plan workflow scaling strategies for team adoption"
    echo ""
    echo "✨ Ready for comprehensive workflow analysis and optimization planning!"
    
else
    echo ""
    echo "❌ Cleanup process failed!"
    echo "🔧 Issues encountered - check error messages above"
    echo ""
    echo "🧠 AI Analysis Tasks for Troubleshooting:"
    echo "  1. Review cleanup script output for specific failure points"
    echo "  2. Identify root causes of integration or merge issues"
    echo "  3. Suggest remediation strategies for cleanup failures"
    echo "  4. Create step-by-step recovery plan"
    echo "  5. Document improvements to prevent similar issues"
    echo ""
    echo "🔧 Debug: Test cleanup script independently:"
    echo "   ./scripts/agentic-tdd/cleanup-agentic-tdd.sh '$FEATURE_NAME'"
    exit 1
fi
```