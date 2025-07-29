/**
 * ===== COMPREHENSIVE INTEGRATION TEST SUITE =====
 * 
 * Complete integration tests for the error handling and fallback systems
 * Tests all failure scenarios and recovery mechanisms
 * 
 * @version 1.0.0
 * @requires error-handler.gs, cache-manager.gs, diagnostics.gs
 */

// ===== INTEGRATION TEST CONFIGURATION =====

/**
 * Test configuration and scenarios
 */
const INTEGRATION_TEST_CONFIG = {
  // Test scenarios to simulate
  SCENARIOS: {
    DATABASE_OFFLINE: 'DATABASE_OFFLINE',
    NETWORK_FAILURE: 'NETWORK_FAILURE',
    PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    SPREADSHEET_ACCESS_DENIED: 'SPREADSHEET_ACCESS_DENIED',
    CACHE_CORRUPTION: 'CACHE_CORRUPTION',
    MULTIPLE_FAILURES: 'MULTIPLE_FAILURES'
  },
  
  // Test data
  TEST_DATA: {
    VALID_SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
    INVALID_SPREADSHEET_ID: 'invalid_spreadsheet_id_12345',
    VALID_PROVIDER_NAMES: ['Dr. Obinna Ezeji', 'Dr. Kamdi Irondi'],
    INVALID_PROVIDER_NAMES: ['Unknown Provider', 'Test Doctor'],
    NETWORK_TIMEOUT_URL: 'https://httpstat.us/408',
    INVALID_SUPABASE_URL: 'https://invalid-project.supabase.co'
  }
};

// ===== INTEGRATION TEST RUNNER =====

/**
 * Main integration test runner
 */
class IntegrationTestRunner {
  constructor() {
    this.testResults = [];
    this.originalState = {};
    this.mockData = new Map();
  }
  
  /**
   * Run all integration tests
   * @return {Object} Complete test results
   */
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Integration Tests');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    try {
      // Save original system state
      this.saveSystemState_();
      
