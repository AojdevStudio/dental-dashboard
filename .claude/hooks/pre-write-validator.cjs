#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Pre-write validator for TypeScript coding standards
 * Enforces rules from docs/architecture/coding-standards.md
 */

class CodeValidator {
  constructor(input) {
    this.input = input;
    this.violations = [];
    this.blockers = [];
  }

  /**
   * Validate and sanitize input for security
   */
  validateInput() {
    const { tool_name, tool_input } = this.input;
    
    // Basic input validation
    if (!tool_name || typeof tool_name !== 'string') {
      return { valid: false, reason: 'Invalid or missing tool_name' };
    }
    
    if (tool_input && typeof tool_input !== 'object') {
      return { valid: false, reason: 'Invalid tool_input format' };
    }
    
    const { file_path } = tool_input || {};
    
    // Security: Check for path traversal attempts
    if (file_path && (file_path.includes('../') || file_path.includes('..\\') || file_path.startsWith('/'))) {
      return { valid: false, reason: 'Potentially unsafe file path detected' };
    }
    
    return { valid: true };
  }

  /**
   * Main validation entry point
   */
  validate() {
    // Security validation first
    const inputValidation = this.validateInput();
    if (!inputValidation.valid) {
      return this.approve(`Input validation: ${inputValidation.reason}`);
    }
    
    // Parse Claude Code hook input format
    const { tool_name, tool_input } = this.input;
    const tool = tool_name; // For backward compatibility
    const { content, file_path } = tool_input || {};
    
    // Validate we have necessary data
    if (!tool_name) {
      return this.approve('No tool name provided');
    }
    
    // Only validate TypeScript/JavaScript files
    const fileExt = path.extname(file_path || '');
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
      return this.approve();
    }

    // Skip validation for test files with relaxed rules
    if (file_path && (file_path.includes('.test.') || file_path.includes('.spec.'))) {
      return this.approve();
    }

    // Validate file naming conventions
    this.validateFileName(file_path);

    // Validate code content
    if (content) {
      this.validateNoAnyType(content);
      this.validateNoVar(content);
      this.validateNullSafety(content);
      this.validateImplicitGlobals(content);
      this.validateEmptyCatch(content);
      this.validateMagicNumbers(content);
      this.validateComponentStructure(content, file_path);
      this.validateApiRouteStructure(content, file_path);
    }

    // Determine if we should block or warn
    if (this.blockers.length > 0) {
      return this.block();
    } else if (this.violations.length > 0) {
      return this.warn();
    }

