/**
 * ========================================
 * LOCATION FINANCIAL API CLIENT
 * ========================================
 * Handles API communication with the LocationFinancial import endpoint
 * Includes authentication, request formatting, and error handling
 */

/**
 * Sends location financial data to the API endpoint
 * @param {Array} records - Array of financial records
 * @param {Object} options - Additional options (dryRun, upsert, etc.)
 * @returns {Object} API response result
 */
function sendLocationFinancialDataToAPI(records, options = {}) {
  try {
    const credentials = getLocationFinancialCredentials();
    if (!credentials.isValid) {
      throw new Error('Invalid credentials: ' + credentials.error);
    }
    
    // Prepare API payload
    const payload = {
      clinicId: credentials.clinicId,
      dataSourceId: credentials.dataSourceId || 'google-sheets-location-financial-sync',
      records: records,
      upsert: options.upsert !== false, // Default to true
      dryRun: options.dryRun === true    // Default to false
    };
    
    logLocationFinancialOperation('API_CALL', `Sending ${records.length} records to API`, {
      recordCount: records.length,
      dryRun: payload.dryRun,
      upsert: payload.upsert
    });
    
    // Send data in batches if needed
    if (records.length > LOCATION_FINANCIAL_BATCH_SIZE) {
      return sendLocationFinancialDataInBatches(payload, credentials);
    } else {
      return sendLocationFinancialBatch(payload, credentials);
    }
    
  } catch (error) {
    logLocationFinancialError('API_CALL', 'Failed to send data to API', error);
    return {
      success: false,
      error: error.message,
      details: error.toString()
    };
  }
}

/**
 * Sends location financial data in batches
 * @param {Object} payload - Full payload with all records
 * @param {Object} credentials - API credentials
 * @returns {Object} Combined result from all batches
 */
function sendLocationFinancialDataInBatches(payload, credentials) {
  const allRecords = payload.records;
  const batches = [];
  
  // Split into batches
  for (let i = 0; i < allRecords.length; i += LOCATION_FINANCIAL_BATCH_SIZE) {
    batches.push(allRecords.slice(i, i + LOCATION_FINANCIAL_BATCH_SIZE));
  }
  
  logLocationFinancialOperation('API_BATCH', `Sending ${batches.length} batches of data`);
  
  const results = {
    success: true,
    batchResults: [],
    totalRecords: allRecords.length,
    totalProcessed: 0,
    totalErrors: 0,
    errors: []
  };
  
  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batchPayload = {
      ...payload,
      records: batches[i]
    };
    
    logLocationFinancialOperation('API_BATCH', `Processing batch ${i + 1}/${batches.length} (${batches[i].length} records)`);
    
    const batchResult = sendLocationFinancialBatch(batchPayload, credentials);
    results.batchResults.push(batchResult);
    
    if (batchResult.success) {
      results.totalProcessed += batchResult.processedRecords || batches[i].length;
    } else {
      results.success = false;
      results.totalErrors++;
      results.errors.push(`Batch ${i + 1}: ${batchResult.error}`);
    }
    
    // Add delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      Utilities.sleep(500); // 500ms delay
    }
  }
  
  logLocationFinancialOperation('API_BATCH', `Batch processing complete: ${results.totalProcessed}/${results.totalRecords} records processed`);
  
  return results;
}

/**
 * Sends a single batch of location financial data
 * @param {Object} payload - API payload
 * @param {Object} credentials - API credentials
 * @returns {Object} API response result
 */
function sendLocationFinancialBatch(payload, credentials) {
  const maxRetries = MAX_RETRIES;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logLocationFinancialOperation('API_REQUEST', `Attempt ${attempt}/${maxRetries} to send batch`);
      
      const response = makeLocationFinancialAPIRequest(payload, credentials);
      
      if (response.success) {
        logLocationFinancialOperation('API_SUCCESS', 'Batch sent successfully', response.data);
        return {
          success: true,
          data: response.data,
          processedRecords: response.data.results?.created + response.data.results?.updated || payload.records.length,
          responseTime: response.responseTime
        };
      } else {
        lastError = response.error;
        
        // Check if this is a retryable error
        if (response.statusCode === 429 || response.statusCode >= 500) {
          if (attempt < maxRetries) {
            const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
            logLocationFinancialOperation('API_RETRY', `Retrying in ${delay}ms due to ${response.statusCode} error`);
            Utilities.sleep(delay);
            continue;
          }
        }
        
        // Non-retryable error or max retries reached
        break;
      }
      
    } catch (error) {
      lastError = error.message;
      logLocationFinancialError('API_REQUEST', `Attempt ${attempt} failed`, error);
      
      if (attempt < maxRetries) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        Utilities.sleep(delay);
      }
    }
  }
  
  return {
    success: false,
    error: lastError || 'Unknown error after all retry attempts',
    attempts: maxRetries
  };
}

/**
 * Makes the actual HTTP request to the API
 * @param {Object} payload - Request payload
 * @param {Object} credentials - API credentials
 * @returns {Object} Response object
 */
