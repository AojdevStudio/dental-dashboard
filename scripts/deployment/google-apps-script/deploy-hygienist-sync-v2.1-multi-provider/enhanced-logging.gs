/**
 * ===== ENHANCED LOGGING AND DEBUGGING SYSTEM =====
 * 
 * Comprehensive logging framework for hygienist sync operations
 * Provides structured logging, performance metrics, and debug mode
 * 
 * @version 2.1.0
 */

// ===== LOGGING CONFIGURATION =====
const LOG_CONFIG = {
  // Log levels
  LEVELS: {
    DEBUG: { value: 0, label: 'DEBUG', color: '#e0e0e0' },
    INFO: { value: 1, label: 'INFO', color: '#e3f2fd' },
    WARN: { value: 2, label: 'WARN', color: '#fff3e0' },
    ERROR: { value: 3, label: 'ERROR', color: '#ffebee' },
    CRITICAL: { value: 4, label: 'CRITICAL', color: '#ff8a80' }
  },
  
  // Current log level (can be changed via Script Properties)
  getCurrentLevel: function() {
    const properties = PropertiesService.getScriptProperties();
    const level = properties.getProperty('LOG_LEVEL') || 'INFO';
    return this.LEVELS[level] || this.LEVELS.INFO;
  },
  
  // Performance thresholds (milliseconds)
  PERFORMANCE: {
    SLOW_OPERATION: 5000,      // 5 seconds
    VERY_SLOW_OPERATION: 10000, // 10 seconds
    API_CALL_TIMEOUT: 30000     // 30 seconds
  },
  
  // Log rotation settings
  MAX_LOG_ENTRIES: 1000,
  CLEANUP_THRESHOLD: 1200,
  
  // Sheet names
  LOG_SHEET_NAME: 'Enhanced-Sync-Log',
  METRICS_SHEET_NAME: 'Sync-Metrics'
};

// ===== ENHANCED LOGGER CLASS =====
/**
 * Enhanced logger with structured logging and performance tracking
 */
class EnhancedLogger {
  constructor(context = {}) {
    this.context = context;
    this.startTime = Date.now();
    this.operations = [];
    this.metrics = {
      apiCalls: 0,
      recordsProcessed: 0,
      errors: 0,
      warnings: 0
    };
  }
  
  /**
   * Log a message with context
   * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
   * @param {string} message - Log message
   * @param {object} data - Additional data to log
   */
  log(level, message, data = {}) {
    const logLevel = LOG_CONFIG.LEVELS[level] || LOG_CONFIG.LEVELS.INFO;
    const currentLevel = LOG_CONFIG.getCurrentLevel();
    
    // Skip if below current log level
    if (logLevel.value < currentLevel.value) {
      return;
    }
    
    const logEntry = {
      timestamp: new Date(),
      level: logLevel.label,
      message: message,
      context: this.context,
      data: data,
      duration: Date.now() - this.startTime,
      metrics: {...this.metrics}
    };
    
    // Console logging
    Logger.log(this.formatLogEntry(logEntry));
    
    // Sheet logging for important messages
    if (logLevel.value >= LOG_CONFIG.LEVELS.INFO.value) {
      this.logToSheet(logEntry);
    }
    
    // Track metrics
    if (level === 'ERROR' || level === 'CRITICAL') {
      this.metrics.errors++;
    } else if (level === 'WARN') {
      this.metrics.warnings++;
    }
    
    return logEntry;
  }
  
  /**
   * Format log entry for console output
   */
  formatLogEntry(entry) {
    const contextStr = Object.keys(entry.context).length > 0 
      ? ` [${JSON.stringify(entry.context)}]` 
      : '';
    const dataStr = Object.keys(entry.data).length > 0 
      ? ` ${JSON.stringify(entry.data)}` 
      : '';
    
    return `[${entry.timestamp.toISOString()}] ${entry.level}${contextStr}: ${entry.message}${dataStr} (${entry.duration}ms)`;
  }
  
  /**
   * Log to spreadsheet for persistence
   */
  logToSheet(entry) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let logSheet = ss.getSheetByName(LOG_CONFIG.LOG_SHEET_NAME);
      
      if (!logSheet) {
        logSheet = this.createLogSheet(ss);
      }
      
      // Prepare row data
      const row = [
        entry.timestamp,
        entry.level,
        entry.context.function || '',
        entry.context.provider || '',
        entry.context.clinic || '',
        entry.message,
        JSON.stringify(entry.data),
        entry.duration,
        entry.metrics.recordsProcessed,
        entry.metrics.errors
      ];
      
      logSheet.appendRow(row);
      
      // Apply formatting
      const lastRow = logSheet.getLastRow();
      const levelCell = logSheet.getRange(lastRow, 2);
      const levelConfig = LOG_CONFIG.LEVELS[entry.level];
      if (levelConfig) {
        levelCell.setBackground(levelConfig.color);
      }
      
