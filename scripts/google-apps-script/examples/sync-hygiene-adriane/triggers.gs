/**
 * @fileoverview Triggers module for the Adriane Hygienist Sync application.
 * 
 * This module contains functions for managing Google Apps Script triggers:
 * - Creating and deleting time-based triggers
 * - Setting up and managing event-driven triggers
 * - Scheduling recurring tasks
 * - Managing trigger permissions and quotas
 * 
 * The triggers module ensures that the application's automated processes
 * run at the appropriate times and in response to relevant events.
 */

/**
 * Deletes existing triggers for a specified handler function and creates a new time-driven trigger.
 *
 * @param {string} functionName The name of the function to trigger.
 * @param {number} hours The frequency in hours for the time-driven trigger. Throws error if invalid.
 */
function reinstallTrigger_(functionName, hours) {
  if (!functionName || typeof this[functionName] !== 'function') {
    throw new Error(`Trigger installation failed: Function "${functionName}" does not exist.`);
  }
  if (typeof hours !== 'number' || hours <= 0 || !Number.isInteger(hours * 60)) { // Check if hours is positive and leads to integer minutes
    throw new Error(`Trigger installation failed: Invalid hours value "${hours}". Must be a positive number.`);
  }

  deleteTriggersByHandler_(functionName);
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyHours(hours)
    .create();
  Logger.log(`Installed time-driven trigger for "${functionName}" to run every ${hours} hours.`);
}

/**
 * Deletes existing edit triggers for the specific spreadsheet and handler function,
 * then creates a new onEdit trigger bound to the SOURCE_SHEET_ID.
 */
function reinstallEditTrigger_() {
  const functionName = EDIT_HANDLER_FUNCTION_NAME; // Use constant
  if (typeof this[functionName] !== 'function') {
    throw new Error(`Trigger installation failed: Function "${functionName}" does not exist.`);
  }
  // Important: Delete triggers specific to this function *and* this spreadsheet ID if possible
  // However, standard API only allows filtering by handler function name.
  // We delete all triggers for this handler function name owned by this script.
  deleteTriggersByHandler_(functionName); // Use constant

  // Create a specific trigger for the source spreadsheet
  ScriptApp.newTrigger(functionName) // Use constant
    .forSpreadsheet(SOURCE_SHEET_ID)
    .onEdit()
    .create();
  Logger.log(`Installed onEdit trigger for "${functionName}" on Spreadsheet ID ${SOURCE_SHEET_ID}.`);
}

/**
 * Deletes all triggers associated with a specific handler function name for the current script project.
 *
 * @param {string} functionName The handler function name of the triggers to delete.
 */
function deleteTriggersByHandler_(functionName) {
  let deletedCount = 0;
  try {
    const triggers = ScriptApp.getProjectTriggers(); // Get triggers once
    for (const trigger of triggers) { // Use for...of
      if (trigger.getHandlerFunction() === functionName) {
        try {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
        } catch (e) {
          // Log if a specific trigger fails to delete, but continue trying others
          Logger.log(`Warning: Failed to delete trigger for "${functionName}" (ID: ${trigger.getUniqueId()}): ${e.message}`);
        }
      }
    } // End for...of loop
  } catch (e) {
    // Catch errors during trigger access (e.g., permissions issues)
    Logger.log(`Error accessing project triggers for deletion: ${e.message}. Manual check might be needed.`);
    // Depending on criticality, you might want to notify here
    // notifyError_('deleteTriggersByHandler_', e, 'Could not access project triggers.');
    return; // Exit if we can't even get the triggers
  }

  if (deletedCount > 0) {
    Logger.log(`Deleted ${deletedCount} existing trigger(s) for handler function "${functionName}".`);
  } else {
    Logger.log(`No existing triggers found for handler function "${functionName}".`);
  }
}

/**
 * Lists all triggers for the current project.
 * Useful for debugging trigger issues.
 */
function listAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const t of triggers) { // Use for...of loop
    Logger.log(
      `${t.getHandlerFunction()} → ${t.getEventType()} @ ${t.getTriggerSource()}`
    );
  }
}