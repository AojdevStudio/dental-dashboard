// --- Dentist Production Sync Configuration V2.1 (Multi-Provider) ---
// Updated to support dynamic multi-provider detection and multi-location sync

/** 
 * DYNAMIC SHEET ID - Gets the current active spreadsheet ID
 * This allows the same script to work for any provider's spreadsheet
 * NO MORE HARDCODED SHEET IDs!
 */
function getDentistSheetId() {
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

// Legacy hardcoded ID for reference only (DO NOT USE)
// const DENTIST_SHEET_ID_LEGACY = '1bcbzCiPHMRATJe2koBpvyadZaDvxfSA7tpJ84-o-x2c'; // Dr. Obinna's sheet

/** @const {string} Name of the sheet tab for logging sync operations. */
const DENTIST_LOG_TAB_NAME = 'Dentist-Sync-Log';

/** @const {string} Name of the target table in Supabase. */
const SUPABASE_TABLE_NAME = 'dentist_production';

/** @const {number} Number of rows to process in each batch API call to Supabase. */
const SUPABASE_BATCH_SIZE = 100;

/** @const {number} Maximum number of retries for API calls on rate limits (429). */
const MAX_RETRIES = 3;

/** @const {number} Initial delay in milliseconds for exponential backoff. */
const INITIAL_BACKOFF_MS = 1000;

/** @const {string} Key for storing Supabase Project URL in Script Properties. */
const SUPABASE_URL_PROPERTY_KEY = 'SUPABASE_URL';

/** @const {string} Key for storing Supabase Service Role Key in Script Properties. */
const SUPABASE_KEY_PROPERTY_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

/** @const {string} Name of the time-based sync function for trigger management. */
const SYNC_FUNCTION_NAME = 'syncAllDentistData';

/** @const {string} Name of the on-edit sync function for trigger management. */
const ON_EDIT_FUNCTION_NAME = 'onEditDentistSync';

/** @const {array} Month tab patterns to sync (MMM-YY format). */
const MONTH_TAB_PATTERNS = [
  /^[A-Za-z]{3}-\d{2}$/,  // Dec-23, Jan-24, etc.
  /^[A-Za-z]{3} \d{4}$/   // Dec 2023, Jan 2024, etc.
];

/** @const {object} Column header mappings for dentist production data. */
const DENTIST_COLUMN_HEADERS = {
  DATE: ['date'],
  VERIFIED_PRODUCTION_HUMBLE: ['verified production (billing department only) humble'],
  VERIFIED_PRODUCTION_BAYTOWN: ['verified production (billing department only) baytown'],
  TOTAL_PRODUCTION: ['total production'],
  MONTHLY_GOAL: ['monthly production goal (both offices)'],
  PRODUCTION_PER_HOUR: ['monthly production per hour'],
  AVG_DAILY_PRODUCTION: ['average daily production'],
  UUID: ['uuid']
};

// ===== V2.1 MULTI-PROVIDER CONFIGURATION =====

/**
 * Multi-provider sync configuration for dentist system
 * Supports dynamic provider detection and multi-location sync
 */
const DENTIST_SYNC_CONFIG = {
  // System identifier for external mappings
  SYSTEM_NAME: 'dentist_sync',
  
  // Multi-provider mode enabled
  MULTI_PROVIDER_MODE: true,
  
  // Stable clinic codes (never change after database reseeds)
  CLINICS: {
    HUMBLE: {
      clinicCode: 'KAMDENTAL_HUMBLE',
      locationCode: 'HUMBLE_MAIN',
      externalId: 'HUMBLE_CLINIC',
      displayName: 'KamDental Humble'
    },
    BAYTOWN: {
      clinicCode: 'KAMDENTAL_BAYTOWN',
      locationCode: 'BAYTOWN_MAIN', 
      externalId: 'BAYTOWN_CLINIC',
      displayName: 'KamDental Baytown'
    }
  },
  
  // DEPRECATED: Hardcoded providers configuration - Multi-Clinic Support
  // NEW: Provider discovery now uses database queries via getProviderFromDatabase()
  // This section serves as fallback during transition period
  PROVIDERS: {
    OBINNA: {
      providerCode: 'obinna_ezeji',
      externalId: 'OBINNA_PROVIDER',
      displayName: 'Dr. Obinna Ezeji',
      primaryClinics: ['BAYTOWN'], // Array to support multiple primary clinics
      preferredClinic: 'BAYTOWN',  // Default clinic for single-clinic operations
      multiClinicAccess: false,    // Currently single-clinic provider
      primaryClinic: 'BAYTOWN'     // Legacy compatibility
    },
    KAMDI: {
      providerCode: 'kamdi_irondi',
      externalId: 'KAMDI_PROVIDER', 
      displayName: 'Dr. Kamdi Irondi',
      primaryClinics: ['HUMBLE'],  // Array to support multiple primary clinics
      preferredClinic: 'HUMBLE',   // Default clinic for single-clinic operations
      multiClinicAccess: false,    // Currently single-clinic provider
      primaryClinic: 'HUMBLE'      // Legacy compatibility
    },
    // Example multi-clinic provider (for future expansion)
    MULTI_CLINIC_EXAMPLE: {
      providerCode: 'multi_clinic_provider',
      externalId: 'MULTI_PROVIDER',
      displayName: 'Dr. Multi Clinic Provider',
      primaryClinics: ['HUMBLE', 'BAYTOWN'], // Multiple primary clinics
      preferredClinic: 'HUMBLE',              // Default clinic preference
      multiClinicAccess: true                 // Multi-clinic enabled
    }
  },
  
  // Location mapping for dual-clinic production data
  LOCATION_MAPPING: {
    'humble': {
      clinicKey: 'HUMBLE',
      columnPatterns: [/humble/i, /hum/i]
    },
    'baytown': {
      clinicKey: 'BAYTOWN',
      columnPatterns: [/baytown/i, /bay/i]
    }
  },
  
  // External mapping identifiers for this sync system
  EXTERNAL_MAPPINGS: {
    'HUMBLE_CLINIC': 'clinic',      // Maps to KamDental Humble
    'BAYTOWN_CLINIC': 'clinic',     // Maps to KamDental Baytown  
    'HUMBLE_LOCATION': 'location',  // Maps to Humble location
    'BAYTOWN_LOCATION': 'location', // Maps to Baytown location
    'OBINNA_PROVIDER': 'provider',  // Maps to Dr. Obinna Ezeji
    'KAMDI_PROVIDER': 'provider'    // Maps to Dr. Kamdi Irondi
  }
};

/**
 * Migration information for upgrading to multi-provider system
 */
const MIGRATION_INFO = {
  VERSION: '2.1.0',
  UPGRADE_DATE: '2025-07-02',
  MULTI_PROVIDER: true,
  BREAKING_CHANGES: [
    'Dynamic provider detection from spreadsheet names',
    'Multi-provider external mapping system',
    'Automatic provider-location relationship validation',
    'Enhanced multi-location production data support',
    'No more hard-coded provider configuration'
  ],
  MIGRATION_STEPS: [
    '1. Copy shared-sync-utils.gs to your Apps Script project',
    '2. Copy shared-multi-provider-utils.gs to your Apps Script project', 
    '3. Replace config.gs with this multi-provider version',
    '4. Replace credentials.gs with multi-provider version',
    '5. Update menu.gs with multi-provider testing options',
    '6. Test provider detection and credential resolution'
  ]
};

/**
 * Legacy configuration for reference (V2.0 single-provider)
 * These are the old configurations that are now dynamic
 */
const LEGACY_SINGLE_PROVIDER_CONFIG = {
  PRIMARY_PROVIDER_CODE: 'obinna_ezeji',       // Now: Dynamic detection
  PRIMARY_CLINIC_CODE: 'KAMDENTAL_BAYTOWN',    // Now: Provider-specific primary
  SECONDARY_CLINIC_CODE: 'KAMDENTAL_HUMBLE',   // Now: Multi-location support
  LOCATION_CODES: {                            // Now: Dynamic location mapping
    HUMBLE: 'HUMBLE_MAIN',
    BAYTOWN: 'BAYTOWN_MAIN'
  }
};

/**
 * Enhanced column detection for multi-provider spreadsheets
 * Automatically detects location-specific production columns
 */
const ENHANCED_COLUMN_DETECTION = {
  // Base column patterns (common across all providers)
  BASE_COLUMNS: {
    DATE: ['date', 'day'],
    TOTAL_PRODUCTION: ['total production', 'total', 'combined production'],
    MONTHLY_GOAL: ['monthly production goal', 'goal', 'target'],
    PRODUCTION_PER_HOUR: ['production per hour', 'hourly production'],
    AVG_DAILY_PRODUCTION: ['average daily production', 'daily average'],
    UUID: ['uuid', 'id']
  },
  
  // Location-specific column patterns
  LOCATION_COLUMNS: {
    HUMBLE: {
      patterns: [/humble/i, /hum/i],
      expectedColumns: ['verified production (billing department only) humble']
    },
    BAYTOWN: {
      patterns: [/baytown/i, /bay/i],
      expectedColumns: ['verified production (billing department only) baytown']
    }
  },
  
  // Provider-specific column variations
  PROVIDER_VARIATIONS: {
    'obinna_ezeji': {
      // Dr. Obinna's spreadsheet may have specific column names
      alternateNames: {}
    },
    'kamdi_irondi': {
      // Dr. Kamdi's spreadsheet may have specific column names
      alternateNames: {}
    }
  }
};

// ===== PROVIDER DETECTION FUNCTIONS =====

/**
 * Get current provider configuration dynamically with database-driven discovery
 * Now uses database queries with fallback to hardcoded configurations
 * @param {Object} options - Configuration options
 * @param {string} options.clinicPreference - Preferred clinic for multi-clinic providers
 * @param {boolean} options.includeAllClinics - Include all clinic configurations
 * @param {boolean} options.forceFallback - Force use of fallback configuration
 * @return {Object|null} Current provider config or null if not detected
 */
function getCurrentProviderConfig(options = {}) {
  try {
    // Use multi-provider detection from shared utilities
    const providerInfo = detectCurrentProvider(getDentistSheetId());
    if (!providerInfo) {
      return null;
    }
    
    // PRIMARY: Try database-driven provider discovery (unless forced to use fallback)
    if (!options.forceFallback) {
      const dbProviderConfig = getProviderFromDatabase(providerInfo.providerCode);
      if (dbProviderConfig) {
        Logger.log(`Using database configuration for provider ${providerInfo.providerCode}`);
        
        // Handle clinic preference for database config
        let selectedClinic = null;
        let selectedClinicConfig = null;
        
        if (options.clinicPreference && dbProviderConfig.clinicMappings) {
          // Look for preferred clinic in database mappings
          for (const [clinicCode, mapping] of Object.entries(dbProviderConfig.clinicMappings)) {
            if (clinicCode.includes(options.clinicPreference.toUpperCase())) {
              selectedClinic = clinicCode;
              selectedClinicConfig = mapping;
              break;
            }
          }
        }
        
        // Default to primary clinic from database
        if (!selectedClinicConfig) {
          selectedClinic = dbProviderConfig.primaryClinic;
          selectedClinicConfig = dbProviderConfig.primaryClinicConfig;
        }
        
        return {
          ...dbProviderConfig,
          detectedInfo: providerInfo,
          // Legacy support for single-clinic systems
          primaryClinic: selectedClinic,
          primaryClinicConfig: selectedClinicConfig,
          // Multi-clinic support from database
          selectedClinic: selectedClinic,
          selectedClinicConfig: selectedClinicConfig,
          allClinicConfigs: options.includeAllClinics ? dbProviderConfig.clinicMappings : undefined,
          hasMultiClinicAccess: dbProviderConfig.totalLocations > 1,
          availableClinics: Object.keys(dbProviderConfig.clinicMappings || {}),
          source: 'database'
        };
      } else {
        Logger.log(`Database provider lookup failed for ${providerInfo.providerCode}, falling back to hardcoded configuration`);
      }
    }
    
    // FALLBACK: Use hardcoded configuration
    const providerKey = providerInfo.providerCode.toUpperCase().replace('_', '');
    const providerConfig = DENTIST_SYNC_CONFIG.PROVIDERS[providerKey];
    
    if (!providerConfig) {
      Logger.log(`Provider ${providerInfo.providerCode} not found in fallback configuration`);
      return null;
    }
    
    // Handle multi-clinic support for fallback configuration
    const selectedClinic = options.clinicPreference || providerConfig.primaryClinic;
    const allClinicConfigs = {};
    
    // Get configurations for primary clinic (legacy system assumes single primary)
    const primaryClinicConfig = DENTIST_SYNC_CONFIG.CLINICS[providerConfig.primaryClinic];
    if (primaryClinicConfig) {
      allClinicConfigs[providerConfig.primaryClinic] = primaryClinicConfig;
    }
    
    // Get the selected clinic configuration
    const selectedClinicConfig = DENTIST_SYNC_CONFIG.CLINICS[selectedClinic];
    if (!selectedClinicConfig) {
      Logger.log(`Selected clinic ${selectedClinic} not found in configuration`);
      return null;
    }
    
    return {
      ...providerConfig,
      detectedInfo: providerInfo,
      // Legacy support for single-clinic systems
      primaryClinic: selectedClinic,
      primaryClinicConfig: selectedClinicConfig,
      // Multi-clinic support
      selectedClinic: selectedClinic,
      selectedClinicConfig: selectedClinicConfig,
      allClinicConfigs: options.includeAllClinics ? allClinicConfigs : undefined,
      hasMultiClinicAccess: false, // Legacy system doesn't support multi-clinic
      availableClinics: [providerConfig.primaryClinic],
      source: 'fallback'
    };
    
  } catch (error) {
    Logger.log(`Error getting provider config: ${error.message}`);
    return null;
  }
}

/**
 * Get location-specific configuration for production data
 * @param {string} locationKey - Location key ('humble' or 'baytown')
 * @return {Object|null} Location configuration or null if not found
 */
function getLocationConfig(locationKey) {
  const locationMapping = DENTIST_SYNC_CONFIG.LOCATION_MAPPING[locationKey];
  if (!locationMapping) {
    return null;
  }
  
  const clinicConfig = DENTIST_SYNC_CONFIG.CLINICS[locationMapping.clinicKey];
  if (!clinicConfig) {
    return null;
  }
  
  return {
    locationKey: locationKey,
    clinicKey: locationMapping.clinicKey,
    ...clinicConfig,
    columnPatterns: locationMapping.columnPatterns
  };
}

/**
 * Get multi-clinic credentials for a provider across all their primary clinics
 * @param {Object} options - Configuration options
 * @param {string} options.clinicFilter - Filter to specific clinic ('HUMBLE', 'BAYTOWN', or null for all)
 * @return {Object|null} Multi-clinic credentials or null if failed
 */
function getMultiClinicCredentials(options = {}) {
  try {
    const providerConfig = getCurrentProviderConfig({ includeAllClinics: true });
    if (!providerConfig) {
      return null;
    }
    
    const clinicCredentials = {};
    const clinicsToProcess = options.clinicFilter 
      ? [options.clinicFilter] 
      : providerConfig.primaryClinics;
    
    for (const clinicKey of clinicsToProcess) {
      if (!providerConfig.primaryClinics.includes(clinicKey)) {
        Logger.log(`Clinic ${clinicKey} not in provider's primary clinics`);
        continue;
      }
      
      const clinicConfig = DENTIST_SYNC_CONFIG.CLINICS[clinicKey];
      if (clinicConfig) {
        clinicCredentials[clinicKey] = {
          clinicConfig: clinicConfig,
          locationConfig: getLocationConfig(clinicKey.toLowerCase())
        };
      }
    }
    
    return {
      provider: providerConfig,
      clinicCredentials: clinicCredentials,
      defaultClinic: providerConfig.preferredClinic,
      multiClinicMode: providerConfig.multiClinicAccess
    };
    
  } catch (error) {
    Logger.log(`Error getting multi-clinic credentials: ${error.message}`);
    return null;
  }
}

/**
 * Select clinic for multi-clinic provider operations
 * @param {string} clinicKey - Clinic to select ('HUMBLE' or 'BAYTOWN')
 * @return {Object|null} Selected clinic configuration or null if invalid
 */
function selectClinicForProvider(clinicKey) {
  try {
    const providerConfig = getCurrentProviderConfig();
    if (!providerConfig) {
      throw new Error('Provider not detected');
    }
    
    if (!providerConfig.primaryClinics.includes(clinicKey)) {
      throw new Error(`Clinic ${clinicKey} not available for provider ${providerConfig.displayName}`);
    }
    
    // Get updated configuration with selected clinic
    const selectedConfig = getCurrentProviderConfig({ 
      clinicPreference: clinicKey,
      includeAllClinics: false 
    });
    
    Logger.log(`Selected clinic ${clinicKey} for provider ${providerConfig.displayName}`);
    return selectedConfig;
    
  } catch (error) {
    Logger.log(`Error selecting clinic: ${error.message}`);
    return null;
  }
}

/**
 * Get location-specific sync configuration for multi-clinic scenarios
 * @param {string} clinicKey - Clinic key ('HUMBLE' or 'BAYTOWN')
 * @param {string} locationKey - Location key ('humble' or 'baytown')
 * @return {Object|null} Combined configuration for clinic-location sync
 */
function getMultiClinicLocationConfig(clinicKey, locationKey) {
  try {
    const providerConfig = selectClinicForProvider(clinicKey);
    if (!providerConfig) {
      return null;
    }
    
    const locationConfig = getLocationConfig(locationKey);
    if (!locationConfig) {
      return null;
    }
    
    return {
      provider: providerConfig,
      location: locationConfig,
      isMultiClinic: providerConfig.hasMultiClinicAccess,
      syncKey: `${clinicKey}_${locationKey}`,
      clinicMatches: clinicKey.toLowerCase() === locationKey.toLowerCase()
    };
    
  } catch (error) {
    Logger.log(`Error getting multi-clinic location config: ${error.message}`);
    return null;
  }
}

/**
 * Validate current spreadsheet for multi-provider and multi-clinic compatibility
 * @param {Object} options - Validation options
 * @param {boolean} options.checkMultiClinic - Check multi-clinic support
 * @return {Object} Validation results
 */
function validateMultiProviderSpreadsheet(options = {}) {
  try {
    const ss = SpreadsheetApp.openById(getDentistSheetId());
    const spreadsheetName = ss.getName();
    
    // Check provider detection
    const providerConfig = getCurrentProviderConfig({ includeAllClinics: true });
    if (!providerConfig) {
      return {
        isValid: false,
        error: 'Could not detect provider from spreadsheet name',
        suggestions: [
          'Ensure spreadsheet name contains provider name (e.g., "Kamdi", "Obinna")',
          'Check PROVIDER_DETECTION_PATTERNS in shared-multi-provider-utils.gs'
        ]
      };
    }
    
    // Check for month tabs
    const sheets = ss.getSheets();
    const monthTabs = sheets.filter(sheet => 
      MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheet.getName()))
    );
    
    if (monthTabs.length === 0) {
      return {
        isValid: false,
        error: 'No month tabs found',
        suggestions: [
          'Add month tabs with names like "Jan-25", "Feb-25", etc.',
          'Check MONTH_TAB_PATTERNS in configuration'
        ]
      };
    }
    
    // Multi-clinic validation
    const multiClinicInfo = {};
    if (options.checkMultiClinic && providerConfig.hasMultiClinicAccess) {
      multiClinicInfo.multiClinicSupported = true;
      multiClinicInfo.availableClinics = providerConfig.availableClinics;
      multiClinicInfo.preferredClinic = providerConfig.preferredClinic;
      
      // Validate all clinic access
      const multiClinicCreds = getMultiClinicCredentials();
      multiClinicInfo.clinicCredentialsResolved = !!multiClinicCreds;
    }
    
    return {
      isValid: true,
      provider: providerConfig.displayName,
      providerCode: providerConfig.providerCode,
      primaryClinic: providerConfig.primaryClinicConfig.displayName,
      selectedClinic: providerConfig.selectedClinic,
      availableClinics: providerConfig.availableClinics,
      hasMultiClinicAccess: providerConfig.hasMultiClinicAccess,
      monthTabsFound: monthTabs.length,
      spreadsheetName: spreadsheetName,
      multiClinic: multiClinicInfo
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}