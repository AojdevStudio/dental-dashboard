/**
 * Sets up Supabase sync: stores credentials, ensures log sheet, creates time & edit triggers.
 * Associates triggers with the specific Master Sheet.
 */
function setupSupabaseSync() {
  const functionName = 'setupSupabaseSync';
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const ui = SpreadsheetApp.getUi(); // Get UI from the context where setup is run

  try {
    logToSupabaseSheet_(functionName, 'START', null, null, null, 'Setup process initiated.');
    Logger.log(`Starting ${functionName} for Sheet ID: ${MASTER_SHEET_ID}...`);

    // Ensure Log Sheet exists
    ensureLogSheet_();

    // Ensure credentials are set
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      Logger.log('Credentials not found, attempting to set them...');
      if (!setSupabaseCredentials_()) {
        Logger.log('Credential setup cancelled or failed.');
        logToSupabaseSheet_(functionName, 'ERROR', null, null, null, 'Credential setup cancelled or failed.');
        // No alert here as setSupabaseCredentials_ gives feedback
        return;
      }
      // Re-fetch credentials if they were just set
      if (!getSupabaseCredentials_()) {
          const errMsg = 'Setup failed: Could not retrieve credentials after setting them.';
          Logger.log(errMsg);
          logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
          ui.alert(errMsg);
          return;
      }
       Logger.log('Credentials successfully set.');
    }

    // --- Reinstall Triggers ---
    Logger.log('Setting up triggers...');
    // 1. Time-Driven Trigger (runs every 6 hours)
    // This trigger runs for the script project, which is bound to the sheet.
    // It does NOT use .forSpreadsheet()
    deleteTriggersByHandler_(SYNC_FUNCTION_NAME_SUPABASE, ss); // Still check triggers associated with this sheet
    ScriptApp.newTrigger(SYNC_FUNCTION_NAME_SUPABASE)
      // .forSpreadsheet(ss) // <-- REMOVED: Not used for time-based triggers
      .timeBased()
      .everyHours(6)
      .create();
    Logger.log('Time-driven trigger created.');

    // 2. onEdit Trigger
    // This trigger IS spreadsheet-specific and uses .forSpreadsheet()
    deleteTriggersByHandler_(ON_EDIT_FUNCTION_NAME_SUPABASE, ss); // Remove existing edit triggers for this sheet
    ScriptApp.newTrigger(ON_EDIT_FUNCTION_NAME_SUPABASE)
      .forSpreadsheet(ss) // <-- CORRECT: Bind edit trigger to this specific sheet
      .onEdit()
      .create();
    Logger.log('onEdit trigger created.');
    // --- End Triggers ---

    // --- Seed Missing UUIDs ---
    seedMissingUuids_();

    // --- Setup Location Sync Triggers ---
    try {
      setupLocationSyncTriggers_();
      Logger.log('Location sync triggers set up successfully.');
    } catch (locErr) {
      Logger.log(`Warning: Location sync trigger setup failed: ${locErr.message}`);
      // Continue with setup - this is not critical
    }

    Logger.log(`${functionName} completed successfully. Triggers created for Sheet ID: ${MASTER_SHEET_ID}.`);
    logToSupabaseSheet_(functionName, 'SUCCESS', null, null, null, 'Setup complete. Log sheet ensured, Triggers created.');
    ui.alert('Supabase Sync Setup Successful! Log sheet checked/created, and Time + Edit triggers created for this sheet.');

  } catch (err) {
    const errorMsg = `${functionName} failed: ${err.message}`; // Keep it concise for sheet log
    Logger.log(`${errorMsg}\n${err.stack}`);
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    // Consider adding email notification here if needed
    ui.alert('Supabase Sync Setup FAILED! Check Execution Logs and Supabase-Sync-Log tab for details.');
  }
}