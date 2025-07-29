/**
 * ===== SHARED SYNC UTILITIES LIBRARY =====
 * 
 * Resilient ID resolution for Google Apps Script sync systems
 * Prevents sync failures during database reseeds by using stable identifiers
 * 
 * This library provides functions for:
 * - Stable clinic/provider/location ID resolution
 * - External mapping system integration
 * - Automatic fallback and recovery mechanisms
 * - Sync resilience across database resets
 * 
 * Usage:
 * 1. Copy this file to your Google Apps Script project
 * 2. Use the getSyncCredentials() function to get all needed IDs
 * 3. Replace hard-coded IDs with stable lookups
 * 
 * @version 1.0.0
 * @author Database Sync Resilience System
 */

// ===== CONFIGURATION =====

/**
 * Supabase connection configuration
 * These should be set in your main config.gs file
 */
const SHARED_SYNC_CONFIG = {
  // These will be read from Script Properties
  SUPABASE_URL_PROPERTY_KEY: 'SUPABASE_URL',
  SUPABASE_KEY_PROPERTY_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
  
  // Database function endpoints
  FUNCTION_ENDPOINTS: {
    GET_CLINIC_BY_CODE: '/rest/v1/rpc/get_clinic_id_by_code',
    GET_PROVIDER_BY_CODE: '/rest/v1/rpc/get_provider_id_by_code',
    GET_LOCATION_BY_CODE: '/rest/v1/rpc/get_location_id_by_code',
    GET_BY_EXTERNAL_MAPPING: '/rest/v1/rpc/get_entity_id_by_external_mapping',
    UPSERT_EXTERNAL_MAPPING: '/rest/v1/rpc/upsert_external_mapping',
    GET_SYSTEM_MAPPINGS: '/rest/v1/rpc/get_system_mappings'
  },
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Cache duration (5 minutes)
  CACHE_DURATION_MS: 5 * 60 * 1000
};

// ===== CORE SYNC CREDENTIALS =====

/**
 * Get comprehensive sync credentials including resilient ID resolution
 * This is the main function that should replace getSupabaseCredentials() in sync systems
 * 
 * @param {string} systemName - Name of the sync system ('dentist_sync', 'hygienist_sync', etc.)
 * @param {object} options - Configuration options for ID resolution
 * @param {string} options.clinicCode - Stable clinic code (e.g., 'KAMDENTAL_HUMBLE')
 * @param {string} options.providerCode - Stable provider code (e.g., 'adriane_fontenot')
 * @param {string} options.locationCode - Stable location code (e.g., 'BAYTOWN_MAIN')
 * @param {object} options.externalMappings - External ID mappings for this system
 * @return {object|null} Complete credentials with resolved IDs or null if failed
 */
