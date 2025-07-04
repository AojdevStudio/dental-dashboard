/**
 * ===== HYGIENIST SYNC MENU V2 (RESILIENT) =====
 * 
 * Updated menu system for resilient hygienist production sync
 * Provider-specific configuration for Adriane Fontenot
 * 
 * @version 2.0.0
 * @provider adriane_fontenot
 * @requires shared-sync-utils.gs
 */

/**
 * Creates the Hygienist Sync V2 menu in Google Sheets
 * Called automatically when the spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🦷 Hygiene Sync V2')
    .addSubMenu(ui.createMenu('🔧 Setup & Configuration')
      .addItem('1. Setup Credentials (V2)', 'setSupabaseCredentials_')
      .addItem('2. Test Connection', 'testSupabaseConnection')
      .addItem('3. Check Dependencies', 'checkSharedSyncUtilities')
      .addSeparator()
      .addItem('Show System Info', 'showSystemInfo')
      .addItem('Migration Guide', 'showMigrationGuide'))
    
    .addSubMenu(ui.createMenu('▶️ Sync Operations')
      .addItem('Sync All Data', 'syncAllHygieneData')
      .addItem('Sync Current Sheet', 'syncCurrentSheetData')
      .addSeparator()
      .addItem('Clear All Logs', 'clearAllLogs_'))
    
    .addSubMenu(ui.createMenu('🔍 Testing & Debug')
      .addItem('Test Credential Resolution', 'testCredentialResolution_')
      .addItem('Test Column Mapping', 'testColumnMapping')
      .addItem('Test Provider Extraction', 'testProviderNameExtraction')
      .addSeparator()
      .addItem('Test Sync Utilities', 'testSyncUtilities')
      .addItem('Debug External Mappings', 'debugExternalMappings'))
    
    .addSubMenu(ui.createMenu('⚙️ Advanced')
      .addItem('Setup Triggers', 'setupHygieneTriggers')
      .addItem('Remove Triggers', 'removeHygieneTriggers')
      .addSeparator()
      .addItem('Export Logs', 'exportSyncLogs')
      .addItem('Validate Data Integrity', 'validateDataIntegrity'))
    
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
    const result = syncSheetData_(activeSheet, sheetName);
    const ui = SpreadsheetApp.getUi();
    
    if (result.success) {
      ui.alert(
        'Sync Complete',
        `Successfully synced "${sheetName}" for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}:\n\n` +
        `• Records processed: ${result.recordsAttempted || 0}\n` +
        `• Records synced: ${result.recordsSynced || 0}\n` +
        `• Skipped/Failed: ${result.recordsFailedOrSkipped || 0}\n\n` +
        'Check the Hygiene-Sync-Log tab for details.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'Sync Failed',
        `Failed to sync "${sheetName}" for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}:\n\n${result.message}\n\n` +
        'Check the Hygiene-Sync-Log tab for error details.',
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
 * Debug external mappings for the hygienist sync system
 */
