/**
 * Main sync function - syncs all hygiene data from all month tabs to Supabase
 */
function syncAllHygieneData() {
  const functionName = 'syncAllHygieneData';
  const ui = SpreadsheetApp.getUi();
  let totalRowsProcessed = 0;
  let totalSheets = 0;
  const startTime = Date.now();

  logToHygieneSheet_(functionName, 'START', 0, 0, null, 'Full sync initiated.');
  Logger.log(`Starting ${functionName} for Sheet ID: ${getHygieneSheetId()}...`);

  // Sheet ID is now dynamic - no need to check configuration
  // getHygieneSheetId() will automatically get the current active spreadsheet

  // Check credentials
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
    logToHygieneSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(getHygieneSheetId());
    const sheets = ss.getSheets();

    // Process each sheet that matches month tab patterns
    for (const sheet of sheets) {
      const sheetName = sheet.getName();

      // Skip sheets that don't look like month tabs
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        Logger.log(`syncAllHygieneData: Skipping sheet '${sheetName}' because it does not match MONTH_TAB_PATTERNS.`);
        continue;
      }

      Logger.log(`syncAllHygieneData: Processing sheet: ${sheetName}`);
      const sheetSyncResult = syncSheetData_(sheet, sheetName);
      totalRowsProcessed += (sheetSyncResult.recordsSynced || 0);
      totalSheets++;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const successMsg = `Full sync complete. Processed ${totalRowsProcessed} rows across ${totalSheets} sheets in ${duration}s. See individual sheet logs for details.`;
    
    Logger.log(successMsg);
    logToHygieneSheet_(functionName, 'SUCCESS', totalRowsProcessed, totalSheets, duration, successMsg);

  } catch (error) {
    const errorMsg = `${functionName} failed: ${error.message}`;
    Logger.log(errorMsg);
    logToHygieneSheet_(functionName, 'ERROR', totalRowsProcessed, totalSheets, null, errorMsg);
    throw error;
  }
}

/**
 * Sync data from a specific sheet
 * @param {Sheet} sheet - The Google Sheet to sync
 * @param {string} monthTab - Name of the month tab
 * @return {object} Result object containing sync details
 */
