/**
 * ===== COMPREHENSIVE ERROR HANDLING SYSTEM =====
 * 
 * Centralized error handling and recovery system for database-driven provider discovery
 * Provides robust error handling for all failure scenarios with user-friendly recovery workflows
 * 
 * Features:
 * - Database connectivity error handling
 * - Provider detection failure recovery
 * - Network connectivity fallbacks
 * - User-friendly error messages and recovery options
 * - Comprehensive logging and debugging
 * 
 * @version 1.0.0
 * @requires logging.gs, cache-manager.gs
 */

// ===== ERROR CLASSIFICATION SYSTEM =====

/**
 * Error severity levels for proper escalation and handling
 */
const ERROR_SEVERITY = {
  CRITICAL: 'CRITICAL',     // System cannot function, immediate action required
  HIGH: 'HIGH',             // Major functionality affected, quick resolution needed
  MEDIUM: 'MEDIUM',         // Some functionality degraded, moderate priority
  LOW: 'LOW',               // Minor issues, low priority
  INFO: 'INFO'              // Informational messages, no action needed
};

/**
 * Error categories for classification and targeted handling
 */
const ERROR_CATEGORIES = {
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  PROVIDER_DETECTION: 'PROVIDER_DETECTION',
  NETWORK_CONNECTIVITY: 'NETWORK_CONNECTIVITY',
  AUTHENTICATION: 'AUTHENTICATION',
  CONFIGURATION: 'CONFIGURATION',
  DATA_VALIDATION: 'DATA_VALIDATION',
  SPREADSHEET_ACCESS: 'SPREADSHEET_ACCESS',
  API_RESPONSE: 'API_RESPONSE'
};

/**
 * Recovery strategy types for different error scenarios
 */
const RECOVERY_STRATEGIES = {
  RETRY: 'RETRY',                     // Retry the operation with backoff
  FALLBACK: 'FALLBACK',               // Use fallback mechanism
  CACHE: 'CACHE',                     // Use cached data
  USER_INTERVENTION: 'USER_INTERVENTION', // Require user action
  SKIP: 'SKIP',                       // Skip and continue
  ABORT: 'ABORT'                      // Stop execution completely
};

// ===== ERROR HANDLING CONFIGURATION =====

/**
 * Configuration for error handling behavior
 */
const ERROR_HANDLER_CONFIG = {
  // Retry configuration
  MAX_RETRIES: {
    DATABASE_CONNECTION: 3,
    NETWORK_CONNECTIVITY: 5,
    API_RESPONSE: 3,
    DEFAULT: 2
  },
  
  // Backoff delays (milliseconds)
  BACKOFF_DELAYS: {
    INITIAL: 1000,
    MULTIPLIER: 2,
    MAX_DELAY: 30000
  },
  
  // Cache fallback duration
  CACHE_FALLBACK_DURATION_HOURS: 24,
  
  // User notification preferences
  NOTIFICATIONS: {
    SHOW_RECOVERY_OPTIONS: true,
    SHOW_TECHNICAL_DETAILS: false,
    AUTO_RETRY_USER_CONSENT: true
  }
};

// ===== CORE ERROR HANDLING CLASSES =====

/**
 * Enhanced error class with recovery capabilities
 */
class SyncError extends Error {
  constructor(message, category, severity = ERROR_SEVERITY.MEDIUM, code = null, details = {}) {
    super(message);
    this.name = 'SyncError';
    this.category = category;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.recoveryStrategies = this.determineRecoveryStrategies_();
  }
  
