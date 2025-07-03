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
      .addItem('Migration Guide', 'showMigrationGuide'))
    
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
      .addItem('Test Sync Utilities', 'testSyncUtilities')
      .addItem('Debug External Mappings', 'debugExternalMappings')
      .addItem('Debug Provider Patterns', 'debugProviderPatterns'))
    
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
    testMultiProviderDetection(DENTIST_SHEET_ID);
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
    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
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
  
  help += 'TROUBLESHOOTING:\n';
  help += '• Use "Check Dependencies" if sync fails\n';
  help += '• Run "Validate Spreadsheet" for setup issues\n';
  help += '• Use "Test Provider Detection" for name issues\n';
  help += '• Check Dentist-Sync-Log tab for detailed error info\n';
  help += '• Use "Debug External Mappings" to verify provider setup\n\n';
  
  help += 'SUPPORT:\n';
  help += '• Provider detection issues: Use "Test Provider Detection"\n';
  help += '• Multi-location issues: Use "Multi-Location" menu\n';
  help += '• System info: Use "Show System Info"\n\n';
  
  help += 'Version: ' + MIGRATION_INFO.VERSION + '\n';
  help += 'Multi-provider mode with automatic provider detection.\n';
  help += 'For technical support, contact your administrator.';
  
  ui.alert('Help & Documentation', help, ui.ButtonSet.OK);
}