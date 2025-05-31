/**
 * @fileoverview Logging module for the Adriane Hygienist Sync application.
 * 
 * This module contains functions for logging application events and metrics:
 * - Recording sync execution details
 * - Tracking performance metrics
 * - Logging errors and warnings
 * - Maintaining audit trails
 * 
 * The logging module provides visibility into the application's operation,
 * facilitating debugging, performance optimization, and compliance requirements.
 */

/**
 * Logs a summary of a sync run to the designated log sheet.
 *
 * @param {Date} startTime The Date object marking the start of the run.
 * @param {string} status The final status ('Success' or 'Failure').
 * @param {number} inspected Total rows checked in source sheets.
 * @param {number} noUuid Rows skipped due to missing UUID.
 * @param {number} duplicate Rows skipped because UUID already exists in master.
 * @param {number} added Rows successfully added to the master sheet.
 * @param {number} durationSeconds The duration of the run in seconds.
 * @param {string} [errorMessage=''] Optional error message if status is 'Failure'.
 */
function logRun_(startTime, status, inspected, noUuid, duplicate, added, durationSeconds, errorMessage = '') {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
    if (!ss) {
      Logger.log(`ERROR: Cannot log run - Master Spreadsheet not found or inaccessible (ID: ${MASTER_SHEET_ID})`);
      return; // Cannot log if master sheet is inaccessible
    }
    const logSheet = ss.getSheetByName(LOG_TAB_NAME);
    if (!logSheet) {
      Logger.log(`ERROR: Log sheet "${LOG_TAB_NAME}" not found. Cannot log run.`);
      // Attempt to recreate log sheet if missing? Could lead to infinite loop if master ID is wrong.
      // try { ensureLogSheet_(); logSheet = ss.getSheetByName(LOG_TAB_NAME); } catch(e) { Logger.log("Failed to recreate log sheet."); return; }
      // If ensureLogSheet failed earlier, logSheet might still be null.
      if (!logSheet) return; // Stop if still missing after potential recreation attempt
    }

    // Append the log entry - use ISOString for date consistency if preferred, or default Date object format
    logSheet.appendRow([
      startTime, //.toISOString(), // Use start time for timestamp consistency
      status,
      inspected,
      noUuid,
      duplicate,
      added,
      durationSeconds.toFixed(2), // Format duration
      errorMessage
    ]);
  } catch (logErr) {
    // If logging itself fails, log to the Apps Script logger
    Logger.log(`CRITICAL ERROR: Failed to write to log sheet "${LOG_TAB_NAME}". Status: ${status}, Added: ${added}. Error: ${logErr.message}\n${logErr.stack}`);
    // Optionally notify about the logging failure itself
    notifyError_('logRun_', logErr, `Failed to log run results. Status: ${status}.`);
  }
}