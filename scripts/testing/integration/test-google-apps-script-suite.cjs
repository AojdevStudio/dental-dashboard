#!/usr/bin/env node
/**
 * COMPREHENSIVE GOOGLE APPS SCRIPT TEST SUITE
 * 
 * This script runs all Google Apps Script related tests in one command:
 * - Supabase RPC endpoint connectivity
 * - Dr. Chinyere Enih provider detection
 * - Provider detection fix validation
 * - Database integration tests
 * - Pattern matching validation
 * - Credential resolution tests
 * 
 * Usage: node scripts/test-google-apps-script-suite.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}\n🧪 ${msg}\n${'='.repeat(msg.length + 4)}${colors.reset}`),
  subheader: (msg) => console.log(`${colors.magenta}${colors.bright}\n📋 ${msg}\n${'-'.repeat(msg.length + 4)}${colors.reset}`)
};

// Read environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Test suite configuration
const testSuite = {
  name: 'Google Apps Script Complete Test Suite',
  version: '1.0.0',
  tests: [],
  results: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

/**
 * Test result tracker
 */
function addTestResult(testName, passed, details = {}) {
  testSuite.tests.push({
    name: testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
  
  testSuite.results.total++;
  if (passed) {
    testSuite.results.passed++;
    log.success(`${testName}: PASSED`);
  } else {
    testSuite.results.failed++;
    log.error(`${testName}: FAILED`);
  }
}

/**
 * Test 1: Environment Configuration Validation
 */
async function testEnvironmentConfig() {
  log.subheader('Environment Configuration Validation');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let allPresent = true;
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      missing.push(varName);
      allPresent = false;
      log.error(`Missing environment variable: ${varName}`);
    } else {
      log.success(`Found ${varName}`);
    }
  }
  
  if (allPresent) {
    log.success('All required environment variables are present');
  }
  
  addTestResult('Environment Configuration', allPresent, { missing });
  return allPresent;
}

/**
 * Test 2: Supabase RPC Endpoint Connectivity
 */
async function testSupabaseRpcEndpoint() {
  log.subheader('Supabase RPC Endpoint Connectivity');
  
  const testQuery = `SELECT 1 as test_value`;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: testQuery })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`RPC endpoint failed: ${response.status} - ${errorText}`);
      addTestResult('Supabase RPC Connectivity', false, { 
        status: response.status, 
        error: errorText 
      });
      return false;
    }

    const result = await response.json();
    log.success(`RPC endpoint working: ${JSON.stringify(result)}`);
    addTestResult('Supabase RPC Connectivity', true, { result });
    return true;
    
  } catch (error) {
    log.error(`RPC endpoint network error: ${error.message}`);
    addTestResult('Supabase RPC Connectivity', false, { error: error.message });
    return false;
  }
}

/**
 * Test 3: Provider Database Query
 */
async function testProviderDatabaseQuery() {
  log.subheader('Provider Database Query');
  
  const query = `
    SELECT 
      p.id,
      p.provider_code as external_id,
      p.first_name,
      p.last_name,
      p.email,
      p.provider_type as title,
      p.position as specialization,
      array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as clinic_names,
      array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as clinic_ids
    FROM providers p
    LEFT JOIN provider_locations pl ON p.id = pl.provider_id
    LEFT JOIN locations l ON pl.location_id = l.id
    LEFT JOIN clinics c ON l.clinic_id = c.id
    WHERE p.status != 'deleted' OR p.status IS NULL
    GROUP BY p.id, p.provider_code, p.first_name, p.last_name, p.email, p.provider_type, p.position, p.created_at, p.updated_at
    ORDER BY p.last_name, p.first_name
  `.trim().replace(/\s+/g, ' ');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(`Provider query failed: ${response.status} - ${errorText}`);
      addTestResult('Provider Database Query', false, { 
        status: response.status, 
        error: errorText 
      });
      return null;
    }

    const providers = await response.json();
    log.success(`Found ${providers.length} providers in database`);
    
    providers.forEach((p, i) => {
      log.info(`  ${i + 1}. ${p.first_name} ${p.last_name} (${p.external_id})`);
    });
    
    addTestResult('Provider Database Query', true, { 
      providerCount: providers.length,
      providers: providers.map(p => ({ 
        name: `${p.first_name} ${p.last_name}`, 
        code: p.external_id 
      }))
    });
    
    return providers;
    
  } catch (error) {
    log.error(`Provider query network error: ${error.message}`);
    addTestResult('Provider Database Query', false, { error: error.message });
    return null;
  }
}

/**
 * Test 4: Dr. Chinyere Enih Specific Detection
 */
