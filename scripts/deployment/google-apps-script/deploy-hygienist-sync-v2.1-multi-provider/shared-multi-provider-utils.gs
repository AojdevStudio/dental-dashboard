/**
 * ===== MULTI-PROVIDER SYNC UTILITIES FOR HYGIENISTS =====
 * 
 * Dynamic provider detection and credential resolution for hygienist sync systems
 * Automatically detects which hygienist the sync is running for based on spreadsheet context
 * 
 * Features:
 * - Hygienist auto-detection from spreadsheet names
 * - Multi-location support with dynamic location mapping
 * - External mapping resolution for any hygienist
 * - Fallback mechanisms for unrecognized providers
 * 
 * @version 1.0.0
 * @requires shared-sync-utils.gs
 */

// ===== PROVIDER DETECTION CONFIGURATION =====

/**
 * Provider detection patterns for different hygienists
 * Each pattern tries to identify providers from spreadsheet names or content
 */
const PROVIDER_DETECTION_PATTERNS = {
  // Adriane Fontenot patterns
  'adriane_fontenot': {
    namePatterns: [
      /adriane/i,
      /fontenot/i,
      /adriane.*fontenot/i
    ],
    externalId: 'ADRIANE_PROVIDER',
    displayName: 'Adriane Fontenot',
    primaryClinic: 'KAMDENTAL_BAYTOWN',
    providerType: 'hygienist'
  },
  
  // Kia Redfearn patterns
  'kia_redfearn': {
    namePatterns: [
      /kia/i,
      /redfearn/i,
      /kia.*redfearn/i
    ],
    externalId: 'KIA_PROVIDER',
    displayName: 'Kia Redfearn',
    primaryClinic: 'KAMDENTAL_HUMBLE',
    providerType: 'hygienist'
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
 * @param {string} spreadsheetId - The ID of the current spreadsheet
 * @return {Object|null} Detected provider configuration or null if not found
 */
function detectCurrentProvider(spreadsheetId) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    
    Logger.log(`Detecting hygienist from spreadsheet: "${spreadsheetName}"`);
    
    // Try to match against known provider patterns
    for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
      for (const pattern of config.namePatterns) {
        if (pattern.test(spreadsheetName)) {
          Logger.log(`Hygienist detected: ${config.displayName} (${providerCode})`);
          
          return {
            providerCode: providerCode,
            externalId: config.externalId,
            displayName: config.displayName,
            primaryClinic: config.primaryClinic,
            providerType: config.providerType,
            spreadsheetName: spreadsheetName
          };
        }
      }
    }
    
    Logger.log(`No hygienist detected from spreadsheet name: "${spreadsheetName}"`);
    return null;
    
  } catch (error) {
    Logger.log(`Error detecting hygienist: ${error.message}`);
    return null;
  }
}

/**
 * Get dynamic sync credentials for the detected provider
 * @param {string} spreadsheetId - The ID of the current spreadsheet
 * @param {Object} options - Additional options for credential resolution
 * @return {Object|null} Complete credentials with resolved IDs or null if failed
 */
function getMultiProviderSyncCredentials(spreadsheetId, options = {}) {
  try {
    // Step 1: Detect which provider this is
    const providerInfo = detectCurrentProvider(spreadsheetId);
    if (!providerInfo) {
      throw new Error('Could not detect hygienist from spreadsheet. Please ensure the spreadsheet name contains the hygienist name.');
    }
    
    // Step 2: Get base credentials using shared utilities
    const systemName = options.systemName || 'hygienist_sync';
    const baseCredentials = getSyncCredentials(systemName, {
      primaryClinicCode: providerInfo.primaryClinic,
      providerCode: providerInfo.providerCode,
      externalMappings: {
        [providerInfo.externalId]: 'provider'
      }
    });
    
    if (!baseCredentials) {
      throw new Error(`Failed to resolve credentials for ${providerInfo.displayName}`);
    }
    
    // Step 3: Add provider-specific information
    return {
      ...baseCredentials,
      detectedProvider: providerInfo,
      isMultiProvider: true,
      locationMapping: MULTI_LOCATION_CONFIG
    };
    
  } catch (error) {
    Logger.log(`Multi-provider credential resolution failed: ${error.message}`);
    throw error;
  }
}

