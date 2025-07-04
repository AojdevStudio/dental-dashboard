/**
 * ===== MULTI-PROVIDER SYNC UTILITIES =====
 * 
 * Dynamic provider detection and credential resolution for multi-provider sync systems
 * Automatically detects which provider the sync is running for based on spreadsheet context
 * 
 * Features:
 * - Provider auto-detection from spreadsheet names
 * - Multi-location support with dynamic location mapping
 * - External mapping resolution for any provider
 * - Fallback mechanisms for unrecognized providers
 * 
 * @version 1.0.0
 * @requires shared-sync-utils.gs
 */

// ===== PROVIDER DETECTION CONFIGURATION =====

/**
 * Provider detection patterns for different dentists
 * Each pattern tries to identify providers from spreadsheet names or content
 */
const PROVIDER_DETECTION_PATTERNS = {
  // Dr. Obinna Ezeji patterns
  'obinna_ezeji': {
    namePatterns: [
      /obinna/i,
      /ezeji/i,
      /dr\.?\s*obinna/i,
      /obinna.*ezeji/i
    ],
    externalId: 'OBINNA_PROVIDER',
    displayName: 'Dr. Obinna Ezeji',
    primaryClinics: ['KAMDENTAL_BAYTOWN'], // Multi-clinic support
    preferredClinic: 'KAMDENTAL_BAYTOWN',
    multiClinicAccess: false
  },
  
  // Dr. Kamdi Irondi patterns
  'kamdi_irondi': {
    namePatterns: [
      /kamdi/i,
      /irondi/i,
      /dr\.?\s*kamdi/i,
      /kamdi.*irondi/i,
      /kelechi/i // Alternative first name
    ],
    externalId: 'KAMDI_PROVIDER',
    displayName: 'Dr. Kamdi Irondi',
    primaryClinics: ['KAMDENTAL_HUMBLE'], // Multi-clinic support
    preferredClinic: 'KAMDENTAL_HUMBLE',
    multiClinicAccess: false
  },
  
  // Dr. Chinyere Enih patterns
  'chinyere_enih': {
    namePatterns: [
      /chinyere/i,
      /enih/i,
      /dr\.?\s*chinyere/i,
      /chinyere.*enih/i
    ],
    externalId: 'CHINYERE_PROVIDER',
    displayName: 'Dr. Chinyere Enih',
    primaryClinics: ['KAMDENTAL_BAYTOWN'], // Multi-clinic support
    preferredClinic: 'KAMDENTAL_BAYTOWN',
    multiClinicAccess: false
  },
  
  // Example multi-clinic provider
  'multi_clinic_provider': {
    namePatterns: [
      /multi.*clinic/i,
      /both.*locations/i,
      /dual.*site/i
    ],
    externalId: 'MULTI_PROVIDER',
    displayName: 'Dr. Multi Clinic Provider',
    primaryClinics: ['KAMDENTAL_HUMBLE', 'KAMDENTAL_BAYTOWN'],
    preferredClinic: 'KAMDENTAL_HUMBLE',
    multiClinicAccess: true
  }
};

/**
 * Location mapping configuration for multi-location production data
 * Maps spreadsheet column patterns to location identifiers
 */
const MULTI_LOCATION_CONFIG = {
  // Clinic mappings
  clinics: {
    'humble': {
      clinicCode: 'KAMDENTAL_HUMBLE',
      locationCode: 'HUMBLE_MAIN',
      externalId: 'HUMBLE_CLINIC',
      patterns: [/humble/i, /hum/i]
    },
    'baytown': {
      clinicCode: 'KAMDENTAL_BAYTOWN', 
      locationCode: 'BAYTOWN_MAIN',
      externalId: 'BAYTOWN_CLINIC',
      patterns: [/baytown/i, /bay/i]
    }
  },
  
  // Location mappings for production data columns
  locations: {
    'humble': {
      locationCode: 'HUMBLE_MAIN',
      externalId: 'HUMBLE_LOCATION',
      patterns: [/humble/i, /hum/i]
    },
    'baytown': {
      locationCode: 'BAYTOWN_MAIN',
      externalId: 'BAYTOWN_LOCATION', 
      patterns: [/baytown/i, /bay/i]
    }
  }
};

// ===== PROVIDER DETECTION FUNCTIONS =====

/**
 * Automatically detect which provider this sync is running for
 * Enhanced with auto-discovery system integration
 * @param {string} spreadsheetId - The ID of the current spreadsheet
 * @return {Object|null} Detected provider configuration or null if not found
 */
