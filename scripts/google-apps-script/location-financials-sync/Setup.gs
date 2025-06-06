/**
 * ========================================
 * LOCATION FINANCIAL SETUP UTILITIES
 * ========================================
 * Setup wizard and configuration utilities
 * for location-based financial data synchronization
 */

/**
 * Runs the complete setup wizard
 * @returns {boolean} Success status
 */
function runLocationFinancialSetupWizard() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Show welcome message if first time
    if (!hasLocationFinancialWelcomeBeenShown()) {
      showLocationFinancialWelcomeMessage();
      markLocationFinancialWelcomeAsShown();
    }
    
    logLocationFinancialOperation('SETUP_WIZARD', 'Starting setup wizard');
    
    // Step 1: Collect credentials
    const credentials = collectLocationFinancialCredentials();
    if (!credentials) {
      return false; // User cancelled
    }
    
    // Step 2: Validate credentials by testing connection
    ui.alert('🔍 Validating Connection', 'Testing your credentials...', ui.ButtonSet.OK);
    
    const testResult = testLocationFinancialConnectionWithCredentials(credentials);
    if (!testResult.success) {
      ui.alert(
        '❌ Connection Failed', 
        `Could not connect to the API:\n\n${testResult.error}\n\nPlease check your credentials and try again.`,
        ui.ButtonSet.OK
      );
      return false;
    }
    
    // Step 3: Store credentials
    if (!storeLocationFinancialCredentials(credentials)) {
      ui.alert('❌ Setup Failed', 'Could not save credentials. Please try again.', ui.ButtonSet.OK);
      return false;
    }
    
    // Step 4: Set up triggers for automatic sync
    if (SYNC_SCHEDULE.ENABLE_SCHEDULED || SYNC_SCHEDULE.ENABLE_REAL_TIME) {
      const setupTriggers = ui.alert(
        '⏰ Setup Automatic Sync?',
        'Would you like to set up automatic synchronization?\n\n' +
        '• Daily sync at 6 AM\n' +
        '• Real-time sync when you edit the sheet\n\n' +
        'You can change this later in the Advanced menu.',
        ui.ButtonSet.YES_NO
      );
      
      if (setupTriggers === ui.Button.YES) {
        setupLocationFinancialTriggers();
      }
    }
    
    // Step 5: Create log sheet if it doesn't exist
    ensureLocationFinancialLogSheetExists();
    
    // Step 6: Show success message
    logLocationFinancialOperation('SETUP_WIZARD', 'Setup wizard completed successfully');
    
    return true;
    
  } catch (error) {
    logLocationFinancialError('SETUP_WIZARD', 'Setup wizard failed', error);
    SpreadsheetApp.getUi().alert(`❌ Setup Error: ${error.message}`);
    return false;
  }
}

/**
 * Collects credentials from user through dialog prompts
 * @returns {Object|null} Credentials object or null if cancelled
 */
