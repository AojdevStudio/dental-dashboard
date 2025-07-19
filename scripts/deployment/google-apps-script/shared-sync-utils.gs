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
  
  try {
    // Get basic Supabase credentials
    const basicCredentials = getBasicSupabaseCredentials_();
    if (!basicCredentials) {
      Logger.log(`${functionName}: Basic Supabase credentials not available`);
      return null;
    }
    
    // Resolve IDs using stable identifiers
    const resolvedIds = resolveStableIds_(systemName, options, basicCredentials);
    if (!resolvedIds.success) {
      Logger.log(`${functionName}: Failed to resolve stable IDs: ${resolvedIds.error}`);
      return null;
    }
    
    // Combine credentials with resolved IDs
    const fullCredentials = {
      ...basicCredentials,
      ...resolvedIds.data,
      systemName: systemName,
      timestamp: new Date().toISOString()
    };
    
    Logger.log(`${functionName}: Successfully resolved credentials for ${systemName}`);
    return fullCredentials;
    
  } catch (error) {
    Logger.log(`${functionName}: Error getting sync credentials: ${error.message}`);
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
  
  // Try cache first
  const cached = getCachedResult_(cacheKey);
  if (cached !== null) {
    Logger.log(`${callerName}: Using cached result for ${endpoint}`);
    return cached;
  }
  
  let lastError = null;
  
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
      
      if (responseCode >= 200 && responseCode < 300) {
        const result = JSON.parse(responseText);
        
        // PostgreSQL functions return the result directly
        const resultValue = result && typeof result === 'string' ? result : (result && result.length > 0 ? result[0] : null);
        
        // Cache the result
        setCachedResult_(cacheKey, resultValue);
        
        Logger.log(`${callerName}: Success on attempt ${attempt}. Result: ${resultValue}`);
        return resultValue;
        
      } else {
        lastError = `HTTP ${responseCode}: ${responseText}`;
        Logger.log(`${callerName}: Attempt ${attempt} failed: ${lastError}`);
        
        if (attempt < SHARED_SYNC_CONFIG.MAX_RETRIES) {
          Utilities.sleep(SHARED_SYNC_CONFIG.RETRY_DELAY_MS * attempt);
        }
      }
      
    } catch (error) {
      lastError = error.message;
      Logger.log(`${callerName}: Attempt ${attempt} error: ${lastError}`);
      
      if (attempt < SHARED_SYNC_CONFIG.MAX_RETRIES) {
        Utilities.sleep(SHARED_SYNC_CONFIG.RETRY_DELAY_MS * attempt);
      }
    }
  }
  
  Logger.log(`${callerName}: All attempts failed. Last error: ${lastError}`);
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