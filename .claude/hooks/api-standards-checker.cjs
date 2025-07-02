#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * API Standards Checker for Next.js API Routes
 * Validates API routes follow project conventions
 */

class ApiStandardsChecker {
  constructor(input) {
    this.input = input;
    this.violations = [];
    this.suggestions = [];
  }

  /**
   * Main validation entry point
   */
  validate() {
    // Parse Claude Code hook input format
    const { tool_name, tool_input, output } = this.input;
    const { content, file_path } = tool_input || {};
    
    // Security: Basic input validation
    if (file_path && (file_path.includes('../') || file_path.includes('..\\') || file_path.startsWith('/'))) {
      return this.approve('Potentially unsafe file path detected');
    }
    
    // Only validate API route files
    if (!this.isApiRoute(file_path)) {
      return this.approve();
    }

    // Use output content for PostToolUse, input content for PreToolUse
    const codeContent = output?.content || content;
    if (!codeContent) {
      return this.approve();
    }

    // Perform validations
    this.validateFileName(file_path);
    this.validateHttpMethods(codeContent);
    this.validateResponseFormat(codeContent);
    this.validateErrorHandling(codeContent);
    this.validateAuthentication(codeContent, file_path);
    this.validateInputValidation(codeContent);
    this.validateMultiTenancy(codeContent);

    // Return results
    if (this.violations.length > 0) {
      return this.warn();
    }

    return this.approve();
  }

  /**
   * Check if file is an API route
   */
  isApiRoute(filePath) {
    return filePath && filePath.includes('/app/api/') && !filePath.includes('.test.');
  }

  /**
   * Validate file naming convention
   */
  validateFileName(filePath) {
    const fileName = path.basename(filePath);
    
    if (fileName !== 'route.ts' && fileName !== 'route.js') {
      this.violations.push({
        rule: 'File Naming',
        message: `API route files must be named 'route.ts', found: ${fileName}`,
        severity: 'error'
      });
    }
  }

  /**
   * Validate HTTP method exports
   */
  validateHttpMethods(content) {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    const exportedMethods = [];
    
    // Find exported HTTP methods
    validMethods.forEach(method => {
      const patterns = [
        new RegExp(`export\\s+const\\s+${method}\\s*=`, 'g'),
        new RegExp(`export\\s+async\\s+function\\s+${method}`, 'g'),
        new RegExp(`export\\s+function\\s+${method}`, 'g')
      ];
      
      if (patterns.some(pattern => pattern.test(content))) {
        exportedMethods.push(method);
      }
    });

    if (exportedMethods.length === 0) {
      this.violations.push({
        rule: 'HTTP Methods',
        message: 'API routes should export named HTTP method handlers (GET, POST, etc.)',
        severity: 'error'
      });
    }

    // Check for consistent async usage
    exportedMethods.forEach(method => {
      const asyncPattern = new RegExp(`export\\s+const\\s+${method}\\s*=\\s*async`);
      const functionPattern = new RegExp(`export\\s+async\\s+function\\s+${method}`);
      
      if (!asyncPattern.test(content) && !functionPattern.test(content)) {
        this.suggestions.push({
          rule: 'Async Handlers',
          message: `Consider making ${method} handler async for consistency`,
          severity: 'info'
        });
      }
    });
  }

