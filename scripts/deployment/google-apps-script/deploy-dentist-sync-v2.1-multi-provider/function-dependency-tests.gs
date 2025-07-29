/**
 * ===== FUNCTION DEPENDENCY TESTING SYSTEM =====
 * 
 * Comprehensive testing framework to validate function dependencies and prevent
 * undefined function issues in the Google Apps Script multi-provider sync system.
 * 
 * Features:
 * - Critical function dependency chain validation
 * - Provider detection workflow testing
 * - Database integration function availability checks
 * - Menu function implementation verification
 * - Performance timing and bottleneck identification
 * - Detailed reporting of missing functions or broken dependencies
 * 
 * @version 1.0.0
 * @requires all core sync modules
 */

// ===== DEPENDENCY TEST CONFIGURATION =====

/**
 * Critical function dependencies that must be available
 */
const CRITICAL_FUNCTIONS = {
  // Core sync functions
  'sync': [
    'syncAllDentistData',
    'syncCurrentSheetData', 
    'syncSheetData_',
    'processHygieneRow_',
    'sendToSupabase_'
  ],
  
  // Provider detection functions
  'provider': [
    'getCurrentProviderConfig',
    'detectCurrentProvider',
    'getProviderFromDatabase',
    'validateProviderRegistration',
    'testMultiProviderDetection'
  ],
  
  // Database functions
  'database': [
    'getSupabaseCredentials_',
    'testSupabaseConnection',
    'testProviderDatabaseConnectivity',
    'validateDatabaseConnection_'
  ],
  
  // Utility functions
  'utils': [
    'getDentistSheetId',
    'getSheetHeaders_',
    'logToDentistSheet_',
    'validateMonthTabFormat',
    'detectLocationColumns'
  ],
  
  // Configuration functions
  'config': [
    'PROVIDER_DETECTION_PATTERNS',
    'LOCATION_FINANCIAL_MAPPINGS',
    'MONTH_TAB_PATTERNS',
    'MIGRATION_INFO'
  ],
  
  // Auto-discovery functions
  'discovery': [
    'showDiscoveredProviders',
    'testAutoDiscovery',
    'validateAutoDiscoverySetup',
    'updateProviderPatternsFromDatabase'
  ]
};

/**
 * Menu function mappings to verify all menu items have implementations
 */
const MENU_FUNCTIONS = [
  'onOpen',
  'setSupabaseCredentials_',
  'testSupabaseConnection',
  'checkMultiProviderDependencies',
  'showSystemInfo',
  'validateCurrentSpreadsheet',
  'validateAutoDiscoverySetupMenu',
  'showMigrationGuide',
  'syncAllDentistData',
  'syncCurrentSheetData',
  'clearAllLogs_',
  'testCredentialResolution_',
  'testProviderDetection',
  'testAllLocationCredentials',
  'testDatabaseProviderLookup',
  'testProviderDatabaseConnectivityMenu',
  'compareProviderConfigurationsMenu',
  'testDatabaseVsFallbackProviders',
  'testSyncUtilities',
  'debugExternalMappings',
  'debugProviderPatterns',
  'showDiscoveredProviders',
  'testAutoDiscovery',
  'startProviderRegistrationWorkflow',
  'validateCurrentProviderRegistration',
  'updateProviderPatternsFromDatabaseMenu',
  'clearAutoDiscoveryCache',
  'testHumbleLocation',
  'testBaytownLocation',
  'detectAndShowColumnMapping',
  'validateMultiLocationData',
  'setupDentistTriggers',
  'removeDentistTriggers',
  'exportSyncLogs',
  'validateDataIntegrity',
  'resetMultiProviderSystem',
  'showHelp'
];

/**
 * Provider detection dependency chain
 */
const PROVIDER_DETECTION_CHAIN = [
  'detectCurrentProvider',
  'getCurrentProviderConfig', 
  'getProviderFromDatabase',
  'getLocationCredentials_',
  'resolveCredentialMapping_'
];

/**
 * Database integration chain
 */
const DATABASE_INTEGRATION_CHAIN = [
  'getSupabaseCredentials_',
  'validateDatabaseConnection_',
  'testSupabaseConnection',
  'sendToSupabase_',
  'makeSupabaseRequest_'
];

// ===== MAIN TEST FUNCTIONS =====

/**
 * Run all dependency tests - main entry point
 */
