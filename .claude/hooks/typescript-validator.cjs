#!/usr/bin/env node
// .claude/hooks/typescript-validator.cjs
// Centralized TypeScript validation for all hooks
// Consolidates validation from universal-linter.cjs, task-completion-enforcer.cjs, and pre-write-validator.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Validation cache to prevent redundant work
const validationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Configuration
let DEBUG_MODE = process.env.CLAUDE_HOOKS_DEBUG === '1';
let FAST_MODE = process.argv.includes('--fast');
let ZERO_TOLERANCE = process.env.CLAUDE_HOOKS_ZERO_TOLERANCE !== 'false';

/**
 * TypeScript Validator - Centralized TypeScript validation logic
 */
class TypeScriptValidator {
  constructor(hookInput) {
    this.hookInput = hookInput;
    this.errors = [];
    this.warnings = [];
    this.violations = [];
    this.blockers = [];
    this.results = {
      biome: null,
      typecheck: null,
      codeStandards: null
    };
  }

  /**
   * Main validation entry point
   */
  async validate() {
    const { tool_name, tool_input, phase } = this.hookInput;
    
    // Extract file path and determine if we should validate
    const filePath = this.extractFilePath(tool_input);
    if (!filePath || !this.shouldValidateFile(filePath)) {
      return this.approve('File skipped - not a TypeScript/JavaScript file');
    }

    // Check cache first
    const cached = this.getCachedResult(filePath);
    if (cached && !FAST_MODE) {
      if (DEBUG_MODE) console.error(`Using cached TypeScript validation for: ${filePath}`);
      return cached;
    }

    // Determine validation mode based on phase and context
    const validationMode = this.determineValidationMode(tool_input, phase);
    if (DEBUG_MODE) console.error(`TypeScript validation mode: ${validationMode.type} (${validationMode.reason})`);

    // Run validation steps
    await this.validateBiome(filePath, validationMode);
    await this.validateTypeCheck(validationMode);
    await this.validateCodingStandards(tool_input, filePath);

    // Determine final result
    const finalResult = this.getFinalResult();
    
    // Cache result
    this.cacheResult(filePath, finalResult);
    
    return finalResult;
  }

