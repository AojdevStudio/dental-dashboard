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
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
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
    const headers = getSheetHeaders_(sheet);
    const mapping = mapHeaders_(headers);
    
    // Skip if no UUID column or no date column
    if (mapping.uuid === -1 || mapping.date === -1) {
      return 0;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find header row index
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (data[i].some(cell => String(cell).toLowerCase().includes('date'))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      return 0;
    }
    
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
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    const sheets = ss.getSheets();
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Only validate month tab sheets
      const isMonthTab = MONTH_TAB_PATTERNS.some(pattern => pattern.test(sheetName));
      if (!isMonthTab) {
        continue;
      }
      
      validationResults += `📋 ${sheetName}:\n`;
      
      const headers = getSheetHeaders_(sheet);
      const mapping = mapHeaders_(headers);
      
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
 * Shows summary of synced data
 */
function getSyncStatistics() {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    SpreadsheetApp.getUi().alert('❌ No credentials found. Please run setup first.');
    return;
  }
  
  try {
    // Query Supabase for statistics
    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}?clinic_id=eq.${credentials.clinicId}&select=month_tab,date,verified_production`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      
      // Process statistics
      const monthStats = {};
      let totalRecords = data.length;
      let totalProduction = 0;
      
      data.forEach(record => {
        const month = record.month_tab;
        const production = parseFloat(record.verified_production) || 0;
        
        if (!monthStats[month]) {
          monthStats[month] = { count: 0, production: 0 };
        }
        
        monthStats[month].count++;
        monthStats[month].production += production;
        totalProduction += production;
      });
      
      // Build results
      let stats = '📊 Sync Statistics:\n\n';
      stats += `Total Records: ${totalRecords}\n`;
      stats += `Total Production: $${totalProduction.toLocaleString()}\n\n`;
      stats += 'By Month:\n';
      
      Object.entries(monthStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, data]) => {
          stats += `  ${month}: ${data.count} records, $${data.production.toLocaleString()}\n`;
        });
      
      SpreadsheetApp.getUi().alert(stats);
      
    } else {
      SpreadsheetApp.getUi().alert(`❌ Failed to fetch statistics: ${response.getResponseCode()}`);
    }
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Error getting statistics: ${error.message}`);
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
      const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
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