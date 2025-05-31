/**
 * Ensures the Supabase log sheet exists and has headers.
 */
function ensureLogSheet_() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  let sheet = ss.getSheetByName(SUPABASE_LOG_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SUPABASE_LOG_TAB_NAME);
    // Added Duration
    const headers = [['Timestamp', 'Function Name', 'Status', 'Rows Processed', 'Rows Attempted', 'Duration (ms)', 'Message']];
    sheet.appendRow(headers[0]);
    sheet.setFrozenRows(1);
    // Optional: Formatting
    sheet.getRange("A1:G1").setFontWeight("bold");
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 180); // Function Name
    sheet.setColumnWidth(3, 100); // Status
    sheet.setColumnWidth(4, 100); // Rows Processed
    sheet.setColumnWidth(5, 100); // Rows Attempted
    sheet.setColumnWidth(6, 100); // Duration
    sheet.setColumnWidth(7, 500); // Message
    Logger.log(`Created log sheet: "${SUPABASE_LOG_TAB_NAME}"`);
  }
  return sheet;
}

/**
 * Logs a message to the dedicated Supabase log sheet.
 * @param {string} functionName The name of the function logging the message.
 * @param {string} status The status (e.g., START, SUCCESS, ERROR, BATCH_ERROR).
 * @param {number | null} rowsProcessed Number of rows successfully processed.
 * @param {number | null} rowsAttempted Total number of rows attempted in the operation.
 * @param {number | null} durationMs Duration of the operation in milliseconds.
 * @param {string} message The log message or error details.
 */
function logToSupabaseSheet_(functionName, status, rowsProcessed, rowsAttempted, durationMs, message) {
  try {
    const logSheet = ensureLogSheet_(); // Ensure sheet exists before logging
    const timestamp = new Date();
    // Ensure message is string and truncate if needed
    let logMessage = message === null || message === undefined ? '' : message;
    logMessage = (typeof logMessage !== 'string' ? JSON.stringify(logMessage) : logMessage).substring(0, 1000);
    logSheet.appendRow([
        timestamp,
        functionName,
        status,
        rowsProcessed,
        rowsAttempted,
        durationMs, // Added duration
        logMessage
     ]);
  } catch(e) {
      Logger.log(`Failed to write to log sheet "${SUPABASE_LOG_TAB_NAME}": ${e.message}`);
      // Log error to standard execution log if sheet logging fails
  }
} 