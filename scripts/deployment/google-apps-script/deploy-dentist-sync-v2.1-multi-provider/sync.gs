/**
 * Test sync function - processes just the first few rows for debugging
 */
function testDentistSync() {
  const functionName = 'testDentistSync';
  const ui = SpreadsheetApp.getUi();
  
  Logger.log(`Starting ${functionName}...`);
  
  try {
    // Get credentials first
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      ui.alert('Error', 'No credentials available. Please run Setup first.', ui.ButtonSet.OK);
      return;
    }
    
    // Log credential info (without sensitive data)
    Logger.log(`Credentials check: has URL=${!!credentials.url}, has key=${!!credentials.key}`);
    
    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    Logger.log(`Testing with sheet: ${sheetName}`);
    
    // Get headers and mapping
    const headers = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headers);
    
    Logger.log(`Header mapping: ${JSON.stringify(mapping)}`);
    
    // Check if we have required columns
    if (mapping.date === -1) {
      ui.alert('Error', 'No date column found in sheet.', ui.ButtonSet.OK);
      return;
    }
    
    // Get provider detection
    const providerDetection = detectProviderEnhanced_(getDentistSheetId());
    Logger.log(`Provider detection: ${JSON.stringify(providerDetection)}`);
    
    // Get first few data rows
    const data = sheet.getDataRange().getValues();
    let headerRowIndex = -1;
    
    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (data[i].some(cell => String(cell).toLowerCase().includes('date'))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      ui.alert('Error', 'No header row found.', ui.ButtonSet.OK);
      return;
    }
    
    // Process just first 3 data rows
    const testRows = data.slice(headerRowIndex + 1, headerRowIndex + 4);
    const records = [];
    
    for (const row of testRows) {
      if (!row[mapping.date]) continue;
      
      const locationRecords = parseDentistRowMultiLocation_(row, mapping, sheetName, credentials, providerDetection);
      if (locationRecords && locationRecords.length > 0) {
        records.push(...locationRecords);
      }
    }
    
    Logger.log(`Created ${records.length} test records`);
    
    if (records.length > 0) {
      // Try to sync
      const success = upsertBatchToSupabase_(records, credentials);
      
      if (success) {
        ui.alert('Success', `Test sync completed! Synced ${records.length} records.`, ui.ButtonSet.OK);
      } else {
        ui.alert('Error', 'Test sync failed. Check logs for details.', ui.ButtonSet.OK);
      }
    } else {
      ui.alert('Info', 'No records to sync in test rows.', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    Logger.log(`Test sync error: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    ui.alert('Error', `Test sync failed: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Main sync function - syncs all hygiene data from all month tabs to Supabase
 * 
 * PERFORMANCE OPTIMIZATION: Provider detection is now done once per sheet,
 * not once per row, to prevent timeout issues.
 */
function syncAllDentistData() {
  const functionName = 'syncAllDentistData';
  const ui = SpreadsheetApp.getUi();
  let totalRowsProcessed = 0;
  let totalSheets = 0;
  const startTime = Date.now();

  logToDentistSheet_(functionName, 'START', 0, 0, null, 'Full sync initiated.');
  Logger.log(`Starting ${functionName} for Sheet ID: ${getDentistSheetId()}...`);

  // Check configuration
  // Sheet ID is now dynamic - no need to check configuration
  // getDentistSheetId() will automatically get the current active spreadsheet

  // Check credentials
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
    logToDentistSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const sheets = ss.getSheets();

    // Process each sheet that matches month tab patterns
    for (const sheet of sheets) {
      const sheetName = sheet.getName();

      // Skip sheets that don't look like month tabs
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        Logger.log(`Skipping sheet: ${sheetName} (not month format)`);
        continue;
      }

      Logger.log(`Processing sheet: ${sheetName}`);
      const rowsProcessed = syncSheetData_(sheet, sheetName);
      totalRowsProcessed += rowsProcessed;
      totalSheets++;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const successMsg = `Sync complete! Processed ${totalRowsProcessed} rows across ${totalSheets} sheets in ${duration}s.`;
    
    Logger.log(successMsg);
    logToDentistSheet_(functionName, 'SUCCESS', totalRowsProcessed, totalSheets, duration, successMsg);

  } catch (error) {
    const errorMsg = `${functionName} failed: ${error.message}`;
    Logger.log(errorMsg);
    logToDentistSheet_(functionName, 'ERROR', totalRowsProcessed, totalSheets, null, errorMsg);
    throw error;
  }
}

/**
 * Sync data from a specific sheet
 * @param {Sheet} sheet - The Google Sheet to sync
 * @param {string} monthTab - Name of the month tab
 * @return {number} Number of rows processed
 */
function syncSheetData_(sheet, monthTab) {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const headers = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headers);
    
    // Check if we have the required date column
    if (mapping.date === -1) {
      Logger.log(`Warning: No date column found in sheet ${monthTab}`);
      return 0;
    }

    const data = sheet.getDataRange().getValues();
    
    // Find header row index
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (data[i].some(cell => String(cell).toLowerCase().includes('date'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      Logger.log(`No header row found in sheet: ${monthTab}`);
      return 0;
    }

    const dataRows = data.slice(headerRowIndex + 1);
    let processedRows = 0;

    // Get provider info ONCE before the loop starts
    const providerDetection = detectProviderEnhanced_(getDentistSheetId());

    // Process rows in batches
    for (let i = 0; i < dataRows.length; i += SUPABASE_BATCH_SIZE) {
      const batch = dataRows.slice(i, i + SUPABASE_BATCH_SIZE);
      const records = [];

      for (const row of batch) {
        // Skip empty rows (no date)
        if (!row[mapping.date] || String(row[mapping.date]).trim() === '') {
          continue;
        }

        // Use the new multi-location parsing function
        const locationRecords = parseDentistRowMultiLocation_(row, mapping, monthTab, credentials, providerDetection);
        if (locationRecords && locationRecords.length > 0) {
          records.push(...locationRecords);
        }
      }

      if (records.length > 0) {
        // Log batch info for debugging
        Logger.log(`Processing batch with ${records.length} location-specific records`);
        
        // Call the simplified batch upsert function
        const success = upsertBatchToSupabase_(records, credentials);
        if (success) {
          processedRows += records.length;
        } else {
          Logger.log(`Failed to upsert batch of ${records.length} records`);
        }
      }
    }

    Logger.log(`Processed ${processedRows} rows from ${monthTab}`);
    return processedRows;

  } catch (error) {
    Logger.log(`Error processing sheet ${monthTab}: ${error.message}`);
    return 0;
  }
}

/**
 * Sync a single row to Supabase.
 * Note: This can be adapted to call upsertBatchToSupabase_ with a single record if needed.
 * For now, primarily relying on batch sync.
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} rowNumber - 1-based row number
 * @return {boolean} Success status
 */
function syncSingleRow_(sheet, rowNumber) {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    Logger.log('No credentials available for syncSingleRow_');
    return false;
  }

  try {
    const sheetName = sheet.getName();
    const headers = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headers);
    
    if (mapping.date === -1) {
      Logger.log(`No date column found in ${sheetName} for syncSingleRow_`);
      return false;
    }

    const rowValues = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!rowValues[mapping.date] || String(rowValues[mapping.date]).trim() === '') {
      Logger.log(`Row ${rowNumber} in ${sheetName} has no date value.`);
      return false;
    }

    // Get provider info ONCE for this single row operation
    const providerDetection = detectProviderEnhanced_(getDentistSheetId());
    
    // Use multi-location parsing for single row too
    const records = parseDentistRowMultiLocation_(rowValues, mapping, sheetName, credentials, providerDetection);
    if (!records || records.length === 0) {
      Logger.log(`Could not parse row ${rowNumber} from ${sheetName} or no production data.`);
      return false;
    }

    Logger.log(`Single row sync: Created ${records.length} location-specific records for row ${rowNumber}`);

    // Upsert the location-specific records
    const success = upsertBatchToSupabase_(records, credentials);
    
    if (success) {
      logToDentistSheet_('syncSingleRow', 'SUCCESS', records.length, 0, null, `Row ${rowNumber} from ${sheetName} synced (${records.length} locations)`);
    } else {
      logToDentistSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Failed to sync row ${rowNumber} from ${sheetName}`);
    }
    return success;

  } catch (error) {
    logToDentistSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Error in syncSingleRow_ for row ${rowNumber} from ${sheet.getName()}: ${error.message}`);
    Logger.log(`Error in syncSingleRow_: ${error.message} \nStack: ${error.stack}`);
    return false;
  }
}

