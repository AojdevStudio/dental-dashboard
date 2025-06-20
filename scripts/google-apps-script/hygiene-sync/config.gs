// --- Hygiene Production Sync Configuration ---

/** @const {string} ID of the Google Spreadsheet containing hygiene data. CHANGE THIS! */
const HYGIENE_SHEET_ID = '1wQF832sOD-5qIrjdBnLANXtbmrnYWRBb_q5FaUuDUAE';

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
const SUPABASE_URL_PROPERTY_KEY = 'HYGIENE_SUPABASE_URL';

/** @const {string} Key for storing Supabase Key in Script Properties. */
const SUPABASE_KEY_PROPERTY_KEY = 'HYGIENE_SUPABASE_KEY';

/** @const {string} Key for storing Clinic ID in Script Properties. */
const CLINIC_ID_PROPERTY_KEY = 'HYGIENE_CLINIC_ID';

/** @const {string} Key for storing Provider ID in Script Properties. */
const HYGIENE_PROVIDER_ID_PROPERTY_KEY = 'HYGIENE_PROVIDER_ID';

/** @const {string} Name of the time-based sync function for trigger management. */
const SYNC_FUNCTION_NAME = 'syncAllHygieneData';

/** @const {string} Name of the on-edit sync function for trigger management. */
const ON_EDIT_FUNCTION_NAME = 'onEditHygieneSync';

/** @const {string} Key for storing Dashboard API URL (optional). */
const DASHBOARD_API_URL_PROPERTY_KEY = 'HYGIENE_DASHBOARD_API_URL';

/** @const {string} Key for storing whether the welcome message has been shown. */
const HYGIENE_WELCOME_SHOWN_PROPERTY_KEY = 'HYGIENE_WELCOME_SHOWN';

/** @const {array} Month tab patterns to sync (MMM-YY format). */
const MONTH_TAB_PATTERNS = [
  /^[A-Za-z]{3}-\d{2}$/,  // Dec-23, Jan-24, etc.
  /^[A-Za-z]{3} \d{4}$/   // Dec 2023, Jan 2024, etc.
];

/** @const {object} Column header mappings for hygiene data. */
const HYGIENE_COLUMN_HEADERS = {
  DATE: ['date'],
  HOURS_WORKED: ['hours worked'], // More specific - avoid "Average Hours worked"
  ESTIMATED_PRODUCTION: ['estimated production'],
  VERIFIED_PRODUCTION: ['verified production'],
  PRODUCTION_GOAL: ['production goal'], // More specific - avoid "Over/Under Production Goal"
  VARIANCE: ['variance'],
  BONUS: ['bonus'],
  UUID: ['uuid']
};