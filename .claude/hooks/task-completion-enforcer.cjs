#!/usr/bin/env node
// .claude/hooks/task-completion-enforcer.cjs
// This hook prevents Claude from completing tasks when blocking issues exist

const fs = require('fs');
const { execSync } = require('child_process');

// Parse hook input
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const hookInput = JSON.parse(input);
    await enforceTaskCompletion(hookInput);
  } catch (error) {
    console.error(JSON.stringify({
      approve: false,
      message: `🛑 CRITICAL: Task completion enforcement failed: ${error.message}`
    }));
    process.exit(1);
  }
});

async function enforceTaskCompletion(hookInput) {
  const { tool_name, tool_input, phase } = hookInput;
  
  // Get hook phase from environment or input
  const currentPhase = phase || process.env.CLAUDE_HOOK_PHASE || 'unknown';
  
  // Only run compliance checks in PostToolUse and Stop phases
  // Skip PreToolUse to avoid redundant execution
  if (currentPhase === 'PreToolUse') {
    console.log(JSON.stringify({ 
      approve: true, 
      message: "Task completion enforcement skipped in PreToolUse (avoiding redundancy)" 
    }));
    return;
  }
  
  // Detect task completion indicators
  if (isTaskCompletionAttempt(tool_input)) {
    console.error("🔍 TASK COMPLETION DETECTED - Running mandatory compliance checks...");
    
    const complianceResults = await runComplianceChecks(tool_input);
    
    if (!complianceResults.allPassed) {
      console.log(JSON.stringify({
        approve: false,
        message: generateBlockingMessage(complianceResults)
      }));
      return;
    }
    
    console.error("✅ All compliance checks passed - Task completion approved");
  }
  
  console.log(JSON.stringify({ 
    approve: true, 
    message: "Task completion enforcement passed" 
  }));
}

function isTaskCompletionAttempt(toolInput) {
  const content = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);
  
  // Check for TodoWrite tool with completed status
  if (typeof toolInput === 'object' && toolInput.todos) {
    const hasCompletedTodo = toolInput.todos.some(todo => 
      todo.status === 'completed' || todo.status === 'done'
    );
    if (hasCompletedTodo) {
      return true;
    }
  }
  
  // Original completion indicators for other tools
  const completionIndicators = [
    /✅.*complete/i,
    /✅.*done/i,
    /✅.*fixed/i,
    /✅.*finished/i,
    /task.*complete/i,
    /workflow.*complete/i,
    /all.*fixed/i,
    /ready.*review/i,
    /implementation.*complete/i,
    /changes.*made/i,
    /should.*work.*now/i,
    /⏺.*fixed/i,
    /⏺.*complete/i,
    /"status":\s*"completed"/i,
    /"status":\s*"done"/i
  ];
  
  return completionIndicators.some(pattern => pattern.test(content));
}

async function runComplianceChecks(toolInput) {
  const results = {
    allPassed: true,
    checks: [],
    failures: []
  };

  // Determine validation scope based on task completion type
  const validationScope = determineValidationScope(toolInput);
  console.error(`📋 VALIDATION SCOPE: ${validationScope.type} (${validationScope.reason})`);
  
  // 1. TypeScript validation (includes Biome, type checking, coding standards) - Centralized
  try {
    console.error("Running centralized TypeScript validation...");
    const { spawn } = require('child_process');
    const tsValidatorPath = require('path').join(__dirname, 'typescript-validator.cjs');
    
    const tsResult = await new Promise((resolve) => {
      const child = spawn('node', [tsValidatorPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdin.write(JSON.stringify({ 
        tool_name: 'TaskCompletion', 
        tool_input: toolInput,
        phase: 'Stop'
      }));
      child.stdin.end();

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch {
          resolve({ approve: false, message: 'TypeScript validator output parsing failed' });
        }
      });
    });
    
    if (tsResult.approve) {
      results.checks.push(`✅ TypeScript validation passed (${validationScope.type})`);
    } else {
      results.allPassed = false;
      results.failures.push({
        check: "TypeScript",
        error: tsResult.message,
        fix: "Fix all TypeScript validation issues listed above"
      });
    }
  } catch (error) {
    results.allPassed = false;
    results.failures.push({
      check: "TypeScript",
      error: error.message,
      fix: "Fix TypeScript validation system error"
    });
  }

  // 3. Test check (if tests exist)
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.test) {
      try {
        console.error("Running tests...");
        execSync('pnpm test', { encoding: 'utf8', stdio: 'pipe' });
        results.checks.push("✅ Tests passed");
      } catch (error) {
        results.allPassed = false;
        results.failures.push({
          check: "Tests",
          error: error.stdout || error.message,
          fix: "Fix all failing tests before completing task"
        });
      }
    }
  }

  // 4. Git status check (warn about uncommitted changes)
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      results.checks.push("⚠️ Uncommitted changes detected");
    } else {
      results.checks.push("✅ Git status clean");
    }
  } catch (error) {
    // Git not available or not a git repo - not critical
    results.checks.push("ℹ️ Git status not available");
  }

  // 5. Claude.md compliance check
  if (fs.existsSync('.claude/CLAUDE.md') || fs.existsSync('CLAUDE.md')) {
    results.checks.push("✅ CLAUDE.md compliance assumed (manual verification)");
  }

  return results;
}

