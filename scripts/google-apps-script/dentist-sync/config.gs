// --- Dentist Production Sync Configuration ---

/** @const {string} ID of the Google Spreadsheet containing dentist data. CHANGE THIS! */
const DENTIST_SHEET_ID = '1bcbzCiPHMRATJe2koBpvyadZaDvxfSA7tpJ84-o-x2c';

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
const SUPABASE_URL_PROPERTY_KEY = 'DENTIST_SUPABASE_URL';

/** @const {string} Key for storing Supabase Key in Script Properties. */
const SUPABASE_KEY_PROPERTY_KEY = 'DENTIST_SUPABASE_KEY';

/** @const {string} Key for storing Clinic ID in Script Properties. */
const CLINIC_ID_PROPERTY_KEY = 'DENTIST_CLINIC_ID';

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