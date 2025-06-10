/**
 * ========================================
 * LOCATION FINANCIAL SYNC CONFIGURATION
 * ========================================
 * Configuration settings for location-based financial data synchronization
 * 
 * MULTI-CLINIC SUPPORT:
 * This system supports separate clinic IDs for each location:
 * - Baytown sheets sync to Baytown clinic ID
 * - Humble sheets sync to Humble clinic ID
 * - Location detection is automatic based on sheet names
 * - Each clinic's data remains isolated
 */

/** @const {string} ID of the Google Spreadsheet containing location financial data. */
const LOCATION_FINANCIAL_SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/** @const {string} Name of the sheet tab for logging sync operations. */
const LOCATION_FINANCIAL_LOG_TAB_NAME = 'Location-Financial-Sync-Log';

/** @const {string} Supabase project URL for API calls. */
const SUPABASE_URL = 'https://yovbdmjwrrgardkgrenc.supabase.co';

/** @const {string} API endpoint for location financial data import (Edge Function). */
const LOCATION_FINANCIAL_IMPORT_ENDPOINT = '/functions/v1/location-financial-import';

/** @const {number} Number of records to process in each batch API call. */
const LOCATION_FINANCIAL_BATCH_SIZE = 25;

/** @const {number} Maximum number of retries for API calls on rate limits (429). */
const MAX_RETRIES = 3;

/** @const {number} Initial delay in milliseconds for exponential backoff. */
const INITIAL_BACKOFF_MS = 1000;

/** @const {string} Key for storing Supabase Project URL in Script Properties. */
const LOCATION_FINANCIAL_SUPABASE_URL_PROPERTY_KEY = 'LOCATION_FINANCIAL_SUPABASE_URL';

/** @const {string} Key for storing Supabase Service Role Key in Script Properties. */
const LOCATION_FINANCIAL_SUPABASE_KEY_PROPERTY_KEY = 'LOCATION_FINANCIAL_SUPABASE_KEY';

/** @const {string} Key for storing Baytown Clinic ID in Script Properties. */
const LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID_PROPERTY_KEY = 'LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID';

/** @const {string} Key for storing Humble Clinic ID in Script Properties. */
const LOCATION_FINANCIAL_HUMBLE_CLINIC_ID_PROPERTY_KEY = 'LOCATION_FINANCIAL_HUMBLE_CLINIC_ID';

/** @const {string} Key for storing Data Source ID in Script Properties. */
const LOCATION_FINANCIAL_DATA_SOURCE_ID_PROPERTY_KEY = 'LOCATION_FINANCIAL_DATA_SOURCE_ID';

/** @const {string} Key for storing whether the welcome message has been shown. */
const LOCATION_FINANCIAL_WELCOME_SHOWN_PROPERTY_KEY = 'LOCATION_FINANCIAL_WELCOME_SHOWN';

/** @const {string} Name of the manual sync function for trigger management. */
const LOCATION_FINANCIAL_SYNC_FUNCTION_NAME = 'syncAllLocationFinancialData';

/** @const {string} Name of the on-edit sync function for trigger management. */
const LOCATION_FINANCIAL_ON_EDIT_FUNCTION_NAME = 'onEditLocationFinancialSync';

/**
 * Location mapping configuration
 * Maps sheet identifiers to location names for API calls
 * These should match the location names in your database
 */
const LOCATION_MAP = {
  'BT': 'Baytown',           // Baytown location
  'HM': 'Humble',            // Humble location
  'BAYTOWN': 'Baytown',      // Alternative naming
  'HUMBLE': 'Humble'         // Alternative naming
};

/**
 * Sheet tab patterns for location-based financial data
 * Recognizes various naming conventions for location tabs
 */
const LOCATION_TAB_PATTERNS = [
  /^(BT|Baytown|BAYTOWN)\s*-?\s*.*$/i,     // Baytown variations
  /^(HM|Humble|HUMBLE)\s*-?\s*.*$/i,       // Humble variations
  /^.*\s*(BT|Baytown|BAYTOWN).*$/i,        // Baytown anywhere in name
  /^.*\s*(HM|Humble|HUMBLE).*$/i           // Humble anywhere in name
];

