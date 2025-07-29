/**
 * Utility functions for hygiene sync operations
 */

/**
 * Seed missing UUIDs in all month tabs
 * Adds UUIDs to rows that don't have them
 */
function seedMissingUuids() {
  const ui = SpreadsheetApp.getUi();
  let totalSeeded = 0;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Only process month tab sheets
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        continue;
      }
      
      const seededCount = seedSheetUuids_(sheet);
      totalSeeded += seededCount;
      
      if (seededCount > 0) {
        Logger.log(`Seeded ${seededCount} UUIDs in ${sheetName}`);
      }
    }
    
    const message = `✅ UUID seeding complete!\n\nSeeded ${totalSeeded} missing UUIDs across all month tabs.`;
    
    if (totalSeeded > 0) {
      ui.alert(message);
    }
    
    logToHygieneSheet_('seedMissingUuids', 'SUCCESS', totalSeeded, 0, null, `Seeded ${totalSeeded} UUIDs`);
    
  } catch (error) {
    const errorMsg = `❌ Error seeding UUIDs: ${error.message}`;
    ui.alert(errorMsg);
    logToHygieneSheet_('seedMissingUuids', 'ERROR', 0, 0, null, errorMsg);
  }
}

/**
 * Seed UUIDs for a specific sheet
 * @param {Sheet} sheet - The Google Sheet
 * @return {number} Number of UUIDs seeded
 */
function seedSheetUuids_(sheet) {
  try {
    const headerInfo = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headerInfo.headers);
    
    // Skip if no UUID column or no date column
    if (mapping.uuid === -1 || mapping.date === -1) {
      return 0;
    }
    
    const data = sheet.getDataRange().getValues();
    const headerRowIndex = headerInfo.headerRowIndex;
    
    const dataRows = data.slice(headerRowIndex + 1);
    let seededCount = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const actualRowIndex = headerRowIndex + 1 + i + 1; // +1 for 1-based indexing
      
      // Skip empty rows (no date)
      if (!row[mapping.date] || String(row[mapping.date]).trim() === '') {
        continue;
      }
      
      // Check if UUID is missing
      const currentUuid = row[mapping.uuid];
      if (!currentUuid || String(currentUuid).trim() === '') {
        // Generate and insert UUID
        const newUuid = Utilities.getUuid();
        sheet.getRange(actualRowIndex, mapping.uuid + 1).setValue(newUuid);
        seededCount++;
      }
    }
    
    return seededCount;
    
  } catch (error) {
    Logger.log(`Error seeding UUIDs in sheet ${sheet.getName()}: ${error.message}`);
    return 0;
  }
}

/**
 * Validate sheet structure for all month tabs
 * Checks if required columns are present
 */
function validateSheetStructure() {
  const ui = SpreadsheetApp.getUi();
  let validationResults = '🔍 Sheet Structure Validation:\n\n';
  let hasIssues = false;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Only validate month tab sheets
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        continue;
      }
      
      validationResults += `📋 ${sheetName}:\n`;
      
      const headerInfo = getSheetHeaders_(sheet);
      const mapping = mapHeaders_(headerInfo.headers);
      
      // Check required columns
      const requiredFields = ['date', 'hoursWorked', 'verifiedProduction'];
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (mapping[field] === -1) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length === 0) {
        validationResults += '  ✅ All required columns found\n';
      } else {
        validationResults += `  ❌ Missing: ${missingFields.join(', ')}\n`;
        hasIssues = true;
      }
      
      // Check UUID column
      if (mapping.uuid === -1) {
        validationResults += '  ⚠️ No UUID column (will auto-generate)\n';
      } else {
        validationResults += '  ✅ UUID column found\n';
      }
      
      validationResults += '\n';
    }
    
    if (!hasIssues) {
      validationResults += '🎉 All sheets have valid structure!';
    } else {
      validationResults += '⚠️ Some sheets have issues. Check column headers.';
    }
    
    ui.alert(validationResults);
    
  } catch (error) {
    ui.alert(`❌ Validation error: ${error.message}`);
  }
}

/**
 * Get sync statistics
 * Shows summary of synced data using server-side aggregation for scalability
 */