      // Rotate logs if needed
      this.rotateLogsIfNeeded(logSheet);
      
    } catch (error) {
      Logger.log(`Failed to log to sheet: ${error.message}`);
    }
  }
  
  /**
   * Create log sheet with headers
   */
  createLogSheet(spreadsheet) {
    const sheet = spreadsheet.insertSheet(LOG_CONFIG.LOG_SHEET_NAME);
    
    const headers = [
      'Timestamp',
      'Level',
      'Function',
      'Provider',
      'Clinic',
      'Message',
      'Data',
      'Duration (ms)',
      'Records',
      'Errors'
    ];
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 80);  // Level
    sheet.setColumnWidth(3, 150); // Function
    sheet.setColumnWidth(4, 100); // Provider
    sheet.setColumnWidth(5, 100); // Clinic
    sheet.setColumnWidth(6, 300); // Message
    sheet.setColumnWidth(7, 200); // Data
    sheet.setColumnWidth(8, 100); // Duration
    sheet.setColumnWidth(9, 80);  // Records
    sheet.setColumnWidth(10, 80); // Errors
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    return sheet;
  }
  
  /**
   * Rotate logs to prevent sheet from getting too large
   */
  rotateLogsIfNeeded(sheet) {
    const rowCount = sheet.getLastRow();
    if (rowCount > LOG_CONFIG.CLEANUP_THRESHOLD) {
      const rowsToDelete = rowCount - LOG_CONFIG.MAX_LOG_ENTRIES;
      sheet.deleteRows(2, rowsToDelete);
      this.log('INFO', `Rotated ${rowsToDelete} old log entries`);
    }
  }
  
  /**
   * Log performance metrics
   */
  logPerformance(operation, duration, details = {}) {
    const level = duration > LOG_CONFIG.PERFORMANCE.VERY_SLOW_OPERATION ? 'WARN' :
                  duration > LOG_CONFIG.PERFORMANCE.SLOW_OPERATION ? 'INFO' : 'DEBUG';
    
    this.operations.push({
      operation,
      duration,
      timestamp: new Date(),
      ...details
    });
    
    this.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...details
    });
  }
  
  /**
   * Start timing an operation
   */
  startOperation(name) {
    const opStart = Date.now();
    return {
      end: (details = {}) => {
        const duration = Date.now() - opStart;
        this.logPerformance(name, duration, details);
        return duration;
      }
    };
  }
  
  /**
   * Log API call with timing
   */
  logApiCall(endpoint, method = 'GET', details = {}) {
    this.metrics.apiCalls++;
    const operation = this.startOperation(`API ${method} ${endpoint}`);
    
    return {
      success: (response) => {
        const duration = operation.end({ 
          status: 'success',
          responseCode: response?.getResponseCode?.() || 200,
          ...details 
        });
        this.log('DEBUG', `API call successful: ${endpoint}`, { duration });
      },
      error: (error) => {
        const duration = operation.end({ 
          status: 'error',
          error: error.message,
          ...details 
        });
        this.log('ERROR', `API call failed: ${endpoint}`, { 
          duration,
          error: error.message 
        });
      }
    };
  }
  
  /**
   * Create a child logger with additional context
   */
  child(additionalContext) {
    const childLogger = new EnhancedLogger({
      ...this.context,
      ...additionalContext
    });
    childLogger.metrics = this.metrics; // Share metrics
    return childLogger;
  }
  
  /**
   * Get summary of operations
   */
  getSummary() {
    const totalDuration = Date.now() - this.startTime;
    const avgOperationTime = this.operations.length > 0 
      ? this.operations.reduce((sum, op) => sum + op.duration, 0) / this.operations.length 
      : 0;
    
    return {
      totalDuration,
      operationCount: this.operations.length,
      avgOperationTime,
      metrics: this.metrics,
      slowestOperations: this.operations
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
    };
  }
}

// ===== GLOBAL LOGGER INSTANCE =====
let globalLogger = null;

/**
 * Get or create global logger instance
 */
function getLogger(context = {}) {
  if (!globalLogger) {
    globalLogger = new EnhancedLogger(context);
  }
  return globalLogger;
}

/**
 * Reset global logger (useful for new sync operations)
 */
function resetLogger(context = {}) {
  globalLogger = new EnhancedLogger(context);
  return globalLogger;
}

// ===== METRICS TRACKING =====
/**
 * Track and log sync metrics
 */
