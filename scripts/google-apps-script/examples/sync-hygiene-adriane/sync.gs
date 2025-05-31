/**
 * @fileoverview Sync module for the Adriane Hygienist Sync application.
 * 
 * This module contains the core synchronization functionality:
 * - Reading data from source sheets
 * - Identifying new records based on UUIDs
 * - Transforming data to the master sheet format
 * - Writing new records to the master sheet
 * - Handling sync errors and edge cases
 * 
 * The sync module is responsible for the primary data transfer process,
 * ensuring that data is accurately and efficiently moved from source sheets
 * to the master sheet.
 */

/**
 * Synchronizes data from the provider's source monthly sheets to the master sheet.
 * Identifies new rows based on UUIDs and appends them to the master data tab.
 * Logs the execution details to the log tab.
 */
function syncToExternalMaster() { // Name already conforms
  const functionName = SYNC_FUNCTION_NAME; // Use constant
  const runStart = new Date();
  let status = 'Success';
  let errorMessage = '';
  let inspected = 0;
  let skippedNoUuid = 0;
  let skippedDup = 0;
  let added = 0;

  try {
    Logger.log(`Starting sync for ${PROVIDER_NAME}...`);
    Logger.log(`Master URL → ${SpreadsheetApp.openById(MASTER_SHEET_ID).getUrl()}`);

    // --- Open Spreadsheets ---
    const sourceSpreadsheet = SpreadsheetApp.openById(SOURCE_SHEET_ID);
    if (!sourceSpreadsheet) throw new Error(`Source Spreadsheet not found or inaccessible (ID: ${SOURCE_SHEET_ID})`);

    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SHEET_ID);
    if (!masterSpreadsheet) throw new Error(`Master Spreadsheet not found or inaccessible (ID: ${MASTER_SHEET_ID})`);

    const masterSheet = masterSpreadsheet.getSheetByName(MASTER_TAB_NAME);
    if (!masterSheet) throw new Error(`Master tab "${MASTER_TAB_NAME}" not found in Master Sheet (ID: ${MASTER_SHEET_ID})`);

    // --- Get Master Sheet Headers and UUID Column Index ---
    const masterLastCol = masterSheet.getLastColumn();
    // Ensure header row has content before reading
    if (masterLastCol === 0 || masterSheet.getLastRow() === 0) {
       throw new Error(`Master tab "${MASTER_TAB_NAME}" appears to be empty or header row is missing.`);
    }
    const masterHeaders = masterSheet.getRange(1, 1, 1, masterLastCol).getValues()[0];
    const uuidMasterColIndex = masterHeaders.findIndex(h => h.toString().toLowerCase() === 'uuid'); // 0-based index

    if (uuidMasterColIndex === -1) throw new Error('Column "uuid" not found in master header row 1.');

    // --- Build Set of Existing UUIDs from Master Sheet ---
    const masterLastRow = masterSheet.getLastRow();
    const existingUuids = new Set();
    if (masterLastRow > 1) { // Check if there's any data beyond the header
      const uuidValues = masterSheet.getRange(2, uuidMasterColIndex + 1, masterLastRow - 1, 1)
                                  .getValues()
                                  .flat() // Convert 2D array to 1D
                                  .filter(String); // Remove empty strings/nulls
      for (const uuid of uuidValues) {
          existingUuids.add(uuid);
      }
    }
    Logger.log(`Found ${existingUuids.size} existing UUIDs in master sheet.`);

    // --- Process Source Sheets ---
    const rowsToAppendBatch = [];
    const sourceSheets = sourceSpreadsheet.getSheets();
    const today = new Date(); // Get current date once
    today.setHours(0, 0, 0, 0); // Normalize to midnight for date-only comparison

    for (const sheet of sourceSheets) { // Use for...of
      const sheetName = sheet.getName();
      if (!isMonthlySheet_(sheetName)) continue; // Skip non-monthly sheets

      Logger.log(`Processing sheet: "${sheetName}"`);
      const lastRow = sheet.getLastRow();
      // Check if sheet has data rows (i.e., last row is at least the starting data row)
      if (lastRow < SOURCE_DATA_START_ROW) {
        Logger.log(`Skipping sheet "${sheetName}" - no data found starting from row ${SOURCE_DATA_START_ROW}.`);
        continue; // Skips this sheet if no data rows.
      }

      // Read all data from the current sheet
      const sheetData = sheet.getRange(SOURCE_DATA_START_ROW, 1, lastRow - SOURCE_DATA_START_ROW + 1, sheet.getLastColumn()).getValues();
      // --- IMPROVEMENT: Also read headers from the source sheet to find date column index reliably ---
      const sourceHeaders = sheet.getRange(SOURCE_HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
      const dateColIndexSource = sourceHeaders.findIndex(h => h.toString().toLowerCase() === 'date'); // 0-based index
      // -----------------------------------------------------------------------------------------

      for (const [index, row] of sheetData.entries()) { // Use for...of with entries
        const sourceRowNum = SOURCE_DATA_START_ROW + index; // For logging/debugging

        // --- NEW DEBUG LOG --- 
        const rawDateValue = (dateColIndexSource !== -1) ? row[dateColIndexSource] : null;
        const jsDate = rawDateValue instanceof Date ? rawDateValue : null;
        Logger.log(
          `Row ${sourceRowNum}: sheet shows ${rawDateValue}, JS sees ${jsDate} (toLocaleDateString=${jsDate?.toLocaleDateString()})`
        );
        // --- END NEW DEBUG LOG ---

        inspected++;
        const uuid = row[UUID_COL_INDEX - 1]; // Adjust for 0-based index
        const verifiedProd = row[VER_PROD_COL_INDEX - 1]; // 0-based index for Verified Production
        const dateValue = (dateColIndexSource !== -1) ? row[dateColIndexSource] : null; // Get date value using dynamic index

        // --- NEW CHECKS ---
        // 1. Skip if Date is blank or invalid
        if (dateValue === null || dateValue === '' || !(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
            // Logger.log(`Skipping row ${sourceRowNum} in "${sheetName}": Invalid or blank date.`); // Optional detailed log
            continue;
        }

        // 2. Normalize source date and check if it's in the future
        const sourceDate = new Date(dateValue);
        sourceDate.setHours(0, 0, 0, 0); // Normalize source date
        if (sourceDate > today) {
            // Logger.log(`Skipping row ${sourceRowNum} in "${sheetName}": Date ${sourceDate.toDateString()} is in the future.`); // Optional detailed log
            continue;
        }

        // 3. Skip if Verified Production is blank (null, undefined, or empty string)
        //    Allow 0 as a valid value.
        if (verifiedProd === null || verifiedProd === undefined || verifiedProd === '') {
            // Logger.log(`Skipping row ${sourceRowNum} in "${sheetName}": Verified Production is blank.`); // Optional detailed log
            continue;
        }
        // --- END NEW CHECKS ---

        if (!uuid) {
          skippedNoUuid++;
          continue; // Skips this row if UUID is missing
        }

        if (existingUuids.has(uuid)) {
          skippedDup++;
          continue; // Skips this row if UUID is duplicate
        }

        // --- Build Row for Master Sheet ---
        try {
           const masterRow = buildMasterRow_(masterHeaders, row, sheetName);
           rowsToAppendBatch.push(masterRow);
           existingUuids.add(uuid); // Add newly found UUID to prevent adding duplicates from within the same run
           added++;
        } catch (buildErr) {
           Logger.log(`Error building master row from source sheet "${sheetName}", row ${sourceRowNum}: ${buildErr.message}`);
           // Optionally skip this row or handle differently if build fails
           // Depending on requirements, you might want to 'return;' here too,
           // or add to a list of failed rows. Current behavior logs and continues.
        }
      } // End inner for...of loop
    } // End outer for...of loop

    // Before writing data
    const initialRowCount = masterSheet.getLastRow();
    Logger.log(`Initial row count in master sheet: ${initialRowCount}`);
    Logger.log(`Attempting to write ${rowsToAppendBatch.length} rows x ${rowsToAppendBatch[0]?.length || 0} columns`);
    
    // Write the data
    if (rowsToAppendBatch.length > 0) {
      const targetRowNum = masterSheet.getLastRow() + 1;
      const targetColNum = 1;
      const numRowsToAppend = rowsToAppendBatch.length;
      const numColsToAppend = masterHeaders.length; // Use length of headers array

      if (numColsToAppend > 0) { // Ensure headers were read correctly
        const targetRange = masterSheet.getRange(
          targetRowNum,
          targetColNum,
          numRowsToAppend,
          numColsToAppend
        );
        targetRange.setValues(rowsToAppendBatch);
        
        // Verify write operation
        const finalRowCount = masterSheet.getLastRow();
        const rowsAdded = finalRowCount - initialRowCount;
        Logger.log(`Final row count: ${finalRowCount}`);
        Logger.log(`Rows actually added: ${rowsAdded}`);
        
        if (rowsAdded !== rowsToAppendBatch.length) {
          Logger.log(`Warning: Expected to add ${rowsToAppendBatch.length} rows but actually added ${rowsAdded} rows`);
        }
      } else {
          throw new Error("Master header length is zero. Cannot determine number of columns to append.");
      }
    } else {
      Logger.log('No new rows found to append.');
    }

  } catch (err) {
    Logger.log(`ERROR in ${functionName}: ${err.message}\n${err.stack}`);
    status = 'Failure';
    errorMessage = err.message;
    notifyError_(functionName, err); // Notify on failure
  } finally {
    // --- Log Execution Summary ---
    const runEnd = new Date();
    const durationSeconds = (runEnd.getTime() - runStart.getTime()) / 1000;
    logRun_(runStart, status, inspected, skippedNoUuid, skippedDup, added, durationSeconds, errorMessage);
    Logger.log(`${functionName} finished. Status: ${status}. Duration: ${durationSeconds.toFixed(2)}s. Added: ${added}.`);
  }
}