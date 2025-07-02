#!/usr/bin/env node

const fs = require('fs');

/**
 * Commit message validator for conventional commits
 * Format: type(scope): subject
 * 
 * Valid types: feat, fix, docs, style, refactor, test, chore
 */

class CommitMessageValidator {
  constructor(input) {
    this.input = input;
    this.validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
  }

  /**
   * Main validation entry point
   */
  validate() {
    // Parse Claude Code hook input format
    const { tool_name, tool_input } = this.input;
    const { command } = tool_input || {};
    
    // Security: Basic input validation
    if (command && typeof command !== 'string') {
      return this.approve('Invalid command format');
    }
    
    // Only validate git commit commands
    if (tool_name !== 'Bash' || !this.isCommitCommand(command)) {
      return this.approve();
    }

    // Extract commit message from command
    const message = this.extractCommitMessage(command);
    if (!message) {
      return this.approve(); // Can't validate without message
    }

    // Validate the commit message format
    const validation = this.validateMessage(message);
    
    if (validation.valid) {
      return this.approve(validation.details);
    } else {
      return this.block(validation.errors, validation.suggestions);
    }
  }

  /**
   * Check if command is a git commit
   */
  isCommitCommand(command) {
    return command && (
      command.includes('git commit') ||
      command.includes('git cm') || // common alias
      command.includes('gc -m') // common alias
    );
  }

  /**
   * Extract commit message from command
   */
  extractCommitMessage(command) {
    // Handle different commit message formats
    let message = '';
    
    // Format: git commit -m "message"
    const singleQuoteMatch = command.match(/-m\s+'([^']+)'/);
    const doubleQuoteMatch = command.match(/-m\s+"([^"]+)"/);
    
    // Format: git commit -m "$(cat <<'EOF'...EOF)"
    const heredocMatch = command.match(/cat\s*<<\s*['"]?EOF['"]?\s*([\s\S]*?)\s*EOF/);
    
    if (singleQuoteMatch) {
      message = singleQuoteMatch[1];
    } else if (doubleQuoteMatch) {
      message = doubleQuoteMatch[1];
    } else if (heredocMatch) {
      message = heredocMatch[1].trim();
    }
    
    // Get just the first line for conventional commit validation
    return message.split('\n')[0].trim();
  }

  /**
   * Validate commit message format
   */
  validateMessage(message) {
    const errors = [];
    const suggestions = [];
    const details = [];
    
    // Check for empty message
    if (!message) {
      errors.push('Commit message cannot be empty');
      return { valid: false, errors, suggestions };
    }
    
    // Check basic format: type(scope): subject or type: subject
    const conventionalFormat = /^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/;
    const match = message.match(conventionalFormat);
    
    if (!match) {
      errors.push('Commit message must follow conventional format: type(scope): subject');
      suggestions.push('Examples:');
      suggestions.push('  feat(auth): add login functionality');
      suggestions.push('  fix: resolve memory leak in provider list');
      suggestions.push('  docs(api): update REST endpoint documentation');
      return { valid: false, errors, suggestions };
    }
    
    const [, type, scope, subject] = match;
    
    // Validate type
    if (!this.validTypes.includes(type)) {
      errors.push(`Invalid commit type '${type}'`);
      suggestions.push(`Valid types: ${this.validTypes.join(', ')}`);
    } else {
      details.push(`Type: ${type} ✓`);
    }
    
    // Validate scope (optional but recommended for features)
    if (scope) {
      if (scope.length > 20) {
        errors.push('Scope should be concise (max 20 characters)');
      } else {
        details.push(`Scope: ${scope} ✓`);
      }
    } else if (type === 'feat' || type === 'fix') {
      suggestions.push('Consider adding a scope for better context');
    }
    
    // Validate subject
    if (subject) {
      // Check first character is lowercase
      if (/^[A-Z]/.test(subject)) {
        errors.push('Subject should start with lowercase letter');
      }
      
      // Check for ending punctuation
      if (/[.!?]$/.test(subject)) {
        errors.push('Subject should not end with punctuation');
      }
      
      // Check length
      if (subject.length > 50) {
        suggestions.push(`Subject is ${subject.length} characters (recommended: max 50)`);
      }
      
      // Check for imperative mood (basic check)
      const firstWord = subject.split(' ')[0];
      const imperativeWords = ['add', 'update', 'fix', 'remove', 'implement', 'create', 'delete', 'improve', 'refactor', 'change', 'move', 'rename'];
      const pastTenseWords = ['added', 'updated', 'fixed', 'removed', 'implemented', 'created', 'deleted', 'improved', 'refactored', 'changed', 'moved', 'renamed'];
      
      if (pastTenseWords.includes(firstWord.toLowerCase())) {
        errors.push('Use imperative mood in subject (e.g., "add" not "added")');
      }
      
      if (errors.length === 0) {
        details.push(`Subject: "${subject}" ✓`);
      }
    } else {
      errors.push('Subject cannot be empty');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      suggestions,
      details
    };
  }

  /**
   * Approve the operation
   */
  approve(details) {
    let message = '✅ Commit message validation passed';
    if (details && details.length > 0) {
      message += '\n' + details.join('\n');
    }
    
    return {
      approve: true,
      message
    };
  }

  /**
   * Block the operation due to invalid format
   */
  block(errors, suggestions) {
    const message = [
      '❌ Invalid commit message format:',
      ...errors.map(e => `  - ${e}`),
      '',
      ...suggestions.map(s => `  ${s}`),
      '',
      'Commit format: type(scope): subject',
      '',
      'Types:',
      '  feat     - New feature',
      '  fix      - Bug fix',
      '  docs     - Documentation only',
      '  style    - Code style changes',
      '  refactor - Code refactoring',
      '  test     - Add/update tests',
      '  chore    - Maintenance tasks',
      '',
      'Example: feat(providers): add location filter to provider list'
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
    const validator = new CommitMessageValidator(input);
    const result = validator.validate();
    
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      approve: true,
      message: `Commit validator error: ${error.message}`
    }));
  }
}

main();