function getSyncStatistics() {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    SpreadsheetApp.getUi().alert('❌ No credentials found. Please run setup first.');
    return;
  }
  
  try {
    const startTime = new Date();
    Logger.log(`Starting sync statistics query for clinic_id: ${credentials.clinicId}`);
    
    // Call PostgreSQL RPC function for server-side aggregation
    const url = `${credentials.url}/rest/v1/rpc/get_hygiene_stats`;
    
    const requestBody = {
      p_clinic_id: credentials.clinicId
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(requestBody)
    });
    
    const queryDuration = new Date() - startTime;
    Logger.log(`Database query completed in ${queryDuration}ms`);
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from RPC function');
      }
      
      // Process aggregated statistics from server
      const monthStats = {};
      let totalRecords = 0;
      let totalProduction = 0;
      
      data.forEach(record => {
        const month = record.month_tab;
        const count = parseInt(record.record_count) || 0;
        const production = parseFloat(record.total_production) || 0;
        
        monthStats[month] = { count: count, production: production };
        totalRecords += count;
        totalProduction += production;
      });
      
      // Build results in same format as original
      let stats = '📊 Sync Statistics:\n\n';
      stats += `Total Records: ${totalRecords}\n`;
      stats += `Total Production: $${totalProduction.toLocaleString()}\n\n`;
      stats += 'By Month:\n';
      
      Object.entries(monthStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, data]) => {
          stats += `  ${month}: ${data.count} records, $${data.production.toLocaleString()}\n`;
        });
      
      stats += `\n⚡ Query executed in ${queryDuration}ms`;
      
      SpreadsheetApp.getUi().alert(stats);
      
      // Log successful operation
      logToHygieneSheet_(
        'getSyncStatistics', 
        'SUCCESS', 
        totalRecords, 
        Object.keys(monthStats).length, 
        null, 
        `Retrieved stats for ${Object.keys(monthStats).length} months in ${queryDuration}ms`
      );
      
    } else {
      const errorMsg = `Failed to fetch statistics: HTTP ${response.getResponseCode()}`;
      Logger.log(`RPC call failed: ${errorMsg}`);
      Logger.log(`Response: ${response.getContentText()}`);
      
      SpreadsheetApp.getUi().alert(`❌ ${errorMsg}`);
      
      logToHygieneSheet_(
        'getSyncStatistics', 
        'ERROR', 
        0, 
        0, 
        null, 
        `RPC call failed: ${errorMsg}`
      );
    }
    
  } catch (error) {
    const errorMsg = `Error getting statistics: ${error.message}`;
    Logger.log(`getSyncStatistics error: ${errorMsg}`);
    Logger.log(`Stack trace: ${error.stack}`);
    
    SpreadsheetApp.getUi().alert(`❌ ${errorMsg}`);
    
    logToHygieneSheet_(
      'getSyncStatistics', 
      'ERROR', 
      0, 
      0, 
      null, 
      errorMsg
    );
  }
}

/**
 * Create a backup of current sheet data
 * Creates a new sheet with current data as backup
 */
function createDataBackup() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '💾 Create Data Backup', 
    'This will create backup sheets of all month tabs.\n\nContinue?', 
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
      let backedUpSheets = 0;
      
      const sheets = ss.getSheets();
      
      for (const sheet of sheets) {
        const sheetName = sheet.getName();
        
        // Only backup month tab sheets
        const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
        if (!isMonthTab) {
          continue;
        }
        
        // Create backup copy
        const backupName = `BACKUP_${timestamp}_${sheetName}`;
        sheet.copyTo(ss).setName(backupName);
        backedUpSheets++;
      }
      
      ui.alert(`✅ Backup complete!\n\nCreated ${backedUpSheets} backup sheets with timestamp: ${timestamp}`);
      logToHygieneSheet_('createDataBackup', 'SUCCESS', 0, backedUpSheets, null, `Created ${backedUpSheets} backup sheets`);
      
    } catch (error) {
      ui.alert(`❌ Backup failed: ${error.message}`);
      logToHygieneSheet_('createDataBackup', 'ERROR', 0, 0, null, `Backup failed: ${error.message}`);
    }
  }
}