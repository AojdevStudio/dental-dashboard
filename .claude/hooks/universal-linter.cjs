#!/usr/bin/env node
// .claude/hooks/universal-linter.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Simple file validation cache to prevent redundant work
const validationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to generate file hash for cache key
function getFileHash(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    return crypto.createHash('md5')
      .update(content + stats.mtime.getTime())
      .digest('hex');
  } catch {
    return null;
  }
}

// Check if file was recently validated
function isCachedValid(filePath) {
  const hash = getFileHash(filePath);
  if (!hash) return false;
  
  const cacheKey = `${filePath}:${hash}`;
  const cached = validationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.result;
  }
  
  return false;
}

// Cache validation result
function cacheResult(filePath, result) {
  const hash = getFileHash(filePath);
  if (!hash) return;
  
  const cacheKey = `${filePath}:${hash}`;
  validationCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  // Clean old cache entries periodically
  if (validationCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of validationCache.entries()) {
      if ((now - value.timestamp) > CACHE_TTL) {
        validationCache.delete(key);
      }
    }
  }
}

// Parse command line arguments (following Veraticus's pattern)
const args = process.argv.slice(2);
let DEBUG_MODE = process.env.CLAUDE_HOOKS_DEBUG === '1';
let FAST_MODE = args.includes('--fast');
let ZERO_TOLERANCE = process.env.CLAUDE_HOOKS_ZERO_TOLERANCE !== 'false';

// Get tool input from stdin (Claude Code hook format)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const hookInput = JSON.parse(input);
    await processHook(hookInput);
  } catch (error) {
    console.error(JSON.stringify({
      approve: false,
      message: `Hook error: ${error.message}`
    }));
    process.exit(1);
  }
});

async function processHook(hookInput) {
  const { tool_name, tool_input } = hookInput;
  
  // Only process file operations
  if (!['Write', 'Edit', 'MultiEdit', 'Task'].includes(tool_name)) {
    console.log(JSON.stringify({ approve: true, message: 'Non-file operation, skipping.' }));
    return;
  }

  // Extract file path from tool input
  const filePath = extractFilePath(tool_input);
  if (!filePath) {
    console.log(JSON.stringify({ approve: true, message: 'No file path found, skipping.' }));
    return;
  }

  // Check if file should be skipped
  if (shouldSkipFile(filePath)) {
    if (DEBUG_MODE) console.error(`Skipping file: ${filePath}`);
    console.log(JSON.stringify({ approve: true, message: `Skipped: ${filePath}` }));
    return;
  }

  // Check cache to avoid redundant work
  const cachedResult = isCachedValid(filePath);
  if (cachedResult && !FAST_MODE) {
    if (DEBUG_MODE) console.error(`Using cached result for: ${filePath}`);
    console.log(JSON.stringify(cachedResult));
    return;
  }

  // Detect project types
  const projectTypes = await detectProjectTypes(filePath);
  if (DEBUG_MODE) console.error(`Detected project types: ${projectTypes.join(', ')}`);

  // Run appropriate linters
  const results = await runLinters(filePath, projectTypes, tool_input);
  
  // Apply zero tolerance if enabled
  const hasErrors = results.some(r => r.errors && r.errors.length > 0);
  const hasWarnings = results.some(r => r.warnings && r.warnings.length > 0);

  const finalResult = {
    approve: !hasErrors || !ZERO_TOLERANCE,
    message: hasErrors && ZERO_TOLERANCE ? 
      generateErrorMessage(results) :
      generateSuccessMessage(results, hasWarnings)
  };

  // Cache the result for future use
  cacheResult(filePath, finalResult);

  console.log(JSON.stringify(finalResult));
}

function generateErrorMessage(results) {
  const errorMessages = results
    .filter(r => r.errors && r.errors.length > 0)
    .map(r => r.errors.join('\n'))
    .join('\n\n');

  return `🛑 FAILED - Fix all issues above!

${errorMessages}

════════════════════════════════════════════
❌ ALL ISSUES ARE BLOCKING ❌
════════════════════════════════════════════

📋 NEXT STEPS:
1. Fix the issues listed above
2. Verify the fix by running the lint command again
3. Continue with your original task`;
}

