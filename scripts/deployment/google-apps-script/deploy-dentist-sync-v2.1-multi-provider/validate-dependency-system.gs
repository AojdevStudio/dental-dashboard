/**
 * ===== DEPENDENCY SYSTEM VALIDATION =====
 * 
 * Quick validation script to ensure the function dependency testing system
 * integrates properly with the existing Google Apps Script project.
 * 
 * @version 1.0.0
 * @requires function-dependency-tests.gs, dependency-test-helpers.gs
 */

/**
 * Validate that the dependency testing system is properly integrated
 */
function validateDependencySystemIntegration() {
  const ui = SpreadsheetApp.getUi();
  let validationResults = [];
  let issues = [];
  let recommendations = [];
  
  try {
    // Test 1: Check core dependency test functions are available
    const coreFunctions = [
      'runAllDependencyTests',
      'testCriticalFunctionDependencies',
      'testProviderDetectionChain',
      'testCredentialResolutionChain',
      'testMenuFunctionAvailability',
      'testDatabaseFunctionIntegration'
    ];
    
    let coreAvailable = 0;
    coreFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          coreAvailable++;
        } else {
          issues.push(`Core function missing: ${funcName}`);
        }
      } catch (error) {
        issues.push(`Error checking core function ${funcName}: ${error.message}`);
      }
    });
    
    validationResults.push({
      test: 'Core Functions',
      status: coreAvailable === coreFunctions.length ? 'PASS' : 'FAIL',
      details: `${coreAvailable}/${coreFunctions.length} available`
    });
    
    // Test 2: Check advanced helper functions are available
    const helperFunctions = [
      'runAdvancedDependencyTests',
      'testWorkflowSequences',
      'testConfigurationValidation',
      'testPerformanceBenchmarks',
      'generateDependencyReport'
    ];
    
    let helpersAvailable = 0;
    helperFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          helpersAvailable++;
        } else {
          issues.push(`Helper function missing: ${funcName}`);
        }
      } catch (error) {
        issues.push(`Error checking helper function ${funcName}: ${error.message}`);
      }
    });
    
    validationResults.push({
      test: 'Helper Functions',
      status: helpersAvailable === helperFunctions.length ? 'PASS' : 'FAIL',
      details: `${helpersAvailable}/${helperFunctions.length} available`
    });
    
    // Test 3: Check configuration objects are accessible
    const configObjects = [
      'CRITICAL_FUNCTIONS',
      'MENU_FUNCTIONS',
      'PROVIDER_DETECTION_CHAIN',
      'DATABASE_INTEGRATION_CHAIN'
    ];
    
    let configsAvailable = 0;
    configObjects.forEach(configName => {
      try {
        const config = eval(configName);
        if (config !== undefined) {
          configsAvailable++;
        } else {
          issues.push(`Configuration object missing: ${configName}`);
        }
      } catch (error) {
        issues.push(`Error checking configuration ${configName}: ${error.message}`);
      }
    });
    
    validationResults.push({
      test: 'Configuration Objects',
      status: configsAvailable === configObjects.length ? 'PASS' : 'FAIL',
      details: `${configsAvailable}/${configObjects.length} available`
    });
    
    // Test 4: Check menu integration (verify menu functions exist)
    const menuTestFunctions = [
      'quickCriticalFunctionCheck',
      'quickProviderDetectionTest',
      'runPerformanceTimingTests',
      'initializeDependencyTesting'
    ];
    
    let menuFunctionsAvailable = 0;
    menuTestFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          menuFunctionsAvailable++;
        } else {
          issues.push(`Menu function missing: ${funcName}`);
        }
      } catch (error) {
        issues.push(`Error checking menu function ${funcName}: ${error.message}`);
      }
    });
    
    validationResults.push({
      test: 'Menu Integration',
      status: menuFunctionsAvailable === menuTestFunctions.length ? 'PASS' : 'FAIL',
      details: `${menuFunctionsAvailable}/${menuTestFunctions.length} available`
    });
    
    // Test 5: Quick functional test of core testing capability
    let functionalTestStatus = 'UNKNOWN';
    try {
      // Try to run a simple test
      const quickTest = testCriticalFunctionDependencies();
      if (quickTest && quickTest.name && quickTest.status) {
        functionalTestStatus = 'PASS';
      } else {
        functionalTestStatus = 'FAIL';
        issues.push('Core testing function returned invalid results');
      }
    } catch (error) {
      functionalTestStatus = 'FAIL';
      issues.push(`Functional test failed: ${error.message}`);
    }
    
    validationResults.push({
      test: 'Functional Test',
      status: functionalTestStatus,
      details: 'Basic dependency test execution'
    });
    
    // Calculate overall results
    const passedTests = validationResults.filter(r => r.status === 'PASS').length;
    const totalTests = validationResults.length;
    const overallStatus = passedTests === totalTests ? 'COMPLETE' : 
                         passedTests > 0 ? 'PARTIAL' : 'FAILED';
    
    // Generate recommendations
    if (overallStatus !== 'COMPLETE') {
      recommendations.push('Ensure both function-dependency-tests.gs and dependency-test-helpers.gs are loaded');
      recommendations.push('Check that menu.gs includes the dependency testing menu items');
      recommendations.push('Verify all required configuration objects are properly defined');
    }
    
    // Show validation results
    let message = '🔧 Dependency System Integration Validation\n\n';
    
    const statusEmoji = overallStatus === 'COMPLETE' ? '✅' : 
                       overallStatus === 'PARTIAL' ? '⚠️' : '❌';
    message += `${statusEmoji} Integration Status: ${overallStatus}\n\n`;
    
    message += `📊 Validation Results (${passedTests}/${totalTests} passed):\n`;
    validationResults.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      message += `${emoji} ${result.test}: ${result.details}\n`;
    });
    message += '\n';
    
    if (issues.length > 0) {
      message += `⚠️ Issues Found:\n`;
      issues.slice(0, 5).forEach(issue => {
        message += `• ${issue}\n`;
      });
      if (issues.length > 5) {
        message += `... and ${issues.length - 5} more issues\n`;
      }
      message += '\n';
    }
    
    if (recommendations.length > 0) {
      message += `💡 Recommendations:\n`;
      recommendations.forEach(rec => {
        message += `• ${rec}\n`;
      });
      message += '\n';
    }
    
    if (overallStatus === 'COMPLETE') {
      message += '🎉 Dependency testing system is ready to use!\n';
      message += 'Access tests via: Testing & Debug → Function Dependencies';
    } else {
      message += '🚧 Please resolve issues before using dependency tests.';
    }
    
    ui.alert('Dependency System Validation', message, ui.ButtonSet.OK);
    
    // Log detailed results
    console.log('=== DEPENDENCY SYSTEM VALIDATION ===');
    console.log('Status:', overallStatus);
    console.log('Results:', validationResults);
    console.log('Issues:', issues);
    console.log('Recommendations:', recommendations);
    
    // Log to sync sheet if available
    try {
      if (typeof logToDentistSheet_ === 'function') {
        logToDentistSheet_(
          'DependencySystemValidation',
          overallStatus === 'COMPLETE' ? 'SUCCESS' : 'WARNING',
          totalTests,
          totalTests - passedTests,
          null,
          `Dependency system validation: ${passedTests}/${totalTests} tests passed`
        );
      }
    } catch (error) {
      console.warn('Could not log to sync sheet:', error.message);
    }
    
  } catch (error) {
    ui.alert(
      'Validation Error',
      `Dependency system validation failed: ${error.message}`,
      ui.ButtonSet.OK
    );
    console.error('Dependency system validation error:', error);
  }
}

