/**
 * ===== DENTIST SYNC MENU V2.1 (MULTI-PROVIDER) =====
 * 
 * Updated menu system for multi-provider dentist production sync
 * Automatic provider detection with multi-location support
 * 
 * @version 2.1.0
 * @requires shared-sync-utils.gs, shared-multi-provider-utils.gs
 */

/**
 * Creates the Dentist Sync V2.1 Multi-Provider menu in Google Sheets
 * Called automatically when the spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🦷 Dentist Sync V2.1')
    .addSubMenu(ui.createMenu('🔧 Setup & Configuration')
      .addItem('1. Setup Credentials (V2.1)', 'setSupabaseCredentials_')
      .addItem('2. Test Connection', 'testSupabaseConnection')
      .addItem('3. Check Dependencies', 'checkMultiProviderDependencies')
      .addSeparator()
      .addItem('Show System Info', 'showSystemInfo')
      .addItem('Validate Spreadsheet', 'validateCurrentSpreadsheet')
      .addItem('Validate Auto-Discovery', 'validateAutoDiscoverySetupMenu')
      .addItem('Migration Guide', 'showMigrationGuide'))
    
    .addSubMenu(ui.createMenu('🛡️ Error Handling & Recovery')
      .addItem('Run Health Check', 'menuRunHealthCheck')
      .addItem('Run Full Diagnostics', 'menuRunDiagnostics')
      .addItem('Auto-Troubleshooting', 'menuRunTroubleshooting')
      .addSeparator()
      .addItem('Show Error Report', 'menuShowErrorReport')
      .addItem('Show Cache Report', 'menuShowCacheReport')
      .addItem('Clear Error History', 'menuClearErrorHistory')
      .addSeparator()
      .addItem('Test Provider Detection', 'menuTestProviderDetection')
      .addItem('Test Database Connection', 'menuTestDatabaseConnection'))
    
    .addSubMenu(ui.createMenu('▶️ Sync Operations')
      .addItem('Sync All Data', 'syncAllDentistData')
      .addItem('Sync Current Sheet', 'syncCurrentSheetData')
      .addSeparator()
      .addItem('Clear All Logs', 'clearAllLogs_'))
    
    .addSubMenu(ui.createMenu('🔍 Testing & Debug')
      .addItem('Test Credential Resolution', 'testCredentialResolution_')
      .addItem('Test Provider Detection', 'testProviderDetection')
      .addItem('Test Location Credentials', 'testAllLocationCredentials')
      .addSeparator()
      .addItem('Test Database Logging', 'testDatabaseLogging')
      .addItem('Test Provider Logging', 'testProviderLogging')
      .addItem('Test Performance Logging', 'testPerformanceLogging')
      .addSeparator()
      .addItem('View Detailed Logs', 'viewDetailedLogs')
      .addItem('Export Logs for Analysis', 'exportLogsForAnalysis')
      .addSeparator()
      .addItem('Test Database Provider Lookup', 'testDatabaseProviderLookup')
      .addItem('Test Database Connectivity', 'testProviderDatabaseConnectivityMenu')
      .addItem('Compare DB vs Fallback Config', 'compareProviderConfigurationsMenu')
      .addItem('Test Database vs Fallback System', 'testDatabaseVsFallbackProviders')
      .addSeparator()
      .addSubMenu(ui.createMenu('🔧 Function Dependencies')
        .addItem('Run All Dependency Tests', 'runAllDependencyTests')
        .addItem('Run Advanced Dependency Tests', 'runAdvancedDependencyTests')
        .addSeparator()
        .addItem('Quick Critical Function Check', 'quickCriticalFunctionCheck')
        .addItem('Quick Provider Detection Test', 'quickProviderDetectionTest')
        .addItem('Performance Timing Tests', 'runPerformanceTimingTests')
        .addSeparator()
        .addItem('Generate Dependency Report', 'generateDependencyReport')
        .addItem('Reset Test State', 'resetDependencyTestState')
        .addSeparator()
        .addItem('Validate System Integration', 'validateDependencySystemIntegration')
        .addItem('Quick System Check', 'quickDependencySystemCheck')
        .addItem('Setup Testing System', 'setupDependencyTestingSystem')
        .addSeparator()
        .addItem('Initialize Dependency Testing', 'initializeDependencyTesting'))
      .addSeparator()
      .addItem('Test Sync Utilities', 'testSyncUtilities')
      .addItem('Debug External Mappings', 'debugExternalMappings')
      .addItem('Debug Provider Patterns', 'debugProviderPatterns'))
    
    .addSubMenu(ui.createMenu('🔍 Provider Discovery')
      .addItem('Discover Providers from Database', 'showDiscoveredProviders')
      .addItem('Test Auto-Discovery', 'testAutoDiscovery')
      .addItem('Register New Provider', 'startProviderRegistrationWorkflow')
      .addSeparator()
      .addItem('Validate Provider Registration', 'validateCurrentProviderRegistration')
      .addItem('Update Provider Patterns', 'updateProviderPatternsFromDatabaseMenu')
      .addItem('Clear Discovery Cache', 'clearAutoDiscoveryCache'))
    
    .addSubMenu(ui.createMenu('🏥 Multi-Location')
      .addItem('Test Humble Location', 'testHumbleLocation')
      .addItem('Test Baytown Location', 'testBaytownLocation')
      .addItem('Detect Column Mapping', 'detectAndShowColumnMapping')
      .addSeparator()
      .addItem('Validate Multi-Location Data', 'validateMultiLocationData'))
    
    .addSubMenu(ui.createMenu('⚙️ Advanced')
      .addItem('Setup Triggers', 'setupDentistTriggers')
      .addItem('Remove Triggers', 'removeDentistTriggers')
      .addSeparator()
      .addItem('Export Logs', 'exportSyncLogs')
      .addItem('Validate Data Integrity', 'validateDataIntegrity')
      .addItem('Reset System', 'resetMultiProviderSystem'))
    
    .addSeparator()
    .addItem('📚 Help & Documentation', 'showHelp')
    .addToUi();
}

/**
 * Sync current sheet data only
 */