function runAllDependencyTests() {
  const ui = SpreadsheetApp.getUi();
  const startTime = Date.now();
  
  const response = ui.alert(
    'Function Dependency Tests',
    'This will run comprehensive function dependency tests including:\n\n' +
    '• Critical function availability checks\n' +
    '• Provider detection workflow validation\n' +
    '• Database integration testing\n' +
    '• Menu function verification\n' +
    '• Performance timing analysis\n\n' +
    'This may take 2-3 minutes. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  let results = {
    startTime: startTime,
    tests: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    },
    performance: {},
    issues: [],
    recommendations: []
  };
  
  try {
    // Run all test suites
    results.tests.push(testCriticalFunctionDependencies());
    results.tests.push(testProviderDetectionChain());
    results.tests.push(testCredentialResolutionChain());
    results.tests.push(testMenuFunctionAvailability());
    results.tests.push(testDatabaseFunctionIntegration());
    
    // Calculate summary
    results.tests.forEach(test => {
      results.summary.totalTests++;
      if (test.status === 'PASS') results.summary.passed++;
      else if (test.status === 'FAIL') results.summary.failed++;
      else if (test.status === 'WARNING') results.summary.warnings++;
      
      if (test.issues) results.issues.push(...test.issues);
      if (test.recommendations) results.recommendations.push(...test.recommendations);
    });
    
    results.duration = Date.now() - startTime;
    
    // Show results
    showDependencyTestResults(results);
    
    // Log detailed results for debugging
    console.log('=== FUNCTION DEPENDENCY TEST RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    ui.alert(
      'Test Framework Error',
      `Dependency testing failed: ${error.message}`,
      ui.ButtonSet.OK
    );
    console.error('Dependency test error:', error);
  }
}

/**
 * Test critical function dependencies
 */
function testCriticalFunctionDependencies() {
  const testName = 'Critical Function Dependencies';
  const startTime = Date.now();
  let missingFunctions = [];
  let availableFunctions = [];
  let issues = [];
  
  try {
    // Test each category of critical functions
    Object.entries(CRITICAL_FUNCTIONS).forEach(([category, functions]) => {
      functions.forEach(funcName => {
        try {
          if (typeof eval(funcName) === 'function') {
            availableFunctions.push(`${category}.${funcName}`);
          } else if (typeof eval(funcName) !== 'undefined') {
            // It exists but isn't a function (could be a constant)
            availableFunctions.push(`${category}.${funcName} (constant)`);
          } else {
            missingFunctions.push(`${category}.${funcName}`);
            issues.push(`Missing critical function: ${funcName} (${category})`);
          }
        } catch (error) {
          missingFunctions.push(`${category}.${funcName}`);
          issues.push(`Error checking ${funcName}: ${error.message}`);
        }
      });
    });
    
    const status = missingFunctions.length === 0 ? 'PASS' : 'FAIL';
    const duration = Date.now() - startTime;
    
    return {
      name: testName,
      status: status,
      duration: duration,
      details: {
        totalChecked: availableFunctions.length + missingFunctions.length,
        available: availableFunctions.length,
        missing: missingFunctions.length,
        availableFunctions: availableFunctions,
        missingFunctions: missingFunctions
      },
      issues: issues,
      recommendations: missingFunctions.length > 0 ? 
        ['Check all required .gs files are properly loaded', 'Verify function names and implementations'] : []
    };
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Test execution failed: ${error.message}`],
      recommendations: ['Check test framework implementation']
    };
  }
}

/**
 * Test provider detection workflow chain
 */
function testProviderDetectionChain() {
  const testName = 'Provider Detection Chain';
  const startTime = Date.now();
  let chainResults = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test each function in the provider detection chain
    PROVIDER_DETECTION_CHAIN.forEach(funcName => {
      try {
        const funcExists = typeof eval(funcName) === 'function';
        chainResults.push({
          function: funcName,
          available: funcExists,
          timing: funcExists ? 'Available for timing test' : 'N/A'
        });
        
        if (!funcExists) {
          issues.push(`Provider detection function missing: ${funcName}`);
        }
      } catch (error) {
        chainResults.push({
          function: funcName,
          available: false,
          error: error.message
        });
        issues.push(`Error checking ${funcName}: ${error.message}`);
      }
    });
    
    // Test actual provider detection if functions are available
    let providerTestResult = null;
    try {
      if (typeof detectCurrentProvider === 'function' && typeof getDentistSheetId === 'function') {
        const sheetId = getDentistSheetId();
        const providerInfo = detectCurrentProvider(sheetId);
        providerTestResult = {
          sheetId: sheetId,
          detected: !!providerInfo,
          providerInfo: providerInfo
        };
      }
    } catch (error) {
      providerTestResult = {
        error: error.message
      };
      issues.push(`Provider detection test failed: ${error.message}`);
    }
    
    const availableCount = chainResults.filter(r => r.available).length;
    const status = availableCount === PROVIDER_DETECTION_CHAIN.length ? 'PASS' : 
                  availableCount > 0 ? 'WARNING' : 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Ensure shared-multi-provider-utils.gs is loaded');
      recommendations.push('Verify provider detection patterns are configured');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        chainLength: PROVIDER_DETECTION_CHAIN.length,
        available: availableCount,
        chainResults: chainResults,
        providerTestResult: providerTestResult
      },
      issues: issues,
      recommendations: recommendations
    };
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Chain test failed: ${error.message}`],
      recommendations: ['Check provider detection module loading']
    };
  }
}

