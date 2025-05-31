/**
 * @fileoverview Mapping module for the Adriane Hygienist Sync application.
 * 
 * This module contains functions for transforming data between different formats:
 * - Converting source sheet data to master sheet format
 * - Mapping column values between different schemas
 * - Normalizing and standardizing data values
 * - Handling data type conversions
 * 
 * The mapping module ensures that data is properly transformed and normalized
 * during the sync process, maintaining data integrity and consistency.
 */

/**
 * Builds a single row array formatted for the master sheet based on master headers.
 *
 * @param {string[]} masterHeaders An array of header names from the master sheet.
 * @param {any[]} sourceRowData An array representing a single row from the source sheet.
 * @param {string} sourceSheetName The name of the source sheet this row came from.
 * @returns {any[]} An array formatted for the master sheet row.
 * @throws {Error} If essential source data (like UUID) is missing unexpectedly (caught by calling function).
 */
function buildMasterRow_(masterHeaders, sourceRowData, sourceSheetName) {
  const masterRowOutput = Array(masterHeaders.length).fill(''); // Initialize empty row

  // Mapping based on known structure and constants
  const uuid = sourceRowData[UUID_COL_INDEX - 1];
  if (!uuid) {
    // This should ideally be caught before calling buildMasterRow_, but double-check
    throw new Error(`Attempted to build master row with missing UUID from sheet ${sourceSheetName}.`);
  }

  assignValue_(masterRowOutput, masterHeaders, 'date',                   sourceRowData[0]);  // Col A
  assignValue_(masterRowOutput, masterHeaders, 'hours_worked',           sourceRowData[1]);  // Col B
  assignValue_(masterRowOutput, masterHeaders, 'location',               DEFAULT_LOCATION); // Constant
  assignValue_(masterRowOutput, masterHeaders, 'provider_name',          PROVIDER_NAME);    // Constant
  assignValue_(masterRowOutput, masterHeaders, 'provider_type',          PROVIDER_TYPE);    // Constant
  assignValue_(masterRowOutput, masterHeaders, 'source_sheet',           sourceSheetName);  // Variable
  assignValue_(masterRowOutput, masterHeaders, 'production_goal_daily',  sourceRowData[4]);  // Col E
  assignValue_(masterRowOutput, masterHeaders, 'verified_production',    sourceRowData[3]);  // Col D
  assignValue_(masterRowOutput, masterHeaders, 'bonus',                  sourceRowData[6]);  // Col G
  assignValue_(masterRowOutput, masterHeaders, 'uuid',                   uuid);             // Col R (or as per UUID_COL_INDEX)

  // Add more assignValue_ calls here if needed for other columns

  return masterRowOutput;
}

/**
 * Safely assigns a value to the correct position in the output row array based on the header name.
 * Finds the index of the header name (case-insensitive) and places the value there.
 * If the header name is not found, it logs a warning but does not throw an error.
 *
 * @param {any[]} outputRow The array representing the row being built.
 * @param {string[]} headers The array of header names.
 * @param {string} headerName The name of the header column to assign the value to.
 * @param {*} value The value to assign. Null or undefined are converted to empty strings.
 */
function assignValue_(outputRow, headers, headerName, value) {
  const lowerCaseHeaderName = headerName.toLowerCase(); // Optimize: convert to lower case once
  const index = headers.findIndex(h => h.toString().toLowerCase() === lowerCaseHeaderName);
  if (index !== -1) {
    // Ensure null/undefined are stored as blanks in the sheet
    outputRow[index] = (value === null || value === undefined) ? '' : value;
  } else {
    // Log a warning if a header specified in the mapping isn't found in the actual sheet
    Logger.log(`Warning: Header "${headerName}" not found in master sheet headers during row construction.`);
  }
}