  /**
   * Run Biome validation (formatting, linting, imports)
   */
  async validateBiome(filePath, validationMode) {
    try {
      const biomeCommand = this.buildBiomeCommand(filePath, validationMode);
      if (DEBUG_MODE) console.error(`Running: ${biomeCommand}`);
      
      execSync(biomeCommand, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      this.results.biome = { success: true, message: 'Biome validation passed' };
      
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      
      // Parse Biome error types
      const biomeErrors = [];
      if (errorOutput.includes('Format')) {
        biomeErrors.push(`Biome formatting issues in ${filePath}`);
      }
      if (errorOutput.includes('Lint')) {
        biomeErrors.push(`Biome linting issues in ${filePath}`);
      }
      if (errorOutput.includes('Organize imports')) {
        biomeErrors.push(`Import organization issues in ${filePath}`);
      }
      
      if (biomeErrors.length === 0) {
        biomeErrors.push(`Biome check failed for ${filePath}: ${errorOutput.slice(0, 200)}`);
      }
      
      this.errors.push(...biomeErrors);
      this.results.biome = { 
        success: false, 
        errors: biomeErrors,
        fix: validationMode.type === 'incremental' 
          ? "Run 'pnpm biome:check --apply' on changed files"
          : "Run 'pnpm biome:check --apply' and fix all remaining issues"
      };
    }
  }

  /**
   * Run TypeScript type checking
   */
  async validateTypeCheck(validationMode) {
    try {
      const typecheckCommand = this.buildTypecheckCommand(validationMode);
      if (DEBUG_MODE) console.error(`Running: ${typecheckCommand}`);
      
      execSync(typecheckCommand, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      this.results.typecheck = { success: true, message: 'TypeScript check passed' };
      
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      
      this.errors.push(`TypeScript type errors: ${errorOutput.slice(0, 300)}`);
      this.results.typecheck = { 
        success: false, 
        error: errorOutput,
        fix: validationMode.type === 'incremental'
          ? "Fix TypeScript errors in modified files"
          : "Fix all TypeScript errors before completing task"
      };
    }
  }

  /**
   * Run coding standards validation (from pre-write-validator.cjs)
   */
  async validateCodingStandards(toolInput, filePath) {
    try {
      const content = toolInput?.content;
      if (!content) {
        this.results.codeStandards = { success: true, message: 'No content to validate' };
        return;
      }

      // Run all coding standards checks
      this.validateNoAnyType(content);
      this.validateNoVar(content);
      this.validateNullSafety(content);
      this.validateImplicitGlobals(content);
      this.validateEmptyCatch(content);
      this.validateMagicNumbers(content);
      this.validateComponentStructure(content, filePath);
      this.validateApiRouteStructure(content, filePath);
      this.validateFileName(filePath);

      this.results.codeStandards = { 
        success: this.blockers.length === 0,
        violations: this.violations.length,
        blockers: this.blockers.length
      };

    } catch (error) {
      this.warnings.push(`Coding standards validation error: ${error.message}`);
      this.results.codeStandards = { success: true, message: 'Coding standards check skipped due to error' };
    }
  }

  /**
   * Build Biome command based on validation mode
   */
  buildBiomeCommand(filePath, validationMode) {
    if (validationMode.type === 'full') {
      return 'pnpm biome:check --apply';
    }
    
    if (validationMode.type === 'file-specific') {
      return `pnpm biome check "${filePath}" --apply`;
    }
    
    // For incremental validation, check changed files
    try {
      const changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim();
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
      
      if (!changedFiles && !stagedFiles) {
        return 'echo "No changed files to check"';
      }
      
      return 'pnpm biome check --changed --apply';
    } catch (error) {
      if (DEBUG_MODE) console.error("Git command failed, falling back to file-specific check");
      return `pnpm biome check "${filePath}" --apply`;
    }
  }

  /**
   * Build TypeScript check command based on validation mode
   */
  buildTypecheckCommand(validationMode) {
    // TypeScript incremental compilation is handled by tsconfig.json
    // Use the same command but incremental builds make it faster
    return 'pnpm typecheck';
  }

  /**
   * Determine validation mode based on context
   */
  determineValidationMode(toolInput, phase) {
    const content = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);
    
    // Major completion indicators require full validation
    const majorCompletionIndicators = [
      /feature.*complete/i,
      /implementation.*complete/i,
      /ready.*review/i,
      /workflow.*complete/i,
      /task.*finished/i,
      /story.*complete/i
    ];
    
    // Check for major completion
    const isMajorCompletion = majorCompletionIndicators.some(pattern => pattern.test(content));
    if (isMajorCompletion || phase === 'Stop') {
      return { type: 'full', reason: 'Major task completion or Stop phase detected' };
    }
    
    // Check for TodoWrite with multiple completions
    if (typeof toolInput === 'object' && toolInput.todos) {
      const completedTodos = toolInput.todos.filter(todo => 
        todo.status === 'completed' || todo.status === 'done'
      );
      if (completedTodos.length >= 3) {
        return { type: 'full', reason: 'Multiple todos completed' };
      }
    }
    
    // File-specific operations
    const filePath = this.extractFilePath(toolInput);
    if (filePath && ['Write', 'Edit', 'MultiEdit'].includes(this.hookInput.tool_name)) {
      return { type: 'file-specific', reason: 'File-specific operation' };
    }
    
    // Default to incremental
    return { type: 'incremental', reason: 'Standard validation' };
  }

  /**
   * Extract file path from tool input
   */
  extractFilePath(toolInput) {
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

  /**
   * Check if file should be validated
   */
  shouldValidateFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      return false;
    }

    // Check ignore patterns
    if (this.shouldSkipFile(filePath)) {
      return false;
    }

    return true;
  }

  /**
   * Check if file should be skipped based on ignore patterns
   */
  shouldSkipFile(filePath) {
    // Check .claude-hooks-ignore
    if (fs.existsSync('.claude-hooks-ignore')) {
      const ignoreContent = fs.readFileSync('.claude-hooks-ignore', 'utf8');
      const patterns = ignoreContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      for (const pattern of patterns) {
        if (this.minimatch(filePath, pattern)) {
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
        // File might not exist yet, continue
      }
    }

    return false;
  }

  /**
   * Cache management
   */
  getFileHash(filePath) {
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

  getCachedResult(filePath) {
    const hash = this.getFileHash(filePath);
    if (!hash) return null;
    
    const cacheKey = `${filePath}:${hash}`;
    const cached = validationCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.result;
    }
    
    return null;
  }

  cacheResult(filePath, result) {
    const hash = this.getFileHash(filePath);
    if (!hash) return;
    
    const cacheKey = `${filePath}:${hash}`;
    validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (validationCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of validationCache.entries()) {
        if ((now - value.timestamp) > CACHE_TTL) {
          validationCache.delete(key);
        }
      }
    }
  }

