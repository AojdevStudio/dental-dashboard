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
  Logger.log(`Starting ${functionName} for Sheet ID: ${HYGIENE_SHEET_ID}...`);

  // Check configuration
  if (!HYGIENE_SHEET_ID || HYGIENE_SHEET_ID === 'YOUR_HYGIENE_SHEET_ID_HERE') {
    const errMsg = 'Error: HYGIENE_SHEET_ID constant is not set in config.gs';
    Logger.log(errMsg);
    logToHygieneSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    return;
  }

  // Check credentials
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
    logToHygieneSheet_(functionName, 'ERROR', 0, 0, null, errMsg);
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
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

    // Process rows in batches
    for (let i = 0; i < dataRows.length; i += SUPABASE_BATCH_SIZE) {
      const batch = dataRows.slice(i, i + SUPABASE_BATCH_SIZE);
      const records = [];

      for (const row of batch) {
        // Skip empty rows (no date)
        if (!row[mapping.date] || String(row[mapping.date]).trim() === '') {
          continue;
        }

        const record = parseHygieneRow_(row, mapping, monthTab, credentials.clinicId);
        if (record) {
          records.push(record);
        }
      }

      if (records.length > 0) {
        const success = upsertBatchToSupabase_(records, credentials);
        if (success) {
          processedRows += records.length;
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
 * Sync a single row to Supabase
 * @param {Sheet} sheet - The Google Sheet
 * @param {number} rowNumber - 1-based row number
 * @return {boolean} Success status
 */
function syncSingleRow_(sheet, rowNumber) {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const sheetName = sheet.getName();
    const headers = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headers);
    
    if (mapping.date === -1) {
      throw new Error('No date column found in this sheet');
    }

    const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Skip empty rows
    if (!row[mapping.date] || String(row[mapping.date]).trim() === '') {
      throw new Error('Row has no date value');
    }

    const record = parseHygieneRow_(row, mapping, sheetName, credentials.clinicId);
    if (!record) {
      throw new Error('Could not parse row data');
    }

    const success = upsertToSupabase_(record, credentials);
    
    if (success) {
      logToHygieneSheet_('syncSingleRow', 'SUCCESS', 1, 0, null, `Row ${rowNumber} from ${sheetName} synced`);
    } else {
      logToHygieneSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Failed to sync row ${rowNumber} from ${sheetName}`);
    }

    return success;

  } catch (error) {
    logToHygieneSheet_('syncSingleRow', 'ERROR', 0, 0, null, `Error syncing row ${rowNumber}: ${error.message}`);
    throw error;
  }
}

/**
 * Upsert a batch of records to the dental dashboard API
 * @param {array} records - Array of hygiene records
 * @param {object} credentials - Supabase credentials
 * @return {boolean} Success status
 */
function upsertBatchToSupabase_(records, credentials) {
  try {
    // Try to get dashboard API URL from script properties
    const scriptProperties = PropertiesService.getScriptProperties();
    const dashboardApiUrl = scriptProperties.getProperty(DASHBOARD_API_URL_PROPERTY_KEY);
    
    if (dashboardApiUrl) {
      // Use the new hygiene production sync API endpoint
      const url = `${dashboardApiUrl}/api/hygiene-production/sync`;
      
      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          records: records,
          supabase_key: credentials.key
        })
      };

      const response = UrlFetchApp.fetch(url, payload);
      const responseData = response.getContentText();

      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
        try {
          const result = JSON.parse(responseData);
          Logger.log(`Successfully synced batch of ${records.length} records via dashboard API. Results: ${JSON.stringify(result)}`);
          return true;
        } catch (parseError) {
          Logger.log(`Sync successful but could not parse response: ${responseData}`);
          return true;
        }
      } else {
        Logger.log(`Failed to sync batch via dashboard API: ${response.getResponseCode()} - ${responseData}`);
        
        // Fall back to direct Supabase API
        Logger.log('Falling back to direct Supabase API...');
        return upsertBatchToSupabaseDirect_(records, credentials);
      }
    } else {
      // No dashboard API URL configured, use direct Supabase API
      Logger.log('No dashboard API URL configured, using direct Supabase API...');
      return upsertBatchToSupabaseDirect_(records, credentials);
    }

  } catch (error) {
    Logger.log(`Error upserting batch to dashboard API: ${error.message}`);
    
    // Fall back to direct Supabase API
    Logger.log('Falling back to direct Supabase API due to error...');
    return upsertBatchToSupabaseDirect_(records, credentials);
  }
}

/**
 * Fallback: Direct upsert to Supabase (original implementation)
 * @param {array} records - Array of hygiene records
 * @param {object} credentials - Supabase credentials
 * @return {boolean} Success status
 */
function upsertBatchToSupabaseDirect_(records, credentials) {
  try {
    // Try different upsert strategies
    return upsertBatchWithRetry_(records, credentials, 0);
  } catch (error) {
    Logger.log(`Error upserting batch to Supabase directly: ${error.message}`);
    return false;
  }
}

/**
 * Retry upsert with different strategies
 */
function upsertBatchWithRetry_(records, credentials, retryCount) {
  const maxRetries = 3;
  const strategies = [
    'resolution=merge-duplicates',
    'resolution=ignore-duplicates', 
    'return=minimal'
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
      
      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.key}`,
          'apikey': credentials.key,
          'Prefer': strategies[i]
        },
        payload: JSON.stringify(records),
        muteHttpExceptions: true // Get full error details
      };

      const response = UrlFetchApp.fetch(url, payload);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      if (responseCode >= 200 && responseCode < 300) {
        Logger.log(`Successfully synced batch of ${records.length} records via direct Supabase (strategy: ${strategies[i]})`);
        return true;
      } else if (responseCode === 409 || responseCode === 500) {
        // Conflict or server error - try individual record upserts
        Logger.log(`Batch failed with ${responseCode}, trying individual upserts...`);
        return upsertRecordsIndividually_(records, credentials);
      } else {
        Logger.log(`Strategy ${strategies[i]} failed: ${responseCode} - ${responseText}`);
        // Continue to next strategy
      }
    } catch (error) {
      Logger.log(`Strategy ${strategies[i]} error: ${error.message}`);
      // Continue to next strategy
    }
  }
  
  // All strategies failed
  Logger.log(`All upsert strategies failed for batch of ${records.length} records`);
  return false;
}