function getSyncCredentials(systemName, options = {}) {
  const functionName = 'getSyncCredentials';
  const startTime = Date.now();
  const correlationId = generateCorrelationId_();
  
  logWithMetadata(functionName, 'START', null, null, null, 
    `Starting sync credential resolution for: ${systemName}`, 
    { 
      system_name: systemName, 
      options: options,
      operation: 'credential_resolution'
    }, 
    correlationId);
  
  try {
    // Get basic Supabase credentials
    const credStartTime = Date.now();
    const basicCredentials = getBasicSupabaseCredentials_();
    const credDuration = Date.now() - credStartTime;
    
    if (!basicCredentials) {
      const errorMsg = 'Basic Supabase credentials not available';
      logCredentialResolution('sync', systemName, 'FAILED', {}, correlationId);
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          system_name: systemName,
          error_type: 'CREDENTIALS_MISSING',
          credential_check_duration_ms: credDuration
        }, 
        correlationId);
      return null;
    }
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      'Basic Supabase credentials resolved', 
      { 
        system_name: systemName,
        has_url: !!basicCredentials.url,
        has_key: !!basicCredentials.key,
        credential_duration_ms: credDuration
      }, 
      correlationId);
    
    // Resolve IDs using stable identifiers
    const idResolutionStartTime = Date.now();
    const resolvedIds = resolveStableIds_(systemName, options, basicCredentials, correlationId);
    const idResolutionDuration = Date.now() - idResolutionStartTime;
    
    if (!resolvedIds.success) {
      const errorMsg = `Failed to resolve stable IDs: ${resolvedIds.error}`;
      logCredentialResolution('sync', systemName, 'FAILED', {}, correlationId);
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          system_name: systemName,
          error_type: 'ID_RESOLUTION_FAILED',
          resolution_error: resolvedIds.error,
          id_resolution_duration_ms: idResolutionDuration
        }, 
        correlationId);
      return null;
    }
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      'Stable IDs resolved successfully', 
      { 
        system_name: systemName,
        resolved_fields: Object.keys(resolvedIds.data),
        has_clinic_id: !!resolvedIds.data.clinicId,
        has_provider_id: !!resolvedIds.data.providerId,
        has_location_id: !!resolvedIds.data.locationId,
        id_resolution_duration_ms: idResolutionDuration
      }, 
      correlationId);
    
    // Combine credentials with resolved IDs
    const fullCredentials = {
      ...basicCredentials,
      ...resolvedIds.data,
      // Map to expected property names for compatibility
      supabaseUrl: basicCredentials.url,
      supabaseKey: basicCredentials.key,
      systemName: systemName,
      timestamp: new Date().toISOString(),
      correlationId: correlationId
    };
    
    const totalDuration = (Date.now() - startTime) / 1000;
    const successMsg = `Successfully resolved credentials for ${systemName}`;
    
    logCredentialResolution('sync', systemName, 'SUCCESS', fullCredentials, correlationId);
    logWithMetadata(functionName, 'SUCCESS', null, null, totalDuration, 
      successMsg, 
      { 
        system_name: systemName,
        resolved_fields: Object.keys(resolvedIds.data),
        has_clinic_id: !!fullCredentials.clinicId,
        has_provider_id: !!fullCredentials.providerId,
        has_location_id: !!fullCredentials.locationId,
        total_duration_ms: Date.now() - startTime
      }, 
      correlationId);
    
    return fullCredentials;
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    const errorMsg = `Error getting sync credentials: ${error.message}`;
    
    logCredentialResolution('sync', systemName, 'FAILED', {}, correlationId);
    logWithMetadata(functionName, 'ERROR', null, null, errorDuration, 
      errorMsg, 
      { 
        system_name: systemName,
        error_type: 'CREDENTIAL_ERROR',
        error_message: error.message,
        error_stack: error.stack,
        error_duration_ms: Date.now() - startTime
      }, 
      correlationId);
    
    return null;
  }
}

/**
 * Get basic Supabase credentials from Script Properties
 * @return {object|null} Basic credentials or null if not set
 */
function getBasicSupabaseCredentials_() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  const url = userProperties.getProperty(SHARED_SYNC_CONFIG.SUPABASE_URL_PROPERTY_KEY) || 
               scriptProperties.getProperty(SHARED_SYNC_CONFIG.SUPABASE_URL_PROPERTY_KEY);
  const key = userProperties.getProperty(SHARED_SYNC_CONFIG.SUPABASE_KEY_PROPERTY_KEY) || 
               scriptProperties.getProperty(SHARED_SYNC_CONFIG.SUPABASE_KEY_PROPERTY_KEY);
  
  if (!url || !key) {
    Logger.log('getBasicSupabaseCredentials_: URL or Service Role Key not set in properties');
    return null;
  }
  
  return { url, key };
}

// ===== STABLE ID RESOLUTION =====

/**
 * Resolve stable identifiers to actual database IDs
 * @param {string} systemName - Name of the sync system
 * @param {object} options - ID resolution options
 * @param {object} credentials - Basic Supabase credentials
 * @return {object} Resolution result with success flag and data/error
 */
