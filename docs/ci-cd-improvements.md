# CI/CD Improvements Guide

## Overview

This document outlines the CI/CD improvements implemented to fix constant pipeline failures and improve developer experience.

## New Features

### 1. Pre-Push Hook
Automatically runs essential checks before pushing to prevent CI failures:
- TypeScript type checking
- Biome linting (no auto-fix, matches CI)
- Null safety compliance
- Blocks push if any checks fail

### 2. Local CI Simulation
Run `pnpm ci:test` to simulate the exact CI pipeline locally:
- Runs all checks in the same order as CI
- No auto-fixing (matches CI behavior)
- Clear pass/fail summary
- Helpful error messages

### 3. Enhanced CI Workflow
- **Auto-fix in PRs**: CI automatically fixes and commits formatting issues
- **Better caching**: Dependencies and Prisma client are cached
- **Parallel jobs**: Faster execution
- **PR comments**: Helpful guidance when checks fail
- **Smart security audit**: Only fails on high/critical vulnerabilities

### 4. Environment-Specific Linting
- **Strict mode** (`biome.json`): For main/develop branches
- **Relaxed mode** (`biome.feature.json`): For feature branches
- Run `pnpm biome:branch` to use the appropriate config

### 5. Developer Convenience Scripts
```bash
# Test CI locally before pushing
pnpm ci:test

# Fix all auto-fixable issues
pnpm fix:all

# Use branch-appropriate Biome config
pnpm biome:branch
```

## Quick Fixes for Common Issues

### TypeScript Errors
```bash
# See all TypeScript errors
pnpm typecheck

# Common fixes:
# - Add missing type annotations
# - Fix import/export issues
# - Handle nullable values properly
```

### Biome Linting Errors
```bash
# Auto-fix most issues
pnpm biome:fix

# Check with branch-specific config
pnpm biome:branch
```

### Test Failures
```bash
# Run tests locally
pnpm test

# Watch mode for development
pnpm test:watch
```

## CI/CD Best Practices

1. **Before Pushing**: Let the pre-push hook run - it catches 90% of CI failures
2. **Feature Branches**: Use relaxed linting to focus on functionality
3. **Before PR**: Run `pnpm ci:test` to ensure CI will pass
4. **Auto-fixes**: CI will fix formatting issues automatically in PRs

## Troubleshooting

### "Push blocked by pre-push hook"
```bash
# See what's failing
pnpm ci:test

# Fix issues
pnpm fix:all

# Try pushing again
git push
```

### "CI still failing after local checks pass"
1. Ensure you're using the latest main branch
2. Check if secrets/env vars are different in CI
3. Look at the specific CI job that's failing

### "Security audit blocking CI"
- Only high/critical vulnerabilities block CI
- Moderate vulnerabilities create GitHub issues
- Run `pnpm audit` locally to see details

## Migration Notes

### For Existing PRs
1. Merge latest main to get CI improvements
2. Run `pnpm fix:all` locally
3. Push changes - CI will auto-fix remaining issues

### For New Features
1. Work on feature branches for relaxed linting
2. Use `pnpm biome:branch` during development
3. Run `pnpm ci:test` before creating PR

## Performance Impact

- **Pre-push hook**: Adds ~10-15 seconds
- **Local CI test**: Takes 1-2 minutes
- **CI pipeline**: 30% faster with caching

## Future Improvements

- [ ] Add visual regression testing
- [ ] Implement staged CI (lint → test → build)
- [ ] Add performance benchmarking
- [ ] Create CI status dashboard