  /**
   * Get final validation result
   */
  getFinalResult() {
    const hasErrors = this.errors.length > 0 || this.blockers.length > 0;
    const hasWarnings = this.warnings.length > 0 || this.violations.length > 0;

    if (hasErrors && ZERO_TOLERANCE) {
      return {
        approve: false,
        message: this.generateErrorMessage()
      };
    }

    return {
      approve: true,
      message: hasWarnings ? 
        this.generateWarningMessage() : 
        this.generateSuccessMessage()
    };
  }

  /**
   * Generate error message
   */
  generateErrorMessage() {
    const allErrors = [
      ...this.errors,
      ...this.blockers.map(b => `${b.rule}: ${b.message}`)
    ];

    return `🛑 TypeScript Validation FAILED

${allErrors.join('\n')}

════════════════════════════════════════════
❌ ALL ISSUES ARE BLOCKING ❌
════════════════════════════════════════════

📋 FIXES REQUIRED:
${this.results.biome?.fix ? `• Biome: ${this.results.biome.fix}` : ''}
${this.results.typecheck?.fix ? `• TypeScript: ${this.results.typecheck.fix}` : ''}
${this.blockers.length > 0 ? '• Fix coding standards violations listed above' : ''}

Run the suggested fixes and retry validation.`;
  }

  /**
   * Generate warning message
   */
  generateWarningMessage() {
    const messages = [];
    
    if (this.results.biome?.success) messages.push('Biome checks passed');
    if (this.results.typecheck?.success) messages.push('TypeScript checks passed');
    if (this.results.codeStandards?.success) messages.push('Coding standards passed');
    
    const warnings = [
      ...this.warnings,
      ...this.violations.map(v => `${v.rule}: ${v.message}`)
    ];

    return `⚠️ TypeScript validation passed with warnings: ${messages.join(', ')}

Warnings:
${warnings.join('\n')}`;
  }

  /**
   * Generate success message
   */
  generateSuccessMessage() {
    const checks = [];
    if (this.results.biome?.success) checks.push('Biome');
    if (this.results.typecheck?.success) checks.push('TypeScript');
    if (this.results.codeStandards?.success) checks.push('Coding Standards');
    
    return `✅ TypeScript validation passed: ${checks.join(', ')} checks completed`;
  }

  /**
   * Helper for returning approval
   */
  approve(message) {
    return {
      approve: true,
      message: message || '✅ TypeScript validation passed'
    };
  }