function logSyncMetrics(operation, metrics) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let metricsSheet = ss.getSheetByName(LOG_CONFIG.METRICS_SHEET_NAME);
    
    if (!metricsSheet) {
      metricsSheet = createMetricsSheet(ss);
    }
    
    const row = [
      new Date(),
      operation,
      metrics.recordsAttempted || 0,
      metrics.recordsProcessed || 0,
      metrics.recordsFailed || 0,
      metrics.duration || 0,
      metrics.apiCalls || 0,
      metrics.errors || 0,
      metrics.provider || '',
      metrics.clinic || ''
    ];
    
    metricsSheet.appendRow(row);
    
  } catch (error) {
    Logger.log(`Failed to log metrics: ${error.message}`);
  }
}

/**
 * Create metrics tracking sheet
 */
function createMetricsSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(LOG_CONFIG.METRICS_SHEET_NAME);
  
  const headers = [
    'Timestamp',
    'Operation',
    'Records Attempted',
    'Records Processed',
    'Records Failed',
    'Duration (s)',
    'API Calls',
    'Errors',
    'Provider',
    'Clinic'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#e8f5e9');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return sheet;
}

// ===== DEBUG MODE UTILITIES =====
/**
 * Enable or disable debug mode
 */
function setDebugMode(enabled) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('LOG_LEVEL', enabled ? 'DEBUG' : 'INFO');
  
  const logger = getLogger({ function: 'setDebugMode' });
  logger.log('INFO', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if debug mode is enabled
 */
function isDebugMode() {
  const currentLevel = LOG_CONFIG.getCurrentLevel();
  return currentLevel.value <= LOG_CONFIG.LEVELS.DEBUG.value;
}

// ===== DIAGNOSTIC UTILITIES =====
/**
 * Generate diagnostic report
 */
function generateDiagnosticReport() {
  const logger = getLogger({ function: 'generateDiagnosticReport' });
  const report = {
    timestamp: new Date(),
    environment: {
      spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
      spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
      timezone: SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone()
    },
    configuration: {
      logLevel: LOG_CONFIG.getCurrentLevel().label,
      batchSize: SUPABASE_BATCH_SIZE,
      maxRetries: MAX_RETRIES
    },
    provider: null,
    credentials: {
      supabaseUrl: '***REDACTED***',
      hasServiceKey: false,
      clinicId: null,
      providerId: null
    }
  };
  
  try {
    // Check provider detection
    const providerInfo = detectCurrentProvider(report.environment.spreadsheetId);
    if (providerInfo) {
      report.provider = {
        name: providerInfo.displayName,
        code: providerInfo.providerCode,
        primaryClinic: providerInfo.primaryClinic
      };
    }
    
    // Check credentials
    const creds = getSupabaseCredentials_();
    if (creds) {
      report.credentials.hasServiceKey = !!creds.key;
      report.credentials.clinicId = creds.clinicId ? 'Resolved' : 'Missing';
      report.credentials.providerId = creds.providerId ? 'Resolved' : 'Missing';
    }
    
  } catch (error) {
    report.errors = error.message;
  }
  
  logger.log('INFO', 'Diagnostic report generated', report);
  return report;
}

// ===== PERFORMANCE PROFILING =====
/**
 * Profile a function execution
 */
function profileFunction(functionName, fn, ...args) {
  const logger = getLogger({ function: 'profileFunction', target: functionName });
  const operation = logger.startOperation(functionName);
  
  try {
    const result = fn(...args);
    operation.end({ status: 'success' });
    return result;
  } catch (error) {
    operation.end({ status: 'error', error: error.message });
    throw error;
  }
}

// ===== ERROR TRACKING =====
/**
 * Enhanced error logging with context
 */
function logError(error, context = {}) {
  const logger = getLogger(context);
  
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    type: error.constructor.name,
    ...context
  };
  
  // Log as CRITICAL if it's a system error
  const level = error.message.includes('Service invoked too many times') ||
                error.message.includes('Authorization') ||
                error.message.includes('Network') 
                ? 'CRITICAL' : 'ERROR';
  
  logger.log(level, `Error: ${error.message}`, errorDetails);
  
  // Track in metrics
  logSyncMetrics('error', {
    errors: 1,
    provider: context.provider,
    clinic: context.clinic
  });
}

// ===== MIGRATION FROM OLD LOGGING =====
/**
 * Wrapper for backward compatibility with old logging function
 */
function logToHygieneSheet_(functionName, status, rowsProcessed, sheetsProcessed, duration, message) {
  const logger = getLogger({ function: functionName });
  
  // Map old status to new log levels
  const levelMap = {
    'START': 'INFO',
    'SUCCESS': 'INFO',
    'ERROR': 'ERROR',
    'WARNING': 'WARN',
    'INFO': 'INFO'
  };
  
  const level = levelMap[status] || 'INFO';
  
  logger.log(level, message || status, {
    rowsProcessed,
    sheetsProcessed,
    duration
  });
  
  // Update metrics
  if (rowsProcessed) {
    logger.metrics.recordsProcessed += rowsProcessed;
  }
}