function collectLocationFinancialCredentials() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Step 1: Supabase URL
    const urlResponse = ui.prompt(
      '🌐 Step 1/4: Supabase URL',
      'Enter your Supabase project URL:\n\n' +
      'Example: https://yovbdmjwrrgardkgrenc.supabase.co\n\n' +
      'This can be found in your Supabase project settings.',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (urlResponse.getSelectedButton() !== ui.Button.OK) {
      return null;
    }
    
    const supabaseUrl = urlResponse.getResponseText().trim();
    if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
      ui.alert('❌ Invalid URL', 'Please enter a valid HTTPS URL.', ui.ButtonSet.OK);
      return null;
    }
    
    // Step 2: Supabase Service Role Key
    const keyResponse = ui.prompt(
      '🔑 Step 2/4: Supabase Service Role Key',
      'Enter your Supabase service role key:\n\n' +
      'This is found in your Supabase project settings under API.\n' +
      'It should start with "eyJ..." and be quite long.\n\n' +
      '⚠️ Keep this key secure!',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (keyResponse.getSelectedButton() !== ui.Button.OK) {
      return null;
    }
    
    const supabaseKey = keyResponse.getResponseText().trim();
    if (!supabaseKey) {
      ui.alert('❌ Invalid Key', 'Please enter a valid service role key.', ui.ButtonSet.OK);
      return null;
    }
    
    // Step 3: Clinic ID
    const clinicResponse = ui.prompt(
      '🏥 Step 3/4: Clinic ID',
      'Enter your Clinic ID:\n\n' +
      'This is the unique identifier for your clinic in the database.\n' +
      'Contact your system administrator if you don\'t know this.',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (clinicResponse.getSelectedButton() !== ui.Button.OK) {
      return null;
    }
    
    const clinicId = clinicResponse.getResponseText().trim();
    if (!clinicId) {
      ui.alert('❌ Invalid Clinic ID', 'Please enter a valid clinic ID.', ui.ButtonSet.OK);
      return null;
    }
    
    // Step 4: Data Source ID (optional)
    const dataSourceResponse = ui.prompt(
      '📊 Step 4/4: Data Source ID (Optional)',
      'Enter a Data Source ID (optional):\n\n' +
      'This helps track where the data comes from.\n' +
      'Leave blank to use default: "google-sheets-location-financial-sync"',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (dataSourceResponse.getSelectedButton() !== ui.Button.OK) {
      return null;
    }
    
    const dataSourceId = dataSourceResponse.getResponseText().trim() || 'google-sheets-location-financial-sync';
    
    return {
      supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl,
      supabaseKey: supabaseKey,
      clinicId: clinicId,
      dataSourceId: dataSourceId
    };
    
  } catch (error) {
    logLocationFinancialError('COLLECT_CREDENTIALS', 'Failed to collect credentials', error);
    return null;
  }
}

/**
 * Tests connection with provided credentials
 * @param {Object} credentials - Credentials to test
 * @returns {Object} Test result
 */
function testLocationFinancialConnectionWithCredentials(credentials) {
  try {
    // Store credentials temporarily for testing
    const originalCredentials = getLocationFinancialCredentials();
    storeLocationFinancialCredentials(credentials);
    
    // Run the test
    const testResult = testLocationFinancialApiConnection();
    
    // Restore original credentials if test failed
    if (!testResult.success && originalCredentials.isValid) {
      storeLocationFinancialCredentials(originalCredentials);
    }
    
    return testResult;
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sets up automatic triggers for scheduled and real-time sync
 */
function setupLocationFinancialTriggers() {
  try {
    logLocationFinancialOperation('SETUP_TRIGGERS', 'Setting up automatic triggers');
    
    // Clear existing triggers first
    clearLocationFinancialTriggers();
    
    const triggersCreated = [];
    
    // Create daily trigger if enabled
    if (SYNC_SCHEDULE.ENABLE_SCHEDULED) {
      const dailyTrigger = ScriptApp.newTrigger(LOCATION_FINANCIAL_SYNC_FUNCTION_NAME)
        .timeBased()
        .everyDays(1)
        .atHour(SYNC_SCHEDULE.DAILY_HOUR)
        .create();
      
      triggersCreated.push('Daily sync at ' + SYNC_SCHEDULE.DAILY_HOUR + ':00 AM');
      logLocationFinancialOperation('SETUP_TRIGGERS', 'Created daily trigger', { triggerId: dailyTrigger.getUniqueId() });
    }
    
    // Create edit trigger if enabled
    if (SYNC_SCHEDULE.ENABLE_REAL_TIME) {
      const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
      
      const editTrigger = ScriptApp.newTrigger(LOCATION_FINANCIAL_ON_EDIT_FUNCTION_NAME)
        .onEdit()
        .create();
      
      triggersCreated.push('Real-time sync on sheet edits');
      logLocationFinancialOperation('SETUP_TRIGGERS', 'Created edit trigger', { triggerId: editTrigger.getUniqueId() });
    }
    
    if (triggersCreated.length > 0) {
      SpreadsheetApp.getUi().alert(
        '✅ Triggers Created',
        `The following automatic sync triggers have been set up:\n\n• ${triggersCreated.join('\n• ')}\n\nYour data will now sync automatically!`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    
  } catch (error) {
    logLocationFinancialError('SETUP_TRIGGERS', 'Failed to set up triggers', error);
    SpreadsheetApp.getUi().alert(`❌ Trigger Setup Error: ${error.message}`);
  }
}

/**
 * Clears all location financial triggers
 */
function clearLocationFinancialTriggers() {
  try {
    logLocationFinancialOperation('CLEAR_TRIGGERS', 'Clearing existing triggers');
    
    const triggers = ScriptApp.getProjectTriggers();
    let clearedCount = 0;
    
    triggers.forEach(trigger => {
      const functionName = trigger.getHandlerFunction();
      
      if (functionName === LOCATION_FINANCIAL_SYNC_FUNCTION_NAME || 
          functionName === LOCATION_FINANCIAL_ON_EDIT_FUNCTION_NAME) {
        ScriptApp.deleteTrigger(trigger);
        clearedCount++;
        logLocationFinancialOperation('CLEAR_TRIGGERS', 'Deleted trigger', { 
          functionName: functionName,
          triggerId: trigger.getUniqueId()
        });
      }
    });
    
    if (clearedCount > 0) {
      SpreadsheetApp.getUi().alert(
        '✅ Triggers Cleared',
        `${clearedCount} automatic sync trigger(s) have been removed.\n\nAutomatic synchronization is now disabled.`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        'ℹ️ No Triggers Found',
        'No automatic sync triggers were found to clear.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    
  } catch (error) {
    logLocationFinancialError('CLEAR_TRIGGERS', 'Failed to clear triggers', error);
    SpreadsheetApp.getUi().alert(`❌ Error clearing triggers: ${error.message}`);
  }
}

/**
 * Ensures the log sheet exists
 */
function ensureLocationFinancialLogSheetExists() {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    
    try {
      spreadsheet.getSheetByName(LOCATION_FINANCIAL_LOG_TAB_NAME);
      // Sheet exists, no need to create
    } catch (error) {
      // Sheet doesn't exist, create it
      createLocationFinancialLogSheet(spreadsheet);
      logLocationFinancialOperation('SETUP', 'Created log sheet');
    }
    
  } catch (error) {
    logLocationFinancialError('SETUP', 'Failed to ensure log sheet exists', error);
  }
}

/**
 * Shows welcome message for first-time users
 */
function showLocationFinancialWelcomeMessage() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🎉 Welcome to Location Financial Sync!',
    'This tool will help you automatically sync your location-based financial data to your dashboard database.\n\n' +
    '✨ Features:\n' +
    '• Automatic sync for Baytown and Humble locations\n' +
    '• Real-time updates when you edit data\n' +
    '• Comprehensive error logging and validation\n' +
    '• Case-insensitive column matching\n' +
    '• Batch processing for large datasets\n\n' +
    'Let\'s get you set up! You\'ll need:\n' +
    '• Your Supabase project URL\n' +
    '• Your Supabase service role key\n' +
    '• Your clinic ID\n\n' +
    'Click OK to begin the setup wizard.',
    ui.ButtonSet.OK
  );
}

/**
 * Checks if welcome message has been shown
 * @returns {boolean} True if welcome has been shown
 */
function hasLocationFinancialWelcomeBeenShown() {
  const properties = PropertiesService.getScriptProperties();
  return properties.getProperty(LOCATION_FINANCIAL_WELCOME_SHOWN_PROPERTY_KEY) === 'true';
}

/**
 * Marks welcome message as shown
 */
function markLocationFinancialWelcomeAsShown() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(LOCATION_FINANCIAL_WELCOME_SHOWN_PROPERTY_KEY, 'true');
}

/**
 * Resets all configuration (for troubleshooting)
 */
function resetLocationFinancialConfiguration() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const response = ui.alert(
      '⚠️ Reset Configuration',
      'This will:\n' +
      '• Clear all stored credentials\n' +
      '• Remove all automatic triggers\n' +
      '• Reset welcome status\n\n' +
      'You will need to run setup again.\n\n' +
      'Are you sure you want to continue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
    
    logLocationFinancialOperation('RESET_CONFIG', 'Resetting configuration');
    
    // Clear credentials
    clearLocationFinancialCredentials();
    
    // Clear triggers
    clearLocationFinancialTriggers();
    
    // Reset welcome status
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty(LOCATION_FINANCIAL_WELCOME_SHOWN_PROPERTY_KEY);
    
    ui.alert(
      '✅ Configuration Reset',
      'All configuration has been reset successfully.\n\nYou can now run the setup wizard again.',
      ui.ButtonSet.OK
    );
    
    logLocationFinancialOperation('RESET_CONFIG', 'Configuration reset completed');
    
  } catch (error) {
    logLocationFinancialError('RESET_CONFIG', 'Failed to reset configuration', error);
    SpreadsheetApp.getUi().alert(`❌ Reset Error: ${error.message}`);
  }
}

/**
 * Exports a preview of the data that would be synced
 */
function exportLocationFinancialDataPreview() {
  try {
    logLocationFinancialOperation('EXPORT_PREVIEW', 'Generating data preview');
    
    // Validate data first
    const validation = validateLocationFinancialSheetData();
    
    if (!validation.isValid) {
      SpreadsheetApp.getUi().alert(
        '⚠️ Data Issues Found',
        `Cannot generate preview due to data issues:\n\n${validation.errors.slice(0, 3).join('\n')}\n\n` +
        'Please fix these issues first.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    // Create preview sheet
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    const previewSheetName = 'Data Preview - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MM-dd-HH-mm');
    
    let previewSheet;
    try {
      previewSheet = spreadsheet.insertSheet(previewSheetName);
    } catch (error) {
      SpreadsheetApp.getUi().alert('❌ Could not create preview sheet: ' + error.message);
      return;
    }
    
    // Set up headers
    const headers = [
      'Date',
      'Location',
      'Production',
      'Adjustments', 
      'Write Offs',
      'Patient Income',
      'Insurance Income',
      'Unearned',
      'Source Sheet'
    ];
    
    previewSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = previewSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // Generate preview data
    const previewData = generateLocationFinancialPreviewData();
    
    if (previewData.length > 0) {
      previewSheet.getRange(2, 1, previewData.length, headers.length).setValues(previewData);
      
      // Auto-resize columns
      previewSheet.autoResizeColumns(1, headers.length);
      
      // Activate the preview sheet
      previewSheet.activate();
      
      SpreadsheetApp.getUi().alert(
        '✅ Preview Generated',
        `Data preview created successfully!\n\n` +
        `📊 ${previewData.length} records would be synced\n` +
        `📅 Date range: ${validation.dateRange.start} to ${validation.dateRange.end}\n` +
        `🏢 Locations: ${validation.locations.join(', ')}\n\n` +
        `The preview sheet "${previewSheetName}" is now active.`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      previewSheet.deleteSheet();
      SpreadsheetApp.getUi().alert(
        'ℹ️ No Data Found',
        'No valid financial data found to preview.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    
  } catch (error) {
    logLocationFinancialError('EXPORT_PREVIEW', 'Failed to generate preview', error);
    SpreadsheetApp.getUi().alert(`❌ Preview Error: ${error.message}`);
  }
}

/**
 * Generates preview data for export
 * @returns {Array} 2D array of preview data
 */
function generateLocationFinancialPreviewData() {
  const previewData = [];
  
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    for (const sheet of sheets) {
      const location = detectLocationFromSheetName(sheet.getName());
      
      if (location) {
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        
        if (values.length === 0) continue;
        
        const headerInfo = findLocationFinancialHeaders(values);
        
        if (!headerInfo.found) continue;
        
        // Process each data row
        for (let i = headerInfo.headerRow + 1; i < values.length; i++) {
          const row = values[i];
          
          try {
            const record = transformLocationFinancialRow(row, headerInfo.columnMapping, location);
            
            if (record) {
              previewData.push([
                record.date,
                record.locationName,
                record.production,
                record.adjustments,
                record.writeOffs,
                record.patientIncome,
                record.insuranceIncome,
                record.unearned,
                sheet.getName()
              ]);
            }
            
          } catch (error) {
            // Skip invalid rows in preview
            continue;
          }
        }
      }
    }
    
  } catch (error) {
    logLocationFinancialError('GENERATE_PREVIEW', 'Failed to generate preview data', error);
  }
  
  return previewData;
}