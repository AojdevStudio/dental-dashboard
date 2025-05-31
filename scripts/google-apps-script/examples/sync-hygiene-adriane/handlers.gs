/**
 * @fileoverview Event handlers module for the Adriane Hygienist Sync application.
 * 
 * This module contains handlers for various events and user interactions, including:
 * - Spreadsheet edit event handlers
 * - Form submission handlers
 * - UI interaction handlers
 * - Scheduled task completion handlers
 * - Error and exception handlers
 * 
 * The handlers module provides the connection between user actions or
 * system events and the application's business logic, ensuring appropriate
 * responses to different types of events while maintaining separation of
 * concerns.
 */

/**
 * Handles the onEdit event for the source spreadsheet.
 * Adds a UUID to the corresponding row if the relevant production column (VER_PROD_COL_INDEX)
 * is edited, the date is valid, and no UUID currently exists. Notifies via email on error.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The event object. https://developers.google.com/apps-script/guides/triggers/events#edit
 */
function onEditHandler(e) {
  let sheetName = 'Unknown'; // Default value
  let editedRow = 0; // Initialize as number
  try {
    // Validate the event object and range
    if (!e || !e.range) {
      // Logger.log('onEditHandler: Invalid event object.'); // Optional: Log if needed, can be noisy
      return;
    }

    const sheet = e.range.getSheet();
    sheetName = sheet.getName(); // Get sheet name early for logging
    const editedCol = e.range.getColumn();
    editedRow = e.range.getRow(); // Get row early for logging

    // Check if the edit is in a valid monthly sheet, correct column, and data row
    if (!isMonthlySheet_(sheetName)) return;
    if (editedCol !== VER_PROD_COL_INDEX) return;
    if (editedRow < SOURCE_DATA_START_ROW) return;

    const uuidCell = sheet.getRange(editedRow, UUID_COL_INDEX);
    // Only add UUID if the cell is blank
    if (!uuidCell.getValue()) {
      // --- NEW: Check date before adding UUID ---
      const dateCell = sheet.getRange(editedRow, 1); // Column A is assumed to be Date
      const dateValue = dateCell.getValue();

      if (dateValue === null || dateValue === '' || !(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
        // Logger.log(`onEditHandler: Skipping UUID generation for row ${editedRow} in "${sheetName}": Invalid or blank date.`);
        return; // Don't add UUID if date is invalid/blank
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today
      const sourceDate = new Date(dateValue);
      sourceDate.setHours(0, 0, 0, 0); // Normalize source date

      if (sourceDate > today) {
        // Logger.log(`onEditHandler: Skipping UUID generation for row ${editedRow} in "${sheetName}": Date ${sourceDate.toDateString()} is in the future.`);
        return; // Don't add UUID if date is in the future
      }
      // --- END NEW: Check date ---

      const newUuid = Utilities.getUuid();
      uuidCell.setValue(newUuid);
      // Logger.log(`onEditHandler: Added UUID ${newUuid} to ${sheetName}, row ${editedRow}`); // Optional debug log
    }
  } catch (err) {
    const errorMessage = `Error in onEditHandler for sheet "${sheetName}", row ${editedRow}: ${err.message}`;
    Logger.log(`${errorMessage}\n${err.stack}`);

    // --- IMPROVEMENT: Notify on onEdit errors ---
    // Send an email notification for errors during onEdit.
    // WARNING: If frequent edits cause errors, this might lead to many emails.
    // Consider implementing rate-limiting or more selective error notification
    // (e.g., only for specific error types) if this becomes an issue.
    notifyError_(EDIT_HANDLER_FUNCTION_NAME, err, `Sheet: ${sheetName}, Row: ${editedRow}`);
    // --------------------------------------------
  }
}