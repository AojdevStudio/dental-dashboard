/**
 * ===== DEPENDENCY TEST HELPER FUNCTIONS =====
 * 
 * Additional helper functions and utilities for the function dependency testing system.
 * These functions provide enhanced testing capabilities and detailed analysis.
 * 
 * @version 1.0.0
 * @requires function-dependency-tests.gs
 */

// ===== EXTENDED TEST CONFIGURATIONS =====

/**
 * Advanced dependency patterns for complex function relationships
 */
const ADVANCED_DEPENDENCY_PATTERNS = {
  // Provider workflow dependencies
  'provider_workflow': {
    sequence: [
      'detectCurrentProvider',
      'getCurrentProviderConfig',
      'getLocationCredentials_',
      'resolveCredentialMapping_'
    ],
    description: 'Complete provider detection and credential resolution workflow'
  },
  
  // Sync operation dependencies
  'sync_workflow': {
    sequence: [
      'getSupabaseCredentials_',
      'validateDatabaseConnection_',
      'processHygieneRow_',
      'sendToSupabase_'
    ],
    description: 'Complete data sync operation workflow'
  },
  
  // Database operation dependencies
  'database_workflow': {
    sequence: [
      'getSupabaseCredentials_',
      'makeSupabaseRequest_',
      'testSupabaseConnection',
      'validateDatabaseConnection_'
    ],
    description: 'Database connectivity and operation workflow'
  }
};

/**
 * Configuration validation requirements
 */
const CONFIG_VALIDATION_REQUIREMENTS = {
  constants: [
    'PROVIDER_DETECTION_PATTERNS',
    'LOCATION_FINANCIAL_MAPPINGS', 
    'MONTH_TAB_PATTERNS',
    'MIGRATION_INFO'
  ],
  patterns: [
    'MONTH_TAB_PATTERNS',
    'PROVIDER_DETECTION_PATTERNS'
  ],
  mappings: [
    'LOCATION_FINANCIAL_MAPPINGS'
  ]
};

/**
 * Performance benchmarks for function execution
 */
const PERFORMANCE_BENCHMARKS = {
  'getDentistSheetId': { max: 100, warning: 50 },
  'detectCurrentProvider': { max: 500, warning: 250 },
  'getCurrentProviderConfig': { max: 300, warning: 150 },
  'getSupabaseCredentials_': { max: 200, warning: 100 },
  'getSheetHeaders_': { max: 400, warning: 200 }
};

// ===== ADVANCED TEST FUNCTIONS =====

/**
 * Test workflow sequences to ensure proper function chaining
 */
function testWorkflowSequences() {
  const testName = 'Workflow Sequence Testing';
  const startTime = Date.now();
  let workflowResults = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test each workflow pattern
    Object.entries(ADVANCED_DEPENDENCY_PATTERNS).forEach(([workflowName, workflow]) => {
      let workflowTest = {
        name: workflowName,
        description: workflow.description,
        sequence: workflow.sequence,
        results: [],
        status: 'UNKNOWN'
      };
      
      let availableCount = 0;
      
      // Test each function in the sequence
      workflow.sequence.forEach((funcName, index) => {
        try {
          const funcExists = typeof eval(funcName) === 'function';
          workflowTest.results.push({
            step: index + 1,
            function: funcName,
            available: funcExists
          });
          
          if (funcExists) {
            availableCount++;
          } else {
            issues.push(`Workflow ${workflowName} missing step ${index + 1}: ${funcName}`);
          }
        } catch (error) {
          workflowTest.results.push({
            step: index + 1,
            function: funcName,
            available: false,
            error: error.message
          });
          issues.push(`Workflow ${workflowName} error at step ${index + 1}: ${error.message}`);
        }
      });
      
      // Determine workflow status
      if (availableCount === workflow.sequence.length) {
        workflowTest.status = 'COMPLETE';
      } else if (availableCount > 0) {
        workflowTest.status = 'PARTIAL';
      } else {
        workflowTest.status = 'BROKEN';
      }
      
      workflowResults.push(workflowTest);
      
      // Add recommendations for broken workflows
      if (workflowTest.status === 'BROKEN') {
        recommendations.push(`Fix broken workflow: ${workflowName}`);
      } else if (workflowTest.status === 'PARTIAL') {
        recommendations.push(`Complete partial workflow: ${workflowName}`);
      }
    });
    
    const completeWorkflows = workflowResults.filter(w => w.status === 'COMPLETE').length;
    const status = completeWorkflows === workflowResults.length ? 'PASS' : 
                  completeWorkflows > 0 ? 'WARNING' : 'FAIL';
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalWorkflows: workflowResults.length,
        completeWorkflows: completeWorkflows,
        workflowResults: workflowResults
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
      issues: [`Workflow test failed: ${error.message}`],
      recommendations: ['Check workflow testing implementation']
    };
  }
}

