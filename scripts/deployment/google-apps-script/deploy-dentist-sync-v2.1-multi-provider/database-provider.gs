/**
 * ===== DATABASE-DRIVEN PROVIDER DISCOVERY =====
 * 
 * Dynamic provider lookup from Supabase database instead of hardcoded configurations
 * Supports multi-clinic relationships and graceful error handling
 * 
 * Features:
 * - Direct database queries for provider information
 * - Multi-clinic relationship support via provider_locations
 * - Fallback to hardcoded configurations during transition
 * - Comprehensive error handling and logging
 * - Cache support for performance
 * 
 * @version 1.0.0
 * @requires config.gs, credentials.gs, shared-sync-utils.gs
 */

// ===== PROVIDER DATABASE QUERY CONFIGURATION =====

/**
 * Database query endpoints for provider discovery
 */
const PROVIDER_DB_CONFIG = {
  // Provider lookup queries
  PROVIDER_BY_CODE_ENDPOINT: '/rest/v1/providers',
  PROVIDER_LOCATIONS_ENDPOINT: '/rest/v1/provider_locations',
  CLINIC_BY_CODE_ENDPOINT: '/rest/v1/clinics',
  LOCATION_BY_CODE_ENDPOINT: '/rest/v1/locations',
  
  // Cache configuration
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_PREFIX: 'provider_db_',
  
  // Query configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000
};

// ===== MAIN PROVIDER DISCOVERY FUNCTION =====

/**
 * Get provider information from database using provider code
 * This replaces hardcoded PROVIDERS configuration
 * 
 * @param {string} providerCode - Provider code (e.g., 'obinna_ezeji', 'kamdi_irondi')
 * @return {Object|null} Provider configuration with database data or null if not found
 */
