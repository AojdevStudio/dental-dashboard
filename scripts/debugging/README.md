# Debugging Scripts

This directory contains scripts for debugging application issues, analyzing data integrity, and security scanning.

## Scripts

### Provider Debugging
- **`debug-provider-detection.cjs`** - Debugs provider detection logic and identifies issues
- **`debug-provider-relationships.ts`** - Analyzes provider relationship data
- **`provider-relationships-summary.ts`** - Generates summary reports of provider relationships

### Security and Safety
- **`null-safety-report.js`** - Generates reports on null safety violations
- **`scan-contamination.js`** - Scans for test data contamination in production
- **`security-scan.js`** - Performs security vulnerability scanning

## Usage

### Provider Debugging
```bash
# Debug provider detection issues
node scripts/debugging/debug-provider-detection.cjs

# Analyze provider relationships
pnpm dlx tsx scripts/debugging/debug-provider-relationships.ts

# Generate provider summary
pnpm dlx tsx scripts/debugging/provider-relationships-summary.ts
```

### Security Scanning
```bash
# Check for null safety issues
node scripts/debugging/null-safety-report.js

# Scan for data contamination
node scripts/debugging/scan-contamination.js

# Run security scan
node scripts/debugging/security-scan.js
```

## Output

Most debugging scripts generate detailed console output or create report files. Some may create log files in the project root or designated output directories.

## Safety Notes

- Debugging scripts are read-only and safe to run against any environment
- Security scans may flag false positives - review results carefully
- Provider debugging scripts help identify data inconsistencies without modifying data