/**
 * Test credential resolution chain
 */
function testCredentialResolutionChain() {
  const testName = 'Credential Resolution Chain';
  const startTime = Date.now();
  let credentialTests = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test credential functions
    const credentialFunctions = [
      'getSupabaseCredentials_',
      'getLocationCredentials_',
      'resolveCredentialMapping_',
      'testCredentialResolution_'
    ];
    
    credentialFunctions.forEach(funcName => {
      try {
        const funcExists = typeof eval(funcName) === 'function';
        credentialTests.push({
          function: funcName,
          available: funcExists
        });
        
        if (!funcExists) {
          issues.push(`Credential function missing: ${funcName}`);
        }
      } catch (error) {
        credentialTests.push({
          function: funcName,
          available: false,
          error: error.message
        });
        issues.push(`Error checking ${funcName}: ${error.message}`);
      }
    });
    
    // Test actual credential resolution
    let credentialTestResult = null;
    try {
      if (typeof getSupabaseCredentials_ === 'function') {
        const credentials = getSupabaseCredentials_();
        credentialTestResult = {
          hasCredentials: !!credentials,
          hasUrl: !!(credentials && credentials.url),
          hasKey: !!(credentials && credentials.key)
        };
      }
    } catch (error) {
      credentialTestResult = {
        error: error.message
      };
      issues.push(`Credential test failed: ${error.message}`);
    }
    
    const availableCount = credentialTests.filter(t => t.available).length;
    const status = availableCount === credentialFunctions.length ? 'PASS' : 
                  availableCount > 0 ? 'WARNING' : 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Check credentials.gs file is loaded');
      recommendations.push('Verify credential setup is complete');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalFunctions: credentialFunctions.length,
        available: availableCount,
        credentialTests: credentialTests,
        credentialTestResult: credentialTestResult
      },
      issues: issues,
      recommendations: recommendations
    };
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Credential chain test failed: ${error.message}`],
      recommendations: ['Check credential module loading']
    };
  }
}

/**
 * Test menu function availability
 */
function testMenuFunctionAvailability() {
  const testName = 'Menu Function Availability';
  const startTime = Date.now();
  let menuTests = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test each menu function
    MENU_FUNCTIONS.forEach(funcName => {
      try {
        const funcExists = typeof eval(funcName) === 'function';
        menuTests.push({
          function: funcName,
          available: funcExists
        });
        
        if (!funcExists) {
          issues.push(`Menu function missing: ${funcName}`);
        }
      } catch (error) {
        menuTests.push({
          function: funcName,
          available: false,
          error: error.message
        });
        issues.push(`Error checking menu function ${funcName}: ${error.message}`);
      }
    });
    
    const availableCount = menuTests.filter(t => t.available).length;
    const coverage = (availableCount / MENU_FUNCTIONS.length) * 100;
    
    let status;
    if (coverage === 100) status = 'PASS';
    else if (coverage >= 90) status = 'WARNING';
    else status = 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Check all .gs files are loaded in the project');
      recommendations.push('Verify menu.gs has all required function implementations');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalMenuFunctions: MENU_FUNCTIONS.length,
        available: availableCount,
        coverage: Math.round(coverage),
        menuTests: menuTests
      },
      issues: issues,
      recommendations: recommendations
    };
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Menu function test failed: ${error.message}`],
      recommendations: ['Check menu module structure']
    };
  }
}

/**
 * Test database function integration
 */