function resolveStableIds_(systemName, options, credentials) {
  const functionName = 'resolveStableIds_';
  const resolvedData = {};
  
  try {
    // 1. Resolve clinic ID
    if (options.clinicCode) {
      const clinicId = lookupClinicByCode_(options.clinicCode, credentials);
      if (clinicId) {
        resolvedData.clinicId = clinicId;
        Logger.log(`${functionName}: Resolved clinic ${options.clinicCode} → ${clinicId}`);
      } else {
        return { success: false, error: `Failed to resolve clinic code: ${options.clinicCode}` };
      }
    }
    
    // 2. Resolve provider ID
    if (options.providerCode) {
      const providerId = lookupProviderByCode_(options.providerCode, credentials);
      if (providerId) {
        resolvedData.providerId = providerId;
        Logger.log(`${functionName}: Resolved provider ${options.providerCode} → ${providerId}`);
      } else {
        return { success: false, error: `Failed to resolve provider code: ${options.providerCode}` };
      }
    }
    
    // 3. Resolve location ID
    if (options.locationCode) {
      const locationId = lookupLocationByCode_(options.locationCode, credentials);
      if (locationId) {
        resolvedData.locationId = locationId;
        Logger.log(`${functionName}: Resolved location ${options.locationCode} → ${locationId}`);
      } else {
        return { success: false, error: `Failed to resolve location code: ${options.locationCode}` };
      }
    }
    
    // 4. Resolve external mappings
    if (options.externalMappings) {
      for (const [externalId, entityType] of Object.entries(options.externalMappings)) {
        const entityId = lookupByExternalMapping_(systemName, externalId, entityType, credentials);
        if (entityId) {
          const fieldName = `${entityType}Id`; // e.g., 'clinicId', 'providerId'
          resolvedData[fieldName] = entityId;
          Logger.log(`${functionName}: Resolved external mapping ${externalId} → ${entityId}`);
        } else {
          Logger.log(`${functionName}: Warning: Could not resolve external mapping ${externalId} (${entityType})`);
        }
      }
    }
    
    return { success: true, data: resolvedData };
    
  } catch (error) {
    return { success: false, error: `ID resolution failed: ${error.message}` };
  }
}

// ===== DATABASE LOOKUP FUNCTIONS =====

/**
 * Look up clinic ID by stable clinic code
 * @param {string} clinicCode - Stable clinic code
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Clinic ID or null if not found
 */
function lookupClinicByCode_(clinicCode, credentials) {
  return callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.GET_CLINIC_BY_CODE,
    { clinic_code_input: clinicCode },
    credentials,
    'lookupClinicByCode_'
  );
}

/**
 * Look up provider ID by stable provider code
 * @param {string} providerCode - Stable provider code
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Provider ID or null if not found
 */
function lookupProviderByCode_(providerCode, credentials) {
  return callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.GET_PROVIDER_BY_CODE,
    { provider_code_input: providerCode },
    credentials,
    'lookupProviderByCode_'
  );
}

/**
 * Look up location ID by stable location code
 * @param {string} locationCode - Stable location code
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Location ID or null if not found
 */
function lookupLocationByCode_(locationCode, credentials) {
  return callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.GET_LOCATION_BY_CODE,
    { location_code_input: locationCode },
    credentials,
    'lookupLocationByCode_'
  );
}

/**
 * Look up entity ID by external mapping
 * @param {string} systemName - External system name
 * @param {string} externalId - External identifier
 * @param {string} entityType - Entity type ('clinic', 'provider', 'location')
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Entity ID or null if not found
 */
function lookupByExternalMapping_(systemName, externalId, entityType, credentials) {
  return callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.GET_BY_EXTERNAL_MAPPING,
    { 
      system_name: systemName,
      external_id_input: externalId,
      entity_type_input: entityType
    },
    credentials,
    'lookupByExternalMapping_'
  );
}

// ===== DATABASE FUNCTION CALLER =====

