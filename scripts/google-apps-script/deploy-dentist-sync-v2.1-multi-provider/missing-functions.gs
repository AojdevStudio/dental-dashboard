/**
 * ===== MISSING FUNCTION IMPLEMENTATIONS =====
 * 
 * These functions are referenced in menu.gs but were not implemented.
 * Add these functions to the appropriate .gs files or create a new file.
 * 
 * @version 1.0.0
 * @author Claude Code Implementation Specialist
 */

/**
 * 🔧 Setup Dentist Triggers
 * Creates time-based and onEdit triggers for dentist sync system
 * This function should be added to setup.gs or triggers.gs
 */
function setupDentistTriggers() {
  const functionName = 'setupDentistTriggers';
  const ui = SpreadsheetApp.getUi();
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Setting up dentist sync triggers.');
    Logger.log(`Starting ${functionName}...`);

    // Check if sheet ID is configured
    if (!DENTIST_SHEET_ID || DENTIST_SHEET_ID === 'YOUR_DENTIST_SHEET_ID_HERE') {
      const errMsg = '❌ Error: DENTIST_SHEET_ID is not configured in config.gs\n\nPlease edit config.gs and set your Google Sheet ID.';
      Logger.log(errMsg);
      ui.alert(errMsg);
      return;
    }

    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
    
    // Check credentials are available
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      const errMsg = '❌ Error: Supabase credentials not found.\n\nPlease run "Setup Credentials (V2.1)" first.';
      Logger.log(errMsg);
      ui.alert(errMsg);
      logToDentistSheet_(functionName, 'ERROR', null, null, null, errMsg);
      return;
    }

    let triggersCreated = 0;

    // 1. Delete existing triggers first to avoid duplicates
    const existingTriggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    existingTriggers.forEach(trigger => {
      const handlerFunction = trigger.getHandlerFunction();
      if (handlerFunction === SYNC_FUNCTION_NAME || handlerFunction === ON_EDIT_FUNCTION_NAME) {
        try {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
        } catch (deleteErr) {
          Logger.log(`Warning: Could not delete existing trigger for ${handlerFunction}: ${deleteErr.message}`);
        }
      }
    });

    if (deletedCount > 0) {
      Logger.log(`Deleted ${deletedCount} existing triggers`);
    }

    // 2. Create Time-Based Trigger (runs every 6 hours)
    try {
      ScriptApp.newTrigger(SYNC_FUNCTION_NAME)
        .timeBased()
        .everyHours(6)
        .create();
      triggersCreated++;
      Logger.log('✅ Time-based trigger created (every 6 hours)');
    } catch (timeErr) {
      Logger.log(`❌ Failed to create time-based trigger: ${timeErr.message}`);
    }

    // 3. Create onEdit Trigger
    try {
      ScriptApp.newTrigger(ON_EDIT_FUNCTION_NAME)
        .forSpreadsheet(ss)
        .onEdit()
        .create();
      triggersCreated++;
      Logger.log('✅ onEdit trigger created');
    } catch (editErr) {
      Logger.log(`❌ Failed to create onEdit trigger: ${editErr.message}`);
    }

    // 4. Validate triggers were created
    const newTriggers = ScriptApp.getProjectTriggers();
    const syncTriggers = newTriggers.filter(trigger => 
      trigger.getHandlerFunction() === SYNC_FUNCTION_NAME || 
      trigger.getHandlerFunction() === ON_EDIT_FUNCTION_NAME
    );

    const successMsg = `✅ Dentist Sync Triggers Setup Complete!\n\n` +
      `• Triggers created: ${triggersCreated}\n` +
      `• Time-based sync: Every 6 hours\n` +
      `• Auto-sync on edit: Enabled\n` +
      `• Active triggers: ${syncTriggers.length}\n\n` +
      `Your dentist data will now sync automatically!`;

    Logger.log(successMsg);
    logToDentistSheet_(functionName, 'SUCCESS', null, triggersCreated, null, `Created ${triggersCreated} triggers`);
    ui.alert(successMsg);

  } catch (error) {
    const errorMsg = `❌ ${functionName} failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert(`❌ Trigger Setup Failed!\n\n${error.message}\n\nCheck the execution logs for details.`);
  }
}

/**
 * 🗑️ Remove Dentist Triggers
 * Removes all triggers for dentist sync system
 * This function should be added to setup.gs or triggers.gs
 */
function removeDentistTriggers() {
  const functionName = 'removeDentistTriggers';
  const ui = SpreadsheetApp.getUi();
  
  // Confirm action
  const response = ui.alert(
    '⚠️ Remove Dentist Sync Triggers',
    'Are you sure you want to remove ALL dentist sync triggers?\n\n' +
    'This will stop:\n' +
    '• Automatic sync every 6 hours\n' +
    '• Auto-sync when spreadsheet is edited\n\n' +
    'You can re-enable triggers using "Setup Triggers" later.',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Removing dentist sync triggers.');
    Logger.log(`Starting ${functionName}...`);

    const triggers = ScriptApp.getProjectTriggers();
    let removedCount = 0;
    let removedTriggers = [];

    triggers.forEach(trigger => {
      const handlerFunction = trigger.getHandlerFunction();
      if (handlerFunction === SYNC_FUNCTION_NAME || handlerFunction === ON_EDIT_FUNCTION_NAME) {
        try {
          const triggerType = trigger.getTriggerSource() === ScriptApp.TriggerSource.CLOCK ? 'Time-based' : 'onEdit';
          ScriptApp.deleteTrigger(trigger);
          removedCount++;
          removedTriggers.push(`${triggerType} (${handlerFunction})`);
        } catch (deleteErr) {
          Logger.log(`Warning: Could not delete trigger for ${handlerFunction}: ${deleteErr.message}`);
        }
      }
    });

    if (removedCount === 0) {
      const noTriggersMsg = '✅ No dentist sync triggers found to remove.\n\nTriggers may have already been removed or never set up.';
      ui.alert(noTriggersMsg);
      logToDentistSheet_(functionName, 'SUCCESS', null, 0, null, 'No triggers found to remove');
      return;
    }

    const successMsg = `✅ Dentist Sync Triggers Removed!\n\n` +
      `• Triggers removed: ${removedCount}\n` +
      `• Removed triggers:\n  - ${removedTriggers.join('\n  - ')}\n\n` +
      `⚠️ Automatic syncing is now DISABLED.\n\n` +
      `To re-enable automatic sync, use "Setup Triggers" in the menu.`;

    Logger.log(`Successfully removed ${removedCount} triggers`);
    logToDentistSheet_(functionName, 'SUCCESS', null, removedCount, null, `Removed ${removedCount} triggers: ${removedTriggers.join(', ')}`);
    ui.alert(successMsg);

  } catch (error) {
    const errorMsg = `❌ ${functionName} failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert(`❌ Remove Triggers Failed!\n\n${error.message}\n\nCheck the execution logs for details.`);
  }
}

