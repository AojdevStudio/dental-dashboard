/**
 * Trigger function for onEdit events
 * Automatically syncs data when the spreadsheet is edited
 */
function onEditDentistSync(e) {
  try {
    // Only process if this is the hygiene sheet
    if (!e || !e.source || e.source.getId() !== getDentistSheetId()) {
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

    // Skip header rows (first 3 rows typically)
    if (editedRow <= 3) {
      return;
    }

    Logger.log(`Sheet edited: ${sheetName}, row: ${editedRow}, syncing...`);
    logToDentistSheet_('onEditDentistSync', 'START', null, null, null, `Edit detected in ${sheetName} row ${editedRow}`);

    // Add a small delay to allow for multiple rapid edits
    Utilities.sleep(2000);

    try {
      // Sync the entire sheet (simpler and more reliable than single row)
      const rowsProcessed = syncSheetData_(sheet, sheetName);
      logToDentistSheet_('onEditDentistSync', 'SUCCESS', rowsProcessed, 1, null, `Auto-sync completed for ${sheetName}`);
    } catch (syncError) {
      logToDentistSheet_('onEditDentistSync', 'ERROR', 0, 0, null, `Auto-sync failed: ${syncError.message}`);
    }

  } catch (error) {
    Logger.log(`Error in onEditDentistSync trigger: ${error.message}`);
    logToDentistSheet_('onEditDentistSync', 'ERROR', 0, 0, null, `Trigger error: ${error.message}`);
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
    source: SpreadsheetApp.openById(getDentistSheetId()),
    range: sheet.getRange('A2') // Simulate editing row 2
  };
  
  try {
    onEditDentistSync(mockEvent);
    SpreadsheetApp.getUi().alert(`✅ onEdit trigger test completed for sheet: ${sheetName}\n\nCheck the logs for results.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ onEdit trigger test failed:\n\n${error.message}`);
  }
}