function generateSuccessMessage(results, hasWarnings) {
  const successMessages = results
    .filter(r => r.success)
    .map(r => r.message)
    .join(', ');

  return hasWarnings ? 
    `⚠️ Passed with warnings: ${successMessages}` : 
    `✅ All checks passed: ${successMessages}`;
}

function extractFilePath(toolInput) {
  // Handle different tool input formats
  if (typeof toolInput === 'string') {
    try {
      const parsed = JSON.parse(toolInput);
      return parsed.file_path || parsed.path || parsed.file;
    } catch {
      return null;
    }
  }
  
  if (typeof toolInput === 'object') {
    return toolInput.file_path || toolInput.path || toolInput.file;
  }
  
  return null;
}

function shouldSkipFile(filePath) {
  // Check .claude-hooks-ignore
  if (fs.existsSync('.claude-hooks-ignore')) {
    const ignoreContent = fs.readFileSync('.claude-hooks-ignore', 'utf8');
    const patterns = ignoreContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    for (const pattern of patterns) {
      if (minimatch(filePath, pattern)) {
        return true;
      }
    }
  }

  // Check for inline disable comments
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('claude-hooks-disable')) {
        return true;
      }
    } catch {
      // File might not exist yet (new file), continue
    }
  }

  return false;
}