function getProviderFromDatabase(providerCode) {
  const functionName = 'getProviderFromDatabase';
  const startTime = Date.now();
  const correlationId = generateCorrelationId_();
  
  // Log operation start
  logWithMetadata(functionName, 'START', null, null, null, 
    `Starting provider lookup for: ${providerCode}`, 
    { provider_code: providerCode, operation: 'provider_lookup' }, 
    correlationId);
  
  if (!providerCode) {
    const error = 'Provider code is required';
    logWithMetadata(functionName, 'ERROR', null, null, null, error, 
      { error_type: 'VALIDATION', provider_code: providerCode }, correlationId);
    return null;
  }
  
  try {
    // Check cache first
    const cacheKey = `${PROVIDER_DB_CONFIG.CACHE_PREFIX}${providerCode}`;
    const cacheStartTime = Date.now();
    const cachedResult = getCachedResult_(cacheKey);
    
    if (cachedResult) {
      logCacheOperation('HIT', cacheKey, JSON.stringify(cachedResult).length, correlationId);
      logWithMetadata(functionName, 'SUCCESS', null, null, (Date.now() - startTime) / 1000, 
        `Using cached result for ${providerCode}`, 
        { 
          provider_code: providerCode, 
          cache_hit: true, 
          cache_duration_ms: Date.now() - cacheStartTime,
          source: 'cache'
        }, 
        correlationId);
      return cachedResult;
    } else {
      logCacheOperation('MISS', cacheKey, null, correlationId);
    }
    
    // Get basic credentials for database access
    const credStartTime = Date.now();
    const credentials = getBasicSupabaseCredentials_();
    
    if (!credentials) {
      const errorMsg = 'No database credentials available';
      logWithMetadata(functionName, 'WARNING', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          provider_code: providerCode, 
          error_type: 'CREDENTIALS_MISSING', 
          fallback_attempted: true,
          credential_check_duration_ms: Date.now() - credStartTime
        }, 
        correlationId);
      return getFallbackProviderConfig_(providerCode);
    }
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      'Database credentials resolved successfully', 
      { 
        provider_code: providerCode, 
        has_url: !!credentials.url, 
        has_key: !!credentials.key,
        credential_resolution_duration_ms: Date.now() - credStartTime
      }, 
      correlationId);
    
    // Query provider from database
    const queryStartTime = Date.now();
    const providerData = queryProviderByCode_(providerCode, credentials, correlationId);
    const queryDuration = Date.now() - queryStartTime;
    
    if (!providerData) {
      const warningMsg = `Provider ${providerCode} not found in database, using fallback`;
      logWithMetadata(functionName, 'WARNING', null, null, (Date.now() - startTime) / 1000, 
        warningMsg, 
        { 
          provider_code: providerCode, 
          database_query_duration_ms: queryDuration,
          fallback_attempted: true,
          query_result: 'NOT_FOUND'
        }, 
        correlationId);
      return getFallbackProviderConfig_(providerCode);
    }
    
    logDatabaseOperation('PROVIDER_QUERY', 'providers', queryStartTime, 'SUCCESS', 
      { 
        provider_code: providerCode, 
        provider_id: providerData.id,
        provider_name: providerData.name,
        query_duration_ms: queryDuration
      }, 
      correlationId);
    
    // Get provider-location relationships
    const locationQueryStartTime = Date.now();
    const locationRelationships = queryProviderLocations_(providerData.id, credentials, correlationId);
    const locationQueryDuration = Date.now() - locationQueryStartTime;
    
    logDatabaseOperation('PROVIDER_LOCATIONS_QUERY', 'provider_locations', locationQueryStartTime, 'SUCCESS', 
      { 
        provider_id: providerData.id, 
        provider_code: providerCode,
        location_count: locationRelationships.length,
        query_duration_ms: locationQueryDuration
      }, 
      correlationId);
    
    // Build comprehensive provider configuration
    const buildStartTime = Date.now();
    const providerConfig = buildProviderConfiguration_(providerData, locationRelationships, correlationId);
    const buildDuration = Date.now() - buildStartTime;
    
    // Cache the result
    const cacheSetStartTime = Date.now();
    setCachedResult_(cacheKey, providerConfig);
    logCacheOperation('SET', cacheKey, JSON.stringify(providerConfig).length, correlationId);
    
    const totalDuration = (Date.now() - startTime) / 1000;
    const successMsg = `Successfully retrieved provider ${providerCode} from database`;
    
    logWithMetadata(functionName, 'SUCCESS', null, null, totalDuration, 
      successMsg, 
      { 
        provider_code: providerCode,
        provider_id: providerData.id,
        provider_name: providerData.name,
        total_locations: locationRelationships.length,
        active_locations: locationRelationships.filter(rel => rel.is_active).length,
        primary_clinic: providerConfig.primaryClinic,
        build_duration_ms: buildDuration,
        cache_set_duration_ms: Date.now() - cacheSetStartTime,
        total_duration_ms: Date.now() - startTime,
        source: 'database'
      }, 
      correlationId);
    
    return providerConfig;
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    const errorMsg = `Error retrieving provider ${providerCode}: ${error.message}`;
    
    logWithMetadata(functionName, 'ERROR', null, null, errorDuration, 
      errorMsg, 
      { 
        provider_code: providerCode,
        error_type: 'DATABASE_ERROR',
        error_message: error.message,
        error_stack: error.stack,
        fallback_attempted: true,
        error_duration_ms: Date.now() - startTime
      }, 
      correlationId);
    
    // Graceful fallback to hardcoded configuration
    const fallbackMsg = `Falling back to hardcoded configuration for ${providerCode}`;
    logWithMetadata(functionName, 'WARNING', null, null, null, 
      fallbackMsg, 
      { 
        provider_code: providerCode, 
        fallback_reason: 'DATABASE_ERROR',
        original_error: error.message
      }, 
      correlationId);
    
    return getFallbackProviderConfig_(providerCode);
  }
}

// ===== DATABASE QUERY FUNCTIONS =====

/**
 * Query provider information by provider code
 * @param {string} providerCode - Provider code to query
 * @param {Object} credentials - Supabase credentials
 * @return {Object|null} Provider data or null if not found
 */
