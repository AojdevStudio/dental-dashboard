/**
 * Logs sync operations to a dedicated sheet tab for debugging and monitoring
 * @param {string} functionName - Name of the function that generated the log
 * @param {string} status - Status of the operation (START, SUCCESS, ERROR, WARNING)
 * @param {number} rowsProcessed - Number of rows processed (null if not applicable)
 * @param {number} sheetsProcessed - Number of sheets processed (null if not applicable)
 * @param {number} duration - Duration in seconds (null if not applicable)
 * @param {string} message - Additional message or error details
 */
function logToHygieneSheet_(functionName, status, rowsProcessed, sheetsProcessed, duration, message) {
  try {
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    let logSheet = ss.getSheetByName(HYGIENE_LOG_TAB_NAME);
    
    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = ss.insertSheet(HYGIENE_LOG_TAB_NAME);
      
      // Set up headers
      const headers = [
        'Timestamp',
        'Function',
        'Status', 
        'Rows Processed',
        'Sheets Processed',
        'Duration (s)',
        'Message'
      ];
      logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = logSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      
      // Set column widths
      logSheet.setColumnWidth(1, 150); // Timestamp
      logSheet.setColumnWidth(2, 180); // Function
      logSheet.setColumnWidth(3, 100); // Status
      logSheet.setColumnWidth(4, 120); // Rows Processed
      logSheet.setColumnWidth(5, 120); // Sheets Processed
      logSheet.setColumnWidth(6, 100); // Duration
      logSheet.setColumnWidth(7, 300); // Message
    }
    
    // Add new log entry
    const timestamp = new Date();
    const newRow = [
      timestamp,
      functionName || 'Unknown',
      status || 'UNKNOWN',
      rowsProcessed !== null && rowsProcessed !== undefined ? rowsProcessed : '',
      sheetsProcessed !== null && sheetsProcessed !== undefined ? sheetsProcessed : '',
      duration !== null && duration !== undefined ? duration : '',
      message || ''
    ];
    
    logSheet.appendRow(newRow);
    
    // Color-code the status cell
    const lastRow = logSheet.getLastRow();
    const statusCell = logSheet.getRange(lastRow, 3);
    
    switch (status) {
      case 'START':
        statusCell.setBackground('#e3f2fd'); // Light blue
        break;
      case 'SUCCESS':
        statusCell.setBackground('#e8f5e8'); // Light green
        break;
      case 'ERROR':
        statusCell.setBackground('#ffebee'); // Light red
        break;
      case 'WARNING':
        statusCell.setBackground('#fff3e0'); // Light orange
        break;
    }
    
    // Keep only last 500 log entries to prevent sheet from getting too large
    const totalRows = logSheet.getLastRow();
    if (totalRows > 501) { // 500 + 1 header row
      const rowsToDelete = totalRows - 501;
      logSheet.deleteRows(2, rowsToDelete); // Delete from row 2 (after header)
    }
    
  } catch (logError) {
    // Fallback to console logging if sheet logging fails
    Logger.log(`Hygiene Log Error: ${logError.message}`);
    Logger.log(`Original log: ${functionName} | ${status} | ${message}`);
  }
}

/**
 * Ensures the log sheet exists and is properly formatted
 */
function ensureLogSheet_() {
  try {
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    let logSheet = ss.getSheetByName(HYGIENE_LOG_TAB_NAME);
    
    if (!logSheet) {
      // Create a new log entry to trigger sheet creation
      logToHygieneSheet_('ensureLogSheet', 'START', null, null, null, 'Log sheet created');
      Logger.log('Hygiene log sheet created successfully');
    } else {
      Logger.log('Hygiene log sheet already exists');
    }
    
  } catch (error) {
    Logger.log(`Error ensuring log sheet: ${error.message}`);
    throw error;
  }
}

/**
 * Clear old log entries (keep last 100)
 */
function clearOldLogs() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '🧹 Clear Old Logs', 
    'This will delete all but the most recent 100 log entries.\n\nContinue?', 
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
      const logSheet = ss.getSheetByName(HYGIENE_LOG_TAB_NAME);
      
      if (!logSheet) {
        ui.alert('❌ No log sheet found.');
        return;
      }
      
      const totalRows = logSheet.getLastRow();
      if (totalRows <= 101) { // 100 + 1 header row
        ui.alert('✅ No old logs to clear. Less than 100 entries found.');
        return;
      }
      
      const rowsToDelete = totalRows - 101;
      logSheet.deleteRows(2, rowsToDelete); // Delete from row 2 (after header)
      
      ui.alert(`✅ Cleared ${rowsToDelete} old log entries.\n\nKept most recent 100 entries.`);
      logToHygieneSheet_('clearOldLogs', 'SUCCESS', null, null, null, `Cleared ${rowsToDelete} old log entries`);
      
    } catch (error) {
      ui.alert(`❌ Error clearing logs: ${error.message}`);
      logToHygieneSheet_('clearOldLogs', 'ERROR', null, null, null, `Error: ${error.message}`);
    }
  }
}

/**
 * Export logs as CSV (for external analysis)
 */
function exportLogsAsCsv() {
  try {
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    const logSheet = ss.getSheetByName(HYGIENE_LOG_TAB_NAME);
    
    if (!logSheet) {
      SpreadsheetApp.getUi().alert('❌ No log sheet found.');
      return;
    }
    
    const data = logSheet.getDataRange().getValues();
    let csvContent = '';
    
    data.forEach(row => {
      const csvRow = row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
      csvContent += csvRow + '\n';
    });
    
    // Create a blob and save as CSV
    const blob = Utilities.newBlob(csvContent, 'text/csv', 'hygiene-sync-logs.csv');
    
    // Note: Apps Script can't directly download files, but we can create a temporary sheet
    const tempSheet = ss.insertSheet('Temp_CSV_Export');
    tempSheet.getRange(1, 1).setValue('CSV Content (copy this):');
    tempSheet.getRange(2, 1).setValue(csvContent);
    
    SpreadsheetApp.getUi().alert('✅ CSV export created in "Temp_CSV_Export" sheet.\n\nCopy the content and paste into a .csv file.\nDelete the temp sheet when done.');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Error exporting logs: ${error.message}`);
  }
}