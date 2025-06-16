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
    .addItem('🔧 1. Setup Credentials & IDs', 'menuSetupHygieneSync')
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
  const hasShownWelcome = scriptProperties.getProperty(HYGIENE_WELCOME_SHOWN_PROPERTY_KEY);
  
  if (!hasShownWelcome) {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.alert(
      '🦷 Welcome to Hygiene Sync!',
      'I see this is your first time using Hygiene Sync.\n\n' +
      '📋 Quick Start:\n' +
      '1. Click "Hygiene Sync" menu above\n' +
      '2. Select "🔧 1. Setup Credentials & IDs"\n' +
      '3. Follow the setup wizard\n\n' +
      'Would you like to run setup now?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      menuSetupHygieneSync();
    }
    
    // Mark welcome as shown
    scriptProperties.setProperty(HYGIENE_WELCOME_SHOWN_PROPERTY_KEY, 'true');
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
    // Call the actual setupHygieneSync function (expected to be in setup.gs)
    // Ensure setupHygieneSync is globally unique or correctly referenced if namespacing were strict.
    // In Apps Script, top-level functions in .gs files are typically in the global scope.
    setupHygieneSync(); 
  } catch (error) {
    const errorMsg = `Setup failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    // It might be redundant to log here if setupHygieneSync already logs comprehensively.
    // However, keeping a specific log for the menu invocation can be useful.
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
    '• Run "Setup Credentials & IDs" to configure credentials and provider info\n' +
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