function determineValidationScope(toolInput) {
  const content = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);
  
  // Major task completion indicators - require full validation
  const majorCompletionIndicators = [
    /feature.*complete/i,
    /implementation.*complete/i,
    /ready.*review/i,
    /ready.*production/i,
    /workflow.*complete/i,
    /task.*finished/i,
    /all.*done/i,
    /fully.*implemented/i,
    /complete.*testing/i,
    /deployment.*ready/i,
    /final.*implementation/i,
    /story.*complete/i,
    /epic.*complete/i
  ];
  
  // Minor update indicators - can use incremental validation
  const minorUpdateIndicators = [
    /progress.*update/i,
    /status.*update/i,
    /partial.*complete/i,
    /checkpoint/i,
    /intermediate.*step/i,
    /milestone.*reached/i,
    /draft.*complete/i,
    /initial.*implementation/i,
    /work.*in.*progress/i,
    /temporary.*fix/i
  ];
  
  // Check for TodoWrite with multiple todos - likely full completion
  if (typeof toolInput === 'object' && toolInput.todos) {
    const completedTodos = toolInput.todos.filter(todo => 
      todo.status === 'completed' || todo.status === 'done'
    );
    const totalTodos = toolInput.todos.length;
    
    // If completing more than 50% of todos or 3+ todos, treat as major
    if (completedTodos.length >= 3 || (completedTodos.length / totalTodos) > 0.5) {
      return { type: 'full', reason: 'Multiple todos completed' };
    }
  }
  
  // Check for major completion patterns
  const isMajorCompletion = majorCompletionIndicators.some(pattern => pattern.test(content));
  if (isMajorCompletion) {
    return { type: 'full', reason: 'Major task completion detected' };
  }
  
  // Check for minor update patterns
  const isMinorUpdate = minorUpdateIndicators.some(pattern => pattern.test(content));
  if (isMinorUpdate) {
    return { type: 'incremental', reason: 'Minor progress update detected' };
  }
  
  // Default to incremental for single task completions
  return { type: 'incremental', reason: 'Single task completion - using incremental validation' };
}



function getChangedFiles() {
  try {
    const unstaged = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    
    const allChanged = [
      ...unstaged.split('\n').filter(f => f),
      ...staged.split('\n').filter(f => f)
    ];
    
    return [...new Set(allChanged)]; // Remove duplicates
  } catch (error) {
    return [];
  }
}

function generateBlockingMessage(results) {
  let message = `🛑 TASK COMPLETION BLOCKED 🛑

${results.failures.length} CRITICAL ISSUE(S) MUST BE FIXED:

`;

  results.failures.forEach((failure, index) => {
    message += `❌ ${failure.check} FAILED:
${failure.error}

🔧 FIX: ${failure.fix}

`;
  });

  message += `════════════════════════════════════════════
⚠️  CLAUDE.md COMPLIANCE VIOLATION DETECTED ⚠️
════════════════════════════════════════════

According to CLAUDE.md requirements:
• "ALL hook issues are BLOCKING"
• "STOP IMMEDIATELY - Do not continue with other tasks" 
• "FIX ALL ISSUES - Address every ❌ issue until everything is ✅ GREEN"
• "There are NO warnings, only requirements"

📋 MANDATORY NEXT STEPS:
1. Fix ALL issues listed above
2. Verify fixes by running the failed commands manually
3. Only THEN mark the task as complete
4. NEVER ignore blocking issues

🚫 TASK COMPLETION IS FORBIDDEN UNTIL ALL ISSUES ARE RESOLVED 🚫`;

  return message;
}