/**
 * 🔍 Validate Data Integrity
 * Validates dentist production data integrity across all month tabs
 * This function should be added to utils.gs
 */
function validateDataIntegrity() {
  const functionName = 'validateDataIntegrity';
  const ui = SpreadsheetApp.getUi();
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Starting data integrity validation.');
    Logger.log(`Starting ${functionName}...`);

    // Check configuration
    if (!DENTIST_SHEET_ID || DENTIST_SHEET_ID === 'YOUR_DENTIST_SHEET_ID_HERE') {
      const errMsg = 'Error: DENTIST_SHEET_ID is not configured in config.gs';
      ui.alert(`❌ ${errMsg}`);
      logToDentistSheet_(functionName, 'ERROR', null, null, null, errMsg);
      return;
    }

    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
    const sheets = ss.getSheets();
    
    let validationResults = '🔍 Data Integrity Validation Results:\n\n';
    let totalIssues = 0;
    let sheetsValidated = 0;
    let totalRows = 0;
    let issuesFound = [];

    // Get provider configuration
    let providerConfig = null;
    try {
      providerConfig = getCurrentProviderConfig();
    } catch (providerErr) {
      validationResults += '⚠️ Provider Detection Issue:\n';
      validationResults += `  Could not detect provider: ${providerErr.message}\n\n`;
      totalIssues++;
    }

    // Validate each month tab
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Only validate month tab sheets
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        continue;
      }

      sheetsValidated++;
      validationResults += `📋 ${sheetName}:\n`;

      try {
        const headers = getSheetHeaders_(sheet);
        const mapping = mapHeaders_(headers);
        
        // Check required columns
        const requiredFields = ['date'];
        const missingFields = [];
        
        for (const field of requiredFields) {
          if (mapping[field] === -1) {
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          validationResults += `  ❌ Missing required columns: ${missingFields.join(', ')}\n`;
          issuesFound.push(`${sheetName}: Missing columns - ${missingFields.join(', ')}`);
          totalIssues += missingFields.length;
        } else {
          validationResults += '  ✅ Required columns found\n';
        }

        // Validate data rows
        const data = sheet.getDataRange().getValues();
        let headerRowIndex = -1;
        
        // Find header row
        for (let i = 0; i < Math.min(5, data.length); i++) {
          if (data[i].some(cell => String(cell).toLowerCase().includes('date'))) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          validationResults += '  ❌ No header row found\n';
          issuesFound.push(`${sheetName}: No header row found`);
          totalIssues++;
        } else {
          const dataRows = data.slice(headerRowIndex + 1);
          let emptyDateRows = 0;
          let invalidDateRows = 0;
          let missingUuidRows = 0;
          let validRows = 0;

          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            totalRows++;

            // Check date column
            if (mapping.date !== -1) {
              const dateValue = row[mapping.date];
              if (!dateValue || String(dateValue).trim() === '') {
                emptyDateRows++;
              } else {
                // Try to parse date
                const parsedDate = new Date(dateValue);
                if (isNaN(parsedDate.getTime())) {
                  invalidDateRows++;
                } else {
                  validRows++;
                }
              }
            }

            // Check UUID column if it exists
            if (mapping.uuid !== -1) {
              const uuidValue = row[mapping.uuid];
              if (!uuidValue || String(uuidValue).trim() === '') {
                missingUuidRows++;
              }
            }
          }

          // Report data validation results
          if (emptyDateRows > 0) {
            validationResults += `  ⚠️ Empty date rows: ${emptyDateRows}\n`;
            issuesFound.push(`${sheetName}: ${emptyDateRows} empty date rows`);
            totalIssues++;
          }

          if (invalidDateRows > 0) {
            validationResults += `  ❌ Invalid date rows: ${invalidDateRows}\n`;
            issuesFound.push(`${sheetName}: ${invalidDateRows} invalid date rows`);
            totalIssues++;
          }

          if (missingUuidRows > 0) {
            validationResults += `  ⚠️ Missing UUID rows: ${missingUuidRows}\n`;
            issuesFound.push(`${sheetName}: ${missingUuidRows} missing UUID rows`);
          }

          if (validRows > 0) {
            validationResults += `  ✅ Valid data rows: ${validRows}\n`;
          }

          // Check location-specific columns for multi-provider setup
          if (providerConfig) {
            const locationColumns = detectLocationColumns(headers);
            const humbleColumns = locationColumns.humble.columns.length;
            const baytownColumns = locationColumns.baytown.columns.length;
            
            if (humbleColumns === 0 && baytownColumns === 0) {
              validationResults += '  ⚠️ No location-specific columns found\n';
              issuesFound.push(`${sheetName}: No location-specific production columns found`);
              totalIssues++;
            } else {
              validationResults += `  ✅ Location columns: Humble(${humbleColumns}), Baytown(${baytownColumns})\n`;
            }
          }
        }

      } catch (sheetError) {
        validationResults += `  ❌ Validation error: ${sheetError.message}\n`;
        issuesFound.push(`${sheetName}: Validation error - ${sheetError.message}`);
        totalIssues++;
      }

      validationResults += '\n';
    }

    // Summary
    validationResults += '📊 SUMMARY:\n';
    validationResults += `• Sheets validated: ${sheetsValidated}\n`;
    validationResults += `• Total data rows: ${totalRows}\n`;
    validationResults += `• Issues found: ${totalIssues}\n`;
    
    if (providerConfig) {
      validationResults += `• Provider: ${providerConfig.displayName}\n`;
      validationResults += `• Primary clinic: ${providerConfig.primaryClinicConfig.displayName}\n`;
    }

    if (totalIssues === 0) {
      validationResults += '\n🎉 All validation checks passed!';
    } else {
      validationResults += '\n⚠️ Issues found - check details above.';
    }

    Logger.log(`Validation complete: ${totalIssues} issues found across ${sheetsValidated} sheets`);
    logToDentistSheet_(functionName, totalIssues === 0 ? 'SUCCESS' : 'WARNING', totalRows, sheetsValidated, null, 
      `Validation complete: ${totalIssues} issues found. Issues: ${issuesFound.slice(0, 3).join('; ')}${issuesFound.length > 3 ? '...' : ''}`);
    
    ui.alert('Data Integrity Validation', validationResults, ui.ButtonSet.OK);

  } catch (error) {
    const errorMsg = `❌ ${functionName} failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert(`❌ Data Integrity Validation Failed!\n\n${error.message}\n\nCheck the execution logs for details.`);
  }
}

/**
 * 📊 Export Sync Logs
 * Exports sync logs in multiple formats for analysis
 * This function should be added to logging.gs
 */
function exportSyncLogs() {
  const functionName = 'exportSyncLogs';
  const ui = SpreadsheetApp.getUi();
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Starting sync log export.');
    Logger.log(`Starting ${functionName}...`);

    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
    const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    if (!logSheet) {
      const noLogMsg = '❌ No sync log sheet found.\n\nLogs may not have been created yet. Run a sync operation first.';
      ui.alert('No Logs Found', noLogMsg, ui.ButtonSet.OK);
      logToDentistSheet_(functionName, 'ERROR', null, null, null, 'No log sheet found');
      return;
    }

    const data = logSheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      const emptyLogMsg = '⚠️ Sync log sheet is empty.\n\nNo log entries to export.';
      ui.alert('Empty Logs', emptyLogMsg, ui.ButtonSet.OK);
      logToDentistSheet_(functionName, 'WARNING', null, null, null, 'Log sheet is empty');
      return;
    }

    // Ask user for export format
    const formatResponse = ui.alert(
      '📊 Export Sync Logs',
      'Choose export format:\n\n' +
      'YES = Create formatted summary sheet\n' +
      'NO = Create CSV export sheet\n' +
      'CANCEL = Cancel export',
      ui.ButtonSet.YES_NO_CANCEL
    );

    if (formatResponse === ui.Button.CANCEL) {
      return;
    }

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    
    if (formatResponse === ui.Button.YES) {
      // Create formatted summary sheet
      const summarySheetName = `Log_Summary_${timestamp}`;
      const summarySheet = ss.insertSheet(summarySheetName);
      
      // Create summary statistics
      const headers = data[0];
      const logEntries = data.slice(1);
      
      // Calculate statistics
      const totalEntries = logEntries.length;
      const successCount = logEntries.filter(row => row[2] === 'SUCCESS').length;
      const errorCount = logEntries.filter(row => row[2] === 'ERROR').length;
      const warningCount = logEntries.filter(row => row[2] === 'WARNING').length;
      
      // Most recent entries (last 20)
      const recentEntries = logEntries.slice(-20);
      
      // Function statistics
      const functionStats = {};
      logEntries.forEach(row => {
        const funcName = row[1];
        if (!functionStats[funcName]) {
          functionStats[funcName] = { total: 0, success: 0, error: 0 };
        }
        functionStats[funcName].total++;
        if (row[2] === 'SUCCESS') functionStats[funcName].success++;
        if (row[2] === 'ERROR') functionStats[funcName].error++;
      });

      // Write summary
      let currentRow = 1;
      
      // Title and overview
      summarySheet.getRange(currentRow, 1).setValue('🦷 DENTIST SYNC LOG SUMMARY');
      summarySheet.getRange(currentRow, 1).setFontSize(16).setFontWeight('bold');
      currentRow += 2;
      
      summarySheet.getRange(currentRow, 1).setValue('📊 OVERVIEW:');
      summarySheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      summarySheet.getRange(currentRow, 1, 5, 2).setValues([
        ['Total Entries:', totalEntries],
        ['Successful:', successCount],
        ['Errors:', errorCount], 
        ['Warnings:', warningCount],
        ['Export Date:', new Date()]
      ]);
      currentRow += 6;
      
      // Function statistics
      summarySheet.getRange(currentRow, 1).setValue('🔧 FUNCTION STATISTICS:');
      summarySheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      summarySheet.getRange(currentRow, 1, 1, 4).setValues([
        ['Function', 'Total Calls', 'Success Rate', 'Error Count']
      ]);
      summarySheet.getRange(currentRow, 1, 1, 4).setFontWeight('bold').setBackground('#f0f0f0');
      currentRow++;
      
      Object.entries(functionStats).forEach(([funcName, stats]) => {
        const successRate = stats.total > 0 ? `${Math.round((stats.success / stats.total) * 100)}%` : '0%';
        summarySheet.getRange(currentRow, 1, 1, 4).setValues([
          [funcName, stats.total, successRate, stats.error]
        ]);
        currentRow++;
      });
      currentRow += 2;
      
      // Recent entries
      summarySheet.getRange(currentRow, 1).setValue('📋 RECENT ENTRIES (Last 20):');
      summarySheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      // Headers for recent entries
      summarySheet.getRange(currentRow, 1, 1, headers.length).setValues([headers]);
      summarySheet.getRange(currentRow, 1, 1, headers.length).setFontWeight('bold').setBackground('#f0f0f0');
      currentRow++;
      
      // Recent entries data
      if (recentEntries.length > 0) {
        summarySheet.getRange(currentRow, 1, recentEntries.length, headers.length).setValues(recentEntries);
      }
      
      // Format the sheet
      summarySheet.autoResizeColumns(1, headers.length);
      
      const successMsg = `✅ Log Summary Export Complete!\n\n` +
        `• Created sheet: "${summarySheetName}"\n` +
        `• Total entries: ${totalEntries}\n` +
        `• Success rate: ${totalEntries > 0 ? Math.round((successCount / totalEntries) * 100) : 0}%\n` +
        `• Functions analyzed: ${Object.keys(functionStats).length}\n\n` +
        `The summary sheet contains statistics and recent log entries.`;
      
      ui.alert('Export Complete', successMsg, ui.ButtonSet.OK);
      logToDentistSheet_(functionName, 'SUCCESS', totalEntries, 1, null, `Created summary sheet with ${totalEntries} log entries`);
      
    } else {
      // Create CSV export sheet
      const csvSheetName = `Log_CSV_${timestamp}`;
      const csvSheet = ss.insertSheet(csvSheetName);
      
      // Convert to CSV format
      let csvContent = '';
      data.forEach(row => {
        const csvRow = row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return '"' + cellStr.replace(/"/g, '""') + '"';
          }
          return cellStr;
        }).join(',');
        csvContent += csvRow + '\n';
      });
      
      // Add instructions and CSV content to sheet
      csvSheet.getRange(1, 1).setValue('🦷 DENTIST SYNC LOGS - CSV EXPORT');
      csvSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
      
      csvSheet.getRange(3, 1).setValue('📋 Instructions:');
      csvSheet.getRange(3, 1).setFontWeight('bold');
      csvSheet.getRange(4, 1).setValue('1. Copy all content from cell A6 below');
      csvSheet.getRange(5, 1).setValue('2. Paste into a text editor and save as .csv file');
      csvSheet.getRange(6, 1).setValue('3. Delete this sheet when done');
      
      csvSheet.getRange(8, 1).setValue('📊 CSV Content (copy everything below):');
      csvSheet.getRange(8, 1).setFontWeight('bold');
      csvSheet.getRange(9, 1).setValue(csvContent);
      
      // Format
      csvSheet.setColumnWidth(1, 500);
      csvSheet.getRange(9, 1).setWrap(true);
      
      const csvSuccessMsg = `✅ CSV Export Complete!\n\n` +
        `• Created sheet: "${csvSheetName}"\n` +
        `• Log entries: ${data.length - 1}\n` +
        `• Export format: CSV\n\n` +
        `Follow the instructions in the sheet to save as CSV file.`;
      
      ui.alert('CSV Export Complete', csvSuccessMsg, ui.ButtonSet.OK);
      logToDentistSheet_(functionName, 'SUCCESS', data.length - 1, 1, null, `Created CSV export sheet with ${data.length - 1} log entries`);
    }

  } catch (error) {
    const errorMsg = `❌ ${functionName} failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert(`❌ Export Sync Logs Failed!\n\n${error.message}\n\nCheck the execution logs for details.`);
  }
}