  // Simple minimatch implementation
  minimatch(file, pattern) {
    const regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regex}$`).test(file);
  }

  // Coding standards validation methods (consolidated from pre-write-validator.cjs)
  validateFileName(filePath) {
    if (!filePath) return;

    const fileName = path.basename(filePath);
    
    // Component files
    if (filePath.includes('/components/') && !fileName.includes('.test.')) {
      if (!/^[A-Z][a-zA-Z]+\.tsx?$/.test(fileName)) {
        this.violations.push({
          rule: 'File Naming',
          message: `Component files must use PascalCase: ${fileName}`,
          severity: 'warning'
        });
      }
    }

    // API routes
    if (filePath.includes('/app/api/') && !fileName.includes('.test.')) {
      if (fileName !== 'route.ts' && fileName !== 'route.js') {
        this.blockers.push({
          rule: 'API Route Naming',
          message: `API route files must be named 'route.ts': ${fileName}`,
          severity: 'error'
        });
      }
    }
  }

  validateNoAnyType(content) {
    const anyTypeRegex = /:\s*any(?:\s|;|,|\)|>|$)/gm;
    const matches = Array.from(content.matchAll(anyTypeRegex));

    if (matches.length > 0) {
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineNum = content.substring(0, match.index).split('\n').length;
        this.blockers.push({
          rule: 'No Any Type',
          message: `Line ${lineNum}: 'any' type is forbidden. Use 'unknown' or specific types instead.`,
          severity: 'error'
        });
      });
    }
  }

  validateNoVar(content) {
    const varRegex = /(?:^|\s)var\s+\w+/gm;
    const matches = Array.from(content.matchAll(varRegex));

    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      this.blockers.push({
        rule: 'No Var',
        message: `Line ${lineNum}: 'var' is forbidden. Use 'const' or 'let' instead.`,
        severity: 'error'
      });
    }
  }

  validateNullSafety(content) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('?.') || line.includes('!= null') || line.includes('interface') || line.includes('//')) {
        return;
      }

      if (line.match(/\w+\.\w+/) && !line.includes('?.')) {
        const context = lines.slice(Math.max(0, index - 5), index + 5).join('\n');
        if ((context.includes('| null') || context.includes('| undefined')) && !line.includes('!.')) {
          this.violations.push({
            rule: 'Null Safety',
            message: `Line ${index + 1}: Consider using optional chaining (?.) for potentially null values`,
            severity: 'warning'
          });
        }
      }
    });
  }

  validateImplicitGlobals(content) {
    const implicitGlobals = ['window', 'document', 'global', 'process'];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      implicitGlobals.forEach(global => {
        const regex = new RegExp(`(?<!\\.)\\b${global}\\b`, 'g');
        if (regex.test(line) && !line.includes('typeof') && !line.includes('//')) {
          const previousLines = lines.slice(0, index).join('\n');
          if (!previousLines.includes('declare') && !previousLines.includes('import')) {
            this.violations.push({
              rule: 'Implicit Globals',
              message: `Line ${index + 1}: Ensure '${global}' is properly declared or imported`,
              severity: 'warning'
            });
          }
        }
      });
    });
  }

  validateEmptyCatch(content) {
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*{\s*}/g;
    const matches = Array.from(content.matchAll(emptyCatchRegex));

    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      this.blockers.push({
        rule: 'Empty Catch',
        message: `Line ${lineNum}: Empty catch blocks are forbidden. Handle or log errors properly.`,
        severity: 'error'
      });
    }
  }

  validateMagicNumbers(content) {
    const lines = content.split('\n');
    const magicNumberRegex = /(?<![\w.])([2-9]\d+|[1-9]\d{2,})(?![\w:])/g;

    lines.forEach((line, index) => {
      if (line.includes('import') || line.includes('//') || line.includes('const')) {
        return;
      }

      const matches = Array.from(line.matchAll(magicNumberRegex));
      for (const match of matches) {
        const num = parseInt(match[1]);
        if ([404, 200, 201, 400, 401, 403, 500, 3000, 8080, 5432].includes(num)) {
          continue;
        }

        this.violations.push({
          rule: 'Magic Numbers',
          message: `Line ${index + 1}: Consider extracting magic number '${num}' to a named constant`,
          severity: 'warning'
        });
      }
    });
  }

  validateComponentStructure(content, filePath) {
    if (!filePath || !filePath.includes('/components/')) return;
    if (!content.includes('export') || !content.includes('return')) return;

    const hookRegex = /use[A-Z]\w+\(/g;
    const returnIndex = content.indexOf('return');
    const hooksAfterReturn = content.substring(returnIndex);

    if (hookRegex.test(hooksAfterReturn)) {
      this.blockers.push({
        rule: 'Hook Placement',
        message: 'React hooks must be called at the top of the component, before the return statement',
        severity: 'error'
      });
    }
  }

  validateApiRouteStructure(content, filePath) {
    if (!filePath || !filePath.includes('/api/')) return;

    const hasNamedExports = /export\s+(const|async function)\s+(GET|POST|PUT|DELETE|PATCH)/.test(content);
    if (!hasNamedExports && filePath.endsWith('route.ts')) {
      this.violations.push({
        rule: 'API Routes',
        message: 'API routes should export named functions (GET, POST, etc.)',
        severity: 'warning'
      });
    }

    if (!content.includes('try') || !content.includes('catch')) {
      this.violations.push({
        rule: 'Error Handling',
        message: 'API routes should include proper try-catch error handling',
        severity: 'warning'
      });
    }
  }
}

// Main execution
async function main() {
  try {
    let input = '';
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    
    const hookInput = JSON.parse(input);
    const validator = new TypeScriptValidator(hookInput);
    const result = await validator.validate();
    
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(JSON.stringify({
      approve: false,
      message: `TypeScript validator error: ${error.message}`
    }));
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { TypeScriptValidator };