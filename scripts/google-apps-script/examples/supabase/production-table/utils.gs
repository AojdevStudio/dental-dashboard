/**
 * Iterates through the sheet, identifies rows with data in column A but no UUID in column M,
 * and logs them. UUIDs should only be generated in source sheets, not in the master sheet.
 */
function seedMissingUuids_() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = ss.getSheetByName(MASTER_DATA_TAB_NAME);
  const dataRange = sheet.getDataRange();
  const allValues = dataRange.getValues();

  const dataRows = allValues.slice(1); // Exclude header row
  const totalRows = dataRows.length;
  let missingUuids = 0;
  let rowsWithMissingUuids = [];

  for (let i = 0; i < totalRows; i++) {
    const row = dataRows[i];
    const dateValue = row[0];
    const uuidValue = row[12];

    if (dateValue && !uuidValue) {
      missingUuids++;
      rowsWithMissingUuids.push(i + 2); // +2 because we're 0-indexed and skipped header
    }
  }

  if (missingUuids > 0) {
    const ui = SpreadsheetApp.getUi();
    const message = `WARNING: Found ${missingUuids} rows with data but missing UUIDs in rows: ${rowsWithMissingUuids.join(', ')}.\n\n` +
                    `UUIDs should only be generated in source sheets, not in the master sheet.\n` +
                    `Please check the source sheets and ensure UUIDs are properly generated and transferred.`;
    ui.alert('Missing UUIDs Detected', message, ui.ButtonSet.OK);
    Logger.log(`Found ${missingUuids} rows with data but missing UUIDs in the master sheet.`);
  } else {
    Logger.log('No missing UUIDs found in rows with data in column A.');
  }
}

/**
 * Ensures that the UUID column exists in the master sheet.
 * If it doesn't exist, adds it as column M with the header 'uuid'.
 */
function ensureUuidColumn_() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = ss.getSheetByName(MASTER_DATA_TAB_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (!headers.includes('uuid')) {
    const uuidColumnIndex = 13; // Column M
    sheet.getRange(1, uuidColumnIndex).setValue('uuid');
    Logger.log('Added UUID column to master sheet.');
  }
}

/**
 * Validates a row of data before syncing to Supabase.
 * @param {Array} rowData The row data to validate
 * @return {boolean} Whether the row is valid for syncing
 */
function isValidRow_(rowData) {
  // Check if date exists and is not in the future
  const dateValue = rowData[0];
  if (!dateValue || !(dateValue instanceof Date) || dateValue > new Date()) {
    return false;
  }

  // Check if at least one production value exists (columns H through K)
  const productionValues = rowData.slice(7, 11);
  const hasProduction = productionValues.some(value =>
    typeof value === 'number' && !isNaN(value)
  );

  return hasProduction;
}

/**
 * Gets the last row with data in the specified sheet.
 * More reliable than getLastRow() as it checks for actual data.
 * @param {Sheet} sheet The sheet to check
 * @return {number} The last row with data
 */
function getLastDataRow_(sheet) {
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i].some(cell => cell !== '')) {
      return i + 1;
    }
  }
  return 1;
}