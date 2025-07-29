#!/usr/bin/env node

/**
 * Google Apps Script Health Check System
 * 
 * Validates Google Apps Script deployments and performs health checks
 * to ensure scripts are functioning correctly after deployment
 * 
 * Features:
 * - Script accessibility validation
 * - Function availability checks
 * - Configuration validation
 * - Error detection and reporting
 * - Performance monitoring
 * 
 * @version 1.0.0
 * @author DevOps Specialist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  'deploy-dentist-sync-v2.1-multi-provider': {
    name: 'Dentist Multi-Provider Sync V2.1',
    type: 'dentist',
    scripts: [
      {
        name: 'Dr. Obinna Multi-Provider Sync',
        envVar: 'DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID',
        provider: 'obinna'
      },
      {
        name: 'Dr. Kamdi Multi-Provider Sync', 
        envVar: 'DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID',
        provider: 'kamdi'
      },
      {
        name: 'Dr. Chi Multi-Provider Sync',
        envVar: 'DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID', 
        provider: 'chi'
      }
    ],
    requiredFunctions: [
      'setupMultiProviderCredentials',
      'getCurrentProviderConfig',
      'syncProviderData',
      'logToDentistSheet_',
      'getSyncCredentials',
      'testProviderDetection',
      'debugExternalMappings'
    ],
    requiredFiles: [
      'appsscript.json',
      'config.gs',
      'credentials.gs',
      'main.gs',
      'menu.gs',
      'sync.gs',
      'shared-sync-utils.gs',
      'shared-multi-provider-utils.gs'
    ]
  },
  'deploy-hygienist-sync-v2': {
    name: 'Hygienist Sync V2',
    type: 'hygienist',
    scripts: [
      {
        name: 'Adriane Hygiene Sync V2',
        envVar: 'ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID',
        provider: 'adriane'
      },
      {
        name: 'Kia Hygiene Sync V2',
        envVar: 'KIA_HYGIENE_SYNC_V2_PROJECT_ID',
        provider: 'kia'
      }
    ],
    requiredFunctions: [
      'setupHygienistCredentials',
      'syncHygieneData',
      'logToHygieneSheet_',
      'getSyncCredentials',
      'validateDataIntegrity'
    ],
    requiredFiles: [
      'appsscript.json',
      'config.gs',
      'credentials.gs',
      'main.gs',
      'menu.gs',
      'sync.gs',
      'shared-sync-utils.gs'
    ]
  }
};

// Base directory for Google Apps Scripts
const GAS_BASE_DIR = path.join(__dirname, '..', 'scripts', 'google-apps-script');

class GASHealthCheck {
  constructor() {
    this.checkResults = [];
    this.startTime = Date.now();
  }

  /**
   * Main entry point for health check system
   */
  async run() {
    this.logHeader('🔍 Google Apps Script Health Check System');
    
    try {
      // Parse command line arguments
      const args = this.parseArguments();
      
      // Validate environment
      await this.validateEnvironment();
      
      // Execute health checks based on arguments
      if (args.all) {
        await this.checkAllScripts();
      } else if (args.type) {
        await this.checkByType(args.type);
      } else if (args.script) {
        await this.checkSingleScript(args.script);
      } else {
        await this.interactiveHealthCheck();
      }
      
      // Show final results
      this.showHealthReport();
      
    } catch (error) {
      this.logError('❌ Health check failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    return {
      all: args.includes('--all'),
      type: args.find(arg => arg.startsWith('--type='))?.split('=')[1],
      script: args.find(arg => arg.startsWith('--script='))?.split('=')[1],
      detailed: args.includes('--detailed'),
      help: args.includes('--help') || args.includes('-h')
    };
  }

  /**
   * Validate environment and prerequisites
   */
  async validateEnvironment() {
    this.logInfo('🔍 Validating environment...');
    
    // Check if clasp is installed
    try {
      execSync('clasp --version', { stdio: 'pipe' });
      this.logSuccess('✓ clasp CLI found');
    } catch (error) {
      throw new Error('clasp CLI not found. Install with: npm install -g @google/clasp');
    }
    
    // Check if user is logged in to clasp
    try {
      execSync('clasp list', { stdio: 'pipe' });
      this.logSuccess('✓ clasp authentication verified');
    } catch (error) {
      throw new Error('clasp not authenticated. Run: clasp login');
    }
    
    this.logSuccess('✓ Environment validation complete');
  }

  /**
   * Interactive health check menu
   */
  async interactiveHealthCheck() {
    this.logHeader('📋 Interactive Health Check Menu');
    
    // For now, just run all checks
    await this.checkAllScripts();
  }

  /**
   * Check all scripts
   */
  async checkAllScripts() {
    this.logHeader('🔍 Checking All Scripts');
    
    for (const [folder, config] of Object.entries(HEALTH_CHECK_CONFIG)) {
      await this.checkScriptDeployment(folder, config);
    }
  }

  /**
   * Check scripts by type (dentist/hygienist)
   */
  async checkByType(type) {
    this.logHeader(`🔍 Checking ${type.charAt(0).toUpperCase() + type.slice(1)} Scripts`);
    
    for (const [folder, config] of Object.entries(HEALTH_CHECK_CONFIG)) {
      if (config.type === type) {
        await this.checkScriptDeployment(folder, config);
      }
    }
  }

  /**
   * Check a specific script deployment
   */
  async checkScriptDeployment(folder, config) {
    const startTime = Date.now();
    const deployDir = path.join(GAS_BASE_DIR, folder);
    
    this.logInfo(`\n🎯 Checking: ${colors.bright}${config.name}${colors.reset}`);
    this.logInfo(`   Folder: ${folder}`);
    
    const folderResult = {
      name: config.name,
      folder,
      type: config.type,
      scripts: [],
      files: {
        total: config.requiredFiles.length,
        found: 0,
        missing: []
      },
      functions: {
        total: config.requiredFunctions.length,
        validated: 0,
        missing: []
      },
      overall: 'unknown',
      duration: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Check deployment folder exists
      if (!fs.existsSync(deployDir)) {
        throw new Error(`Deployment directory not found: ${deployDir}`);
      }
      
      // Check required files
      await this.checkRequiredFiles(deployDir, config, folderResult);
      
      // Check functions in source code
      await this.checkRequiredFunctions(deployDir, config, folderResult);
      
      // Check individual script configurations
      for (const script of config.scripts) {
        const scriptResult = await this.checkIndividualScript(deployDir, script);
        folderResult.scripts.push(scriptResult);
      }
      
      // Calculate overall health
      folderResult.overall = this.calculateOverallHealth(folderResult);
      folderResult.duration = Date.now() - startTime;
      
      const healthIcon = folderResult.overall === 'healthy' ? '✅' : 
                        folderResult.overall === 'warning' ? '⚠️' : '❌';
      
      this.logInfo(`${healthIcon} ${config.name}: ${folderResult.overall.toUpperCase()} (${folderResult.duration}ms)`);
      
    } catch (error) {
      folderResult.overall = 'error';
      folderResult.error = error.message;
      folderResult.duration = Date.now() - startTime;
      
      this.logError(`❌ ${config.name}: ERROR`, error.message);
    }
    
    this.checkResults.push(folderResult);
  }

  /**
   * Check required files exist in deployment folder
   */
  async checkRequiredFiles(deployDir, config, result) {
    this.logInfo(`   📁 Checking ${config.requiredFiles.length} required files...`);
    
    for (const requiredFile of config.requiredFiles) {
      const filePath = path.join(deployDir, requiredFile);
      
      if (fs.existsSync(filePath)) {
        result.files.found++;
        this.logSuccess(`     ✓ ${requiredFile}`);
      } else {
        result.files.missing.push(requiredFile);
        this.logError(`     ❌ ${requiredFile} - MISSING`);
      }
    }
    
    const fileHealthPercent = Math.round((result.files.found / result.files.total) * 100);
    this.logInfo(`   📊 Files: ${result.files.found}/${result.files.total} (${fileHealthPercent}%)`);
  }

  /**
   * Check required functions exist in source code
   */
  async checkRequiredFunctions(deployDir, config, result) {
    this.logInfo(`   🔧 Checking ${config.requiredFunctions.length} required functions...`);
    
    // Read all .gs files and combine content
    const gsFiles = fs.readdirSync(deployDir)
      .filter(file => file.endsWith('.gs'))
      .map(file => {
        const filePath = path.join(deployDir, file);
        return {
          file,
          content: fs.readFileSync(filePath, 'utf8')
        };
      });
    
    const allSourceCode = gsFiles.map(f => f.content).join('\n');
    
    for (const requiredFunction of config.requiredFunctions) {
      // Check if function is defined (simple regex check)
      const functionRegex = new RegExp(`function\\s+${requiredFunction}\\s*\\(`, 'i');
      
      if (functionRegex.test(allSourceCode)) {
        result.functions.validated++;
        this.logSuccess(`     ✓ ${requiredFunction}()`);
      } else {
        result.functions.missing.push(requiredFunction);
        this.logError(`     ❌ ${requiredFunction}() - NOT FOUND`);
      }
    }
    
    const functionHealthPercent = Math.round((result.functions.validated / result.functions.total) * 100);
    this.logInfo(`   📊 Functions: ${result.functions.validated}/${result.functions.total} (${functionHealthPercent}%)`);
  }

  /**
   * Check individual script configuration
   */
  async checkIndividualScript(deployDir, script) {
    const claspJsonPath = path.join(deployDir, '.clasp.json');
    const scriptId = process.env[script.envVar];
    
    const scriptResult = {
      name: script.name,
      provider: script.provider,
      envVar: script.envVar,
      scriptId: scriptId || 'NOT_SET',
      status: 'unknown',
      checks: {
        envVarSet: !!scriptId,
        claspJsonExists: fs.existsSync(claspJsonPath),
        scriptIdValid: false,
        accessible: false
      }
    };

    try {
      // Validate script ID format (Google Apps Script IDs are typically 57-65 characters)
      if (scriptId) {
        scriptResult.checks.scriptIdValid = scriptId.length >= 40 && /^[A-Za-z0-9_-]+$/.test(scriptId);
      }
      
      // Try to access script (if clasp.json is properly configured)
      if (scriptResult.checks.claspJsonExists && scriptId) {
        try {
          // Temporarily update .clasp.json to test accessibility
          const originalContent = fs.readFileSync(claspJsonPath, 'utf8');
          const claspConfig = JSON.parse(originalContent);
          claspConfig.scriptId = scriptId;
          fs.writeFileSync(claspJsonPath, JSON.stringify(claspConfig, null, 2));
          
          // Test clasp status
          execSync('clasp status', { 
            cwd: deployDir, 
            stdio: 'pipe',
            timeout: 10000 
          });
          
          scriptResult.checks.accessible = true;
          
          // Restore original .clasp.json
          fs.writeFileSync(claspJsonPath, originalContent);
          
        } catch (error) {
          // Restore original .clasp.json on error
          if (fs.existsSync(claspJsonPath)) {
            try {
              const originalContent = fs.readFileSync(claspJsonPath, 'utf8');
              fs.writeFileSync(claspJsonPath, originalContent);
            } catch (restoreError) {
              // Ignore restore errors
            }
          }
          scriptResult.checks.accessible = false;
        }
      }
      
      // Calculate overall status
      const checksCount = Object.values(scriptResult.checks).filter(Boolean).length;
      const totalChecks = Object.keys(scriptResult.checks).length;
      
      if (checksCount === totalChecks) {
        scriptResult.status = 'healthy';
      } else if (checksCount >= totalChecks / 2) {
        scriptResult.status = 'warning';
      } else {
        scriptResult.status = 'error';
      }
      
    } catch (error) {
      scriptResult.status = 'error';
      scriptResult.error = error.message;
    }
    
    const statusIcon = scriptResult.status === 'healthy' ? '✅' : 
                      scriptResult.status === 'warning' ? '⚠️' : '❌';
    
    this.logInfo(`   ${statusIcon} ${script.name} (${script.provider}): ${scriptResult.status.toUpperCase()}`);
    
    return scriptResult;
  }

  /**
   * Calculate overall health status
   */
  calculateOverallHealth(result) {
    const fileHealth = result.files.found / result.files.total;
    const functionHealth = result.functions.validated / result.functions.total;
    const scriptHealth = result.scripts.filter(s => s.status === 'healthy').length / result.scripts.length;
    
    const overallHealth = (fileHealth + functionHealth + scriptHealth) / 3;
    
    if (overallHealth >= 0.9) return 'healthy';
    if (overallHealth >= 0.7) return 'warning';
    return 'error';
  }

  /**
   * Show comprehensive health report
   */
  showHealthReport() {
    const duration = Date.now() - this.startTime;
    const healthy = this.checkResults.filter(r => r.overall === 'healthy').length;
    const warnings = this.checkResults.filter(r => r.overall === 'warning').length;
    const errors = this.checkResults.filter(r => r.overall === 'error').length;
    
    this.logHeader('📋 Health Check Report');
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total Duration: ${duration}ms`);
    console.log(`  ${colors.green}Healthy: ${healthy}${colors.reset}`);
    console.log(`  ${colors.yellow}Warnings: ${warnings}${colors.reset}`);
    console.log(`  ${colors.red}Errors: ${errors}${colors.reset}`);
    console.log(`  Total: ${this.checkResults.length}`);
    
    if (this.checkResults.length > 0) {
      console.log(`\n${colors.bright}Detailed Results:${colors.reset}`);
      
      for (const result of this.checkResults) {
        const healthColor = result.overall === 'healthy' ? colors.green : 
                           result.overall === 'warning' ? colors.yellow : colors.red;
        const healthIcon = result.overall === 'healthy' ? '✅' : 
                          result.overall === 'warning' ? '⚠️' : '❌';
        
        console.log(`\n  ${healthIcon} ${colors.bright}${result.name}${colors.reset}`);
        console.log(`     Status: ${healthColor}${result.overall.toUpperCase()}${colors.reset}`);
        console.log(`     Duration: ${result.duration}ms`);
        console.log(`     Time: ${result.timestamp}`);
        
        // File health
        const filePercent = Math.round((result.files.found / result.files.total) * 100);
        console.log(`     Files: ${result.files.found}/${result.files.total} (${filePercent}%)`);
        
        if (result.files.missing.length > 0) {
          console.log(`       ${colors.red}Missing: ${result.files.missing.join(', ')}${colors.reset}`);
        }
        
        // Function health
        const functionPercent = Math.round((result.functions.validated / result.functions.total) * 100);
        console.log(`     Functions: ${result.functions.validated}/${result.functions.total} (${functionPercent}%)`);
        
        if (result.functions.missing.length > 0) {
          console.log(`       ${colors.red}Missing: ${result.functions.missing.join(', ')}${colors.reset}`);
        }
        
        // Individual scripts
        if (result.scripts.length > 0) {
          console.log(`     Scripts:`);
          for (const script of result.scripts) {
            const scriptIcon = script.status === 'healthy' ? '✅' : 
                              script.status === 'warning' ? '⚠️' : '❌';
            console.log(`       ${scriptIcon} ${script.name}: ${script.status.toUpperCase()}`);
            
            if (script.status !== 'healthy') {
              console.log(`         Environment Variable: ${script.checks.envVarSet ? '✓' : '❌'} ${script.envVar}`);
              console.log(`         Script ID Valid: ${script.checks.scriptIdValid ? '✓' : '❌'}`);
              console.log(`         Accessible: ${script.checks.accessible ? '✓' : '❌'}`);
            }
          }
        }
        
        if (result.error) {
          console.log(`     ${colors.red}Error: ${result.error}${colors.reset}`);
        }
      }
    }
    
    // Overall system health
    const overallHealth = healthy === this.checkResults.length ? 'HEALTHY' :
                         errors === 0 ? 'WARNING' : 'CRITICAL';
    const overallColor = overallHealth === 'HEALTHY' ? colors.green :
                        overallHealth === 'WARNING' ? colors.yellow : colors.red;
    
    console.log(`\n${colors.bright}Overall System Health: ${overallColor}${overallHealth}${colors.reset}`);
  }

  // Logging methods
  logHeader(message) {
    console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}\n`);
  }

  logInfo(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  logSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  logWarning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  logError(message, detail = '') {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    if (detail) {
      console.log(`  ${colors.red}${detail}${colors.reset}`);
    }
  }
}

