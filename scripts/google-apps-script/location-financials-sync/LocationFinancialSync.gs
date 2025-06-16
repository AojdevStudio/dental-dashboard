/**
 * ========================================
 * LOCATION FINANCIAL SYNC - MAIN MENU
 * ========================================
 * Main entry points for location-based financial data synchronization
 * These functions appear in the Google Apps Script function dropdown
 * for easy point-and-click access.
 */

/**
 * Creates the custom menu when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Location Financial Sync')
    .addItem('🔧 1. First Time Setup', 'setupLocationFinancialSync')
    .addSeparator()
    .addItem('▶️ 2. Sync All Locations', 'syncAllLocationFinancialData')
    .addItem('🏢 3. Sync Baytown Only', 'syncBaytownFinancialData')
    .addItem('🏢 4. Sync Humble Only', 'syncHumbleFinancialData')
    .addSeparator()
    .addItem('🔍 5. Validate Data Format', 'validateLocationFinancialData')
    .addItem('🧪 6. Test API Connection', 'testLocationFinancialConnection')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 View & Manage')
      .addItem('📋 View Sync Logs', 'viewLocationFinancialSyncLogs')
      .addItem('📈 Get Sync Statistics', 'getLocationFinancialSyncStatistics')
      .addItem('🧹 Clear Old Logs', 'clearOldLocationFinancialLogs'))
    .addSubMenu(ui.createMenu('⚙️ Advanced')
      .addItem('⏰ Setup Auto-Sync', 'setupLocationFinancialTriggers')
      .addItem('⏹️ Stop Auto-Sync', 'clearLocationFinancialTriggers')
      .addItem('🔄 Reset Configuration', 'resetLocationFinancialConfiguration')
      .addItem('📤 Export Data Preview', 'exportLocationFinancialDataPreview'))
    .addToUi();
}

/**
 * 🔧 1. FIRST TIME SETUP
 * Sets up credentials, validates configuration, and initializes sync
 */