  /**
   * Determine appropriate recovery strategies based on error type
   * @return {Array} Array of recovery strategy objects
   */
  determineRecoveryStrategies_() {
    const strategies = [];
    
    switch (this.category) {
      case ERROR_CATEGORIES.DATABASE_CONNECTION:
        strategies.push(
          { type: RECOVERY_STRATEGIES.RETRY, priority: 1, description: 'Retry database connection with exponential backoff' },
          { type: RECOVERY_STRATEGIES.CACHE, priority: 2, description: 'Use cached provider configuration' },
          { type: RECOVERY_STRATEGIES.FALLBACK, priority: 3, description: 'Use manual provider configuration' }
        );
        break;
        
      case ERROR_CATEGORIES.PROVIDER_DETECTION:
        strategies.push(
          { type: RECOVERY_STRATEGIES.FALLBACK, priority: 1, description: 'Use manual provider selection' },
          { type: RECOVERY_STRATEGIES.CACHE, priority: 2, description: 'Use last known provider configuration' },
          { type: RECOVERY_STRATEGIES.USER_INTERVENTION, priority: 3, description: 'Request user to clarify provider identity' }
        );
        break;
        
      case ERROR_CATEGORIES.NETWORK_CONNECTIVITY:
        strategies.push(
          { type: RECOVERY_STRATEGIES.RETRY, priority: 1, description: 'Retry with network connectivity check' },
          { type: RECOVERY_STRATEGIES.CACHE, priority: 2, description: 'Use offline cached data' },
          { type: RECOVERY_STRATEGIES.SKIP, priority: 3, description: 'Skip network-dependent operations' }
        );
        break;
        
      case ERROR_CATEGORIES.AUTHENTICATION:
        strategies.push(
          { type: RECOVERY_STRATEGIES.USER_INTERVENTION, priority: 1, description: 'Request credential verification' },
          { type: RECOVERY_STRATEGIES.FALLBACK, priority: 2, description: 'Use backup authentication method' }
        );
        break;
        
      default:
        strategies.push(
          { type: RECOVERY_STRATEGIES.RETRY, priority: 1, description: 'Retry operation' },
          { type: RECOVERY_STRATEGIES.SKIP, priority: 2, description: 'Skip and continue' }
        );
    }
    
    return strategies.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Get user-friendly error message
   * @return {string} Formatted error message for users
   */
  getUserMessage() {
    const baseMessage = this.getUserMessageByCategory_();
    return `${baseMessage}\n\nError Code: ${this.code || 'UNKNOWN'}\nTime: ${new Date(this.timestamp).toLocaleString()}`;
  }
  
  /**
   * Get category-specific user message
   * @return {string} User-friendly message based on error category
   */
  getUserMessageByCategory_() {
    switch (this.category) {
      case ERROR_CATEGORIES.DATABASE_CONNECTION:
        return 'Unable to connect to the database. This might be a temporary connectivity issue.';
        
      case ERROR_CATEGORIES.PROVIDER_DETECTION:
        return 'Could not automatically detect which provider this spreadsheet belongs to. Please verify the spreadsheet name contains the provider name.';
        
      case ERROR_CATEGORIES.NETWORK_CONNECTIVITY:
        return 'Network connectivity issues detected. Some features may not be available.';
        
      case ERROR_CATEGORIES.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
        
      case ERROR_CATEGORIES.CONFIGURATION:
        return 'Configuration error detected. Please check your setup and try again.';
        
      case ERROR_CATEGORIES.DATA_VALIDATION:
        return 'Data validation failed. Please check your spreadsheet data format.';
        
      case ERROR_CATEGORIES.SPREADSHEET_ACCESS:
        return 'Unable to access the spreadsheet. Please check permissions and try again.';
        
      case ERROR_CATEGORIES.API_RESPONSE:
        return 'Unexpected response from the server. Please try again later.';
        
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }
}

// ===== MAIN ERROR HANDLER =====

/**
 * Centralized error handler with recovery capabilities
 */
class ErrorHandler {
  constructor() {
    this.errorHistory = [];
    this.recoveryAttempts = new Map();
    this.userInterventionQueue = [];
  }
  
  /**
   * Handle an error with automatic recovery attempt
   * @param {Error|SyncError} error - The error to handle
   * @param {Object} context - Additional context information
   * @param {Function} originalOperation - Original operation to retry
   * @return {Object} Result object with success status and data/error
   */
  handleError(error, context = {}, originalOperation = null) {
    const syncError = this.normalizeSyncError_(error, context);
    
    // Log the error
    this.logError_(syncError, context);
    
    // Add to error history
    this.errorHistory.push({
      error: syncError,
      context: context,
      timestamp: new Date().toISOString()
    });
    
    // Attempt automatic recovery
    return this.attemptRecovery_(syncError, context, originalOperation);
  }
  
  /**
   * Normalize any error to SyncError format
   * @param {Error} error - Original error
   * @param {Object} context - Error context
   * @return {SyncError} Normalized sync error
   */
  normalizeSyncError_(error, context) {
    if (error instanceof SyncError) {
      return error;
    }
    
    // Classify error based on message and context
    const classification = this.classifyError_(error, context);
    
    return new SyncError(
      error.message,
      classification.category,
      classification.severity,
      classification.code,
      {
        originalError: error.name,
        context: context,
        stack: error.stack
      }
    );
  }
  
  /**
   * Classify error into category and severity
   * @param {Error} error - Original error
   * @param {Object} context - Error context
   * @return {Object} Classification result
   */
  classifyError_(error, context) {
    const message = error.message.toLowerCase();
    const contextStr = JSON.stringify(context).toLowerCase();
    
    // Database connection errors
    if (message.includes('connection') || message.includes('timeout') || 
        message.includes('network') || message.includes('fetch')) {
      if (message.includes('database') || contextStr.includes('supabase')) {
        return {
          category: ERROR_CATEGORIES.DATABASE_CONNECTION,
          severity: ERROR_SEVERITY.HIGH,
          code: 'DB_CONNECTION_FAILED'
        };
      }
      return {
        category: ERROR_CATEGORIES.NETWORK_CONNECTIVITY,
        severity: ERROR_SEVERITY.MEDIUM,
        code: 'NETWORK_ERROR'
      };
    }
    
    // Provider detection errors
    if (message.includes('provider') || message.includes('detect') || 
        contextStr.includes('provider')) {
      return {
        category: ERROR_CATEGORIES.PROVIDER_DETECTION,
        severity: ERROR_SEVERITY.HIGH,
        code: 'PROVIDER_DETECTION_FAILED'
      };
    }
    
    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication') || 
        message.includes('credentials') || message.includes('401')) {
      return {
        category: ERROR_CATEGORIES.AUTHENTICATION,
        severity: ERROR_SEVERITY.HIGH,
        code: 'AUTH_FAILED'
      };
    }
    
    // Spreadsheet access errors
    if (message.includes('spreadsheet') || message.includes('sheet') || 
        message.includes('permission')) {
      return {
        category: ERROR_CATEGORIES.SPREADSHEET_ACCESS,
        severity: ERROR_SEVERITY.MEDIUM,
        code: 'SPREADSHEET_ACCESS_FAILED'
      };
    }
    
    // API response errors
    if (message.includes('json') || message.includes('parse') || 
        message.includes('response') || context.httpStatus) {
      return {
        category: ERROR_CATEGORIES.API_RESPONSE,
        severity: ERROR_SEVERITY.MEDIUM,
        code: 'API_RESPONSE_ERROR'
      };
    }
    
    // Default classification
    return {
      category: ERROR_CATEGORIES.CONFIGURATION,
      severity: ERROR_SEVERITY.MEDIUM,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  /**
   * Attempt automatic recovery based on error type
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @param {Function} originalOperation - Original operation to retry
   * @return {Object} Recovery result
   */
  attemptRecovery_(error, context, originalOperation) {
    const errorKey = `${error.category}_${error.code}`;
    const attemptCount = this.recoveryAttempts.get(errorKey) || 0;
    
    // Check max retries for this error type
    const maxRetries = ERROR_HANDLER_CONFIG.MAX_RETRIES[error.category] || 
                      ERROR_HANDLER_CONFIG.MAX_RETRIES.DEFAULT;
    
    if (attemptCount >= maxRetries) {
      return this.handleMaxRetriesExceeded_(error, context);
    }
    
    // Update attempt count
    this.recoveryAttempts.set(errorKey, attemptCount + 1);
    
    // Try recovery strategies in priority order
    for (const strategy of error.recoveryStrategies) {
      const result = this.executeRecoveryStrategy_(strategy, error, context, originalOperation);
      if (result.success) {
        // Clear retry count on success
        this.recoveryAttempts.delete(errorKey);
        return result;
      }
    }
    
    // All recovery strategies failed
    return {
      success: false,
      error: error,
      message: 'All recovery strategies failed',
      requiresUserIntervention: true
    };
  }
  
  /**
   * Execute a specific recovery strategy
   * @param {Object} strategy - Recovery strategy configuration
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @param {Function} originalOperation - Original operation to retry
   * @return {Object} Strategy execution result
   */
  executeRecoveryStrategy_(strategy, error, context, originalOperation) {
    try {
      switch (strategy.type) {
        case RECOVERY_STRATEGIES.RETRY:
          return this.executeRetryStrategy_(error, context, originalOperation);
          
        case RECOVERY_STRATEGIES.FALLBACK:
          return this.executeFallbackStrategy_(error, context);
          
        case RECOVERY_STRATEGIES.CACHE:
          return this.executeCacheStrategy_(error, context);
          
        case RECOVERY_STRATEGIES.USER_INTERVENTION:
          return this.executeUserInterventionStrategy_(error, context);
          
        case RECOVERY_STRATEGIES.SKIP:
          return this.executeSkipStrategy_(error, context);
          
        default:
          return { success: false, message: `Unknown recovery strategy: ${strategy.type}` };
      }
    } catch (recoveryError) {
      Logger.log(`Recovery strategy ${strategy.type} failed: ${recoveryError.message}`);
      return { success: false, message: `Recovery strategy failed: ${recoveryError.message}` };
    }
  }
  
  /**
   * Execute retry recovery strategy
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @param {Function} originalOperation - Original operation to retry
   * @return {Object} Retry result
   */
  executeRetryStrategy_(error, context, originalOperation) {
    if (!originalOperation) {
      return { success: false, message: 'No operation to retry' };
    }
    
    // Calculate backoff delay
    const attemptCount = this.recoveryAttempts.get(`${error.category}_${error.code}`) || 0;
    const delay = Math.min(
      ERROR_HANDLER_CONFIG.BACKOFF_DELAYS.INITIAL * 
      Math.pow(ERROR_HANDLER_CONFIG.BACKOFF_DELAYS.MULTIPLIER, attemptCount),
      ERROR_HANDLER_CONFIG.BACKOFF_DELAYS.MAX_DELAY
    );
    
    Logger.log(`Retrying operation after ${delay}ms delay (attempt ${attemptCount + 1})`);
    
    // Wait before retry
    Utilities.sleep(delay);
    
    try {
      const result = originalOperation();
      return { 
        success: true, 
        data: result, 
        message: `Retry successful on attempt ${attemptCount + 1}` 
      };
    } catch (retryError) {
      return { 
        success: false, 
        error: retryError, 
        message: `Retry failed on attempt ${attemptCount + 1}` 
      };
    }
  }
  
  /**
   * Execute fallback recovery strategy
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @return {Object} Fallback result
   */
  executeFallbackStrategy_(error, context) {
    switch (error.category) {
      case ERROR_CATEGORIES.PROVIDER_DETECTION:
        return this.executeProviderDetectionFallback_(context);
        
      case ERROR_CATEGORIES.DATABASE_CONNECTION:
        return this.executeDatabaseFallback_(context);
        
      default:
        return { success: false, message: 'No fallback strategy available for this error type' };
    }
  }
  
  /**
   * Execute cache recovery strategy
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @return {Object} Cache result
   */
  executeCacheStrategy_(error, context) {
    try {
      // Use the cache manager to get cached data
      if (typeof getCachedProviderConfig === 'function') {
        const cachedData = getCachedProviderConfig(context.spreadsheetId);
        if (cachedData && !this.isCacheExpired_(cachedData)) {
          return {
            success: true,
            data: cachedData,
            message: 'Using cached data',
            usingCache: true
          };
        }
      }
      
      return { success: false, message: 'No valid cached data available' };
    } catch (cacheError) {
      return { success: false, message: `Cache strategy failed: ${cacheError.message}` };
    }
  }
  
  /**
   * Execute user intervention recovery strategy
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @return {Object} User intervention result
   */
  executeUserInterventionStrategy_(error, context) {
    // Add to user intervention queue
    this.userInterventionQueue.push({
      error: error,
      context: context,
      timestamp: new Date().toISOString()
    });
    
    // Show user-friendly error dialog with recovery options
    const userChoice = this.showUserRecoveryDialog_(error);
    
    return {
      success: false,
      requiresUserIntervention: true,
      userChoice: userChoice,
      message: 'User intervention required'
    };
  }
  
  /**
   * Execute skip recovery strategy
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @return {Object} Skip result
   */
  executeSkipStrategy_(error, context) {
    Logger.log(`Skipping operation due to error: ${error.message}`);
    return {
      success: true,
      skipped: true,
      message: 'Operation skipped due to error',
      data: null
    };
  }
  
  /**
   * Handle max retries exceeded scenario
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   * @return {Object} Max retries result
   */
  handleMaxRetriesExceeded_(error, context) {
    const message = `Maximum retry attempts exceeded for ${error.category}`;
    Logger.log(message);
    
    return {
      success: false,
      maxRetriesExceeded: true,
      error: error,
      message: message,
      requiresUserIntervention: true
    };
  }
  
  /**
   * Execute provider detection fallback
   * @param {Object} context - Error context
   * @return {Object} Fallback result
   */
  executeProviderDetectionFallback_(context) {
    try {
      // Try manual provider selection dialog
      const selectedProvider = this.showProviderSelectionDialog_();
      if (selectedProvider) {
        return {
          success: true,
          data: selectedProvider,
          message: 'Provider manually selected',
          isManualSelection: true
        };
      }
      
      return { success: false, message: 'User cancelled provider selection' };
    } catch (error) {
      return { success: false, message: `Provider fallback failed: ${error.message}` };
    }
  }
  
  /**
   * Execute database connection fallback
   * @param {Object} context - Error context
   * @return {Object} Fallback result
   */
  executeDatabaseFallback_(context) {
    try {
      // Check if we have cached credentials that can be used
      if (typeof getCachedCredentials === 'function') {
        const cachedCreds = getCachedCredentials();
        if (cachedCreds) {
          return {
            success: true,
            data: cachedCreds,
            message: 'Using cached credentials',
            usingCache: true
          };
        }
      }
      
      return { success: false, message: 'No database fallback available' };
    } catch (error) {
      return { success: false, message: `Database fallback failed: ${error.message}` };
    }
  }
  
  /**
   * Show user recovery dialog
   * @param {SyncError} error - The sync error
   * @return {string} User choice
   */
  showUserRecoveryDialog_(error) {
    const message = `${error.getUserMessage()}\n\nWhat would you like to do?`;
    const options = [
      'Retry the operation',
      'Try a different approach',
      'Skip this step',
      'Cancel and review settings'
    ];
    
    try {
      const ui = SpreadsheetApp.getUi();
      const result = ui.alert(
        'Sync Error - Recovery Options',
        message,
        ui.ButtonSet.OK_CANCEL
      );
      
      return result === ui.Button.OK ? 'retry' : 'cancel';
    } catch (uiError) {
      // Fallback for non-UI environments
      Logger.log(`User dialog error: ${uiError.message}`);
      return 'retry';
    }
  }
  
  /**
   * Show provider selection dialog
   * @return {Object|null} Selected provider configuration
   */
  showProviderSelectionDialog_() {
    try {
      const ui = SpreadsheetApp.getUi();
      const result = ui.prompt(
        'Manual Provider Selection',
        'Please enter the provider name (e.g., "Obinna", "Kamdi"):',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (result.getSelectedButton() === ui.Button.OK) {
        const providerName = result.getResponseText().toLowerCase();
        
        // Map common names to provider codes
        const providerMapping = {
          'obinna': 'obinna_ezeji',
          'ezeji': 'obinna_ezeji',
          'kamdi': 'kamdi_irondi',
          'irondi': 'kamdi_irondi',
          'kelechi': 'kamdi_irondi'
        };
        
        const providerCode = providerMapping[providerName];
        if (providerCode) {
          return {
            providerCode: providerCode,
            displayName: providerCode === 'obinna_ezeji' ? 'Dr. Obinna Ezeji' : 'Dr. Kamdi Irondi',
            isManualSelection: true
          };
        }
      }
      
      return null;
    } catch (error) {
      Logger.log(`Provider selection dialog error: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Check if cached data is expired
   * @param {Object} cachedData - Cached data with timestamp
   * @return {boolean} True if expired
   */
  isCacheExpired_(cachedData) {
    if (!cachedData.timestamp) return true;
    
    const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
    const maxAge = ERROR_HANDLER_CONFIG.CACHE_FALLBACK_DURATION_HOURS * 60 * 60 * 1000;
    
    return cacheAge > maxAge;
  }
  
  /**
   * Log error with context
   * @param {SyncError} error - The sync error
   * @param {Object} context - Error context
   */
  logError_(error, context) {
    const logEntry = {
      timestamp: error.timestamp,
      severity: error.severity,
      category: error.category,
      code: error.code,
      message: error.message,
      context: context,
      recoveryStrategies: error.recoveryStrategies.length
    };
    
    // Use the logging system if available
    if (typeof logMessage === 'function') {
      logMessage(`ERROR_HANDLER`, JSON.stringify(logEntry), 'ERROR');
    } else {
      Logger.log(`[ERROR_HANDLER] ${JSON.stringify(logEntry)}`);
    }
  }
  
  /**
   * Get error statistics for monitoring
   * @return {Object} Error statistics
   */
  getErrorStatistics() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errorHistory.filter(
      entry => new Date(entry.timestamp).getTime() > last24Hours
    );
    
    const categoryCounts = {};
    const severityCounts = {};
    
    recentErrors.forEach(entry => {
      const category = entry.error.category;
      const severity = entry.error.severity;
      
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });
    
    return {
      totalErrors: recentErrors.length,
      categoryCounts: categoryCounts,
      severityCounts: severityCounts,
      recoveryAttempts: Array.from(this.recoveryAttempts.entries()),
      userInterventionQueue: this.userInterventionQueue.length
    };
  }
  
  /**
   * Clear error history and reset counters
   */
  clearErrorHistory() {
    this.errorHistory = [];
    this.recoveryAttempts.clear();
    this.userInterventionQueue = [];
    Logger.log('Error handler history cleared');
  }
}

// ===== GLOBAL ERROR HANDLER INSTANCE =====

/**
 * Global error handler instance
 * @type {ErrorHandler}
 */
const globalErrorHandler = new ErrorHandler();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Handle any error with automatic recovery
 * @param {Error} error - The error to handle
 * @param {Object} context - Error context
 * @param {Function} originalOperation - Original operation to retry
 * @return {Object} Handling result
 */
function handleSyncError(error, context = {}, originalOperation = null) {
  return globalErrorHandler.handleError(error, context, originalOperation);
}

/**
 * Create a new sync error
 * @param {string} message - Error message
 * @param {string} category - Error category
 * @param {string} severity - Error severity
 * @param {string} code - Error code
 * @param {Object} details - Additional details
 * @return {SyncError} New sync error instance
 */
function createSyncError(message, category, severity = ERROR_SEVERITY.MEDIUM, code = null, details = {}) {
  return new SyncError(message, category, severity, code, details);
}

/**
 * Get error handler statistics
 * @return {Object} Error statistics
 */
function getErrorStatistics() {
  return globalErrorHandler.getErrorStatistics();
}

/**
 * Clear error handler history
 */
function clearErrorHistory() {
  globalErrorHandler.clearErrorHistory();
}

/**
 * Show comprehensive error report
 */
function showErrorReport() {
  const stats = getErrorStatistics();
  
  console.log('📊 Error Handler Report (Last 24 Hours)');
  console.log(`Total Errors: ${stats.totalErrors}`);
  
  if (stats.totalErrors > 0) {
    console.log('\n📈 Error Categories:');
    Object.entries(stats.categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    console.log('\n⚠️  Error Severity:');
    Object.entries(stats.severityCounts).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });
    
    console.log(`\n🔄 Recovery Attempts: ${stats.recoveryAttempts.length}`);
    console.log(`👤 User Interventions Pending: ${stats.userInterventionQueue}`);
  } else {
    console.log('✅ No errors in the last 24 hours');
  }
}

/**
 * Run basic health check
 * @return {Promise<Object>} Health check results
 */
function runHealthCheck() {
  return new Promise((resolve, reject) => {
    try {
      const startTime = Date.now();
      const results = {
        summary: {
          overallStatus: 'HEALTHY',
          totalTests: 0,
          passed: 0,
          failed: 0,
          warnings: 0
        },
        tests: [],
        duration: 0
      };
      
      // Basic tests
      const tests = [
        () => testBasicConnectivity_(),
        () => testSpreadsheetAccess_(),
        () => testCredentialAvailability_()
      ];
      
      let passed = 0;
      let failed = 0;
      let warnings = 0;
      
      tests.forEach((test, index) => {
        try {
          const result = test();
          results.tests.push(result);
          
          if (result.status === 'PASS') {
            passed++;
          } else if (result.status === 'FAIL') {
            failed++;
          } else if (result.status === 'WARN') {
            warnings++;
          }
        } catch (error) {
          failed++;
          results.tests.push({
            name: `Test ${index + 1}`,
            status: 'FAIL',
            message: error.message
          });
        }
      });
      
      results.summary.totalTests = tests.length;
      results.summary.passed = passed;
      results.summary.failed = failed;
      results.summary.warnings = warnings;
      results.summary.overallStatus = failed > 0 ? 'CRITICAL' : warnings > 0 ? 'WARNING' : 'HEALTHY';
      results.duration = Date.now() - startTime;
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Run comprehensive diagnostics
 * @return {Promise<Object>} Diagnostic results
 */
function runComprehensiveDiagnostics() {
  return new Promise((resolve, reject) => {
    try {
      const startTime = Date.now();
      const results = {
        summary: {
          overallStatus: 'HEALTHY',
          totalTests: 0,
          passed: 0,
          failed: 0,
          warnings: 0
        },
        tests: [],
        duration: 0
      };
      
      // Comprehensive test suite
      const tests = [
        () => testBasicConnectivity_(),
        () => testSpreadsheetAccess_(),
        () => testCredentialAvailability_(),
        () => testProviderDetectionSystem_(),
        () => testDatabaseConnectivity_(),
        () => testCacheSystem_(),
        () => testErrorHandling_()
      ];
      
      let passed = 0;
      let failed = 0;
      let warnings = 0;
      
      tests.forEach((test, index) => {
        try {
          const result = test();
          results.tests.push(result);
          
          if (result.status === 'PASS') {
            passed++;
          } else if (result.status === 'FAIL') {
            failed++;
          } else if (result.status === 'WARN') {
            warnings++;
          }
        } catch (error) {
          failed++;
          results.tests.push({
            name: `Comprehensive Test ${index + 1}`,
            status: 'FAIL',
            message: error.message,
            details: { error: error.stack }
          });
        }
      });
      
      results.summary.totalTests = tests.length;
      results.summary.passed = passed;
      results.summary.failed = failed;
      results.summary.warnings = warnings;
      results.summary.overallStatus = failed > 0 ? 'CRITICAL' : warnings > 0 ? 'WARNING' : 'HEALTHY';
      results.duration = Date.now() - startTime;
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Run automated troubleshooting
 * @return {Promise<Object>} Troubleshooting results
 */
function runAutomatedTroubleshooting() {
  return new Promise((resolve, reject) => {
    try {
      const startTime = Date.now();
      const troubleshootingSteps = [];
      let fixesApplied = 0;
      let initialProblems = 0;
      
      // Step 1: Run basic health check to identify problems
      const healthCheck = testBasicConnectivity_();
      if (healthCheck.status === 'FAIL') {
        initialProblems++;
        
        // Try to fix connectivity issues
        const connectivityFix = tryFixConnectivity_();
        troubleshootingSteps.push(connectivityFix);
        if (connectivityFix.success) {
          fixesApplied++;
        }
      }
      
      // Step 2: Check spreadsheet access
      const spreadsheetCheck = testSpreadsheetAccess_();
      if (spreadsheetCheck.status === 'FAIL') {
        initialProblems++;
        
        // Try to fix spreadsheet issues
        const spreadsheetFix = tryFixSpreadsheetAccess_();
        troubleshootingSteps.push(spreadsheetFix);
        if (spreadsheetFix.success) {
          fixesApplied++;
        }
      }
      
      // Step 3: Check credentials
      const credentialCheck = testCredentialAvailability_();
      if (credentialCheck.status === 'FAIL') {
        initialProblems++;
        
        troubleshootingSteps.push({
          step: 'Credential Check',
          issue: 'Missing credentials',
          action: 'User intervention required - run setup wizard',
          success: false
        });
      }
      
      const finalStatus = troubleshootingSteps.some(step => !step.success) ? 'WARNING' : 'HEALTHY';
      
      resolve({
        status: finalStatus,
        initialProblems: initialProblems,
        fixesApplied: fixesApplied,
        troubleshootingSteps: troubleshootingSteps,
        duration: Date.now() - startTime
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ===== HELPER FUNCTIONS FOR DIAGNOSTICS =====

/**
 * Test basic connectivity
 * @return {Object} Test result
 */
function testBasicConnectivity_() {
  try {
    // Test Google Services connectivity
    const response = UrlFetchApp.fetch('https://www.googleapis.com/', {
      method: 'GET',
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode >= 200 && responseCode < 400) {
      return {
        name: 'Basic Connectivity',
        status: 'PASS',
        message: 'Network connectivity is working'
      };
    } else {
      return {
        name: 'Basic Connectivity',
        status: 'FAIL',
        message: `Network connectivity issue (HTTP ${responseCode})`
      };
    }
  } catch (error) {
    return {
      name: 'Basic Connectivity',
      status: 'FAIL',
      message: `Connectivity test failed: ${error.message}`
    };
  }
}

/**
 * Test spreadsheet access
 * @return {Object} Test result
 */
function testSpreadsheetAccess_() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    if (sheets.length > 0) {
      return {
        name: 'Spreadsheet Access',
        status: 'PASS',
        message: `Spreadsheet accessible with ${sheets.length} sheets`
      };
    } else {
      return {
        name: 'Spreadsheet Access',
        status: 'WARN',
        message: 'Spreadsheet accessible but no sheets found'
      };
    }
  } catch (error) {
    return {
      name: 'Spreadsheet Access',
      status: 'FAIL',
      message: `Spreadsheet access failed: ${error.message}`
    };
  }
}

/**
 * Test credential availability
 * @return {Object} Test result
 */
function testCredentialAvailability_() {
  try {
    const userProps = PropertiesService.getUserProperties();
    const hasUrl = userProps.getProperty('SUPABASE_URL');
    const hasKey = userProps.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    
    if (hasUrl && hasKey) {
      return {
        name: 'Credential Availability',
        status: 'PASS',
        message: 'Required credentials are available'
      };
    } else {
      return {
        name: 'Credential Availability',
        status: 'FAIL',
        message: 'Missing required credentials (Supabase URL or API key)'
      };
    }
  } catch (error) {
    return {
      name: 'Credential Availability',
      status: 'FAIL',
      message: `Credential check failed: ${error.message}`
    };
  }
}

/**
 * Test provider detection system
 * @return {Object} Test result
 */
function testProviderDetectionSystem_() {
  try {
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const providerInfo = typeof detectCurrentProvider === 'function' ? 
                       detectCurrentProvider(spreadsheetId) : null;
    
    if (providerInfo) {
      return {
        name: 'Provider Detection',
        status: 'PASS',
        message: `Provider detected: ${providerInfo.displayName}`
      };
    } else {
      return {
        name: 'Provider Detection',
        status: 'WARN',
        message: 'Provider detection failed - manual selection may be required'
      };
    }
  } catch (error) {
    return {
      name: 'Provider Detection',
      status: 'FAIL',
      message: `Provider detection error: ${error.message}`
    };
  }
}

/**
 * Test database connectivity
 * @return {Object} Test result
 */
function testDatabaseConnectivity_() {
  try {
    const userProps = PropertiesService.getUserProperties();
    const url = userProps.getProperty('SUPABASE_URL');
    const key = userProps.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!url || !key) {
      return {
        name: 'Database Connectivity',
        status: 'FAIL',
        message: 'No database credentials available'
      };
    }
    
    const response = UrlFetchApp.fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key
      },
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      return {
        name: 'Database Connectivity',
        status: 'PASS',
        message: 'Database connection successful'
      };
    } else {
      return {
        name: 'Database Connectivity',
        status: 'FAIL',
        message: `Database connection failed: HTTP ${responseCode}`
      };
    }
  } catch (error) {
    return {
      name: 'Database Connectivity',
      status: 'FAIL',
      message: `Database connectivity test failed: ${error.message}`
    };
  }
}

/**
 * Test cache system
 * @return {Object} Test result
 */
function testCacheSystem_() {
  try {
    const stats = typeof getCacheStatistics === 'function' ? getCacheStatistics() : null;
    
    if (stats) {
      return {
        name: 'Cache System',
        status: 'PASS',
        message: `Cache system operational (${stats.hits} hits, ${stats.misses} misses)`
      };
    } else {
      return {
        name: 'Cache System',
        status: 'WARN',
        message: 'Cache system not initialized or unavailable'
      };
    }
  } catch (error) {
    return {
      name: 'Cache System',
      status: 'FAIL',
      message: `Cache system test failed: ${error.message}`
    };
  }
}

/**
 * Test error handling system
 * @return {Object} Test result
 */
function testErrorHandling_() {
  try {
    const stats = getErrorStatistics();
    
    if (stats) {
      return {
        name: 'Error Handling',
        status: 'PASS',
        message: `Error handling system active (${stats.totalErrors} errors tracked)`
      };
    } else {
      return {
        name: 'Error Handling',
        status: 'FAIL',
        message: 'Error handling system not responding'
      };
    }
  } catch (error) {
    return {
      name: 'Error Handling',
      status: 'FAIL',
      message: `Error handling test failed: ${error.message}`
    };
  }
}

/**
 * Try to fix connectivity issues
 * @return {Object} Fix attempt result
 */
function tryFixConnectivity_() {
  try {
    // Clear any cached network-related data
    if (typeof clearAllCacheData === 'function') {
      clearAllCacheData();
    }
    
    // Test connectivity again
    const testResult = testBasicConnectivity_();
    
    return {
      step: 'Connectivity Fix',
      issue: 'Network connectivity problems',
      action: 'Cleared cache and retested connectivity',
      success: testResult.status === 'PASS'
    };
  } catch (error) {
    return {
      step: 'Connectivity Fix',
      issue: 'Network connectivity problems',
      action: 'Failed to apply connectivity fixes',
      success: false,
      error: error.message
    };
  }
}

/**
 * Try to fix spreadsheet access issues
 * @return {Object} Fix attempt result
 */
function tryFixSpreadsheetAccess_() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if log sheet exists, create if missing
    let logSheet = spreadsheet.getSheetByName('Dentist-Sync-Log');
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('Dentist-Sync-Log');
      logSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Component', 'Message']]);
    }
    
    return {
      step: 'Spreadsheet Fix',
      issue: 'Spreadsheet access or structure problems',
      action: 'Verified/created required sheets',
      success: true
    };
  } catch (error) {
    return {
      step: 'Spreadsheet Fix',
      issue: 'Spreadsheet access or structure problems',
      action: 'Failed to fix spreadsheet issues',
      success: false,
      error: error.message
    };
  }
}

// ===== ERROR HANDLING DECORATORS =====

/**
 * Wrap a function with error handling
 * @param {Function} func - Function to wrap
 * @param {Object} options - Error handling options
 * @return {Function} Wrapped function
 */
function withErrorHandling(func, options = {}) {
  return function(...args) {
    try {
      return func.apply(this, args);
    } catch (error) {
      const context = {
        functionName: func.name,
        arguments: args,
        ...options.context
      };
      
      const result = handleSyncError(error, context, options.retry ? () => func.apply(this, args) : null);
      
      if (result.success) {
        return result.data;
      } else if (options.throwOnFailure) {
        throw new SyncError(
          `Function ${func.name} failed: ${result.message}`,
          ERROR_CATEGORIES.CONFIGURATION,
          ERROR_SEVERITY.HIGH
        );
      } else {
        return options.defaultValue || null;
      }
    }
  };
}