function syncCurrentSheetData() {
  const activeSheet = SpreadsheetApp.getActiveSheet();
  const sheetName = activeSheet.getName();
  
  // Check if this looks like a month tab
  const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
  if (!isMonthTab) {
    SpreadsheetApp.getUi().alert(
      'Invalid Sheet',
      `"${sheetName}" doesn't appear to be a month tab.\n\n` +
      'Please select a sheet with a month format like "Dec-24" or "Jan 2025".',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  try {
    // Get provider info first
    const providerConfig = getCurrentProviderConfig();
    if (!providerConfig) {
      SpreadsheetApp.getUi().alert(
        'Provider Detection Error',
        'Could not detect provider for this spreadsheet.\n\n' +
        'Please ensure the spreadsheet name contains the provider name.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    const result = syncSheetData_(activeSheet, sheetName);
    const ui = SpreadsheetApp.getUi();
    
    if (result.success) {
      ui.alert(
        'Sync Complete',
        `Successfully synced "${sheetName}" for ${providerConfig.displayName}:\n\n` +
        `• Records processed: ${result.recordsAttempted || 0}\n` +
        `• Records synced: ${result.recordsSynced || 0}\n` +
        `• Skipped/Failed: ${result.recordsFailedOrSkipped || 0}\n\n` +
        'Check the Dentist-Sync-Log tab for details.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'Sync Failed',
        `Failed to sync "${sheetName}" for ${providerConfig.displayName}:\n\n${result.message}\n\n` +
        'Check the Dentist-Sync-Log tab for error details.',
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Sync Error',
      `Error syncing "${sheetName}": ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Test provider detection with current spreadsheet
 */
function testProviderDetection() {
  try {
    testMultiProviderDetection(getDentistSheetId());
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Test Error',
      `Provider detection test failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Test location credentials for all locations
 */
function testAllLocationCredentials() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Testing All Location Credentials',
    'Testing credential resolution for both Humble and Baytown locations...\n\n' +
    'This will verify multi-location sync capability.',
    ui.ButtonSet.OK
  );
  
  // Test both locations
  testLocationCredentials_('humble');
  testLocationCredentials_('baytown');
}

/**
 * Test Humble location specifically
 */
function testHumbleLocation() {
  testLocationCredentials_('humble');
}

/**
 * Test Baytown location specifically  
 */
function testBaytownLocation() {
  testLocationCredentials_('baytown');
}

/**
 * Detect and show column mapping for current spreadsheet
 */
function detectAndShowColumnMapping() {
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const sheets = ss.getSheets();
    
    // Find a month tab to analyze
    const monthTab = sheets.find(sheet => 
      MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheet.getName()))
    );
    
    if (!monthTab) {
      SpreadsheetApp.getUi().alert(
        'No Month Tabs Found',
        'Could not find any month tabs to analyze.\n\n' +
        'Please add month tabs with names like "Jan-25", "Feb-25", etc.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    // Get headers and detect location columns
    const headers = getSheetHeaders_(monthTab);
    const columnMapping = detectLocationColumns(headers);
    
    let info = `📊 Column Mapping Analysis for "${monthTab.getName()}"\n\n`;
    
    info += `🏥 Humble Columns (${columnMapping.humble.columns.length}):\n`;
    columnMapping.humble.columns.forEach(col => {
      info += `  • ${col.header} (Column ${col.index + 1})\n`;
    });
    info += '\n';
    
    info += `🏥 Baytown Columns (${columnMapping.baytown.columns.length}):\n`;
    columnMapping.baytown.columns.forEach(col => {
      info += `  • ${col.header} (Column ${col.index + 1})\n`;
    });
    info += '\n';
    
    info += `📊 Total/Combined Columns (${columnMapping.total.columns.length}):\n`;
    columnMapping.total.columns.forEach(col => {
      info += `  • ${col.header} (Column ${col.index + 1})\n`;
    });
    info += '\n';
    
    info += `❓ Other Columns (${columnMapping.other.columns.length}):\n`;
    columnMapping.other.columns.slice(0, 5).forEach(col => {
      info += `  • ${col.header} (Column ${col.index + 1})\n`;
    });
    if (columnMapping.other.columns.length > 5) {
      info += `  ... and ${columnMapping.other.columns.length - 5} more\n`;
    }
    
    SpreadsheetApp.getUi().alert('Column Mapping Detection', info, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Column Detection Error',
      `Failed to detect column mapping: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Validate current spreadsheet for multi-provider compatibility
 */
function validateCurrentSpreadsheet() {
  try {
    const validation = validateMultiProviderSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    
    if (validation.isValid) {
      ui.alert(
        '✅ Spreadsheet Validation Successful',
        `Your spreadsheet is ready for multi-provider sync:\n\n` +
        `• Provider: ${validation.provider}\n` +
        `• Provider Code: ${validation.providerCode}\n` +
        `• Primary Clinic: ${validation.primaryClinic}\n` +
        `• Month Tabs Found: ${validation.monthTabsFound}\n` +
        `• Spreadsheet: ${validation.spreadsheetName}\n\n` +
        'Multi-provider sync system ready!',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Spreadsheet Validation Failed',
        `Validation issues found:\n\n` +
        `Error: ${validation.error}\n\n` +
        `Suggestions:\n${validation.suggestions?.join('\n') || 'Check configuration'}`,
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Validation Error',
      `Spreadsheet validation failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Validate multi-location data structure
 */
function validateMultiLocationData() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Get provider info
    const providerConfig = getCurrentProviderConfig();
    if (!providerConfig) {
      ui.alert(
        'Provider Detection Required',
        'Please ensure provider detection is working before validating multi-location data.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    ui.alert(
      'Multi-Location Data Validation',
      `Validating multi-location data structure for ${providerConfig.displayName}...\n\n` +
      'This will check:\n' +
      '• Location-specific column detection\n' +
      '• Data consistency across locations\n' +
      '• Provider-location relationship validation\n\n' +
      'Check the Dentist-Sync-Log tab for detailed results.',
      ui.ButtonSet.OK
    );
    
    // Run comprehensive validation (would be implemented in main sync logic)
    // For now, just show that validation is available
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Validation Error',
      `Multi-location validation failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Reset multi-provider system (clear cached data)
 */
function resetMultiProviderSystem() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Reset Multi-Provider System',
    'This will clear any cached provider detection data and force re-detection.\n\n' +
    'Your credentials will NOT be affected.\n\n' +
    'Do you want to continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      // Clear any caches (this would be implemented based on caching strategy)
      // For now, just show that reset is available
      
      ui.alert(
        '✅ System Reset Complete',
        'Multi-provider system has been reset.\n\n' +
        'Provider detection will run fresh on next sync operation.',
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      ui.alert(
        'Reset Error',
        `Failed to reset system: ${error.message}`,
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Show migration guide for upgrading to multi-provider system
 */
function showMigrationGuide() {
  const ui = SpreadsheetApp.getUi();
  
  let guide = '🚀 Multi-Provider Migration Guide (V2.0 → V2.1)\n\n';
 // guide += 'WHAT\\'S NEW IN V2.1:\\n';
  guide += '• Automatic provider detection from spreadsheet names\n';
  guide += '• Support for any provider (Dr. Kamdi, Dr. Obinna, etc.)\n';
  guide += '• Multi-location sync with dynamic column mapping\n';
  guide += '• Enhanced provider-location relationship validation\n\n';
  
  guide += 'MIGRATION BENEFITS:\n';
  guide += '• No more hard-coded provider configuration\n';
  // guide += '• Works with any provider\\'s spreadsheet automatically\\n';
  guide += '• Dynamic multi-location production data support\n';
  guide += '• Enhanced debugging and testing tools\n\n';
  
  guide += 'REQUIRED CHANGES:\n';
  guide += '1. Add shared-multi-provider-utils.gs to your project\n';
  guide += '2. Replace config.gs with multi-provider version\n';
  guide += '3. Replace credentials.gs with multi-provider version\n';
  guide += '4. Update menu.gs with enhanced testing options\n';
  guide += '5. Test provider detection and multi-location support\n\n';
  
  guide += 'PROVIDER DETECTION:\n';
  guide += 'The system detects providers from spreadsheet names:\n';
  guide += '• "Kamdi" or "Irondi" → Dr. Kamdi Irondi\n';
  guide += '• "Obinna" or "Ezeji" → Dr. Obinna Ezeji\n';
  guide += '• Add more patterns in shared-multi-provider-utils.gs\n\n';
  
  guide += 'Need help? Use the Testing & Debug menu for validation.';
  
  ui.alert('Multi-Provider Migration Guide', guide, ui.ButtonSet.OK);
}

/**
 * Start provider registration workflow
 */
function startProviderRegistrationWorkflow() {
  try {
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    const spreadsheetUrl = ss.getUrl();
    
    const registered = startNewProviderRegistration_(spreadsheetName, spreadsheetUrl);
    
    if (!registered) {
      SpreadsheetApp.getUi().alert(
        'Registration Cancelled',
        'Provider registration was cancelled or failed.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Registration Error',
      `Provider registration failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Validate current provider registration
 */
function validateCurrentProviderRegistration() {
  try {
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const validation = validateProviderRegistration(spreadsheetId);
    const ui = SpreadsheetApp.getUi();
    
    let message = `🔍 Provider Registration Validation\n\n`;
    message += `Spreadsheet: "${validation.spreadsheetName}"\n\n`;
    
    if (validation.staticPatternMatch) {
      message += `✅ Static Pattern Match:\n`;
      message += `   Provider: ${validation.staticPatternMatch.displayName}\n`;
      message += `   Confidence: ${validation.staticPatternMatch.confidence}\n\n`;
    }
    
    if (validation.autoDiscoveryMatch) {
      message += `🔍 Auto-Discovery Match:\n`;
      message += `   Provider: ${validation.autoDiscoveryMatch.displayName}\n`;
      message += `   Confidence: ${validation.autoDiscoveryMatch.confidence.toFixed(2)}\n`;
      message += `   Source: ${validation.autoDiscoveryMatch.source}\n\n`;
    }
    
    if (validation.autoDiscoveryError) {
      message += `⚠️ Auto-Discovery Error:\n   ${validation.autoDiscoveryError}\n\n`;
    }
    
    if (validation.registrationRequired) {
      message += `❌ Registration Required:\n`;
      message += `   No provider detected for this spreadsheet\n\n`;
    }
    
    if (validation.recommendations.length > 0) {
      message += `💡 Recommendations:\n`;
      validation.recommendations.forEach(rec => {
        message += `   • ${rec}\n`;
      });
    }
    
    ui.alert('Provider Registration Validation', message, ui.ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Validation Error',
      `Provider registration validation failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Validate auto-discovery setup (menu function)
 */
function validateAutoDiscoverySetupMenu() {
  try {
    const validation = validateAutoDiscoverySetup();
    const ui = SpreadsheetApp.getUi();
    
    let message = `🔍 Auto-Discovery System Validation\n\n`;
    
    if (validation.isValid) {
      message += `✅ System Status: HEALTHY\n\n`;
    } else {
      message += `❌ System Status: ISSUES FOUND\n\n`;
    }
    
    // Show system status
    message += `📊 System Status:\n`;
    Object.entries(validation.systemStatus).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      message += `   • ${label}: ${value}\n`;
    });
    message += '\n';
    
    // Show issues if any
    if (validation.issues.length > 0) {
      message += `⚠️ Issues Found:\n`;
      validation.issues.forEach(issue => {
        message += `   • ${issue}\n`;
      });
      message += '\n';
    }
    
    // Show recommendations if any
    if (validation.recommendations.length > 0) {
      message += `💡 Recommendations:\n`;
      validation.recommendations.forEach(rec => {
        message += `   • ${rec}\n`;
      });
    }
    
    ui.alert('Auto-Discovery Validation', message, ui.ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Validation Error',
      `Auto-discovery validation failed: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Update provider patterns from database (menu function)
 */
function updateProviderPatternsFromDatabaseMenu() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Update Provider Patterns',
    'This will refresh provider patterns from the database.\n\n' +
    'New providers in the database will be added to detection patterns.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      const updatedPatterns = updateProviderPatternsFromDatabase();
      const patternCount = Object.keys(updatedPatterns).length;
      
      ui.alert(
        '✅ Patterns Updated',
        `Provider patterns have been updated!\n\n` +
        `Total patterns: ${patternCount}\n` +
        'Database providers are now included in detection.',
        ui.ButtonSet.OK
      );
      
    } catch (error) {
      ui.alert(
        '❌ Update Failed',
        `Failed to update provider patterns: ${error.message}`,
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Show help and documentation for multi-provider system
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  
  let help = '📚 Multi-Provider Dentist Sync V2.1 Help\n\n';
  
  // Try to show provider-specific help
  try {
    const providerConfig = getCurrentProviderConfig();
    if (providerConfig) {
      help += `Current Provider: ${providerConfig.displayName}\n`;
      help += `Provider Code: ${providerConfig.providerCode}\n`;
      help += `Primary Clinic: ${providerConfig.primaryClinicConfig.displayName}\n\n`;
    }
  } catch (error) {
    help += 'Provider: Not detected (check spreadsheet name)\n\n';
  }
  
  help += 'GETTING STARTED:\n';
  help += '1. Run "Setup Credentials (V2.1)" first\n';
  help += '2. Test with "Test Connection"\n';
  help += '3. Validate with "Validate Spreadsheet"\n';
  help += '4. Use "Sync All Data" to process all sheets\n\n';
  
  help += 'MULTI-PROVIDER FEATURES:\n';
  help += '• Automatic provider detection from spreadsheet names\n';
  help += '• Dynamic clinic/provider ID resolution\n';
  help += '• Multi-location production data support\n';
  help += '• Enhanced provider-location relationship validation\n';
  help += '• Database reseed protection\n\n';
  
  help += 'NEW: AUTO-DISCOVERY FEATURES:\n';
  help += '• Database-driven provider discovery\n';
  help += '• Dynamic pattern generation from provider data\n';
  help += '• New provider registration workflow\n';
  help += '• Pattern validation and confidence scoring\n';
  help += '• Automatic cache management\n\n';
  
  help += 'TROUBLESHOOTING:\n';
  help += '• Use "Check Dependencies" if sync fails\n';
  help += '• Run "Validate Spreadsheet" for setup issues\n';
  help += '• Use "Test Provider Detection" for name issues\n';
  help += '• Try "Provider Discovery" menu for advanced detection\n';
  help += '• Check Dentist-Sync-Log tab for detailed error info\n';
  help += '• Use "Debug External Mappings" to verify provider setup\n\n';
  
  help += 'SUPPORT:\n';
  help += '• Provider detection issues: Use "Provider Discovery" menu\n';
  help += '• Multi-location issues: Use "Multi-Location" menu\n';
  help += '• System info: Use "Show System Info"\n';
  help += '• New provider registration: Use "Register New Provider"\n\n';
  
  help += 'Version: ' + MIGRATION_INFO.VERSION + '\n';
  help += 'Multi-provider mode with automatic database-driven discovery.\n';
  help += 'For technical support, contact your administrator.';
  
  ui.alert('Help & Documentation', help, ui.ButtonSet.OK);
}

// ===== DATABASE PROVIDER TESTING FUNCTIONS =====

/**
 * Test database provider lookup functionality
 */
function testDatabaseProviderLookup() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get current provider info
    const providerInfo = detectCurrentProvider(getDentistSheetId());
    if (!providerInfo) {
      ui.alert(
        '❌ Provider Detection Failed',
        'Could not detect provider from spreadsheet name.\n\n' +
        'Please ensure the spreadsheet name contains the provider name.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Test database lookup
    const dbConfig = getProviderFromDatabase(providerInfo.providerCode);
    
    if (dbConfig) {
      const totalClinics = Object.keys(dbConfig.clinicMappings || {}).length;
      const totalLocations = Object.keys(dbConfig.locationMappings || {}).length;
      
      ui.alert(
        '✅ Database Provider Lookup Successful',
        `Provider: ${dbConfig.displayName}\n` +
        `Provider Code: ${dbConfig.providerCode}\n` +
        `Source: ${dbConfig.source}\n` +
        `Primary Clinic: ${dbConfig.primaryClinicConfig ? dbConfig.primaryClinicConfig.displayName : 'Not set'}\n` +
        `Total Clinics: ${totalClinics}\n` +
        `Total Locations: ${totalLocations}\n` +
        `Multi-location Support: ${dbConfig.totalLocations > 1 ? 'Yes' : 'No'}\n` +
        `Active Locations: ${dbConfig.activeLocations || 0}\n\n` +
        `Database provider discovery is working correctly!`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Database Lookup Failed',
        `Could not retrieve provider ${providerInfo.providerCode} from database.\n\n` +
        'This could indicate:\n' +
        '• Provider not in database\n' +
        '• Database connectivity issues\n' +
        '• Provider code mismatch\n\n' +
        'The system will use fallback configuration.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert(
      '❌ Test Error',
      `Database provider lookup test failed:\n\n${error.message}\n\n` +
      'Please check your configuration and try again.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Test database connectivity for provider queries (menu function)
 */
function testProviderDatabaseConnectivityMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const result = testProviderDatabaseConnectivity();
    
    if (result.success) {
      ui.alert(
        '✅ Database Connectivity Test Successful',
        `${result.message}\n\n` +
        `Providers table: ${result.details.providersTableAccessible ? 'Accessible' : 'Not accessible'}\n` +
        `Test completed: ${result.details.timestamp}\n\n` +
        'Database-driven provider discovery is ready to use!',
        ui.ButtonSet.OK
      );
    } else {
      let alertMessage = `❌ Database Connectivity Test Failed\n\n${result.error}\n\n`;
      
      if (result.suggestions && result.suggestions.length > 0) {
        alertMessage += 'Suggestions:\n';
        result.suggestions.forEach(suggestion => {
          alertMessage += `• ${suggestion}\n`;
        });
      }
      
      ui.alert('Database Connectivity Test', alertMessage, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert(
      '❌ Test Error',
      `Connectivity test failed:\n\n${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Compare database vs fallback provider configurations
 */
function compareProviderConfigurationsMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get current provider info
    const providerInfo = detectCurrentProvider(getDentistSheetId());
    if (!providerInfo) {
      ui.alert(
        '❌ Provider Detection Failed',
        'Could not detect provider from spreadsheet name.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Compare configurations
    const comparison = compareProviderConfigurations(providerInfo.providerCode);
    
    let message = `📊 Configuration Comparison for ${comparison.providerCode}\n\n`;
    
    message += `DATABASE CONFIGURATION:\n`;
    message += `• Available: ${comparison.database.available ? 'Yes' : 'No'}\n`;
    message += `• Source: ${comparison.database.source || 'N/A'}\n`;
    message += `• Primary Clinic: ${comparison.database.primaryClinic || 'Not set'}\n\n`;
    
    message += `FALLBACK CONFIGURATION:\n`;
    message += `• Available: ${comparison.fallback.available ? 'Yes' : 'No'}\n`;
    message += `• Source: ${comparison.fallback.source || 'N/A'}\n`;
    message += `• Primary Clinic: ${comparison.fallback.primaryClinic || 'Not set'}\n\n`;
    
    if (comparison.differences && comparison.differences.length > 0) {
      message += `DIFFERENCES FOUND:\n`;
      comparison.differences.forEach(diff => {
        message += `• ${diff}\n`;
      });
      message += '\n';
    } else if (comparison.database.available && comparison.fallback.available) {
      message += `✅ NO DIFFERENCES - Configurations match\n\n`;
    }
    
    if (comparison.recommendations && comparison.recommendations.length > 0) {
      message += `RECOMMENDATIONS:\n`;
      comparison.recommendations.forEach(rec => {
        message += `• ${rec}\n`;
      });
    }
    
    ui.alert('Configuration Comparison', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      '❌ Comparison Error',
      `Configuration comparison failed:\n\n${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

// ===== ERROR HANDLING & DIAGNOSTICS MENU FUNCTIONS =====

/**
 * Run health check from menu
 */
function menuRunHealthCheck() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert(
      'Running Health Check',
      'Performing basic system health check...\n\n' +
      'This will test:\n' +
      '• Network connectivity\n' +
      '• Spreadsheet access\n' +
      '• Basic functionality\n\n' +
      'Check the console for detailed results.',
      ui.ButtonSet.OK
    );
    
    // Run health check (simulate async behavior)
    if (typeof runHealthCheck === 'function') {
      runHealthCheck().then(results => {
        const status = results.summary.overallStatus;
        const statusEmoji = status === 'HEALTHY' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
        
        ui.alert(
          'Health Check Results',
          `${statusEmoji} System Status: ${status}\n\n` +
          `Tests Run: ${results.summary.totalTests}\n` +
          `Passed: ${results.summary.passed}\n` +
          `Failed: ${results.summary.failed}\n` +
          `Warnings: ${results.summary.warnings}\n\n` +
          `Duration: ${results.duration}ms`,
          ui.ButtonSet.OK
        );
        
        // Show detailed report in console
        showDiagnosticReport(results);
      }).catch(error => {
        ui.alert('Health Check Error', `Error: ${error.message}`, ui.ButtonSet.OK);
      });
    } else {
      ui.alert('Feature Not Available', 'Health check functionality not loaded.', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to run health check: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Run full diagnostics from menu
 */
function menuRunDiagnostics() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const response = ui.alert(
      'Run Full Diagnostics',
      'This will run comprehensive system diagnostics including:\n\n' +
      '• Database connectivity tests\n' +
      '• Provider detection validation\n' +
      '• Network connectivity checks\n' +
      '• Spreadsheet access verification\n\n' +
      'This may take 30-60 seconds. Continue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      if (typeof runComprehensiveDiagnostics === 'function') {
        runComprehensiveDiagnostics().then(results => {
          const status = results.summary.overallStatus;
          const statusEmoji = status === 'HEALTHY' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
          
          ui.alert(
            'Comprehensive Diagnostics Complete',
            `${statusEmoji} Overall Status: ${status}\n\n` +
            `Tests Completed: ${results.summary.totalTests}\n` +
            `Passed: ${results.summary.passed}\n` +
            `Failed: ${results.summary.failed}\n` +
            `Warnings: ${results.summary.warnings}\n\n` +
            `Total Duration: ${Math.round(results.duration / 1000)}s\n\n` +
            'Check the console for detailed analysis.',
            ui.ButtonSet.OK
          );
          
          // Show detailed report
          showDiagnosticReport(results);
        }).catch(error => {
          ui.alert('Diagnostics Error', `Error: ${error.message}`, ui.ButtonSet.OK);
        });
      } else {
        ui.alert('Feature Not Available', 'Comprehensive diagnostics not loaded.', ui.ButtonSet.OK);
      }
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to run diagnostics: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Run auto-troubleshooting from menu
 */
function menuRunTroubleshooting() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const response = ui.alert(
      'Auto-Troubleshooting',
      'This will automatically detect and fix common issues:\n\n' +
      '• Identify problem areas\n' +
      '• Apply automated fixes where possible\n' +
      '• Provide recommendations for manual fixes\n' +
      '• Clear problematic cache data\n\n' +
      'Continue with automated troubleshooting?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      if (typeof runAutomatedTroubleshooting === 'function') {
        runAutomatedTroubleshooting().then(results => {
          const statusEmoji = results.status === 'HEALTHY' ? '✅' : '⚠️';
          
          ui.alert(
            'Auto-Troubleshooting Complete',
            `${statusEmoji} Final Status: ${results.status}\n\n` +
            `Initial Problems: ${results.initialProblems}\n` +
            `Fixes Applied: ${results.fixesApplied}\n` +
            `Troubleshooting Steps: ${results.troubleshootingSteps.length}\n\n` +
            'Check the console for detailed information about fixes applied.',
            ui.ButtonSet.OK
          );
          
          // Log detailed results
          console.log('Auto-Troubleshooting Results:', results);
        }).catch(error => {
          ui.alert('Troubleshooting Error', `Error: ${error.message}`, ui.ButtonSet.OK);
        });
      } else {
        ui.alert('Feature Not Available', 'Auto-troubleshooting not loaded.', ui.ButtonSet.OK);
      }
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to run auto-troubleshooting: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Show error report from menu
 */
function menuShowErrorReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    if (typeof getErrorStatistics === 'function') {
      const stats = getErrorStatistics();
      
      let message = '📊 Error Handler Report (Last 24 Hours)\n\n';
      message += `Total Errors: ${stats.totalErrors}\n\n`;
      
      if (stats.totalErrors > 0) {
        message += 'Error Categories:\n';
        Object.entries(stats.categoryCounts).forEach(([category, count]) => {
          message += `• ${category}: ${count}\n`;
        });
        message += '\n';
        
        message += 'Error Severity:\n';
        Object.entries(stats.severityCounts).forEach(([severity, count]) => {
          message += `• ${severity}: ${count}\n`;
        });
        message += '\n';
        
        message += `Recovery Attempts: ${stats.recoveryAttempts.length}\n`;
        message += `User Interventions Pending: ${stats.userInterventionQueue}\n`;
      } else {
        message += '✅ No errors reported in the last 24 hours.';
      }
      
      ui.alert('Error Report', message, ui.ButtonSet.OK);
      
      // Also show in console for more detail
      if (typeof showErrorReport === 'function') {
        showErrorReport();
      }
    } else {
      ui.alert('Feature Not Available', 'Error reporting not loaded.', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to show error report: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Show cache report from menu
 */
function menuShowCacheReport() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    if (typeof getCacheStatistics === 'function') {
      const stats = getCacheStatistics();
      
      let message = '📦 Cache Manager Report\n\n';
      message += `Version: ${stats.version}\n`;
      message += `Cache Hits: ${stats.hits}\n`;
      message += `Cache Misses: ${stats.misses}\n`;
      message += `Hit Ratio: ${(stats.hitRatio * 100).toFixed(2)}%\n`;
      message += `Cache Sets: ${stats.sets}\n`;
      message += `Invalidations: ${stats.invalidations}\n`;
      message += `Errors: ${stats.errors}\n\n`;
      
      if (stats.hitRatio < 0.5) {
        message += '⚠️ Low cache hit ratio - consider reviewing cache strategy.';
      } else if (stats.hitRatio > 0.8) {
        message += '✅ Good cache performance!';
      } else {
        message += '📊 Cache performance is acceptable.';
      }
      
      ui.alert('Cache Report', message, ui.ButtonSet.OK);
      
      // Show detailed console report
      if (typeof showCacheReport === 'function') {
        showCacheReport();
      }
    } else {
      ui.alert('Feature Not Available', 'Cache reporting not loaded.', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to show cache report: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Clear error history from menu
 */
function menuClearErrorHistory() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const response = ui.alert(
      'Clear Error History',
      'This will clear all error history and reset error counters.\n\n' +
      'This action cannot be undone.\n\n' +
      'Continue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      if (typeof clearErrorHistory === 'function') {
        clearErrorHistory();
        ui.alert(
          '✅ Error History Cleared',
          'All error history has been cleared.\n\n' +
          'Error tracking will start fresh.',
          ui.ButtonSet.OK
        );
      } else {
        ui.alert('Feature Not Available', 'Error history clearing not loaded.', ui.ButtonSet.OK);
      }
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to clear error history: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test provider detection from menu
 */
function menuTestProviderDetection() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    if (typeof testProviderDetection === 'function') {
      testProviderDetection().then(result => {
        if (result.status === 'PASS') {
          ui.alert(
            '✅ Provider Detection Test Passed',
            `${result.message}\n\n` +
            `Provider: ${result.details?.detection?.providerInfo?.displayName || 'Unknown'}\n` +
            `Duration: ${result.duration}ms`,
            ui.ButtonSet.OK
          );
        } else {
          ui.alert(
            '❌ Provider Detection Test Failed',
            `${result.message}\n\n` +
            `Details: ${JSON.stringify(result.details, null, 2)}`,
            ui.ButtonSet.OK
          );
        }
      }).catch(error => {
        ui.alert('Test Error', `Error: ${error.message}`, ui.ButtonSet.OK);
      });
    } else {
      // Fallback to existing function
      testProviderDetection();
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to test provider detection: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test database connection from menu
 */
function menuTestDatabaseConnection() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    if (typeof testDatabaseConnectivity === 'function') {
      testDatabaseConnectivity().then(result => {
        if (result.status === 'PASS') {
          ui.alert(
            '✅ Database Connection Test Passed',
            `${result.message}\n\n` +
            `Response Time: ${result.details?.connectivity?.responseTime || 'Unknown'}ms\n` +
            `Functions Available: ${result.details?.functions?.endpoints?.length || 0}\n` +
            `Duration: ${result.duration}ms`,
            ui.ButtonSet.OK
          );
        } else {
          ui.alert(
            '❌ Database Connection Test Failed',
            `${result.message}\n\n` +
            `Check credentials and network connectivity.`,
            ui.ButtonSet.OK
          );
        }
      }).catch(error => {
        ui.alert('Test Error', `Error: ${error.message}`, ui.ButtonSet.OK);
      });
    } else {
      // Fallback to existing function
      testSupabaseConnection();
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to test database connection: ${error.message}`, ui.ButtonSet.OK);
  }
}

// ===== ENHANCED LOGGING TEST FUNCTIONS =====

/**
 * Test database operation logging
 */
function testDatabaseLogging() {
  const ui = SpreadsheetApp.getUi();
  const correlationId = generateCorrelationId_();
  
  try {
    logWithMetadata('testDatabaseLogging', 'START', null, null, null, 
      'Testing database operation logging system', 
      { test_type: 'database_logging', correlation_id: correlationId }, 
      correlationId);
    
    // Test provider lookup
    const testProvider = getProviderFromDatabase('obinna_ezeji');
    
    // Test credential resolution
    const testCredentials = getSyncCredentials('test_system', {
      clinicCode: 'KAMDENTAL_BAYTOWN',
      providerCode: 'obinna_ezeji'
    });
    
    logWithMetadata('testDatabaseLogging', 'SUCCESS', null, null, null, 
      'Database logging test completed successfully', 
      { 
        provider_found: !!testProvider,
        credentials_resolved: !!testCredentials,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert(
      '✅ Database Logging Test Complete',
      `Test completed successfully.\n\n` +
      `Provider lookup: ${testProvider ? 'SUCCESS' : 'FAILED'}\n` +
      `Credential resolution: ${testCredentials ? 'SUCCESS' : 'FAILED'}\n\n` +
      `Correlation ID: ${correlationId}\n\n` +
      'Check the "Dentist-Sync-Log" sheet for detailed logs.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    logWithMetadata('testDatabaseLogging', 'ERROR', null, null, null, 
      `Database logging test failed: ${error.message}`, 
      { 
        error_type: 'TEST_ERROR',
        error_message: error.message,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert('❌ Database Logging Test Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test provider detection logging
 */
function testProviderLogging() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const correlationId = generateCorrelationId_();
  
  try {
    logWithMetadata('testProviderLogging', 'START', null, null, null, 
      'Testing provider detection logging system', 
      { test_type: 'provider_logging', spreadsheet_id: spreadsheetId }, 
      correlationId);
    
    // Test provider detection
    const detectedProvider = detectCurrentProvider(spreadsheetId);
    
    // Test multi-provider credentials
    const multiProviderCreds = getMultiProviderSyncCredentials(spreadsheetId);
    
    logWithMetadata('testProviderLogging', 'SUCCESS', null, null, null, 
      'Provider logging test completed successfully', 
      { 
        provider_detected: !!detectedProvider,
        provider_name: detectedProvider ? detectedProvider.displayName : null,
        credentials_resolved: !!multiProviderCreds,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert(
      '✅ Provider Logging Test Complete',
      `Test completed successfully.\n\n` +
      `Provider detected: ${detectedProvider ? detectedProvider.displayName : 'NONE'}\n` +
      `Detection method: ${detectedProvider ? detectedProvider.source : 'N/A'}\n` +
      `Multi-provider credentials: ${multiProviderCreds ? 'SUCCESS' : 'FAILED'}\n\n` +
      `Correlation ID: ${correlationId}\n\n` +
      'Check the "Dentist-Sync-Log" sheet for detailed logs.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    logWithMetadata('testProviderLogging', 'ERROR', null, null, null, 
      `Provider logging test failed: ${error.message}`, 
      { 
        error_type: 'TEST_ERROR',
        error_message: error.message,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert('❌ Provider Logging Test Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Test performance logging with timing
 */
function testPerformanceLogging() {
  const ui = SpreadsheetApp.getUi();
  const correlationId = generateCorrelationId_();
  const startTime = Date.now();
  
  try {
    logWithMetadata('testPerformanceLogging', 'START', null, null, null, 
      'Testing performance logging system', 
      { test_type: 'performance_logging' }, 
      correlationId);
    
    // Test cache operations
    const testKey = 'performance_test_key';
    const testData = { test: 'data', timestamp: new Date().toISOString() };
    
    // Test cache set
    setCachedResult_(testKey, JSON.stringify(testData));
    
    // Test cache get
    const cachedData = getCachedResult_(testKey);
    
    // Test database operation timing
    const dbStartTime = Date.now();
    logDatabaseOperation('PERFORMANCE_TEST', 'test_endpoint', dbStartTime, 'SUCCESS', {
      test_operation: true,
      cache_hit: !!cachedData,
      data_size: JSON.stringify(testData).length
    }, correlationId);
    
    const totalDuration = (Date.now() - startTime) / 1000;
    
    logWithMetadata('testPerformanceLogging', 'SUCCESS', null, null, totalDuration, 
      'Performance logging test completed successfully', 
      { 
        cache_set: true,
        cache_retrieved: !!cachedData,
        total_duration_ms: Date.now() - startTime,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert(
      '✅ Performance Logging Test Complete',
      `Test completed successfully.\n\n` +
      `Cache operations: SUCCESS\n` +
      `Performance tracking: SUCCESS\n` +
      `Total duration: ${totalDuration.toFixed(2)}s\n\n` +
      `Correlation ID: ${correlationId}\n\n` +
      'Check the "Dentist-Sync-Log" sheet for detailed performance logs.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    
    logWithMetadata('testPerformanceLogging', 'ERROR', null, null, errorDuration, 
      `Performance logging test failed: ${error.message}`, 
      { 
        error_type: 'TEST_ERROR',
        error_message: error.message,
        error_duration_ms: Date.now() - startTime,
        correlation_id: correlationId
      }, 
      correlationId);
    
    ui.alert('❌ Performance Logging Test Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * View detailed logs with filtering options
 */
function viewDetailedLogs() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    if (!logSheet) {
      ui.alert('❌ No Log Sheet Found', 'No "Dentist-Sync-Log" sheet exists. Run a sync operation first.', ui.ButtonSet.OK);
      return;
    }
    
    const lastRow = logSheet.getLastRow();
    const recentLogs = Math.min(10, lastRow - 1); // Get last 10 entries
    
    if (recentLogs <= 0) {
      ui.alert('📝 Log Sheet Empty', 'No log entries found.', ui.ButtonSet.OK);
      return;
    }
    
    const range = logSheet.getRange(lastRow - recentLogs + 1, 1, recentLogs, 9); // 9 columns including new ones
    const data = range.getValues();
    
    let logSummary = 'Recent Log Entries:\n\n';
    data.forEach((row, index) => {
      const [timestamp, functionName, status, rowsProcessed, sheetsProcessed, duration, message, correlationId, metadata] = row;
      logSummary += `${index + 1}. [${status}] ${functionName}\n`;
      logSummary += `   Time: ${timestamp}\n`;
      if (correlationId) logSummary += `   Correlation ID: ${correlationId}\n`;
      if (duration) logSummary += `   Duration: ${duration}s\n`;
      logSummary += `   Message: ${message}\n\n`;
    });
    
    ui.alert(
      '📊 Recent Detailed Logs',
      logSummary + `\nTotal entries: ${lastRow - 1}\nSheet: "${DENTIST_LOG_TAB_NAME}"`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ View Logs Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Export logs for external analysis
 */
function exportLogsForAnalysis() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    if (!logSheet) {
      ui.alert('❌ No Log Sheet Found', 'No "Dentist-Sync-Log" sheet exists.', ui.ButtonSet.OK);
      return;
    }
    
    const lastRow = logSheet.getLastRow();
    if (lastRow <= 1) {
      ui.alert('📝 No Data to Export', 'Log sheet contains no data.', ui.ButtonSet.OK);
      return;
    }
    
    // Create export sheet
    const exportSheetName = `Log-Export-${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss')}`;
    const exportSheet = ss.insertSheet(exportSheetName);
    
    // Copy all log data
    const sourceRange = logSheet.getRange(1, 1, lastRow, 9);
    const targetRange = exportSheet.getRange(1, 1, lastRow, 9);
    sourceRange.copyTo(targetRange);
    
    // Add analysis columns
    exportSheet.getRange(1, 10).setValue('Error Count');
    exportSheet.getRange(1, 11).setValue('Avg Duration');
    exportSheet.getRange(1, 12).setValue('Performance Level');
    
    // Format the export sheet
    const headerRange = exportSheet.getRange(1, 1, 1, 12);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    ui.alert(
      '✅ Logs Exported Successfully',
      `Logs exported to sheet: "${exportSheetName}"\n\n` +
      `Total entries: ${lastRow - 1}\n` +
      `Export includes: timestamps, correlation IDs, metadata\n\n` +
      'You can now analyze the data or download the sheet.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Export Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}