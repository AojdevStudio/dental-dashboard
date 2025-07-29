/**
 * Trigger function for onEdit events
 * Automatically syncs only the edited row when the spreadsheet is edited
 */
function onEditHygieneSync(e) {
  // Acquire script lock to prevent concurrent edits from causing conflicts
  const lock = LockService.getScriptLock();
  
  try {
    // Try to acquire lock for 5 seconds
    if (!lock.tryLock(5000)) {
      Logger.log('onEditHygieneSync: Could not acquire lock, another sync operation is running');
      return;
    }

    // Only process if this is the hygiene sheet
    if (!e || !e.source || e.source.getId() !== getHygieneSheetId()) {
      return;
    }

    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    // Only process month tab sheets
    const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
    if (!isMonthTab) {
      return;
    }

    // Get the edited range
    const range = e.range;
    const editedRow = range.getRow();

    // Find the header row by looking for 'date' in first 5 rows
    const data = sheet.getDataRange().getValues();
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (data[i].some(cell => String(cell).toLowerCase().includes('date'))) {
        headerRowIndex = i + 1; // Convert to 1-based row number
        break;
      }
    }

    // Skip if edit is in or before header row
    if (headerRowIndex === -1 || editedRow <= headerRowIndex) {
      Logger.log(`onEditHygieneSync: Skipping row ${editedRow} - header row is ${headerRowIndex}`);
      return;
    }

    Logger.log(`onEditHygieneSync: Processing single row ${editedRow} in sheet ${sheetName}`);
    logToHygieneSheet_('onEditHygieneSync', 'START', null, null, null, `Single row sync for ${sheetName} row ${editedRow}`);

    try {
      // Sync only the specific edited row
      const syncResult = syncSingleRow_(sheet, editedRow, sheetName);
      
      if (syncResult.success) {
        logToHygieneSheet_('onEditHygieneSync', 'SUCCESS', 1, 1, null, `Single row ${editedRow} synced successfully in ${sheetName}`);
        Logger.log(`onEditHygieneSync: Successfully synced row ${editedRow} in ${sheetName}`);
      } else {
        logToHygieneSheet_('onEditHygieneSync', 'ERROR', 0, 0, null, `Single row ${editedRow} sync failed in ${sheetName}: ${syncResult.error}`);
        Logger.log(`onEditHygieneSync: Failed to sync row ${editedRow} in ${sheetName}: ${syncResult.error}`);
      }
    } catch (syncError) {
      logToHygieneSheet_('onEditHygieneSync', 'ERROR', 0, 0, null, `Single row sync failed for row ${editedRow}: ${syncError.message}`);
      Logger.log(`onEditHygieneSync: Sync error for row ${editedRow}: ${syncError.message}`);
    }

  } catch (error) {
    Logger.log(`Error in onEditHygieneSync trigger: ${error.message}`);
    logToHygieneSheet_('onEditHygieneSync', 'ERROR', 0, 0, null, `Trigger error: ${error.message}`);
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}

/**
 * Check trigger status and provide debugging info
 */
function checkTriggerStatus() {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  
  let triggerInfo = '🔧 Trigger Status:\n\n';
  
  if (triggers.length === 0) {
    triggerInfo += '❌ No triggers found.\nRun "1. Setup Sync" to create triggers.';
  } else {
    triggerInfo += `✅ Found ${triggers.length} trigger(s):\n\n`;
    
    triggers.forEach((trigger, index) => {
      const type = trigger.getTriggerSource();
      const handler = trigger.getHandlerFunction();
      
      triggerInfo += `${index + 1}. Function: ${handler}\n`;
      triggerInfo += `   Type: ${type}\n`;
      
      if (type === ScriptApp.TriggerSource.CLOCK) {
        triggerInfo += `   Schedule: Every ${trigger.getTriggerSource()}\n`;
      } else if (type === ScriptApp.TriggerSource.SPREADSHEETS) {
        triggerInfo += `   Event: ${trigger.getEventType()}\n`;
      }
      
      triggerInfo += '\n';
    });
  }
  
  ui.alert(triggerInfo);
}

/**
 * Manually test the onEdit trigger
 */
function testOnEditTrigger() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  // Create a mock edit event
  const mockEvent = {
    source: SpreadsheetApp.getActiveSpreadsheet(),
    range: sheet.getRange('A2') // Simulate editing row 2
  };
  
  try {
    onEditHygieneSync(mockEvent);
    SpreadsheetApp.getUi().alert(`✅ onEdit trigger test completed for sheet: ${sheetName}\n\nCheck the logs for results.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ onEdit trigger test failed:\n\n${error.message}`);
  }
}