/**
 * Upserts a batch of records directly to Supabase using 'resolution=merge-duplicates'.
 * @param {array} records - Array of dentist records.
 * @param {object} credentials - Supabase credentials { url, key, clinicId }.
 * @return {boolean} Success status.
 */
function upsertBatchToSupabase_(records, credentials) {
  if (!records || records.length === 0) {
    Logger.log('upsertBatchToSupabase_ called with no records.');
    return true; // No records to process is a form of success
  }

  try {
    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
    
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Prefer': 'resolution=merge-duplicates' // Key for upsert behavior
      },
      payload: JSON.stringify(records),
      muteHttpExceptions: true // Allows us to handle errors based on response code
    };

    Logger.log(`Attempting to upsert ${records.length} records to ${SUPABASE_TABLE_NAME} with 'merge-duplicates'.`);
    
    // Log first record for debugging (without sensitive data)
    if (records.length > 0) {
      const firstRecord = records[0];
      Logger.log(`Sample record: date=${firstRecord.date}, clinic_id=${firstRecord.clinic_id}, ` +
                 `humble_prod=${firstRecord.verified_production_humble}, baytown_prod=${firstRecord.verified_production_baytown}, ` +
                 `provider=${firstRecord.provider_name}`);
    }
    
    const response = UrlFetchApp.fetch(url, payload);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      // HTTP 200 OK, HTTP 201 Created, HTTP 204 No Content (though POST usually returns 201)
      Logger.log(`Successfully synced batch of ${records.length} records. Response Code: ${responseCode}`);
      // Logger.log(`Response: ${responseText}`); // Optional: log response text for more detail
      return true;
    } else {
      // Log detailed error information
      Logger.log(`Failed to sync batch. Response Code: ${responseCode}`);
      Logger.log(`Error Response: ${responseText}`);
      logToDentistSheet_('upsertBatchToSupabase_', 'ERROR', 0, 0, null, `Supabase upsert failed. Code: ${responseCode}. Response: ${responseText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    Logger.log(`Exception during upsertBatchToSupabase_: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    logToDentistSheet_('upsertBatchToSupabase_', 'ERROR', 0, 0, null, `Exception: ${error.message}`);
    return false;
  }
}