  /**
   * Validate response format consistency
   */
  validateResponseFormat(content) {
    const hasApiUtils = content.includes('apiSuccess') || content.includes('apiError') || content.includes('apiPaginated');
    const hasNextResponse = content.includes('NextResponse.json');
    const hasResponseJson = content.includes('Response.json');

    if (!hasApiUtils && (hasNextResponse || hasResponseJson)) {
      this.suggestions.push({
        rule: 'Response Format',
        message: 'Consider using standardized API utilities (apiSuccess, apiError, apiPaginated) for consistent responses',
        severity: 'warning'
      });
    }

    // Check for consistent status codes
    if (content.includes('status:') || content.includes('status(')) {
      const statusMatches = content.match(/status[:(]\s*(\d{3})/g);
      if (statusMatches) {
        statusMatches.forEach(match => {
          const code = match.match(/\d{3}/)[0];
          if (!['200', '201', '204', '400', '401', '403', '404', '500'].includes(code)) {
            this.suggestions.push({
              rule: 'Status Codes',
              message: `Unusual status code ${code} - ensure it's appropriate`,
              severity: 'info'
            });
          }
        });
      }
    }
  }

  /**
   * Validate error handling patterns
   */
  validateErrorHandling(content) {
    const hasTryCatch = content.includes('try') && content.includes('catch');
    const hasErrorHandler = content.includes('handleApiError');
    
    if (!hasTryCatch && !hasErrorHandler) {
      this.violations.push({
        rule: 'Error Handling',
        message: 'API routes should include proper error handling (try-catch or handleApiError)',
        severity: 'warning'
      });
    }

    // Check for proper error responses
    if (hasTryCatch) {
      const catchBlocks = content.match(/catch\s*\([^)]*\)\s*{[^}]*}/g);
      if (catchBlocks) {
        catchBlocks.forEach(block => {
          if (!block.includes('apiError') && !block.includes('status') && !block.includes('Response')) {
            this.violations.push({
              rule: 'Error Response',
              message: 'Catch blocks should return proper error responses',
              severity: 'warning'
            });
          }
        });
      }
    }
  }

  /**
   * Validate authentication usage
   */
  validateAuthentication(content, filePath) {
    const hasWithAuth = content.includes('withAuth');
    const isPublicRoute = filePath.includes('/public/') || filePath.includes('/webhook/');
    
    if (!hasWithAuth && !isPublicRoute) {
      this.suggestions.push({
        rule: 'Authentication',
        message: 'Consider using withAuth middleware for protected routes',
        severity: 'warning'
      });
    }

    // Check for role-based access control
    if (hasWithAuth && !content.includes('permissions') && !content.includes('role')) {
      this.suggestions.push({
        rule: 'Authorization',
        message: 'Consider implementing role-based access control',
        severity: 'info'
      });
    }
  }

  /**
   * Validate input validation
   */
  validateInputValidation(content) {
    const hasZod = content.includes('z.') || content.includes('zod');
    const hasRequestJson = content.includes('request.json()');
    const hasFormData = content.includes('formData()');
    
    if ((hasRequestJson || hasFormData) && !hasZod) {
      this.suggestions.push({
        rule: 'Input Validation',
        message: 'Consider using Zod schemas for request validation',
        severity: 'warning'
      });
    }

    // Check for SQL injection prevention
    if (content.includes('prisma') && content.includes('$queryRaw')) {
      if (!content.includes('Prisma.sql') && !content.includes('$queryRawUnsafe')) {
        this.suggestions.push({
          rule: 'SQL Safety',
          message: 'Ensure raw queries are parameterized to prevent SQL injection',
          severity: 'warning'
        });
      }
    }
  }

  /**
   * Validate multi-tenancy patterns
   */
  validateMultiTenancy(content) {
    const hasPrismaQuery = content.includes('prisma.');
    const hasClinicFilter = content.includes('clinic_id') || content.includes('clinicId');
    
    if (hasPrismaQuery && !hasClinicFilter) {
      // Check if it's a query that should be filtered by clinic
      const dataModels = ['provider', 'patient', 'appointment', 'transaction'];
      const hasDataModel = dataModels.some(model => content.includes(`prisma.${model}`));
      
      if (hasDataModel) {
        this.suggestions.push({
          rule: 'Multi-tenancy',
          message: 'Ensure data queries are filtered by clinic_id for multi-tenant isolation',
          severity: 'warning'
        });
      }
    }
  }

  /**
   * Approve the operation
   */
  approve() {
    return {
      approve: true,
      message: '✅ API standards check passed'
    };
  }

  /**
   * Warn about violations but allow operation
   */
  warn() {
    const allIssues = [...this.violations, ...this.suggestions];
    const message = [
      '⚠️  API Standards Review:',
      ...allIssues.map(v => `  - ${v.rule}: ${v.message}`),
      '',
      'Consider addressing these issues to maintain API consistency.'
    ].join('\n');

    return {
      approve: true,
      message
    };
  }
}

// Main execution
function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    const checker = new ApiStandardsChecker(input);
    const result = checker.validate();
    
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      approve: true,
      message: `API checker error: ${error.message}`
    }));
  }
}

main();