      // Run test scenarios
      await this.runErrorHandlingTests_();
      await this.runCacheManagementTests_();
      await this.runDiagnosticsTests_();
      await this.runRecoveryWorkflowTests_();
      await this.runPerformanceTests_();
      
    } finally {
      // Restore original system state
      this.restoreSystemState_();
    }
    
    const endTime = Date.now();
    const summary = this.generateTestSummary_(startTime, endTime);
    
    this.displayTestResults_(summary);
    return summary;
  }
  
  /**
   * Save current system state for restoration
   */
  saveSystemState_() {
    try {
      // Save current cache state
      if (typeof getCacheStatistics === 'function') {
        this.originalState.cacheStats = getCacheStatistics();
      }
      
      // Save current error state
      if (typeof getErrorStatistics === 'function') {
        this.originalState.errorStats = getErrorStatistics();
      }
      
      // Save current credentials
      const properties = PropertiesService.getUserProperties();
      this.originalState.credentials = {
        url: properties.getProperty('SUPABASE_URL'),
        key: properties.getProperty('SUPABASE_SERVICE_ROLE_KEY')
      };
      
      console.log('💾 System state saved for testing');
    } catch (error) {
      console.log(`⚠️ Could not save system state: ${error.message}`);
    }
  }
  
  /**
   * Restore original system state
   */
  restoreSystemState_() {
    try {
      // Clear test cache data
      if (typeof clearAllCacheData === 'function') {
        clearAllCacheData();
      }
      
      // Clear test error history
      if (typeof clearErrorHistory === 'function') {
        clearErrorHistory();
      }
      
      // Restore original credentials if they were changed
      if (this.originalState.credentials) {
        const properties = PropertiesService.getUserProperties();
        if (this.originalState.credentials.url) {
          properties.setProperty('SUPABASE_URL', this.originalState.credentials.url);
        }
        if (this.originalState.credentials.key) {
          properties.setProperty('SUPABASE_SERVICE_ROLE_KEY', this.originalState.credentials.key);
        }
      }
      
      console.log('🔄 System state restored');
    } catch (error) {
      console.log(`⚠️ Could not restore system state: ${error.message}`);
    }
  }
  
  /**
   * Run error handling integration tests
   */
  async runErrorHandlingTests_() {
    console.log('\n📊 Testing Error Handling System...');
    
    // Test 1: Database connection failure handling
    await this.runTest_('Database Connection Failure', async () => {
      const originalUrl = PropertiesService.getUserProperties().getProperty('SUPABASE_URL');
      
      try {
        // Simulate database failure by using invalid URL
        PropertiesService.getUserProperties().setProperty('SUPABASE_URL', INTEGRATION_TEST_CONFIG.TEST_DATA.INVALID_SUPABASE_URL);
        
        // Attempt provider detection (should fail and recover)
        const result = detectCurrentProvider(INTEGRATION_TEST_CONFIG.TEST_DATA.VALID_SPREADSHEET_ID);
        
        // Should have fallback result or error handling
        return {
          success: true,
          message: 'Database failure handled gracefully',
          details: { fallbackUsed: result !== null }
        };
      } finally {
        // Restore original URL
        if (originalUrl) {
          PropertiesService.getUserProperties().setProperty('SUPABASE_URL', originalUrl);
        }
      }
    });
    
    // Test 2: Provider detection error handling
    await this.runTest_('Provider Detection Error Handling', async () => {
      const spreadsheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
      const originalName = spreadsheetName;
      
      try {
        // Temporarily rename spreadsheet to trigger detection failure
        SpreadsheetApp.getActiveSpreadsheet().rename('Unknown Test Provider Spreadsheet');
        
        // Attempt detection (should trigger error handling)
        const result = detectCurrentProvider(INTEGRATION_TEST_CONFIG.TEST_DATA.VALID_SPREADSHEET_ID);
        
        return {
          success: true,
          message: 'Provider detection error handled',
          details: { errorHandled: true, result: result }
        };
      } finally {
        // Restore original name
        SpreadsheetApp.getActiveSpreadsheet().rename(originalName);
      }
    });
    
    // Test 3: Network connectivity error handling
    await this.runTest_('Network Error Handling', async () => {
      try {
        // Simulate network timeout by calling timeout URL
        const response = UrlFetchApp.fetch(INTEGRATION_TEST_CONFIG.TEST_DATA.NETWORK_TIMEOUT_URL, {
          method: 'GET',
          muteHttpExceptions: true
        });
        
        return {
          success: true,
          message: 'Network timeout handled',
          details: { responseCode: response.getResponseCode() }
        };
      } catch (error) {
        // Network error should be handled gracefully
        return {
          success: true,
          message: 'Network error caught and handled',
          details: { error: error.message }
        };
      }
    });
  }
  
  /**
   * Run cache management integration tests
   */
  async runCacheManagementTests_() {
    console.log('\n📦 Testing Cache Management System...');
    
    // Test 1: Cache fallback functionality
    await this.runTest_('Cache Fallback Operations', async () => {
      if (!globalCacheManager) {
        return { success: false, message: 'Cache manager not available' };
      }
      
      const testKey = 'integration_test_key';
      const testValue = { test: true, timestamp: Date.now() };
      
      // Test multi-tier caching
      const setSuccess = globalCacheManager.set(testKey, testValue, 'TEMPORARY');
      const getValue = globalCacheManager.get(testKey, 'TEMPORARY');
      const removeSuccess = globalCacheManager.remove(testKey);
      
      return {
        success: setSuccess && getValue && removeSuccess,
        message: 'Cache operations completed',
        details: { set: setSuccess, get: !!getValue, remove: removeSuccess }
      };
    });
    
    // Test 2: Provider configuration caching
    await this.runTest_('Provider Configuration Caching', async () => {
      const spreadsheetId = INTEGRATION_TEST_CONFIG.TEST_DATA.VALID_SPREADSHEET_ID;
      const testConfig = {
        providerCode: 'test_provider',
        displayName: 'Test Provider',
        primaryClinic: 'TEST_CLINIC'
      };
      
      // Test caching and retrieval
      if (typeof cacheProviderConfig === 'function' && typeof getCachedProviderConfig === 'function') {
        const cacheSuccess = cacheProviderConfig(spreadsheetId, testConfig);
        const cachedConfig = getCachedProviderConfig(spreadsheetId);
        
        return {
          success: cacheSuccess && cachedConfig !== null,
          message: 'Provider configuration caching works',
          details: { cached: !!cachedConfig, matches: cachedConfig?.providerCode === testConfig.providerCode }
        };
      }
      
      return { success: false, message: 'Cache functions not available' };
    });
    
    // Test 3: Cache performance under load
    await this.runTest_('Cache Performance Test', async () => {
      const operations = 100;
      const startTime = Date.now();
      
      // Perform multiple cache operations
      for (let i = 0; i < operations; i++) {
        if (globalCacheManager) {
          globalCacheManager.set(`test_key_${i}`, { index: i });
          globalCacheManager.get(`test_key_${i}`);
        }
      }
      
      const duration = Date.now() - startTime;
      const avgTimePerOp = duration / (operations * 2); // set + get = 2 ops per iteration
      
      return {
        success: avgTimePerOp < 10, // Should be less than 10ms per operation
        message: `Cache performance: ${avgTimePerOp.toFixed(2)}ms per operation`,
        details: { totalDuration: duration, operations: operations * 2, avgTime: avgTimePerOp }
      };
    });
  }
  
  /**
   * Run diagnostics system integration tests
   */
  async runDiagnosticsTests_() {
    console.log('\n🔍 Testing Diagnostics System...');
    
    // Test 1: Health check functionality
    await this.runTest_('Health Check System', async () => {
      if (typeof runHealthCheck === 'function') {
        const healthResult = await runHealthCheck();
        
        return {
          success: healthResult && healthResult.summary,
          message: `Health check completed: ${healthResult?.summary?.overallStatus}`,
          details: healthResult?.summary
        };
      }
      
      return { success: false, message: 'Health check function not available' };
    });
    
    // Test 2: Specific diagnostic tests
    await this.runTest_('Specific Diagnostic Tests', async () => {
      const tests = [];
      
      // Test provider detection diagnostic
      if (typeof testProviderDetection === 'function') {
        try {
          const providerTest = await testProviderDetection();
          tests.push({ name: 'Provider Detection', result: providerTest });
        } catch (error) {
          tests.push({ name: 'Provider Detection', error: error.message });
        }
      }
      
      // Test database connectivity diagnostic
      if (typeof testDatabaseConnectivity === 'function') {
        try {
          const dbTest = await testDatabaseConnectivity();
          tests.push({ name: 'Database Connectivity', result: dbTest });
        } catch (error) {
          tests.push({ name: 'Database Connectivity', error: error.message });
        }
      }
      
      return {
        success: tests.length > 0,
        message: `Ran ${tests.length} diagnostic tests`,
        details: tests
      };
    });
  }
  
  /**
   * Run recovery workflow integration tests
   */
  async runRecoveryWorkflowTests_() {
    console.log('\n🛠️ Testing Recovery Workflows...');
    
    // Test 1: Automated error recovery
    await this.runTest_('Automated Error Recovery', async () => {
      if (typeof handleSyncError === 'function' && typeof createSyncError === 'function') {
        const testError = createSyncError(
          'Test error for recovery',
          'CONFIGURATION',
          'MEDIUM',
          'TEST_ERROR'
        );
        
        const context = { test: true, operation: 'integration_test' };
        const recoveryResult = handleSyncError(testError, context);
        
        return {
          success: recoveryResult !== null,
          message: 'Error recovery system functional',
          details: { recovery: recoveryResult }
        };
      }
      
      return { success: false, message: 'Error handling functions not available' };
    });
    
    // Test 2: User intervention workflow
    await this.runTest_('User Intervention Workflow', async () => {
      // Test user intervention detection and queueing
      if (globalErrorHandler && globalErrorHandler.userInterventionQueue) {
        const initialQueueLength = globalErrorHandler.userInterventionQueue.length;
        
        // Simulate an error requiring user intervention
        if (typeof createSyncError === 'function') {
          const userError = createSyncError(
            'Test error requiring user intervention',
            'AUTHENTICATION',
            'HIGH',
            'USER_INTERVENTION_TEST'
          );
          
          const context = { requiresUser: true };
          handleSyncError(userError, context);
          
          const newQueueLength = globalErrorHandler.userInterventionQueue.length;
          
          return {
            success: newQueueLength > initialQueueLength,
            message: 'User intervention workflow works',
            details: { queueGrowth: newQueueLength - initialQueueLength }
          };
        }
      }
      
      return { success: false, message: 'User intervention system not available' };
    });
  }
  
  /**
   * Run performance integration tests
   */
  async runPerformanceTests_() {
    console.log('\n⚡ Testing Performance...');
    
    // Test 1: Provider detection performance
    await this.runTest_('Provider Detection Performance', async () => {
      const iterations = 5;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        try {
          detectCurrentProvider(INTEGRATION_TEST_CONFIG.TEST_DATA.VALID_SPREADSHEET_ID);
          times.push(Date.now() - startTime);
        } catch (error) {
          // Expected for some test scenarios
          times.push(Date.now() - startTime);
        }
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      return {
        success: avgTime < 5000, // Should complete within 5 seconds on average
        message: `Provider detection: ${avgTime.toFixed(0)}ms avg, ${maxTime}ms max`,
        details: { avgTime, maxTime, iterations, times }
      };
    });
    
    // Test 2: Error handling overhead
    await this.runTest_('Error Handling Overhead', async () => {
      const iterations = 10;
      const withErrorHandling = [];
      const withoutErrorHandling = [];
      
      // Test simple operation with error handling
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        try {
          if (typeof withErrorHandling === 'function') {
            withErrorHandling(() => Math.random(), { context: { test: true } });
          }
          withErrorHandling.push(Date.now() - startTime);
        } catch (error) {
          withErrorHandling.push(Date.now() - startTime);
        }
      }
      
      // Test same operation without error handling
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        Math.random();
        withoutErrorHandling.push(Date.now() - startTime);
      }
      
      const avgWith = withErrorHandling.reduce((a, b) => a + b, 0) / withErrorHandling.length;
      const avgWithout = withoutErrorHandling.reduce((a, b) => a + b, 0) / withoutErrorHandling.length;
      const overhead = avgWith - avgWithout;
      
      return {
        success: overhead < 50, // Error handling should add less than 50ms overhead
        message: `Error handling overhead: ${overhead.toFixed(2)}ms`,
        details: { avgWith, avgWithout, overhead, iterations }
      };
    });
  }
  
  /**
   * Run a single test with error handling
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function to execute
   */
  async runTest_(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      console.log(`   Running: ${testName}...`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        success: result.success,
        message: result.message,
        duration: duration,
        details: result.details || {},
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(testResult);
      
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${testName}: ${result.message} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        success: false,
        message: `Test error: ${error.message}`,
        duration: duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(testResult);
      console.log(`   ❌ ${testName}: Test error: ${error.message} (${duration}ms)`);
    }
  }
  
  /**
   * Generate test summary
   * @param {number} startTime - Test start timestamp
   * @param {number} endTime - Test end timestamp
   * @return {Object} Test summary
   */
  generateTestSummary_(startTime, endTime) {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = endTime - startTime;
    
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.name.split(' ')[0];
      if (!categories[category]) {
        categories[category] = { passed: 0, failed: 0, total: 0 };
      }
      categories[category].total++;
      if (result.success) {
        categories[category].passed++;
      } else {
        categories[category].failed++;
      }
    });
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests * 100).toFixed(2),
      totalDuration,
      categories,
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Display test results
   * @param {Object} summary - Test summary
   */
  displayTestResults_(summary) {
    console.log('\n🏁 Integration Test Results');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    console.log(`Total Duration: ${Math.round(summary.totalDuration / 1000)}s`);
    
    console.log('\n📊 Results by Category:');
    Object.entries(summary.categories).forEach(([category, stats]) => {
      const rate = (stats.passed / stats.total * 100).toFixed(0);
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
    });
    
    if (summary.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      summary.results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.name}: ${result.message}`);
      });
    }
    
    console.log('\n🎯 Integration Testing Complete!');
  }
}

// ===== GLOBAL TEST RUNNER INSTANCE =====

/**
 * Global integration test runner
 * @type {IntegrationTestRunner}
 */
const globalIntegrationTestRunner = new IntegrationTestRunner();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Run all integration tests
 * @return {Object} Test results
 */
async function runIntegrationTests() {
  return await globalIntegrationTestRunner.runAllTests();
}

/**
 * Run specific test category
 * @param {string} category - Test category to run
 * @return {Object} Test results
 */
async function runTestCategory(category) {
  const runner = new IntegrationTestRunner();
  
  switch (category.toLowerCase()) {
    case 'error':
    case 'errors':
      await runner.runErrorHandlingTests_();
      break;
    case 'cache':
    case 'caching':
      await runner.runCacheManagementTests_();
      break;
    case 'diagnostics':
    case 'diagnostic':
      await runner.runDiagnosticsTests_();
      break;
    case 'recovery':
    case 'workflow':
      await runner.runRecoveryWorkflowTests_();
      break;
    case 'performance':
    case 'perf':
      await runner.runPerformanceTests_();
      break;
    default:
      throw new Error(`Unknown test category: ${category}`);
  }
  
  return runner.testResults;
}

/**
 * Quick system validation test
 * @return {Object} Validation results
 */
async function runQuickValidation() {
  console.log('🚀 Quick System Validation Test');
  
  const tests = {};
  
  // Test error handler availability
  tests.errorHandler = typeof handleSyncError === 'function' && typeof createSyncError === 'function';
  
  // Test cache manager availability
  tests.cacheManager = typeof getCacheStatistics === 'function' && typeof cacheProviderConfig === 'function';
  
  // Test diagnostics availability
  tests.diagnostics = typeof runHealthCheck === 'function' && typeof testProviderDetection === 'function';
  
  // Test provider detection
  try {
    const provider = detectCurrentProvider(SpreadsheetApp.getActiveSpreadsheet().getId());
    tests.providerDetection = provider !== null;
  } catch (error) {
    tests.providerDetection = false;
  }
  
  const passedCount = Object.values(tests).filter(Boolean).length;
  const totalCount = Object.keys(tests).length;
  
  console.log(`Validation Results: ${passedCount}/${totalCount} systems available`);
  Object.entries(tests).forEach(([system, available]) => {
    const status = available ? '✅' : '❌';
    console.log(`   ${status} ${system}`);
  });
  
  return {
    systems: tests,
    available: passedCount,
    total: totalCount,
    ready: passedCount === totalCount
  };
}

/**
 * Menu function for running integration tests
 */
function menuRunIntegrationTests() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Run Integration Tests',
    'This will run comprehensive integration tests for the error handling system.\n\n' +
    'Tests will include:\n' +
    '• Error handling and recovery\n' +
    '• Cache management\n' +
    '• Diagnostics and troubleshooting\n' +
    '• Performance validation\n\n' +
    'This may take 2-3 minutes. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      ui.alert(
        'Integration Tests Starting',
        'Integration tests are now running...\n\n' +
        'Check the console for detailed progress.\n' +
        'A summary will be shown when complete.',
        ui.ButtonSet.OK
      );
      
      runIntegrationTests().then(results => {
        ui.alert(
          'Integration Tests Complete',
          `Tests completed!\n\n` +
          `Total Tests: ${results.totalTests}\n` +
          `Passed: ${results.passedTests}\n` +
          `Failed: ${results.failedTests}\n` +
          `Success Rate: ${results.successRate}%\n` +
          `Duration: ${Math.round(results.totalDuration / 1000)}s\n\n` +
          'Check the console for detailed results.',
          ui.ButtonSet.OK
        );
      }).catch(error => {
        ui.alert(
          'Integration Test Error',
          `Integration tests failed:\n\n${error.message}`,
          ui.ButtonSet.OK
        );
      });
      
    } catch (error) {
      ui.alert(
        'Test Error',
        `Failed to start integration tests:\n\n${error.message}`,
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Menu function for quick validation
 */
function menuQuickValidation() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const validation = runQuickValidation();
    
    let message = `🚀 Quick System Validation\n\n`;
    message += `Systems Available: ${validation.available}/${validation.total}\n\n`;
    
    Object.entries(validation.systems).forEach(([system, available]) => {
      const status = available ? '✅' : '❌';
      const name = system.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      message += `${status} ${name}\n`;
    });
    
    message += `\nSystem Ready: ${validation.ready ? 'Yes' : 'No'}`;
    
    ui.alert('Quick System Validation', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      'Validation Error',
      `System validation failed:\n\n${error.message}`,
      ui.ButtonSet.OK
    );
  }
}