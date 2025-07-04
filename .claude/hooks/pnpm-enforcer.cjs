#!/usr/bin/env node

const fs = require('fs');

/**
 * PNPM Enforcer Hook
 * Blocks npm/npx commands and suggests pnpm alternatives
 */

class PnpmEnforcer {
  constructor(input) {
    this.input = input;
  }

  /**
   * Check if command contains npm or npx usage
   */
  detectNpmUsage(command) {
    if (!command || typeof command !== 'string') {
      return null;
    }

    // Common npm/npx patterns to block
    const npmPatterns = [
      /(?:^|\s|;|&&|\|\|)npm\s+/,
      /(?:^|\s|;|&&|\|\|)npx\s+/,
      /(?:^|\s|;|&&|\|\|)npm$/,
      /(?:^|\s|;|&&|\|\|)npx$/
    ];

    for (const pattern of npmPatterns) {
      const match = command.match(pattern);
      if (match) {
        return {
          detected: true,
          original: command.trim(),
          suggestion: this.generatePnpmAlternative(command)
        };
      }
    }

    return null;
  }

  /**
   * Generate pnpm alternative for npm/npx commands
   */
  generatePnpmAlternative(command) {
    // Common npm -> pnpm conversions
    const conversions = [
      // Basic package management
      { pattern: /npm install(?:\s|$)/, replacement: 'pnpm install' },
      { pattern: /npm i(?:\s|$)/, replacement: 'pnpm install' },
      { pattern: /npm install\s+(.+)/, replacement: 'pnpm add $1' },
      { pattern: /npm i\s+(.+)/, replacement: 'pnpm add $1' },
      { pattern: /npm install\s+--save-dev\s+(.+)/, replacement: 'pnpm add -D $1' },
      { pattern: /npm install\s+-D\s+(.+)/, replacement: 'pnpm add -D $1' },
      { pattern: /npm install\s+--global\s+(.+)/, replacement: 'pnpm add -g $1' },
      { pattern: /npm install\s+-g\s+(.+)/, replacement: 'pnpm add -g $1' },
      
      // Uninstall
      { pattern: /npm uninstall\s+(.+)/, replacement: 'pnpm remove $1' },
      { pattern: /npm remove\s+(.+)/, replacement: 'pnpm remove $1' },
      { pattern: /npm rm\s+(.+)/, replacement: 'pnpm remove $1' },
      
      // Scripts
      { pattern: /npm run\s+(.+)/, replacement: 'pnpm run $1' },
      { pattern: /npm start/, replacement: 'pnpm start' },
      { pattern: /npm test/, replacement: 'pnpm test' },
      { pattern: /npm build/, replacement: 'pnpm build' },
      { pattern: /npm dev/, replacement: 'pnpm dev' },
      
      // Other commands
      { pattern: /npm list/, replacement: 'pnpm list' },
      { pattern: /npm ls/, replacement: 'pnpm list' },
      { pattern: /npm outdated/, replacement: 'pnpm outdated' },
      { pattern: /npm update/, replacement: 'pnpm update' },
      { pattern: /npm audit/, replacement: 'pnpm audit' },
      { pattern: /npm ci/, replacement: 'pnpm install --frozen-lockfile' },
      
      // npx commands
      { pattern: /npx\s+(.+)/, replacement: 'pnpm dlx $1' },
      { pattern: /npx/, replacement: 'pnpm dlx' }
    ];

    let suggestion = command;
    
    for (const conversion of conversions) {
      if (conversion.pattern.test(command)) {
        suggestion = command.replace(conversion.pattern, conversion.replacement);
        break;
      }
    }

    // If no specific conversion found, do basic substitution
    if (suggestion === command) {
      suggestion = command
        .replace(/(?:^|\s)npm(?:\s|$)/, ' pnpm ')
        .replace(/(?:^|\s)npx(?:\s|$)/, ' pnpm dlx ')
        .trim();
    }

    return suggestion;
  }

  /**
   * Validate and process the bash command
   */
  validate() {
    try {
      // Parse Claude Code hook input format
      const { tool_name, tool_input } = this.input;
      
      if (tool_name !== 'Bash') {
        return this.approve();
      }

      const { command } = tool_input || {};
      
      if (!command) {
        return this.approve();
      }

      // Check for npm/npx usage
      const npmUsage = this.detectNpmUsage(command);
      
      if (npmUsage) {
        return this.block(npmUsage);
      }

      return this.approve();
      
    } catch (error) {
      return this.approve(`PNPM enforcer error: ${error.message}`);
    }
  }

  /**
   * Approve the command
   */
  approve(customMessage) {
    return {
      approve: true,
      message: customMessage || '✅ Command approved'
    };
  }

  /**
   * Block npm/npx command and suggest pnpm alternative
   */
  block(npmUsage) {
    const message = [
      '🚫 NPM/NPX Usage Blocked',
      '',
      `❌ Blocked command: ${npmUsage.original}`,
      `✅ Use this instead: ${npmUsage.suggestion}`,
      '',
      '📋 Why pnpm?',
      '  • Faster installation and better disk efficiency',
      '  • More reliable dependency resolution',
      '  • Better monorepo support',
      '  • Consistent with project standards',
      '',
      '💡 Quick pnpm reference:',
      '  • pnpm install     → Install dependencies',
      '  • pnpm add <pkg>   → Add package',
      '  • pnpm add -D <pkg> → Add dev dependency',
      '  • pnpm run <script> → Run package script',
      '  • pnpm dlx <cmd>   → Execute package (like npx)',
      '',
      'Please use the suggested pnpm command instead.'
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
    const enforcer = new PnpmEnforcer(input);
    const result = enforcer.validate();
    
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      approve: true,
      message: `PNPM enforcer error: ${error.message}`
    }));
  }
}

main();