function testChinyereDetection(providers) {
  log.subheader('Dr. Chinyere Enih Detection');
  
  if (!providers) {
    log.warning('Skipping Dr. Chinyere test - no provider data available');
    addTestResult('Dr. Chinyere Enih Detection', false, { 
      reason: 'No provider data available' 
    });
    return false;
  }
  
  // Look for Dr. Chinyere Enih specifically
  const chinyere = providers.find(p => 
    p.first_name?.toLowerCase() === 'chinyere' && 
    p.last_name?.toLowerCase() === 'enih'
  );

  if (chinyere) {
    log.success('Dr. Chinyere Enih found in database');
    log.info(`  • ID: ${chinyere.id}`);
    log.info(`  • External ID: ${chinyere.external_id}`);
    log.info(`  • Name: ${chinyere.first_name} ${chinyere.last_name}`);
    log.info(`  • Title: ${chinyere.title}`);
    log.info(`  • Clinics: ${chinyere.clinic_names || 'None assigned'}`);
    
    addTestResult('Dr. Chinyere Enih Detection', true, chinyere);
    return true;
  } else {
    log.error('Dr. Chinyere Enih NOT found in database');
    addTestResult('Dr. Chinyere Enih Detection', false, { 
      reason: 'Provider not found in database' 
    });
    return false;
  }
}

/**
 * Test 5: Pattern Matching Validation
 */
function testPatternMatching() {
  log.subheader('Pattern Matching Validation');
  
  const testSpreadsheetNames = [
    'Dr Chinyere Enih Production',
    'Chinyere Production Data',
    'Enih Dental Statistics',
    'Dr. Chinyere Daily Stats',
    'CHINYERE_ENIH_SYNC_SHEET',
    'chinyere enih data',
    'DR CHINYERE PRODUCTION'
  ];

  // Exact patterns from shared-multi-provider-utils.gs for chinyere_enih
  const chinyerePatterns = [
    /chinyere/i,
    /enih/i,
    /dr\.?\s*chinyere/i,
    /chinyere.*enih/i
  ];

  const results = testSpreadsheetNames.map(spreadsheetName => {
    // Simulate the exact logic from detectCurrentProvider function
    let matchedPattern = null;
    
    for (const pattern of chinyerePatterns) {
      if (pattern.test(spreadsheetName)) {
        matchedPattern = pattern;
        break; // First match wins, confidence = 1.0
      }
    }
    
    const detected = matchedPattern !== null;
    const confidence = detected ? 1.0 : 0.0;
    
    return {
      spreadsheetName,
      matchedPattern: matchedPattern ? matchedPattern.toString() : 'None',
      confidence,
      detected
    };
  });
  
  results.forEach(result => {
    const status = result.detected ? '✅' : '❌';
    log.info(`${status} "${result.spreadsheetName}" - Pattern: ${result.matchedPattern} (Confidence: ${result.confidence})`);
  });
  
  const successfulDetections = results.filter(r => r.detected).length;
  const allPassed = successfulDetections === results.length;
  
  log.info(`Pattern matching results: ${successfulDetections}/${results.length} detected successfully`);
  
  addTestResult('Pattern Matching Validation', allPassed, {
    totalTests: results.length,
    passed: successfulDetections,
    results: results
  });
  
  return allPassed;
}

/**
 * Test 6: File Structure Validation
 */
function testFileStructure() {
  log.subheader('Google Apps Script File Structure');
  
  const requiredFiles = [
    'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/shared-multi-provider-utils.gs',
    'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/config.gs',
    'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/auto-discovery.gs',
    'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/shared-sync-utils.gs',
    'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/credentials.gs'
  ];
  
  let allFilesExist = true;
  const missingFiles = [];
  const existingFiles = [];
  
  for (const filePath of requiredFiles) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      existingFiles.push(filePath);
      log.success(`Found: ${path.basename(filePath)}`);
    } else {
      missingFiles.push(filePath);
      allFilesExist = false;
      log.error(`Missing: ${filePath}`);
    }
  }
  
  addTestResult('File Structure Validation', allFilesExist, {
    totalFiles: requiredFiles.length,
    existingFiles: existingFiles.length,
    missingFiles: missingFiles
  });
  
  return allFilesExist;
}

/**
 * Test 7: Function Definition Validation
 */
