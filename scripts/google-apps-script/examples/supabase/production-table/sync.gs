/**
 * Fetches data from the Master sheet's 'Data' tab and upserts it to Supabase.
 * Operates specifically on the MASTER_SHEET_ID.
 */
function syncMasterSheetToSupabase() {
  const functionName = SYNC_FUNCTION_NAME_SUPABASE;
  const ui = SpreadsheetApp.getUi(); // For alerts
  let rowsProcessed = 0;
  let totalRows = 0;
  let batchesSent = 0;
  const startTime = Date.now();

  logToSupabaseSheet_(functionName, 'START', 0, 0, null, 'Full sync initiated.');
  Logger.log(`Starting ${functionName} for Sheet ID: ${MASTER_SHEET_ID}...`);

  if (!MASTER_SHEET_ID || MASTER_SHEET_ID === 'YOUR_MASTER_SHEET_ID_HERE') {
       const errMsg = 'Error: MASTER_SHEET_ID constant is not set in the script.';
       Logger.log(errMsg);
       logToSupabaseSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
       ui.alert('Error: MASTER_SHEET_ID is not configured in the script. Please edit the script file.');
       return;
  }

  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
    logToSupabaseSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    ui.alert(errMsg);
    return;
  }

  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = ss.getSheetByName(MASTER_DATA_TAB_NAME);
  if (!sheet) {
    const errMsg = `Error: Sheet "${MASTER_DATA_TAB_NAME}" not found in spreadsheet ${MASTER_SHEET_ID}.`;
    Logger.log(errMsg);
    logToSupabaseSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    ui.alert(`Error: Sheet "${MASTER_DATA_TAB_NAME}" not found.`);
    return;
  }

  const dataRange = sheet.getDataRange();
  const allValues = dataRange.getValues();

  const dataRows = allValues.slice(1);
  totalRows = dataRows.length;

  // Get timezone once
  const timeZone = Session.getScriptTimeZone();

  try {
    for (let i = 0; i < totalRows; i += SUPABASE_BATCH_SIZE) {
      const batch = dataRows.slice(i, i + SUPABASE_BATCH_SIZE);
      const payload = [];
      let currentBatchRowCount = 0;

      // Use for...of loop instead of forEach
      for (const row of batch) {
        currentBatchRowCount++;
        // Pass only rowData and timeZone - no headers/indices needed
        const record = mapSheetRowToSupabaseRecord_(row, timeZone);
        // Check if record and uuid exist (uuid check is now inside mapping)
        if (record) {
          payload.push(record);
        } else {
            // Log will happen inside mapSheetRowToSupabaseRecord_ if invalid
            Logger.log(`Skipping row index ${i + currentBatchRowCount -1} due to mapping error or missing UUID.`);
        }
      }

      if (payload.length > 0) {
        const batchNum = batchesSent + 1;
        const batchStartTime = Date.now();
        const responseData = sendBatchToSupabase_(payload, credentials, batchNum);
        const batchEndTime = Date.now();
        const batchDuration = batchEndTime - batchStartTime;

        if (responseData.success) {
            Logger.log(`Batch ${batchNum} successful. Response Code: ${responseData.code}. Duration: ${batchDuration}ms`);
            logToSupabaseSheet_(functionName, 'BATCH_SUCCESS', payload.length, batch.length, batchDuration, `Batch ${batchNum} sent successfully.`);
            rowsProcessed += payload.length;
        } else {
             const batchErrMsg = `Error sending Batch ${batchNum}. Code: ${responseData.code}. Body: ${responseData.body?.substring(0, 500)}`; // Log snippet
             Logger.log(batchErrMsg);
             logToSupabaseSheet_(functionName, 'BATCH_ERROR', 0, batch.length, batchDuration, batchErrMsg);
             // Consider stopping or retrying based on the error
             ui.alert(`Error syncing batch ${batchNum}. Check Execution Logs & Log Sheet for details (Code: ${responseData.code}).`);
             // Optionally throw an error to stop further processing
        }
        batchesSent++;
      } else {
          Logger.log(`Skipping batch starting at row index ${i} as no valid records with UUIDs were found.`);
      }

    } // end for loop (batches)

    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    const successMsg = `Sync completed. Processed ${rowsProcessed} valid rows out of ${totalRows} total data rows in ${batchesSent} batches. Total time: ${totalDuration}ms.`;
    Logger.log(successMsg);
    logToSupabaseSheet_(functionName, 'SUCCESS', rowsProcessed, totalRows, totalDuration, successMsg);
    // Optional: Add success alert only if run manually?
    // ui.alert(successMsg);

  } catch (err) {
    const errorMsg = `${functionName} failed: ${err.message}`; // Keep it concise for sheet log
    Logger.log(`${errorMsg}\n${err.stack}`);
    logToSupabaseSheet_(functionName, 'ERROR', rowsProcessed, totalRows, Date.now() - startTime, errorMsg);
    // Consider adding email notification here
     ui.alert('Sync FAILED! Check Execution Logs and Supabase-Sync-Log tab for details.');
  }
}

