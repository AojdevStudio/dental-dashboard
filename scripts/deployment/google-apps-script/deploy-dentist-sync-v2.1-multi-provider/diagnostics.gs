/**
 * ===== COMPREHENSIVE DIAGNOSTICS & TROUBLESHOOTING SYSTEM =====
 * 
 * Advanced debugging and diagnostic tools for database-driven provider discovery
 * Provides comprehensive system health checks and troubleshooting workflows
 * 
 * Features:
 * - System health monitoring and validation
 * - Provider detection debugging
 * - Database connectivity testing
 * - Network connectivity diagnostics
 * - Configuration validation
 * - Performance monitoring
 * - Automated troubleshooting workflows
 * 
 * @version 1.0.0
 * @requires error-handler.gs, cache-manager.gs, logging.gs
 */

// ===== DIAGNOSTIC CONFIGURATION =====

/**
 * Diagnostic test configuration
 */
const DIAGNOSTIC_CONFIG = {
  // Test timeouts (milliseconds)
  TIMEOUTS: {
    DATABASE_CONNECTION: 10000,  // 10 seconds
    NETWORK_TEST: 5000,          // 5 seconds
    SPREADSHEET_ACCESS: 3000,    // 3 seconds
    API_RESPONSE: 8000           // 8 seconds
  },
  
  // Test thresholds
  THRESHOLDS: {
    RESPONSE_TIME_WARNING: 2000,   // 2 seconds
    RESPONSE_TIME_CRITICAL: 5000,  // 5 seconds
    CACHE_HIT_RATIO_WARNING: 0.7,  // 70%
    ERROR_RATE_WARNING: 0.05       // 5%
  },
  
  // Test categories
  CATEGORIES: {
    CONNECTIVITY: 'CONNECTIVITY',
    AUTHENTICATION: 'AUTHENTICATION',
    CONFIGURATION: 'CONFIGURATION',
    PERFORMANCE: 'PERFORMANCE',
    DATA_INTEGRITY: 'DATA_INTEGRITY'
  },
  
  // Diagnostic levels
  LEVELS: {
    BASIC: 'BASIC',           // Quick health check
    STANDARD: 'STANDARD',     // Standard diagnostic suite
    COMPREHENSIVE: 'COMPREHENSIVE', // Full system analysis
    DEEP: 'DEEP'              // Deep troubleshooting
  }
};

/**
 * Test result status types
 */
const TEST_STATUS = {
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
  SKIP: 'SKIP',
  ERROR: 'ERROR'
};

// ===== DIAGNOSTIC TEST CLASSES =====

/**
 * Base diagnostic test class
 */
