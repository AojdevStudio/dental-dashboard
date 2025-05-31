/**
 * Adds a custom menu to the spreadsheet UI for Supabase sync operations.
 * Runs automatically when the spreadsheet is opened.
 */
function onOpen() {
  // Use openById to ensure menu appears even if script is opened from a different context,
  // but only add menu if the active sheet IS the master sheet.
  try {
      if (SpreadsheetApp.getActiveSpreadsheet().getId() === MASTER_SHEET_ID) {
        const ui = SpreadsheetApp.getUi();

        // Main Supabase Sync menu
        ui.createMenu('Supabase Sync')
          .addItem('1. Setup Sync (Credentials & Triggers)', 'setupSupabaseSync')
          .addItem('2. Run Full Sync Now', 'syncMasterSheetToSupabase')
          .addItem('3. Sync Selected Row to Supabase', 'syncSelectedRowToSupabase')
          .addItem('4. Seed Missing UUIDs', 'seedMissingUuids_')
          .addSeparator()
          .addSubMenu(ui.createMenu('Location Production')
            .addItem('Sync All Location Data', 'syncAllLocationData')
            .addItem('Sync Baytown Data', 'syncBaytownData')
            .addItem('Sync Humble Data', 'syncHumbleData')
            .addSeparator()
            .addItem('Debug Column Headers', 'debugLocationSheetColumns')
            .addItem('Count Rows for Sync', 'countLocationSheetRows'))
          .addToUi();
      }
  } catch (e) {
      // Avoid errors if script runs in context without active spreadsheet access (e.g., trigger)
      Logger.log(`onOpen error (expected during trigger runs): ${e.message}`);
  }
}