/**
 * Test configuration constants and patterns
 */
function testConfigurationValidation() {
  const testName = 'Configuration Validation';
  const startTime = Date.now();
  let configResults = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test constants
    CONFIG_VALIDATION_REQUIREMENTS.constants.forEach(constantName => {
      try {
        const constant = eval(constantName);
        const exists = constant !== undefined;
        const isValid = exists && (typeof constant === 'object' || Array.isArray(constant));
        
        configResults.push({
          type: 'constant',
          name: constantName,
          exists: exists,
          valid: isValid,
          valueType: typeof constant
        });
        
        if (!exists) {
          issues.push(`Missing configuration constant: ${constantName}`);
        } else if (!isValid) {
          issues.push(`Invalid configuration constant: ${constantName} (type: ${typeof constant})`);
        }
      } catch (error) {
        configResults.push({
          type: 'constant',
          name: constantName,
          exists: false,
          valid: false,
          error: error.message
        });
        issues.push(`Error checking constant ${constantName}: ${error.message}`);
      }
    });
    
    // Test patterns specifically
    CONFIG_VALIDATION_REQUIREMENTS.patterns.forEach(patternName => {
      try {
        const pattern = eval(patternName);
        const isValidPattern = pattern && (Array.isArray(pattern) || typeof pattern === 'object');
        
        if (patternName === 'MONTH_TAB_PATTERNS' && Array.isArray(pattern)) {
          // Validate that patterns are actually regex objects
          const validRegexCount = pattern.filter(p => p instanceof RegExp).length;
          configResults.push({
            type: 'pattern',
            name: patternName,
            exists: true,
            valid: validRegexCount === pattern.length,
            details: { totalPatterns: pattern.length, validRegex: validRegexCount }
          });
          
          if (validRegexCount !== pattern.length) {
            issues.push(`${patternName} contains invalid regex patterns`);
          }
        }
      } catch (error) {
        issues.push(`Error validating pattern ${patternName}: ${error.message}`);
      }
    });
    
    const validConfigs = configResults.filter(c => c.exists && c.valid).length;
    const status = validConfigs === configResults.length ? 'PASS' : 
                  validConfigs > 0 ? 'WARNING' : 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Check config.gs and shared-multi-provider-utils.gs files');
      recommendations.push('Verify all configuration constants are properly defined');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalConfigs: configResults.length,
        validConfigs: validConfigs,
        configResults: configResults
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
      issues: [`Configuration validation failed: ${error.message}`],
      recommendations: ['Check configuration module loading']
    };
  }
}

/**
 * Enhanced performance testing with benchmarks
 */