function detectCurrentProvider(spreadsheetId) {
  const functionName = 'detectCurrentProvider';
  const startTime = Date.now();
  const correlationId = generateCorrelationId_();
  
  const operation = () => {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    
    logWithMetadata(functionName, 'START', null, null, null, 
      `Detecting provider from spreadsheet: "${spreadsheetName}"`, 
      { 
        spreadsheet_id: spreadsheetId,
        spreadsheet_name: spreadsheetName,
        operation: 'provider_detection'
      }, 
      correlationId);
    
    // Check cache first for performance
    const cacheStartTime = Date.now();
    if (typeof getCachedProviderConfig === 'function') {
      const cached = getCachedProviderConfig(spreadsheetId);
      const cacheDuration = Date.now() - cacheStartTime;
      
      if (cached && cached.detectedInfo) {
        logCacheOperation('HIT', `provider_config_${spreadsheetId}`, JSON.stringify(cached).length, correlationId);
        logProviderDetection(cached.detectedInfo.providerCode, 'cache', 1.0, 'SUCCESS', 
          { 
            spreadsheet_id: spreadsheetId,
            cache_duration_ms: cacheDuration,
            cached_provider: cached.detectedInfo.displayName
          }, 
          correlationId);
        return cached.detectedInfo;
      } else {
        logCacheOperation('MISS', `provider_config_${spreadsheetId}`, null, correlationId);
      }
    }
    
    // First try auto-discovery system (database-driven)
    const autoDiscoveryStartTime = Date.now();
    try {
      const autoDetected = autoDetectProvider(spreadsheetId);
      const autoDiscoveryDuration = Date.now() - autoDiscoveryStartTime;
      
      if (autoDetected && autoDetected.confidence >= 0.7) {
        logProviderDetection(autoDetected.providerCode || 'unknown', 'auto-discovery', autoDetected.confidence, 'SUCCESS', 
          { 
            spreadsheet_id: spreadsheetId,
            spreadsheet_name: spreadsheetName,
            auto_discovery_duration_ms: autoDiscoveryDuration,
            provider_name: autoDetected.displayName,
            confidence_threshold: 0.7
          }, 
          correlationId);
        
        // Cache successful auto-detection
        if (typeof cacheProviderConfig === 'function') {
          cacheProviderConfig(spreadsheetId, { detectedInfo: autoDetected });
          logCacheOperation('SET', `provider_config_${spreadsheetId}`, JSON.stringify(autoDetected).length, correlationId);
        }
        
        return autoDetected;
      } else {
        const lowConfidenceMsg = autoDetected ? 
          `Auto-discovery low confidence: ${autoDetected.confidence}` : 
          'Auto-discovery returned no results';
        
        logProviderDetection('unknown', 'auto-discovery', autoDetected ? autoDetected.confidence : 0, 'LOW_CONFIDENCE', 
          { 
            spreadsheet_id: spreadsheetId,
            spreadsheet_name: spreadsheetName,
            auto_discovery_duration_ms: autoDiscoveryDuration,
            confidence_threshold: 0.7,
            actual_confidence: autoDetected ? autoDetected.confidence : 0
          }, 
          correlationId);
      }
    } catch (autoError) {
      const autoDiscoveryDuration = Date.now() - autoDiscoveryStartTime;
      
      logProviderDetection('unknown', 'auto-discovery', 0, 'ERROR', 
        { 
          spreadsheet_id: spreadsheetId,
          spreadsheet_name: spreadsheetName,
          auto_discovery_duration_ms: autoDiscoveryDuration,
          error_message: autoError.message,
          fallback_to_static: true
        }, 
        correlationId);
      
      logWithMetadata(functionName, 'WARNING', null, null, null, 
        `Auto-discovery failed, falling back to static patterns: ${autoError.message}`, 
        { 
          spreadsheet_id: spreadsheetId,
          error_type: 'AUTO_DISCOVERY_FAILED',
          error_message: autoError.message,
          fallback_method: 'static_patterns'
        }, 
        correlationId);
    }
    
    // Fallback to static provider patterns
    const staticPatternStartTime = Date.now();
    let matchedPattern = null;
    let matchedProviderCode = null;
    
    for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
      for (const pattern of config.namePatterns) {
        if (pattern.test(spreadsheetName)) {
          matchedPattern = pattern;
          matchedProviderCode = providerCode;
          
          const staticPatternDuration = Date.now() - staticPatternStartTime;
          
          logProviderDetection(providerCode, 'static-pattern', 1.0, 'SUCCESS', 
            { 
              spreadsheet_id: spreadsheetId,
              spreadsheet_name: spreadsheetName,
              matched_pattern: pattern.toString(),
              provider_name: config.displayName,
              static_pattern_duration_ms: staticPatternDuration
            }, 
            correlationId);
          
          const detectedInfo = {
            providerCode: providerCode,
            externalId: config.externalId,
            displayName: config.displayName,
            primaryClinics: config.primaryClinics,
            preferredClinic: config.preferredClinic,
            multiClinicAccess: config.multiClinicAccess,
            spreadsheetName: spreadsheetName,
            source: 'static-pattern',
            matchedPattern: pattern.toString(),
            // Legacy support
            primaryClinic: config.preferredClinic
          };
          
          // Cache successful static detection
          if (typeof cacheProviderConfig === 'function') {
            cacheProviderConfig(spreadsheetId, { detectedInfo: detectedInfo });
            logCacheOperation('SET', `provider_config_${spreadsheetId}`, JSON.stringify(detectedInfo).length, correlationId);
          }
          
          logWithMetadata(functionName, 'SUCCESS', null, null, (Date.now() - startTime) / 1000, 
            `Provider detected via static patterns: ${config.displayName} (${providerCode})`, 
            { 
              spreadsheet_id: spreadsheetId,
              provider_code: providerCode,
              provider_name: config.displayName,
              matched_pattern: pattern.toString(),
              detection_method: 'static-pattern',
              total_duration_ms: Date.now() - startTime
            }, 
            correlationId);
          
          return detectedInfo;
        }
      }
    }
    
    // No provider detected - create detailed error message
    const staticPatternDuration = Date.now() - staticPatternStartTime;
    const suggestions = [];
    const nameLower = spreadsheetName.toLowerCase();
    
    // Analyze spreadsheet name for partial matches
    const partialMatches = [];
    if (nameLower.includes('obinna') || nameLower.includes('ezeji')) {
      suggestions.push('Detected "Obinna" or "Ezeji" - ensure full name is clear');
      partialMatches.push('obinna_ezeji');
    } else if (nameLower.includes('kamdi') || nameLower.includes('irondi') || nameLower.includes('kelechi')) {
      suggestions.push('Detected "Kamdi", "Irondi", or "Kelechi" - ensure full name is clear');
      partialMatches.push('kamdi_irondi');
    } else {
      suggestions.push('Add provider name to spreadsheet title (e.g., "Dr. Obinna", "Kamdi Irondi")');
      suggestions.push('Check available providers: Obinna Ezeji, Kamdi Irondi, Chinyere Enih');
    }
    
    const errorMessage = `No provider detected from spreadsheet name: "${spreadsheetName}". Suggestions: ${suggestions.join('; ')}`;
    
    logProviderDetection('unknown', 'static-pattern', 0, 'NOT_FOUND', 
      { 
        spreadsheet_id: spreadsheetId,
        spreadsheet_name: spreadsheetName,
        partial_matches: partialMatches,
        suggestions: suggestions,
        static_pattern_duration_ms: staticPatternDuration,
        available_providers: Object.keys(PROVIDER_DETECTION_PATTERNS),
        patterns_tested: Object.values(PROVIDER_DETECTION_PATTERNS).flatMap(p => p.namePatterns.map(pat => pat.toString()))
      }, 
      correlationId);
    
    logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
      errorMessage, 
      { 
        spreadsheet_id: spreadsheetId,
        spreadsheet_name: spreadsheetName,
        error_type: 'PROVIDER_NOT_DETECTED',
        partial_matches: partialMatches,
        suggestions: suggestions,
        total_duration_ms: Date.now() - startTime
      }, 
      correlationId);
    
    throw new Error(errorMessage);
  };
  
  try {
    return operation();
  } catch (error) {
    // Use comprehensive error handler if available
    if (typeof handleSyncError === 'function') {
      const context = {
        function: 'detectCurrentProvider',
        spreadsheetId: spreadsheetId,
        spreadsheetName: SpreadsheetApp.openById(spreadsheetId).getName(),
        operation: 'provider_detection',
        availableProviders: Object.keys(PROVIDER_DETECTION_PATTERNS)
      };
      
      const syncError = typeof createSyncError === 'function' ? 
        createSyncError(
          error.message,
          'PROVIDER_DETECTION',
          'HIGH',
          'PROVIDER_DETECTION_FAILED',
          { context: context }
        ) : error;
      
      const result = handleSyncError(syncError, context, operation);
      
      if (result.success) {
        return result.data;
      }
      
      // If error handling also failed, return null but log the issue
      Logger.log(`Provider detection failed after error handling: ${result.message || error.message}`);
    } else {
      Logger.log(`Error detecting provider: ${error.message}`);
    }
    
    return null;
  }
}