async function detectProjectTypes(filePath) {
  const types = [];
  const baseDir = path.dirname(filePath);
  const ext = path.extname(filePath);

  // Go detection
  if (fs.existsSync(path.join(baseDir, 'go.mod')) || 
      fs.existsSync(path.join(baseDir, 'go.sum')) ||
      ext === '.go') {
    types.push('go');
  }

  // Python detection
  if (fs.existsSync(path.join(baseDir, 'pyproject.toml')) ||
      fs.existsSync(path.join(baseDir, 'requirements.txt')) ||
      fs.existsSync(path.join(baseDir, 'setup.py')) ||
      ['.py', '.pyi'].includes(ext)) {
    types.push('python');
  }

  // Rust detection
  if (fs.existsSync(path.join(baseDir, 'Cargo.toml')) ||
      ext === '.rs') {
    types.push('rust');
  }

  // TypeScript/JavaScript detection
  if (fs.existsSync(path.join(baseDir, 'package.json')) ||
      fs.existsSync(path.join(baseDir, 'tsconfig.json')) ||
      ['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    types.push('typescript');
  }

  // Nix detection
  if (fs.existsSync(path.join(baseDir, 'flake.nix')) ||
      fs.existsSync(path.join(baseDir, 'default.nix')) ||
      ext === '.nix') {
    types.push('nix');
  }

  return types.length > 0 ? types : ['unknown'];
}

async function runLinters(filePath, projectTypes, toolInput) {
  const results = [];

  for (const type of projectTypes) {
    try {
      switch (type) {
        case 'go':
          results.push(await lintGo(filePath));
          break;
        case 'python':
          results.push(await lintPython(filePath));
          break;
        case 'rust':
          results.push(await lintRust(filePath));
          break;
        case 'typescript':
          results.push(await lintTypeScript(filePath, toolInput));
          break;
        case 'nix':
          results.push(await lintNix(filePath));
          break;
        default:
          if (DEBUG_MODE) console.error(`No linter for type: ${type}`);
      }
    } catch (error) {
      results.push({
        type,
        success: false,
        errors: [`${type} linting failed: ${error.message}`],
        warnings: []
      });
    }
  }

  return results;
}

async function lintGo(filePath) {
  const errors = [];
  const warnings = [];
  let success = true;

  try {
    // Check formatting
    const fmtResult = execSync(`gofmt -l "${filePath}"`, { encoding: 'utf8' });
    if (fmtResult.trim()) {
      errors.push(`Go file needs formatting: ${filePath}`);
      success = false;
    }

    // Run golangci-lint if available
    if (commandExists('golangci-lint')) {
      try {
        execSync(`golangci-lint run "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`golangci-lint issues: ${error.message}`);
        success = false;
      }
    } else {
      // Fallback to go vet
      try {
        execSync(`go vet "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`go vet issues: ${error.message}`);
        success = false;
      }
    }
  } catch (error) {
    errors.push(`Go tooling error: ${error.message}`);
    success = false;
  }

  return {
    type: 'go',
    success,
    errors,
    warnings,
    message: success ? 'Go linting passed' : 'Go linting failed'
  };
}

async function lintPython(filePath) {
  const errors = [];
  const warnings = [];
  let success = true;

  try {
    // Check formatting with black
    if (commandExists('black')) {
      try {
        execSync(`black --check "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`Python file needs formatting (black): ${filePath}`);
        success = false;
      }
    }

    // Run ruff if available, otherwise flake8
    if (commandExists('ruff')) {
      try {
        execSync(`ruff check "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`ruff issues: ${error.message}`);
        success = false;
      }
    } else if (commandExists('flake8')) {
      try {
        execSync(`flake8 "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`flake8 issues: ${error.message}`);
        success = false;
      }
    }
  } catch (error) {
    errors.push(`Python tooling error: ${error.message}`);
    success = false;
  }

  return {
    type: 'python',
    success,
    errors,
    warnings,
    message: success ? 'Python linting passed' : 'Python linting failed'
  };
}

async function lintRust(filePath) {
  const errors = [];
  const warnings = [];
  let success = true;

  try {
    // Check formatting
    const fmtResult = execSync(`cargo fmt -- --check "${filePath}"`, { encoding: 'utf8' });
    
    // Run clippy
    try {
      execSync(`cargo clippy -- -D warnings "${filePath}"`, { encoding: 'utf8' });
    } catch (error) {
      errors.push(`clippy issues: ${error.message}`);
      success = false;
    }
  } catch (error) {
    if (error.message.includes('rustfmt')) {
      errors.push(`Rust file needs formatting: ${filePath}`);
      success = false;
    } else {
      errors.push(`Rust tooling error: ${error.message}`);
      success = false;
    }
  }

  return {
    type: 'rust',
    success,
    errors,
    warnings,
    message: success ? 'Rust linting passed' : 'Rust linting failed'
  };
}

async function lintTypeScript(filePath, toolInput) {
  try {
    // Delegate all TypeScript validation to centralized validator
    if (DEBUG_MODE) console.error(`Delegating TypeScript validation to centralized validator for: ${filePath}`);
    
    const { spawn } = require('child_process');
    const tsValidatorPath = path.join(__dirname, 'typescript-validator.cjs');
    
    const result = await new Promise((resolve) => {
      const child = spawn('node', [tsValidatorPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdin.write(JSON.stringify({ 
        tool_name: 'Write', 
        tool_input: toolInput,
        phase: 'PreToolUse'
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
    
    return {
      type: 'typescript',
      success: result.approve,
      errors: result.approve ? [] : [result.message],
      warnings: [],
      message: result.message
    };
    
  } catch (error) {
    return {
      type: 'typescript',
      success: false,
      errors: [`TypeScript validation delegation failed: ${error.message}`],
      warnings: [],
      message: 'TypeScript validation failed'
    };
  }
}

async function lintNix(filePath) {
  const errors = [];
  const warnings = [];
  let success = true;

  try {
    // Check formatting with nixpkgs-fmt or alejandra
    if (commandExists('nixpkgs-fmt')) {
      try {
        execSync(`nixpkgs-fmt --check "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`Nix file needs formatting (nixpkgs-fmt): ${filePath}`);
        success = false;
      }
    } else if (commandExists('alejandra')) {
      try {
        execSync(`alejandra --check "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        errors.push(`Nix file needs formatting (alejandra): ${filePath}`);
        success = false;
      }
    }

    // Run statix if available
    if (commandExists('statix')) {
      try {
        execSync(`statix check "${filePath}"`, { encoding: 'utf8' });
      } catch (error) {
        warnings.push(`statix suggestions: ${error.message}`);
      }
    }
  } catch (error) {
    errors.push(`Nix tooling error: ${error.message}`);
    success = false;
  }

  return {
    type: 'nix',
    success,
    errors,
    warnings,
    message: success ? 'Nix linting passed' : 'Nix linting failed'
  };
}

function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Simple minimatch implementation for file pattern matching
function minimatch(file, pattern) {
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regex}$`).test(file);
}