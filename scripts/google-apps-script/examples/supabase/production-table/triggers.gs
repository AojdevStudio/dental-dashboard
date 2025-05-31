/**
 * Deletes all triggers associated with the specified handler function
 * for the given spreadsheet.
 * @param {string} functionName The name of the function whose triggers should be deleted.
 * @param {Spreadsheet} ss The spreadsheet object to check triggers for.
 */
function deleteTriggersByHandler_(functionName, ss) {
  // Ensure ss is provided
  if (!ss) {
      Logger.log('deleteTriggersByHandler_: Spreadsheet object not provided.');
      return;
  }
  const triggers = ScriptApp.getUserTriggers(ss); // Get triggers for this specific spreadsheet
  let deletedCount = 0;
  // Use for...of loop instead of forEach
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === functionName) {
      try {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
      } catch (e) {
          Logger.log(`Failed to delete trigger ${trigger.getUniqueId()}: ${e.message}`);
          // Sometimes triggers can be in a state where they can't be deleted by script
          // Log the error and continue
      }
    }
  }
  if (deletedCount > 0) {
      Logger.log(`Deleted ${deletedCount} existing trigger(s) for function "${functionName}" in sheet ${ss.getId()}.`);
  }
} 