function syncSheetData_(sheet, monthTab) {
  const credentials = getSupabaseCredentials_();
  let recordsAttempted = 0;
  let recordsParsedAndBatched = 0;
  let recordsUpserted = 0;
  let recordsSkippedOrFailedParse = 0;

  if (!credentials) {
    const message = 'Supabase credentials or Provider ID are missing. Please configure them in Script Properties or run setup.';
    Logger.log(`SYNC_SHEET_DATA: Credentials (including Provider ID) not available for sheet '${monthTab}'. ${message}`);
    SpreadsheetApp.getUi().alert('Sync Error', message);
    logToHygieneSheet_('syncSheetData', 'ERROR', 0, 0, null, `Sheet '${monthTab}': ${message}`);
    return { success: false, message: message, recordsAttempted: 0, recordsParsed: 0, recordsSynced: 0, recordsFailedOrSkipped: 0 };
  }

  try {
    Logger.log(`syncSheetData_: Starting for sheet '${monthTab}'.`);
    const timezone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    const headerInfo = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headerInfo.headers);
    
    if (mapping.date === -1) {
      const message = `No date column found or mapped in sheet '${monthTab}'. Cannot process.`;
      Logger.log(`syncSheetData_: ${message}`);
      logToHygieneSheet_('syncSheetData', 'WARNING', 0, 1, null, message);
      return { success: true, message: message, recordsAttempted: 0, recordsParsed: 0, recordsSynced: 0, recordsFailedOrSkipped: 0 }; // true because the function itself didn't fail, but 0 rows processed
    }

    const data = sheet.getDataRange().getValues();
    const headerRowIndex = headerInfo.headerRowIndex;

    const dataRows = data.slice(headerRowIndex + 1);
    recordsAttempted = dataRows.length;
    Logger.log(`syncSheetData_: Found ${recordsAttempted} data rows (after header) in sheet '${monthTab}'.`);

    if (recordsAttempted === 0) {
      const message = `No data rows found after header in sheet '${monthTab}'.`;
      Logger.log(`syncSheetData_: ${message}`);
      logToHygieneSheet_('syncSheetData', 'INFO', 0, 1, null, message);
      return { success: true, message: message, recordsAttempted: 0, recordsParsed: 0, recordsSynced: 0, recordsFailedOrSkipped: 0 };
    }

    for (let i = 0; i < dataRows.length; i += SUPABASE_BATCH_SIZE) {
      const batch = dataRows.slice(i, i + SUPABASE_BATCH_SIZE);
      const recordsToUpsert = [];

      for (let j = 0; j < batch.length; j++) {
        const currentRowInSheet = batch[j];
        const originalRowIndex = headerRowIndex + 1 + i + j; // 0-based index from original data array
        
        if (!currentRowInSheet[mapping.date] || String(currentRowInSheet[mapping.date]).trim() === '') {
          Logger.log(`syncSheetData_: Row ${originalRowIndex + 1} in '${monthTab}' skipped (empty date before parsing).`);
          recordsSkippedOrFailedParse++;
          continue;
        }

        const record = parseHygieneRow_(currentRowInSheet, mapping, monthTab, credentials.clinicId, credentials.providerId, originalRowIndex, timezone);
        if (record) {
          recordsToUpsert.push(record);
        } else {
          Logger.log(`syncSheetData_: Row ${originalRowIndex + 1} in '${monthTab}' returned null from parseHygieneRow_ (check detailed parse logs).`);
          recordsSkippedOrFailedParse++;
        }
      }

      if (recordsToUpsert.length > 0) {
        recordsParsedAndBatched += recordsToUpsert.length;
        const success = upsertBatchToSupabase_(recordsToUpsert, credentials);
        if (success) {
          recordsUpserted += recordsToUpsert.length;
        }
      } else {
        Logger.log(`syncSheetData_: No records to upsert in current batch for '${monthTab}' (Rows ${i + 1} to ${Math.min(i + SUPABASE_BATCH_SIZE, dataRows.length) +1}).`);
      }
    }

    const summaryMessage = `Sheet '${monthTab}': Attempted: ${recordsAttempted}, Parsed for batching: ${recordsParsedAndBatched}, Upserted: ${recordsUpserted}, Skipped/FailedParse: ${recordsSkippedOrFailedParse}.`;
    Logger.log(`syncSheetData_: ${summaryMessage}`);
    logToHygieneSheet_('syncSheetData', recordsUpserted > 0 ? 'SUCCESS' : 'INFO', recordsUpserted, 1, null, summaryMessage);
    return { success: true, message: summaryMessage, recordsAttempted, recordsParsed: recordsParsedAndBatched, recordsSynced: recordsUpserted, recordsFailedOrSkipped: recordsSkippedOrFailedParse };

  } catch (error) {
    const errorMessage = `Error processing sheet '${monthTab}': ${error.message} Stack: ${error.stack ? error.stack : 'N/A'}`;
    Logger.log(`syncSheetData_: ${errorMessage}`);
    logToHygieneSheet_('syncSheetData', 'ERROR', recordsUpserted, 1, null, errorMessage);
    return { success: false, message: errorMessage, recordsAttempted, recordsParsed: recordsParsedAndBatched, recordsSynced: recordsUpserted, recordsFailedOrSkipped: recordsSkippedOrFailedParse };
  }
}

/**
 * Sync a single row to Supabase
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} rowNumber - 1-based row number
 * @return {boolean} Success status
 */