function debugExternalMappings() {
  try {
    const mappings = getSystemMappings('hygienist_sync');
    
    let info = '🔍 Hygienist Sync External Mappings\n\n';
    info += `Provider: ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}\n`;
    info += `System: ${HYGIENIST_SYNC_CONFIG.SYSTEM_NAME}\n\n`;
    
    if (mappings && mappings.length > 0) {
      info += `Found ${mappings.length} mappings:\n\n`;
      mappings.forEach(mapping => {
        info += `• ${mapping.external_identifier} → ${mapping.entity_type}:${mapping.entity_id}\n`;
        info += `  Status: ${mapping.is_active ? 'Active' : 'Inactive'}\n`;
        info += `  Notes: ${mapping.notes || 'None'}\n\n`;
      });
      
      // Check if expected mappings are present
      const expectedMappings = Object.keys(HYGIENIST_SYNC_CONFIG.EXTERNAL_MAPPINGS);
      const foundMappings = mappings.map(m => m.external_identifier);
      const missingMappings = expectedMappings.filter(expected => !foundMappings.includes(expected));
      
      if (missingMappings.length > 0) {
        info += `⚠️ Missing expected mappings:\n`;
        missingMappings.forEach(missing => {
          info += `• ${missing}\n`;
        });
        info += '\n';
      }
    } else {
      info += 'No external mappings found.\n\n';
      info += 'This may indicate:\n';
      info += '• Database not properly seeded for hygienist_sync\n';
      info += '• Connection issues\n';
      info += '• Missing shared sync utilities\n';
      info += '• External mapping system not configured for Adriane\n';
    }
    
    SpreadsheetApp.getUi().alert('External Mappings Debug', info, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Debug Error',
      `Could not retrieve external mappings: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Validate data integrity across the hygienist sync system
 */
function validateDataIntegrity() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    'Data Integrity Validation',
    `Starting comprehensive data integrity check for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}...\n\n` +
    'This will verify:\n' +
    '• Credential resolution\n' +
    '• Database connectivity\n' +
    '• External mappings for Adriane\n' +
    '• Column mappings\n' +
    '• Sample data parsing\n\n' +
    'Check the Hygiene-Sync-Log tab for detailed results.',
    ui.ButtonSet.OK
  );
  
  logToHygieneSheet_('validateDataIntegrity', 'START', 0, 0, null, 'Data integrity validation initiated for Adriane');
  
  let issues = [];
  let validations = 0;
  
  try {
    // 1. Test credentials
    validations++;
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      issues.push('Credential resolution failed for Adriane');
    } else {
      logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, 'Credentials resolved successfully for Adriane');
    }
    
    // 2. Test database connection
    validations++;
    if (credentials) {
      const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}?limit=1`;
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.key}`,
          'apikey': credentials.key,
          'Content-Type': 'application/json'
        },
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() !== 200) {
        issues.push(`Database connection failed: ${response.getResponseCode()}`);
      } else {
        logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, 'Database connection verified for hygiene_production');
      }
    }
    
    // 3. Test external mappings for Adriane
    validations++;
    try {
      const mappings = getSystemMappings('hygienist_sync');
      if (!mappings || mappings.length === 0) {
        issues.push('No external mappings found for hygienist_sync');
      } else {
        // Check for specific Adriane mappings
        const expectedMappings = Object.keys(HYGIENIST_SYNC_CONFIG.EXTERNAL_MAPPINGS);
        const foundMappings = mappings.map(m => m.external_identifier);
        const missingMappings = expectedMappings.filter(expected => !foundMappings.includes(expected));
        
        if (missingMappings.length > 0) {
          issues.push(`Missing Adriane mappings: ${missingMappings.join(', ')}`);
        } else {
          logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, `Found all ${mappings.length} external mappings for Adriane`);
        }
      }
    } catch (error) {
      issues.push(`External mapping check failed: ${error.message}`);
    }
    
    // 4. Test column mapping on sample sheets
    validations++;
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    const sheets = ss.getSheets();
    let foundValidSheet = false;
    
    for (const sheet of sheets.slice(0, 5)) { // Check first 5 sheets
      const sheetName = sheet.getName();
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      
      if (isMonthTab) {
        try {
          const headerInfo = getSheetHeaders_(sheet);
          const mapping = mapHeaders_(headerInfo.headers);
          
          if (mapping.date === -1) {
            issues.push(`Sheet "${sheetName}" missing date column mapping`);
          } else {
            foundValidSheet = true;
            logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, `Sheet "${sheetName}" column mapping valid for Adriane`);
          }
        } catch (error) {
          issues.push(`Sheet "${sheetName}" mapping error: ${error.message}`);
        }
        break; // Only test one sheet
      }
    }
    
    if (!foundValidSheet) {
      issues.push('No valid month tabs found for testing');
    }
    
    // 5. Test shared sync utilities
    validations++;
    try {
      if (typeof getSyncCredentials !== 'function' || typeof getHygienistSyncCredentials !== 'function') {
        issues.push('Shared sync utilities not available');
      } else {
        logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, 'Shared sync utilities available for Adriane');
      }
    } catch (error) {
      issues.push(`Shared sync utilities test failed: ${error.message}`);
    }
    
    // 6. Test provider-specific configuration
    validations++;
    if (credentials && credentials.providerId) {
      logToHygieneSheet_('validateDataIntegrity', 'INFO', 0, 0, null, `Provider ID resolved for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}: ${credentials.providerId}`);
    } else {
      issues.push(`Provider ID not resolved for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}`);
    }
    
    // Report results
    const status = issues.length === 0 ? 'SUCCESS' : 'WARNING';
    const message = issues.length === 0 
      ? `All ${validations} validation checks passed for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}`
      : `${issues.length} issues found in ${validations} checks: ${issues.join(', ')}`;
    
    logToHygieneSheet_('validateDataIntegrity', status, validations, issues.length, null, message);
    
    ui.alert(
      'Validation Complete',
      `Data integrity validation for ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}:\n\n` +
      `• Checks performed: ${validations}\n` +
      `• Issues found: ${issues.length}\n\n` +
      (issues.length > 0 ? `Issues:\n${issues.join('\n')}\n\n` : '') +
      'See Hygiene-Sync-Log tab for full details.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    logToHygieneSheet_('validateDataIntegrity', 'ERROR', validations, 0, null, `Validation failed: ${error.message}`);
    ui.alert('Validation Error', `Validation failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Show migration guide for upgrading from V1 to V2
 */
