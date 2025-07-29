#!/bin/bash
# Local CI simulation - runs the same checks as GitHub Actions

echo "🔬 LOCAL CI SIMULATION"
echo "===================="
echo "This script runs the exact same checks as the CI pipeline."
echo "No auto-fixing will be applied to match CI behavior."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track failures
FAILED_CHECKS=()
TOTAL_CHECKS=0

# Helper function to run checks
run_check() {
  local name=$1
  local command=$2
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  echo -e "${BLUE}[$TOTAL_CHECKS] Running: $name${NC}"
  echo "Command: $command"
  echo "----------------------------------------"
  
  if eval "$command"; then
    echo -e "${GREEN}✅ PASSED: $name${NC}\n"
  else
    echo -e "${RED}❌ FAILED: $name${NC}\n"
    FAILED_CHECKS+=("$name")
  fi
}

# Function to check for null safety compliance
check_null_safety() {
  local violations=$(pnpm biome check --reporter=json 2>/dev/null | jq -r '.diagnostics[] | select(.rule.name == "noNonNullAssertion") | "\(.location.path):\(.location.span.start.line) - \(.message)"' 2>/dev/null || echo "")
  
  if [ -z "$violations" ]; then
    echo -e "${GREEN}✅ Null safety compliance verified${NC}"
    return 0
  else
    echo -e "${RED}❌ Non-null assertions detected! This violates our null safety policy.${NC}"
    echo "Please fix these violations before merging:"
    echo "$violations"
    return 1
  fi
}

# Start timer
START_TIME=$(date +%s)

echo -e "${YELLOW}🏃 Starting CI checks...${NC}\n"

# 1. Dependency installation check
run_check "Dependency Installation" "pnpm install --frozen-lockfile --prefer-offline"

# 2. Biome linting (exact CI command)
run_check "Biome Linting" "pnpm biome check ."

# 3. Non-null assertion check
run_check "Null Safety Compliance" "check_null_safety"

# 4. TypeScript type checking
run_check "TypeScript Type Check" "pnpm typecheck"

# 5. Test suite
run_check "Test Suite" "pnpm test --run"

# 6. YAML formatting check
run_check "YAML Formatting" "pnpm prettier:yaml --check"

# 7. Build
run_check "Next.js Build" "pnpm build"

# 8. Security audit (warning only, like CI)
echo -e "${BLUE}[8] Running: Security Audit${NC}"
echo "Command: pnpm audit --audit-level moderate"
echo "----------------------------------------"
pnpm audit --audit-level moderate || echo -e "${YELLOW}⚠️  Security audit has warnings (non-blocking)${NC}\n"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 CI SIMULATION SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Duration: ${DURATION}s"
echo "Total checks: $TOTAL_CHECKS"
echo "Failed checks: ${#FAILED_CHECKS[@]}"

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 SUCCESS! All CI checks passed.${NC}"
  echo "Your code is ready to push and should pass CI."
  exit 0
else
  echo ""
  echo -e "${RED}❌ FAILURE! The following checks failed:${NC}"
  for check in "${FAILED_CHECKS[@]}"; do
    echo "  • $check"
  done
  echo ""
  echo -e "${YELLOW}💡 Fix these issues before pushing:${NC}"
  echo "  • Run 'pnpm biome:fix' to auto-fix formatting/linting"
  echo "  • Run 'pnpm typecheck' to see TypeScript errors"
  echo "  • Run 'pnpm test' to debug test failures"
  echo "  • Check logs above for specific error details"
  exit 1
fi