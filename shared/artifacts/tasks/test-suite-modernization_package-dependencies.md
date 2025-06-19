# Task: Update Package Dependencies for Playwright MCP

## Description
Update package.json to include Playwright MCP dependencies and configure test scripts for hybrid test execution. This includes adding necessary dependencies, updating test scripts, and ensuring compatibility with existing packages.

## Dependencies
- test-suite-modernization_playwright-mcp-setup.md

## Acceptance Criteria
- [ ] Add @playwright/test package with MCP support
- [ ] Update test scripts for hybrid execution (Vitest + Playwright)
- [ ] Add necessary browser binaries configuration
- [ ] Configure development dependencies properly
- [ ] Update npm scripts for different test types
- [ ] Ensure no version conflicts with existing packages

## Technical Requirements
- Implementation approach: Careful dependency management to avoid conflicts
- Performance constraints: Minimize dependency bloat
- Security considerations: Use latest secure versions of packages

## Definition of Done
- [ ] All acceptance criteria met
- [ ] pnpm install completes without errors
- [ ] No version conflicts or warnings
- [ ] Test scripts execute correctly
- [ ] Package lock file updated

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- Verify all dependencies install correctly
- Test script execution for both Vitest and Playwright
- Check for any peer dependency warnings
- Validate browser binary installation
- Ensure CI/CD compatibility

## Implementation Notes
- Use exact versions to ensure consistency
- Add separate scripts for different test types:
  - `test:unit` for Vitest tests
  - `test:e2e` for Playwright tests
  - `test:all` for complete test suite
- Consider adding pre-test setup scripts
- Maximum changes: 10-15 lines in package.json