function queryProviderByCode_(providerCode, credentials, correlationId = null) {
  const functionName = 'queryProviderByCode_';
  const startTime = Date.now();
  const corrId = correlationId || generateCorrelationId_();
  
  try {
    const url = `${credentials.url}${PROVIDER_DB_CONFIG.PROVIDER_BY_CODE_ENDPOINT}?provider_code=eq.${encodeURIComponent(providerCode)}&select=*`;
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      `Querying provider by code: ${providerCode}`, 
      { 
        provider_code: providerCode, 
        endpoint: PROVIDER_DB_CONFIG.PROVIDER_BY_CODE_ENDPOINT,
        url: url.replace(credentials.key, '***REDACTED***'),
        operation: 'HTTP_GET'
      }, 
      corrId);
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const requestStartTime = Date.now();
    const response = UrlFetchApp.fetch(url, options);
    const requestDuration = Date.now() - requestStartTime;
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logDatabaseOperation('PROVIDER_QUERY_HTTP', PROVIDER_DB_CONFIG.PROVIDER_BY_CODE_ENDPOINT, 
      requestStartTime, responseCode === 200 ? 'SUCCESS' : 'ERROR', 
      { 
        provider_code: providerCode,
        http_method: 'GET',
        response_code: responseCode,
        response_size_bytes: responseText.length,
        request_duration_ms: requestDuration
      }, 
      corrId);
    
    if (responseCode !== 200) {
      const errorMsg = `Database query failed with code ${responseCode}: ${responseText}`;
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          provider_code: providerCode,
          http_status: responseCode,
          response_body: responseText,
          error_type: 'HTTP_ERROR',
          request_duration_ms: requestDuration
        }, 
        corrId);
      return null;
    }
    
    const parseStartTime = Date.now();
    const providers = JSON.parse(responseText);
    const parseDuration = Date.now() - parseStartTime;
    
    if (!providers || providers.length === 0) {
      const warningMsg = `No provider found with code ${providerCode}`;
      logWithMetadata(functionName, 'WARNING', null, null, (Date.now() - startTime) / 1000, 
        warningMsg, 
        { 
          provider_code: providerCode,
          query_result: 'NOT_FOUND',
          response_size: responseText.length,
          parse_duration_ms: parseDuration,
          total_duration_ms: Date.now() - startTime
        }, 
        corrId);
      return null;
    }
    
    if (providers.length > 1) {
      const warningMsg = `Multiple providers found with code ${providerCode}, using first one`;
      logWithMetadata(functionName, 'WARNING', null, null, null, 
        warningMsg, 
        { 
          provider_code: providerCode,
          provider_count: providers.length,
          selected_provider_id: providers[0].id,
          all_provider_ids: providers.map(p => p.id)
        }, 
        corrId);
    }
    
    const successMsg = `Provider found: ${providers[0].name} (ID: ${providers[0].id})`;
    logWithMetadata(functionName, 'SUCCESS', null, null, (Date.now() - startTime) / 1000, 
      successMsg, 
      { 
        provider_code: providerCode,
        provider_id: providers[0].id,
        provider_name: providers[0].name,
        provider_type: providers[0].provider_type,
        provider_status: providers[0].status,
        parse_duration_ms: parseDuration,
        total_duration_ms: Date.now() - startTime
      }, 
      corrId);
    
    return providers[0];
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    const errorMsg = `Error querying provider: ${error.message}`;
    
    logWithMetadata(functionName, 'ERROR', null, null, errorDuration, 
      errorMsg, 
      { 
        provider_code: providerCode,
        error_type: 'QUERY_ERROR',
        error_message: error.message,
        error_stack: error.stack,
        error_duration_ms: Date.now() - startTime
      }, 
      corrId);
    
    return null;
  }
}

/**
 * Query provider-location relationships
 * @param {string} providerId - Provider ID
 * @param {Object} credentials - Supabase credentials
 * @return {Array} Array of location relationships
 */
