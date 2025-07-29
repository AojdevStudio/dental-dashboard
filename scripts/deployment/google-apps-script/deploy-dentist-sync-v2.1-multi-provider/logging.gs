/**
 * Enhanced logging system with correlation IDs and structured data
 * Logs sync operations to a dedicated sheet tab for debugging and monitoring
 * @param {string} functionName - Name of the function that generated the log
 * @param {string} status - Status of the operation (START, SUCCESS, ERROR, WARNING, INFO)
 * @param {number} rowsProcessed - Number of rows processed (null if not applicable)
 * @param {number} sheetsProcessed - Number of sheets processed (null if not applicable)
 * @param {number} duration - Duration in seconds (null if not applicable)
 * @param {string} message - Additional message or error details
 * @param {Object} metadata - Additional structured data (optional)
 * @param {string} correlationId - Correlation ID for request tracing (optional)
 */
function logWithMetadata(functionName, status, rowsProcessed, sheetsProcessed, duration, message, metadata = null, correlationId = null) {
  try {
    // Generate correlation ID if not provided
    const corrId = correlationId || generateCorrelationId_();
    
    // Enhanced message with metadata
    let enhancedMessage = message;
    if (metadata) {
      const metadataString = JSON.stringify(metadata, null, 2);
      enhancedMessage = `${message}\n\nMetadata: ${metadataString}`;
    }
    
    // Add correlation ID to message
    enhancedMessage = `[${corrId}] ${enhancedMessage}`;
    
    // Call the original logging function
    logToDentistSheet_(functionName, status, rowsProcessed, sheetsProcessed, duration, enhancedMessage);
    
    // Also log to console for debugging
    Logger.log(`${status} | ${functionName} | ${corrId} | ${message}`);
    
  } catch (error) {
    Logger.log(`Enhanced logging error: ${error.message}`);
    // Fallback to basic logging
    logToDentistSheet_(functionName, status, rowsProcessed, sheetsProcessed, duration, message);
  }
}

/**
 * Generate a unique correlation ID for tracking operations
 * @return {string} Correlation ID in format: YYYYMMDD-HHMMSS-XXXX
 */
