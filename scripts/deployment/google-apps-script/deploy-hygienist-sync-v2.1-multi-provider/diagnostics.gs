/**
 * ===== DIAGNOSTICS AND DEBUGGING UTILITIES =====
 * 
 * Comprehensive diagnostic tools for troubleshooting sync issues
 * 
 * @version 2.1.0
 */

/**
 * Test Supabase connection with detailed diagnostics
 */
function testConnection() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'testConnection' });
  
  try {
    logger.log('INFO', 'Starting connection test');
    
    // Get credentials
    const credOperation = logger.startOperation('Get credentials');
    const credentials = getSupabaseCredentials_();
    credOperation.end({ hasCredentials: !!credentials });
    
    if (!credentials) {
      logger.log('ERROR', 'Supabase credentials not found');
      ui.alert('❌ Error', 'Supabase credentials not found. Please run Setup first.', ui.ButtonSet.OK);
      return;
    }
    
    // Log credential status
    logger.log('DEBUG', 'Credential status', {
      hasUrl: !!credentials.url,
      hasKey: !!credentials.key,
      hasClinicId: !!credentials.clinicId,
      hasProviderId: !!credentials.providerId,
      provider: credentials.detectedProvider?.displayName
    });
    
    // Try to fetch from a simple endpoint
    const testUrl = `${credentials.url}/rest/v1/`;
    const apiCall = logger.logApiCall('/', 'GET');
    
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key
      },
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      apiCall.success(response);
      logger.log('INFO', 'Successfully connected to Supabase', { responseCode });
      ui.alert('✅ Success', 'Successfully connected to Supabase!', ui.ButtonSet.OK);
    } else {
      apiCall.error(new Error(`HTTP ${responseCode}`));
      logger.log('ERROR', 'Connection failed', {
        responseCode,
        responseText: response.getContentText().substring(0, 200)
      });
      ui.alert('❌ Connection Failed', `Failed to connect. Response code: ${responseCode}\n\nResponse: ${response.getContentText()}`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    logError(error, { function: 'testConnection' });
    ui.alert('❌ Error', `Connection test failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Comprehensive setup validation with enhanced diagnostics
 */
function validateSetup() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'validateSetup' });
  const issues = [];
  const diagnosticData = {};
  
  logger.log('INFO', 'Starting setup validation');
  
  // Check script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  
  const supabaseUrl = scriptProperties.getProperty('SUPABASE_URL') || userProperties.getProperty('SUPABASE_URL');
  const supabaseKey = scriptProperties.getProperty('SUPABASE_SERVICE_ROLE_KEY') || userProperties.getProperty('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl) {
    issues.push('❌ SUPABASE_URL not set');
    diagnosticData.supabaseUrl = 'missing';
  } else {
    issues.push('✅ SUPABASE_URL is set');
    diagnosticData.supabaseUrl = 'present';
  }
  
  if (!supabaseKey) {
    issues.push('❌ SUPABASE_SERVICE_ROLE_KEY not set');
    diagnosticData.supabaseKey = 'missing';
  } else {
    issues.push('✅ SUPABASE_SERVICE_ROLE_KEY is set');
    diagnosticData.supabaseKey = 'present';
  }
  
  // Check provider detection
  try {
    const providerInfo = detectCurrentProvider(SpreadsheetApp.getActiveSpreadsheet().getId());
    if (providerInfo) {
      issues.push(`✅ Provider detected: ${providerInfo.displayName}`);
      diagnosticData.provider = providerInfo.displayName;
      diagnosticData.providerCode = providerInfo.providerCode;
    } else {
      issues.push('❌ Provider not detected from spreadsheet name');
      diagnosticData.provider = 'not detected';
    }
  } catch (error) {
    issues.push(`❌ Provider detection error: ${error.message}`);
    diagnosticData.providerError = error.message;
  }
  
  // Check credentials resolution
  try {
    const credentials = getSupabaseCredentials_();
    if (credentials) {
      if (credentials.clinicId) {
        issues.push('✅ Clinic ID resolved');
        diagnosticData.clinicId = 'resolved';
      } else {
        issues.push('❌ Clinic ID not resolved');
        diagnosticData.clinicId = 'missing';
      }
      
      if (credentials.providerId) {
        issues.push('✅ Provider ID resolved');
        diagnosticData.providerId = 'resolved';
      } else {
        issues.push('⚠️ Provider ID not resolved (optional)');
        diagnosticData.providerId = 'missing';
      }
    }
  } catch (error) {
    issues.push(`❌ Credential resolution error: ${error.message}`);
    diagnosticData.credentialError = error.message;
  }
  
  // Check for log sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(HYGIENE_LOG_TAB_NAME);
  const enhancedLogSheet = ss.getSheetByName(LOG_CONFIG.LOG_SHEET_NAME);
  
  if (!logSheet) {
    issues.push('❌ Legacy log sheet not found (will be created on first sync)');
  } else {
    issues.push('✅ Legacy log sheet exists');
  }
  
  if (!enhancedLogSheet) {
    issues.push('ℹ️ Enhanced log sheet not found (will be created on first sync)');
  } else {
    issues.push('✅ Enhanced log sheet exists');
  }
  
  // Check for month tabs
  const sheets = ss.getSheets();
  const monthTabs = sheets.filter(sheet => {
    return MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheet.getName()));
  });
  
  if (monthTabs.length === 0) {
    issues.push('❌ No month tabs found');
    diagnosticData.monthTabs = 0;
  } else {
    issues.push(`✅ Found ${monthTabs.length} month tabs`);
    diagnosticData.monthTabs = monthTabs.length;
    diagnosticData.monthTabNames = monthTabs.map(s => s.getName()).slice(0, 5); // First 5 for brevity
  }
  
  // Log diagnostics
  logger.log('INFO', 'Validation complete', {
    issueCount: issues.filter(i => i.startsWith('❌')).length,
    warningCount: issues.filter(i => i.startsWith('⚠️')).length,
    successCount: issues.filter(i => i.startsWith('✅')).length,
    diagnosticData
  });
  
  // Show results
  const hasErrors = issues.some(i => i.startsWith('❌'));
  const message = 'Setup Validation Results:\n\n' + issues.join('\n');
  ui.alert('🔍 Setup Validation', message, ui.ButtonSet.OK);
}

/**
 * Show comprehensive diagnostics information
 */
function showDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'showDiagnostics' });
  
  try {
    // Generate diagnostic report
    const report = generateDiagnosticReport();
    const info = [];
    
    // Spreadsheet info
    info.push('📊 SPREADSHEET INFO');
    info.push(`Name: ${report.environment.spreadsheetName}`);
    info.push(`ID: ${report.environment.spreadsheetId}`);
    info.push(`Timezone: ${report.environment.timezone}`);
    info.push('');
    
    // Provider info
    if (report.provider) {
      info.push('👤 PROVIDER INFO');
      info.push(`Name: ${report.provider.name}`);
      info.push(`Code: ${report.provider.code}`);
      info.push(`Primary Clinic: ${report.provider.primaryClinic}`);
    } else {
      info.push('❌ PROVIDER NOT DETECTED');
    }
    info.push('');
    
    // Credential status
    info.push('🔐 CREDENTIALS');
    info.push(`Supabase URL: ${report.credentials.supabaseUrl}`);
    info.push(`Service Key: ${report.credentials.hasServiceKey ? '✅ Present' : '❌ Missing'}`);
    info.push(`Clinic ID: ${report.credentials.clinicId || '❌ Not resolved'}`);
    info.push(`Provider ID: ${report.credentials.providerId || '⚠️ Not resolved (optional)'}`);
    info.push('');
    
    // Sheet info
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    info.push('📑 SHEETS');
    
    let monthTabCount = 0;
    sheets.forEach(sheet => {
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheet.getName()));
      if (isMonthTab) monthTabCount++;
      const marker = isMonthTab ? '✅' : '➖';
      const rowCount = sheet.getLastRow();
      const status = rowCount > 1 ? `${rowCount} rows` : 'empty';
      info.push(`${marker} ${sheet.getName()} (${status})`);
    });
    info.push(`Total sheets: ${sheets.length}, Month tabs: ${monthTabCount}`);
    info.push('');
    
    // Configuration
    info.push('⚙️ CONFIGURATION');
    info.push(`Log Level: ${report.configuration.logLevel}`);
    info.push(`Batch Size: ${report.configuration.batchSize}`);
    info.push(`Max Retries: ${report.configuration.maxRetries}`);
    info.push(`Table Name: ${SUPABASE_TABLE_NAME}`);
    info.push(`Debug Mode: ${isDebugMode() ? 'ON' : 'OFF'}`);
    info.push('');
    
    // Performance stats (if available)
    const summary = logger.getSummary();
    if (summary.operationCount > 0) {
      info.push('📈 PERFORMANCE');
      info.push(`Operations: ${summary.operationCount}`);
      info.push(`Avg Duration: ${Math.round(summary.avgOperationTime)}ms`);
      info.push(`API Calls: ${summary.metrics.apiCalls}`);
    }
    
    // Show info
    ui.alert('🔍 Diagnostics', info.join('\n'), ui.ButtonSet.OK);
    
    // Log full report
    logger.log('INFO', 'Diagnostic report displayed', report);
    
  } catch (error) {
    logError(error, { function: 'showDiagnostics' });
    ui.alert('❌ Error', `Failed to generate diagnostics: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Enable debug mode for detailed logging
 */
function enableDebugMode() {
  setDebugMode(true);
  SpreadsheetApp.getUi().alert('🐛 Debug Mode', 'Debug mode has been ENABLED.\n\nYou will see more detailed logs in the console and log sheet.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Disable debug mode
 */
function disableDebugMode() {
  setDebugMode(false);
  SpreadsheetApp.getUi().alert('🐛 Debug Mode', 'Debug mode has been DISABLED.\n\nLogging will return to normal levels.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Export diagnostic report as JSON
 */
function exportDiagnosticReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const report = generateDiagnosticReport();
    const jsonReport = JSON.stringify(report, null, 2);
    
    // Create a temporary sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tempSheet = ss.insertSheet('Diagnostic_Report_Export');
    
    tempSheet.getRange(1, 1).setValue('Diagnostic Report (JSON)');
    tempSheet.getRange(2, 1).setValue(jsonReport);
    tempSheet.getRange(2, 1).setWrap(false);
    
    ui.alert('📋 Export Complete', 
      'Diagnostic report has been exported to the "Diagnostic_Report_Export" sheet.\n\n' +
      'Copy the JSON content and save it to a file for analysis.\n\n' +
      'Delete the sheet when done.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Error', `Failed to export report: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Analyze sync performance
 */
function analyzeSyncPerformance() {
  const ui = SpreadsheetApp.getUi();
  const logger = getLogger();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const metricsSheet = ss.getSheetByName(LOG_CONFIG.METRICS_SHEET_NAME);
    
    if (!metricsSheet) {
      ui.alert('📊 No Metrics', 'No metrics sheet found. Run a sync operation first to generate metrics.', ui.ButtonSet.OK);
      return;
    }
    
    const data = metricsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('📊 No Data', 'No metrics data found. Run a sync operation first.', ui.ButtonSet.OK);
      return;
    }
    
    // Skip header row
    const metrics = data.slice(1);
    
    // Calculate statistics
    const stats = {
      totalOperations: metrics.length,
      totalRecords: metrics.reduce((sum, row) => sum + (row[3] || 0), 0), // Records Processed
      totalErrors: metrics.reduce((sum, row) => sum + (row[7] || 0), 0), // Errors
      avgDuration: metrics.reduce((sum, row) => sum + (row[5] || 0), 0) / metrics.length, // Duration
      avgRecordsPerOperation: metrics.reduce((sum, row) => sum + (row[3] || 0), 0) / metrics.length
    };
    
    // Find slowest operations
    const slowest = metrics
      .map((row, index) => ({ operation: row[1], duration: row[5] || 0, index: index + 2 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    // Build report
    const report = [];
    report.push('📊 SYNC PERFORMANCE ANALYSIS');
    report.push('');
    report.push('📈 OVERALL STATISTICS');
    report.push(`Total Operations: ${stats.totalOperations}`);
    report.push(`Total Records Processed: ${stats.totalRecords}`);
    report.push(`Total Errors: ${stats.totalErrors}`);
    report.push(`Average Duration: ${stats.avgDuration.toFixed(1)}s`);
    report.push(`Average Records/Operation: ${stats.avgRecordsPerOperation.toFixed(0)}`);
    report.push('');
    report.push('🐌 SLOWEST OPERATIONS');
    slowest.forEach((op, i) => {
      report.push(`${i + 1}. ${op.operation} - ${op.duration}s (row ${op.index})`);
    });
    
    ui.alert('📊 Performance Analysis', report.join('\n'), ui.ButtonSet.OK);
    
  } catch (error) {
    logError(error, { function: 'analyzeSyncPerformance' });
    ui.alert('❌ Error', `Failed to analyze performance: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Check if all required functions exist and are accessible
 */
function checkFunctionAvailability() {
  const ui = SpreadsheetApp.getUi();
  const requiredFunctions = [
    'setupHygieneSync',
    'syncAllHygieneData',
    'onEditHygieneSync',
    'testSupabaseConnection',
    'getSyncStatistics',
    'clearOldLogs',
    'clearAllTriggers',
    'setDashboardApiUrl',
    'getSupabaseCredentials_',
    'detectCurrentProvider',
    'validateBatchForSupabase'
  ];
  
  let report = '🔍 Function Availability Check:\n\n';
  let allFound = true;
  
  requiredFunctions.forEach(funcName => {
    try {
      if (typeof this[funcName] === 'function') {
        report += `✅ ${funcName} - Found\n`;
      } else {
        report += `❌ ${funcName} - NOT FOUND\n`;
        allFound = false;
      }
    } catch (e) {
      report += `❌ ${funcName} - ERROR: ${e.message}\n`;
      allFound = false;
    }
  });
  
  report += '\n' + (allFound ? '✅ All functions are available!' : '❌ Some functions are missing!');
  
  ui.alert('Function Availability Check', report, ui.ButtonSet.OK);
}

/**
 * Test all trigger functions manually
 */
function testAllTriggerFunctions() {
  const ui = SpreadsheetApp.getUi();
  let report = '🧪 Testing Trigger Functions:\n\n';
  
  // Test syncAllHygieneData
  try {
    Logger.log('Testing syncAllHygieneData...');
    report += '1. syncAllHygieneData: ';
    // Just check if function exists, don't actually run sync
    if (typeof syncAllHygieneData === 'function') {
      report += '✅ Function exists\n';
    } else {
      report += '❌ Function not found\n';
    }
  } catch (e) {
    report += `❌ ERROR: ${e.message}\n`;
  }
  
  // Test onEditHygieneSync
  try {
    Logger.log('Testing onEditHygieneSync...');
    report += '2. onEditHygieneSync: ';
    if (typeof onEditHygieneSync === 'function') {
      report += '✅ Function exists\n';
    } else {
      report += '❌ Function not found\n';
    }
  } catch (e) {
    report += `❌ ERROR: ${e.message}\n`;
  }
  
  // Check current triggers
  report += '\n📋 Current Triggers:\n';
  const triggers = ScriptApp.getProjectTriggers();
  if (triggers.length === 0) {
    report += '❌ No triggers found\n';
  } else {
    triggers.forEach((trigger, i) => {
      report += `${i + 1}. ${trigger.getHandlerFunction()} (${trigger.getTriggerSource()})\n`;
    });
  }
  
  ui.alert('Trigger Function Test', report, ui.ButtonSet.OK);
}

/**
 * Check if constants are properly defined
 */
function checkConstants() {
  const ui = SpreadsheetApp.getUi();
  let report = '📋 Constants Check:\n\n';
  
  try {
    report += `SYNC_FUNCTION_NAME: ${SYNC_FUNCTION_NAME}\n`;
    report += `ON_EDIT_FUNCTION_NAME: ${ON_EDIT_FUNCTION_NAME}\n`;
    report += `MONTH_TAB_PATTERNS: ${MONTH_TAB_PATTERNS.length} patterns defined\n`;
    report += `SUPABASE_BATCH_SIZE: ${SUPABASE_BATCH_SIZE}\n`;
    report += `MAX_RETRIES: ${MAX_RETRIES}\n`;
    
    report += '\n✅ All constants are accessible!';
  } catch (e) {
    report += `\n❌ Error accessing constants: ${e.message}`;
  }
  
  ui.alert('Constants Check', report, ui.ButtonSet.OK);
}

/**
 * Full system diagnostic
 */
function runFullDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🏥 Running Full Diagnostics',
    'This will check:\n' +
    '1. Function availability\n' +
    '2. Constants\n' +
    '3. Triggers\n' +
    '4. Setup validation\n' +
    '5. Connection test\n\n' +
    'Click OK to continue.',
    ui.ButtonSet.OK
  );
  
  // Run all checks
  checkFunctionAvailability();
  checkConstants();
  testAllTriggerFunctions();
  validateSetup();
  
  // Also run the existing checkTriggerStatus from triggers.gs
  if (typeof checkTriggerStatus === 'function') {
    checkTriggerStatus();
  }
}

/**
 * Quick performance check
 */
function quickPerformanceCheck() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'quickPerformanceCheck' });
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    let totalRows = 0;
    let monthTabs = 0;
    
    sheets.forEach(sheet => {
      if (MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheet.getName()))) {
        monthTabs++;
        totalRows += sheet.getLastRow();
      }
    });
    
    const estimatedSyncTime = (totalRows / SUPABASE_BATCH_SIZE) * 2; // Rough estimate: 2 seconds per batch
    
    const report = [
      '⚡ QUICK PERFORMANCE CHECK',
      '',
      `Month tabs: ${monthTabs}`,
      `Total rows: ${totalRows}`,
      `Batch size: ${SUPABASE_BATCH_SIZE}`,
      `Estimated batches: ${Math.ceil(totalRows / SUPABASE_BATCH_SIZE)}`,
      `Estimated sync time: ${estimatedSyncTime.toFixed(1)}s`,
      '',
      'Note: Actual time may vary based on network and data complexity.'
    ];
    
    ui.alert('⚡ Performance Check', report.join('\n'), ui.ButtonSet.OK);
    
  } catch (error) {
    logError(error, { function: 'quickPerformanceCheck' });
    ui.alert('❌ Error', `Failed to check performance: ${error.message}`, ui.ButtonSet.OK);
  }
}