function queryProviderLocations_(providerId, credentials, correlationId = null) {
  const functionName = 'queryProviderLocations_';
  const startTime = Date.now();
  const corrId = correlationId || generateCorrelationId_();
  
  try {
    const url = `${credentials.url}${PROVIDER_DB_CONFIG.PROVIDER_LOCATIONS_ENDPOINT}?provider_id=eq.${encodeURIComponent(providerId)}&select=*,location:locations!inner(*,clinic:clinics!inner(*))`;
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      `Querying provider locations for: ${providerId}`, 
      { 
        provider_id: providerId, 
        endpoint: PROVIDER_DB_CONFIG.PROVIDER_LOCATIONS_ENDPOINT,
        url: url.replace(credentials.key, '***REDACTED***'),
        operation: 'HTTP_GET',
        includes_joins: true
      }, 
      corrId);
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const requestStartTime = Date.now();
    const response = UrlFetchApp.fetch(url, options);
    const requestDuration = Date.now() - requestStartTime;
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logDatabaseOperation('PROVIDER_LOCATIONS_HTTP', PROVIDER_DB_CONFIG.PROVIDER_LOCATIONS_ENDPOINT, 
      requestStartTime, responseCode === 200 ? 'SUCCESS' : 'ERROR', 
      { 
        provider_id: providerId,
        http_method: 'GET',
        response_code: responseCode,
        response_size_bytes: responseText.length,
        request_duration_ms: requestDuration,
        has_joins: true
      }, 
      corrId);
    
    if (responseCode !== 200) {
      const errorMsg = `Failed to query provider locations: ${responseCode} - ${responseText}`;
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          provider_id: providerId,
          http_status: responseCode,
          response_body: responseText,
          error_type: 'HTTP_ERROR',
          request_duration_ms: requestDuration
        }, 
        corrId);
      return [];
    }
    
    const parseStartTime = Date.now();
    const relationships = JSON.parse(responseText);
    const parseDuration = Date.now() - parseStartTime;
    
    const relationshipCount = relationships ? relationships.length : 0;
    const activeRelationships = relationships ? relationships.filter(rel => rel.is_active).length : 0;
    const primaryRelationships = relationships ? relationships.filter(rel => rel.is_primary).length : 0;
    
    const successMsg = `Found ${relationshipCount} location relationships for provider ${providerId}`;
    logWithMetadata(functionName, 'SUCCESS', null, null, (Date.now() - startTime) / 1000, 
      successMsg, 
      { 
        provider_id: providerId,
        total_relationships: relationshipCount,
        active_relationships: activeRelationships,
        primary_relationships: primaryRelationships,
        parse_duration_ms: parseDuration,
        total_duration_ms: Date.now() - startTime,
        clinics_found: relationships ? [...new Set(relationships.map(r => r.location?.clinic?.name).filter(Boolean))] : []
      }, 
      corrId);
    
    return relationships || [];
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    const errorMsg = `Error querying provider locations: ${error.message}`;
    
    logWithMetadata(functionName, 'ERROR', null, null, errorDuration, 
      errorMsg, 
      { 
        provider_id: providerId,
        error_type: 'QUERY_ERROR',
        error_message: error.message,
        error_stack: error.stack,
        error_duration_ms: Date.now() - startTime
      }, 
      corrId);
    
    return [];
  }
}

/**
 * Query clinic information by clinic code
 * @param {string} clinicCode - Clinic code to query
 * @param {Object} credentials - Supabase credentials
 * @return {Object|null} Clinic data or null if not found
 */
function queryClinicByCode_(clinicCode, credentials) {
  const functionName = 'queryClinicByCode_';
  
  try {
    const url = `${credentials.url}${PROVIDER_DB_CONFIG.CLINIC_BY_CODE_ENDPOINT}?clinic_code=eq.${encodeURIComponent(clinicCode)}&select=*`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log(`${functionName}: Failed to query clinic: ${responseCode} - ${responseText}`);
      return null;
    }
    
    const clinics = JSON.parse(responseText);
    if (!clinics || clinics.length === 0) {
      return null;
    }
    
    return clinics[0];
    
  } catch (error) {
    Logger.log(`${functionName}: Error querying clinic: ${error.message}`);
    return null;
  }
}

// ===== CONFIGURATION BUILDING =====

/**
 * Build comprehensive provider configuration from database data
 * @param {Object} providerData - Provider data from database
 * @param {Array} locationRelationships - Provider-location relationships
 * @return {Object} Complete provider configuration
 */
