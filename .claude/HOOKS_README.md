# Claude Code Hooks - Coding Standards Enforcement

This directory contains hooks that automatically enforce the project's coding standards defined in `docs/architecture/coding-standards.md`.

## Overview

These hooks run automatically during Claude Code operations to:
- **Prevent** code that violates critical standards from being written
- **Warn** about potential issues while allowing the operation
- **Auto-fix** certain issues like import organization
- **Report** code quality metrics at the end of sessions
- **Secure** operations by validating inputs and preventing path traversal

## ⚠️ Critical Implementation Notes

**Input Format:** This implementation follows the official Claude Code hooks specification:
- Hooks receive `tool_name` and `tool_input` (not `tool`, `content`, `file_path`)
- Absolute paths are used in hooks.json for reliability
- Security validation prevents path traversal attacks
- JSON output format with `{approve: true/false, message: "..."}` structure

## Installed Hooks

### 1. Pre-Write Validator (`hooks/pre-write-validator.cjs`)
**Runs:** Before Write/Edit/MultiEdit operations  
**Purpose:** Validates TypeScript code against coding standards

**Enforces:**
- ❌ **Blocks** operations for:
  - Use of `any` type (must use `unknown` or specific types)
  - Use of `var` (must use `const` or `let`)
  - Empty catch blocks
  - Incorrect API route file naming
  - React hooks called after return statement

- ⚠️ **Warns** about:
  - Missing null safety (suggests optional chaining)
  - Magic numbers without constants
  - Component file naming conventions
  - Implicit globals

### 2. Import Organizer (`hooks/import-organizer.cjs`)
**Runs:** After Write/Edit/MultiEdit operations  
**Purpose:** Automatically organizes imports in the correct order

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Internal absolute imports (@/)
4. Relative imports
5. Type imports

### 3. Commit Message Validator (`hooks/commit-message-validator.cjs`)
**Runs:** Before Bash commands containing git commits  
**Purpose:** Ensures commit messages follow conventional format

**Format:** `type(scope): subject`

**Valid Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Add/update tests
- `chore` - Maintenance tasks

### 4. API Standards Checker (`hooks/api-standards-checker.cjs`)
**Runs:** After Write/Edit operations on API routes  
**Purpose:** Validates API routes follow project conventions

**Checks:**
- File naming (must be `route.ts`)
- HTTP method exports
- Error handling patterns
- Authentication usage
- Response format consistency
- Input validation with Zod
- Multi-tenancy compliance

### 5. Code Quality Reporter (`hooks/code-quality-reporter.cjs`)
**Runs:** At the end of Claude Code sessions  
**Purpose:** Provides a summary of code quality findings

**Reports:**
- Files modified
- Violations found
- Operations blocked
- Auto-fixes applied
- Recommendations for improvement

## Configuration

The hooks are configured in `.claude/hooks.json`. Each hook is mapped to specific tools and events:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^(Write|Edit|MultiEdit|Task)$",
        "hooks": ["pre-write-validator.cjs"]
      },
      {
        "matcher": "^mcp__.*__(write_file|edit_file|create_file)$",
        "hooks": ["pre-write-validator.cjs"]
      },
      {
        "matcher": "^Bash$",
        "hooks": ["commit-message-validator.cjs"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "^(Write|Edit|MultiEdit|Task)$",
        "hooks": ["import-organizer.cjs", "api-standards-checker.cjs", "code-quality-reporter.cjs"]
      },
      {
        "matcher": "^mcp__.*__(write_file|edit_file|create_file|read_file)$",
        "hooks": ["import-organizer.cjs", "api-standards-checker.cjs", "code-quality-reporter.cjs"]
      },
      {
        "matcher": "^Read$",
        "hooks": ["code-quality-reporter.cjs"]
      }
    ],
    "Stop": ["code-quality-reporter.cjs"]
  }
}
```

### Tool Coverage

**Core Claude Code Tools:**
- `Write`, `Edit`, `MultiEdit` - Direct file operations
- `Task` - Agent-driven code generation and complex workflows
- `Read` - File reading operations (for tracking)
- `Bash` - Shell commands (for git commit validation)

**MCP (Model Context Protocol) Tools:**
- `mcp__*__write_file` - MCP file writing operations
- `mcp__*__edit_file` - MCP file editing operations  
- `mcp__*__create_file` - MCP file creation operations
- `mcp__*__read_file` - MCP file reading operations

## Customization

### Adding New Rules

To add new validation rules:

1. **For TypeScript validation:** Edit `pre-write-validator.cjs` and add a new validation method
2. **For API standards:** Edit `api-standards-checker.cjs`
3. **For commit formats:** Edit `commit-message-validator.cjs`

### Disabling Hooks

To temporarily disable hooks:
1. Rename or remove `.claude/hooks.json`
2. Or comment out specific hooks in the configuration

### Testing Hooks

Use the provided test scripts:
```bash
cd .claude/test-samples

# Test basic hook functionality
node test-hooks.cjs

# Test comprehensive tool coverage
node test-tool-coverage.cjs
```

## Examples

### Example 1: TypeScript Validation
```typescript
// ❌ This will be blocked:
const data: any = fetchData()
var count = 0

// ✅ This will pass:
const data: unknown = fetchData()
const count = 0
```

### Example 2: Import Organization
```typescript
// Before (unorganized):
import { Provider } from '@/types'
import React from 'react'
import { format } from 'date-fns'

// After (auto-organized):
import React from 'react'

import { format } from 'date-fns'

import { Provider } from '@/types'
```

### Example 3: Commit Messages
```bash
# ❌ This will be blocked:
git commit -m "fixed bug"

# ✅ This will pass:
git commit -m "fix(auth): resolve session timeout issue"
```

## Troubleshooting

### Hook Not Running
- Check that `.claude/hooks.json` exists
- Verify hook scripts have execute permissions
- Check Claude Code logs for errors

### False Positives
- Test files have relaxed rules (files with `.test.` or `.spec.`)
- Some warnings are suggestions, not requirements
- Review the specific rule in the hook script

### Performance Issues
- Hooks run synchronously and may add slight delay
- Large files take longer to validate
- Consider disabling hooks for bulk operations

## Maintenance

- Review hook effectiveness periodically
- Update rules as coding standards evolve
- Monitor false positive/negative rates
- Keep hooks lightweight for performance

## Support

For issues or questions:
1. Check the test samples in `.claude/test-samples/`
2. Review the coding standards in `docs/architecture/coding-standards.md`
3. Examine hook source code for detailed logic