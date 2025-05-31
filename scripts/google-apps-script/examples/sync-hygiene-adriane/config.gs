/**
 * @fileoverview Configuration module for the Adriane Hygienist Sync application.
 * 
 * This module contains all configuration constants and settings used throughout
 * the application, including:
 * - Spreadsheet IDs and sheet names
 * - Provider details
 * - Column mappings and data structure definitions
 * - Function names for triggers and menus
 * 
 * Centralizing configuration in this module makes it easier to maintain and
 * update settings without modifying business logic code.
 */

// ────────────────────── CONFIGURATION ──────────────────────

/** @const {string} ID of the source Spreadsheet containing provider's monthly data tabs. */
const SOURCE_SHEET_ID = "YOUR_SOURCE_SHEET_ID_HERE"; // Replace with your actual source spreadsheet ID

/** @const {string} ID of the master Spreadsheet where data will be consolidated. */
const MASTER_SHEET_ID = '1Jht7tr8Hh7jHWi-NM9JP7vMvsg69RBQaM4E5hA7p_ko';

/** @const {string} Name of the tab within the master Spreadsheet to write data to. */
const MASTER_TAB_NAME = 'Data';

/** @const {string} Name of the tab within the master Spreadsheet for execution logs. */
const LOG_TAB_NAME = 'Sync-Logs';

// --- Provider & Location Details ---
/** @const {string} Name of the provider this script instance handles. */
const PROVIDER_NAME = 'Adriane';
/** @const {string} Type of the provider. */
const PROVIDER_TYPE = 'Hygienist';
/** @const {string} Default location value to assign. */
const DEFAULT_LOCATION = 'Baytown';

// --- Source Sheet Structure ---
/** @const {number} Row number containing headers in the source monthly sheets. */
const SOURCE_HEADER_ROW = 2;
/** @const {number} Row number where data starts in the source monthly sheets. */
const SOURCE_DATA_START_ROW = 3;

// --- Column Indices (1-based) ---
/** @const {number} 1-based index for the UUID column in source sheets. */
const UUID_COL_INDEX = 18; // Column R
/** @const {number} 1-based index for the Verified Production column in source sheets. */
const VER_PROD_COL_INDEX = 4; // Column D

// --- Core Function Names (for triggers, menus, etc.) ---
/** @const {string} Name of the main synchronization function. */
const SYNC_FUNCTION_NAME = 'syncToExternalMaster'; // Standard name
/** @const {string} Name of the function handling onEdit events. */
const EDIT_HANDLER_FUNCTION_NAME = 'onEditHandler';
/** @const {string} Name of the UUID seeding function. */
const SEED_UUIDS_FUNCTION_NAME = 'seedAllMissingUuids_';
/** @const {string} Name of the setup function. */
const SETUP_FUNCTION_NAME = 'Setup';