/**
 * Call a PostgreSQL function via Supabase REST API with retry logic
 * @param {string} endpoint - Function endpoint path
 * @param {object} params - Function parameters
 * @param {object} credentials - Supabase credentials
 * @param {string} callerName - Name of the calling function for logging
 * @return {string|null} Function result or null if failed
 */
function callDatabaseFunction_(endpoint, params, credentials, callerName) {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  
  // Try cache first with cache manager if available
  let cached = null;
  if (typeof getCachedDatabaseFunction === 'function') {
    cached = getCachedDatabaseFunction(endpoint, params);
  } else {
    cached = getCachedResult_(cacheKey);
  }
  
  if (cached !== null) {
    Logger.log(`${callerName}: Using cached result for ${endpoint}`);
    return cached;
  }
  
  let lastError = null;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= SHARED_SYNC_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const url = `${credentials.url}${endpoint}`;
      
      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.key}`,
          'apikey': credentials.key
        },
        payload: JSON.stringify(params),
        muteHttpExceptions: true
      };
      
      Logger.log(`${callerName}: Attempt ${attempt}/${SHARED_SYNC_CONFIG.MAX_RETRIES} calling ${endpoint}`);
      const response = UrlFetchApp.fetch(url, payload);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      const duration = Date.now() - startTime;
      
      if (responseCode >= 200 && responseCode < 300) {
        const result = JSON.parse(responseText);
        
        // PostgreSQL functions return the result directly
        const resultValue = result && typeof result === 'string' ? result : (result && result.length > 0 ? result[0] : null);
        
        // Cache the result with enhanced cache manager if available
        if (typeof cacheDatabaseFunction === 'function') {
          cacheDatabaseFunction(endpoint, params, resultValue);
        } else {
          setCachedResult_(cacheKey, resultValue);
        }
        
        // Log performance for monitoring
        if (typeof logMessage === 'function') {
          logMessage('DATABASE_FUNCTION', 
            `${callerName}: Success on attempt ${attempt}. Duration: ${duration}ms`, 
            duration > 3000 ? 'WARN' : 'INFO');
        }
        
        Logger.log(`${callerName}: Success on attempt ${attempt}. Result: ${resultValue}. Duration: ${duration}ms`);
        return resultValue;
        
      } else {
        lastError = `HTTP ${responseCode}: ${responseText}`;
        Logger.log(`${callerName}: Attempt ${attempt} failed: ${lastError}`);
        
        // Log error for diagnostics
        if (typeof logMessage === 'function') {
          logMessage('DATABASE_FUNCTION', 
            `${callerName}: Attempt ${attempt} failed: ${lastError}`, 
            'ERROR');
        }
        
        if (attempt < SHARED_SYNC_CONFIG.MAX_RETRIES) {
          const delayMs = SHARED_SYNC_CONFIG.RETRY_DELAY_MS * attempt;
          Logger.log(`${callerName}: Waiting ${delayMs}ms before retry...`);
          Utilities.sleep(delayMs);
        }
      }
      
    } catch (error) {
      lastError = error.message;
      Logger.log(`${callerName}: Attempt ${attempt} error: ${lastError}`);
      
      // Log network/connectivity errors
      if (typeof logMessage === 'function') {
        logMessage('DATABASE_FUNCTION', 
          `${callerName}: Network error on attempt ${attempt}: ${lastError}`, 
          'ERROR');
      }
      
      if (attempt < SHARED_SYNC_CONFIG.MAX_RETRIES) {
        const delayMs = SHARED_SYNC_CONFIG.RETRY_DELAY_MS * attempt;
        Utilities.sleep(delayMs);
      }
    }
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Try to handle error with error handler if available
  if (typeof handleSyncError === 'function') {
    const context = {
      function: 'callDatabaseFunction_',
      endpoint: endpoint,
      params: params,
      callerName: callerName,
      attempts: SHARED_SYNC_CONFIG.MAX_RETRIES,
      duration: totalDuration
    };
    
    const syncError = typeof createSyncError === 'function' ? 
      createSyncError(
        `Database function ${endpoint} failed after ${SHARED_SYNC_CONFIG.MAX_RETRIES} attempts: ${lastError}`,
        'DATABASE_CONNECTION',
        'HIGH',
        'DB_FUNCTION_FAILED',
        { context: context }
      ) : new Error(lastError);
    
    const result = handleSyncError(syncError, context);
    
    if (result.success) {
      return result.data;
    }
  }
  
  Logger.log(`${callerName}: All attempts failed after ${totalDuration}ms. Last error: ${lastError}`);
  return null;
}

// ===== CACHING UTILITIES =====

/**
 * Get cached result from temporary cache
 * @param {string} key - Cache key
 * @return {string|null} Cached result or null if not found/expired
 */
function getCachedResult_(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached;
  } catch (error) {
    Logger.log(`getCachedResult_: Cache error: ${error.message}`);
    return null;
  }
}

/**
 * Set cached result in temporary cache
 * @param {string} key - Cache key
 * @param {string} value - Value to cache
 */
function setCachedResult_(key, value) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheDurationSeconds = Math.floor(SHARED_SYNC_CONFIG.CACHE_DURATION_MS / 1000);
    cache.put(key, value, cacheDurationSeconds);
  } catch (error) {
    Logger.log(`setCachedResult_: Cache error: ${error.message}`);
  }
}

// ===== EXTERNAL MAPPING MANAGEMENT =====

/**
 * Create or update an external ID mapping
 * @param {string} systemName - External system name
 * @param {string} externalId - External identifier
 * @param {string} entityType - Entity type
 * @param {string} entityId - Database entity ID
 * @param {string} notes - Optional notes
 * @return {boolean} Success status
 */
function upsertExternalMapping(systemName, externalId, entityType, entityId, notes = null) {
  const credentials = getBasicSupabaseCredentials_();
  if (!credentials) {
    Logger.log('upsertExternalMapping: No credentials available');
    return false;
  }
  
  const result = callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.UPSERT_EXTERNAL_MAPPING,
    {
      system_name: systemName,
      external_id_input: externalId,
      entity_type_input: entityType,
      entity_id_input: entityId,
      notes_input: notes
    },
    credentials,
    'upsertExternalMapping'
  );
  
  return result === true || result === 'true';
}

/**
 * Get all external mappings for a system (debugging)
 * @param {string} systemName - External system name
 * @return {array|null} Array of mappings or null if failed
 */
function getSystemMappings(systemName) {
  const credentials = getBasicSupabaseCredentials_();
  if (!credentials) {
    Logger.log('getSystemMappings: No credentials available');
    return null;
  }
  
  return callDatabaseFunction_(
    SHARED_SYNC_CONFIG.FUNCTION_ENDPOINTS.GET_SYSTEM_MAPPINGS,
    { system_name: systemName },
    credentials,
    'getSystemMappings'
  );
}

// ===== SYSTEM-SPECIFIC CONFIGURATIONS =====

/**
 * Get dentist sync credentials with dual-location support
 * @return {object|null} Credentials for dentist sync system
 */
function getDentistSyncCredentials() {
  return getSyncCredentials('dentist_sync', {
    clinicCode: 'KAMDENTAL_BAYTOWN', // Primary clinic
    providerCode: 'obinna_ezeji',     // Primary provider
    externalMappings: {
      'HUMBLE_CLINIC': 'clinic',
      'BAYTOWN_CLINIC': 'clinic',
      'HUMBLE_LOCATION': 'location',
      'BAYTOWN_LOCATION': 'location',
      'OBINNA_PROVIDER': 'provider'
    }
  });
}

/**
 * Get hygienist sync credentials for Adriane
 * @return {object|null} Credentials for hygienist sync system
 */
function getHygienistSyncCredentials() {
  return getSyncCredentials('hygienist_sync', {
    clinicCode: 'KAMDENTAL_BAYTOWN',  // Adriane's clinic
    providerCode: 'adriane_fontenot', // Adriane's provider code
    externalMappings: {
      'ADRIANE_CLINIC': 'clinic',
      'ADRIANE_PROVIDER': 'provider'
    }
  });
}

// ===== SUPABASE REQUEST UTILITIES =====

/**
 * Make a request to Supabase REST API with comprehensive error handling and retry logic
 * This is the core function used by the auto-discovery system for database queries
 * 
 * @param {string} url - Full Supabase API endpoint URL
 * @param {string} method - HTTP method ('GET', 'POST', 'PATCH', 'DELETE')
 * @param {object} payload - Request payload for POST/PATCH requests
 * @param {string} apiKey - Supabase API key for authentication
 * @return {object} Parsed JSON response
 * @throws {Error} Descriptive error for failed requests
 */
function makeSupabaseRequest_(url, method, payload, apiKey) {
  const functionName = 'makeSupabaseRequest_';
  const maxRetries = SHARED_SYNC_CONFIG.MAX_RETRIES;
  const baseDelay = SHARED_SYNC_CONFIG.RETRY_DELAY_MS;
  
  // Validate input parameters
  if (!url || typeof url !== 'string') {
    throw new Error(`${functionName}: Invalid URL parameter`);
  }
  if (!method || typeof method !== 'string') {
    throw new Error(`${functionName}: Invalid method parameter`);
  }
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error(`${functionName}: Invalid API key parameter`);
  }
  
  const validMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];
  if (!validMethods.includes(method.toUpperCase())) {
    throw new Error(`${functionName}: Invalid HTTP method: ${method}`);
  }
  
  Logger.log(`${functionName}: Starting request to ${url} with method ${method}`);
  
  let lastError = null;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Prepare request options
      const requestOptions = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'apikey': apiKey,
          'Prefer': 'return=representation'
        },
        muteHttpExceptions: true
      };
      
      // Add payload for POST/PATCH/PUT requests
      if (['POST', 'PATCH', 'PUT'].includes(method.toUpperCase()) && payload) {
        try {
          requestOptions.payload = JSON.stringify(payload);
        } catch (jsonError) {
          throw new Error(`${functionName}: Failed to serialize payload: ${jsonError.message}`);
        }
      }
      
      Logger.log(`${functionName}: Attempt ${attempt}/${maxRetries} - Making request...`);
      
      // Make the HTTP request
      const response = UrlFetchApp.fetch(url, requestOptions);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      const duration = Date.now() - startTime;
      
      Logger.log(`${functionName}: Response code: ${responseCode}, Duration: ${duration}ms`);
      
      // Handle successful responses (2xx status codes)
      if (responseCode >= 200 && responseCode < 300) {
        let parsedResponse;
        
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
          // If JSON parsing fails, return the raw text wrapped in an object
          Logger.log(`${functionName}: Warning - Response is not valid JSON, returning raw text`);
          parsedResponse = { 
            result: responseText,
            rawResponse: true,
            statusCode: responseCode
          };
        }
        
        Logger.log(`${functionName}: Success on attempt ${attempt}. Duration: ${duration}ms`);
        
        // Log performance warning for slow requests
        if (duration > 3000) {
          Logger.log(`${functionName}: WARNING - Slow request detected (${duration}ms)`);
        }
        
        return parsedResponse;
      }
      
      // Handle client and server errors
      lastError = `HTTP ${responseCode}: ${responseText}`;
      
      // Parse error response if possible
      let errorDetails = responseText;
      try {
        const errorObj = JSON.parse(responseText);
        if (errorObj.message) {
          errorDetails = errorObj.message;
        } else if (errorObj.error) {
          errorDetails = errorObj.error;
        } else if (errorObj.details) {
          errorDetails = errorObj.details;
        }
      } catch (parseError) {
        // Use raw response text if JSON parsing fails
      }
      
      Logger.log(`${functionName}: Attempt ${attempt} failed: ${lastError}`);
      
      // Don't retry for certain client errors
      if (responseCode === 401) {
        throw new Error(`${functionName}: Authentication failed - Invalid API key or insufficient permissions`);
      }
      if (responseCode === 403) {
        throw new Error(`${functionName}: Access forbidden - Check Row Level Security policies and API key permissions`);
      }
      if (responseCode === 404) {
        throw new Error(`${functionName}: Resource not found - Check endpoint URL: ${url}`);
      }
      if (responseCode >= 400 && responseCode < 500) {
        throw new Error(`${functionName}: Client error (${responseCode}): ${errorDetails}`);
      }
      
      // Server errors (5xx) should be retried
      if (attempt < maxRetries && responseCode >= 500) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        Logger.log(`${functionName}: Server error, waiting ${delayMs}ms before retry...`);
        Utilities.sleep(delayMs);
        continue;
      }
      
      // If we're here, it's the last attempt or a non-retryable error
      lastError = `${functionName}: Request failed with HTTP ${responseCode}: ${errorDetails}`;
      
    } catch (error) {
      // Handle network/connectivity errors
      lastError = `${functionName}: Network error - ${error.message}`;
      Logger.log(`${functionName}: Attempt ${attempt} network error: ${error.message}`);
      
      // Don't retry certain error types
      if (error.message.includes('Authentication failed') || 
          error.message.includes('Access forbidden') ||
          error.message.includes('Client error')) {
        throw error;
      }
      
      // Retry network errors with exponential backoff
      if (attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        Logger.log(`${functionName}: Network error, waiting ${delayMs}ms before retry...`);
        Utilities.sleep(delayMs);
        continue;
      }
    }
  }
  
  const totalDuration = Date.now() - startTime;
  const finalError = `${functionName}: All ${maxRetries} attempts failed after ${totalDuration}ms. Last error: ${lastError}`;
  
  Logger.log(finalError);
  throw new Error(finalError);
}

/**
 * Simplified wrapper for GET requests to Supabase
 * @param {string} url - Supabase API endpoint URL
 * @param {string} apiKey - Supabase API key
 * @return {object} Parsed JSON response
 */
function makeSupabaseGetRequest_(url, apiKey) {
  return makeSupabaseRequest_(url, 'GET', null, apiKey);
}

/**
 * Simplified wrapper for POST requests to Supabase
 * @param {string} url - Supabase API endpoint URL
 * @param {object} payload - Request payload
 * @param {string} apiKey - Supabase API key
 * @return {object} Parsed JSON response
 */
function makeSupabasePostRequest_(url, payload, apiKey) {
  return makeSupabaseRequest_(url, 'POST', payload, apiKey);
}

// ===== TESTING AND VALIDATION =====

/**
 * Test all sync utilities functions
 * This function should be run after setup to validate the system
 */
function testSyncUtilities() {
  console.log('🧪 Testing Shared Sync Utilities...');
  
  // Test dentist sync credentials
  console.log('\n1. Testing dentist sync credentials...');
  const dentistCreds = getDentistSyncCredentials();
  if (dentistCreds) {
    console.log('✅ Dentist sync credentials resolved successfully');
    console.log(`   Clinic ID: ${dentistCreds.clinicId}`);
    console.log(`   Provider ID: ${dentistCreds.providerId}`);
  } else {
    console.log('❌ Dentist sync credentials failed');
  }
  
  // Test hygienist sync credentials  
  console.log('\n2. Testing hygienist sync credentials...');
  const hygienistCreds = getHygienistSyncCredentials();
  if (hygienistCreds) {
    console.log('✅ Hygienist sync credentials resolved successfully');
    console.log(`   Clinic ID: ${hygienistCreds.clinicId}`);
    console.log(`   Provider ID: ${hygienistCreds.providerId}`);
  } else {
    console.log('❌ Hygienist sync credentials failed');
  }
  
  // Test external mappings
  console.log('\n3. Testing external mappings...');
  const dentistMappings = getSystemMappings('dentist_sync');
  const hygienistMappings = getSystemMappings('hygienist_sync');
  
  console.log(`   Dentist mappings: ${dentistMappings ? dentistMappings.length : 0} found`);
  console.log(`   Hygienist mappings: ${hygienistMappings ? hygienistMappings.length : 0} found`);
  
  console.log('\n🎉 Sync utilities testing complete!');
}

/**
 * Test the makeSupabaseRequest_ function with a simple query
 * This function validates that the Supabase request utility works correctly
 */
function testMakeSupabaseRequest() {
  console.log('🧪 Testing makeSupabaseRequest_ function...');
  
  try {
    // Get basic credentials
    const credentials = getBasicSupabaseCredentials_();
    if (!credentials) {
      console.log('❌ No Supabase credentials available for testing');
      return false;
    }
    
    // Test with a simple health check query
    const testUrl = `${credentials.url}/rest/v1/rpc/get_current_clinic_id`;
    
    console.log(`Testing request to: ${testUrl}`);
    
    const response = makeSupabaseRequest_(testUrl, 'POST', {}, credentials.key);
    
    console.log('✅ makeSupabaseRequest_ test successful');
    console.log(`   Response type: ${typeof response}`);
    console.log(`   Response keys: ${Object.keys(response)}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ makeSupabaseRequest_ test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test the full auto-discovery integration with makeSupabaseRequest_
 * This validates that the provider discovery system can use the new function
 */