function makeLocationFinancialAPIRequest(payload, credentials) {
  const startTime = new Date().getTime();
  
  const url = `${credentials.supabaseUrl}${LOCATION_FINANCIAL_IMPORT_ENDPOINT}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.supabaseKey}`,
      'apikey': credentials.supabaseKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  logLocationFinancialOperation('HTTP_REQUEST', `POST ${url}`, {
    recordCount: payload.records.length,
    payloadSize: JSON.stringify(payload).length
  });
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseTime = new Date().getTime() - startTime;
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logLocationFinancialOperation('HTTP_RESPONSE', `${statusCode} response in ${responseTime}ms`);
    
    if (statusCode >= 200 && statusCode < 300) {
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data: data,
          statusCode: statusCode,
          responseTime: responseTime
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          statusCode: statusCode,
          responseText: responseText,
          responseTime: responseTime
        };
      }
    } else {
      // Try to parse error response
      let errorMessage = `HTTP ${statusCode}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = responseText || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
        statusCode: statusCode,
        responseText: responseText,
        responseTime: responseTime
      };
    }
    
  } catch (error) {
    const responseTime = new Date().getTime() - startTime;
    return {
      success: false,
      error: `Network error: ${error.message}`,
      responseTime: responseTime
    };
  }
}

/**
 * Tests the API connection without sending data
 * @returns {Object} Test result
 */
function testLocationFinancialApiConnection() {
  try {
    const credentials = getLocationFinancialCredentials();
    if (!credentials.isValid) {
      return {
        success: false,
        error: 'Invalid credentials: ' + credentials.error
      };
    }
    
    // Send a dry-run request with minimal test data
    const testPayload = {
      clinicId: credentials.clinicId,
      dataSourceId: 'test-connection',
      records: [{
        date: formatLocationFinancialDate(new Date()),
        locationName: 'Baytown',
        production: 100.00,
        adjustments: 0,
        writeOffs: 0,
        patientIncome: 50.00,
        insuranceIncome: 50.00,
        unearned: null
      }],
      dryRun: true
    };
    
    logLocationFinancialOperation('TEST_CONNECTION', 'Testing API connection with dry-run request');
    
    const result = makeLocationFinancialAPIRequest(testPayload, credentials);
    
    if (result.success) {
      return {
        success: true,
        message: 'API connection successful',
        responseTime: result.responseTime,
        apiVersion: result.data?.apiVersion || 'Unknown'
      };
    } else {
      return {
        success: false,
        error: result.error,
        statusCode: result.statusCode,
        responseTime: result.responseTime
      };
    }
    
  } catch (error) {
    logLocationFinancialError('TEST_CONNECTION', 'Connection test failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gets and validates stored credentials
 * @returns {Object} Credentials object with validation status
 */
function getLocationFinancialCredentials() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    const supabaseUrl = properties.getProperty(LOCATION_FINANCIAL_SUPABASE_URL_PROPERTY_KEY);
    const supabaseKey = properties.getProperty(LOCATION_FINANCIAL_SUPABASE_KEY_PROPERTY_KEY);
    const clinicId = properties.getProperty(LOCATION_FINANCIAL_CLINIC_ID_PROPERTY_KEY);
    const dataSourceId = properties.getProperty(LOCATION_FINANCIAL_DATA_SOURCE_ID_PROPERTY_KEY);
    
    const errors = [];
    
    if (!supabaseUrl) {
      errors.push('Supabase URL not configured');
    } else if (!supabaseUrl.startsWith('https://')) {
      errors.push('Invalid Supabase URL format');
    }
    
    if (!supabaseKey) {
      errors.push('Supabase API key not configured');
    }
    
    if (!clinicId) {
      errors.push('Clinic ID not configured');
    }
    
    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join(', ')
      };
    }
    
    return {
      isValid: true,
      supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl,
      supabaseKey: supabaseKey,
      clinicId: clinicId,
      dataSourceId: dataSourceId
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to retrieve credentials: ${error.message}`
    };
  }
}

/**
 * Stores credentials in script properties
 * @param {Object} credentials - Credentials to store
 * @returns {boolean} Success status
 */
function storeLocationFinancialCredentials(credentials) {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    const propertiesToSet = {};
    
    if (credentials.supabaseUrl) {
      propertiesToSet[LOCATION_FINANCIAL_SUPABASE_URL_PROPERTY_KEY] = credentials.supabaseUrl;
    }
    
    if (credentials.supabaseKey) {
      propertiesToSet[LOCATION_FINANCIAL_SUPABASE_KEY_PROPERTY_KEY] = credentials.supabaseKey;
    }
    
    if (credentials.clinicId) {
      propertiesToSet[LOCATION_FINANCIAL_CLINIC_ID_PROPERTY_KEY] = credentials.clinicId;
    }
    
    if (credentials.dataSourceId) {
      propertiesToSet[LOCATION_FINANCIAL_DATA_SOURCE_ID_PROPERTY_KEY] = credentials.dataSourceId;
    }
    
    properties.setProperties(propertiesToSet);
    
    logLocationFinancialOperation('CREDENTIALS', 'Credentials stored successfully');
    return true;
    
  } catch (error) {
    logLocationFinancialError('CREDENTIALS', 'Failed to store credentials', error);
    return false;
  }
}

/**
 * Clears stored credentials
 * @returns {boolean} Success status
 */
function clearLocationFinancialCredentials() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    properties.deleteProperty(LOCATION_FINANCIAL_SUPABASE_URL_PROPERTY_KEY);
    properties.deleteProperty(LOCATION_FINANCIAL_SUPABASE_KEY_PROPERTY_KEY);
    properties.deleteProperty(LOCATION_FINANCIAL_CLINIC_ID_PROPERTY_KEY);
    properties.deleteProperty(LOCATION_FINANCIAL_DATA_SOURCE_ID_PROPERTY_KEY);
    
    logLocationFinancialOperation('CREDENTIALS', 'Credentials cleared successfully');
    return true;
    
  } catch (error) {
    logLocationFinancialError('CREDENTIALS', 'Failed to clear credentials', error);
    return false;
  }
}