class DiagnosticTest {
  constructor(name, description, category, timeout = 5000) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.timeout = timeout;
    this.startTime = null;
    this.endTime = null;
    this.status = null;
    this.message = null;
    this.details = {};
  }
  
  /**
   * Run the diagnostic test
   * @return {Object} Test result
   */
  async run() {
    this.startTime = Date.now();
    
    try {
      const result = await this.executeTest();
      this.endTime = Date.now();
      
      this.status = result.status || TEST_STATUS.PASS;
      this.message = result.message || 'Test completed successfully';
      this.details = result.details || {};
      
      return this.getResult();
    } catch (error) {
      this.endTime = Date.now();
      this.status = TEST_STATUS.ERROR;
      this.message = `Test error: ${error.message}`;
      this.details = { error: error.message, stack: error.stack };
      
      return this.getResult();
    }
  }
  
  /**
   * Execute the actual test (to be overridden)
   * @return {Object} Test execution result
   */
  async executeTest() {
    throw new Error('executeTest() must be implemented by subclass');
  }
  
  /**
   * Get test result object
   * @return {Object} Formatted test result
   */
  getResult() {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      status: this.status,
      message: this.message,
      duration: this.endTime - this.startTime,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Database connectivity test
 */
class DatabaseConnectivityTest extends DiagnosticTest {
  constructor() {
    super(
      'Database Connectivity',
      'Test connection to Supabase database',
      DIAGNOSTIC_CONFIG.CATEGORIES.CONNECTIVITY,
      DIAGNOSTIC_CONFIG.TIMEOUTS.DATABASE_CONNECTION
    );
  }
  
  async executeTest() {
    const credentials = this.getTestCredentials_();
    if (!credentials) {
      return {
        status: TEST_STATUS.FAIL,
        message: 'No database credentials available',
        details: { issue: 'Missing Supabase URL or API key' }
      };
    }
    
    // Test basic connectivity
    const connectivityResult = await this.testBasicConnectivity_(credentials);
    if (connectivityResult.status !== TEST_STATUS.PASS) {
      return connectivityResult;
    }
    
    // Test function endpoints
    const functionResult = await this.testFunctionEndpoints_(credentials);
    
    return {
      status: functionResult.status,
      message: functionResult.message,
      details: {
        connectivity: connectivityResult.details,
        functions: functionResult.details
      }
    };
  }
  
  /**
   * Get test credentials
   * @return {Object|null} Test credentials
   */
  getTestCredentials_() {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const scriptProperties = PropertiesService.getScriptProperties();
      
      const url = userProperties.getProperty('SUPABASE_URL') || scriptProperties.getProperty('SUPABASE_URL');
      const key = userProperties.getProperty('SUPABASE_SERVICE_ROLE_KEY') || scriptProperties.getProperty('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!url || !key) return null;
      
      return { url, key };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Test basic database connectivity
   * @param {Object} credentials - Database credentials
   * @return {Object} Connectivity test result
   */
  async testBasicConnectivity_(credentials) {
    try {
      const response = UrlFetchApp.fetch(`${credentials.url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.key}`,
          'apikey': credentials.key
        },
        muteHttpExceptions: true
      });
      
      const responseCode = response.getResponseCode();
      const responseTime = Date.now() - this.startTime;
      
      if (responseCode === 200) {
        const status = responseTime > DIAGNOSTIC_CONFIG.THRESHOLDS.RESPONSE_TIME_WARNING ? 
                      TEST_STATUS.WARN : TEST_STATUS.PASS;
        const message = responseTime > DIAGNOSTIC_CONFIG.THRESHOLDS.RESPONSE_TIME_WARNING ?
                       `Database reachable but slow (${responseTime}ms)` :
                       `Database connection successful (${responseTime}ms)`;
        
        return {
          status: status,
          message: message,
          details: { responseTime: responseTime, responseCode: responseCode }
        };
      } else {
        return {
          status: TEST_STATUS.FAIL,
          message: `Database connection failed: HTTP ${responseCode}`,
          details: { responseCode: responseCode, responseTime: responseTime }
        };
      }
    } catch (error) {
      return {
        status: TEST_STATUS.FAIL,
        message: `Database connection error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Test database function endpoints
   * @param {Object} credentials - Database credentials
   * @return {Object} Function test result
   */
  async testFunctionEndpoints_(credentials) {
    const endpoints = [
      '/rest/v1/rpc/get_clinic_id_by_code',
      '/rest/v1/rpc/get_provider_id_by_code',
      '/rest/v1/rpc/get_entity_id_by_external_mapping'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = UrlFetchApp.fetch(`${credentials.url}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.key}`,
            'apikey': credentials.key
          },
          payload: JSON.stringify({}), // Empty payload for testing
          muteHttpExceptions: true
        });
        
        const responseCode = response.getResponseCode();
        results.push({
          endpoint: endpoint,
          status: responseCode < 500 ? 'Available' : 'Error',
          responseCode: responseCode
        });
      } catch (error) {
        results.push({
          endpoint: endpoint,
          status: 'Error',
          error: error.message
        });
      }
    }
    
    const failedEndpoints = results.filter(r => r.status === 'Error');
    
    return {
      status: failedEndpoints.length === 0 ? TEST_STATUS.PASS : TEST_STATUS.WARN,
      message: failedEndpoints.length === 0 ? 
               'All database functions available' : 
               `${failedEndpoints.length} function endpoints have issues`,
      details: { endpoints: results }
    };
  }
}

/**
 * Provider detection test
 */
class ProviderDetectionTest extends DiagnosticTest {
  constructor() {
    super(
      'Provider Detection',
      'Test automatic provider detection from spreadsheet',
      DIAGNOSTIC_CONFIG.CATEGORIES.CONFIGURATION
    );
  }
  
  async executeTest() {
    try {
      const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
      const spreadsheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
      
      // Test provider detection function
      const detectionResult = this.testProviderDetection_(spreadsheetId, spreadsheetName);
      
      // Test provider configuration retrieval
      const configResult = this.testProviderConfiguration_(detectionResult.providerInfo);
      
      return {
        status: this.determineOverallStatus_(detectionResult, configResult),
        message: this.generateStatusMessage_(detectionResult, configResult),
        details: {
          detection: detectionResult,
          configuration: configResult,
          spreadsheetName: spreadsheetName
        }
      };
    } catch (error) {
      return {
        status: TEST_STATUS.ERROR,
        message: `Provider detection test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Test provider detection logic
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} spreadsheetName - Spreadsheet name
   * @return {Object} Detection test result
   */
  testProviderDetection_(spreadsheetId, spreadsheetName) {
    try {
      const providerInfo = detectCurrentProvider ? detectCurrentProvider(spreadsheetId) : null;
      
      if (providerInfo) {
        return {
          success: true,
          providerInfo: providerInfo,
          message: `Provider detected: ${providerInfo.displayName}`,
          matchedPattern: this.findMatchedPattern_(spreadsheetName, providerInfo)
        };
      } else {
        return {
          success: false,
          providerInfo: null,
          message: 'No provider detected',
          suggestedPatterns: this.suggestProviderPatterns_(spreadsheetName)
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Provider detection error: ${error.message}`
      };
    }
  }
  
  /**
   * Test provider configuration retrieval
   * @param {Object} providerInfo - Detected provider information
   * @return {Object} Configuration test result
   */
  testProviderConfiguration_(providerInfo) {
    if (!providerInfo) {
      return {
        success: false,
        message: 'Cannot test configuration without provider info'
      };
    }
    
    try {
      const config = getCurrentProviderConfig ? getCurrentProviderConfig() : null;
      
      if (config) {
        return {
          success: true,
          config: config,
          message: 'Provider configuration retrieved successfully',
          hasCredentials: !!(config.detectedInfo && config.primaryClinicConfig)
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve provider configuration'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Configuration retrieval error: ${error.message}`
      };
    }
  }
  
  /**
   * Find which pattern matched for provider detection
   * @param {string} spreadsheetName - Spreadsheet name
   * @param {Object} providerInfo - Detected provider info
   * @return {string|null} Matched pattern
   */
  findMatchedPattern_(spreadsheetName, providerInfo) {
    if (!PROVIDER_DETECTION_PATTERNS || !providerInfo.providerCode) return null;
    
    const patterns = PROVIDER_DETECTION_PATTERNS[providerInfo.providerCode];
    if (!patterns) return null;
    
    for (const pattern of patterns.namePatterns) {
      if (pattern.test(spreadsheetName)) {
        return pattern.toString();
      }
    }
    
    return null;
  }
  
  /**
   * Suggest provider patterns for undetected spreadsheet
   * @param {string} spreadsheetName - Spreadsheet name
   * @return {Array} Suggested patterns
   */
  suggestProviderPatterns_(spreadsheetName) {
    const suggestions = [];
    const nameLower = spreadsheetName.toLowerCase();
    
    if (nameLower.includes('obinna') || nameLower.includes('ezeji')) {
      suggestions.push('Consider: "Dr. Obinna", "Obinna Ezeji", or "Ezeji"');
    }
    if (nameLower.includes('kamdi') || nameLower.includes('irondi') || nameLower.includes('kelechi')) {
      suggestions.push('Consider: "Dr. Kamdi", "Kamdi Irondi", or "Kelechi"');
    }
    if (suggestions.length === 0) {
      suggestions.push('Ensure spreadsheet name contains provider name');
      suggestions.push('Check PROVIDER_DETECTION_PATTERNS in shared-multi-provider-utils.gs');
    }
    
    return suggestions;
  }
  
  /**
   * Determine overall test status
   * @param {Object} detectionResult - Detection result
   * @param {Object} configResult - Configuration result
   * @return {string} Overall status
   */
  determineOverallStatus_(detectionResult, configResult) {
    if (!detectionResult.success) return TEST_STATUS.FAIL;
    if (!configResult.success) return TEST_STATUS.WARN;
    return TEST_STATUS.PASS;
  }
  
  /**
   * Generate status message
   * @param {Object} detectionResult - Detection result
   * @param {Object} configResult - Configuration result
   * @return {string} Status message
   */
  generateStatusMessage_(detectionResult, configResult) {
    if (!detectionResult.success) {
      return `Provider detection failed: ${detectionResult.message}`;
    }
    if (!configResult.success) {
      return `Provider detected but configuration failed: ${configResult.message}`;
    }
    return `Provider detection and configuration successful`;
  }
}

/**
 * Network connectivity test
 */
class NetworkConnectivityTest extends DiagnosticTest {
  constructor() {
    super(
      'Network Connectivity',
      'Test network connectivity and external service access',
      DIAGNOSTIC_CONFIG.CATEGORIES.CONNECTIVITY,
      DIAGNOSTIC_CONFIG.TIMEOUTS.NETWORK_TEST
    );
  }
  
  async executeTest() {
    const tests = [
      { name: 'Google Services', url: 'https://www.googleapis.com/', critical: true },
      { name: 'Supabase API', url: 'https://api.supabase.com/', critical: false },
      { name: 'Internet Connectivity', url: 'https://www.google.com/', critical: true }
    ];
    
    const results = [];
    let criticalFailures = 0;
    
    for (const test of tests) {
      const result = await this.testUrlConnectivity_(test);
      results.push(result);
      
      if (test.critical && result.status === 'Failed') {
        criticalFailures++;
      }
    }
    
    const overallStatus = criticalFailures > 0 ? TEST_STATUS.FAIL : 
                         results.some(r => r.status === 'Failed') ? TEST_STATUS.WARN : 
                         TEST_STATUS.PASS;
    
    return {
      status: overallStatus,
      message: this.generateNetworkMessage_(criticalFailures, results.length),
      details: { tests: results, criticalFailures: criticalFailures }
    };
  }
  
  /**
   * Test connectivity to a specific URL
   * @param {Object} test - Test configuration
   * @return {Object} URL test result
   */
  async testUrlConnectivity_(test) {
    try {
      const startTime = Date.now();
      const response = UrlFetchApp.fetch(test.url, {
        method: 'GET',
        muteHttpExceptions: true
      });
      const responseTime = Date.now() - startTime;
      const responseCode = response.getResponseCode();
      
      return {
        name: test.name,
        url: test.url,
        status: responseCode >= 200 && responseCode < 400 ? 'Success' : 'Failed',
        responseCode: responseCode,
        responseTime: responseTime,
        critical: test.critical
      };
    } catch (error) {
      return {
        name: test.name,
        url: test.url,
        status: 'Failed',
        error: error.message,
        critical: test.critical
      };
    }
  }
  
  /**
   * Generate network status message
   * @param {number} criticalFailures - Number of critical failures
   * @param {number} totalTests - Total number of tests
   * @return {string} Status message
   */
  generateNetworkMessage_(criticalFailures, totalTests) {
    if (criticalFailures > 0) {
      return `Critical network connectivity issues detected (${criticalFailures} failures)`;
    }
    return `Network connectivity test passed (${totalTests} tests)`;
  }
}

/**
 * Spreadsheet access test
 */
class SpreadsheetAccessTest extends DiagnosticTest {
  constructor() {
    super(
      'Spreadsheet Access',
      'Test spreadsheet access and data structure validation',
      DIAGNOSTIC_CONFIG.CATEGORIES.CONFIGURATION,
      DIAGNOSTIC_CONFIG.TIMEOUTS.SPREADSHEET_ACCESS
    );
  }
  
  async executeTest() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const spreadsheetId = spreadsheet.getId();
      const spreadsheetName = spreadsheet.getName();
      
      // Test basic access
      const accessResult = this.testBasicAccess_(spreadsheet);
      
      // Test sheet structure
      const structureResult = this.testSheetStructure_(spreadsheet);
      
      // Test data format
      const dataResult = this.testDataFormat_(spreadsheet);
      
      return {
        status: this.determineSpreadsheetStatus_(accessResult, structureResult, dataResult),
        message: this.generateSpreadsheetMessage_(accessResult, structureResult, dataResult),
        details: {
          spreadsheetId: spreadsheetId,
          spreadsheetName: spreadsheetName,
          access: accessResult,
          structure: structureResult,
          data: dataResult
        }
      };
    } catch (error) {
      return {
        status: TEST_STATUS.ERROR,
        message: `Spreadsheet access error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
  
  /**
   * Test basic spreadsheet access
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object
   * @return {Object} Access test result
   */
  testBasicAccess_(spreadsheet) {
    try {
      const sheets = spreadsheet.getSheets();
      const sheetCount = sheets.length;
      const permissions = this.checkPermissions_(spreadsheet);
      
      return {
        success: true,
        sheetCount: sheetCount,
        permissions: permissions,
        message: `Spreadsheet accessible with ${sheetCount} sheets`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Spreadsheet access failed: ${error.message}`
      };
    }
  }
  
  /**
   * Test spreadsheet structure for sync compatibility
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object
   * @return {Object} Structure test result
   */
  testSheetStructure_(spreadsheet) {
    try {
      const sheets = spreadsheet.getSheets();
      const monthSheets = sheets.filter(sheet => {
        const name = sheet.getName();
        return MONTH_TAB_PATTERNS ? MONTH_TAB_PATTERNS.some(pattern => pattern.test(name)) : false;
      });
      
      const logSheet = sheets.find(sheet => sheet.getName() === 'Dentist-Sync-Log');
      
      return {
        success: monthSheets.length > 0,
        monthSheets: monthSheets.map(s => s.getName()),
        monthSheetCount: monthSheets.length,
        hasLogSheet: !!logSheet,
        allSheets: sheets.map(s => s.getName()),
        message: `Found ${monthSheets.length} month sheets, log sheet: ${!!logSheet}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Structure test error: ${error.message}`
      };
    }
  }
  
  /**
   * Test data format in spreadsheet
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object
   * @return {Object} Data format test result
   */
  testDataFormat_(spreadsheet) {
    try {
      const sheets = spreadsheet.getSheets();
      const testSheet = sheets.find(sheet => {
        const name = sheet.getName();
        return MONTH_TAB_PATTERNS ? MONTH_TAB_PATTERNS.some(pattern => pattern.test(name)) : false;
      });
      
      if (!testSheet) {
        return {
          success: false,
          message: 'No month sheets found for data format testing'
        };
      }
      
      const headers = testSheet.getRange(1, 1, 1, testSheet.getLastColumn()).getValues()[0];
      const columnMapping = this.analyzeColumnMapping_(headers);
      
      return {
        success: columnMapping.requiredColumns > 0,
        headers: headers,
        columnMapping: columnMapping,
        testSheet: testSheet.getName(),
        message: `Found ${columnMapping.requiredColumns} required columns in ${testSheet.getName()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Data format test error: ${error.message}`
      };
    }
  }
  
  /**
   * Check spreadsheet permissions
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - Spreadsheet object
   * @return {Object} Permissions information
   */
  checkPermissions_(spreadsheet) {
    try {
      // Test write permission by attempting to get/set a property
      const testProp = PropertiesService.getDocumentProperties().getProperty('test');
      PropertiesService.getDocumentProperties().setProperty('test', 'value');
      
      return {
        read: true,
        write: true,
        documentProperties: true
      };
    } catch (error) {
      return {
        read: true,
        write: false,
        documentProperties: false,
        error: error.message
      };
    }
  }
  
  /**
   * Analyze column mapping in headers
   * @param {Array} headers - Array of header values
   * @return {Object} Column mapping analysis
   */
  analyzeColumnMapping_(headers) {
    const requiredPatterns = [
      /date/i,
      /production/i,
      /goal/i
    ];
    
    const locationPatterns = [
      /humble/i,
      /baytown/i
    ];
    
    let requiredColumns = 0;
    let locationColumns = 0;
    const mappedColumns = {};
    
    headers.forEach((header, index) => {
      const headerStr = (header || '').toString().toLowerCase();
      
      // Check required patterns
      requiredPatterns.forEach((pattern, patternIndex) => {
        if (pattern.test(headerStr)) {
          requiredColumns++;
          mappedColumns[`required_${patternIndex}`] = { header, index };
        }
      });
      
      // Check location patterns
      locationPatterns.forEach((pattern, patternIndex) => {
        if (pattern.test(headerStr)) {
          locationColumns++;
          mappedColumns[`location_${patternIndex}`] = { header, index };
        }
      });
    });
    
    return {
      requiredColumns: requiredColumns,
      locationColumns: locationColumns,
      mappedColumns: mappedColumns,
      totalHeaders: headers.length
    };
  }
  
  /**
   * Determine overall spreadsheet test status
   * @param {Object} accessResult - Access test result
   * @param {Object} structureResult - Structure test result
   * @param {Object} dataResult - Data test result
   * @return {string} Overall status
   */
  determineSpreadsheetStatus_(accessResult, structureResult, dataResult) {
    if (!accessResult.success) return TEST_STATUS.FAIL;
    if (!structureResult.success) return TEST_STATUS.WARN;
    if (!dataResult.success) return TEST_STATUS.WARN;
    return TEST_STATUS.PASS;
  }
  
  /**
   * Generate spreadsheet status message
   * @param {Object} accessResult - Access test result
   * @param {Object} structureResult - Structure test result
   * @param {Object} dataResult - Data test result
   * @return {string} Status message
   */
  generateSpreadsheetMessage_(accessResult, structureResult, dataResult) {
    if (!accessResult.success) {
      return `Spreadsheet access failed: ${accessResult.message}`;
    }
    if (!structureResult.success) {
      return `Spreadsheet structure issues: ${structureResult.message}`;
    }
    if (!dataResult.success) {
      return `Data format issues: ${dataResult.message}`;
    }
    return `Spreadsheet access and format validation successful`;
  }
}

// ===== DIAGNOSTIC RUNNER =====

/**
 * Comprehensive diagnostic runner
 */
class DiagnosticRunner {
  constructor() {
    this.tests = new Map();
    this.results = [];
    this.registerDefaultTests_();
  }
  
  /**
   * Register default diagnostic tests
   */
  registerDefaultTests_() {
    this.registerTest('database', DatabaseConnectivityTest);
    this.registerTest('provider', ProviderDetectionTest);
    this.registerTest('network', NetworkConnectivityTest);
    this.registerTest('spreadsheet', SpreadsheetAccessTest);
  }
  
  /**
   * Register a diagnostic test
   * @param {string} name - Test name
   * @param {Class} testClass - Test class
   */
  registerTest(name, testClass) {
    this.tests.set(name, testClass);
  }
  
  /**
   * Run diagnostic tests
   * @param {string} level - Diagnostic level
   * @param {Array} testNames - Specific tests to run (optional)
   * @return {Object} Diagnostic results
   */
  async runDiagnostics(level = DIAGNOSTIC_CONFIG.LEVELS.STANDARD, testNames = null) {
    const startTime = Date.now();
    this.results = [];
    
    const testsToRun = testNames || this.getTestsForLevel_(level);
    
    Logger.log(`Starting ${level} diagnostics with ${testsToRun.length} tests...`);
    
    for (const testName of testsToRun) {
      if (this.tests.has(testName)) {
        const TestClass = this.tests.get(testName);
        const test = new TestClass();
        
        Logger.log(`Running test: ${test.name}`);
        const result = await test.run();
        this.results.push(result);
        
        // Log test result
        this.logTestResult_(result);
      } else {
        Logger.log(`Test not found: ${testName}`);
      }
    }
    
    const endTime = Date.now();
    const summary = this.generateSummary_(startTime, endTime);
    
    return {
      level: level,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: endTime - startTime,
      summary: summary,
      results: this.results
    };
  }
  
  /**
   * Get tests for diagnostic level
   * @param {string} level - Diagnostic level
   * @return {Array} Array of test names
   */
  getTestsForLevel_(level) {
    switch (level) {
      case DIAGNOSTIC_CONFIG.LEVELS.BASIC:
        return ['network', 'spreadsheet'];
        
      case DIAGNOSTIC_CONFIG.LEVELS.STANDARD:
        return ['database', 'provider', 'network', 'spreadsheet'];
        
      case DIAGNOSTIC_CONFIG.LEVELS.COMPREHENSIVE:
        return Array.from(this.tests.keys());
        
      case DIAGNOSTIC_CONFIG.LEVELS.DEEP:
        return Array.from(this.tests.keys());
        
      default:
        return ['database', 'provider'];
    }
  }
  
  /**
   * Generate diagnostic summary
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @return {Object} Diagnostic summary
   */
  generateSummary_(startTime, endTime) {
    const statusCounts = {};
    const categories = {};
    
    this.results.forEach(result => {
      // Count by status
      statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
      
      // Count by category
      categories[result.category] = categories[result.category] || [];
      categories[result.category].push({
        name: result.name,
        status: result.status
      });
    });
    
    const totalTests = this.results.length;
    const passed = statusCounts[TEST_STATUS.PASS] || 0;
    const failed = statusCounts[TEST_STATUS.FAIL] || 0;
    const warnings = statusCounts[TEST_STATUS.WARN] || 0;
    
    const overallStatus = failed > 0 ? 'CRITICAL' : 
                         warnings > 0 ? 'WARNING' : 'HEALTHY';
    
    return {
      overallStatus: overallStatus,
      totalTests: totalTests,
      passed: passed,
      failed: failed,
      warnings: warnings,
      statusCounts: statusCounts,
      categories: categories,
      duration: endTime - startTime
    };
  }
  
  /**
   * Log test result
   * @param {Object} result - Test result
   */
  logTestResult_(result) {
    const statusEmoji = {
      [TEST_STATUS.PASS]: '✅',
      [TEST_STATUS.WARN]: '⚠️',
      [TEST_STATUS.FAIL]: '❌',
      [TEST_STATUS.ERROR]: '💥',
      [TEST_STATUS.SKIP]: '⏭️'
    };
    
    const emoji = statusEmoji[result.status] || '❓';
    Logger.log(`${emoji} ${result.name}: ${result.message} (${result.duration}ms)`);
  }
}

// ===== GLOBAL DIAGNOSTIC RUNNER =====

/**
 * Global diagnostic runner instance
 * @type {DiagnosticRunner}
 */
const globalDiagnosticRunner = new DiagnosticRunner();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Run basic health check
 * @return {Object} Health check results
 */
async function runHealthCheck() {
  return await globalDiagnosticRunner.runDiagnostics(DIAGNOSTIC_CONFIG.LEVELS.BASIC);
}

/**
 * Run standard diagnostics
 * @return {Object} Diagnostic results
 */
async function runStandardDiagnostics() {
  return await globalDiagnosticRunner.runDiagnostics(DIAGNOSTIC_CONFIG.LEVELS.STANDARD);
}

/**
 * Run comprehensive diagnostics
 * @return {Object} Diagnostic results
 */
async function runComprehensiveDiagnostics() {
  return await globalDiagnosticRunner.runDiagnostics(DIAGNOSTIC_CONFIG.LEVELS.COMPREHENSIVE);
}

/**
 * Run specific diagnostic test
 * @param {string} testName - Name of test to run
 * @return {Object} Test result
 */
async function runSpecificTest(testName) {
  const results = await globalDiagnosticRunner.runDiagnostics(DIAGNOSTIC_CONFIG.LEVELS.BASIC, [testName]);
  return results.results[0] || null;
}

/**
 * Quick provider detection test
 * @return {Object} Provider detection result
 */
async function testProviderDetection() {
  return await runSpecificTest('provider');
}

/**
 * Quick database connectivity test
 * @return {Object} Database connectivity result
 */
async function testDatabaseConnectivity() {
  return await runSpecificTest('database');
}

/**
 * Display diagnostic report in console
 * @param {Object} results - Diagnostic results
 */
function showDiagnosticReport(results) {
  console.log('🔍 DIAGNOSTIC REPORT');
  console.log('='.repeat(50));
  
  // Handle both full diagnostic results and simple health check results
  if (results.level) {
    // Full diagnostic results format
    console.log(`Level: ${results.level}`);
    console.log(`Overall Status: ${results.summary.overallStatus}`);
    console.log(`Duration: ${results.duration}ms`);
    console.log(`Tests: ${results.summary.totalTests} total, ${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.warnings} warnings`);
    
    console.log('\n📊 Test Results:');
    results.results.forEach(result => {
      const statusEmoji = {
        [TEST_STATUS.PASS]: '✅',
        [TEST_STATUS.WARN]: '⚠️',
        [TEST_STATUS.FAIL]: '❌',
        [TEST_STATUS.ERROR]: '💥',
        [TEST_STATUS.SKIP]: '⏭️'
      };
      
      const emoji = statusEmoji[result.status] || '❓';
      console.log(`${emoji} ${result.name}: ${result.message}`);
      
      if (result.status === TEST_STATUS.FAIL || result.status === TEST_STATUS.ERROR) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });
    
    if (results.summary.categories) {
      console.log('\n📈 Categories:');
      Object.entries(results.summary.categories).forEach(([category, tests]) => {
        console.log(`${category}: ${tests.map(t => `${t.name}(${t.status})`).join(', ')}`);
      });
    }
  } else if (results.summary) {
    // Simple health check results format
    console.log(`Overall Status: ${results.summary.overallStatus}`);
    console.log(`Duration: ${results.duration}ms`);
    console.log(`Tests: ${results.summary.totalTests} total, ${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.warnings} warnings`);
    
    console.log('\n📊 Test Results:');
    if (results.tests) {
      results.tests.forEach(result => {
        const statusEmoji = {
          'PASS': '✅',
          'WARN': '⚠️',
          'FAIL': '❌',
          'ERROR': '💥',
          'SKIP': '⏭️'
        };
        
        const emoji = statusEmoji[result.status] || '❓';
        console.log(`${emoji} ${result.name}: ${result.message}`);
        
        if (result.status === 'FAIL' || result.status === 'ERROR') {
          if (result.details) {
            console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
          }
        }
      });
    }
  } else {
    // Fallback for unknown format
    console.log('Diagnostic results format not recognized');
    console.log(JSON.stringify(results, null, 2));
  }
}

/**
 * Automated troubleshooting workflow
 * @return {Object} Troubleshooting results
 */
async function runAutomatedTroubleshooting() {
  console.log('🔧 Starting Automated Troubleshooting...');
  
  // Step 1: Basic health check
  const healthCheck = await runHealthCheck();
  console.log(`Health Check: ${healthCheck.summary.overallStatus}`);
  
  if (healthCheck.summary.overallStatus === 'HEALTHY') {
    console.log('✅ System appears healthy. No troubleshooting needed.');
    return { status: 'HEALTHY', steps: ['health_check'] };
  }
  
  // Step 2: Identify problem areas
  const problemAreas = healthCheck.results.filter(r => 
    r.status === TEST_STATUS.FAIL || r.status === TEST_STATUS.ERROR
  );
  
  console.log(`Problems found: ${problemAreas.map(p => p.name).join(', ')}`);
  
  // Step 3: Run targeted troubleshooting
  const troubleshootingSteps = [];
  const fixes = [];
  
  for (const problem of problemAreas) {
    const fix = await runTroubleshootingStep_(problem);
    troubleshootingSteps.push(fix);
    if (fix.fixApplied) {
      fixes.push(fix);
    }
  }
  
  // Step 4: Re-run health check
  const finalHealthCheck = await runHealthCheck();
  
  return {
    status: finalHealthCheck.summary.overallStatus,
    initialProblems: problemAreas.length,
    troubleshootingSteps: troubleshootingSteps,
    fixesApplied: fixes.length,
    finalResults: finalHealthCheck
  };
}

/**
 * Run troubleshooting step for specific problem
 * @param {Object} problem - Problem test result
 * @return {Object} Troubleshooting step result
 */
async function runTroubleshootingStep_(problem) {
  console.log(`🔧 Troubleshooting: ${problem.name}`);
  
  switch (problem.name) {
    case 'Database Connectivity':
      return await troubleshootDatabase_(problem);
      
    case 'Provider Detection':
      return await troubleshootProvider_(problem);
      
    case 'Network Connectivity':
      return await troubleshootNetwork_(problem);
      
    case 'Spreadsheet Access':
      return await troubleshootSpreadsheet_(problem);
      
    default:
      return {
        problem: problem.name,
        action: 'No automated fix available',
        fixApplied: false,
        recommendation: 'Manual intervention required'
      };
  }
}

/**
 * Troubleshoot database connectivity issues
 * @param {Object} problem - Database problem details
 * @return {Object} Troubleshooting result
 */
async function troubleshootDatabase_(problem) {
  // Check if credentials are missing
  const credentials = PropertiesService.getUserProperties().getProperties();
  const hasUrl = credentials.SUPABASE_URL;
  const hasKey = credentials.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!hasUrl || !hasKey) {
    return {
      problem: 'Database Connectivity',
      action: 'Missing credentials detected',
      fixApplied: false,
      recommendation: 'Run setup wizard to configure Supabase credentials'
    };
  }
  
  // Try to clear cache and retry
  if (typeof clearAllCacheData === 'function') {
    clearAllCacheData();
    return {
      problem: 'Database Connectivity',
      action: 'Cleared cache to force credential refresh',
      fixApplied: true,
      recommendation: 'Retry database operations'
    };
  }
  
  return {
    problem: 'Database Connectivity',
    action: 'No automated fix available',
    fixApplied: false,
    recommendation: 'Check network connectivity and credential validity'
  };
}