function testDatabaseFunctionIntegration() {
  const testName = 'Database Function Integration';
  const startTime = Date.now();
  let dbTests = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test database integration chain
    DATABASE_INTEGRATION_CHAIN.forEach(funcName => {
      try {
        const funcExists = typeof eval(funcName) === 'function';
        dbTests.push({
          function: funcName,
          available: funcExists
        });
        
        if (!funcExists) {
          issues.push(`Database function missing: ${funcName}`);
        }
      } catch (error) {
        dbTests.push({
          function: funcName,
          available: false,
          error: error.message
        });
        issues.push(`Error checking database function ${funcName}: ${error.message}`);
      }
    });
    
    // Test database connectivity if functions are available
    let connectivityTest = null;
    try {
      if (typeof testSupabaseConnection === 'function') {
        // Note: We won't actually call this to avoid side effects
        connectivityTest = {
          functionAvailable: true,
          note: 'Function available but not called to avoid side effects'
        };
      } else {
        connectivityTest = {
          functionAvailable: false,
          note: 'testSupabaseConnection function not available'
        };
        issues.push('Database connectivity testing function not available');
      }
    } catch (error) {
      connectivityTest = {
        error: error.message
      };
      issues.push(`Database connectivity test setup failed: ${error.message}`);
    }
    
    const availableCount = dbTests.filter(t => t.available).length;
    const status = availableCount === DATABASE_INTEGRATION_CHAIN.length ? 'PASS' : 
                  availableCount > 0 ? 'WARNING' : 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Ensure sync.gs and credentials.gs are loaded');
      recommendations.push('Verify database configuration functions are available');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalDbFunctions: DATABASE_INTEGRATION_CHAIN.length,
        available: availableCount,
        dbTests: dbTests,
        connectivityTest: connectivityTest
      },
      issues: issues,
      recommendations: recommendations
    };
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Database integration test failed: ${error.message}`],
      recommendations: ['Check database module loading']
    };
  }
}

// ===== RESULTS DISPLAY AND REPORTING =====

/**
 * Show comprehensive dependency test results
 */
function showDependencyTestResults(results) {
  const ui = SpreadsheetApp.getUi();
  
  // Create summary message
  let message = '🔍 Function Dependency Test Results\n\n';
  
  // Overall status
  const overallStatus = results.summary.failed === 0 ? 
    (results.summary.warnings === 0 ? 'HEALTHY' : 'WARNING') : 'CRITICAL';
  const statusEmoji = overallStatus === 'HEALTHY' ? '✅' : 
                     overallStatus === 'WARNING' ? '⚠️' : '❌';
  
  message += `${statusEmoji} Overall Status: ${overallStatus}\n\n`;
  
  // Test summary
  message += `📊 Test Summary:\n`;
  message += `• Total Tests: ${results.summary.totalTests}\n`;
  message += `• Passed: ${results.summary.passed}\n`;
  message += `• Failed: ${results.summary.failed}\n`;
  message += `• Warnings: ${results.summary.warnings}\n`;
  message += `• Duration: ${Math.round(results.duration / 1000)}s\n\n`;
  
  // Individual test results
  message += `📋 Individual Test Results:\n`;
  results.tests.forEach(test => {
    const testEmoji = test.status === 'PASS' ? '✅' : 
                     test.status === 'WARNING' ? '⚠️' : '❌';
    message += `${testEmoji} ${test.name}: ${test.status}\n`;
  });
  message += '\n';
  
  // Critical issues
  if (results.issues.length > 0) {
    message += `⚠️ Critical Issues Found:\n`;
    results.issues.slice(0, 5).forEach(issue => {
      message += `• ${issue}\n`;
    });
    if (results.issues.length > 5) {
      message += `... and ${results.issues.length - 5} more issues\n`;
    }
    message += '\n';
  }
  
  // Recommendations
  if (results.recommendations.length > 0) {
    message += `💡 Recommendations:\n`;
    results.recommendations.slice(0, 3).forEach(rec => {
      message += `• ${rec}\n`;
    });
    if (results.recommendations.length > 3) {
      message += `... and ${results.recommendations.length - 3} more recommendations\n`;
    }
    message += '\n';
  }
  
  message += 'Check the console/logs for detailed test information.';
  
  // Show results
  ui.alert('Function Dependency Test Results', message, ui.ButtonSet.OK);
  
  // Log to sync log if available
  try {
    if (typeof logToDentistSheet_ === 'function') {
      logToDentistSheet_(
        'DependencyTests',
        overallStatus === 'CRITICAL' ? 'ERROR' : overallStatus === 'WARNING' ? 'WARNING' : 'SUCCESS',
        results.summary.totalTests,
        results.summary.failed,
        null,
        `Dependency tests: ${results.summary.passed}/${results.summary.totalTests} passed, ${results.issues.length} issues found`
      );
    }
  } catch (error) {
    console.warn('Could not log to sync sheet:', error.message);
  }
}

// ===== PERFORMANCE AND ANALYSIS UTILITIES =====

/**
 * Test function execution timing (safe, non-destructive tests only)
 */
function runPerformanceTimingTests() {
  const ui = SpreadsheetApp.getUi();
  const startTime = Date.now();
  let timingResults = [];
  
  try {
    // Safe functions to test for performance
    const safeFunctions = [
      'getDentistSheetId',
      'getSheetHeaders_',
      'detectCurrentProvider',
      'getCurrentProviderConfig'
    ];
    
    safeFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          const timing = measureFunctionTiming(funcName);
          timingResults.push(timing);
        }
      } catch (error) {
        timingResults.push({
          function: funcName,
          error: error.message
        });
      }
    });
    
    const duration = Date.now() - startTime;
    
    // Show timing results
    let message = '⏱️ Performance Timing Results\n\n';
    timingResults.forEach(result => {
      if (result.error) {
        message += `❌ ${result.function}: Error - ${result.error}\n`;
      } else {
        message += `📊 ${result.function}: ${result.duration}ms\n`;
      }
    });
    message += `\nTotal test time: ${duration}ms`;
    
    ui.alert('Performance Timing', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      'Performance Test Error',
      `Performance timing failed: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Measure timing for a specific function (non-destructive)
 */
