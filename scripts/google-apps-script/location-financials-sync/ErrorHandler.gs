/**
 * ========================================
 * LOCATION FINANCIAL ERROR HANDLER & LOGGING
 * ========================================
 * Comprehensive error handling and logging system
 * for location-based financial data synchronization
 */

/**
 * Logs a successful operation
 * @param {string} operation - Operation name
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
function logLocationFinancialOperation(operation, message, data = null) {
  try {
    const logEntry = createLocationFinancialLogEntry('INFO', operation, message, null, data);
    writeLocationFinancialLogEntry(logEntry);
    
    // Also log to console for debugging
    console.info(`[${operation}] ${message}`, data || '');
    
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}

/**
 * Logs an error with full context
 * @param {string} operation - Operation that failed
 * @param {string} message - Error message
 * @param {Error|string} error - Error object or string
 * @param {Object} context - Additional context data
 */
function logLocationFinancialError(operation, message, error, context = null) {
  try {
    const errorDetails = {
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack || null,
      name: error?.name || null,
      context: context
    };
    
    const logEntry = createLocationFinancialLogEntry('ERROR', operation, message, errorDetails);
    writeLocationFinancialLogEntry(logEntry);
    
    // Also log to console
    console.error(`[${operation}] ${message}:`, errorDetails);
    
    // Send email notification if configured and error is critical
    if (isCriticalError(operation, error)) {
      sendLocationFinancialErrorNotification(operation, message, errorDetails);
    }
    
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Logs a warning
 * @param {string} operation - Operation name
 * @param {string} message - Warning message
 * @param {Object} data - Additional data
 */
function logLocationFinancialWarning(operation, message, data = null) {
  try {
    const logEntry = createLocationFinancialLogEntry('WARNING', operation, message, null, data);
    writeLocationFinancialLogEntry(logEntry);
    
    console.warn(`[${operation}] ${message}`, data || '');
    
  } catch (error) {
    console.error('Failed to log warning:', error);
  }
}

/**
 * Creates a standardized log entry object
 * @param {string} level - Log level (INFO, WARNING, ERROR)
 * @param {string} operation - Operation name
 * @param {string} message - Log message
 * @param {Object} errorDetails - Error details (for ERROR level)
 * @param {Object} data - Additional data
 * @returns {Object} Log entry object
 */
function createLocationFinancialLogEntry(level, operation, message, errorDetails = null, data = null) {
  return {
    timestamp: new Date(),
    level: level,
    operation: operation,
    message: message,
    errorDetails: errorDetails,
    data: data,
    sessionId: getLocationFinancialSessionId(),
    version: '1.0.0',
    user: Session.getActiveUser().getEmail() || 'Unknown'
  };
}

/**
 * Writes a log entry to the log sheet
 * @param {Object} logEntry - Log entry to write
 */
function writeLocationFinancialLogEntry(logEntry) {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    let logSheet = null;
    
    // Try to get existing log sheet
    try {
      logSheet = spreadsheet.getSheetByName(LOCATION_FINANCIAL_LOG_TAB_NAME);
    } catch (error) {
      // Sheet doesn't exist, create it
      logSheet = createLocationFinancialLogSheet(spreadsheet);
    }
    
    // Prepare row data
    const rowData = [
      Utilities.formatDate(logEntry.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      logEntry.level,
      logEntry.operation,
      logEntry.message,
      logEntry.errorDetails ? JSON.stringify(logEntry.errorDetails) : '',
      logEntry.data ? JSON.stringify(logEntry.data) : '',
      logEntry.sessionId,
      logEntry.user
    ];
    
    // Add row to sheet
    logSheet.appendRow(rowData);
    
    // Clean up old entries if needed
    cleanupLocationFinancialLogEntries(logSheet);
    
  } catch (error) {
    console.error('Failed to write log entry:', error);
  }
}

/**
 * Creates the log sheet with proper headers
 * @param {Spreadsheet} spreadsheet - Spreadsheet object
 * @returns {Sheet} Created log sheet
 */
function createLocationFinancialLogSheet(spreadsheet) {
  const logSheet = spreadsheet.insertSheet(LOCATION_FINANCIAL_LOG_TAB_NAME);
  
  // Set up headers
  const headers = [
    'Timestamp',
    'Level',
    'Operation',
    'Message',
    'Error Details',
    'Data',
    'Session ID',
    'User'
  ];
  
  logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = logSheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  logSheet.setColumnWidth(1, 150); // Timestamp
  logSheet.setColumnWidth(2, 80);  // Level
  logSheet.setColumnWidth(3, 120); // Operation
  logSheet.setColumnWidth(4, 300); // Message
  logSheet.setColumnWidth(5, 400); // Error Details
  logSheet.setColumnWidth(6, 200); // Data
  logSheet.setColumnWidth(7, 100); // Session ID
  logSheet.setColumnWidth(8, 150); // User
  
  logLocationFinancialOperation('LOG_SETUP', 'Created log sheet');
  
  return logSheet;
}

/**
 * Cleans up old log entries to prevent sheet from growing too large
 * @param {Sheet} logSheet - Log sheet
 */
function cleanupLocationFinancialLogEntries(logSheet) {
  try {
    const lastRow = logSheet.getLastRow();
    
    // Only cleanup if we have more than the maximum allowed entries
    if (lastRow <= ERROR_CONFIG.MAX_LOG_ENTRIES + 1) { // +1 for header
      return;
    }
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ERROR_CONFIG.LOG_RETENTION_DAYS);
    
    // Get timestamp column (column 1)
    const timestampRange = logSheet.getRange(2, 1, lastRow - 1, 1);
    const timestamps = timestampRange.getValues();
    
    let rowsToDelete = 0;
    
    // Count rows older than cutoff
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = new Date(timestamps[i][0]);
      if (timestamp < cutoffDate) {
        rowsToDelete++;
      } else {
        break; // Assuming timestamps are in chronological order
      }
    }
    
    // Delete old rows if any
    if (rowsToDelete > 0) {
      logSheet.deleteRows(2, rowsToDelete);
      logLocationFinancialOperation('LOG_CLEANUP', `Cleaned up ${rowsToDelete} old log entries`);
    }
    
  } catch (error) {
    console.error('Failed to cleanup log entries:', error);
  }
}