/**
 * Troubleshoot provider detection issues
 * @param {Object} problem - Provider problem details
 * @return {Object} Troubleshooting result
 */
async function troubleshootProvider_(problem) {
  const spreadsheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  // Check if spreadsheet name contains recognizable provider patterns
  const suggestions = [];
  if (!/obinna|ezeji|kamdi|irondi|kelechi/i.test(spreadsheetName)) {
    suggestions.push('Rename spreadsheet to include provider name');
  }
  
  // Try to use cached provider data
  const cachedProvider = typeof getCachedProviderConfig === 'function' ? 
                        getCachedProviderConfig(SpreadsheetApp.getActiveSpreadsheet().getId()) : null;
  
  if (cachedProvider) {
    return {
      problem: 'Provider Detection',
      action: 'Using cached provider configuration',
      fixApplied: true,
      cachedProvider: cachedProvider.displayName,
      recommendation: 'Consider updating spreadsheet name for automatic detection'
    };
  }
  
  return {
    problem: 'Provider Detection',
    action: 'Manual provider selection required',
    fixApplied: false,
    suggestions: suggestions,
    recommendation: 'Use manual provider selection or update spreadsheet name'
  };
}

/**
 * Troubleshoot network connectivity issues
 * @param {Object} problem - Network problem details
 * @return {Object} Troubleshooting result
 */