/**
 * Syncs only the currently selected row to Supabase using hardcoded indices.
 */
function syncSelectedRowToSupabase() {
    const functionName = 'syncSelectedRowToSupabase';
    const ui = SpreadsheetApp.getUi();
    let rowNumber = 0;
    const startTime = Date.now();

    logToSupabaseSheet_(functionName, 'START', 0, 1, null, 'Manual single row sync initiated.');
    Logger.log(`Starting ${functionName} for Sheet ID: ${MASTER_SHEET_ID}...`);

    // Basic configuration and credential checks
    if (!MASTER_SHEET_ID || MASTER_SHEET_ID === 'YOUR_MASTER_SHEET_ID_HERE') {
        const errMsg = 'Error: MASTER_SHEET_ID is not configured in the script.';
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
        ui.alert(errMsg);
        return;
    }
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
        const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
        ui.alert(errMsg);
        return;
    }
    const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(MASTER_DATA_TAB_NAME);
    if (!sheet) {
        const errMsg = `Error: Sheet "${MASTER_DATA_TAB_NAME}" not found.`;
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
        ui.alert(errMsg);
        return;
    }

    // Range and row validation
    const activeRange = ss.getActiveRange();
    if (!activeRange) {
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, 'No range selected.');
        ui.alert('Please select a row to sync.');
        return;
    }
    if (activeRange.getSheet().getName() !== MASTER_DATA_TAB_NAME) {
        const errMsg = `Incorrect sheet selected. Please select on "${MASTER_DATA_TAB_NAME}".`;
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
        ui.alert(errMsg);
        return;
    }
    const startRow = activeRange.getRow();
    const numRows = activeRange.getNumRows();
    rowNumber = startRow; // For logging
    if (startRow === 1) {
        logToSupabaseSheet_(functionName, 'INFO', 0, 1, null, 'Header row selected. Sync skipped.');
        ui.alert('Cannot sync the header row. Please select a data row.');
        return;
    }
     if (numRows > 1) {
        logToSupabaseSheet_(functionName, 'ERROR', 0, numRows, null, 'Multiple rows selected.');
        ui.alert('Please select only a single data row to sync.');
        return;
    }

    // Get Timezone
    const timeZone = Session.getScriptTimeZone();

    // Map data using hardcoded indices
    const rowData = activeRange.getValues()[0];
    const record = mapSheetRowToSupabaseRecord_(rowData, timeZone);

    // Check if mapping was successful (includes uuid check)
    if (!record) {
        const errMsg = `Selected row ${startRow} could not be mapped or is missing 'uuid' (check column M). Cannot sync.`; // Adjusted message
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
        ui.alert(errMsg);
        return;
    }

    const payload = [record]; // Send as an array

    // Send to Supabase
    try {
        const responseData = sendBatchToSupabase_(payload, credentials, `Manual Sync Row ${rowNumber}`);
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (responseData.success) {
          const successMsg = `Row ${rowNumber} sync successful. Code: ${responseData.code}. Duration: ${duration}ms`;
          Logger.log(successMsg);
          logToSupabaseSheet_(functionName, 'SUCCESS', 1, 1, duration, successMsg);
          ui.alert(`Row ${rowNumber} synced successfully to Supabase!`);
        } else {
          const errorMsg = `Error syncing row ${rowNumber}. Code: ${responseData.code}. Body: ${responseData.body?.substring(0, 500)}`;
          Logger.log(errorMsg);
          logToSupabaseSheet_(functionName, 'ERROR', 0, 1, duration, errorMsg);
          ui.alert(`Error syncing row ${rowNumber}. Check Logs & Log Sheet (Code: ${responseData.code}).`);
        }

    } catch (err) { // Catch errors from sendBatchToSupabase_ if they are re-thrown
        // Revert to template literal as preferred by linter in this context
        const errorMsg = `${functionName} failed for row ${startRow}: ${err.message}`;
        Logger.log(`${errorMsg}\n${err.stack}`);
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, Date.now() - startTime, errorMsg);
        ui.alert(`Sync FAILED for row ${startRow}! Check Logs & Log Sheet.`);
    }
}

/**
 * Triggered function on sheet edits. Syncs row if it has a UUID.
 * UUIDs should only be generated in source sheets, not in the master sheet.
 * Uses hardcoded indices.
 * @param {Object} e The event object.
 */