function generateCorrelationId_() {
  const now = new Date();
  const datePart = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${datePart}-${randomPart}`;
}

/**
 * Log database operations with timing and performance data
 * @param {string} operation - Database operation name
 * @param {string} endpoint - API endpoint or table name
 * @param {number} startTime - Operation start time (Date.now())
 * @param {string} status - Operation status (SUCCESS, ERROR, RETRY)
 * @param {Object} details - Operation details (query params, response size, etc.)
 * @param {string} correlationId - Correlation ID for tracing
 */
function logDatabaseOperation(operation, endpoint, startTime, status, details = {}, correlationId = null) {
  const duration = (Date.now() - startTime) / 1000; // Convert to seconds
  const corrId = correlationId || generateCorrelationId_();
  
  const metadata = {
    operation: operation,
    endpoint: endpoint,
    status: status,
    duration_ms: Date.now() - startTime,
    performance_level: duration > 3 ? 'SLOW' : duration > 1 ? 'NORMAL' : 'FAST',
    ...details
  };
  
  const message = `DB Operation: ${operation} on ${endpoint} - ${status} (${duration.toFixed(2)}s)`;
  
  const logStatus = status === 'SUCCESS' ? 'SUCCESS' : status === 'ERROR' ? 'ERROR' : 'WARNING';
  
  logWithMetadata('DATABASE_OPERATION', logStatus, null, null, duration, message, metadata, corrId);
}

/**
 * Log provider detection operations with confidence scoring
 * @param {string} providerCode - Provider code being detected
 * @param {string} method - Detection method (static, auto-discovery, database)
 * @param {number} confidence - Confidence score (0-1)
 * @param {string} result - Detection result
 * @param {Object} context - Additional context data
 * @param {string} correlationId - Correlation ID for tracing
 */
function logProviderDetection(providerCode, method, confidence, result, context = {}, correlationId = null) {
  const corrId = correlationId || generateCorrelationId_();
  
  const metadata = {
    provider_code: providerCode,
    detection_method: method,
    confidence_score: confidence,
    result: result,
    context: context
  };
  
  const message = `Provider Detection: ${providerCode} via ${method} - ${result} (confidence: ${(confidence * 100).toFixed(1)}%)`;
  
  const status = confidence >= 0.8 ? 'SUCCESS' : confidence >= 0.5 ? 'WARNING' : 'ERROR';
  
  logWithMetadata('PROVIDER_DETECTION', status, null, null, null, message, metadata, corrId);
}

/**
 * Log credential resolution operations
 * @param {string} credentialType - Type of credentials (sync, provider, location)
 * @param {string} systemName - System name requesting credentials
 * @param {string} result - Resolution result
 * @param {Object} resolved - Resolved credential data
 * @param {string} correlationId - Correlation ID for tracing
 */
function logCredentialResolution(credentialType, systemName, result, resolved = {}, correlationId = null) {
  const corrId = correlationId || generateCorrelationId_();
  
  const metadata = {
    credential_type: credentialType,
    system_name: systemName,
    result: result,
    resolved_fields: Object.keys(resolved),
    has_clinic_id: !!resolved.clinicId,
    has_provider_id: !!resolved.providerId,
    has_location_id: !!resolved.locationId
  };
  
  const message = `Credential Resolution: ${credentialType} for ${systemName} - ${result}`;
  
  const status = result === 'SUCCESS' ? 'SUCCESS' : 'ERROR';
  
  logWithMetadata('CREDENTIAL_RESOLUTION', status, null, null, null, message, metadata, corrId);
}

/**
 * Log cache operations for performance monitoring
 * @param {string} operation - Cache operation (HIT, MISS, SET, EXPIRE)
 * @param {string} cacheKey - Cache key
 * @param {number} size - Data size (optional)
 * @param {string} correlationId - Correlation ID for tracing
 */
function logCacheOperation(operation, cacheKey, size = null, correlationId = null) {
  const corrId = correlationId || generateCorrelationId_();
  
  const metadata = {
    cache_operation: operation,
    cache_key: cacheKey,
    data_size: size,
    timestamp: new Date().toISOString()
  };
  
  const message = `Cache ${operation}: ${cacheKey}${size ? ` (${size} bytes)` : ''}`;
  
  logWithMetadata('CACHE_OPERATION', 'INFO', null, null, null, message, metadata, corrId);
}

/**
 * ORIGINAL LOGGING FUNCTION (Enhanced)
 * Logs sync operations to a dedicated sheet tab for debugging and monitoring
 * @param {string} functionName - Name of the function that generated the log
 * @param {string} status - Status of the operation (START, SUCCESS, ERROR, WARNING)
 * @param {number} rowsProcessed - Number of rows processed (null if not applicable)
 * @param {number} sheetsProcessed - Number of sheets processed (null if not applicable)
 * @param {number} duration - Duration in seconds (null if not applicable)
 * @param {string} message - Additional message or error details
 */
function logToDentistSheet_(functionName, status, rowsProcessed, sheetsProcessed, duration, message) {
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    let logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = ss.insertSheet(DENTIST_LOG_TAB_NAME);
      
      // Set up headers (enhanced with correlation ID and metadata)
      const headers = [
        'Timestamp',
        'Function',
        'Status', 
        'Rows Processed',
        'Sheets Processed',
        'Duration (s)',
        'Message',
        'Correlation ID',
        'Metadata'
      ];
      logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = logSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      
      // Set column widths (updated for new columns)
      logSheet.setColumnWidth(1, 150); // Timestamp
      logSheet.setColumnWidth(2, 180); // Function
      logSheet.setColumnWidth(3, 100); // Status
      logSheet.setColumnWidth(4, 120); // Rows Processed
      logSheet.setColumnWidth(5, 120); // Sheets Processed
      logSheet.setColumnWidth(6, 100); // Duration
      logSheet.setColumnWidth(7, 350); // Message
      logSheet.setColumnWidth(8, 150); // Correlation ID
      logSheet.setColumnWidth(9, 200); // Metadata
    }
    
    // Add new log entry (enhanced with correlation ID extraction)
    const timestamp = new Date();
    
    // Extract correlation ID from message if present
    const corrIdMatch = (message || '').match(/^\[([A-Z0-9-]+)\]/);
    const correlationId = corrIdMatch ? corrIdMatch[1] : '';
    const cleanMessage = corrIdMatch ? message.replace(/^\[[A-Z0-9-]+\]\s*/, '') : (message || '');
    
    // Extract metadata from message if present
    const metadataMatch = cleanMessage.match(/\n\nMetadata: ({[\s\S]*})$/);
    const metadata = metadataMatch ? metadataMatch[1] : '';
    const finalMessage = metadataMatch ? cleanMessage.replace(/\n\nMetadata: {[\s\S]*}$/, '') : cleanMessage;
    
    const newRow = [
      timestamp,
      functionName || 'Unknown',
      status || 'UNKNOWN',
      rowsProcessed !== null && rowsProcessed !== undefined ? rowsProcessed : '',
      sheetsProcessed !== null && sheetsProcessed !== undefined ? sheetsProcessed : '',
      duration !== null && duration !== undefined ? duration : '',
      finalMessage,
      correlationId,
      metadata
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
      case 'INFO':
        statusCell.setBackground('#e8f4fd'); // Light blue
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
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    let logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    if (!logSheet) {
      // Create a new log entry to trigger sheet creation
      logToDentistSheet_('ensureLogSheet', 'START', null, null, null, 'Log sheet created');
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
      const ss = SpreadsheetApp.openById(getDentistSheetId());
      const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
      
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
      logToDentistSheet_('clearOldLogs', 'SUCCESS', null, null, null, `Cleared ${rowsToDelete} old log entries`);
      
    } catch (error) {
      ui.alert(`❌ Error clearing logs: ${error.message}`);
      logToDentistSheet_('clearOldLogs', 'ERROR', null, null, null, `Error: ${error.message}`);
    }
  }
}

/**
 * Export logs as CSV (for external analysis)
 */
function exportLogsAsCsv() {
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
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