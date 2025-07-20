/**
 * Location Production Sync Script
 * 
 * This script syncs production data from Google Sheets tabs (Baytown and Humble)
 * to a Supabase location_production table.
 * 
 * Created by: Unified Dental
 * For: Kam Dental
 */

// Supabase API configuration
const SUPABASE_URL = 'https://xdwawepxakwqqetegxda.supabase.co';

// Keep the key in Script Properties (File ▸ Project properties ▸ Script properties)
const SUPABASE_KEY = PropertiesService
  .getScriptProperties()
  .getProperty('SUPABASE_KEY');

if (!SUPABASE_KEY) {
  throw new Error('SUPABASE_KEY is not configured in Script Properties. Please add it via File ▸ Project properties ▸ Script properties');
}

// Location mapping (short_id to location_id)
const LOCATION_MAP = {
  'BT': 'a2602b94-4e2e-4ea1-b662-2dd161d67fd6', // Baytown
  'HM': 'ac25f181-a8c9-471d-b6c1-ad57b5c85e7b'  // Humble
};

/**
 * Creates a menu when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Location Sync')
    .addItem('Sync All Location Data', 'syncAllLocationData')
    .addItem('Sync Baytown Data', 'syncBaytownData')
    .addItem('Sync Humble Data', 'syncHumbleData')
    .addToUi();
}

/**
 * Syncs all location data
 */
function syncAllLocationData() {
  try {
    syncLocationData('Baytown', 'BT');
    syncLocationData('Humble', 'HM');
    SpreadsheetApp.getActiveSpreadsheet().toast('All location data synced successfully!', 'Success', 5);
  } catch (error) {
    logError('Error syncing all location data', error);
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
    logError('Error syncing Baytown data', error);
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
    logError('Error syncing Humble data', error);
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();
  
  // Find column indices
  const headers = data[0];
  const dateColIndex = headers.indexOf('Date');
  const netProdColIndex = headers.indexOf('Net production');
  const collectionsColIndex = headers.indexOf('Collections');
  
  if (dateColIndex === -1 || netProdColIndex === -1 || collectionsColIndex === -1) {
    throw new Error(`Required columns not found in ${sheetName} sheet`);
  }
  
  // Get location ID from the map
  const locationId = LOCATION_MAP[shortId];
  if (!locationId) {
    throw new Error(`Location ID not found for short ID: ${shortId}`);
  }
  
  // Process each row (skip header)
  let syncCount = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Skip rows with empty date or production values
    if (!row[dateColIndex] || !row[netProdColIndex] || !row[collectionsColIndex]) {
      continue;
    }
    
    // Format the date as YYYY-MM-DD
    const date = formatDate(row[dateColIndex]);
    const netProduction = parseFloat(row[netProdColIndex]) || 0;
    const collections = parseFloat(row[collectionsColIndex]) || 0;
    
    // Sync this row to Supabase
    const result = upsertProductionData(locationId, date, netProduction, collections);
    if (result.success) {
      syncCount++;
    }
  }
  
  Logger.log(`Synced ${syncCount} rows for ${sheetName}`);
  return syncCount;
}

/**
 * Inserts or updates production data in Supabase
 * 
 * @param {string} locationId - The location ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {number} netProduction - The net production amount
 * @param {number} collections - The collections amount
 * @returns {Object} Result object with success flag
 */
function upsertProductionData(locationId, date, netProduction, collections) {
  if (!SUPABASE_KEY) {
    throw new Error('Supabase API key is not set');
  }
  
  try {
    // Check if record exists
    const existingRecord = checkExistingRecord(locationId, date);
    
    let endpoint = `${SUPABASE_URL}/rest/v1/location_production`;
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
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(endpoint, options);
    
    if (response.getResponseCode() >= 300) {
      throw new Error(`Supabase API error: ${response.getContentText()}`);
    }
    
    return { success: true };
  } catch (error) {
    logError(`Error upserting data for location ${locationId} on ${date}`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if a record already exists for the given location and date
 * 
 * @param {string} locationId - The location ID
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Object|null} The existing record or null
 */
function checkExistingRecord(locationId, date) {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/location_production?location_id=eq.${locationId}&date=eq.${date}`;
    
    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(endpoint, options);
    
    if (response.getResponseCode() >= 300) {
      throw new Error(`Supabase API error: ${response.getContentText()}`);
    }
    
    const records = JSON.parse(response.getContentText());
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    logError(`Error checking existing record for location ${locationId} on ${date}`, error);
    return null;
  }
}

/**
 * Formats a date object to YYYY-MM-DD string
 * 
 * @param {Date} date - The date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!(date instanceof Date)) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Logs an error with details
 * 
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function logError(message, error) {
  Logger.log(`ERROR: ${message}`);
  Logger.log(`Details: ${error.message}`);
  Logger.log(`Stack: ${error.stack}`);
}

/**
 * Trigger function that runs when the spreadsheet is edited
 */
function onEdit(e) {
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
 * Sets up time-based triggers for daily sync
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncAllLocationData') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a new daily trigger
  ScriptApp.newTrigger('syncAllLocationData')
    .timeBased()
    .everyDays(1)
    .atHour(1) // 1 AM
    .create();
  
  Logger.log('Daily sync trigger set up successfully');
}