function onEditSupabaseSync(e) {
    const functionName = ON_EDIT_FUNCTION_NAME_SUPABASE;
    const range = e.range;
    const sheet = range.getSheet();
    const editedRow = range.getRow();
    // const editedCol = range.getColumn(); // Keep if needed for more complex logic
    const ssId = sheet.getParent().getId();

    // --- Pre-checks ---
    if (ssId !== MASTER_SHEET_ID || sheet.getName() !== MASTER_DATA_TAB_NAME) {
        return; // Edit outside target sheet/spreadsheet
    }
    if (editedRow === 1) {
        return; // Ignore header row edits
    }
    // --- End Pre-checks ---

    const UUID_COL_INDEX = 12; // Column M (0-indexed)
    const DATE_COL_INDEX = 0;  // Column A (0-indexed) - used to check if row has key data

    try {
        // Get the entire row's current data AFTER the edit might have occurred
        const rowRange = sheet.getRange(editedRow, 1, 1, sheet.getLastColumn());
        const currentRowData = rowRange.getValues()[0];

        const dateValue = currentRowData[DATE_COL_INDEX];
        const uuidValue = currentRowData[UUID_COL_INDEX];

        // --- UUID Validation Logic ---
        // Check if a key field (like date) has data and if UUID is missing
        if (dateValue && !uuidValue) {
            // Double-check in case of race condition
            const currentUuidInCell = sheet.getRange(editedRow, UUID_COL_INDEX + 1).getValue();
            if (!currentUuidInCell) {
                // Alert about missing UUID instead of generating one
                const ui = SpreadsheetApp.getUi();
                const message = `WARNING: Row ${editedRow} has data but is missing a UUID.\n\n` +
                                `UUIDs should only be generated in source sheets, not in the master sheet.\n` +
                                `This row will not be synced to Supabase until it has a valid UUID.`;
                ui.alert('Missing UUID Detected', message, ui.ButtonSet.OK);
                Logger.log(`onEdit: Row ${editedRow} has data but is missing a UUID. Not syncing.`);
                logToSupabaseSheet_(functionName, 'WARNING', 0, 1, null, `Row ${editedRow} has data but is missing a UUID. Not syncing.`);
                return;
            } else {
                // UUID was somehow added between reading and writing, use existing one
                currentRowData[UUID_COL_INDEX] = currentUuidInCell;
                Logger.log(`onEdit: UUID found for row ${editedRow} during check, using existing: ${currentUuidInCell}.`);
            }
        } else if (!dateValue && !uuidValue) {
             // If there's no date and no UUID, don't sync or log errors yet.
             // Row is likely incomplete.
             Logger.log(`onEdit: Skipping sync for row ${editedRow}. No date and no UUID found.`);
             return;
        }
        // --- End UUID Validation ---


        // Proceed with sync only if the row seems valid (has UUID now or had one before)
        if (currentRowData[UUID_COL_INDEX]) {
            // Log start *after* potential UUID generation
             logToSupabaseSheet_(functionName, 'START', 0, 1, null, `Edit detected in row ${editedRow}${uuidWasGenerated ? ' (UUID generated)' : ''}.`);
             Logger.log(`Starting ${functionName} sync for edit in Sheet ID: ${MASTER_SHEET_ID}, Row: ${editedRow}...`);


            const credentials = getSupabaseCredentials_();
            if (!credentials) {
                const errMsg = 'Supabase credentials not set. Cannot perform onEdit sync.';
                logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg);
                Logger.log(errMsg);
                return;
            }

            const timeZone = Session.getScriptTimeZone();

            // Map data using hardcoded indices - uses potentially updated currentRowData
            const record = mapSheetRowToSupabaseRecord_(currentRowData, timeZone);

            if (!record) {
                // Mapping failed (likely due to missing UUID *despite* checks, or other issue)
                const errMsg = `Edited row ${editedRow} could not be mapped. Ensure required data exists. Not syncing.`;
                logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errMsg); // Changed INFO to ERROR as mapping should succeed here
                Logger.log(errMsg);
                return;
            }

            // --- Sync the single record ---
            const startTime = Date.now();
            const responseData = sendBatchToSupabase_([record], credentials, `onEdit Row ${editedRow}`);
            const endTime = Date.now();
            const duration = endTime - startTime;

            if (responseData.success) {
                const successMsg = `Row ${editedRow} sync successful via onEdit. Code: ${responseData.code}. Duration: ${duration}ms`;
                Logger.log(successMsg);
                logToSupabaseSheet_(functionName, 'SUCCESS', 1, 1, duration, successMsg);
            } else {
                const errorMsg = `Error syncing row ${editedRow} via onEdit. Code: ${responseData.code}. Body: ${responseData.body?.substring(0, 500)}`;
                Logger.log(errorMsg);
                logToSupabaseSheet_(functionName, 'ERROR', 0, 1, duration, errorMsg);
            }
            // --- End Sync ---
        } else {
             // This case should ideally not be hit if the logic above is correct
             Logger.log(`onEdit: Skipping sync for row ${editedRow}. UUID still missing after checks.`);
             logToSupabaseSheet_(functionName, 'INFO', 0, 1, null, `Sync skipped for row ${editedRow}, UUID missing.`);
        }

    } catch (err) {
        const errorMsg = `${functionName} failed for row ${editedRow}: ${err.message}`;
        Logger.log(`${errorMsg}\n${err.stack}`);
        logToSupabaseSheet_(functionName, 'ERROR', 0, 1, null, errorMsg);
    }
}