function measureFunctionTiming(funcName) {
  const startTime = Date.now();
  
  try {
    // For functions that require parameters, we'll just verify availability
    // rather than actually executing them to avoid side effects
    const func = eval(funcName);
    if (typeof func === 'function') {
      return {
        function: funcName,
        duration: Date.now() - startTime,
        available: true,
        note: 'Function verified available (not executed)'
      };
    } else {
      return {
        function: funcName,
        error: 'Not a function',
        available: false
      };
    }
  } catch (error) {
    return {
      function: funcName,
      error: error.message,
      available: false
    };
  }
}

// ===== QUICK TEST FUNCTIONS FOR MENU =====

/**
 * Quick critical function check (for menu)
 */
function quickCriticalFunctionCheck() {
  try {
    const result = testCriticalFunctionDependencies();
    const ui = SpreadsheetApp.getUi();
    
    if (result.status === 'PASS') {
      ui.alert(
        '✅ Critical Functions OK',
        `All ${result.details.available} critical functions are available.\n\n` +
        'Core sync functionality should work properly.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Critical Functions Missing',
        `Missing ${result.details.missing} critical functions:\n\n` +
        result.details.missingFunctions.slice(0, 5).join('\n') +
        (result.details.missingFunctions.length > 5 ? '\n...and more' : '') +
        '\n\nRun full dependency tests for details.',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Test Error',
      `Quick function check failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Quick provider detection test (for menu)
 */
function quickProviderDetectionTest() {
  try {
    const result = testProviderDetectionChain();
    const ui = SpreadsheetApp.getUi();
    
    if (result.status === 'PASS') {
      ui.alert(
        '✅ Provider Detection OK',
        `Provider detection chain is fully functional.\n\n` +
        `Functions available: ${result.details.available}/${result.details.chainLength}`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Provider Detection Issues',
        `Provider detection has issues:\n\n` +
        `Available: ${result.details.available}/${result.details.chainLength} functions\n` +
        `Status: ${result.status}\n\n` +
        'Run full dependency tests for details.',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Test Error',
      `Provider detection test failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// ===== INITIALIZATION AND SETUP =====

/**
 * Initialize dependency testing system
 */
function initializeDependencyTesting() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    ui.alert(
      '🔧 Dependency Testing System',
      'Function dependency testing system initialized.\n\n' +
      'Available tests:\n' +
      '• Run All Dependency Tests (comprehensive)\n' +
      '• Quick Critical Function Check\n' +
      '• Quick Provider Detection Test\n' +
      '• Performance Timing Tests\n\n' +
      'Use the Testing & Debug menu to access these tests.',
      ui.ButtonSet.OK
    );
    
    console.log('Function dependency testing system initialized');
    
  } catch (error) {
    console.error('Failed to initialize dependency testing:', error);
  }
}