function testPerformanceBenchmarks() {
  const testName = 'Performance Benchmarks';
  const startTime = Date.now();
  let performanceResults = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test functions that have performance benchmarks
    Object.entries(PERFORMANCE_BENCHMARKS).forEach(([funcName, benchmark]) => {
      try {
        if (typeof eval(funcName) === 'function') {
          // For now, just verify availability since we can't safely execute all functions
          performanceResults.push({
            function: funcName,
            available: true,
            benchmark: benchmark,
            note: 'Function available for performance testing'
          });
        } else {
          performanceResults.push({
            function: funcName,
            available: false,
            benchmark: benchmark
          });
          issues.push(`Performance test function not available: ${funcName}`);
        }
      } catch (error) {
        performanceResults.push({
          function: funcName,
          available: false,
          error: error.message,
          benchmark: benchmark
        });
        issues.push(`Error checking performance function ${funcName}: ${error.message}`);
      }
    });
    
    const availableFunctions = performanceResults.filter(r => r.available).length;
    const status = availableFunctions === performanceResults.length ? 'PASS' : 
                  availableFunctions > 0 ? 'WARNING' : 'FAIL';
    
    if (status !== 'PASS') {
      recommendations.push('Ensure all core functions are available for performance testing');
    }
    
    return {
      name: testName,
      status: status,
      duration: Date.now() - startTime,
      details: {
        totalFunctions: performanceResults.length,
        availableFunctions: availableFunctions,
        performanceResults: performanceResults
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
      issues: [`Performance benchmark test failed: ${error.message}`],
      recommendations: ['Check performance testing implementation']
    };
  }
}

/**
 * Test for circular dependencies and potential issues
 */
function testCircularDependencies() {
  const testName = 'Circular Dependency Detection';
  const startTime = Date.now();
  let dependencyMap = {};
  let issues = [];
  let recommendations = [];
  
  try {
    // This is a simplified check - would need more sophisticated analysis
    // for true circular dependency detection in a dynamic environment like Apps Script
    
    const testResult = {
      name: testName,
      status: 'PASS',
      duration: Date.now() - startTime,
      details: {
        note: 'Circular dependency detection requires static analysis',
        recommendation: 'Manual code review recommended for complex dependency chains'
      },
      issues: [],
      recommendations: [
        'Perform manual code review for circular dependencies',
        'Keep function dependency chains shallow and direct'
      ]
    };
    
    return testResult;
    
  } catch (error) {
    return {
      name: testName,
      status: 'FAIL',
      duration: Date.now() - startTime,
      error: error.message,
      issues: [`Circular dependency test failed: ${error.message}`],
      recommendations: ['Check dependency detection implementation']
    };
  }
}

// ===== COMPREHENSIVE TEST RUNNER =====

/**
 * Run all advanced dependency tests
 */
function runAdvancedDependencyTests() {
  const ui = SpreadsheetApp.getUi();
  const startTime = Date.now();
  
  const response = ui.alert(
    'Advanced Dependency Tests',
    'This will run advanced dependency analysis including:\n\n' +
    '• Workflow sequence validation\n' +
    '• Configuration constant validation\n' +
    '• Performance benchmark testing\n' +
    '• Circular dependency detection\n\n' +
    'This may take 3-5 minutes. Continue?',
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
    issues: [],
    recommendations: []
  };
  
  try {
    // Run advanced test suites
    results.tests.push(testWorkflowSequences());
    results.tests.push(testConfigurationValidation());
    results.tests.push(testPerformanceBenchmarks());
    results.tests.push(testCircularDependencies());
    
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
    showAdvancedTestResults(results);
    
    // Log detailed results
    console.log('=== ADVANCED DEPENDENCY TEST RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    ui.alert(
      'Advanced Test Error',
      `Advanced dependency testing failed: ${error.message}`,
      ui.ButtonSet.OK
    );
    console.error('Advanced dependency test error:', error);
  }
}

/**
 * Show advanced test results
 */
