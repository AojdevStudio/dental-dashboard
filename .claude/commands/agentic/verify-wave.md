# Verify Wave - Hybrid

Check completion status and readiness for next wave in agentic TDD workflow with automated verification and MCP status analysis.

## Execute

```bash
WAVE_NUMBER="$ARGUMENTS"

# Validate wave number provided
if [ -z "$WAVE_NUMBER" ]; then
    echo "❌ Error: Wave number is required"
    echo "Usage: /project:verify-wave 1|2|3|4"
    exit 1
fi

echo "🔍 Starting Wave $WAVE_NUMBER verification..."
echo "📊 Hybrid Verification: Script automation + AI analysis"

# Execute automated verification script (may take 5-15 seconds)
echo "⏱️ Running automated verification checks - please wait..."
./scripts/agentic-tdd/verify-wave.sh "$WAVE_NUMBER"

# Check verification results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Wave $WAVE_NUMBER Verification Complete!"
    echo "📊 Context Efficiency: Automated verification + focused guidance"
    echo "🏗️  Architecture: Script validation + AI insight"
    echo ""
    echo "🔍 What was automated:"
    echo "  ✅ Artifact existence and structure validation"
    echo "  ✅ File count and content verification"
    echo "  ✅ Test execution and phase confirmation"
    echo "  ✅ MCP tool usage documentation analysis"
    echo ""
    
    # === CLAUDE REASONING TASKS ===
    
    # Load verification results for AI analysis
    echo "🧠 AI Analysis Tasks:"
    
    # 1. VERIFICATION RESULTS ANALYSIS
    echo "📋 Analyzing verification results for quality insights..."
    
    ANALYZE the automated verification results:
    - shared/coordination/verification-results.json: Review all automated checks
    - Identify any patterns in verification failures across waves
    - Assess MCP tool integration effectiveness
    - Evaluate workflow quality and adherence to TDD principles
    
    # 2. MCP TOOL USAGE ASSESSMENT
    echo "🤖 Evaluating MCP tool integration effectiveness..."
    
    EVALUATE MCP tool usage based on wave:
    - IF Wave 1: Assess context7 usage for framework understanding
    - IF Wave 2: Analyze zen!testgen effectiveness and context7 integration
    - IF Wave 3: Review context7 pattern usage and zen!codereview impact
    - IF Wave 4: Evaluate comprehensive zen analysis and multi-model insights
    
    # 3. WORKFLOW QUALITY ASSESSMENT
    echo "📊 Assessing overall workflow quality and next steps..."
    
    PROVIDE workflow quality insights:
    - Identify strengths in current wave execution
    - Highlight areas for improvement in subsequent waves
    - Recommend MCP tool optimization strategies
    - Suggest process refinements for better outcomes
    
    # 4. NEXT WAVE PREPARATION GUIDANCE
    echo "🔄 Preparing guidance for next wave execution..."
    
    PREPARE next wave guidance:
    - IF Wave 1 verified: Optimize Wave 2 test strategy based on task complexity
    - IF Wave 2 verified: Enhance Wave 3 implementation approach based on test patterns
    - IF Wave 3 verified: Plan Wave 4 quality review focus areas
    - IF Wave 4 verified: Prepare comprehensive cleanup and deployment strategy
    
    echo ""
    echo "📁 Key Files for Analysis:"
    echo "  - Verification results: shared/coordination/verification-results.json"
    echo "  - Wave status: shared/coordination/wave-status.json"
    echo "  - Handoff signals: shared/coordination/handoff-signals.json"
    echo "  - MCP status: shared/coordination/mcp-status.json"
    echo ""
    echo "✨ Ready for AI-powered verification analysis and next wave guidance!"
    
else
    echo ""
    echo "❌ Wave $WAVE_NUMBER verification failed!"
    echo "🔧 Issues found - check verification report above"
    echo ""
    echo "🧠 AI Analysis Tasks:"
    echo "  1. Review verification failures in shared/coordination/verification-results.json"
    echo "  2. Identify root causes and provide remediation strategies"
    echo "  3. Suggest improvements to prevent similar issues"
    echo "  4. Create action plan for resolving verification failures"
    echo ""
    echo "⚠️  Resolve issues before proceeding to next wave"
    exit 1
fi
```