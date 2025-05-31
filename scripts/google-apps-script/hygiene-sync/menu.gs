/**
 * ========================================
 * CUSTOM SPREADSHEET MENU SYSTEM
 * ========================================
 * Creates a custom menu in the Google Sheet toolbar
 * Users can access all sync functions directly from the sheet
 */

/**
 * Called automatically when the spreadsheet opens
 * Creates the custom "Hygiene Sync" menu in the sheet toolbar
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🦷 Hygiene Sync')
    .addItem('🔧 1. First Time Setup', 'menuSetupHygieneSync')
    .addSeparator()
    .addItem('▶️ 2. Sync All Data Now', 'menuSyncAllData')
    .addItem('🔍 3. Test Connection', 'menuTestConnection')
    .addSeparator()
    .addItem('🧪 4. Test Provider Name', 'testProviderNameExtraction')
    .addItem('🔍 5. Test Column Mapping', 'testColumnMapping')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 View & Manage')
      .addItem('📈 View Sync Statistics', 'getSyncStatistics')
      .addItem('📋 Check Trigger Status', 'checkTriggerStatus')
      .addItem('🧹 Clear Old Logs', 'clearOldLogs')
      .addItem('💾 Create Data Backup', 'createDataBackup')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Advanced')
      .addItem('🔄 Seed Missing UUIDs', 'seedMissingUuids')
      .addItem('✅ Validate Sheet Structure', 'validateSheetStructure')
      .addItem('🧪 Test Edit Trigger', 'testOnEditTrigger')
      .addItem('📤 Export Logs as CSV', 'exportLogsAsCsv')
    )
    .addSeparator()
    .addItem('⏹️ Stop Auto Sync', 'clearAllTriggers')
    .addToUi();
    
  // Show welcome message on first open
  showWelcomeMessage();
}

/**
 * Shows a welcome message with quick start instructions
 */
function showWelcomeMessage() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const hasShownWelcome = scriptProperties.getProperty('HYGIENE_WELCOME_SHOWN');
  
  if (!hasShownWelcome) {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.alert(
      '🦷 Welcome to Hygiene Sync!',
      'I see this is your first time using Hygiene Sync.\n\n' +
      '📋 Quick Start:\n' +
      '1. Click "Hygiene Sync" menu above\n' +
      '2. Select "🔧 1. First Time Setup"\n' +
      '3. Follow the setup wizard\n\n' +
      'Would you like to run setup now?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      menuSetupHygieneSync();
    }
    
    // Mark welcome as shown
    scriptProperties.setProperty('HYGIENE_WELCOME_SHOWN', 'true');
  }
}

/**
 * Alternative menu for users who prefer the classic layout
 */
function createClassicMenu() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Hygiene Sync')
    .addItem('1. Setup Sync', 'setupHygieneSync')
    .addItem('2. Sync Data', 'syncAllHygieneData')
    .addItem('3. Test Connection', 'testSupabaseConnection')
    .addItem('4. View Statistics', 'getSyncStatistics')
    .addItem('5. Clear Triggers', 'clearAllTriggers')
    .addToUi();
}

/**
 * Menu function: Complete setup with enhanced provider tracking
 */