/**
 * Financial data column patterns (case-insensitive matching)
 * Each array contains variations of column headers that might be used
 */
const FINANCIAL_COLUMN_HEADERS = {
  DATE: [
    'date', 
    'transaction date', 
    'day', 
    'date of service',
    'service date'
  ],
  PRODUCTION: [
    'production', 
    'gross production', 
    'daily production',
    'total production',
    'prod'
  ],
  ADJUSTMENTS: [
    'adjustments', 
    'adjustment', 
    'adj',
    'total adjustments',
    'daily adjustments'
  ],
  WRITE_OFFS: [
    'write offs', 
    'writeoffs', 
    'write-offs', 
    'insurance writeoffs',
    'write off',
    'writeoff',
    'write-off'
  ],
  PATIENT_INCOME: [
    'patient income', 
    'patient collections', 
    'patient pay',
    'patient payments',
    'patient cash',
    'cash collections',
    'pt income',
    'pt collections',
    'pt pay'
  ],
  INSURANCE_INCOME: [
    'insurance income', 
    'insurance collections', 
    'insurance pay',
    'insurance payments',
    'insurance reimb',
    'insurance reimbursement',
    'ins income',
    'ins collections',
    'ins pay'
  ],
  UNEARNED: [
    'unearned', 
    'unearned income', 
    'prepaid',
    'prepayment',
    'advance payment',
    'unearned pt income',
    'unearned patient income'
  ],
  NET_PRODUCTION: [
    'net production',
    'net prod',
    'production net'
  ],
  TOTAL_COLLECTIONS: [
    'total collections',
    'collections total',
    'total collected',
    'collections'
  ]
};

/**
 * Required financial data fields for validation
 * All records must have these minimum fields to be processed
 */
const REQUIRED_FINANCIAL_FIELDS = ['DATE', 'PRODUCTION'];

/**
 * Optional financial data fields
 * These fields will be processed if present but are not required
 */
const OPTIONAL_FINANCIAL_FIELDS = [
  'ADJUSTMENTS', 
  'WRITE_OFFS', 
  'PATIENT_INCOME', 
  'INSURANCE_INCOME', 
  'UNEARNED'
];

/**
 * Default values for missing financial data
 * Used when optional fields are not provided
 */
const FINANCIAL_FIELD_DEFAULTS = {
  ADJUSTMENTS: 0,
  WRITE_OFFS: 0,
  PATIENT_INCOME: 0,
  INSURANCE_INCOME: 0,
  UNEARNED: null
};

/**
 * Data validation rules for financial amounts
 */
const FINANCIAL_VALIDATION_RULES = {
  MIN_PRODUCTION: 0,           // Minimum allowed production value
  MAX_PRODUCTION: 100000,      // Maximum allowed production value (safety check)
  MIN_ADJUSTMENT: -50000,      // Adjustments can be negative
  MAX_ADJUSTMENT: 50000,       // Maximum adjustment amount
  MIN_INCOME: 0,               // Income should be positive
  MAX_INCOME: 100000          // Maximum income amount
};

/**
 * Sync scheduling configuration
 */
const SYNC_SCHEDULE = {
  DAILY_HOUR: 6,              // Hour of day for daily sync (6 AM)
  ENABLE_REAL_TIME: true,     // Enable real-time sync on sheet edits
  ENABLE_SCHEDULED: true      // Enable scheduled daily sync
};

/**
 * Date format configuration
 */
const DATE_FORMATS = {
  INPUT_PATTERNS: [
    'MM/dd/yyyy',
    'M/d/yyyy', 
    'yyyy-MM-dd',
    'MM-dd-yyyy',
    'M-d-yyyy'
  ],
  OUTPUT_FORMAT: 'yyyy-MM-dd'  // Standard format for API
};

/**
 * Error handling configuration
 */
const ERROR_CONFIG = {
  MAX_LOG_ENTRIES: 1000,       // Maximum number of log entries to keep
  LOG_RETENTION_DAYS: 30,      // Days to keep log entries
  NOTIFICATION_EMAIL: null,    // Email for error notifications (set via setup)
  ENABLE_EMAIL_ALERTS: false   // Enable email alerts for sync failures
};