/**
 * Quick check to verify dependency testing is working
 */
function quickDependencySystemCheck() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Check if core functions exist
    const coreExists = typeof runAllDependencyTests === 'function';
    const helpersExist = typeof runAdvancedDependencyTests === 'function';
    
    if (coreExists && helpersExist) {
      ui.alert(
        '✅ Dependency System Ready',
        'Function dependency testing system is properly loaded.\n\n' +
        'Available features:\n' +
        '• Core dependency tests\n' +
        '• Advanced workflow testing\n' +
        '• Performance monitoring\n' +
        '• Comprehensive reporting\n\n' +
        'Access via: Testing & Debug → Function Dependencies',
        ui.ButtonSet.OK
      );
    } else {
      let message = '❌ Dependency System Issues\n\n';
      if (!coreExists) message += '• Core dependency tests not loaded\n';
      if (!helpersExist) message += '• Advanced helpers not loaded\n';
      message += '\nPlease run full validation for details.';
      
      ui.alert('Dependency System Check', message, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Check Error',
      `Dependency system check failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Initialize and validate the entire dependency testing system
 */
function setupDependencyTestingSystem() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Setup Dependency Testing System',
    'This will initialize and validate the function dependency testing system.\n\n' +
    'This includes:\n' +
    '• Validating all test functions are loaded\n' +
    '• Checking configuration objects\n' +
    '• Verifying menu integration\n' +
    '• Running a basic functional test\n\n' +
    'Continue with setup?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      // Run the comprehensive validation
      validateDependencySystemIntegration();
      
      // Initialize the system
      if (typeof initializeDependencyTesting === 'function') {
        initializeDependencyTesting();
      }
      
    } catch (error) {
      ui.alert(
        'Setup Error',
        `Failed to setup dependency testing system: ${error.message}`,
        ui.ButtonSet.OK
      );
    }
  }
}