/**
 * Fallback: Upsert records one by one
 */
function upsertRecordsIndividually_(records, credentials) {
  let successCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i];
      const success = upsertSingleRecord_(record, credentials);
      if (success) {
        successCount++;
      } else {
        Logger.log(`Failed to upsert record ${i + 1}: ${record.id}`);
      }
    } catch (error) {
      Logger.log(`Error upserting individual record ${i + 1}: ${error.message}`);
    }
  }
  
  Logger.log(`Individual upsert completed: ${successCount}/${records.length} records successful`);
  return successCount > 0;
}

/**
 * Upsert a single record with conflict handling
 */
function upsertSingleRecord_(record, credentials) {
  try {
    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}?id=eq.${record.id}`;
    
    // Try update first
    let payload = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(record),
      muteHttpExceptions: true
    };

    let response = UrlFetchApp.fetch(url, payload);
    
    if (response.getResponseCode() === 200 || response.getResponseCode() === 204) {
      return true;
    }
    
    // If update failed, try insert
    const insertUrl = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
    payload.method = 'POST';
    
    response = UrlFetchApp.fetch(insertUrl, payload);
    
    if (response.getResponseCode() === 201) {
      return true;
    }
    
    Logger.log(`Single record upsert failed: ${response.getResponseCode()} - ${response.getContentText()}`);
    return false;
    
  } catch (error) {
    Logger.log(`Single record error: ${error.message}`);
    return false;
  }
}

/**
 * Upsert single record to Supabase
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