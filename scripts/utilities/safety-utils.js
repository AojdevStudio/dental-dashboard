/**
 * Universal Script Safety Utilities
 * Prevents accidental execution against production database
 */

const path = require('path');
const fs = require('fs');

/**
 * Validates script execution environment for safety
 * @param {string} scriptName - Name of the script being executed
 * @param {Object} options - Safety options
 * @param {boolean} options.allowProduction - Whether script is safe for production
 * @param {boolean} options.requireConfirmation - Whether to require user confirmation
 */
function validateScriptSafety(scriptName, options = {}) {
  const { allowProduction = false, requireConfirmation = false } = options;
  
  console.log(`🔒 Validating safety for script: ${scriptName}`);
  
  // Load environment variables
  require('dotenv').config();
  
  const dbUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Detect production environment
  const isProductionDB = dbUrl?.includes('supabase.com') || 
                        supabaseUrl?.includes('supabase.co');
  
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Database: ${isProductionDB ? 'PRODUCTION' : 'LOCAL'}`);
  
  // Block production execution unless explicitly allowed
  if (isProductionDB && !allowProduction) {
    console.error('❌ PRODUCTION ENVIRONMENT DETECTED');
    console.error(`Script: ${scriptName}`);
    console.error('This script is NOT safe for production execution');
    console.error('Database URL:', dbUrl);
    console.error('');
    console.error('If you need to run this script against production:');
    console.error('1. Set FORCE_PRODUCTION_SCRIPT=true environment variable');
    console.error('2. Ensure you have proper authorization');
    console.error('3. Review the script for safety');
    process.exit(1);
  }
  
  // Check for forced production execution
  if (isProductionDB && process.env.FORCE_PRODUCTION_SCRIPT !== 'true') {
    console.error('❌ Production script execution blocked');
    console.error('Set FORCE_PRODUCTION_SCRIPT=true to override (use with extreme caution)');
    process.exit(1);
  }
  
  // Production warning and confirmation
  if (isProductionDB && allowProduction) {
    console.warn('⚠️ WARNING: PRODUCTION DATABASE DETECTED');
    console.warn(`Script: ${scriptName}`);
    console.warn('You are about to execute a script against the production database');
    
    if (requireConfirmation) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('Type "I UNDERSTAND THE RISKS" to continue: ', (answer) => {
          rl.close();
          if (answer === 'I UNDERSTAND THE RISKS') {
            console.log('✅ Production execution confirmed');
            resolve();
          } else {
            console.error('❌ Production execution cancelled');
            process.exit(1);
          }
        });
      });
    }
  }
  
  console.log(`✅ Script safety validation passed for: ${scriptName}`);
  return Promise.resolve();
}

/**
 * Creates a safe execution wrapper for database scripts
 * @param {string} scriptName - Name of the script
 * @param {Function} scriptFunction - The main script function to execute
 * @param {Object} safetyOptions - Safety configuration
 */
async function safeExecute(scriptName, scriptFunction, safetyOptions = {}) {
  try {
    // Validate safety first
    await validateScriptSafety(scriptName, safetyOptions);
    
    // Log execution start
    console.log(`🚀 Starting execution: ${scriptName}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Execute the script
    const result = await scriptFunction();
    
    // Log completion
    console.log(`✅ Script completed successfully: ${scriptName}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Script execution failed: ${scriptName}`);
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Validates that we're running in the test environment
 */
function requireTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV;
  
  if (!dbUrl?.includes('localhost') || nodeEnv !== 'test') {
    throw new Error(
      '❌ This script requires test environment!\n' +
      'Ensure NODE_ENV=test and DATABASE_URL points to localhost'
    );
  }
  
  console.log('✅ Test environment validated');
}

/**
 * Logs script execution for audit trail
 */
function logScriptExecution(scriptName, action, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    script: scriptName,
    action,
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL?.includes('localhost') ? 'local' : 'production',
    details
  };
  
  console.log('📝 Script execution log:', JSON.stringify(logEntry, null, 2));
  
  // Optionally write to log file
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'script-executions.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

module.exports = {
  validateScriptSafety,
  safeExecute,
  requireTestEnvironment,
  logScriptExecution
};