function buildProviderConfiguration_(providerData, locationRelationships, correlationId = null) {
  const functionName = 'buildProviderConfiguration_';
  const startTime = Date.now();
  const corrId = correlationId || generateCorrelationId_();
  
  logWithMetadata(functionName, 'INFO', null, null, null, 
    `Building configuration for provider: ${providerData.name}`, 
    { 
      provider_id: providerData.id,
      provider_name: providerData.name,
      total_relationships: locationRelationships.length,
      operation: 'build_config'
    }, 
    corrId);
  
  try {
    // Find primary location
    const primaryRelationship = locationRelationships.find(rel => rel.is_primary === true);
    let primaryClinic = null;
    let primaryLocation = null;
    
    if (primaryRelationship && primaryRelationship.location) {
      primaryLocation = primaryRelationship.location;
      primaryClinic = primaryLocation.clinic;
    } else if (locationRelationships.length > 0) {
      // Use first active relationship as fallback
      const activeRelationship = locationRelationships.find(rel => rel.is_active === true);
      if (activeRelationship && activeRelationship.location) {
        primaryLocation = activeRelationship.location;
        primaryClinic = primaryLocation.clinic;
      }
    }
    
    // Map locations to clinic codes
    const clinicMappings = {};
    const locationMappings = {};
    
    locationRelationships.forEach(relationship => {
      if (relationship.location && relationship.location.clinic) {
        const location = relationship.location;
        const clinic = location.clinic;
        
        // Map clinic codes
        if (clinic.clinic_code) {
          clinicMappings[clinic.clinic_code] = {
            clinicId: clinic.id,
            clinicCode: clinic.clinic_code,
            displayName: clinic.name,
            locationCode: location.location_code,
            isActive: relationship.is_active,
            isPrimary: relationship.is_primary
          };
        }
        
        // Map location codes
        if (location.location_code) {
          locationMappings[location.location_code] = {
            locationId: location.id,
            locationCode: location.location_code,
            clinicId: clinic.id,
            clinicCode: clinic.clinic_code,
            displayName: location.name,
            isActive: relationship.is_active,
            isPrimary: relationship.is_primary
          };
        }
      }
    });
    
    // Build configuration compatible with existing system
    const config = {
      // Provider information
      providerId: providerData.id,
      providerCode: providerData.provider_code,
      externalId: `${providerData.provider_code.toUpperCase()}_PROVIDER`,
      displayName: providerData.name,
      firstName: providerData.first_name,
      lastName: providerData.last_name,
      email: providerData.email,
      providerType: providerData.provider_type,
      position: providerData.position,
      status: providerData.status,
      
      // Primary clinic information
      primaryClinic: primaryClinic ? primaryClinic.clinic_code : null,
      primaryClinicConfig: primaryClinic ? {
        clinicId: primaryClinic.id,
        clinicCode: primaryClinic.clinic_code,
        externalId: `${primaryClinic.clinic_code}_CLINIC`,
        displayName: primaryClinic.name,
        location: primaryClinic.location
      } : null,
      
      // Primary location information
      primaryLocation: primaryLocation ? {
        locationId: primaryLocation.id,
        locationCode: primaryLocation.location_code,
        externalId: `${primaryLocation.location_code}_LOCATION`,
        displayName: primaryLocation.name,
        address: primaryLocation.address
      } : null,
      
      // All clinic relationships
      clinicMappings: clinicMappings,
      locationMappings: locationMappings,
      
      // Metadata
      source: 'database',
      lastUpdated: new Date().toISOString(),
      totalLocations: locationRelationships.length,
      activeLocations: locationRelationships.filter(rel => rel.is_active).length
    };
    
    const buildDuration = (Date.now() - startTime) / 1000;
    const successMsg = `Built configuration for provider ${config.displayName} with ${config.totalLocations} locations`;
    
    logWithMetadata(functionName, 'SUCCESS', null, null, buildDuration, 
      successMsg, 
      { 
        provider_id: providerData.id,
        provider_code: config.providerCode,
        provider_name: config.displayName,
        total_locations: config.totalLocations,
        active_locations: config.activeLocations,
        primary_clinic: config.primaryClinic,
        clinic_mappings_count: Object.keys(config.clinicMappings).length,
        location_mappings_count: Object.keys(config.locationMappings).length,
        has_primary_location: !!config.primaryLocation,
        build_duration_ms: Date.now() - startTime
      }, 
      corrId);
    
    return config;
    
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    const errorMsg = `Error building provider configuration: ${error.message}`;
    
    logWithMetadata(functionName, 'ERROR', null, null, errorDuration, 
      errorMsg, 
      { 
        provider_id: providerData.id,
        provider_name: providerData.name,
        error_type: 'BUILD_ERROR',
        error_message: error.message,
        error_stack: error.stack,
        error_duration_ms: Date.now() - startTime
      }, 
      corrId);
    
    throw error;
  }
}

// ===== FALLBACK FUNCTIONS =====

/**
 * Get fallback provider configuration from hardcoded data
 * Used when database is unavailable or provider not found
 * @param {string} providerCode - Provider code
 * @return {Object|null} Fallback configuration or null
 */
function getFallbackProviderConfig_(providerCode) {
  const functionName = 'getFallbackProviderConfig_';
  
  // Use existing hardcoded configuration as fallback
  const providers = DENTIST_SYNC_CONFIG.PROVIDERS;
  
  for (const [key, config] of Object.entries(providers)) {
    if (config.providerCode === providerCode) {
      Logger.log(`${functionName}: Using fallback configuration for ${providerCode}`);
      return {
        ...config,
        source: 'fallback',
        primaryClinicConfig: DENTIST_SYNC_CONFIG.CLINICS[config.primaryClinic] || null,
        lastUpdated: new Date().toISOString()
      };
    }
  }
  
  Logger.log(`${functionName}: No fallback configuration found for ${providerCode}`);
  return null;
}

// ===== CACHE FUNCTIONS =====

/**
 * Get cached result if still valid
 * @param {string} cacheKey - Cache key
 * @return {Object|null} Cached result or null if not found/expired
 */