function setupLocationFinancialSync() {
  try {
    // Check if sheet ID is configured
    if (LOCATION_FINANCIAL_SHEET_ID === 'your-location-financial-sheet-id-here') {
      const ui = SpreadsheetApp.getUi();
      ui.alert(
        '⚠️ Configuration Required',
        'Please update the LOCATION_FINANCIAL_SHEET_ID in Config.gs with your actual Google Sheet ID before running setup.',
        ui.ButtonSet.OK
      );
      return;
    }

    logLocationFinancialOperation('SETUP', 'Starting first-time setup process');
    
    // Run the setup wizard
    const success = runLocationFinancialSetupWizard();
    
    if (success) {
      SpreadsheetApp.getUi().alert(
        '✅ Setup Complete!',
        'Location Financial Sync has been configured successfully. You can now use the sync functions.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      logLocationFinancialOperation('SETUP', 'Setup completed successfully');
    }
    
  } catch (error) {
    logLocationFinancialError('SETUP', 'Setup failed', error);
    SpreadsheetApp.getUi().alert(`❌ Setup Error: ${error.message}\n\nPlease check the execution logs.`);
  }
}

/**
 * ▶️ 2. SYNC ALL LOCATIONS
 * Synchronizes financial data for all configured locations
 */
function syncAllLocationFinancialData() {
  try {
    logLocationFinancialOperation('SYNC_ALL', 'Starting sync for all locations');
    
    const startTime = new Date();
    const results = processAllLocationFinancialData();
    const duration = new Date() - startTime;
    
    // Show success message with summary
    const ui = SpreadsheetApp.getUi();
    const summary = formatLocationFinancialSyncSummary(results, duration);
    
    ui.alert('✅ Sync Complete', summary, ui.ButtonSet.OK);
    logLocationFinancialOperation('SYNC_ALL', `Sync completed in ${duration}ms`, results);
    
  } catch (error) {
    logLocationFinancialError('SYNC_ALL', 'Sync failed for all locations', error);
    SpreadsheetApp.getUi().alert(`❌ Sync Error: ${error.message}\n\nPlease check the sync logs for details.`);
  }
}

/**
 * 🏢 3. SYNC BAYTOWN ONLY
 * Synchronizes financial data for Baytown location only
 */
function syncBaytownFinancialData() {
  try {
    logLocationFinancialOperation('SYNC_BAYTOWN', 'Starting sync for Baytown location');
    
    const startTime = new Date();
    const results = processLocationFinancialData('Baytown');
    const duration = new Date() - startTime;
    
    const ui = SpreadsheetApp.getUi();
    const summary = formatLocationFinancialSyncSummary(results, duration);
    
    ui.alert('✅ Baytown Sync Complete', summary, ui.ButtonSet.OK);
    logLocationFinancialOperation('SYNC_BAYTOWN', `Baytown sync completed in ${duration}ms`, results);
    
  } catch (error) {
    logLocationFinancialError('SYNC_BAYTOWN', 'Baytown sync failed', error);
    SpreadsheetApp.getUi().alert(`❌ Baytown Sync Error: ${error.message}\n\nPlease check the sync logs for details.`);
  }
}

/**
 * 🏢 4. SYNC HUMBLE ONLY
 * Synchronizes financial data for Humble location only
 */
function syncHumbleFinancialData() {
  try {
    logLocationFinancialOperation('SYNC_HUMBLE', 'Starting sync for Humble location');
    
    const startTime = new Date();
    const results = processLocationFinancialData('Humble');
    const duration = new Date() - startTime;
    
    const ui = SpreadsheetApp.getUi();
    const summary = formatLocationFinancialSyncSummary(results, duration);
    
    ui.alert('✅ Humble Sync Complete', summary, ui.ButtonSet.OK);
    logLocationFinancialOperation('SYNC_HUMBLE', `Humble sync completed in ${duration}ms`, results);
    
  } catch (error) {
    logLocationFinancialError('SYNC_HUMBLE', 'Humble sync failed', error);
    SpreadsheetApp.getUi().alert(`❌ Humble Sync Error: ${error.message}\n\nPlease check the sync logs for details.`);
  }
}

/**
 * 🔍 5. VALIDATE DATA FORMAT
 * Validates the current sheet data format without syncing
 */
function validateLocationFinancialData() {
  try {
    logLocationFinancialOperation('VALIDATE', 'Starting data validation');
    
    const validation = validateLocationFinancialSheetData();
    const ui = SpreadsheetApp.getUi();
    
    if (validation.isValid) {
      ui.alert(
        '✅ Data Validation Passed',
        `✅ ${validation.validRecords} valid records found\n` +
        `📊 Locations detected: ${validation.locations.join(', ')}\n` +
        `📅 Date range: ${validation.dateRange.start} to ${validation.dateRange.end}`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Data Validation Issues',
        `❌ ${validation.errors.length} errors found:\n\n` +
        validation.errors.slice(0, 5).join('\n') +
        (validation.errors.length > 5 ? `\n... and ${validation.errors.length - 5} more` : ''),
        ui.ButtonSet.OK
      );
    }
    
    logLocationFinancialOperation('VALIDATE', 'Data validation completed', validation);
    
  } catch (error) {
    logLocationFinancialError('VALIDATE', 'Data validation failed', error);
    SpreadsheetApp.getUi().alert(`❌ Validation Error: ${error.message}`);
  }
}

/**
 * 🧪 6. TEST API CONNECTION
 * Tests the connection to the LocationFinancial API endpoint
 */
function testLocationFinancialConnection() {
  try {
    logLocationFinancialOperation('TEST_CONNECTION', 'Testing API connection');
    
    const testResult = testLocationFinancialApiConnection();
    const ui = SpreadsheetApp.getUi();
    
    if (testResult.success) {
      ui.alert(
        '✅ Connection Test Successful',
        `✅ API endpoint is accessible\n` +
        `🌐 Response time: ${testResult.responseTime}ms\n` +
        `📊 API version: ${testResult.apiVersion || 'Unknown'}`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Connection Test Failed',
        `❌ ${testResult.error}\n\n` +
        `Please check your configuration and credentials.`,
        ui.ButtonSet.OK
      );
    }
    
    logLocationFinancialOperation('TEST_CONNECTION', 'API connection test completed', testResult);
    
  } catch (error) {
    logLocationFinancialError('TEST_CONNECTION', 'Connection test failed', error);
    SpreadsheetApp.getUi().alert(`❌ Connection Test Error: ${error.message}`);
  }
}

/**
 * Trigger function for real-time sync on sheet edits
 * This function is automatically called when the sheet is edited
 */
function onEditLocationFinancialSync(e) {
  try {
    // Only sync if edit is in a relevant range
    if (!isLocationFinancialEditRelevant(e)) {
      return;
    }
    
    logLocationFinancialOperation('REAL_TIME_SYNC', 'Edit detected, starting real-time sync');
    
    // Determine which location was edited
    const location = detectLocationFromEdit(e);
    
    if (location) {
      // Sync only the affected location
      const results = processLocationFinancialData(location);
      logLocationFinancialOperation('REAL_TIME_SYNC', `Real-time sync completed for ${location}`, results);
    } else {
      // Sync all locations if location cannot be determined
      const results = processAllLocationFinancialData();
      logLocationFinancialOperation('REAL_TIME_SYNC', 'Real-time sync completed for all locations', results);
    }
    
  } catch (error) {
    logLocationFinancialError('REAL_TIME_SYNC', 'Real-time sync failed', error);
    // Don't show alert for real-time sync errors to avoid interrupting user workflow
  }
}

/**
 * Helper function to format sync summary for user display
 */
function formatLocationFinancialSyncSummary(results, duration) {
  const totalRecords = results.reduce((sum, location) => sum + (location.recordsProcessed || 0), 0);
  const totalErrors = results.reduce((sum, location) => sum + (location.errors || 0), 0);
  const locations = results.map(r => r.location).join(', ');
  
  return `📊 ${totalRecords} records processed\n` +
         `🏢 Locations: ${locations}\n` +
         `⏱️ Duration: ${Math.round(duration / 1000)}s\n` +
         (totalErrors > 0 ? `⚠️ Errors: ${totalErrors}` : '✅ No errors');
}

/**
 * Helper function to check if an edit is relevant for sync
 */
function isLocationFinancialEditRelevant(e) {
  if (!e || !e.range) return false;
  
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  
  // Check if the sheet matches location patterns
  return LOCATION_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
}

/**
 * Helper function to detect which location was edited
 */
function detectLocationFromEdit(e) {
  if (!e || !e.range) return null;
  
  const sheetName = e.range.getSheet().getName();
  
  // Check Baytown patterns
  if (/^(BT|Baytown|BAYTOWN)/i.test(sheetName) || /\s*(BT|Baytown|BAYTOWN)/i.test(sheetName)) {
    return 'Baytown';
  }
  
  // Check Humble patterns  
  if (/^(HM|Humble|HUMBLE)/i.test(sheetName) || /\s*(HM|Humble|HUMBLE)/i.test(sheetName)) {
    return 'Humble';
  }
  
  return null;
}