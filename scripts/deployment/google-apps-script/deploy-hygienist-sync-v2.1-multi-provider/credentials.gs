/**
 * ===== HYGIENIST SYNC CREDENTIALS V2.1 (MULTI-PROVIDER) =====
 * 
 * Dynamic credential management using provider detection and external mapping system
 * Supports multiple hygienists with automatic provider resolution
 * 
 * @version 2.1.0
 * @requires shared-sync-utils.gs
 * @requires shared-multi-provider-utils.gs
 */

/**
 * Get resilient Supabase credentials with automatically resolved IDs
 * This function uses dynamic provider detection instead of hardcoding
 * 
 * @return {object|null} Complete credentials with resolved IDs or null if failed
 */
function getSupabaseCredentials_() {
  const functionName = 'getSupabaseCredentials_';
  
  try {
    // Get dynamic credentials using multi-provider detection
    const spreadsheetId = getHygieneSheetId();
    const credentials = getMultiProviderSyncCredentials(spreadsheetId, {
      systemName: 'hygienist_sync'
    });
    
    if (!credentials) {
      Logger.log(`${functionName}: Failed to get hygienist sync credentials`);
      const providerConfig = getCurrentProviderConfig();
      const providerName = providerConfig ? providerConfig.displayName : 'hygienist';
      
      SpreadsheetApp.getUi().alert(
        'Sync Error', 
        `Could not resolve hygienist sync credentials for ${providerName}.\n\n` +
        'This may be due to:\n' +
        '• Missing Supabase URL/Key in Script Properties\n' +
        '• Database connection issues\n' +
        '• Missing external mapping data\n' +
        '• Provider not found in database\n\n' +
        'Please run "Setup Credentials" from the Hygiene Sync menu.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return null;
    }
    
    // Validate provider-specific data
    if (!credentials.providerId) {
      const providerName = credentials.detectedProvider ? credentials.detectedProvider.displayName : 'hygienist';
      Logger.log(`${functionName}: Provider ID not resolved for ${providerName}`);
      SpreadsheetApp.getUi().alert(
        'Provider Error',
        `Could not resolve provider ID for ${providerName}.\n\n` +
        'This indicates the external mapping system is not properly configured.\n' +
        'Please check the database setup and external mappings.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return null;
    }
    
    // Log successful resolution (without sensitive data)
    Logger.log(`${functionName}: Successfully resolved credentials for ${credentials.detectedProvider.displayName}`);
    Logger.log(`${functionName}: System: ${credentials.systemName}`);
    Logger.log(`${functionName}: Provider type: hygienist`);
    Logger.log(`${functionName}: Multi-provider sync active`);
    
    return credentials;
    
  } catch (error) {
    Logger.log(`${functionName}: Error getting resilient credentials: ${error.message}`);
    SpreadsheetApp.getUi().alert(
      'Credential Error',
      `Failed to get hygienist sync credentials: ${error.message}\n\n` +
      'Please check your setup and try again.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return null;
  }
}

/**
 * Set up basic Supabase credentials (URL and Service Role Key only)
 * The clinic and provider IDs are now resolved automatically using external mappings
 * 
 * @return {boolean} True if credentials were set successfully, false otherwise
 */
function setSupabaseCredentials_() {
  const ui = SpreadsheetApp.getUi();

  // Detect current provider
  const providerConfig = getCurrentProviderConfig();
  const providerName = providerConfig ? providerConfig.displayName : 'hygienist';

  // Introduction
  ui.alert(
    '🔧 Hygiene Sync Setup V2.1',
    `Setting up multi-provider sync\n\n` +
    `Detected Provider: ${providerName}\n\n` +
    'In V2.1, you only need to provide:\n' +
    '• Supabase Project URL\n' +
    '• Service Role Key\n\n' +
    'Clinic and Provider IDs are resolved automatically!',
    ui.ButtonSet.OK
  );

  // Step 1: Supabase Project URL
  const urlResponse = ui.prompt(
    '🔧 Hygiene Sync Setup V2.1 - Step 1/2', 
    'Enter your Supabase Project URL:\n(e.g., https://your-project.supabase.co)\n\n' +
    `📝 This will be used to automatically resolve ${providerName}'s clinic and provider IDs.`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (urlResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempUrl = urlResponse.getResponseText().trim();
  if (!tempUrl.startsWith('https://') || !tempUrl.includes('supabase.co')) {
    ui.alert('❌ Invalid Supabase URL format. Please try setup again.');
    return false;
  }

  // Step 2: Service Role Key
  const keyResponse = ui.prompt(
    '🔧 Hygiene Sync Setup V2.1 - Step 2/2', 
    'Enter your Supabase Service Role Key:\n(This is SECRET - keep confidential!)\n\n' +
    '🔒 This key will access the external mapping system to\n' +
    `automatically resolve ${providerName}'s clinic and provider IDs.`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (keyResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempKey = keyResponse.getResponseText().trim();
  if (!tempKey) {
    ui.alert('❌ Service Role Key cannot be empty. Please try setup again.');
    return false;
  }

  // Store credentials (only URL and key needed now)
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(SUPABASE_URL_PROPERTY_KEY, tempUrl);
  scriptProperties.setProperty(SUPABASE_KEY_PROPERTY_KEY, tempKey);

  Logger.log('Hygienist sync V2.1 credentials stored successfully.');
  
  // Test the new system
  ui.alert(
    '✅ Credentials Stored Successfully!', 
    'Your Supabase URL and Service Role Key have been saved.\n\n' +
    `🔄 Testing automatic ID resolution for ${providerName}...`,
    ui.ButtonSet.OK
  );
  
  // Test the credential resolution
  return testCredentialResolution_();
}

/**
 * Test the new credential resolution system
 * @return {boolean} True if test successful, false otherwise
 */
function testCredentialResolution_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test the new credential system
    const credentials = getSupabaseCredentials_();
    
    if (!credentials) {
      const providerConfig = getCurrentProviderConfig();
      const providerName = providerConfig ? providerConfig.displayName : 'hygienist';
      
      ui.alert(
        '❌ Credential Test Failed',
        `Could not resolve clinic and provider IDs for ${providerName}.\n\n` +
        'This may indicate:\n' +
        '• Database connection issues\n' +
        '• Missing external mapping data for hygienist_sync\n' +
        '• Provider not found in provider database\n' +
        '• External mapping system not seeded\n\n' +
        'Please check the database configuration.',
        ui.ButtonSet.OK
      );
      return false;
    }
    
    // Show successful resolution
    ui.alert(
      '🎉 Credential Test Successful!',
      `Automatic ID resolution working for ${credentials.detectedProvider.displayName}:\n\n` +
      `✓ System: ${credentials.systemName}\n` +
      `✓ Provider: ${credentials.detectedProvider.displayName}\n` +
      `✓ Clinic ID: ${credentials.clinicId ? 'Resolved' : 'Not found'}\n` +
      `✓ Provider ID: ${credentials.providerId ? 'Resolved' : 'Not found'}\n` +
      `✓ Connection: Active\n\n` +
      'Your hygienist sync system is now resilient to database reseeds!',
      ui.ButtonSet.OK
    );
    
    return true;
    
  } catch (error) {
    ui.alert(
      '❌ Credential Test Error',
      `Testing failed: ${error.message}\n\n` +
      'Please check your setup and try again.',
      ui.ButtonSet.OK
    );
    return false;
  }
}

/**
 * Test provider name extraction from spreadsheet
 */
function testProviderNameExtraction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetName = ss.getName();
  
  // Test dynamic provider detection
  const providerConfig = getCurrentProviderConfig();
  const detectedProvider = providerConfig ? providerConfig.displayName : 'Not detected';
  
  SpreadsheetApp.getUi().alert(
    '🧪 Provider Detection Test',
    `Spreadsheet: "${spreadsheetName}"\n\n` +
    `Detected Provider: ${detectedProvider}\n\n` +
    `📝 Note: In V2.1, provider detection is automatic\n` +
    'based on spreadsheet name patterns.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return detectedProvider;
}

/**
 * Test column mapping functionality
 */
function testColumnMapping() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  const providerConfig = getCurrentProviderConfig();
  const providerName = providerConfig ? providerConfig.displayName : 'Unknown';
  
  let debugInfo = '🔍 HYGIENIST COLUMN MAPPING DEBUG\n\n';
  debugInfo += `Provider: ${providerName}\n`;
  debugInfo += `System: ${HYGIENIST_SYNC_CONFIG.SYSTEM_NAME}\n\n`;
  
  // Check a few month tabs
  const testTabs = ['Dec-23', 'Jan-24', 'Feb-24'];
  
  for (const tabName of testTabs) {
    const sheet = sheets.find(s => s.getName() === tabName);
    if (sheet) {
      const headerInfo = getSheetHeaders_(sheet);
      const mapping = mapHeaders_(headerInfo.headers);
      
      debugInfo += `📊 TAB: ${tabName}\n`;
      debugInfo += `Headers: ${JSON.stringify(headerInfo.headers)}\n`;
      debugInfo += `Mapping: ${JSON.stringify(mapping)}\n`;
      debugInfo += `Missing: ${Object.keys(mapping).filter(key => mapping[key] === -1).join(', ')}\n\n`;
      
      // Test first data row
      const data = sheet.getDataRange().getValues();
      if (data.length > 2) { // Skip header rows
        const testRow = data[2]; // Third row (usually first data row)
        debugInfo += `Sample Row: ${JSON.stringify(testRow)}\n`;
        
        // Get credentials for testing
        const credentials = getSupabaseCredentials_();
        if (credentials) {
          const timezone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
          const parsed = parseHygieneRow_(testRow, mapping, tabName, credentials.clinicId, credentials.providerId, 2, timezone);
          debugInfo += `Parsed: ${JSON.stringify(parsed, null, 2)}\n\n`;
        } else {
          debugInfo += `Parsed: Cannot test - credentials not available\n\n`;
        }
      }
      break; // Just test first found tab
    }
  }
  
  SpreadsheetApp.getUi().alert('Column Mapping Debug', debugInfo, SpreadsheetApp.getUi().ButtonSet.OK);
  Logger.log(debugInfo);
}

/**
 * Test the complete credential system with database connection
 */
function testSupabaseConnection() {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    SpreadsheetApp.getUi().alert('❌ No credentials found. Please run setup first.');
    return;
  }

  const providerName = credentials.detectedProvider ? credentials.detectedProvider.displayName : 'hygienist';

  try {
    // Test connection by checking if the table exists
    const url = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}?limit=1`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json',
        'Prefer': 'count=none'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      SpreadsheetApp.getUi().alert(
        '✅ Connection Test Successful!',
        `Database connection working for ${providerName}:\n\n` +
        `• Table: ${SUPABASE_TABLE_NAME}\n` +
        `• System: ${credentials.systemName}\n` +
        `• Clinic ID: ${credentials.clinicId}\n` +
        `• Provider ID: ${credentials.providerId}\n` +
        `• Provider: ${providerName}\n\n` +
        `🔄 Sync system ready for hygienist production data!`
      );
    } else if (responseCode === 404) {
      // Parse the error to give better feedback
      let errorDetail = '';
      try {
        const errorData = JSON.parse(responseText);
        errorDetail = errorData.message || errorData.error || responseText;
      } catch (e) {
        errorDetail = responseText;
      }
      
      SpreadsheetApp.getUi().alert(
        '❌ Table Access Error',
        `Cannot access table: ${SUPABASE_TABLE_NAME}\n\n` +
        `Error: ${errorDetail}\n\n` +
        'Possible solutions:\n' +
        '• Verify table exists in Supabase\n' +
        '• Check table is in public schema\n' +
        '• Verify RLS policies allow access\n' +
        '• Ensure Service Role Key has proper permissions\n' +
        '• Check if hygiene_production table was created'
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '❌ Connection Failed',
        `Response Code: ${responseCode}\n\n` +
        `Response: ${responseText}\n\n` +
        'Please check your Supabase configuration.'
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ Connection Error',
      `Connection test failed: ${error.toString()}\n\n` +
      'Please check your network and try again.'
    );
  }
}

/**
 * Show system information and migration status
 */
function showSystemInfo() {
  const ui = SpreadsheetApp.getUi();
  
  const providerConfig = getCurrentProviderConfig();
  const providerName = providerConfig ? providerConfig.displayName : 'Not detected';
  
  let info = '📊 Hygienist Sync System V2.1 Information\n\n';
  info += `Version: ${MIGRATION_INFO.VERSION}\n`;
  info += `Upgraded: ${MIGRATION_INFO.UPGRADE_DATE}\n`;
  info += `System: ${HYGIENIST_SYNC_CONFIG.SYSTEM_NAME}\n`;
  info += `Provider: ${providerName}\n\n`;
  
  if (providerConfig) {
    info += '🔧 Configuration:\n';
    info += `• Provider Code: ${providerConfig.providerCode}\n`;
    info += `• External ID: ${providerConfig.externalId}\n`;
    info += `• Primary Clinic: ${providerConfig.primaryClinic}\n`;
    info += `• Provider Type: hygienist\n\n`;
  }
  
  info += '🔗 External Mappings:\n';
  for (const [extId, entityType] of Object.entries(HYGIENIST_SYNC_CONFIG.EXTERNAL_MAPPINGS)) {
    info += `• ${extId} → ${entityType}\n`;
  }
  info += '\n';
  
  info += '🛡️ Resilience Features:\n';
  info += '• Dynamic provider detection\n';
  info += '• Automatic ID resolution\n';
  info += '• External mapping system\n';
  info += '• Database reseed protection\n';
  info += '• Multi-provider support\n\n';
  
  info += 'For more details, see the configuration files.';
  
  ui.alert('System Information', info, ui.ButtonSet.OK);
}

/**
 * Compatibility check for shared sync utilities
 */
function checkSharedSyncUtilities() {
  try {
    // Test if shared sync utilities are available
    if (typeof getSyncCredentials === 'function' && 
        typeof getMultiProviderSyncCredentials === 'function' &&
        typeof detectCurrentProvider === 'function') {
      
      const providerConfig = getCurrentProviderConfig();
      const providerName = providerConfig ? providerConfig.displayName : 'hygienist';
      
      SpreadsheetApp.getUi().alert(
        '✅ All Required Utilities Available',
        `The shared sync utilities and multi-provider libraries are properly installed.\n\n` +
        `Your hygienist sync system for ${providerName}\n` +
        'is ready for multi-provider operation.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return true;
    } else {
      throw new Error('Functions not found');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ Missing Dependencies',
      'One or more required libraries are not available.\n\n' +
      'Please ensure you have:\n' +
      '1. shared-sync-utils.gs\n' +
      '2. shared-multi-provider-utils.gs\n\n' +
      'Copy these files to your Apps Script project.\n' +
      'The hygienist sync system will not work without these libraries.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
}