/**
 * Location Production Sync Module
 *
 * This module syncs production data from Google Sheets tabs (Baytown and Humble)
 * to a Supabase location_production table.
 *
 * Created by: Unified Dental
 * For: Kam Dental
 */

// Location mapping (short_id to location_id)
const LOCATION_MAP = {
  'BT': 'a2602b94-4e2e-4ea1-b662-2dd161d67fd6', // Baytown
  'HM': 'ac25f181-a8c9-471d-b6c1-ad57b5c85e7b'  // Humble
};

// Location production table name in Supabase
const LOCATION_PRODUCTION_TABLE = 'location_production';

/**
 * Syncs all location data
 */
function syncAllLocationData() {
  try {
    syncLocationData('Baytown', 'BT');
    syncLocationData('Humble', 'HM');
    SpreadsheetApp.getActiveSpreadsheet().toast('All location data synced successfully!', 'Success', 5);
  } catch (error) {
    logToSupabaseSheet_('syncAllLocationData', 'ERROR', null, null, null, `Error syncing all location data: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Error syncing data. See logs for details.', 'Error', 5);
  }
}

/**
 * Syncs Baytown data
 */
function syncBaytownData() {
  try {
    syncLocationData('Baytown', 'BT');
    SpreadsheetApp.getActiveSpreadsheet().toast('Baytown data synced successfully!', 'Success', 5);
  } catch (error) {
    logToSupabaseSheet_('syncBaytownData', 'ERROR', null, null, null, `Error syncing Baytown data: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Error syncing Baytown data. See logs for details.', 'Error', 5);
  }
}

/**
 * Syncs Humble data
 */
function syncHumbleData() {
  try {
    syncLocationData('Humble', 'HM');
    SpreadsheetApp.getActiveSpreadsheet().toast('Humble data synced successfully!', 'Success', 5);
  } catch (error) {
    logToSupabaseSheet_('syncHumbleData', 'ERROR', null, null, null, `Error syncing Humble data: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast('Error syncing Humble data. See logs for details.', 'Error', 5);
  }
}

/**
 * Syncs data for a specific location
 *
 * @param {string} sheetName - The name of the sheet tab
 * @param {string} shortId - The short ID for the location (BT or HM)
 */
function syncLocationData(sheetName, shortId) {
  const functionName = `syncLocationData_${shortId}`;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    const errMsg = `Sheet "${sheetName}" not found`;
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
    throw new Error(errMsg);
  }

  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();

  // Find column indices - case insensitive and trimmed for flexibility
  const headers = data[0];

  // Log the actual headers for debugging
  Logger.log(`Headers found in ${sheetName} sheet: ${headers.join(', ')}`);

  // Find column indices with flexible matching
  let dateColIndex = -1;
  let netProdColIndex = -1;
  let collectionsColIndex = -1;

  // Case-insensitive search for column names
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i]).trim().toLowerCase();

    if (header === 'date') {
      dateColIndex = i;
    } else if (header === 'net production' || header === 'netproduction' || header === 'net prod') {
      netProdColIndex = i;
    } else if (header === 'collections' || header === 'collection') {
      collectionsColIndex = i;
    }
  }

  // Log the found indices
  Logger.log(`Column indices found - Date: ${dateColIndex}, Net Production: ${netProdColIndex}, Collections: ${collectionsColIndex}`);

  if (dateColIndex === -1 || netProdColIndex === -1 || collectionsColIndex === -1) {
    const errMsg = `Required columns not found in ${sheetName} sheet. Looking for: Date, Net production, Collections`;
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
    throw new Error(errMsg);
  }

  // Get location ID from the map
  const locationId = LOCATION_MAP[shortId];
  if (!locationId) {
    const errMsg = `Location ID not found for short ID: ${shortId}`;
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
    throw new Error(errMsg);
  }

  // Get Supabase credentials
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    const errMsg = 'Supabase credentials not set. Please run "1. Setup Sync" first.';
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
    throw new Error(errMsg);
  }

  // Process each row (skip header)
  let syncCount = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip rows with empty date (date is required)
    if (!row[dateColIndex]) {
      Logger.log(`Skipping row ${i+1} due to missing date`);
      continue;
    }

    // Format the date as YYYY-MM-DD
    const dateValue = row[dateColIndex];
    const date = formatDate_(dateValue);

    // For net production and collections, treat empty cells as 0
    // This ensures we capture rows with legitimate zero values
    let netProduction = 0;
    let collections = 0;

    // Only try to parse if the cell has a value
    if (row[netProdColIndex] !== null && row[netProdColIndex] !== undefined && row[netProdColIndex] !== '') {
      netProduction = parseFloat(row[netProdColIndex]) || 0;
    }

    if (row[collectionsColIndex] !== null && row[collectionsColIndex] !== undefined && row[collectionsColIndex] !== '') {
      collections = parseFloat(row[collectionsColIndex]) || 0;
    }

    // Log for debugging
    Logger.log(`Processing row ${i+1}: Date=${date}, Net Production=${netProduction}, Collections=${collections}`);

    // Sync this row to Supabase
    const result = upsertLocationProductionData_(locationId, date, netProduction, collections, credentials);
    if (result.success) {
      syncCount++;
    }
  }

  logToSupabaseSheet_(functionName, 'SUCCESS', null, syncCount, null, `Synced ${syncCount} rows for ${sheetName}`);
  return syncCount;
}

/**
 * Inserts or updates production data in Supabase
 *
 * @param {string} locationId - The location ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {number} netProduction - The net production amount
 * @param {number} collections - The collections amount
 * @param {Object} credentials - Supabase credentials {url, key}
 * @returns {Object} Result object with success flag
 */
function upsertLocationProductionData_(locationId, date, netProduction, collections, credentials) {
  const functionName = 'upsertLocationProductionData_';

  try {
    // Check if record exists
    const existingRecord = checkExistingLocationRecord_(locationId, date, credentials);

    let endpoint = `${credentials.url}/rest/v1/${LOCATION_PRODUCTION_TABLE}`;
    let method = 'POST';
    let payload = {
      location_id: locationId,
      date: date,
      net_production: netProduction,
      collections: collections,
      updated_at: new Date().toISOString()
    };

    // If record exists, update it
    if (existingRecord) {
      endpoint += `?id=eq.${existingRecord.id}`;
      method = 'PATCH';
    }

    const options = {
      method: method,
      headers: {
        'apikey': credentials.key,
        'Authorization': `Bearer ${credentials.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() >= 300) {
      const errMsg = `Supabase API error: ${response.getContentText()}`;
      logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
      throw new Error(errMsg);
    }

    return { success: true };
  } catch (error) {
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, `Error upserting data for location ${locationId} on ${date}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if a record already exists for the given location and date
 *
 * @param {string} locationId - The location ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {Object} credentials - Supabase credentials {url, key}
 * @returns {Object|null} The existing record or null
 */
function checkExistingLocationRecord_(locationId, date, credentials) {
  const functionName = 'checkExistingLocationRecord_';

  try {
    const endpoint = `${credentials.url}/rest/v1/${LOCATION_PRODUCTION_TABLE}?location_id=eq.${locationId}&date=eq.${date}`;

    const options = {
      method: 'GET',
      headers: {
        'apikey': credentials.key,
        'Authorization': `Bearer ${credentials.key}`
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() >= 300) {
      const errMsg = `Supabase API error: ${response.getContentText()}`;
      logToSupabaseSheet_(functionName, 'ERROR', null, null, null, errMsg);
      throw new Error(errMsg);
    }

    const records = JSON.parse(response.getContentText());
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    logToSupabaseSheet_(functionName, 'ERROR', null, null, null, `Error checking existing record for location ${locationId} on ${date}: ${error.message}`);
    return null;
  }
}

/**
 * Formats a date object to YYYY-MM-DD string
 *
 * @param {Date} date - The date to format
 * @returns {string} Formatted date
 */
function formatDate_(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Trigger function that runs when the spreadsheet is edited
 * Only syncs location data if edits are made to the Baytown or Humble sheets
 */
function onEditLocationSync(e) {
  // Only trigger sync if edits are made to the Baytown or Humble sheets
  if (e && e.range) {
    const sheetName = e.range.getSheet().getName();

    if (sheetName === 'Baytown') {
      syncLocationData('Baytown', 'BT');
    } else if (sheetName === 'Humble') {
      syncLocationData('Humble', 'HM');
    }
  }
}

/**
 * Sets up time-based triggers for daily location sync
 * This is called as part of the main setupSupabaseSync function
 */
function setupLocationSyncTriggers_() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncAllLocationData' ||
        triggers[i].getHandlerFunction() === 'onEditLocationSync') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create a new daily trigger
  ScriptApp.newTrigger('syncAllLocationData')
    .timeBased()
    .everyDays(1)
    .atHour(2) // 2 AM (after the main sync at 1 AM)
    .create();

  // Create an edit trigger for the location sheets
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  ScriptApp.newTrigger('onEditLocationSync')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log('Location sync triggers set up successfully');
  return true;
}

/**
 * Counts and displays the total rows and potential sync rows in each location sheet
 * This helps identify why some rows might be skipped during sync
 */
function countLocationSheetRows() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check Baytown sheet
  try {
    const baytownSheet = ss.getSheetByName('Baytown');
    if (baytownSheet) {
      const data = baytownSheet.getDataRange().getValues();
      const headers = data[0];

      // Find required columns
      let dateColIndex = -1;
      let netProdColIndex = -1;
      let collectionsColIndex = -1;

      for (let i = 0; i < headers.length; i++) {
        const header = String(headers[i]).trim().toLowerCase();

        if (header === 'date') {
          dateColIndex = i;
        } else if (header === 'net production' || header === 'netproduction' || header === 'net prod') {
          netProdColIndex = i;
        } else if (header === 'collections' || header === 'collection') {
          collectionsColIndex = i;
        }
      }

      // Count rows
      const totalRows = data.length - 1; // Exclude header
      let rowsWithDate = 0;
      let rowsWithAllData = 0;
      let rowsWithZeros = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];

        if (row[dateColIndex]) {
          rowsWithDate++;

          const hasNetProd = row[netProdColIndex] !== null && row[netProdColIndex] !== undefined && row[netProdColIndex] !== '';
          const hasCollections = row[collectionsColIndex] !== null && row[collectionsColIndex] !== undefined && row[collectionsColIndex] !== '';

          if (hasNetProd && hasCollections) {
            rowsWithAllData++;
          }

          // Check for zero values
          const netProd = parseFloat(row[netProdColIndex]) || 0;
          const collections = parseFloat(row[collectionsColIndex]) || 0;

          if (netProd === 0 && collections === 0) {
            rowsWithZeros++;
          }
        }
      }

      let message = `Baytown Sheet Row Analysis:\n`;
      message += `- Total rows (excluding header): ${totalRows}\n`;
      message += `- Rows with date: ${rowsWithDate}\n`;
      message += `- Rows with date, net production, and collections: ${rowsWithAllData}\n`;
      message += `- Rows with date but zero values: ${rowsWithZeros}\n`;
      message += `- Rows that would be synced with new code: ${rowsWithDate}\n`;

      ui.alert(message);
    } else {
      ui.alert('Baytown sheet not found');
    }
  } catch (error) {
    ui.alert(`Error analyzing Baytown sheet: ${error.message}`);
  }

  // Check Humble sheet
  try {
    const humbleSheet = ss.getSheetByName('Humble');
    if (humbleSheet) {
      const data = humbleSheet.getDataRange().getValues();
      const headers = data[0];

      // Find required columns
      let dateColIndex = -1;
      let netProdColIndex = -1;
      let collectionsColIndex = -1;

      for (let i = 0; i < headers.length; i++) {
        const header = String(headers[i]).trim().toLowerCase();

        if (header === 'date') {
          dateColIndex = i;
        } else if (header === 'net production' || header === 'netproduction' || header === 'net prod') {
          netProdColIndex = i;
        } else if (header === 'collections' || header === 'collection') {
          collectionsColIndex = i;
        }
      }

      // Count rows
      const totalRows = data.length - 1; // Exclude header
      let rowsWithDate = 0;
      let rowsWithAllData = 0;
      let rowsWithZeros = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];

        if (row[dateColIndex]) {
          rowsWithDate++;

          const hasNetProd = row[netProdColIndex] !== null && row[netProdColIndex] !== undefined && row[netProdColIndex] !== '';
          const hasCollections = row[collectionsColIndex] !== null && row[collectionsColIndex] !== undefined && row[collectionsColIndex] !== '';

          if (hasNetProd && hasCollections) {
            rowsWithAllData++;
          }

          // Check for zero values
          const netProd = parseFloat(row[netProdColIndex]) || 0;
          const collections = parseFloat(row[collectionsColIndex]) || 0;

          if (netProd === 0 && collections === 0) {
            rowsWithZeros++;
          }
        }
      }

      let message = `Humble Sheet Row Analysis:\n`;
      message += `- Total rows (excluding header): ${totalRows}\n`;
      message += `- Rows with date: ${rowsWithDate}\n`;
      message += `- Rows with date, net production, and collections: ${rowsWithAllData}\n`;
      message += `- Rows with date but zero values: ${rowsWithZeros}\n`;
      message += `- Rows that would be synced with new code: ${rowsWithDate}\n`;

      ui.alert(message);
    } else {
      ui.alert('Humble sheet not found');
    }
  } catch (error) {
    ui.alert(`Error analyzing Humble sheet: ${error.message}`);
  }
}

/**
 * Debug function to check column headers in location sheets
 * This can be run manually to troubleshoot column issues
 */
function debugLocationSheetColumns() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check Baytown sheet
  try {
    const baytownSheet = ss.getSheetByName('Baytown');
    if (baytownSheet) {
      const headers = baytownSheet.getRange(1, 1, 1, baytownSheet.getLastColumn()).getValues()[0];
      Logger.log(`Baytown sheet headers: ${headers.join(', ')}`);

      // Find required columns
      const dateIndex = headers.findIndex(h => String(h).trim().toLowerCase() === 'date');
      const netProdIndex = headers.findIndex(h =>
        String(h).trim().toLowerCase() === 'net production' ||
        String(h).trim().toLowerCase() === 'netproduction' ||
        String(h).trim().toLowerCase() === 'net prod');
      const collectionsIndex = headers.findIndex(h =>
        String(h).trim().toLowerCase() === 'collections' ||
        String(h).trim().toLowerCase() === 'collection');

      let message = `Baytown Sheet Column Analysis:\n`;
      message += `- Date column: ${dateIndex > -1 ? `Found at position ${dateIndex + 1}` : 'NOT FOUND'}\n`;
      message += `- Net Production column: ${netProdIndex > -1 ? `Found at position ${netProdIndex + 1}` : 'NOT FOUND'}\n`;
      message += `- Collections column: ${collectionsIndex > -1 ? `Found at position ${collectionsIndex + 1}` : 'NOT FOUND'}\n\n`;
      message += `All headers found: ${headers.join(', ')}`;

      ui.alert(message);
    } else {
      ui.alert('Baytown sheet not found');
    }
  } catch (error) {
    ui.alert(`Error analyzing Baytown sheet: ${error.message}`);
  }

  // Check Humble sheet
  try {
    const humbleSheet = ss.getSheetByName('Humble');
    if (humbleSheet) {
      const headers = humbleSheet.getRange(1, 1, 1, humbleSheet.getLastColumn()).getValues()[0];
      Logger.log(`Humble sheet headers: ${headers.join(', ')}`);

      // Find required columns
      const dateIndex = headers.findIndex(h => String(h).trim().toLowerCase() === 'date');
      const netProdIndex = headers.findIndex(h =>
        String(h).trim().toLowerCase() === 'net production' ||
        String(h).trim().toLowerCase() === 'netproduction' ||
        String(h).trim().toLowerCase() === 'net prod');
      const collectionsIndex = headers.findIndex(h =>
        String(h).trim().toLowerCase() === 'collections' ||
        String(h).trim().toLowerCase() === 'collection');

      let message = `Humble Sheet Column Analysis:\n`;
      message += `- Date column: ${dateIndex > -1 ? `Found at position ${dateIndex + 1}` : 'NOT FOUND'}\n`;
      message += `- Net Production column: ${netProdIndex > -1 ? `Found at position ${netProdIndex + 1}` : 'NOT FOUND'}\n`;
      message += `- Collections column: ${collectionsIndex > -1 ? `Found at position ${collectionsIndex + 1}` : 'NOT FOUND'}\n\n`;
      message += `All headers found: ${headers.join(', ')}`;

      ui.alert(message);
    } else {
      ui.alert('Humble sheet not found');
    }
  } catch (error) {
    ui.alert(`Error analyzing Humble sheet: ${error.message}`);
  }
}