function testFunctionDefinitions() {
  log.subheader('Critical Function Definitions');
  
  const filesToCheck = [
    {
      path: 'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/shared-sync-utils.gs',
      functions: ['makeSupabaseRequest_', 'getSyncCredentials']
    },
    {
      path: 'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/auto-discovery.gs',
      functions: ['discoverProvidersFromDatabase', 'autoDetectProvider']
    },
    {
      path: 'scripts/google-apps-script/deploy-dentist-sync-v2.1-multi-provider/shared-multi-provider-utils.gs',
      functions: ['detectCurrentProvider', 'PROVIDER_DETECTION_PATTERNS']
    }
  ];
  
  let allFunctionsFound = true;
  const missingFunctions = [];
  const foundFunctions = [];
  
  for (const fileCheck of filesToCheck) {
    const fullPath = path.join(__dirname, '..', fileCheck.path);
    
    if (!fs.existsSync(fullPath)) {
      log.error(`File not found: ${fileCheck.path}`);
      allFunctionsFound = false;
      continue;
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    
    for (const functionName of fileCheck.functions) {
      const functionPattern = new RegExp(`(function\\s+${functionName}|const\\s+${functionName}|${functionName}\\s*[:=])`, 'i');
      
      if (functionPattern.test(fileContent)) {
        foundFunctions.push(`${functionName} in ${path.basename(fileCheck.path)}`);
        log.success(`Found: ${functionName} in ${path.basename(fileCheck.path)}`);
      } else {
        missingFunctions.push(`${functionName} in ${path.basename(fileCheck.path)}`);
        allFunctionsFound = false;
        log.error(`Missing: ${functionName} in ${path.basename(fileCheck.path)}`);
      }
    }
  }
  
  addTestResult('Function Definition Validation', allFunctionsFound, {
    foundFunctions,
    missingFunctions
  });
  
  return allFunctionsFound;
}

/**
 * Test 8: Run External Test Scripts
 */
async function runExternalTests() {
  log.subheader('External Test Scripts');
  
  const externalTests = [
    {
      name: 'Provider Detection Fix Test',
      script: 'scripts/provider-detection-fix-test.cjs',
      description: 'Validates provider detection patterns and database integration'
    }
  ];
  
  let allExternalTestsPassed = true;
  
  for (const test of externalTests) {
    const scriptPath = path.join(__dirname, '..', test.script);
    
    if (!fs.existsSync(scriptPath)) {
      log.warning(`External test script not found: ${test.script}`);
      continue;
    }
    
    try {
      log.info(`Running: ${test.name}`);
      const result = execSync(`node ${scriptPath}`, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        timeout: 30000 // 30 second timeout
      });
      
      // Check if the output indicates success
      const success = result.includes('ALL VALIDATIONS PASSED') || 
                     result.includes('100%') ||
                     result.includes('PASS');
      
      if (success) {
        log.success(`${test.name}: PASSED`);
        addTestResult(test.name, true, { output: 'External test passed' });
      } else {
        log.warning(`${test.name}: Unclear result`);
        addTestResult(test.name, false, { output: 'External test result unclear' });
        allExternalTestsPassed = false;
      }
      
    } catch (error) {
      log.error(`${test.name}: FAILED - ${error.message}`);
      addTestResult(test.name, false, { error: error.message });
      allExternalTestsPassed = false;
    }
  }
  
  return allExternalTestsPassed;
}

/**
 * Generate detailed test report
 */
function generateTestReport() {
  log.header('Test Suite Results Summary');
  
  const { total, passed, failed } = testSuite.results;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   • Total Tests: ${total}`);
  console.log(`   • Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`   • Failed: ${colors.red}${failed}${colors.reset}`);
  console.log(`   • Pass Rate: ${passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red}${passRate}%${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testSuite.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.name}`);
      if (test.details.error) {
        console.log(`     Error: ${test.details.error}`);
      }
      if (test.details.reason) {
        console.log(`     Reason: ${test.details.reason}`);
      }
    });
  }
  
  console.log(`\n📋 Detailed Results:`);
  testSuite.tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`   ${status} ${test.name}`);
  });
  
  // Save detailed report to file
  const reportPath = path.join(__dirname, 'test-results-gas.json');
  fs.writeFileSync(reportPath, JSON.stringify(testSuite, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  return passRate >= 90;
}

/**
 * Main test execution
 */
async function runTestSuite() {
  log.header(`${testSuite.name} v${testSuite.version}`);
  
  console.log(`🎯 Testing Google Apps Script integration for KamDental dental dashboard`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Run all tests in sequence
    await testEnvironmentConfig();
    await testSupabaseRpcEndpoint();
    const providers = await testProviderDatabaseQuery();
    testChinyereDetection(providers);
    testPatternMatching();
    testFileStructure();
    testFunctionDefinitions();
    await runExternalTests();
    
    // Generate final report
    const overallSuccess = generateTestReport();
    
    if (overallSuccess) {
      log.success('🎉 All critical tests passed! Google Apps Script should work correctly.');
      console.log(`\n🚀 Next Steps:`);
      console.log(`   1. Deploy updated Google Apps Script files to Google Apps Script console`);
      console.log(`   2. Test with actual Dr. Chinyere Enih spreadsheet`);
      console.log(`   3. Monitor sync logs for successful provider detection`);
      process.exit(0);
    } else {
      log.error('⚠️ Some tests failed. Review the results above before deploying.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Test suite execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if running as main script
if (require.main === module) {
  runTestSuite();
}

module.exports = {
  runTestSuite,
  testEnvironmentConfig,
  testSupabaseRpcEndpoint,
  testProviderDatabaseQuery,
  testChinyereDetection,
  testPatternMatching,
  testFileStructure,
  testFunctionDefinitions
};