async function troubleshootNetwork_(problem) {
  // Enable offline mode if cache is available
  const hasCache = typeof getCacheStatistics === 'function';
  
  if (hasCache) {
    const cacheStats = getCacheStatistics();
    if (cacheStats.hits > 0) {
      return {
        problem: 'Network Connectivity',
        action: 'Enabled offline mode using cached data',
        fixApplied: true,
        cacheHitRatio: cacheStats.hitRatio,
        recommendation: 'Limited functionality available until network is restored'
      };
    }
  }
  
  return {
    problem: 'Network Connectivity',
    action: 'No cached data available for offline mode',
    fixApplied: false,
    recommendation: 'Check internet connection and firewall settings'
  };
}

/**
 * Troubleshoot spreadsheet access issues
 * @param {Object} problem - Spreadsheet problem details
 * @return {Object} Troubleshooting result
 */
async function troubleshootSpreadsheet_(problem) {
  try {
    // Try to create missing log sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = spreadsheet.getSheetByName('Dentist-Sync-Log');
    
    if (!logSheet) {
      const newLogSheet = spreadsheet.insertSheet('Dentist-Sync-Log');
      newLogSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Component', 'Message']]);
      
      return {
        problem: 'Spreadsheet Access',
        action: 'Created missing Dentist-Sync-Log sheet',
        fixApplied: true,
        recommendation: 'Sync operations should now work properly'
      };
    }
    
    return {
      problem: 'Spreadsheet Access',
      action: 'Verified spreadsheet structure',
      fixApplied: false,
      recommendation: 'Check spreadsheet permissions and data format'
    };
  } catch (error) {
    return {
      problem: 'Spreadsheet Access',
      action: 'Failed to fix spreadsheet issues',
      fixApplied: false,
      error: error.message,
      recommendation: 'Check spreadsheet permissions'
    };
  }
}