function testAutoDiscoveryIntegration() {
  console.log('🧪 Testing Auto-Discovery Integration...');
  
  try {
    // Test getSyncCredentials with dentist_sync (as used in auto-discovery)
    const credentials = getSyncCredentials('dentist_sync');
    if (!credentials) {
      console.log('❌ Failed to get dentist_sync credentials');
      return false;
    }
    
    console.log('✅ Retrieved dentist_sync credentials');
    console.log(`   Has supabaseUrl: ${!!credentials.supabaseUrl}`);
    console.log(`   Has supabaseKey: ${!!credentials.supabaseKey}`);
    
    // Test the exact query used in auto-discovery
    const testQuery = `
      SELECT 
        p.id,
        p.external_id,
        p.first_name,
        p.last_name,
        p.email,
        p.title,
        p.specialization,
        p.created_at,
        p.updated_at
      FROM providers p
      WHERE p.deleted_at IS NULL
      ORDER BY p.last_name, p.first_name
      LIMIT 5
    `;
    
    console.log('Testing provider query with makeSupabaseRequest_...');
    
    const response = makeSupabaseRequest_(
      `${credentials.supabaseUrl}/rest/v1/rpc/execute_sql`,
      'POST',
      { query: testQuery },
      credentials.supabaseKey
    );
    
    console.log('✅ Auto-discovery integration test successful');
    console.log(`   Response type: ${typeof response}`);
    
    if (response && response.result) {
      console.log(`   Found ${response.result.length} providers`);
      if (response.result.length > 0) {
        const firstProvider = response.result[0];
        console.log(`   First provider: ${firstProvider.first_name} ${firstProvider.last_name}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Auto-discovery integration test failed: ${error.message}`);
    console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    return false;
  }
}

/**
 * Example: How to replace old hard-coded credential functions
 * 
 * OLD WAY (in config.gs):
 * function getSupabaseCredentials_() {
 *   const clinicId = scriptProperties.getProperty('HYGIENE_CLINIC_ID');
 *   const providerId = scriptProperties.getProperty('HYGIENE_PROVIDER_ID');
 *   return { url, key, clinicId, providerId };
 * }
 * 
 * NEW WAY (using this library):
 * function getSupabaseCredentials_() {
 *   return getHygienistSyncCredentials(); // or getDentistSyncCredentials()
 * }
 * 
 * This change makes your sync system resilient to database reseeds!
 */