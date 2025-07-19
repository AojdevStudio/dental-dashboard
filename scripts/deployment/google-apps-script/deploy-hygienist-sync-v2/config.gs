// --- Hygienist Production Sync Configuration V2 (Resilient) ---
// Updated to use external mapping system for database reseed resilience

/** @const {string} ID of the Google Spreadsheet containing hygienist data. CHANGE THIS! */
const HYGIENE_SHEET_ID = 'HYGIENE_SPREADSHEET_ID_HERE';

/** @const {string} Name of the sheet tab for logging sync operations. */
const HYGIENE_LOG_TAB_NAME = 'Hygiene-Sync-Log';

/** @const {string} Name of the target table in Supabase. */
const SUPABASE_TABLE_NAME = 'hygiene_production';

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
const SYNC_FUNCTION_NAME = 'syncAllHygieneData';

/** @const {string} Name of the on-edit sync function for trigger management. */
const ON_EDIT_FUNCTION_NAME = 'onEditHygieneSync';

/** @const {array} Month tab patterns to sync (MMM-YY format). Case-insensitive matching. */
const MONTH_TAB_PATTERNS = [
  /^[a-z]{3}-\d{2}$/i,  // Dec-23, Jan-24, etc. (case-insensitive)
  /^[a-z]{3} \d{4}$/i   // Dec 2023, Jan 2024, etc. (case-insensitive)
];

/** @const {object} Column header mappings for hygiene production data. */
const HYGIENE_COLUMN_HEADERS = {
  DATE: ['date', 'day'],
  HOURS_WORKED: ['hours worked'],
  ESTIMATED_PRODUCTION: ['estimated production'],
  VERIFIED_PRODUCTION: ['verified production', 'verified production (billing department only)'],
  PRODUCTION_GOAL: ['production goal'],
  VARIANCE_PERCENTAGE: ['variance %', 'variance', 'variance percentage'],
  BONUS_AMOUNT: ['bonus'],
  UUID: ['uuid', 'id']
};

// ===== V2 RESILIENT CONFIGURATION =====

/**
 * Resilient sync configuration for hygienist system
 * These external mappings survive database reseeds
 */
const HYGIENIST_SYNC_CONFIG = {
  // System identifier for external mappings
  SYSTEM_NAME: 'hygienist_sync',
  
  // Provider-specific configuration (Adriane Fontenot)
  PROVIDER_CODE: 'adriane_fontenot',           // Stable provider code
  PRIMARY_CLINIC_CODE: 'KAMDENTAL_BAYTOWN',    // Adriane's primary clinic
  
  // External mapping identifiers for this sync system
  EXTERNAL_MAPPINGS: {
    'ADRIANE_CLINIC': 'clinic',      // Maps to Adriane's clinic (Baytown)
    'ADRIANE_PROVIDER': 'provider'   // Maps to Adriane Fontenot specifically
  },
  
  // Provider metadata
  PROVIDER_INFO: {
    name: 'Adriane Fontenot',
    type: 'hygienist',
    specialization: 'dental_hygiene',
    primaryLocation: 'BAYTOWN_MAIN'
  }
};

/**
 * Migration information for upgrading existing hygienist sync systems
 */
const HYGIENIST_MIGRATION_INFO = {
  VERSION: '2.0.0',
  UPGRADE_DATE: '2025-07-02',
  PROVIDER_SPECIFIC: 'adriane_fontenot',
  BREAKING_CHANGES: [
    'Credentials function now uses shared sync utilities',
    'Clinic and Provider IDs resolved via external mappings',
    'Provider-specific external mapping system',
    'Resilient to database reseeds and ID changes',
    'No more hard-coded clinic/provider ID properties'
  ],
  MIGRATION_STEPS: [
    '1. Copy shared-sync-utils.gs to your Apps Script project',
    '2. Replace config.gs with this new version',
    '3. Replace credentials.gs with new external mapping version',
    '4. Update HYGIENE_SHEET_ID with your actual spreadsheet ID',
    '5. Test sync functionality with new system'
  ]
};

/**
 * Legacy configuration mappings for reference
 * These are the old hard-coded property keys that are no longer needed
 */
const LEGACY_PROPERTY_KEYS = {
  CLINIC_ID: 'HYGIENE_CLINIC_ID',           // No longer used - resolved via external mapping
  PROVIDER_ID: 'HYGIENE_PROVIDER_ID',       // No longer used - resolved via external mapping
  URL: 'HYGIENE_SUPABASE_URL',              // Migrated to standard SUPABASE_URL
  KEY: 'HYGIENE_SUPABASE_KEY'               // Migrated to standard SUPABASE_SERVICE_ROLE_KEY
};

/**
 * Provider name extraction configuration
 * Used for legacy compatibility and validation
 */
const PROVIDER_NAME_CONFIG = {
  // Patterns to remove from spreadsheet names when extracting provider names
  REMOVE_PATTERNS: [
    /hygiene/gi,
    /production/gi,
    /tracker/gi,
    /data/gi,
    /sheet/gi,
    /dashboard/gi,
    /dr\./gi
  ],
  
  // Expected provider names for validation
  EXPECTED_NAMES: [
    'adriane',
    'adriane fontenot',
    'fontenot'
  ]
};