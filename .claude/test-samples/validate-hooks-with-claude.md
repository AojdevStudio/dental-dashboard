# Real Claude Code Hooks Validation Guide

This guide provides instructions to test that the corrected hooks implementation actually works with Claude Code operations.

## Pre-Test Setup

1. **Verify hooks.json is loaded**:
   ```bash
   # Check that Claude Code recognizes the hooks configuration
   ls -la .claude/hooks.json
   ```

2. **Enable debugging (optional)**:
   ```bash
   export CLAUDE_HOOKS_DEBUG=1
   ```

## Test 1: PreToolUse Hook - Code Standards Validation

**Expected:** Hook should block operations with coding standards violations.

**Test:** Ask Claude Code to create a file with violations:

```
Create a new file src/test-violations.ts with this content:
```typescript
import React from 'react'

// Using any type (should be blocked)
const processData = (data: any): any => {
  return data
}

// Using var (should be blocked)
var badVariable = 'test'

export const TestComponent = () => {
  return <div>Test</div>
}
```

**Expected Result:**
- ❌ Operation should be **BLOCKED**
- Should show message about coding standards violations
- Should mention `any` type and `var` usage

## Test 2: PostToolUse Hook - Import Organization

**Expected:** Hook should automatically organize imports after file operations.

**Test:** Ask Claude Code to create a file with unorganized imports:

```
Create src/test-imports.ts:
```typescript
import { useState } from 'react'
import { Provider } from '@/types/provider'
import React from 'react'
import { format } from 'date-fns'

const Component = () => {
  return <div>Test</div>
}
```

**Expected Result:**
- ✅ File should be created
- ✅ Imports should be automatically reorganized:
  1. React imports first
  2. Third-party libraries
  3. Internal absolute imports

## Test 3: Bash Hook - Commit Message Validation

**Expected:** Hook should validate commit message format.

**Test:** Ask Claude Code to commit with bad format:

```
Run: git add . && git commit -m "added new feature"
```

**Expected Result:**
- ❌ Operation should be **BLOCKED**
- Should show conventional commit format error
- Should suggest proper format like `feat: add new feature`

## Test 4: Task Tool Hook

**Expected:** Task operations should trigger coding standards validation.

**Test:** Use Task tool with violations:

```
Use the Task tool to help me create a component with the following content that intentionally has coding violations for testing...
```

**Expected Result:**
- Should trigger pre-validation hooks
- Should detect and report violations

## Test 5: MCP Tool Hook

**Expected:** MCP file operations should trigger hooks.

**Test:** If MCP tools are available, test file operations through MCP.

**Expected Result:**
- MCP file operations should trigger same validation as Write/Edit

## Test 6: Session Quality Report

**Expected:** At the end of Claude Code session, should get quality report.

**Test:** Complete any session with file operations.

**Expected Result:**
- Should show session summary
- Should report files modified, violations found, etc.

## Debugging Failed Tests

### If hooks don't trigger at all:

1. **Check hooks.json syntax**:
   ```bash
   cat .claude/hooks.json | python -m json.tool
   ```

2. **Verify file permissions**:
   ```bash
   ls -la .claude/hooks/*.cjs
   ```

3. **Test hook scripts manually**:
   ```bash
   echo '{"tool_name":"Write","tool_input":{"file_path":"test.ts","content":"test"}}' | node .claude/hooks/pre-write-validator.cjs
   ```

### If hooks trigger but don't work correctly:

1. **Check script output**:
   - Should return JSON with `approve` field
   - Should have descriptive `message` field

2. **Verify input format**:
   - Scripts expect `tool_name` and `tool_input`
   - Not the old `tool`, `content`, `file_path` format

### If path issues occur:

1. **Verify absolute paths in hooks.json**:
   ```bash
   grep "command" .claude/hooks.json
   ```

2. **Test absolute path manually**:
   ```bash
   node /full/absolute/path/to/hook.cjs
   ```

## Success Criteria

✅ **All tests should demonstrate:**

1. **Blocking Works**: PreToolUse hooks can block operations
2. **Auto-fixing Works**: PostToolUse hooks modify files
3. **Feedback Works**: Clear messages explain what happened
4. **Security Works**: Path traversal attempts are blocked
5. **Coverage Works**: All major Claude Code tools trigger hooks

## Tool Name Verification

**Monitor Claude Code logs to verify exact tool names used:**

Expected tool names based on documentation:
- `Write`, `Edit`, `MultiEdit`
- `Task` 
- `Read`
- `Bash`
- `Glob`, `Grep`
- `WebFetch`, `WebSearch`
- MCP tools: `mcp__*__*`

If tool names don't match, update the matchers in hooks.json accordingly.

## Next Steps After Validation

1. **Update documentation** with any corrections discovered
2. **Fine-tune hook logic** based on real-world behavior
3. **Add more sophisticated validation rules** as needed
4. **Consider performance optimizations** if hooks are slow

---

**Note:** This validation must be done with actual Claude Code operations, not just the test scripts, to ensure the hooks interface works correctly with the real system.