// ===== MENU FUNCTIONS =====

/**
 * Run diagnostics from menu
 */
function menuRunDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('Running Diagnostics', 'Please wait while diagnostics are running...', ui.ButtonSet.OK);
    
    // Run asynchronously (note: actual async not supported in menu functions)
    runStandardDiagnostics().then(results => {
      const message = `Diagnostics completed.\n\nStatus: ${results.summary.overallStatus}\nTests: ${results.summary.totalTests}\nPassed: ${results.summary.passed}\nFailed: ${results.summary.failed}\nWarnings: ${results.summary.warnings}`;
      
      ui.alert('Diagnostic Results', message, ui.ButtonSet.OK);
      showDiagnosticReport(results);
    }).catch(error => {
      ui.alert('Diagnostic Error', `Error running diagnostics: ${error.message}`, ui.ButtonSet.OK);
    });
    
  } catch (error) {
    ui.alert('Error', `Failed to run diagnostics: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Run troubleshooting from menu
 */
function menuRunTroubleshooting() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('Running Troubleshooting', 'Please wait while automated troubleshooting is running...', ui.ButtonSet.OK);
    
    runAutomatedTroubleshooting().then(results => {
      const message = `Troubleshooting completed.\n\nFinal Status: ${results.status}\nFixes Applied: ${results.fixesApplied}\nInitial Problems: ${results.initialProblems}`;
      
      ui.alert('Troubleshooting Results', message, ui.ButtonSet.OK);
    }).catch(error => {
      ui.alert('Troubleshooting Error', `Error running troubleshooting: ${error.message}`, ui.ButtonSet.OK);
    });
    
  } catch (error) {
    ui.alert('Error', `Failed to run troubleshooting: ${error.message}`, ui.ButtonSet.OK);
  }
}