/**
 * Gets or creates a session ID for tracking related operations
 * @returns {string} Session ID
 */
function getLocationFinancialSessionId() {
  const cacheKey = 'location_financial_session_id';
  const cache = CacheService.getScriptCache();
  
  let sessionId = cache.get(cacheKey);
  
  if (!sessionId) {
    sessionId = Utilities.getUuid().substring(0, 8);
    cache.put(cacheKey, sessionId, 3600); // 1 hour
  }
  
  return sessionId;
}

/**
 * Determines if an error is critical and requires notification
 * @param {string} operation - Operation that failed
 * @param {Error|string} error - Error object or string
 * @returns {boolean} True if error is critical
 */
function isCriticalError(operation, error) {
  const criticalOperations = ['API_CALL', 'CREDENTIALS', 'SETUP'];
  const criticalErrorPatterns = [
    /authentication/i,
    /authorization/i,
    /network/i,
    /timeout/i,
    /quota/i
  ];
  
  // Check if operation is critical
  if (criticalOperations.includes(operation)) {
    return true;
  }
  
  // Check if error message matches critical patterns
  const errorMessage = error?.message || error?.toString() || '';
  return criticalErrorPatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Sends error notification email if configured
 * @param {string} operation - Failed operation
 * @param {string} message - Error message
 * @param {Object} errorDetails - Error details
 */
function sendLocationFinancialErrorNotification(operation, message, errorDetails) {
  try {
    if (!ERROR_CONFIG.ENABLE_EMAIL_ALERTS || !ERROR_CONFIG.NOTIFICATION_EMAIL) {
      return;
    }
    
    const subject = `Location Financial Sync Error: ${operation}`;
    const body = `
Location Financial Sync Error Report

Operation: ${operation}
Message: ${message}
Timestamp: ${new Date().toISOString()}
User: ${Session.getActiveUser().getEmail()}
Session ID: ${getLocationFinancialSessionId()}

Error Details:
${JSON.stringify(errorDetails, null, 2)}

Please check the sync logs for more information.

---
This is an automated message from Location Financial Sync.
    `.trim();
    
    MailApp.sendEmail({
      to: ERROR_CONFIG.NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    logLocationFinancialOperation('EMAIL_ALERT', 'Error notification sent');
    
  } catch (error) {
    console.error('Failed to send error notification:', error);
  }
}

/**
 * Displays the sync logs to the user
 */
function viewLocationFinancialSyncLogs() {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    let logSheet = null;
    
    try {
      logSheet = spreadsheet.getSheetByName(LOCATION_FINANCIAL_LOG_TAB_NAME);
    } catch (error) {
      SpreadsheetApp.getUi().alert(
        'No Logs Found',
        'No sync logs have been created yet. Run a sync operation first.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    // Activate the log sheet to show it to the user
    logSheet.activate();
    
    // Get recent log summary
    const summary = getLocationFinancialLogSummary(logSheet);
    
    SpreadsheetApp.getUi().alert(
      'Sync Logs',
      `📋 Log Summary:\n\n` +
      `📊 Total entries: ${summary.totalEntries}\n` +
      `✅ Info: ${summary.infoCount}\n` +
      `⚠️ Warnings: ${summary.warningCount}\n` +
      `❌ Errors: ${summary.errorCount}\n\n` +
      `📅 Last entry: ${summary.lastEntry}\n\n` +
      `The log sheet is now active. You can review detailed logs there.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    logLocationFinancialError('VIEW_LOGS', 'Failed to display logs', error);
    SpreadsheetApp.getUi().alert(`❌ Error viewing logs: ${error.message}`);
  }
}

/**
 * Gets a summary of log entries
 * @param {Sheet} logSheet - Log sheet
 * @returns {Object} Log summary
 */
function getLocationFinancialLogSummary(logSheet) {
  const lastRow = logSheet.getLastRow();
  
  if (lastRow <= 1) {
    return {
      totalEntries: 0,
      infoCount: 0,
      warningCount: 0,
      errorCount: 0,
      lastEntry: 'None'
    };
  }
  
  // Get level column (column 2)
  const levelRange = logSheet.getRange(2, 2, lastRow - 1, 1);
  const levels = levelRange.getValues().flat();
  
  // Get timestamp column for last entry
  const timestampRange = logSheet.getRange(lastRow, 1, 1, 1);
  const lastTimestamp = timestampRange.getValue();
  
  const summary = {
    totalEntries: levels.length,
    infoCount: levels.filter(level => level === 'INFO').length,
    warningCount: levels.filter(level => level === 'WARNING').length,
    errorCount: levels.filter(level => level === 'ERROR').length,
    lastEntry: Utilities.formatDate(lastTimestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
  };
  
  return summary;
}

/**
 * Gets sync statistics for user display
 */
function getLocationFinancialSyncStatistics() {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    let logSheet = null;
    
    try {
      logSheet = spreadsheet.getSheetByName(LOCATION_FINANCIAL_LOG_TAB_NAME);
    } catch (error) {
      SpreadsheetApp.getUi().alert(
        'No Statistics Available',
        'No sync logs found. Run a sync operation first to see statistics.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    const stats = calculateLocationFinancialSyncStatistics(logSheet);
    
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '📊 Sync Statistics',
      `📈 Sync Performance:\n\n` +
      `🔄 Total syncs: ${stats.totalSyncs}\n` +
      `✅ Successful: ${stats.successfulSyncs}\n` +
      `❌ Failed: ${stats.failedSyncs}\n` +
      `📊 Success rate: ${stats.successRate}%\n\n` +
      `📅 Last sync: ${stats.lastSync}\n` +
      `⏱️ Average duration: ${stats.averageDuration}s\n\n` +
      `🏢 Locations processed:\n` +
      `   • Baytown: ${stats.baytownSyncs} times\n` +
      `   • Humble: ${stats.humbleSyncs} times`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    logLocationFinancialError('SYNC_STATS', 'Failed to get sync statistics', error);
    SpreadsheetApp.getUi().alert(`❌ Error getting statistics: ${error.message}`);
  }
}

/**
 * Calculates sync statistics from log data
 * @param {Sheet} logSheet - Log sheet
 * @returns {Object} Statistics object
 */
function calculateLocationFinancialSyncStatistics(logSheet) {
  const lastRow = logSheet.getLastRow();
  
  if (lastRow <= 1) {
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      successRate: 0,
      lastSync: 'None',
      averageDuration: 0,
      baytownSyncs: 0,
      humbleSyncs: 0
    };
  }
  
  // Get relevant columns
  const dataRange = logSheet.getRange(2, 1, lastRow - 1, 8);
  const data = dataRange.getValues();
  
  let totalSyncs = 0;
  let successfulSyncs = 0;
  let failedSyncs = 0;
  let baytownSyncs = 0;
  let humbleSyncs = 0;
  let lastSyncTime = null;
  
  // Analyze log entries
  data.forEach(row => {
    const [timestamp, level, operation, message] = row;
    
    if (operation.includes('SYNC')) {
      if (level === 'INFO' && message.includes('completed')) {
        totalSyncs++;
        successfulSyncs++;
        
        if (message.includes('Baytown')) {
          baytownSyncs++;
        } else if (message.includes('Humble')) {
          humbleSyncs++;
        }
        
        if (!lastSyncTime || timestamp > lastSyncTime) {
          lastSyncTime = timestamp;
        }
      } else if (level === 'ERROR') {
        totalSyncs++;
        failedSyncs++;
      }
    }
  });
  
  const successRate = totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 0;
  const lastSync = lastSyncTime ? 
    Utilities.formatDate(lastSyncTime, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : 
    'None';
  
  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    successRate,
    lastSync,
    averageDuration: 0, // TODO: Calculate from timing data
    baytownSyncs,
    humbleSyncs
  };
}

/**
 * Clears old log entries
 */
function clearOldLocationFinancialLogs() {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    let logSheet = null;
    
    try {
      logSheet = spreadsheet.getSheetByName(LOCATION_FINANCIAL_LOG_TAB_NAME);
    } catch (error) {
      SpreadsheetApp.getUi().alert(
        'No Logs Found',
        'No sync logs found to clear.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Clear Old Logs',
      `This will remove log entries older than ${ERROR_CONFIG.LOG_RETENTION_DAYS} days.\n\nAre you sure you want to continue?`,
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      cleanupLocationFinancialLogEntries(logSheet);
      
      ui.alert(
        'Logs Cleared',
        'Old log entries have been removed successfully.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    logLocationFinancialError('CLEAR_LOGS', 'Failed to clear old logs', error);
    SpreadsheetApp.getUi().alert(`❌ Error clearing logs: ${error.message}`);
  }
}