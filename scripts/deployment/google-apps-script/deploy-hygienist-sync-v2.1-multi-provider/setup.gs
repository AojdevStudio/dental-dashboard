/**
 * Sets up hygiene sync: stores credentials, ensures log sheet, creates triggers.
 */
function setupHygieneSync() {
  const functionName = 'setupHygieneSync';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  try {
    logToHygieneSheet_(functionName, 'START', null, null, null, 'Setup process initiated.');
    Logger.log(`Starting ${functionName} for Sheet ID: ${getHygieneSheetId()}...`);

    // Sheet ID is now dynamic - no need to check configuration
    // getHygieneSheetId() will automatically get the current active spreadsheet

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

    // Ensure provider information is set - This section seems to be legacy 
    // as Provider ID is handled by setSupabaseCredentials_ and getSupabaseCredentials_.
    // const providerInfo = getProviderInfo_();
    // if (!providerInfo) {
    //   Logger.log('Provider information not found, attempting to set it...');
    //   if (!setProviderInfo_()) {
    //     Logger.log('Provider setup cancelled or failed.');
    //     logToHygieneSheet_(functionName, 'ERROR', null, null, null, 'Provider setup cancelled or failed.');
    //     return;
    //   }
    //   Logger.log('Provider information successfully set.');
    // }

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

    Logger.log(`${functionName} completed successfully. Triggers created for Sheet ID: ${getHygieneSheetId()}.`);
    logToHygieneSheet_(functionName, 'SUCCESS', null, null, null, 'Setup complete. Triggers created.');
    
    ui.alert('🎉 Hygiene Sync Setup Successful!\n\n✅ Credentials stored\n✅ Log sheet created\n✅ Triggers set up\n✅ UUIDs seeded\n\nYour hygiene data will now sync automatically!');

  } catch (err) {
    const errorMsg = `${functionName} failed: ${err.message}`;
    Logger.log(`${errorMsg}\n${err.stack}`);
    logToHygieneSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert('❌ Hygiene Sync Setup FAILED!\n\nCheck Execution Logs and Hygiene-Sync-Log tab for details.');
  }
}

/**
 * Clear all triggers (utility function)
 */
function clearAllTriggers() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('⚠️ Clear All Triggers', 
    'Are you sure you want to delete ALL triggers for this script?\n\nThis will stop automatic syncing.', 
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    ui.alert('✅ All triggers cleared.\n\nTo re-enable automatic sync, run "1. Setup Sync" again.');
    logToHygieneSheet_('clearAllTriggers', 'SUCCESS', null, null, null, `Cleared ${triggers.length} triggers.`);
  }
}

/**
 * Delete triggers by function name
 * @param {string} functionName - Name of the function to delete triggers for
 * @param {Spreadsheet} ss - The spreadsheet object
 */
function deleteTriggersByHandler_(functionName /*, ss */) { // ss parameter is unused
  const triggers = ScriptApp.getProjectTriggers();
  let deletedCount = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === functionName) {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      } catch (err) {
        Logger.log(`Warning: Could not delete trigger for ${functionName}: ${err.message}`);
      }
    }
  });
  
  if (deletedCount > 0) {
    Logger.log(`Deleted ${deletedCount} existing triggers for ${functionName}`);
  }
}