function showMigrationGuide() {
  const ui = SpreadsheetApp.getUi();
  
  let guide = '🚀 Hygienist Sync V1 → V2 Migration Guide\n\n';
  guide += `Provider: ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}\n`;
  guide += `System: ${HYGIENIST_SYNC_CONFIG.SYSTEM_NAME}\n\n`;
  
  guide += 'BEFORE YOU START:\n';
  guide += '• Backup your current Apps Script project\n';
  guide += '• Note your current Supabase URL and Service Role Key\n';
  guide += '• Verify this is Adriane\'s hygiene production spreadsheet\n\n';
  
  guide += 'MIGRATION STEPS:\n';
  guide += '1. Copy shared-sync-utils.gs to your project\n';
  guide += '2. Replace config.gs with the V2 version\n';
  guide += '3. Update HYGIENE_SHEET_ID in config.gs\n';
  guide += '4. Replace credentials.gs with the V2 version\n';
  guide += '5. Replace menu.gs with the V2 version\n';
  guide += '6. Save and refresh your project\n';
  guide += '7. Run "Setup Credentials (V2)" from the menu\n';
  guide += '8. Test the new system with "Test Connection"\n\n';
  
  guide += 'KEY CHANGES:\n';
  guide += '• No more hard-coded clinic/provider IDs\n';
  guide += '• Automatic ID resolution for Adriane via external mappings\n';
  guide += '• Resilient to database reseeds\n';
  guide += '• Enhanced error handling and logging\n';
  guide += '• Provider-specific configuration\n\n';
  
  guide += 'REMOVED REQUIREMENTS:\n';
  guide += '• HYGIENE_CLINIC_ID property (auto-resolved)\n';
  guide += '• HYGIENE_PROVIDER_ID property (auto-resolved)\n';
  guide += '• Manual ID updates after database changes\n\n';
  
  guide += 'Need help? Check the documentation or contact support.';
  
  ui.alert('Migration Guide', guide, ui.ButtonSet.OK);
}

/**
 * Show help and documentation
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  
  let help = '📚 Hygienist Sync V2 Help\n\n';
  help += `Provider: ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.name}\n`;
  help += `Specialization: ${HYGIENIST_SYNC_CONFIG.PROVIDER_INFO.specialization}\n\n`;
  
  help += 'GETTING STARTED:\n';
  help += '1. Run "Setup Credentials (V2)" first\n';
  help += '2. Test with "Test Connection"\n';
  help += '3. Use "Sync All Data" to process all sheets\n\n';
  
  help += 'NEW FEATURES:\n';
  help += '• Automatic clinic/provider ID resolution for Adriane\n';
  help += '• Database reseed protection\n';
  help += '• Provider-specific external mapping system\n';
  help += '• Enhanced testing and debugging tools\n';
  help += '• Improved error handling\n\n';
  
  help += 'TROUBLESHOOTING:\n';
  help += '• Use "Check Dependencies" if sync fails\n';
  help += '• Run "Validate Data Integrity" for comprehensive checks\n';
  help += '• Check Hygiene-Sync-Log tab for detailed error info\n';
  help += '• Use "Debug External Mappings" to verify Adriane\'s mappings\n\n';
  
  help += 'SUPPORT:\n';
  help += '• Migration issues: Use "Migration Guide"\n';
  help += '• System info: Use "Show System Info"\n';
  help += '• Debug mappings: Use "Debug External Mappings"\n\n';
  
  help += 'Version: ' + HYGIENIST_MIGRATION_INFO.VERSION + '\n';
  help += 'Provider-specific configuration active.\n';
  help += 'For technical support, contact your administrator.';
  
  ui.alert('Help & Documentation', help, ui.ButtonSet.OK);
}