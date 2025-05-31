/**
 * @fileoverview Utilities module for the Adriane Hygienist Sync application.
 * 
 * This module contains general-purpose utility functions used throughout the application:
 * - String manipulation and formatting
 * - Date and time handling
 * - Array and object processing
 * - Validation and type checking
 * - Common spreadsheet operations
 * 
 * The utilities module provides reusable helper functions that simplify
 * code in other modules and promote consistent implementation of common tasks.
 */

/**
 * Checks if a sheet name matches the expected monthly format (e.g., "Jan 2024", "Feb-24").
 * Uses a standard regex, adjust if needed for specific provider formats.
 *
 * @param {string} name The sheet name to test.
 * @returns {boolean} True if the name matches the pattern, false otherwise.
 */
function isMonthlySheet_(name) {
  if (!name || typeof name !== 'string') return false;
  // Regex: Month name (3 letters) + optional separator (space or hyphen) + year (2 or 4 digits)
  const monthlySheetRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s]?\d{2,4}$/i;
  return monthlySheetRegex.test(name.trim());
}

/**
 * Seeds UUID values for all rows in monthly sheets that are missing them.
 * This is typically run once during initial setup to ensure all existing
 * rows have UUIDs before starting the sync process.
 */
function seedAllMissingUuids_() {
  Logger.log(`Starting UUID seeding for ${PROVIDER_NAME} monthly sheets...`);
  const ss = SpreadsheetApp.openById(SOURCE_SHEET_ID);
  if (!ss) {
    throw new Error(`Cannot seed UUIDs: Source Spreadsheet not found or inaccessible (ID: ${SOURCE_SHEET_ID})`);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today

  let totalSeeded = 0;
  for (const sh of ss.getSheets()) {
    const sheetName = sh.getName();
    if (!isMonthlySheet_(sheetName)) continue;
    
    Logger.log(`Processing sheet: "${sheetName}"`);
    const lastRow = sh.getLastRow();
    if (lastRow < SOURCE_DATA_START_ROW) {
      Logger.log(`Skipping sheet "${sheetName}" - no data rows found.`);
      continue;
    }

    // --- Read Date (Col A), Verified Prod (Col D), and UUID (Col R) --- 
    // Determine the max column index needed
    const maxColIndex = Math.max(1, VER_PROD_COL_INDEX, UUID_COL_INDEX);
    const numRows = lastRow - SOURCE_DATA_START_ROW + 1;
    if (numRows <= 0) continue; // Skip if no data rows calculated

    const dataRange = sh.getRange(SOURCE_DATA_START_ROW, 1, numRows, maxColIndex);
    const values = dataRange.getValues();
    let sheetSeeded = 0;
    let changesMade = false; // Flag to track if we need to write back

    // --- Get source header to find Date column index reliably ---    
    const sourceHeaders = sh.getRange(SOURCE_HEADER_ROW, 1, 1, sh.getLastColumn()).getValues()[0];
    const dateColIndexSource = sourceHeaders.findIndex(h => h.toString().toLowerCase() === 'date'); // 0-based index

    for (let i = 0; i < values.length; i++) {
      const currentRow = values[i];
      const uuid = currentRow[UUID_COL_INDEX - 1]; // 0-based index

      // Only proceed if UUID is missing
      if (!uuid) {
        const dateValue = (dateColIndexSource !== -1) ? currentRow[dateColIndexSource] : null; // 0-based index for Date
        const verifiedProd = currentRow[VER_PROD_COL_INDEX - 1]; // 0-based index for Verified Production

        // --- Perform Checks ---
        // 1. Check Date validity and if it's in the future
        if (dateValue === null || dateValue === '' || !(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
          continue; // Skip if date is invalid/blank
        }
        const sourceDate = new Date(dateValue);
        sourceDate.setHours(0, 0, 0, 0);
        if (sourceDate > today) {
          continue; // Skip if date is in the future
        }

        // 2. Check if Verified Production is blank
        if (verifiedProd === null || verifiedProd === undefined || verifiedProd === '') {
          continue; // Skip if verified production is blank
        }
        // --- End Checks ---

        // If all checks pass, generate and assign UUID
        currentRow[UUID_COL_INDEX - 1] = Utilities.getUuid();
        sheetSeeded++;
        changesMade = true;
      } // End if(!uuid)
    } // End loop through rows

    if (changesMade) {
      // Write the modified values back to the original range
      dataRange.setValues(values);
      totalSeeded += sheetSeeded;
      Logger.log(`Added ${sheetSeeded} UUIDs to sheet "${sheetName}"`);
    } else {
      Logger.log(`No missing UUIDs requiring seeding found in sheet "${sheetName}"`);
    }
  } // End loop through sheets
  
  Logger.log(`UUID seeding completed. Added ${totalSeeded} UUIDs across all monthly sheets.`);
}