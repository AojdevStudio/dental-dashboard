// --- Hygienist Production Sync Configuration V2.1 (Multi-Provider) ---
// Updated to support dynamic multi-provider detection

/** 
 * DYNAMIC SHEET ID - Gets the current active spreadsheet ID
 * This allows the same script to work for any hygienist's spreadsheet
 * NO MORE HARDCODED SHEET IDs!
 */
function getHygieneSheetId() {
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

/** @const {string} Name of the sheet tab for logging sync operations. */
const HYGIENE_LOG_TAB_NAME = 'Hygiene-Sync-Log';

/** @const {string} Name of the target table in Supabase. */
const SUPABASE_TABLE_NAME = 'hygiene_production';

/** @const {number} Number of rows to process in each batch API call to Supabase. */
const SUPABASE_BATCH_SIZE = 100;

/** @const {object} Production database clinic IDs for each location. */
const PRODUCTION_CLINIC_IDS = {
  HUMBLE: 'cmc3jcrhe0000i2ht9ymqtmzb',
  BAYTOWN: 'cmc3jcrs20001i2ht5sn89v66'
};

/** @const {number} Maximum number of retries for API calls on rate limits (429). */
const MAX_RETRIES = 3;

/** @const {number} Initial delay in milliseconds for exponential backoff. */
const INITIAL_BACKOFF_MS = 1000;

/** @const {string} Key for storing Supabase Project URL in Script Properties. */
const SUPABASE_URL_PROPERTY_KEY = 'SUPABASE_URL';

/** @const {string} Key for storing Supabase Service Role Key in Script Properties. */
const SUPABASE_KEY_PROPERTY_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

/** @const {string} Name of the time-based sync function for trigger management. */
const SYNC_FUNCTION_NAME = 'syncAllHygieneData';

/** @const {string} Name of the on-edit sync function for trigger management. */
const ON_EDIT_FUNCTION_NAME = 'onEditHygieneSync';

/** @const {array} Month tab patterns to sync (MMM-YY format). */
const MONTH_TAB_PATTERNS = [
  /^[A-Za-z]{3}-\d{2}$/,  // Dec-23, Jan-24, etc.
  /^[A-Za-z]{3} \d{4}$/   // Dec 2023, Jan 2024, etc.
];

/** @const {object} Column header mappings for hygiene production data. */
const HYGIENE_COLUMN_HEADERS = {
  DATE: ['date'],
  SCHEDULED: ['scheduled', 'sched'],
  CANCELED: ['canceled', 'cancel', 'cancelled'],
  NO_SHOW: ['no show', 'noshow', 'no-show'],
  COMPLETED: ['completed', 'comp'],
  HYGIENE_PRODUCTION: ['hygiene production', 'production', 'prod'],
  PER_PATIENT: ['per patient', 'per pt', 'per patient avg'],
  NEW_PATIENTS: ['new patients', 'new pts', 'new pat'],
  PERIODONTAL_PERCENTAGE: ['periodontal percentage', 'perio %', 'perio percentage'],
  PERIODONTAL_COMPLETED: ['periodontal completed', 'perio comp', 'perio completed'],
  FLUORIDE_PERCENTAGE: ['fluoride percentage', 'fluoride %', 'fl %'],
  DOCTOR_EXAM_PERCENTAGE: ['doctor exam percentage', 'dr exam %', 'doctor exam %', 'exam %'],
  SCHEDULED_PERCENTAGE: ['scheduled percentage', 'scheduled %', 'sched %'],
  REAPPOINTMENT_RATE: ['reappointment rate', 'reappt rate', 'reapp rate', 'reapp %'],
  DAILY_GOAL: ['daily goal', 'goal'],
  UUID: ['uuid']
};

// ===== V2.1 MULTI-PROVIDER CONFIGURATION =====

/**
 * Multi-provider sync configuration for hygienist system
 * Supports dynamic provider detection and location-based sync
 */
const HYGIENIST_SYNC_CONFIG = {
  // System identifier for external mappings
  SYSTEM_NAME: 'hygienist_sync',
  
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
  
  // Dynamic provider configuration
  PROVIDERS: {
    ADRIANE: {
      providerCode: 'adriane_fontenot',
      externalId: 'ADRIANE_PROVIDER',
      displayName: 'Adriane Fontenot',
      primaryClinic: 'BAYTOWN',
      providerType: 'hygienist'
    },
    KIA: {
      providerCode: 'kia_redfearn',
      externalId: 'KIA_PROVIDER',
      displayName: 'Kia Redfearn',
      primaryClinic: 'HUMBLE',
      providerType: 'hygienist'
    }
  },
  
  // External mapping identifiers for this sync system
  EXTERNAL_MAPPINGS: {
    'HUMBLE_CLINIC': 'clinic',      // Maps to KamDental Humble
    'BAYTOWN_CLINIC': 'clinic',     // Maps to KamDental Baytown  
    'ADRIANE_PROVIDER': 'provider', // Maps to Adriane Fontenot
    'KIA_PROVIDER': 'provider'      // Maps to Kia Redfearn
  }
};

/**
 * Migration information for upgrading to multi-provider system
 */
const MIGRATION_INFO = {
  VERSION: '2.1.0',
  UPGRADE_DATE: '2025-07-23',
  MULTI_PROVIDER: true,
  BREAKING_CHANGES: [
    'Dynamic provider detection from spreadsheet names',
    'Multi-provider external mapping system',
    'Support for multiple hygienists',
    'No more hard-coded provider configuration',
    'Dynamic sheet ID function'
  ],
  MIGRATION_STEPS: [
    '1. Copy shared-sync-utils.gs to your Apps Script project',
    '2. Copy shared-multi-provider-utils.gs to your Apps Script project',
    '3. Replace config.gs with this multi-provider version',
    '4. Replace credentials.gs with multi-provider version',
    '5. Update spreadsheet names to include hygienist names',
    '6. Test provider detection and sync functionality'
  ]
};

// ===== PROVIDER DETECTION FUNCTIONS =====

/**
 * Get current provider configuration dynamically
 * @return {Object|null} Current provider config or null if not detected
 */
function getCurrentProviderConfig() {
  try {
    // Use multi-provider detection from shared utilities
    const providerInfo = detectCurrentProvider(getHygieneSheetId());
    if (!providerInfo) {
      return null;
    }
    
    // Find matching provider in configuration
    const providerKey = providerInfo.providerCode.toUpperCase().replace('_', '');
    const providerConfig = Object.values(HYGIENIST_SYNC_CONFIG.PROVIDERS).find(
      p => p.providerCode === providerInfo.providerCode
    );
    
    if (!providerConfig) {
      Logger.log(`Provider ${providerInfo.providerCode} not found in configuration`);
      return null;
    }
    
    // Get clinic configuration
    const clinicConfig = HYGIENIST_SYNC_CONFIG.CLINICS[providerConfig.primaryClinic];
    if (!clinicConfig) {
      Logger.log(`Clinic ${providerConfig.primaryClinic} not found in configuration`);
      return null;
    }
    
    return {
      ...providerConfig,
      detectedInfo: providerInfo,
      primaryClinicConfig: clinicConfig,
      source: 'dynamic'
    };
    
  } catch (error) {
    Logger.log(`Error getting provider config: ${error.message}`);
    return null;
  }
}

/**
 * Validate current spreadsheet for multi-provider compatibility
 * @return {Object} Validation results
 */
function validateMultiProviderSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(getHygieneSheetId());
    const spreadsheetName = ss.getName();
    
    // Check provider detection
    const providerConfig = getCurrentProviderConfig();
    if (!providerConfig) {
      return {
        isValid: false,
        error: 'Could not detect hygienist from spreadsheet name',
        suggestions: [
          'Ensure spreadsheet name contains hygienist name (e.g., "Adriane", "Kia")',
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
    
    return {
      isValid: true,
      provider: providerConfig.displayName,
      providerCode: providerConfig.providerCode,
      primaryClinic: providerConfig.primaryClinicConfig.displayName,
      monthTabsFound: monthTabs.length,
      spreadsheetName: spreadsheetName
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Legacy provider name extraction for backwards compatibility
 * Note: This is deprecated in favor of dynamic provider detection
 */
const PROVIDER_NAME_CONFIG = {
  REMOVE_PATTERNS: [
    /hygiene/gi,
    /production/gi,
    /tracker/gi,
    /data/gi,
    /sheet/gi,
    /dashboard/gi
  ],
  
  EXPECTED_NAMES: [
    'adriane',
    'adriane fontenot',
    'fontenot',
    'kia',
    'kia redfearn',
    'redfearn'
  ]
};