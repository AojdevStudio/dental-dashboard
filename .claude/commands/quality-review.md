# Wave 4: Quality Review Agent

Comprehensive quality assurance using zen!codereview and multi-model analysis.

**FRESH SESSION REQUIREMENT**
⚠️ This MUST start with a FRESH Claude Code session for comprehensive analysis.

**PREREQUISITE CHECK**

VERIFY Wave 3 completion:
- CHECK `shared/coordination/handoff-signals.json` code_writing_complete is true
- CONFIRM all tests passing in wave3 worktree
- READ `shared/coordination/wave3-completion.md` for implementation summary
- VERIFY MCP tools available for quality analysis

If Wave 3 not complete, EXIT with message: "❌ Wave 3 must complete before quality review"

**PHASE 1: COMPREHENSIVE CODEBASE ANALYSIS**

SETUP quality review context:
- LOAD implementation summary from `shared/coordination/wave3-completion.md`
- READ final TDD report from `shared/reports/final-tdd-report.md`
- SCAN all implemented code in wave3 worktree
- VERIFY MCP tools: zen and context7 availability

ESTABLISH quality baselines:
- RUN full test suite: `cd trees/wave3-code-writing && pnpm test`
- READ Biome config: `biome.json`
- RUN linting: `pnpm:biome:check`
- RUN type checking: `pnpm run typecheck`
- DOCUMENT current quality metrics

**PHASE 2: ZEN COMPREHENSIVE CODE REVIEW**

SYSTEMATIC REPOSITORY ANALYSIS:
- RUN `zen!codereview` on entire codebase for comprehensive analysis
- FOCUS on severity-based issue prioritization
- IDENTIFY security vulnerabilities and performance bottlenecks
- ANALYZE code maintainability and architectural decisions

MULTI-MODEL QUALITY ASSESSMENT:
- USE Gemini Pro for deep architectural analysis: "zen use Gemini for architectural review"
- LEVERAGE O3 for logical consistency: "zen use O3 to validate business logic"
- GET diverse perspectives on complex implementations
- EVALUATE adherence to SOLID principles and design patterns

FRAMEWORK-SPECIFIC QUALITY CHECKS:
- USE context7 for latest quality standards: "use context7 for {framework} code quality best practices"
- VERIFY current security patterns: "use context7 for {framework} security guidelines"
- CHECK performance optimization techniques: "use context7 for {framework} performance optimization"

**PHASE 3: ISSUE PRIORITIZATION & RESOLUTION**

CATEGORIZE findings by severity:
- **CRITICAL**: Security vulnerabilities, data integrity issues
- **HIGH**: Performance problems, maintainability concerns
- **MEDIUM**: Code style inconsistencies, minor optimizations
- **LOW**: Documentation improvements, cosmetic changes

RESOLUTION STRATEGY with MCP assistance:
- ADDRESS critical and high-priority issues immediately
- USE zen for refactoring guidance: "zen review this refactoring approach"
- GET context7 assistance for current best practices
- LEVERAGE multi-model problem-solving for complex issues

VALIDATION after each fix:
- RUN affected tests: `pnpm test {test-pattern}`
- VERIFY no regressions: `pnpm test` (full suite)
- RE-RUN zen!codereview on modified areas
- UPDATE quality metrics

**PHASE 4: FINAL QUALITY ASSURANCE**

COMPREHENSIVE VALIDATION:
- RUN complete test suite with coverage: `pnpm test --coverage`
- VERIFY all quality gates pass: linting, type checking, security scans
- CONFIRM performance benchmarks meet requirements
- VALIDATE accessibility standards (if applicable)

DOCUMENTATION QUALITY REVIEW:
- REVIEW all JSDoc comments for accuracy and completeness
- VERIFY README updates reflect new functionality
- CONFIRM API documentation is current
- CHECK code comments explain business logic appropriately

DEPLOYMENT READINESS CHECK:
- VERIFY environment configuration completeness
- CONFIRM database migration scripts (if applicable)
- VALIDATE CI/CD pipeline compatibility
- CHECK dependency security and licensing

**PHASE 5: QUALITY REPORT GENERATION**

CREATE comprehensive quality report at `shared/reports/quality-assurance-report.md`:
```markdown
# Quality Assurance Report: {Feature Name}

## Executive Summary
- Overall Quality Score: {score}/100
- Critical Issues: {count} (all resolved)
- High Priority Issues: {count} ({resolved} resolved)
- Code Coverage: {percentage}%
- Performance Benchmarks: ✅ All passed

## Zen Code Review Results
- Total Issues Found: {count}
- Issues by Severity:
  - Critical: {count} ✅ Resolved
  - High: {count} ✅ Resolved  
  - Medium: {count} ✅ Resolved
  - Low: {count} 📝 Documented for future

## Multi-Model Analysis Insights
- Gemini Architectural Review: {summary}
- O3 Logic Validation: {summary}
- Context7 Best Practices: {compliance percentage}

## Quality Gates Status
- ✅ All tests passing ({count} tests)
- ✅ Linting clean (no violations)
- ✅ Type checking passed
- ✅ Security scan clean
- ✅ Performance benchmarks met
- ✅ Code coverage above threshold

## Deployment Readiness
- ✅ Environment configuration complete
- ✅ Documentation updated
- ✅ CI/CD pipeline validated
- ✅ Dependencies secure and licensed

## Recommendations for Production
1. {Production deployment recommendations}
2. {Monitoring and alerting suggestions}
3. {Future improvement opportunities}
```

**PHASE 6: HANDOFF PREPARATION**

UPDATE coordination files:
- SET `shared/coordination/wave-status.json` current_wave to 4, completed_waves to [1,2,3,4]
- SET `shared/coordination/handoff-signals.json` quality_review_complete to true
- CREATE `shared/coordination/wave4-completion.md` with deployment readiness summary

PREPARE for cleanup:
- RUN `/compact preserve quality improvements, deployment readiness, and critical insights`
- ENSURE all quality artifacts are in shared/ directory
- DOCUMENT any remaining manual verification steps
- PREPARE comprehensive handoff to cleanup phase

**PHASE 7: COMPLETION VERIFICATION**

FINAL quality checklist:
- [ ] All zen!codereview issues addressed (critical and high priority)
- [ ] Multi-model analysis complete and insights documented
- [ ] Quality gates passing (tests, lint, types, security)
- [ ] Performance benchmarks met
- [ ] Documentation complete and accurate
- [ ] Deployment readiness confirmed

OUTPUT completion message:
```
✅ Wave 4 Complete: Quality Review
🏆 Quality Score: {score}/100
🔍 Zen Issues: {total} found, {resolved} resolved
🤖 Multi-model analysis complete
📊 All quality gates: ✅ PASSED
🚀 Production ready

Next: Cleanup and merge
cd ../../
claude  # NEW session for cleanup!
/project:cleanup-agentic-tdd {feature-name}
```