#!/usr/bin/env node

/**
 * Security Scanner for Dental Dashboard
 * 
 * This script performs security scanning to detect:
 * - Hardcoded secrets and API keys
 * - Potential security vulnerabilities
 * - Unsafe coding patterns
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SECURITY_PATTERNS = [
  // API Keys and Secrets
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /token\s*[:=]\s*['"][^'"]+['"]/gi,
  /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  
  // Database URLs with credentials
  /postgres:\/\/[^:]+:[^@]+@/gi,
  /mysql:\/\/[^:]+:[^@]+@/gi,
  /mongodb:\/\/[^:]+:[^@]+@/gi,
  
  // AWS/Cloud credentials
  /AKIA[0-9A-Z]{16}/g,
  /aws[_-]?secret[_-]?access[_-]?key/gi,
  
  // Common secret patterns
  /-----BEGIN [A-Z ]+-----/g,
  /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
];

const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo'
];

const EXCLUDED_FILES = [
  '.env.example',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
];

function runCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (options.allowFailure) {
      return error.stdout || '';
    }
    throw error;
  }
}

function scanFile(filePath) {
  const findings = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      SECURITY_PATTERNS.forEach((pattern, patternIndex) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip if it's clearly a placeholder or example
            if (match.includes('your_') || 
                match.includes('YOUR_') || 
                match.includes('example') ||
                match.includes('EXAMPLE') ||
                match.includes('placeholder') ||
                match.includes('xxx') ||
                match.includes('***')) {
              return;
            }
            
            findings.push({
              file: filePath,
              line: index + 1,
              pattern: patternIndex,
              match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
              severity: getSeverity(pattern, match)
            });
          });
        }
      });
    });
  } catch (error) {
    // Skip files that can't be read
  }
  
  return findings;
}

function getSeverity(pattern, match) {
  // High severity for actual secrets
  if (pattern.source.includes('AKIA') || 
      pattern.source.includes('BEGIN') ||
      pattern.source.includes('sk-')) {
    return 'HIGH';
  }
  
  // Medium severity for potential secrets
  if (pattern.source.includes('secret') || 
      pattern.source.includes('password') ||
      pattern.source.includes('token')) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

function scanDirectory(dir, findings = []) {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (EXCLUDED_DIRS.includes(item) || EXCLUDED_FILES.includes(item)) {
        continue;
      }
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, findings);
      } else if (stat.isFile()) {
        const ext = extname(item);
        // Only scan text files
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.env'].includes(ext)) {
          const fileFindings = scanFile(fullPath);
          findings.push(...fileFindings);
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return findings;
}

function generateSecurityReport() {
  console.log('🔐 Starting security scan...');
  
  const findings = scanDirectory('.');
  const timestamp = new Date().toISOString();
  
  // Group findings by severity
  const highSeverity = findings.filter(f => f.severity === 'HIGH');
  const mediumSeverity = findings.filter(f => f.severity === 'MEDIUM');
  const lowSeverity = findings.filter(f => f.severity === 'LOW');
  
  console.log('\n📊 Security Scan Results:');
  console.log(`- High Severity: ${highSeverity.length}`);
  console.log(`- Medium Severity: ${mediumSeverity.length}`);
  console.log(`- Low Severity: ${lowSeverity.length}`);
  console.log(`- Total Findings: ${findings.length}`);
  
  if (findings.length > 0) {
    console.log('\n🚨 Security Findings:');
    
    if (highSeverity.length > 0) {
      console.log('\n❌ HIGH SEVERITY:');
      highSeverity.forEach(finding => {
        console.log(`  ${finding.file}:${finding.line} - ${finding.match}`);
      });
    }
    
    if (mediumSeverity.length > 0) {
      console.log('\n⚠️ MEDIUM SEVERITY:');
      mediumSeverity.forEach(finding => {
        console.log(`  ${finding.file}:${finding.line} - ${finding.match}`);
      });
    }
    
    if (lowSeverity.length > 0) {
      console.log('\n💡 LOW SEVERITY:');
      lowSeverity.forEach(finding => {
        console.log(`  ${finding.file}:${finding.line} - ${finding.match}`);
      });
    }
    
    console.log('\n🔧 Recommendations:');
    console.log('1. Move secrets to environment variables');
    console.log('2. Use .env files (not committed to git)');
    console.log('3. Consider using a secrets management service');
    console.log('4. Review and validate each finding');
    
    // Exit with error code if high severity findings
    if (highSeverity.length > 0) {
      console.log('\n❌ Security scan failed due to high severity findings!');
      process.exit(1);
    }
  } else {
    console.log('\n✅ No security issues detected!');
  }
  
  // Additional checks
  console.log('\n🔍 Additional Security Checks:');
  
  // Check for .env files in git
  try {
    const gitFiles = runCommand('git ls-files | grep -E "\\.env$"', { 
      silent: true, 
      allowFailure: true 
    });
    if (gitFiles.trim()) {
      console.log('⚠️ .env files found in git repository:');
      console.log(gitFiles);
      console.log('Consider adding .env to .gitignore');
    } else {
      console.log('✅ No .env files in git repository');
    }
  } catch (error) {
    console.log('ℹ️ Could not check git files');
  }
  
  // Check for package vulnerabilities
  console.log('\n🔍 Running dependency audit...');
  try {
    const auditResult = runCommand('pnpm audit --audit-level moderate', { 
      allowFailure: true 
    });
    console.log('✅ Dependency audit completed');
  } catch (error) {
    console.log('⚠️ Dependency audit found issues - please review');
  }
  
  console.log('\n✅ Security scan completed');
}

// Run the security scan
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSecurityReport();
}

export { generateSecurityReport };
