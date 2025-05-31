/**
 * @fileoverview Main entry point for the Adriane Hygienist Sync application.
 * 
 * This file serves as the central integration point for all modules in the
 * Adriane Hygienist Sync application. It ensures that all modules are properly loaded
 * and their functionality is accessible through the application's public interface.
 * 
 * The application has been refactored into a modular structure with the following modules:
 * - config.gs: Configuration constants
 * - main.gs: Entry points and menu setup
 * - setup.gs: Setup procedures
 * - sync.gs: Core sync functionality
 * - mapping.gs: Data transformation
 * - logging.gs: Logging functionality
 * - triggers.gs: Trigger management
 * - utils.gs: Utility functions
 * - notification.gs: Error notification
 * - handlers.gs: Event handlers
 * 
 * This modular approach improves code organization, maintainability, and testability
 * while preserving the original functionality of the application.
 * 
 * @version 2.0 - Refactored into modular structure
 * 
 * Setup instructions:
 * 1. In the provider's source spreadsheet, select Extensions > Apps Script.
 * 2. Replace the current script with this code and all module files.
 * 3. Update the CONFIGURATION section in config.gs (Sheet IDs, Provider Name, Column Indices).
 * 4. Manually run the `Setup` function from the script editor or the custom menu.
 *    This will:
 *      - Add a 'UUID' column (if missing) in the configured column index of all monthly tabs.
 *      - Seed UUIDs for existing valid rows.
 *      - Ensure the 'Sync-Logs' tab exists in the master sheet.
 *      - Set up necessary triggers (time-driven sync, on-edit UUID generation).
 * 5. Grant necessary permissions when prompted.
 */

/**
 * This file serves as the integration point for all modules.
 * 
 * In Google Apps Script, all .gs files in a project are automatically combined
 * into a single global namespace at runtime. This means that functions defined
 * in one file are accessible from any other file without explicit imports.
 * 
 * This file ensures that all the necessary public functions are properly exposed
 * and documented, maintaining the original functionality of the application while
 * benefiting from the improved organization of the modular structure.
 * 
 * The following functions are exposed as the public API of the application:
 * - onOpen: Called when the spreadsheet is opened, sets up the custom menu
 * - Setup: Performs initial setup tasks
 * - syncToExternalMaster: Synchronizes data from source sheets to master sheet
 * - onEditHandler: Handles edit events in the source spreadsheet
 * - seedAllMissingUuids_: Seeds UUIDs for existing rows
 * - listAllTriggers: Lists all triggers for debugging
 */

// No additional code is needed here as all functionality is provided by the module files.
// This file serves as documentation and ensures that the application's public API is clear.
