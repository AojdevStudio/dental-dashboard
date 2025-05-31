/**
 * @fileoverview Main entry point module for the Adriane Hygienist Sync application.
 * 
 * This module contains:
 * - Global entry point functions that can be triggered from the Google Sheets UI
 * - Custom menu setup and configuration
 * - High-level orchestration of the sync process
 * - Application initialization and lifecycle management
 * 
 * This serves as the primary interface between the user and the application,
 * providing access to core functionality through the Google Sheets menu system
 * and handling the overall execution flow.
 */

/**
 * Adds a custom menu to the spreadsheet UI.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(`Sync Tools (${PROVIDER_NAME})`)
    .addItem('Run Full Sync Now', SYNC_FUNCTION_NAME) // Use constant
    .addSeparator()
    .addItem('Run Setup (Triggers, UUIDs, Logs)', SETUP_FUNCTION_NAME) // Use constant
    .addItem('Seed Missing UUIDs Only', SEED_UUIDS_FUNCTION_NAME) // Use constant
    .addToUi();
}