    return this.approve();
  }

  /**
   * Validate file naming conventions
   */
  validateFileName(filePath) {
    if (!filePath) return;

    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // Check component files
    if (filePath.includes('/components/') && !fileName.includes('.test.')) {
      if (!/^[A-Z][a-zA-Z]+\.tsx?$/.test(fileName)) {
        this.violations.push({
          rule: 'File Naming',
          message: `Component files must use PascalCase: ${fileName}`,
          severity: 'warning'
        });
      }
    }

    // Check utility files
    if (filePath.includes('/utils/') || filePath.includes('/lib/')) {
      if (!/^[a-z]+(-[a-z]+)*\.(ts|js)$/.test(fileName) && !fileName.includes('.test.')) {
        this.violations.push({
          rule: 'File Naming',
          message: `Utility files must use kebab-case: ${fileName}`,
          severity: 'warning'
        });
      }
    }

    // Check API routes
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

  /**
   * Check for 'any' type usage
   */
  validateNoAnyType(content) {
    const anyTypeRegex = /:\s*any(?:\s|;|,|\)|>|$)/gm;
    const anyArrayRegex = /:\s*any\[\]/gm;
    const anyGenericRegex = /<any>/gm;
    const asAnyRegex = /as\s+any/gm;

    const matches = [
      ...Array.from(content.matchAll(anyTypeRegex)),
      ...Array.from(content.matchAll(anyArrayRegex)),
      ...Array.from(content.matchAll(anyGenericRegex)),
      ...Array.from(content.matchAll(asAnyRegex))
    ];

    if (matches.length > 0) {
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1];
        
        this.blockers.push({
          rule: 'No Any Type',
          message: `Line ${lineNum}: 'any' type is forbidden. Use 'unknown' or specific types instead.`,
          line: line.trim(),
          severity: 'error'
        });
      });
    }
  }

  /**
   * Check for 'var' declarations
   */
  validateNoVar(content) {
    const varRegex = /(?:^|\s)var\s+\w+/gm;
    const matches = content.matchAll(varRegex);

    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const lines = content.split('\n');
      const line = lines[lineNum - 1];

      this.blockers.push({
        rule: 'No Var',
        message: `Line ${lineNum}: 'var' is forbidden. Use 'const' or 'let' instead.`,
        line: line.trim(),
        severity: 'error'
      });
    }
  }

  /**
   * Check for proper null/undefined handling
   */
  validateNullSafety(content) {
    // Check for direct property access without optional chaining on nullable types
    const unsafeAccessRegex = /(\w+)\.(\w+)(?!\?)/g;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip if line contains optional chaining, null check, or type definition
      if (line.includes('?.') || line.includes('!= null') || line.includes('!== null') || 
          line.includes('interface') || line.includes('type ') || line.includes('//')) {
        return;
      }

      // Look for patterns that might be unsafe
      if (line.match(/\w+\.\w+/) && !line.includes('?.')) {
        // Check if this looks like it could be nullable (contains | null or | undefined in nearby lines)
        const context = lines.slice(Math.max(0, index - 5), index + 5).join('\n');
        if ((context.includes('| null') || context.includes('| undefined')) && 
            !line.includes('!.')) {
          this.violations.push({
            rule: 'Null Safety',
            message: `Line ${index + 1}: Consider using optional chaining (?.) for potentially null values`,
            line: line.trim(),
            severity: 'warning'
          });
        }
      }
    });
  }

  /**
   * Check for implicit globals
   */
  validateImplicitGlobals(content) {
    // Common implicit globals to check for
    const implicitGlobals = ['window', 'document', 'global', 'process'];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      implicitGlobals.forEach(global => {
        const regex = new RegExp(`(?<!\\.)\\b${global}\\b`, 'g');
        if (regex.test(line) && !line.includes('typeof') && !line.includes('//')) {
          // Check if it's properly declared or imported
          const previousLines = lines.slice(0, index).join('\n');
          if (!previousLines.includes(`declare`) && !previousLines.includes(`import`)) {
            this.violations.push({
              rule: 'Implicit Globals',
              message: `Line ${index + 1}: Ensure '${global}' is properly declared or imported`,
              line: line.trim(),
              severity: 'warning'
            });
          }
        }
      });
    });
  }

  /**
   * Check for empty catch blocks
   */
  validateEmptyCatch(content) {
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*{\s*}/g;
    const matches = content.matchAll(emptyCatchRegex);

    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      this.blockers.push({
        rule: 'Empty Catch',
        message: `Line ${lineNum}: Empty catch blocks are forbidden. Handle or log errors properly.`,
        severity: 'error'
      });
    }
  }

  /**
   * Check for magic numbers
   */
  validateMagicNumbers(content) {
    const lines = content.split('\n');
    const magicNumberRegex = /(?<![\w.])([2-9]\d+|[1-9]\d{2,})(?![\w:])/g;

    lines.forEach((line, index) => {
      // Skip import statements, comments, and constant declarations
      if (line.includes('import') || line.includes('//') || 
          line.includes('const') || line.includes('SCREAMING_SNAKE_CASE')) {
        return;
      }

      const matches = line.matchAll(magicNumberRegex);
      for (const match of matches) {
        // Skip common acceptable values (ports, status codes, timeouts)
        const num = parseInt(match[1]);
        if ([404, 200, 201, 400, 401, 403, 500, 3000, 8080, 5432].includes(num)) {
          continue;
        }

        this.violations.push({
          rule: 'Magic Numbers',
          message: `Line ${index + 1}: Consider extracting magic number '${num}' to a named constant`,
          line: line.trim(),
          severity: 'warning'
        });
      }
    });
  }

  /**
   * Validate React component structure
   */
  validateComponentStructure(content, filePath) {
    if (!filePath || !filePath.includes('/components/')) return;
    if (!content.includes('export') || !content.includes('return')) return;

    // Check for FC type usage
    if (content.includes('React.FC') || content.includes(': FC')) {
      this.violations.push({
        rule: 'Component Structure',
        message: 'Good: Using explicit FC type for functional components',
        severity: 'info'
      });
    }

    // Check for proper hook usage at the top
    const hookRegex = /use[A-Z]\w+\(/g;
    const returnIndex = content.indexOf('return');
    const hooksBeforeReturn = content.substring(0, returnIndex);
    const hooksAfterReturn = content.substring(returnIndex);

    if (hookRegex.test(hooksAfterReturn)) {
      this.blockers.push({
        rule: 'Hook Placement',
        message: 'React hooks must be called at the top of the component, before the return statement',
        severity: 'error'
      });
    }
  }

  /**
   * Validate API route structure
   */
  validateApiRouteStructure(content, filePath) {
    if (!filePath || !filePath.includes('/api/')) return;

    // Check for proper exports
    const hasNamedExports = /export\s+(const|async function)\s+(GET|POST|PUT|DELETE|PATCH)/.test(content);
    if (!hasNamedExports && filePath.endsWith('route.ts')) {
      this.violations.push({
        rule: 'API Routes',
        message: 'API routes should export named functions (GET, POST, etc.)',
        severity: 'warning'
      });
    }

    // Check for withAuth usage
    if (!content.includes('withAuth') && !filePath.includes('/public/')) {
      this.violations.push({
        rule: 'API Security',
        message: 'Consider using withAuth middleware for protected routes',
        severity: 'warning'
      });
    }

    // Check for proper error handling
    if (!content.includes('try') || !content.includes('catch')) {
      this.violations.push({
        rule: 'Error Handling',
        message: 'API routes should include proper try-catch error handling',
        severity: 'warning'
      });
    }
  }

  /**
   * Approve the operation
   */
  approve(customMessage) {
    return {
      approve: true,
      message: customMessage || '✅ Code validation passed'
    };
  }

  /**
   * Warn about violations but allow operation
   */
  warn() {
    const message = [
      '⚠️  Code Quality Warnings:',
      ...this.violations.map(v => `  - ${v.rule}: ${v.message}`),
      '',
      'Consider fixing these issues to maintain code quality.'
    ].join('\n');

    return {
      approve: true,
      message
    };
  }

  /**
   * Block the operation due to critical violations
   */
  block() {
    const message = [
      '❌ Code Standards Violations Found:',
      ...this.blockers.map(v => `  - ${v.rule}: ${v.message}`),
      '',
      ...this.violations.map(v => `  - ${v.rule}: ${v.message}`),
      '',
      'Please fix these violations before proceeding.',
      'Refer to docs/architecture/coding-standards.md for guidelines.'
    ].join('\n');

    return {
      approve: false,
      message
    };
  }
}

// Main execution
function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    const validator = new CodeValidator(input);
    const result = validator.validate();
    
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      approve: true,
      message: `Validator error: ${error.message}`
    }));
  }
}

main();