/**
 * 🧹 Clear All Logs
 * Clears ALL log entries (different from clearOldLogs which keeps recent entries)
 * This function should be added to logging.gs
 */
function clearAllLogs_() {
  const functionName = 'clearAllLogs_';
  const ui = SpreadsheetApp.getUi();
  
  // Double confirmation for clearing ALL logs
  const confirmResponse = ui.alert(
    '⚠️ Clear ALL Sync Logs',
    'This will DELETE ALL sync log entries permanently.\n\n' +
    'This action cannot be undone!\n\n' +
    'Are you sure you want to continue?',
    ui.ButtonSet.YES_NO
  );

  if (confirmResponse !== ui.Button.YES) {
    return;
  }

  // Second confirmation
  const finalConfirm = ui.alert(
    '🚨 FINAL CONFIRMATION',
    'You are about to delete ALL sync logs permanently.\n\n' +
    'Consider using "Export Logs" first to save a backup.\n\n' +
    'Proceed with clearing ALL logs?',
    ui.ButtonSet.YES_NO
  );

  if (finalConfirm !== ui.Button.YES) {
    return;
  }

  try {
    Logger.log(`Starting ${functionName}...`);

    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
    const logSheet = ss.getSheetByName(DENTIST_LOG_TAB_NAME);
    
    if (!logSheet) {
      const noLogMsg = '✅ No log sheet found - nothing to clear.';
      ui.alert('No Logs Found', noLogMsg, ui.ButtonSet.OK);
      return;
    }

    const totalRows = logSheet.getLastRow();
    
    if (totalRows <= 1) {
      const emptyLogMsg = '✅ Log sheet is already empty - nothing to clear.';
      ui.alert('Already Empty', emptyLogMsg, ui.ButtonSet.OK);
      return;
    }

    // Count entries before clearing
    const entriesCount = totalRows - 1; // Subtract header row
    
    // Clear all data except headers
    if (totalRows > 1) {
      logSheet.deleteRows(2, totalRows - 1);
    }
    
    // Log this action (creates a new entry)
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, `Cleared ALL ${entriesCount} log entries`);
    
    const successMsg = `✅ ALL Sync Logs Cleared!\n\n` +
      `• Entries deleted: ${entriesCount}\n` +
      `• Header row preserved\n` +
      `• Action logged\n\n` +
      `The sync log sheet is now empty and ready for new entries.`;

    Logger.log(`Successfully cleared ${entriesCount} log entries`);
    ui.alert('Logs Cleared', successMsg, ui.ButtonSet.OK);

  } catch (error) {
    const errorMsg = `❌ ${functionName} failed: ${error.message}`;
    Logger.log(`${errorMsg}\n${error.stack}`);
    // Can't log to dentist sheet if there was an error with the sheet
    ui.alert(`❌ Clear All Logs Failed!\n\n${error.message}\n\nCheck the execution logs for details.`);
  }
}

/**
 * ===== HELPER FUNCTIONS =====
 * Additional helper functions that support the main missing functions
 */

/**
 * Detect location-specific columns in spreadsheet headers
 * @param {Array} headers - Array of header strings
 * @return {Object} Object with location column mappings
 */
function detectLocationColumns(headers) {
  if (!headers) return { humble: { columns: [] }, baytown: { columns: [] }, total: { columns: [] }, other: { columns: [] } };
  
  const result = {
    humble: { columns: [] },
    baytown: { columns: [] },
    total: { columns: [] },
    other: { columns: [] }
  };

  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = String(header).toLowerCase();
    
    // Check for location patterns
    if (/humble|hum/i.test(headerStr)) {
      result.humble.columns.push({ header: header, index: index });
    } else if (/baytown|bay/i.test(headerStr)) {
      result.baytown.columns.push({ header: header, index: index });
    } else if (/total|combined|overall/i.test(headerStr)) {
      result.total.columns.push({ header: header, index: index });
    } else {
      result.other.columns.push({ header: header, index: index });
    }
  });

  return result;
}