function syncSingleRow_(sheet, rowNumber, monthTab) {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    Logger.log('SYNC_SINGLE_ROW: Credentials (including Provider ID) not available. Halting sync for row: ' + rowNumber);
    return { success: false, error: 'Credentials or Provider ID missing' };
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMapping = mapHeaders_(headers);
  
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Pass rowNumber - 1 for 0-based rowIndex expected by parseHygieneRow_
  const timezone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const parsedRecord = parseHygieneRow_(rowData, headerMapping, monthTab, credentials.clinicId, credentials.providerId, rowNumber - 1, timezone);

  if (!parsedRecord) {
    logToHygieneSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Failed to sync row ${rowNumber} from ${monthTab}`);
    return { success: false, error: 'Failed to parse row data' };
  }

  const success = upsertToSupabase_(parsedRecord, credentials);
  
  if (success) {
    logToHygieneSheet_('syncSingleRow', 'SUCCESS', 1, 0, null, `Row ${rowNumber} from ${monthTab} synced`);
    return { success: true, error: null };
  } else {
    logToHygieneSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Failed to sync row ${rowNumber} from ${monthTab}`);
    return { success: false, error: 'Failed to sync to Supabase' };
  }
}

/**
 * Upsert a batch of records directly to Supabase.
 * @param {array} records - Array of hygiene records
 * @param {object} credentials - Supabase credentials
 * @return {boolean} Success status
 */
function upsertBatchToSupabase_(records, credentials) {
  const functionName = 'upsertBatchToSupabase_'; // For logging consistency

  if (!records || records.length === 0) {
    Logger.log(`${functionName}: Called with no records.`);
    return true; // No records to process is a form of success
  }

  try {
    if (!credentials || !credentials.url || !credentials.key) {
      Logger.log(`${functionName}: Invalid credentials provided.`);
      // It might be better to throw an error or log to sheet if credentials are truly missing
      // For now, maintaining return false as per original hygiene-sync logic for this specific check
      return false;
    }
    
    if (typeof SUPABASE_TABLE_NAME === 'undefined' || !SUPABASE_TABLE_NAME) {
        Logger.log(`${functionName}: SUPABASE_TABLE_NAME is not defined or empty.`);
        logToHygieneSheet_(functionName, 'ERROR', 0, 0, null, 'SUPABASE_TABLE_NAME is not configured.');
        return false;
    }

    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
    
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Prefer': 'resolution=merge-duplicates' // Simplified strategy
      },
      payload: JSON.stringify(records),
      muteHttpExceptions: true // Get full error details
    };

    Logger.log(`${functionName}: Attempting to sync batch of ${records.length} records to ${url} with Prefer: resolution=merge-duplicates`);
    const response = UrlFetchApp.fetch(url, payload);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`${functionName}: Successfully synced batch of ${records.length} records. Response code: ${responseCode}`);
      return true;
    } else {
      const errorLogMsg = `Failed to sync batch. Response Code: ${responseCode}. Response Text: ${responseText}`;
      Logger.log(`${functionName}: ${errorLogMsg}`);
      if (responseText) {
        try {
          const errorDetails = JSON.parse(responseText);
          Logger.log(`${functionName}: Error details from Supabase: ${JSON.stringify(errorDetails)}`);
        } catch (e) {
          // Not JSON, or some other issue parsing, already logged responseText
        }
      }
      logToHygieneSheet_(functionName, 'ERROR', 0, records.length, null, `Supabase upsert failed. Code: ${responseCode}. Response: ${responseText ? responseText.substring(0,200) : 'N/A'}`);
      return false;
    }
  } catch (error) {
    const exceptionLogMsg = `Error during upsert: ${error.message}. Stack: ${error.stack ? error.stack : 'N/A'}`;
    Logger.log(`${functionName}: ${exceptionLogMsg}`);
    logToHygieneSheet_(functionName, 'ERROR', 0, records.length, null, `Exception: ${error.message}`);
    return false;
  }
}

/**
 * Upsert a single record to Supabase
 * @param {object} record - Hygiene record
 * @param {object} credentials - Supabase credentials
 * @return {boolean} Success status
 */
function upsertToSupabase_(record, credentials) {
  try {
    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
    
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Prefer': 'resolution=merge-duplicates'
      },
      payload: JSON.stringify(record)
    };

    const response = UrlFetchApp.fetch(url, payload);

    if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
      Logger.log(`Successfully synced record for ${record.date}`);
      return true;
    } else {
      Logger.log(`Failed to sync record for ${record.date}: ${response.getContentText()}`);
      return false;
    }

  } catch (error) {
    Logger.log(`Error upserting to Supabase: ${error.message}`);
    return false;
  }
}