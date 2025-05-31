// --- Configuration ---
/** @const {string} ID of the Master Google Spreadsheet containing the data. */
const MASTER_SHEET_ID = '1Jht7tr8Hh7jHWi-NM9JP7vMvsg69RBQaM4E5hA7p_ko';
/** @const {string} Name of the sheet tab in the Master Spreadsheet containing the data to sync. */
const MASTER_DATA_TAB_NAME = 'Data';
/** @const {string} Name of the sheet tab for logging Supabase sync operations. */
const SUPABASE_LOG_TAB_NAME = 'Supabase-Sync-Log';
/** @const {string} Name of the target table in Supabase. */
const SUPABASE_TABLE_NAME = 'all_production_live_sheet';
/** @const {number} Number of rows to process in each batch API call to Supabase. Adjust based on performance. */
const SUPABASE_BATCH_SIZE = 200;
/** @const {number} Maximum number of retries for API calls on rate limits (429). */
const MAX_RETRIES = 3;
/** @const {number} Initial delay in milliseconds for exponential backoff. */
const INITIAL_BACKOFF_MS = 1000;
/** @const {string} Key for storing Supabase Project URL in Script Properties. */
const SUPABASE_URL_PROPERTY_KEY = 'SUPABASE_URL';
/** @const {string} Key for storing Supabase Service Role Key in Script Properties. */
const SUPABASE_KEY_PROPERTY_KEY = 'SUPABASE_SERVICE_KEY';
/** @const {string} Name of the time-based sync function for trigger management. */
const SYNC_FUNCTION_NAME_SUPABASE = 'syncMasterSheetToSupabase';
/** @const {string} Name of the on-edit sync function for trigger management. */
const ON_EDIT_FUNCTION_NAME_SUPABASE = 'onEditSupabaseSync'; 