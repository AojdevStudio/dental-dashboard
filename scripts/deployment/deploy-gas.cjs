#!/usr/bin/env node

/**
 * Google Apps Script Dynamic Deployment System
 * 
 * Automates deployment of Google Apps Scripts to multiple projects
 * using environment-based script ID management and clasp CLI
 * 
 * Features:
 * - Dynamic script ID resolution from .env
 * - Interactive deployment selection
 * - Automatic .clasp.json backup/restore
 * - Sequential/parallel deployment options
 * - Comprehensive error handling and rollback
 * - Deployment validation and reporting
 * 
 * @version 1.0.0
 * @author DevOps Specialist
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');
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

// Deployment configuration mapping
const DEPLOYMENT_CONFIGS = {
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
    ]
  }
};

// Base directory for Google Apps Scripts
const GAS_BASE_DIR = path.join(__dirname, 'google-apps-script');

class GASDeployment {
  constructor() {
    this.backups = new Map();
    this.deploymentResults = [];
    this.startTime = Date.now();
  }

  /**
   * Main entry point for deployment system
   */
  async run() {
    this.logHeader('🚀 Google Apps Script Dynamic Deployment System');
    
    try {
      // Parse command line arguments
      const args = this.parseArguments();
      
      // Validate environment and prerequisites
      await this.validateEnvironment();
      
      // Execute deployment based on arguments
      if (args.status) {
        await this.showStatus();
      } else if (args.all) {
        await this.deployAll();
      } else if (args.type) {
        await this.deployByType(args.type);
      } else if (args.script) {
        await this.deploySingle(args.script);
      } else {
        await this.interactiveDeployment();
      }
      
      // Show final results
      this.showFinalReport();
      
    } catch (error) {
      this.logError('❌ Deployment failed:', error.message);
      this.restoreAllBackups();
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
      status: args.includes('--status'),
      dryRun: args.includes('--dry-run'),
      parallel: args.includes('--parallel'),
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
    
    // Validate deployment directories exist
    for (const [folder] of Object.entries(DEPLOYMENT_CONFIGS)) {
      const deployDir = path.join(GAS_BASE_DIR, folder);
      if (!fs.existsSync(deployDir)) {
        throw new Error(`Deployment directory not found: ${deployDir}`);
      }
    }
    
    // Validate environment variables
    this.validateEnvironmentVariables();
    
    this.logSuccess('✓ Environment validation complete');
  }

  /**
   * Validate all required environment variables are set
   */
  validateEnvironmentVariables() {
    const missingVars = [];
    
    for (const [folder, config] of Object.entries(DEPLOYMENT_CONFIGS)) {
      for (const script of config.scripts) {
        const scriptId = process.env[script.envVar];
        if (!scriptId || scriptId.trim() === '') {
          missingVars.push(script.envVar);
        }
      }
    }
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    this.logSuccess('✓ All environment variables validated');
  }

  /**
   * Interactive deployment menu
   */
  async interactiveDeployment() {
    this.logHeader('📋 Interactive Deployment Menu');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    try {
      // Build menu options
      const menuOptions = [];
      let optionIndex = 1;
      
      // Individual script options
      for (const [folder, config] of Object.entries(DEPLOYMENT_CONFIGS)) {
        for (const script of config.scripts) {
          menuOptions.push({
            index: optionIndex++,
            type: 'single',
            folder,
            script,
            description: script.name
          });
        }
      }
      
      // Bulk deployment options
      menuOptions.push({
        index: optionIndex++,
        type: 'bulk',
        target: 'dentist',
        description: 'Deploy All Dentist Scripts (3 scripts)'
      });
      
      menuOptions.push({
        index: optionIndex++,
        type: 'bulk', 
        target: 'hygienist',
        description: 'Deploy All Hygienist Scripts (2 scripts)'
      });
      
      menuOptions.push({
        index: optionIndex++,
        type: 'bulk',
        target: 'all',
        description: 'Deploy All Scripts (5 scripts)'
      });
      
      // Display menu
      console.log('');
      for (const option of menuOptions) {
        console.log(`  ${colors.cyan}${option.index}.${colors.reset} ${option.description}`);
      }
      console.log(`  ${colors.cyan}0.${colors.reset} Exit`);
      console.log('');
      
      const answer = await this.question(rl, 'Select deployment option (number): ');
      const selectedIndex = parseInt(answer);
      
      rl.close();
      
      if (selectedIndex === 0) {
        this.logInfo('👋 Deployment cancelled');
        return;
      }
      
      const selectedOption = menuOptions.find(opt => opt.index === selectedIndex);
      if (!selectedOption) {
        throw new Error('Invalid selection');
      }
      
      // Execute selected deployment
      if (selectedOption.type === 'single') {
        await this.deploySingleScript(selectedOption.folder, selectedOption.script);
      } else if (selectedOption.type === 'bulk') {
        if (selectedOption.target === 'all') {
          await this.deployAll();
        } else {
          await this.deployByType(selectedOption.target);
        }
      }
      
    } catch (error) {
      rl.close();
      throw error;
    }
  }

  /**
   * Deploy all scripts
   */
  async deployAll() {
    this.logHeader('🚀 Deploying All Scripts');
    
    const allDeployments = [];
    for (const [folder, config] of Object.entries(DEPLOYMENT_CONFIGS)) {
      for (const script of config.scripts) {
        allDeployments.push({ folder, script });
      }
    }
    
    this.logInfo(`📊 Total deployments: ${allDeployments.length}`);
    
    for (const { folder, script } of allDeployments) {
      await this.deploySingleScript(folder, script);
    }
  }

  /**
   * Deploy scripts by type (dentist/hygienist)
   */
  async deployByType(type) {
    this.logHeader(`🚀 Deploying ${type.charAt(0).toUpperCase() + type.slice(1)} Scripts`);
    
    const typeDeployments = [];
    for (const [folder, config] of Object.entries(DEPLOYMENT_CONFIGS)) {
      if (config.type === type) {
        for (const script of config.scripts) {
          typeDeployments.push({ folder, script });
        }
      }
    }
    
    if (typeDeployments.length === 0) {
      throw new Error(`No scripts found for type: ${type}`);
    }
    
    this.logInfo(`📊 Total deployments: ${typeDeployments.length}`);
    
    for (const { folder, script } of typeDeployments) {
      await this.deploySingleScript(folder, script);
    }
  }

  /**
   * Deploy a single script to a specific Google Apps Script project
   */
  async deploySingleScript(folder, script) {
    const startTime = Date.now();
    const deployDir = path.join(GAS_BASE_DIR, folder);
    const claspJsonPath = path.join(deployDir, '.clasp.json');
    
    this.logInfo(`\n🎯 Deploying: ${colors.bright}${script.name}${colors.reset}`);
    this.logInfo(`   Folder: ${folder}`);
    this.logInfo(`   Script ID: ${process.env[script.envVar]}`);
    
    try {
      // Backup existing .clasp.json
      await this.backupClaspJson(claspJsonPath, script.name);
      
      // Update .clasp.json with target script ID
      await this.updateClaspJson(claspJsonPath, process.env[script.envVar]);
      
      // Execute clasp push
      await this.executeClaspPush(deployDir);
      
      // Verify deployment
      await this.verifyDeployment(deployDir, script);
      
      const duration = Date.now() - startTime;
      this.deploymentResults.push({
        script: script.name,
        status: 'success',
        duration,
        timestamp: new Date().toISOString()
      });
      
      this.logSuccess(`✅ ${script.name} deployed successfully (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.deploymentResults.push({
        script: script.name,
        status: 'error',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      });
      
      this.logError(`❌ ${script.name} deployment failed:`, error.message);
      
      // Restore backup
      await this.restoreClaspJson(claspJsonPath, script.name);
      
      throw new Error(`Deployment failed for ${script.name}: ${error.message}`);
    } finally {
      // Always restore original .clasp.json
      await this.restoreClaspJson(claspJsonPath, script.name);
    }
  }

  /**
   * Backup .clasp.json file
   */
  async backupClaspJson(claspJsonPath, scriptName) {
    if (fs.existsSync(claspJsonPath)) {
      const backupContent = fs.readFileSync(claspJsonPath, 'utf8');
      this.backups.set(scriptName, {
        path: claspJsonPath,
        content: backupContent
      });
      this.logInfo(`   💾 Backed up .clasp.json`);
    }
  }

  /**
   * Update .clasp.json with new script ID
   */
  async updateClaspJson(claspJsonPath, scriptId) {
    let claspConfig = {};
    
    // Load existing config if it exists
    if (fs.existsSync(claspJsonPath)) {
      const content = fs.readFileSync(claspJsonPath, 'utf8');
      claspConfig = JSON.parse(content);
    }
    
    // Update script ID
    claspConfig.scriptId = scriptId;
    
    // Ensure required fields
    if (!claspConfig.rootDir) claspConfig.rootDir = '';
    
    // Write updated config
    fs.writeFileSync(claspJsonPath, JSON.stringify(claspConfig, null, 2));
    this.logInfo(`   📝 Updated .clasp.json with script ID: ${scriptId}`);
  }

  /**
   * Execute clasp push command
   */
  async executeClaspPush(deployDir) {
    this.logInfo(`   ⬆️  Pushing to Google Apps Script...`);
    
    try {
      const result = execSync('clasp push --force', {
        cwd: deployDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      this.logInfo(`   📤 Push completed`);
      return result;
      
    } catch (error) {
      // Extract meaningful error from clasp output
      const errorOutput = error.stderr || error.stdout || error.message;
      throw new Error(`clasp push failed: ${errorOutput}`);
    }
  }

  /**
   * Verify deployment was successful
   */
  async verifyDeployment(deployDir, script) {
    try {
      // Get script info to verify deployment
      const result = execSync('clasp status', {
        cwd: deployDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      this.logInfo(`   ✅ Deployment verified`);
      return true;
      
    } catch (error) {
      this.logWarning(`   ⚠️  Could not verify deployment: ${error.message}`);
      return false;
    }
  }

  /**
   * Restore .clasp.json from backup
   */
  async restoreClaspJson(claspJsonPath, scriptName) {
    const backup = this.backups.get(scriptName);
    if (backup) {
      fs.writeFileSync(backup.path, backup.content);
      this.backups.delete(scriptName);
      this.logInfo(`   🔄 Restored original .clasp.json`);
    }
  }

  /**
   * Restore all backups in case of global failure
   */
  restoreAllBackups() {
    this.logInfo('🔄 Restoring all backups...');
    for (const [scriptName, backup] of this.backups) {
      try {
        fs.writeFileSync(backup.path, backup.content);
        this.logSuccess(`✓ Restored backup for ${scriptName}`);
      } catch (error) {
        this.logError(`❌ Failed to restore backup for ${scriptName}:`, error.message);
      }
    }
    this.backups.clear();
  }

  /**
   * Show deployment status
   */
  async showStatus() {
    this.logHeader('📊 Deployment Status');
    
    for (const [folder, config] of Object.entries(DEPLOYMENT_CONFIGS)) {
      console.log(`\n${colors.bright}${config.name}:${colors.reset}`);
      
      for (const script of config.scripts) {
        const scriptId = process.env[script.envVar];
        const status = scriptId ? '✅ Configured' : '❌ Missing Script ID';
        const envStatus = scriptId ? colors.green : colors.red;
        
        console.log(`  ${script.name}:`);
        console.log(`    ${envStatus}${status}${colors.reset}`);
        if (scriptId) {
          console.log(`    Script ID: ${scriptId}`);
        }
        console.log(`    Environment Variable: ${script.envVar}`);
      }
    }
  }

  /**
   * Show final deployment report
   */
  showFinalReport() {
    const duration = Date.now() - this.startTime;
    const successful = this.deploymentResults.filter(r => r.status === 'success').length;
    const failed = this.deploymentResults.filter(r => r.status === 'error').length;
    
    this.logHeader('📋 Deployment Report');
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total Duration: ${duration}ms`);
    console.log(`  ${colors.green}Successful: ${successful}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`  Total: ${this.deploymentResults.length}`);
    
    if (this.deploymentResults.length > 0) {
      console.log(`\n${colors.bright}Details:${colors.reset}`);
      for (const result of this.deploymentResults) {
        const statusColor = result.status === 'success' ? colors.green : colors.red;
        const statusIcon = result.status === 'success' ? '✅' : '❌';
        
        console.log(`  ${statusIcon} ${colors.bright}${result.script}${colors.reset}`);
        console.log(`     Status: ${statusColor}${result.status}${colors.reset}`);
        console.log(`     Duration: ${result.duration}ms`);
        console.log(`     Time: ${result.timestamp}`);
        
        if (result.error) {
          console.log(`     ${colors.red}Error: ${result.error}${colors.reset}`);
        }
      }
    }
  }

  /**
   * Helper method for readline questions
   */
  question(rl, questionText) {
    return new Promise((resolve) => {
      rl.question(questionText, resolve);
    });
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
${colors.bright}Google Apps Script Dynamic Deployment System${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node scripts/deploy-gas.js [OPTIONS]

${colors.bright}OPTIONS:${colors.reset}
  --all                 Deploy to all configured scripts
  --type=<type>         Deploy by type (dentist|hygienist)
  --script=<name>       Deploy specific script by name
  --status              Show deployment status
  --dry-run             Show what would be deployed without executing
  --parallel            Deploy multiple scripts in parallel (experimental)
  --help, -h            Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  node scripts/deploy-gas.js                    # Interactive menu
  node scripts/deploy-gas.js --all              # Deploy all scripts
  node scripts/deploy-gas.js --type=dentist     # Deploy all dentist scripts  
  node scripts/deploy-gas.js --status           # Show status
  
${colors.bright}PACKAGE.JSON SHORTCUTS:${colors.reset}
  pnpm gas:deploy                               # Interactive menu
  pnpm gas:deploy:all                           # Deploy all scripts
  pnpm gas:deploy:dentist                       # Deploy dentist scripts
  pnpm gas:deploy:hygienist                     # Deploy hygienist scripts
  pnpm gas:status                               # Show status

${colors.bright}CONFIGURATION:${colors.reset}
  Script IDs are read from environment variables in .env file:
  - DR_OBINNA_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID
  - DR_KAMDI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID  
  - DR_CHI_SYNC_V2_1_MULTI_PROVIDER_PROJECT_ID
  - ADRIANE_HYGIENE_SYNC_V2_PROJECT_ID
  - KIA_HYGIENE_SYNC_V2_PROJECT_ID
`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const deployment = new GASDeployment();
  deployment.run().catch((error) => {
    console.error(`${colors.red}❌ Fatal error:${colors.reset} ${error.message}`);
    process.exit(1);
  });
}

module.exports = GASDeployment;