/**
 * Resolve location-specific credentials for multi-location production data
 * @param {Object} baseCredentials - Base credentials from getMultiProviderSyncCredentials
 * @param {string} locationKey - Location key ('humble' or 'baytown')
 * @return {Object|null} Location-specific credentials or null if not found
 */
function getLocationCredentials(baseCredentials, locationKey) {
  try {
    const locationConfig = MULTI_LOCATION_CONFIG.clinics[locationKey];
    if (!locationConfig) {
      throw new Error(`Unknown location: ${locationKey}`);
    }
    
    // Get location-specific IDs using external mappings
    const locationCredentials = getSyncCredentials('hygienist_sync', {
      primaryClinicCode: locationConfig.clinicCode,
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
      locationConfig: locationConfig
    };
    
  } catch (error) {
    Logger.log(`Location credential resolution failed for ${locationKey}: ${error.message}`);
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
 * Validate provider-location relationships in database
 * @param {Object} credentials - Provider credentials to validate
 * @return {Object} Validation results with location access information
 */
function validateProviderLocations(credentials) {
  try {
    // This would ideally query the database to validate provider-location relationships
    // For now, we'll return a basic validation based on the detected provider
    
    const provider = credentials.detectedProvider;
    const availableLocations = ['humble', 'baytown']; // Both locations for multi-provider system
    
    return {
      isValid: true,
      provider: provider.displayName,
      providerCode: provider.providerCode,
      primaryLocation: provider.primaryClinic,
      availableLocations: availableLocations,
      hasMultiLocationAccess: true
    };
    
  } catch (error) {
    Logger.log(`Provider location validation failed: ${error.message}`);
    return {
      isValid: false,
      error: error.message
    };
  }
}

// ===== TESTING AND DEBUG FUNCTIONS =====

/**
 * Test multi-provider detection with current spreadsheet
 * @param {string} spreadsheetId - Optional spreadsheet ID to test (defaults to current)
 */
function testMultiProviderDetection(spreadsheetId = null) {
  try {
    const testSpreadsheetId = spreadsheetId || SpreadsheetApp.getActiveSpreadsheet().getId();
    
    console.log('🧪 Testing Hygienist Multi-Provider Detection');
    console.log(`Spreadsheet ID: ${testSpreadsheetId}`);
    
    // Test provider detection
    const providerInfo = detectCurrentProvider(testSpreadsheetId);
    if (providerInfo) {
      console.log('✅ Hygienist Detection Successful:');
      console.log(`  Provider: ${providerInfo.displayName}`);
      console.log(`  Code: ${providerInfo.providerCode}`);
      console.log(`  External ID: ${providerInfo.externalId}`);
      console.log(`  Primary Clinic: ${providerInfo.primaryClinic}`);
      console.log(`  Type: ${providerInfo.providerType}`);
    } else {
      console.log('❌ Hygienist Detection Failed');
      return;
    }
    
    // Test credential resolution
    const credentials = getMultiProviderSyncCredentials(testSpreadsheetId);
    if (credentials) {
      console.log('✅ Credential Resolution Successful:');
      console.log(`  System: ${credentials.systemName}`);
      console.log(`  Provider ID: ${credentials.providerId ? 'Resolved' : 'Not found'}`);
      console.log(`  Clinic ID: ${credentials.clinicId ? 'Resolved' : 'Not found'}`);
      console.log(`  Multi-Provider: ${credentials.isMultiProvider}`);
    } else {
      console.log('❌ Credential Resolution Failed');
    }
    
    // Test location validation
    const validation = validateProviderLocations(credentials);
    console.log('📍 Location Validation:');
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Available Locations: ${validation.availableLocations?.join(', ')}`);
    
  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
  }
}

/**
 * Debug provider patterns and matching
 */
function debugProviderPatterns() {
  console.log('🔍 Hygienist Detection Patterns:');
  
  for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
    console.log(`\n${config.displayName} (${providerCode}):`);
    config.namePatterns.forEach((pattern, index) => {
      console.log(`  Pattern ${index + 1}: ${pattern}`);
    });
    console.log(`  External ID: ${config.externalId}`);
    console.log(`  Primary Clinic: ${config.primaryClinic}`);
    console.log(`  Type: ${config.providerType}`);
  }
}