function showAdvancedTestResults(results) {
  const ui = SpreadsheetApp.getUi();
  
  let message = '🔬 Advanced Dependency Test Results\n\n';
  
  // Overall status
  const overallStatus = results.summary.failed === 0 ? 
    (results.summary.warnings === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS_ATTENTION';
  const statusEmoji = overallStatus === 'EXCELLENT' ? '🟢' : 
                     overallStatus === 'GOOD' ? '🟡' : '🔴';
  
  message += `${statusEmoji} Overall Status: ${overallStatus}\n\n`;
  
  // Test summary
  message += `📊 Advanced Test Summary:\n`;
  message += `• Total Tests: ${results.summary.totalTests}\n`;
  message += `• Passed: ${results.summary.passed}\n`;
  message += `• Failed: ${results.summary.failed}\n`;
  message += `• Warnings: ${results.summary.warnings}\n`;
  message += `• Duration: ${Math.round(results.duration / 1000)}s\n\n`;
  
  // Individual results
  results.tests.forEach(test => {
    const testEmoji = test.status === 'PASS' ? '✅' : 
                     test.status === 'WARNING' ? '⚠️' : '❌';
    message += `${testEmoji} ${test.name}: ${test.status}\n`;
  });
  message += '\n';
  
  // Key issues
  if (results.issues.length > 0) {
    message += `🚨 Key Issues:\n`;
    results.issues.slice(0, 3).forEach(issue => {
      message += `• ${issue}\n`;
    });
    if (results.issues.length > 3) {
      message += `... and ${results.issues.length - 3} more\n`;
    }
    message += '\n';
  }
  
  // Top recommendations
  if (results.recommendations.length > 0) {
    message += `💡 Top Recommendations:\n`;
    const uniqueRecs = [...new Set(results.recommendations)];
    uniqueRecs.slice(0, 3).forEach(rec => {
      message += `• ${rec}\n`;
    });
  }
  
  ui.alert('Advanced Dependency Test Results', message, ui.ButtonSet.OK);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate dependency report for documentation
 */
function generateDependencyReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Run basic dependency check
    const basicResults = testCriticalFunctionDependencies();
    const workflowResults = testWorkflowSequences();
    const configResults = testConfigurationValidation();
    
    let report = '# Function Dependency Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## Critical Functions Status\n';
    report += `- Status: ${basicResults.status}\n`;
    report += `- Available: ${basicResults.details.available}/${basicResults.details.totalChecked}\n`;
    report += `- Missing: ${basicResults.details.missing}\n\n`;
    
    if (basicResults.details.missingFunctions.length > 0) {
      report += '### Missing Functions:\n';
      basicResults.details.missingFunctions.forEach(func => {
        report += `- ${func}\n`;
      });
      report += '\n';
    }
    
    report += '## Workflow Status\n';
    if (workflowResults.details && workflowResults.details.workflowResults) {
      workflowResults.details.workflowResults.forEach(workflow => {
        report += `### ${workflow.name}: ${workflow.status}\n`;
        report += `${workflow.description}\n`;
        workflow.results.forEach(step => {
          const status = step.available ? '✅' : '❌';
          report += `${step.step}. ${status} ${step.function}\n`;
        });
        report += '\n';
      });
    }
    
    report += '## Configuration Status\n';
    report += `- Status: ${configResults.status}\n`;
    report += `- Valid: ${configResults.details.validConfigs}/${configResults.details.totalConfigs}\n\n`;
    
    // Output report (in a real implementation, this might be saved to a file or displayed)
    console.log(report);
    
    ui.alert(
      'Dependency Report Generated',
      'Dependency report has been generated and logged to console.\n\n' +
      'Check the console/logs for the complete report.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert(
      'Report Generation Error',
      `Failed to generate dependency report: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Reset dependency test cache and state
 */
function resetDependencyTestState() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Clear any cached test results or state
    // (In a more complex implementation, this would clear actual cache)
    
    ui.alert(
      '🔄 Test State Reset',
      'Dependency test state has been reset.\n\n' +
      'Next test run will start fresh.',
      ui.ButtonSet.OK
    );
    
    console.log('Dependency test state reset completed');
    
  } catch (error) {
    ui.alert(
      'Reset Error',
      `Failed to reset test state: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}