/**
 * Get dynamic sync credentials for the detected provider with multi-clinic support
 * @param {string} spreadsheetId - The ID of the current spreadsheet
 * @param {Object} options - Additional options for credential resolution
 * @param {string} options.clinicPreference - Preferred clinic for multi-clinic providers
 * @param {boolean} options.includeAllClinics - Include credentials for all provider clinics
 * @return {Object|null} Complete credentials with resolved IDs or null if failed
 */
function getMultiProviderSyncCredentials(spreadsheetId, options = {}) {
  const functionName = 'getMultiProviderSyncCredentials';
  const startTime = Date.now();
  const correlationId = generateCorrelationId_();
  
  logWithMetadata(functionName, 'START', null, null, null, 
    `Starting multi-provider sync credential resolution`, 
    { 
      spreadsheet_id: spreadsheetId,
      options: options,
      operation: 'multi_provider_credential_resolution'
    }, 
    correlationId);
  
  const operation = () => {
    // Check for cached credentials first
    const cacheStartTime = Date.now();
    if (typeof getCachedCredentials === 'function') {
      const systemName = options.systemName || 'dentist_sync';
      const cached = getCachedCredentials(systemName);
      const cacheDuration = Date.now() - cacheStartTime;
      
      if (cached && cached.detectedProvider) {
        logCacheOperation('HIT', `multi_provider_creds_${systemName}`, JSON.stringify(cached).length, correlationId);
        logCredentialResolution('multi-provider', systemName, 'SUCCESS', cached, correlationId);
        logWithMetadata(functionName, 'INFO', null, null, null, 
          `Using cached credentials for ${cached.detectedProvider.displayName}`, 
          { 
            system_name: systemName,
            provider_name: cached.detectedProvider.displayName,
            cache_duration_ms: cacheDuration
          }, 
          correlationId);
        return cached;
      } else {
        logCacheOperation('MISS', `multi_provider_creds_${systemName}`, null, correlationId);
      }
    }
    
    // Step 1: Detect which provider this is
    const providerDetectionStartTime = Date.now();
    const providerInfo = detectCurrentProvider(spreadsheetId);
    const providerDetectionDuration = Date.now() - providerDetectionStartTime;
    
    if (!providerInfo) {
      const errorMsg = 'Could not detect provider from spreadsheet. Please ensure the spreadsheet name contains the provider name.';
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          spreadsheet_id: spreadsheetId,
          error_type: 'PROVIDER_DETECTION_FAILED',
          provider_detection_duration_ms: providerDetectionDuration
        }, 
        correlationId);
      throw new Error(errorMsg);
    }
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      `Provider detected: ${providerInfo.displayName}`, 
      { 
        spreadsheet_id: spreadsheetId,
        provider_code: providerInfo.providerCode,
        provider_name: providerInfo.displayName,
        detection_source: providerInfo.source,
        multi_clinic_access: providerInfo.multiClinicAccess,
        provider_detection_duration_ms: providerDetectionDuration
      }, 
      correlationId);
    
    // Step 2: Handle clinic selection for multi-clinic providers
    const selectedClinic = options.clinicPreference || providerInfo.preferredClinic;
    
    if (providerInfo.multiClinicAccess && !providerInfo.primaryClinics.includes(selectedClinic)) {
      throw new Error(`Selected clinic ${selectedClinic} not available for provider ${providerInfo.displayName}. Available clinics: ${providerInfo.primaryClinics.join(', ')}`);
    }
    
    // Step 3: Get base credentials using shared utilities
    const systemName = options.systemName || 'dentist_sync';
    const baseCredentialsStartTime = Date.now();
    
    logWithMetadata(functionName, 'INFO', null, null, null, 
      `Resolving base credentials for: ${providerInfo.displayName}`, 
      { 
        system_name: systemName,
        provider_code: providerInfo.providerCode,
        selected_clinic: selectedClinic,
        external_id: providerInfo.externalId
      }, 
      correlationId);
    
    const baseCredentials = getSyncCredentials(systemName, {
      primaryClinicCode: selectedClinic,
      providerCode: providerInfo.providerCode,
      externalMappings: {
        [providerInfo.externalId]: 'provider'
      }
    });
    
    const baseCredentialsDuration = Date.now() - baseCredentialsStartTime;
    
    if (!baseCredentials) {
      const errorMsg = `Failed to resolve credentials for ${providerInfo.displayName}. This may be due to database connectivity issues or missing provider configuration.`;
      logCredentialResolution('multi-provider', systemName, 'FAILED', {}, correlationId);
      logWithMetadata(functionName, 'ERROR', null, null, (Date.now() - startTime) / 1000, 
        errorMsg, 
        { 
          system_name: systemName,
          provider_code: providerInfo.providerCode,
          provider_name: providerInfo.displayName,
          selected_clinic: selectedClinic,
          base_credentials_duration_ms: baseCredentialsDuration,
          error_type: 'BASE_CREDENTIAL_RESOLUTION_FAILED'
        }, 
        correlationId);
      throw new Error(errorMsg);
    }
    
    logWithMetadata(functionName, 'SUCCESS', null, null, null, 
      `Base credentials resolved successfully`, 
      { 
        system_name: systemName,
        provider_code: providerInfo.providerCode,
        has_clinic_id: !!baseCredentials.clinicId,
        has_provider_id: !!baseCredentials.providerId,
        base_credentials_duration_ms: baseCredentialsDuration
      }, 
      correlationId);
    
    // Step 4: Add multi-clinic support if requested
    const multiClinicCredentials = {};
    if (options.includeAllClinics && providerInfo.multiClinicAccess) {
      for (const clinicCode of providerInfo.primaryClinics) {
        if (clinicCode !== selectedClinic) {
          try {
            const additionalCreds = getSyncCredentials(systemName, {
              primaryClinicCode: clinicCode,
              providerCode: providerInfo.providerCode,
              externalMappings: {
                [providerInfo.externalId]: 'provider'
              }
            });
            
            if (additionalCreds) {
              multiClinicCredentials[clinicCode] = additionalCreds;
            }
          } catch (clinicError) {
            Logger.log(`Warning: Could not resolve credentials for clinic ${clinicCode}: ${clinicError.message}`);
          }
        }
      }
    }
    
    // Step 5: Add provider-specific information
    const fullCredentials = {
      ...baseCredentials,
      detectedProvider: providerInfo,
      selectedClinic: selectedClinic,
      isMultiProvider: true,
      isMultiClinic: providerInfo.multiClinicAccess,
      multiClinicCredentials: Object.keys(multiClinicCredentials).length > 0 ? multiClinicCredentials : undefined,
      locationMapping: MULTI_LOCATION_CONFIG,
      timestamp: new Date().toISOString(),
      correlationId: correlationId
    };
    
    // Cache successful credential resolution
    const cacheSetStartTime = Date.now();
    if (typeof cacheSyncCredentials === 'function') {
      cacheSyncCredentials(systemName, fullCredentials);
      logCacheOperation('SET', `multi_provider_creds_${systemName}`, JSON.stringify(fullCredentials).length, correlationId);
    }
    const cacheSetDuration = Date.now() - cacheSetStartTime;
    
    const totalDuration = (Date.now() - startTime) / 1000;
    const successMsg = `Multi-provider credentials resolved successfully for ${providerInfo.displayName}`;
    
    logCredentialResolution('multi-provider', systemName, 'SUCCESS', fullCredentials, correlationId);
    logWithMetadata(functionName, 'SUCCESS', null, null, totalDuration, 
      successMsg, 
      { 
        system_name: systemName,
        provider_code: providerInfo.providerCode,
        provider_name: providerInfo.displayName,
        selected_clinic: selectedClinic,
        is_multi_clinic: providerInfo.multiClinicAccess,
        additional_clinics_resolved: Object.keys(multiClinicCredentials).length,
        cache_set_duration_ms: cacheSetDuration,
        total_duration_ms: Date.now() - startTime
      }, 
      correlationId);
    
    return fullCredentials;
  };
  
  try {
    return operation();
  } catch (error) {
    // Use comprehensive error handler if available
    if (typeof handleSyncError === 'function') {
      const context = {
        function: 'getMultiProviderSyncCredentials',
        spreadsheetId: spreadsheetId,
        options: options,
        operation: 'credential_resolution'
      };
      
      const syncError = typeof createSyncError === 'function' ? 
        createSyncError(
          error.message,
          'AUTHENTICATION',
          'HIGH',
          'CREDENTIAL_RESOLUTION_FAILED',
          { context: context }
        ) : error;
      
      const result = handleSyncError(syncError, context, operation);
      
      if (result.success) {
        return result.data;
      }
      
      // If error handling failed, log and re-throw
      Logger.log(`Multi-provider credential resolution failed after error handling: ${result.message || error.message}`);
    } else {
      Logger.log(`Multi-provider credential resolution failed: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Resolve location-specific credentials for multi-location production data
 * Enhanced with multi-clinic provider support
 * @param {Object} baseCredentials - Base credentials from getMultiProviderSyncCredentials
 * @param {string} locationKey - Location key ('humble' or 'baytown')
 * @param {Object} options - Additional options
 * @param {string} options.forceClinicCode - Force specific clinic code for location
 * @return {Object|null} Location-specific credentials or null if not found
 */
function getLocationCredentials(baseCredentials, locationKey, options = {}) {
  try {
    const locationConfig = MULTI_LOCATION_CONFIG.clinics[locationKey];
    if (!locationConfig) {
      throw new Error(`Unknown location: ${locationKey}`);
    }
    
    // Use forced clinic code or default from location config
    const targetClinicCode = options.forceClinicCode || locationConfig.clinicCode;
    
    // Get location-specific IDs using external mappings
    const locationCredentials = getSyncCredentials('dentist_sync', {
      primaryClinicCode: targetClinicCode,
      locationCode: locationConfig.locationCode,
      externalMappings: {
        [locationConfig.externalId]: 'clinic'
      }
    });
    
    if (!locationCredentials) {
      throw new Error(`Failed to resolve credentials for ${locationKey} location`);
    }
    
    return {
      ...baseCredentials,
      locationKey: locationKey,
      locationClinicId: locationCredentials.clinicId,
      locationConfig: locationConfig,
      targetClinicCode: targetClinicCode,
      isClinicLocationMatch: baseCredentials.selectedClinic === targetClinicCode
    };
    
  } catch (error) {
    Logger.log(`Location credential resolution failed for ${locationKey}: ${error.message}`);
    return null;
  }
}

/**
 * Get all location credentials for a multi-clinic provider
 * @param {Object} baseCredentials - Base credentials from getMultiProviderSyncCredentials
 * @param {Object} options - Configuration options
 * @param {Array} options.locationFilter - Filter to specific locations (['humble', 'baytown'])
 * @return {Object|null} All location credentials or null if failed
 */
function getAllLocationCredentials(baseCredentials, options = {}) {
  try {
    const locationsToProcess = options.locationFilter || ['humble', 'baytown'];
    const locationCredentials = {};
    
    for (const locationKey of locationsToProcess) {
      const locationCreds = getLocationCredentials(baseCredentials, locationKey);
      if (locationCreds) {
        locationCredentials[locationKey] = locationCreds;
      } else {
        Logger.log(`Warning: Could not resolve credentials for location ${locationKey}`);
      }
    }
    
    return {
      provider: baseCredentials.detectedProvider,
      locations: locationCredentials,
      isMultiLocation: Object.keys(locationCredentials).length > 1,
      availableLocations: Object.keys(locationCredentials)
    };
    
  } catch (error) {
    Logger.log(`Error getting all location credentials: ${error.message}`);
    return null;
  }
}

/**
 * Get cross-clinic location credentials for multi-clinic providers
 * Allows accessing different clinic's location data for providers with multi-clinic access
 * @param {Object} baseCredentials - Base credentials
 * @param {string} clinicKey - Target clinic ('KAMDENTAL_HUMBLE' or 'KAMDENTAL_BAYTOWN')
 * @param {string} locationKey - Target location ('humble' or 'baytown')
 * @return {Object|null} Cross-clinic credentials or null if not allowed
 */
function getCrossClinicLocationCredentials(baseCredentials, clinicKey, locationKey) {
  try {
    // Check if provider has multi-clinic access
    if (!baseCredentials.isMultiClinic) {
      throw new Error('Provider does not have multi-clinic access');
    }
    
    // Check if target clinic is in provider's primary clinics
    const providerInfo = baseCredentials.detectedProvider;
    if (!providerInfo.primaryClinics.includes(clinicKey)) {
      throw new Error(`Clinic ${clinicKey} not accessible for provider ${providerInfo.displayName}`);
    }
    
    // Get location credentials with forced clinic code
    const locationCreds = getLocationCredentials(baseCredentials, locationKey, {
      forceClinicCode: clinicKey
    });
    
    if (!locationCreds) {
      throw new Error(`Failed to resolve cross-clinic credentials for ${clinicKey} - ${locationKey}`);
    }
    
    return {
      ...locationCreds,
      isCrossClinic: true,
      originalClinic: baseCredentials.selectedClinic,
      targetClinic: clinicKey,
      crossClinicKey: `${clinicKey}_${locationKey}`
    };
    
  } catch (error) {
    Logger.log(`Cross-clinic credential resolution failed: ${error.message}`);
    return null;
  }
}

/**
 * Detect production data columns for multi-location spreadsheets
 * @param {Array} headers - Array of column headers from the spreadsheet
 * @return {Object} Mapping of detected columns to location configurations
 */
function detectLocationColumns(headers) {
  const columnMapping = {
    humble: { columns: [], config: MULTI_LOCATION_CONFIG.clinics.humble },
    baytown: { columns: [], config: MULTI_LOCATION_CONFIG.clinics.baytown },
    total: { columns: [] },
    other: { columns: [] }
  };
  
  headers.forEach((header, index) => {
    const headerLower = (header || '').toLowerCase();
    
    // Check for location-specific columns
    let matched = false;
    
    // Check Humble patterns
    for (const pattern of MULTI_LOCATION_CONFIG.clinics.humble.patterns) {
      if (pattern.test(header)) {
        columnMapping.humble.columns.push({ header, index });
        matched = true;
        break;
      }
    }
    
    // Check Baytown patterns
    if (!matched) {
      for (const pattern of MULTI_LOCATION_CONFIG.clinics.baytown.patterns) {
        if (pattern.test(header)) {
          columnMapping.baytown.columns.push({ header, index });
          matched = true;
          break;
        }
      }
    }
    
    // Check for total/aggregate columns
    if (!matched) {
      if (headerLower.includes('total') || headerLower.includes('combined') || headerLower.includes('both')) {
        columnMapping.total.columns.push({ header, index });
        matched = true;
      }
    }
    
    // Unmatched columns
    if (!matched) {
      columnMapping.other.columns.push({ header, index });
    }
  });
  
  Logger.log('Location column detection results:');
  Logger.log(`Humble: ${columnMapping.humble.columns.length} columns`);
  Logger.log(`Baytown: ${columnMapping.baytown.columns.length} columns`);
  Logger.log(`Total: ${columnMapping.total.columns.length} columns`);
  Logger.log(`Other: ${columnMapping.other.columns.length} columns`);
  
  return columnMapping;
}

/**
 * Validate provider-location relationships in database with multi-clinic support
 * @param {Object} credentials - Provider credentials to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.validateAllClinics - Validate access to all provider clinics
 * @param {boolean} options.validateCrossClinic - Validate cross-clinic access permissions
 * @return {Object} Validation results with location access information
 */
function validateProviderLocations(credentials, options = {}) {
  try {
    const provider = credentials.detectedProvider;
    const availableLocations = ['humble', 'baytown']; // Both locations for multi-provider system
    
    // Basic validation structure
    const validation = {
      isValid: true,
      provider: provider.displayName,
      providerCode: provider.providerCode,
      primaryClinics: provider.primaryClinics,
      preferredClinic: provider.preferredClinic,
      selectedClinic: credentials.selectedClinic,
      hasMultiClinicAccess: provider.multiClinicAccess,
      availableLocations: availableLocations,
      hasMultiLocationAccess: true
    };
    
    // Multi-clinic validation
    if (options.validateAllClinics && provider.multiClinicAccess) {
      const clinicValidation = {};
      
      for (const clinicCode of provider.primaryClinics) {
        try {
          // Test credentials for each clinic
          const testCreds = getSyncCredentials('dentist_sync', {
            primaryClinicCode: clinicCode,
            providerCode: provider.providerCode,
            externalMappings: {
              [provider.externalId]: 'provider'
            }
          });
          
          clinicValidation[clinicCode] = {
            accessible: !!testCreds,
            clinicId: testCreds ? testCreds.clinicId : null,
            providerId: testCreds ? testCreds.providerId : null
          };
        } catch (error) {
          clinicValidation[clinicCode] = {
            accessible: false,
            error: error.message
          };
        }
      }
      
      validation.clinicValidation = clinicValidation;
      validation.allClinicsAccessible = Object.values(clinicValidation).every(v => v.accessible);
    }
    
    // Cross-clinic access validation
    if (options.validateCrossClinic && provider.multiClinicAccess) {
      const crossClinicValidation = {};
      
      for (const clinicCode of provider.primaryClinics) {
        for (const locationKey of availableLocations) {
          const crossKey = `${clinicCode}_${locationKey}`;
          try {
            const crossCreds = getCrossClinicLocationCredentials(credentials, clinicCode, locationKey);
            crossClinicValidation[crossKey] = {
              accessible: !!crossCreds,
              isMatch: crossCreds ? crossCreds.isClinicLocationMatch : false
            };
          } catch (error) {
            crossClinicValidation[crossKey] = {
              accessible: false,
              error: error.message
            };
          }
        }
      }
      
      validation.crossClinicValidation = crossClinicValidation;
    }
    
    return validation;
    
  } catch (error) {
    Logger.log(`Provider location validation failed: ${error.message}`);
    return {
      isValid: false,
      error: error.message,
      provider: credentials.detectedProvider ? credentials.detectedProvider.displayName : 'Unknown'
    };
  }
}

// ===== TESTING AND DEBUG FUNCTIONS =====

/**
 * Test multi-provider detection with multi-clinic support
 * @param {string} spreadsheetId - Optional spreadsheet ID to test (defaults to current)
 * @param {Object} options - Testing options
 * @param {boolean} options.testMultiClinic - Test multi-clinic capabilities
 * @param {boolean} options.testCrossClinic - Test cross-clinic access
 */
function testMultiProviderDetection(spreadsheetId = null, options = {}) {
  try {
    const testSpreadsheetId = spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId();
    
    console.log('🧪 Testing Multi-Provider Detection with Multi-Clinic Support');
    console.log(`Spreadsheet ID: ${testSpreadsheetId}`);
    
    // Test provider detection
    const providerInfo = detectCurrentProvider(testSpreadsheetId);
    if (providerInfo) {
      console.log('✅ Provider Detection Successful:');
      console.log(`  Provider: ${providerInfo.displayName}`);
      console.log(`  Code: ${providerInfo.providerCode}`);
      console.log(`  External ID: ${providerInfo.externalId}`);
      console.log(`  Primary Clinics: ${providerInfo.primaryClinics?.join(', ')}`);
      console.log(`  Preferred Clinic: ${providerInfo.preferredClinic}`);
      console.log(`  Multi-Clinic Access: ${providerInfo.multiClinicAccess}`);
    } else {
      console.log('❌ Provider Detection Failed');
      return;
    }
    
    // Test basic credential resolution
    const credentials = getMultiProviderSyncCredentials(testSpreadsheetId);
    if (credentials) {
      console.log('✅ Basic Credential Resolution Successful:');
      console.log(`  System: ${credentials.systemName}`);
      console.log(`  Provider ID: ${credentials.providerId ? 'Resolved' : 'Not found'}`);
      console.log(`  Clinic ID: ${credentials.clinicId ? 'Resolved' : 'Not found'}`);
      console.log(`  Selected Clinic: ${credentials.selectedClinic}`);
      console.log(`  Multi-Provider: ${credentials.isMultiProvider}`);
      console.log(`  Multi-Clinic: ${credentials.isMultiClinic}`);
    } else {
      console.log('❌ Basic Credential Resolution Failed');
      return;
    }
    
    // Test multi-clinic capabilities
    if (options.testMultiClinic && providerInfo.multiClinicAccess) {
      console.log('🏥 Testing Multi-Clinic Capabilities:');
      
      // Test all clinics credential resolution
      const multiClinicCreds = getMultiProviderSyncCredentials(testSpreadsheetId, {
        includeAllClinics: true
      });
      
      if (multiClinicCreds && multiClinicCreds.multiClinicCredentials) {
        console.log('✅ Multi-Clinic Credentials Resolved:');
        for (const [clinicCode, creds] of Object.entries(multiClinicCreds.multiClinicCredentials)) {
          console.log(`  ${clinicCode}: ${creds.clinicId ? 'Resolved' : 'Failed'}`);
        }
      } else {
        console.log('⚠️ Multi-Clinic Credentials: Not applicable or failed');
      }
      
      // Test all location credentials
      const allLocationCreds = getAllLocationCredentials(credentials);
      if (allLocationCreds) {
        console.log('✅ All Location Credentials:');
        console.log(`  Available Locations: ${allLocationCreds.availableLocations.join(', ')}`);
        console.log(`  Multi-Location: ${allLocationCreds.isMultiLocation}`);
      }
    }
    
    // Test cross-clinic access
    if (options.testCrossClinic && providerInfo.multiClinicAccess) {
      console.log('🔄 Testing Cross-Clinic Access:');
      
      for (const clinicCode of providerInfo.primaryClinics) {
        for (const locationKey of ['humble', 'baytown']) {
          try {
            const crossCreds = getCrossClinicLocationCredentials(credentials, clinicCode, locationKey);
            const status = crossCreds ? '✅' : '❌';
            console.log(`  ${status} ${clinicCode} → ${locationKey}: ${crossCreds ? 'Accessible' : 'Failed'}`);
          } catch (error) {
            console.log(`  ❌ ${clinicCode} → ${locationKey}: Error - ${error.message}`);
          }
        }
      }
    }
    
    // Test comprehensive validation
    const validation = validateProviderLocations(credentials, {
      validateAllClinics: options.testMultiClinic,
      validateCrossClinic: options.testCrossClinic
    });
    
    console.log('📍 Comprehensive Validation:');
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Available Locations: ${validation.availableLocations?.join(', ')}`);
    console.log(`  Multi-Clinic Access: ${validation.hasMultiClinicAccess}`);
    
    if (validation.clinicValidation) {
      console.log('  Clinic Access Results:');
      for (const [clinicCode, result] of Object.entries(validation.clinicValidation)) {
        console.log(`    ${clinicCode}: ${result.accessible ? '✅' : '❌'} ${result.error ? `(${result.error})` : ''}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
  }
}

/**
 * Debug provider patterns and matching
 */
function debugProviderPatterns() {
  console.log('🔍 Provider Detection Patterns:');
  
  // Show static patterns
  console.log('\n📋 Static Patterns:');
  for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
    console.log(`\n${config.displayName} (${providerCode}):`);
    config.namePatterns.forEach((pattern, index) => {
      console.log(`  Pattern ${index + 1}: ${pattern}`);
    });
    console.log(`  External ID: ${config.externalId}`);
    console.log(`  Primary Clinic: ${config.primaryClinic}`);
  }
  
  // Show discovered patterns
  try {
    console.log('\n🔍 Auto-Discovered Patterns:');
    const discoveredProviders = discoverProvidersFromDatabase();
    
    if (discoveredProviders.length === 0) {
      console.log('  No providers discovered from database');
    } else {
      discoveredProviders.forEach(provider => {
        console.log(`\n${provider.displayName}:`);
        console.log(`  ID: ${provider.id}`);
        console.log(`  External ID: ${provider.externalId || 'Not set'}`);
        console.log(`  Name Patterns: ${provider.discoveryPatterns.namePatterns.length}`);
        console.log(`  Email Patterns: ${provider.discoveryPatterns.emailPatterns.length}`);
        console.log(`  Clinics: ${provider.clinicNames.join(', ')}`);
      });
    }
  } catch (error) {
    console.log(`  Error discovering patterns: ${error.message}`);
  }
}

/**
 * Update provider detection patterns from database
 * Merges discovered providers with static patterns
 * @return {Object} Updated provider patterns
 */
function updateProviderPatternsFromDatabase() {
  const functionName = 'updateProviderPatternsFromDatabase';
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Updating provider patterns from database');
    
    // Get discovered providers
    const discoveredProviders = discoverProvidersFromDatabase(true); // Force refresh
    
    // Convert discovered providers to pattern format
    const updatedPatterns = { ...PROVIDER_DETECTION_PATTERNS };
    
    discoveredProviders.forEach(provider => {
      const providerCode = generateProviderCode_(provider);
      
      // Skip if already exists in static patterns
      if (updatedPatterns[providerCode]) {
        Logger.log(`Provider ${providerCode} already exists in static patterns, skipping`);
        return;
      }
      
      // Add discovered provider to patterns
      updatedPatterns[providerCode] = {
        namePatterns: provider.discoveryPatterns.namePatterns,
        externalId: provider.externalId || generateExternalId_(provider),
        displayName: provider.displayName,
        primaryClinic: determinePrimaryClinic_(provider),
        source: 'database',
        discoveredAt: new Date().toISOString()
      };
      
      Logger.log(`Added discovered provider to patterns: ${provider.displayName}`);
    });
    
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Updated patterns for ${Object.keys(updatedPatterns).length} providers`);
    
    return updatedPatterns;
    
  } catch (error) {
    Logger.log(`Failed to update provider patterns: ${error.message}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Pattern update failed: ${error.message}`);
    return PROVIDER_DETECTION_PATTERNS; // Return original patterns on error
  }
}

/**
 * Get all provider patterns (static + discovered)
 * @param {boolean} forceRefresh - Force refresh from database
 * @return {Object} Combined provider patterns
 */
function getAllProviderPatterns(forceRefresh = false) {
  try {
    if (forceRefresh) {
      return updateProviderPatternsFromDatabase();
    }
    
    // Check if we have cached dynamic patterns
    const cachedPatterns = PropertiesService.getScriptProperties().getProperty('DYNAMIC_PROVIDER_PATTERNS');
    if (cachedPatterns) {
      const parsed = JSON.parse(cachedPatterns);
      const cacheAge = Date.now() - new Date(parsed.lastUpdated).getTime();
      
      // Use cache if less than 1 hour old
      if (cacheAge < 60 * 60 * 1000) {
        return { ...PROVIDER_DETECTION_PATTERNS, ...parsed.patterns };
      }
    }
    
    // Refresh and cache patterns
    const updatedPatterns = updateProviderPatternsFromDatabase();
    
    // Cache the dynamic patterns (exclude static ones)
    const dynamicPatterns = {};
    Object.entries(updatedPatterns).forEach(([key, value]) => {
      if (value.source === 'database') {
        dynamicPatterns[key] = value;
      }
    });
    
    PropertiesService.getScriptProperties().setProperty(
      'DYNAMIC_PROVIDER_PATTERNS',
      JSON.stringify({
        patterns: dynamicPatterns,
        lastUpdated: new Date().toISOString()
      })
    );
    
    return updatedPatterns;
    
  } catch (error) {
    Logger.log(`Failed to get all provider patterns: ${error.message}`);
    return PROVIDER_DETECTION_PATTERNS; // Fallback to static patterns
  }
}

/**
 * Validate provider registration workflow
 * @param {string} spreadsheetId - Spreadsheet to validate against
 * @return {Object} Validation results
 */
function validateProviderRegistration(spreadsheetId) {
  const functionName = 'validateProviderRegistration';
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Validating provider registration');
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    
    // Try all detection methods
    const results = {
      spreadsheetName: spreadsheetName,
      staticPatternMatch: null,
      autoDiscoveryMatch: null,
      registrationRequired: false,
      recommendations: []
    };
    
    // Test static patterns
    for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
      for (const pattern of config.namePatterns) {
        if (pattern.test(spreadsheetName)) {
          results.staticPatternMatch = {
            providerCode: providerCode,
            displayName: config.displayName,
            confidence: 1.0
          };
          break;
        }
      }
      if (results.staticPatternMatch) break;
    }
    
    // Test auto-discovery
    try {
      const autoDetected = autoDetectProvider(spreadsheetId);
      if (autoDetected) {
        results.autoDiscoveryMatch = {
          displayName: autoDetected.displayName,
          confidence: autoDetected.confidence,
          source: autoDetected.source
        };
      }
    } catch (error) {
      results.autoDiscoveryError = error.message;
    }
    
    // Determine if registration is needed
    if (!results.staticPatternMatch && !results.autoDiscoveryMatch) {
      results.registrationRequired = true;
      results.recommendations.push('Consider registering this as a new provider');
      results.recommendations.push('Use "Register New Provider" from the menu');
    }
    
    // Add recommendations
    if (results.autoDiscoveryMatch && results.autoDiscoveryMatch.confidence < 0.8) {
      results.recommendations.push('Auto-discovery confidence is low - verify provider information');
    }
    
    if (results.staticPatternMatch && results.autoDiscoveryMatch) {
      if (results.staticPatternMatch.displayName !== results.autoDiscoveryMatch.displayName) {
        results.recommendations.push('Static and auto-discovery results differ - review pattern configuration');
      }
    }
    
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Validation complete - Registration required: ${results.registrationRequired}`);
    
    return results;
    
  } catch (error) {
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Validation failed: ${error.message}`);
    throw error;
  }
}