/**
 * @fileoverview Setup module for the Adriane Hygienist Sync application.
 * 
 * This module contains functions for setting up and initializing the application:
 * - Initial configuration and validation
 * - UUID column creation and management
 * - Log sheet setup
 * - Master sheet header setup
 * - Trigger installation and configuration
 * 
 * The setup module ensures that all prerequisites are in place before
 * the application can run properly, providing a reliable foundation for
 * the sync process.
 */

/**
 * Performs initial setup tasks:
 * - Ensures the UUID column exists in all valid monthly source sheets.
 * - Seeds UUIDs for any existing rows that are missing them.
 * - Ensures the log sheet exists in the master sheet.
 * - Sets up the time-driven trigger for the main sync function.
 * - Sets up the on-edit trigger for the source sheet.
 * Logs success or failure to the Apps Script Logger and notifies via email on failure.
 * This function is portable and can be run manually or via trigger.
 */
function Setup() {
  const functionName = SETUP_FUNCTION_NAME; // Use constant
  try {
    Logger.log(`Starting ${functionName}...`);
    ensureUuidColumnForAllMonths_();
    seedAllMissingUuids_();
    ensureLogSheet_();
    ensureMasterHeaders_();
    reinstallTrigger_(SYNC_FUNCTION_NAME, 6); // Use constant // Run sync every 6 hours
    reinstallEditTrigger_(); // Internally uses EDIT_HANDLER_FUNCTION_NAME
    Logger.log(`${functionName} completed successfully.`);
    // --- IMPROVEMENT: Removed SpreadsheetApp.getUi().alert() for portability ---
    // Check Apps Script execution logs (View -> Executions) for success confirmation.
    // ---------------------------------------------------------------------------
  } catch (err) {
    Logger.log(`${functionName} failed: ${err.message}\n${err.stack}`);
    notifyError_(functionName, err);
    // --- IMPROVEMENT: Removed SpreadsheetApp.getUi().alert() for portability ---
    // Failure is logged above and an email notification is sent via notifyError_.
    // Check Apps Script execution logs or email for failure details.
    // ---------------------------------------------------------------------------
  }
}

/**
 * Ensures the UUID column exists and has the correct header in all valid monthly sheets
 * within the source spreadsheet. Inserts the column if missing.
 */
function ensureUuidColumnForAllMonths_() {
  Logger.log('Ensuring UUID column exists in source sheets...');
  const ss = SpreadsheetApp.openById(SOURCE_SHEET_ID);
  if (!ss) {
    throw new Error(`Cannot ensure UUID columns: Source Spreadsheet not found or inaccessible (ID: ${SOURCE_SHEET_ID})`);
  }
  for (const sheet of ss.getSheets()) { // Use for...of
    const sheetName = sheet.getName();
    if (!isMonthlySheet_(sheetName)) continue; // Skip non-monthly sheets

    const lastCol = sheet.getLastColumn();
    let uuidHeader = '';
    // Check if UUID_COL_INDEX is within current sheet bounds before trying to read header
    if (lastCol >= UUID_COL_INDEX && SOURCE_HEADER_ROW <= sheet.getLastRow() && SOURCE_HEADER_ROW > 0) {
      try {
        uuidHeader = sheet.getRange(SOURCE_HEADER_ROW, UUID_COL_INDEX).getValue().toString().trim();
      } catch (e) {
        Logger.log(`Warning: Could not read header at [${SOURCE_HEADER_ROW}, ${UUID_COL_INDEX}] in sheet "${sheetName}": ${e.message}`);
        // Continue, as the column might need inserting anyway
      }
    }

    // If column doesn't exist or header is wrong/missing
    if (lastCol < UUID_COL_INDEX || uuidHeader.toLowerCase() !== 'uuid') {
      // Ensure SOURCE_HEADER_ROW is valid before trying to write to it
      if (SOURCE_HEADER_ROW <= 0) {
        Logger.log(`Skipping UUID column check for sheet "${sheetName}": SOURCE_HEADER_ROW (${SOURCE_HEADER_ROW}) is invalid.`);
        return;
      }
      // Ensure the sheet has enough rows for the header
      if (sheet.getMaxRows() < SOURCE_HEADER_ROW) {
        sheet.insertRowsAfter(sheet.getMaxRows(), SOURCE_HEADER_ROW - sheet.getMaxRows());
        Logger.log(`Inserted rows in sheet "${sheetName}" to accommodate header row ${SOURCE_HEADER_ROW}.`);
      }

      try {
        // Check if the column index exists but needs header update, or needs insertion
        if (lastCol >= UUID_COL_INDEX) {
          sheet.getRange(SOURCE_HEADER_ROW, UUID_COL_INDEX).setValue('UUID');
          Logger.log(`Updated header in column ${UUID_COL_INDEX} to "UUID" in sheet "${sheetName}".`);
        } else {
          // Need to insert columns up to the required index if it's far beyond the last column
          if (UUID_COL_INDEX > 1) {
            // Ensure the preceding column exists before inserting *after* it
            if (lastCol < UUID_COL_INDEX - 1) {
              // Insert multiple columns if needed - more robust
              const colsToAdd = UUID_COL_INDEX - lastCol;
              sheet.insertColumnsAfter(lastCol, colsToAdd);
              Logger.log(`Inserted ${colsToAdd} column(s) after column ${lastCol} in sheet "${sheetName}".`);
            } else {
              // Insert just one column after the preceding one
              sheet.insertColumnAfter(UUID_COL_INDEX - 1);
              Logger.log(`Inserted column after column ${UUID_COL_INDEX - 1} in sheet "${sheetName}".`);
            }
            // Now set the header in the newly ensured column UUID_COL_INDEX
            sheet.getRange(SOURCE_HEADER_ROW, UUID_COL_INDEX).setValue('UUID');
            Logger.log(`Set header "UUID" in new column ${UUID_COL_INDEX} in sheet "${sheetName}".`);

          } else { // UUID_COL_INDEX is 1
            sheet.insertColumnBefore(1);
            sheet.getRange(SOURCE_HEADER_ROW, UUID_COL_INDEX).setValue('UUID'); // UUID_COL_INDEX is 1 here
            Logger.log(`Inserted UUID column (1) and header in sheet "${sheetName}".`);
          }
        }
        SpreadsheetApp.flush(); // Apply changes immediately if needed, though often not necessary here
      } catch (e) {
        Logger.log(`Error trying to add/update UUID column in sheet "${sheetName}": ${e.message}`);
        // Decide if this should throw and stop setup, or just log and continue
        // Consider adding notifyError_ here if this failure is critical
      }
    }
  } // End for...of loop
  Logger.log('UUID column check completed.');
}