function getCachedResult_(cacheKey) {
  try {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      
      // Check if cache is still valid
      const cacheAge = new Date().getTime() - new Date(parsed.timestamp).getTime();
      if (cacheAge < PROVIDER_DB_CONFIG.CACHE_DURATION_MS) {
        return parsed.data;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log(`getCachedResult_: Error reading cache: ${error.message}`);
    return null;
  }
}

/**
 * Set cached result
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 */
function setCachedResult_(cacheKey, data) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheData = {
      data: data,
      timestamp: new Date().toISOString()
    };
    
    // Cache for the configured duration (in seconds)
    const cacheDurationSeconds = Math.floor(PROVIDER_DB_CONFIG.CACHE_DURATION_MS / 1000);
    cache.put(cacheKey, JSON.stringify(cacheData), cacheDurationSeconds);
    
  } catch (error) {
    Logger.log(`setCachedResult_: Error setting cache: ${error.message}`);
  }
}

// ===== DATABASE CONNECTIVITY TESTING =====

/**
 * Test database connectivity for provider queries
 * @return {Object} Test results
 */
function testProviderDatabaseConnectivity() {
  const functionName = 'testProviderDatabaseConnectivity';
  
  try {
    const credentials = getBasicSupabaseCredentials_();
    if (!credentials) {
      return {
        success: false,
        error: 'No database credentials available',
        suggestions: ['Run Setup Credentials from the menu']
      };
    }
    
    // Test basic providers table access
    const url = `${credentials.url}${PROVIDER_DB_CONFIG.PROVIDER_BY_CODE_ENDPOINT}?limit=1`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const providers = JSON.parse(responseText);
      
      return {
        success: true,
        message: 'Database connectivity successful',
        details: {
          providersTableAccessible: true,
          totalProviders: providers.length,
          timestamp: new Date().toISOString()
        }
      };
      
    } else {
      return {
        success: false,
        error: `Database access failed: ${responseCode} - ${responseText}`,
        suggestions: [
          'Check Supabase credentials',
          'Verify providers table exists',
          'Check RLS policies allow access'
        ]
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Connectivity test failed: ${error.message}`,
      suggestions: [
        'Check network connectivity',
        'Verify Supabase URL format',
        'Check service role key permissions'
      ]
    };
  }
}

// ===== MIGRATION HELPERS =====

/**
 * Compare database provider with fallback configuration
 * Useful for testing and migration validation
 * @param {string} providerCode - Provider code to compare
 * @return {Object} Comparison results
 */
function compareProviderConfigurations(providerCode) {
  const functionName = 'compareProviderConfigurations';
  
  try {
    const dbConfig = getProviderFromDatabase(providerCode);
    const fallbackConfig = getFallbackProviderConfig_(providerCode);
    
    const comparison = {
      providerCode: providerCode,
      database: {
        available: dbConfig !== null,
        source: dbConfig ? dbConfig.source : null,
        primaryClinic: dbConfig ? dbConfig.primaryClinic : null
      },
      fallback: {
        available: fallbackConfig !== null,
        source: fallbackConfig ? fallbackConfig.source : null,
        primaryClinic: fallbackConfig ? fallbackConfig.primaryClinic : null
      },
      differences: [],
      recommendations: []
    };
    
    if (dbConfig && fallbackConfig) {
      // Compare key fields
      if (dbConfig.displayName !== fallbackConfig.displayName) {
        comparison.differences.push(`Display name: DB="${dbConfig.displayName}" vs Fallback="${fallbackConfig.displayName}"`);
      }
      
      if (dbConfig.primaryClinic !== fallbackConfig.primaryClinic) {
        comparison.differences.push(`Primary clinic: DB="${dbConfig.primaryClinic}" vs Fallback="${fallbackConfig.primaryClinic}"`);
      }
      
      if (comparison.differences.length === 0) {
        comparison.recommendations.push('Configuration matches - safe to switch to database-driven mode');
      } else {
        comparison.recommendations.push('Review differences before switching to database-driven mode');
      }
    } else if (dbConfig && !fallbackConfig) {
      comparison.recommendations.push('Provider found in database but not in fallback - good database coverage');
    } else if (!dbConfig && fallbackConfig) {
      comparison.recommendations.push('Provider missing from database - add to database before switching');
    } else {
      comparison.recommendations.push('Provider not found in either source - check configuration');
    }
    
    return comparison;
    
  } catch (error) {
    return {
      providerCode: providerCode,
      error: error.message,
      recommendations: ['Check system configuration and try again']
    };
  }
}