#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Code Quality Reporter
 * Generates a summary report of code quality findings during the session
 */

class CodeQualityReporter {
  constructor() {
    this.sessionFile = path.join(__dirname, '.session-quality.json');
    this.reportsDir = path.join(process.cwd(), 'docs', 'reports');
    this.ensureReportsDirectory();
    this.loadSession();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }
    } catch (error) {
      // Silently fail - don't interrupt the workflow
    }
  }

  /**
   * Load or initialize session data
   */
  loadSession() {
    try {
      if (fs.existsSync(this.sessionFile)) {
        const data = fs.readFileSync(this.sessionFile, 'utf-8');
        this.session = JSON.parse(data);
      } else {
        this.session = {
          startTime: new Date().toISOString(),
          filesModified: new Set(),
          violations: [],
          improvements: [],
          statistics: {
            totalFiles: 0,
            totalViolations: 0,
            blockedOperations: 0,
            autoFixed: 0
          }
        };
      }
    } catch (error) {
      this.session = this.createNewSession();
    }
  }

  /**
   * Create a new session
   */
  createNewSession() {
    return {
      startTime: new Date().toISOString(),
      filesModified: new Set(),
      violations: [],
      improvements: [],
      statistics: {
        totalFiles: 0,
        totalViolations: 0,
        blockedOperations: 0,
        autoFixed: 0
      }
    };
  }

  /**
   * Process hook event
   */
  processEvent(input) {
    // Parse Claude Code hook input format
    const { event, tool_name, tool_input, message } = input;
    const { file_path } = tool_input || {};
    
    // Security: Basic input validation
    if (file_path && (file_path.includes('../') || file_path.includes('..\\') || file_path.startsWith('/'))) {
      return { message: 'Potentially unsafe file path detected' };
    }

    // Track file modifications
    if (file_path && (tool_name === 'Write' || tool_name === 'Edit' || tool_name === 'MultiEdit' || tool_name === 'Task')) {
      this.session.filesModified.add(file_path);
      this.session.statistics.totalFiles++;
    }

    // Track violations and improvements
    if (message) {
      if (message.includes('❌')) {
        this.session.statistics.blockedOperations++;
        this.recordViolation(message, file_path);
      } else if (message.includes('⚠️')) {
        this.session.statistics.totalViolations++;
        this.recordViolation(message, file_path);
      } else if (message.includes('✅') && message.includes('organized')) {
        this.session.statistics.autoFixed++;
        this.recordImprovement(message, file_path);
      }
    }

    // Save session data
    this.saveSession();

    // Generate report on Stop event
    if (event === 'Stop') {
      return this.generateReport();
    }

    return null;
  }

  /**
   * Record a violation
   */
  recordViolation(message, filePath) {
    // Extract violation details from message
    const lines = message.split('\n');
    const violations = lines
      .filter(line => line.includes(':') && line.trim().startsWith('-'))
      .map(line => line.trim().substring(2)); // Remove '- '

    violations.forEach(violation => {
      this.session.violations.push({
        file: filePath || 'unknown',
        issue: violation,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Record an improvement
   */
  recordImprovement(message, filePath) {
    this.session.improvements.push({
      file: filePath || 'unknown',
      action: message.split('\n')[0],
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Save session data
   */
  saveSession() {
    try {
      // Convert Set to Array for JSON serialization
      const sessionData = {
        ...this.session,
        filesModified: Array.from(this.session.filesModified)
      };
      fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
    } catch (error) {
      // Silently fail - don't interrupt the workflow
    }
  }

  /**
   * Generate quality report
   */
  generateReport() {
    const duration = this.calculateDuration();
    const topIssues = this.getTopIssues();
    const fileStats = this.getFileStatistics();

    const report = [
      '# Code Quality Session Report',
      '',
      `**Duration:** ${duration}  `,
      `**Files Modified:** ${this.session.filesModified.size || Array.from(this.session.filesModified).length}  `,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      '## Statistics',
      '',
      `- **Total Operations:** ${this.session.statistics.totalFiles}`,
      `- **Violations Found:** ${this.session.statistics.totalViolations}`,
      `- **Operations Blocked:** ${this.session.statistics.blockedOperations}`,
      `- **Auto-fixes Applied:** ${this.session.statistics.autoFixed}`,
      ''
    ];

    if (topIssues.length > 0) {
      report.push('## Top Issues');
      report.push('');
      topIssues.forEach(issue => {
        report.push(`- **${issue.type}** (${issue.count} occurrences)`);
      });
      report.push('');
    }

    if (this.session.improvements.length > 0) {
      report.push('## Improvements Made');
      report.push('');
      this.session.improvements.slice(0, 5).forEach(imp => {
        report.push(`- **${path.basename(imp.file)}:** ${imp.action}`);
      });
      report.push('');
    }

    if (fileStats.mostProblematic.length > 0) {
      report.push('## Files Needing Attention');
      report.push('');
      fileStats.mostProblematic.forEach(file => {
        report.push(`- **${file.path}** (${file.issues} issues)`);
      });
      report.push('');
    }

    report.push('## Recommendations');
    report.push('');
    this.getRecommendations().forEach(rec => {
      report.push(`- ${rec.replace(/^\s*-\s*/, '')}`);
    });
    report.push('');
    report.push('## Reference');
    report.push('');
    report.push('For detailed coding standards, see: [docs/architecture/coding-standards.md](../architecture/coding-standards.md)');

    // Save report to file with proper naming
    this.saveReportToFile(report.join('\n'));

    // Clean up session file
    this.cleanup();

    return {
      message: '📊 Code quality session report generated'
    };
  }

  /**
   * Save report to file with proper kebab-case naming
   */
  saveReportToFile(reportContent) {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `code-quality-session-${timestamp}.md`;
      const filepath = path.join(this.reportsDir, filename);
      
      fs.writeFileSync(filepath, reportContent, 'utf-8');
      
      console.error(`📁 Report saved: docs/reports/${filename}`);
    } catch (error) {
      // Silently fail - don't interrupt the workflow
      console.error(`⚠️ Failed to save report: ${error.message}`);
    }
  }

  /**
   * Calculate session duration
   */
  calculateDuration() {
    const start = new Date(this.session.startTime);
    const end = new Date();
    const diff = end - start;
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Get top issues by frequency
   */
  getTopIssues() {
    const issueCounts = {};
    
    this.session.violations.forEach(violation => {
      const issueType = violation.issue.split(':')[0];
      issueCounts[issueType] = (issueCounts[issueType] || 0) + 1;
    });

    return Object.entries(issueCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Get file statistics
   */
  getFileStatistics() {
    const fileIssues = {};
    
    this.session.violations.forEach(violation => {
      if (violation.file && violation.file !== 'unknown') {
        fileIssues[violation.file] = (fileIssues[violation.file] || 0) + 1;
      }
    });

    const mostProblematic = Object.entries(fileIssues)
      .map(([path, issues]) => ({ path: path.replace(/.*\//, ''), issues }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 3);

    return { mostProblematic };
  }

  /**
   * Generate recommendations based on findings
   */
  getRecommendations() {
    const recommendations = [];
    const topIssues = this.getTopIssues();

    // Check for specific issue patterns
    const hasAnyType = topIssues.some(issue => issue.type.includes('Any Type'));
    const hasVar = topIssues.some(issue => issue.type.includes('Var'));
    const hasNullSafety = topIssues.some(issue => issue.type.includes('Null Safety'));

    if (hasAnyType) {
      recommendations.push('  - Replace "any" types with "unknown" or specific types');
      recommendations.push('  - Run: pnpm typecheck to identify type issues');
    }

    if (hasVar) {
      recommendations.push('  - Use "const" or "let" instead of "var"');
      recommendations.push('  - Enable no-var ESLint rule for automatic detection');
    }

    if (hasNullSafety) {
      recommendations.push('  - Use optional chaining (?.) for nullable values');
      recommendations.push('  - Add null checks before property access');
    }

    if (this.session.statistics.blockedOperations > 0) {
      recommendations.push('  - Review blocked operations and fix violations');
      recommendations.push('  - Run: pnpm biome:check for comprehensive linting');
    }

    if (recommendations.length === 0) {
      recommendations.push('  - Great job! Continue following coding standards');
      recommendations.push('  - Consider running: pnpm code-quality for full validation');
    }

    return recommendations;
  }

  /**
   * Clean up session data
   */
  cleanup() {
    try {
      if (fs.existsSync(this.sessionFile)) {
        fs.unlinkSync(this.sessionFile);
      }
    } catch (error) {
      // Silently fail
    }
  }
}

// Main execution
function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    const reporter = new CodeQualityReporter();
    const result = reporter.processEvent(input);
    
    if (result) {
      console.log(JSON.stringify(result));
    } else {
      // No output for non-Stop events
      console.log(JSON.stringify({ message: '' }));
    }
  } catch (error) {
    console.log(JSON.stringify({
      message: `Reporter error: ${error.message}`
    }));
  }
}

main();