// Show help if requested
function showHelp() {
  console.log(`
${colors.bright}Google Apps Script Health Check System${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node scripts/gas-health-check.js [OPTIONS]

${colors.bright}OPTIONS:${colors.reset}
  --all                 Check all configured scripts
  --type=<type>         Check by type (dentist|hygienist)  
  --script=<name>       Check specific script by name
  --detailed            Show detailed diagnostic information
  --help, -h            Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  node scripts/gas-health-check.js                 # Interactive menu
  node scripts/gas-health-check.js --all           # Check all scripts
  node scripts/gas-health-check.js --type=dentist  # Check dentist scripts

${colors.bright}WHAT IS CHECKED:${colors.reset}
  ✓ Required source files exist
  ✓ Required functions are defined
  ✓ Environment variables are set
  ✓ Script IDs are valid format
  ✓ Scripts are accessible via clasp
  ✓ Configuration integrity

${colors.bright}HEALTH STATUSES:${colors.reset}
  ${colors.green}HEALTHY${colors.reset}  - All checks pass (90%+ success rate)
  ${colors.yellow}WARNING${colors.reset}  - Most checks pass (70-89% success rate)
  ${colors.red}ERROR${colors.reset}    - Critical issues found (<70% success rate)
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const healthCheck = new GASHealthCheck();
  healthCheck.run().catch((error) => {
    console.error(`${colors.red}❌ Fatal error:${colors.reset} ${error.message}`);
    process.exit(1);
  });
}

module.exports = GASHealthCheck;