/**
 * Ensures the log sheet exists in the master spreadsheet with the correct headers.
 * Creates the sheet if it doesn't exist.
 */
function ensureLogSheet_() {
  Logger.log(`Ensuring log sheet "${LOG_TAB_NAME}" exists...`);
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  if (!ss) {
    throw new Error(`Cannot ensure log sheet: Master Spreadsheet not found or inaccessible (ID: ${MASTER_SHEET_ID})`);
  }
  let logSheet = ss.getSheetByName(LOG_TAB_NAME);

  const expectedHeaders = [
    'Timestamp', 'Status', 'Rows Inspected', 'Skipped (No UUID)',
    'Skipped (Duplicate)', 'Rows Added', 'Duration (s)', 'Error Message'
  ];

  if (!logSheet) {
    logSheet = ss.insertSheet(LOG_TAB_NAME);
    Logger.log(`Created log sheet "${LOG_TAB_NAME}".`);
    logSheet.appendRow(expectedHeaders); // appendRow automatically adds row after last content
    logSheet.setFrozenRows(1);
    logSheet.getRange("A1:H1").setFontWeight("bold");
    try { // setColumnWidths can fail if sheet protection exists
      logSheet.setColumnWidths(1, expectedHeaders.length, 150);
    } catch (e) {
      Logger.log(`Warning: Could not set column widths for log sheet "${LOG_TAB_NAME}". ${e.message}`);
    }
  } else {
    // Verify headers if sheet exists
    let headersOk = false;
    if (logSheet.getLastRow() >= 1) { // Check if header row exists
      const headerRange = logSheet.getRange(1, 1, 1, Math.min(expectedHeaders.length, logSheet.getLastColumn()));
      const currentHeaders = headerRange.getValues()[0];
      // Simple length check first
      headersOk = currentHeaders.length === expectedHeaders.length;
      // Deep comparison if length matches
      if (headersOk) {
        headersOk = currentHeaders.every((val, index) => val === expectedHeaders[index]);
      }
    }

    if (!headersOk) {
      Logger.log(`Log sheet "${LOG_TAB_NAME}" found, but headers are missing or incorrect. Resetting headers.`);
      // Ensure enough columns exist before setting values
      if(logSheet.getMaxColumns() < expectedHeaders.length) {
        logSheet.insertColumns(logSheet.getMaxColumns() + 1, expectedHeaders.length - logSheet.getMaxColumns());
      }
      // Clear existing header range and set new ones
      logSheet.getRange(1, 1, 1, logSheet.getMaxColumns()).clearContent(); // Clear entire first row
      logSheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);

      logSheet.setFrozenRows(1);
      logSheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold");
      try { // setColumnWidths can fail if sheet protection exists
        logSheet.setColumnWidths(1, expectedHeaders.length, 150);
      } catch (e) {
        Logger.log(`Warning: Could not set column widths for log sheet "${LOG_TAB_NAME}" after resetting headers. ${e.message}`);
      }
      // Optionally clear old data below incorrect headers:
      // if (logSheet.getLastRow() > 1) {
      //    logSheet.getRange(2, 1, logSheet.getLastRow()-1, expectedHeaders.length).clearContent();
      // }
    }
  }
  Logger.log(`Log sheet "${LOG_TAB_NAME}" is ready.`);
}

/**
 * Ensures the master "Data" tab has the correct header row.
 * Overwrites row 1 with the expected column names.
 */
function ensureMasterHeaders_() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sh = ss.getSheetByName(MASTER_TAB_NAME);
  if (!sh) {
    throw new Error(`ensureMasterHeaders_: Tab "${MASTER_TAB_NAME}" not found.`);
  }
  const expected = [
    'date',
    'hours_worked',
    'location',
    'provider_name',
    'provider_type',
    'source_sheet',
    'production_goal_daily',
    'verified_production',
    'bonus',
    'humble_production',
    'baytown_production',
    'monthly_goal',
    'external_id',
    'uuid'
  ];
  // Ensure enough columns exist
  if (sh.getLastColumn() < expected.length) {
    sh.insertColumnsAfter(sh.getLastColumn(), expected.length - sh.getLastColumn());
  }
  sh.getRange(1, 1, 1, expected.length).setValues([expected]);
}