function menuSetupHygieneSync() {
  try {
    // Call the actual setupHygieneSync function from setup.gs
    const functionName = 'setupHygieneSync';
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    const ui = SpreadsheetApp.getUi();
    let totalRowsProcessed = 0;
    let totalSheets = 0;
    const startTime = Date.now();

    logToHygieneSheet_(functionName, 'START', 0, 0, null, 'Full sync initiated.');
    Logger.log(`Starting ${functionName} for Sheet ID: ${HYGIENE_SHEET_ID}...`);

    // Check configuration
    if (!HYGIENE_SHEET_ID || HYGIENE_SHEET_ID === 'YOUR_HYGIENE_SHEET_ID_HERE') {
      const errMsg = 'Error: HYGIENE_SHEET_ID constant is not set in config.gs';
      Logger.log(errMsg);
      logToHygieneSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
      ui.alert(errMsg);
      return;
    }

    // Ensure Log Sheet exists
    ensureLogSheet_();

    // Ensure credentials are set
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      Logger.log('Credentials not found, attempting to set them...');
      if (!setSupabaseCredentials_()) {
        Logger.log('Credential setup cancelled or failed.');
        logToHygieneSheet_(functionName, 'ERROR', null, null, null, 'Credential setup cancelled or failed.');
        return;
      }
      // Re-fetch credentials if they were just set
      if (!getSupabaseCredentials_()) {
        const errMsg = '❌ Setup failed: Could not retrieve credentials after setting them.';
        Logger.log(errMsg);
        logToHygieneSheet_(functionName, 'ERROR', null, null, null, errMsg);
        ui.alert(errMsg);
        return;
      }
      Logger.log('Credentials successfully set.');
    }

    // Provider names are now automatically extracted from sheet names - no setup needed!

    // Test connection
    try {
      testSupabaseConnection();
    } catch (testErr) {
      Logger.log(`Warning: Connection test failed: ${testErr.message}`);
      // Continue with setup - user will see the test results
    }

    // Setup triggers
    Logger.log('Setting up triggers...');
    
    // 1. Time-Driven Trigger (runs every 6 hours)
    deleteTriggersByHandler_(SYNC_FUNCTION_NAME, ss);
    ScriptApp.newTrigger(SYNC_FUNCTION_NAME)
      .timeBased()
      .everyHours(6)
      .create();
    Logger.log('Time-driven trigger created.');

    // 2. onEdit Trigger
    deleteTriggersByHandler_(ON_EDIT_FUNCTION_NAME, ss);
    ScriptApp.newTrigger(ON_EDIT_FUNCTION_NAME)
      .forSpreadsheet(ss)
      .onEdit()
      .create();
    Logger.log('onEdit trigger created.');

    // Seed Missing UUIDs
    seedMissingUuids();

    Logger.log(`${functionName} completed successfully. Triggers created for Sheet ID: ${HYGIENE_SHEET_ID}.`);
    logToHygieneSheet_(functionName, 'SUCCESS', null, null, null, 'Setup complete. Triggers created.');
    
    ui.alert('🎉 Hygiene Sync Setup Successful!\n\n✅ Credentials stored\n✅ Provider name auto-detection enabled\n✅ Log sheet created\n✅ Triggers set up\n✅ UUIDs seeded\n\nYour hygiene data will now sync automatically with provider names!');

  } catch (error) {
    const errorMsg = `Setup failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    logToHygieneSheet_('menuSetupHygieneSync', 'ERROR', null, null, null, errorMsg);
    SpreadsheetApp.getUi().alert('❌ Hygiene Sync Setup FAILED!\n\nCheck Execution Logs and Hygiene-Sync-Log tab for details.');
  }
}

/**
 * Menu function: Manual data sync
 */
function menuSyncAllData() {
  try {
    syncAllHygieneData(); // Calls the actual function in sync.gs
  } catch (error) {
    Logger.log(`Menu sync error: ${error.message}`);
    SpreadsheetApp.getUi().alert(`❌ Sync Error: ${error.message}`);
  }
}

/**
 * Menu function: Test database connection
 */
function menuTestConnection() {
  try {
    testSupabaseConnection(); // Calls the actual function in credentials.gs
  } catch (error) {
    Logger.log(`Menu test error: ${error.message}`);
    SpreadsheetApp.getUi().alert(`❌ Connection Test Error: ${error.message}`);
  }
}

/**
 * Menu function: View comprehensive sync statistics
 */
function menuViewStatistics() {
  try {
    getSyncStatistics(); // Calls the actual function in utils.gs
  } catch (error) {
    Logger.log(`Menu stats error: ${error.message}`);
    SpreadsheetApp.getUi().alert(`❌ Statistics Error: ${error.message}`);
  }
}



/**
 * Shows help information about the sync system
 */
function showHelpInfo() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🦷 Hygiene Sync Help',
    '📋 Setup Process:\n' +
    '• Run "First Time Setup" to configure credentials and provider info\n' +
    '• Optionally set Dashboard URL for enhanced features\n' +
    '• Use "Sync All Data Now" for manual syncing\n\n' +
    '🔄 Automatic Sync:\n' +
    '• Runs every 6 hours after setup\n' +
    '• Triggers when you edit cells\n' +
    '• Check "View Sync Statistics" for status\n\n' +
    '❓ Need Help?\n' +
    '• Check the "Hygiene-Sync-Log" tab for detailed logs\n' +
    '• Use "Test Connection" to verify setup\n' +
    '• Use "Stop Auto Sync" if you need to pause'
  );
}