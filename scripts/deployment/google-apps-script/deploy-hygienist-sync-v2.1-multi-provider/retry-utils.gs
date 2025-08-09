/**
 * ===== RETRY LOGIC UTILITIES =====
 * 
 * Utilities for handling transient failures with exponential backoff
 * 
 * @version 2.1.0
 */

/**
 * Calculate exponential backoff time with jitter
 * @param {number} retryCount - Current retry attempt (0-based)
 * @param {number} baseDelayMs - Base delay in milliseconds (default: 1000)
 * @param {number} maxDelayMs - Maximum delay in milliseconds (default: 30000)
 * @return {number} Backoff time in milliseconds
 */
function calculateExponentialBackoff(retryCount, baseDelayMs = 1000, maxDelayMs = 30000) {
  // Calculate exponential backoff: baseDelay * 2^retryCount
  const exponentialDelay = baseDelayMs * Math.pow(2, retryCount);
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Add jitter (±20%) to prevent thundering herd
  const jitterFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
  const delayWithJitter = Math.round(cappedDelay * jitterFactor);
  
  return delayWithJitter;
}

/**
 * Check if an HTTP error is retryable
 * @param {number} responseCode - HTTP response code
 * @param {object} errorDetails - Parsed error details from response
 * @return {boolean} True if the error is retryable
 */
function isRetryableHttpError(responseCode, errorDetails = {}) {
  // Network and server errors (5xx) are generally retryable
  if (responseCode >= 500 && responseCode < 600) {
    return true;
  }
  
  // Rate limiting (429) is retryable
  if (responseCode === 429) {
    return true;
  }
  
  // Request timeout (408) is retryable
  if (responseCode === 408) {
    return true;
  }
  
  // Gateway timeout (504) is retryable
  if (responseCode === 504) {
    return true;
  }
  
  // Check specific error codes that might be retryable
  const errorCode = errorDetails.code || '';
  const errorMessage = (errorDetails.message || '').toLowerCase();
  
  // Database connection errors
  if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
    return true;
  }
  
  // Temporary database unavailability
  if (errorMessage.includes('temporarily unavailable') || 
      errorMessage.includes('connection refused') ||
      errorMessage.includes('timeout')) {
    return true;
  }
  
  // All other errors are not retryable (including 4xx client errors)
  return false;
}

/**
 * Execute a function with retry logic
 * @param {Function} fn - Function to execute
 * @param {object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: MAX_RETRIES)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {Function} options.isRetryable - Function to determine if error is retryable
 * @param {Function} options.onRetry - Callback function called before each retry
 * @return {*} Result of the function
 */
function executeWithRetry(fn, options = {}) {
  const maxRetries = options.maxRetries || MAX_RETRIES;
  const baseDelay = options.baseDelay || 1000;
  const isRetryable = options.isRetryable || ((error) => true);
  const onRetry = options.onRetry || (() => {});
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the function
      return fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt < maxRetries && isRetryable(error)) {
        const backoffTime = calculateExponentialBackoff(attempt, baseDelay);
        
        // Call retry callback
        onRetry(error, attempt + 1, backoffTime);
        
        // Wait before retrying
        Utilities.sleep(backoffTime);
      } else {
        // No more retries or error is not retryable
        throw error;
      }
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new Error('Retry logic failed unexpectedly');
}

/**
 * Wrapper for retrying Supabase API calls
 * @param {Function} apiCall - Function that makes the API call
 * @param {string} operationName - Name of the operation for logging
 * @param {object} context - Additional context for logging
 * @return {*} Result of the API call
 */
function retrySupabaseCall(apiCall, operationName, context = {}) {
  const logger = getLogger().child({ 
    function: 'retrySupabaseCall',
    operation: operationName,
    ...context
  });
  
  return executeWithRetry(apiCall, {
    maxRetries: MAX_RETRIES,
    baseDelay: 1000,
    isRetryable: (error) => {
      // Check for retryable network errors
      const message = error.message || '';
      return message.includes('Network') ||
             message.includes('Timeout') ||
             message.includes('fetch') ||
             message.includes('Service invoked too many times') ||
             message.includes('temporarily unavailable');
    },
    onRetry: (error, attemptNumber, backoffTime) => {
      logger.log('WARN', `Retrying ${operationName} after error`, {
        error: error.message,
        attempt: attemptNumber,
        backoffMs: backoffTime
      });
    }
  });
}

/**
 * Batch retry configuration for different operation types
 */
const RETRY_CONFIGS = {
  // API calls to Supabase
  api: {
    maxRetries: MAX_RETRIES,
    baseDelay: 1000,
    maxDelay: 30000
  },
  
  // Credential resolution
  credentials: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000
  },
  
  // Sheet operations
  sheets: {
    maxRetries: 1,
    baseDelay: 200,
    maxDelay: 1000
  }
};

/**
 * Get retry configuration for a specific operation type
 * @param {string} operationType - Type of operation ('api', 'credentials', 'sheets')
 * @return {object} Retry configuration
 */
function getRetryConfig(operationType) {
  return RETRY_CONFIGS[operationType] || RETRY_CONFIGS.api;
}