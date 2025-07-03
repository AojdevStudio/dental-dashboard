/**
 * ===== DENTIST SYNC CREDENTIALS V2.1 (MULTI-PROVIDER) =====
 * 
 * Updated credential management with automatic provider detection
 * Supports any provider with dynamic ID resolution and multi-location sync
 * 
 * IMPORTANT: This version requires both shared-sync-utils.gs and shared-multi-provider-utils.gs
 * 
 * @version 2.1.0
 * @requires shared-sync-utils.gs, shared-multi-provider-utils.gs
 */

/**
 * Get resilient Supabase credentials with automatically detected provider
 * This function replaces the old hard-coded provider system
 * 
 * @return {object|null} Complete credentials with resolved IDs or null if failed
 */
function getSupabaseCredentials_() {
  const functionName = 'getSupabaseCredentials_';
  
  try {
    // Use multi-provider detection to get credentials for current provider
    const credentials = getMultiProviderSyncCredentials(DENTIST_SHEET_ID);
    
    if (!credentials) {
      Logger.log(`${functionName}: Failed to get multi-provider sync credentials`);
      SpreadsheetApp.getUi().alert(
        'Sync Error', 
        'Could not resolve sync credentials automatically.\n\n' +
        'This may be due to:\n' +
        '• Provider not detected from spreadsheet name\n' +
        '• Missing Supabase URL/Key in Script Properties\n' +
        '• Database connection issues\n' +
        '• Missing external mapping data for provider\n' +
        '• Provider not found in database\n\n' +
        'Please run "Setup Credentials" from the Dentist Sync menu.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return null;
    }
    
    // Validate provider detection
    if (!credentials.detectedProvider) {
      Logger.log(`${functionName}: Provider not detected`);
      SpreadsheetApp.getUi().alert(
        'Provider Detection Error',
        'Could not detect which provider this sync is for.\n\n' +
        'Please ensure the spreadsheet name contains the provider name:\n' +
        '• For Dr. Kamdi Irondi: Include "Kamdi" or "Irondi"\n' +
        '• For Dr. Obinna Ezeji: Include "Obinna" or "Ezeji"\n\n' +
        'Example: "Dr Kamdi Irondi Production Tracker"',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return null;
    }
    
    // Validate provider ID resolution
    if (!credentials.providerId) {
      Logger.log(`${functionName}: Provider ID not resolved for ${credentials.detectedProvider.displayName}`);
      SpreadsheetApp.getUi().alert(
        'Provider Error',
        `Could not resolve provider ID for ${credentials.detectedProvider.displayName}.\n\n` +
        'This indicates the external mapping system is not properly configured.\n' +
        'Please check the database setup and external mappings.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return null;
    }
    
    // Log successful resolution (without sensitive data)
    Logger.log(`${functionName}: Successfully resolved credentials for ${credentials.detectedProvider.displayName}`);
    Logger.log(`${functionName}: System: ${credentials.systemName}`);
    Logger.log(`${functionName}: Multi-provider mode: ${credentials.isMultiProvider}`);
    Logger.log(`${functionName}: Primary clinic: ${credentials.detectedProvider.primaryClinic}`);
    
    return credentials;
    
  } catch (error) {
    Logger.log(`${functionName}: Error getting multi-provider credentials: ${error.message}`);
    SpreadsheetApp.getUi().alert(
      'Credential Error',
      `Failed to get sync credentials: ${error.message}\n\n` +
      'Please check your setup and try again.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return null;
  }
}

/**
 * Set up basic Supabase credentials (URL and Service Role Key only)
 * Provider detection and ID resolution happens automatically
 * 
 * @return {boolean} True if credentials were set successfully, false otherwise
 */
function setSupabaseCredentials_() {
  const ui = SpreadsheetApp.getUi();

  // Introduction
  ui.alert(
    '🔧 Dentist Sync Setup V2.1 (Multi-Provider)',
    'Setting up sync with automatic provider detection:\n\n' +
    'In V2.1, you only need to provide:\n' +
    '• Supabase Project URL\n' +
    '• Service Role Key\n\n' +
    'Provider detection and ID resolution happen automatically!',
    ui.ButtonSet.OK
  );

  // Step 1: Supabase Project URL
  const urlResponse = ui.prompt(
    '🔧 Dentist Sync Setup V2.1 - Step 1/2', 
    'Enter your Supabase Project URL:\n(e.g., https://your-project.supabase.co)\n\n' +
    '📝 This will be used to automatically detect and resolve provider IDs.', 
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
    '🔧 Dentist Sync Setup V2.1 - Step 2/2', 
    'Enter your Supabase Service Role Key:\n(This is SECRET - keep confidential!)\n\n' +
    '🔒 This key will access the multi-provider system to\n' +
    'automatically resolve provider and clinic IDs.', 
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

  Logger.log('Multi-provider dentist sync V2.1 credentials stored successfully.');
  
  // Test the new system
  ui.alert(
    '✅ Credentials Stored Successfully!', 
    'Your Supabase URL and Service Role Key have been saved.\n\n' +
    '🔄 Testing automatic provider detection and ID resolution...',
    ui.ButtonSet.OK
  );
  
  // Test the credential resolution
  return testCredentialResolution_();
}

/**
 * Test the new multi-provider credential resolution system
 * @return {boolean} True if test successful, false otherwise
 */
function testCredentialResolution_() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Test the multi-provider credential system
    const credentials = getSupabaseCredentials_();
    
    if (!credentials) {
      ui.alert(
        '❌ Credential Test Failed',
        'Could not resolve provider and clinic IDs automatically.\n\n' +
        'This may indicate:\n' +
        '• Database connection issues\n' +
        '• Provider not detected from spreadsheet name\n' +
        '• Missing external mapping data for provider\n' +
        '• External mapping system not seeded\n\n' +
        'Please check the database configuration.',
        ui.ButtonSet.OK
      );
      return false;
    }
    
    // Validate multi-provider detection
    const detectedProvider = credentials.detectedProvider;
    
    // Show successful resolution
    ui.alert(
      '🎉 Multi-Provider Test Successful!',
      `Automatic provider detection and ID resolution working:\n\n` +
      `✓ Detected Provider: ${detectedProvider.displayName}\n` +
      `✓ Provider Code: ${detectedProvider.providerCode}\n` +
      `✓ System: ${credentials.systemName}\n` +
      `✓ Clinic ID: ${credentials.clinicId ? 'Resolved' : 'Not found'}\n` +
      `✓ Provider ID: ${credentials.providerId ? 'Resolved' : 'Not found'}\n` +
      `✓ Connection: Active\n` +
      `✓ Multi-Provider Mode: ${credentials.isMultiProvider}\n\n` +
      'Your dentist sync system now works with any provider!',
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
 * Get location-specific credentials for multi-location production data
 * @param {string} locationKey - Location key ('humble' or 'baytown')
 * @return {Object|null} Location-specific credentials or null if failed
 */
function getLocationCredentials_(locationKey) {
  try {
    // Get base multi-provider credentials first
    const baseCredentials = getSupabaseCredentials_();
    if (!baseCredentials) {
      throw new Error('Base credentials not available');
    }
    
    // Get location-specific credentials
    const locationCredentials = getLocationCredentials(baseCredentials, locationKey);
    if (!locationCredentials) {
      throw new Error(`Failed to resolve ${locationKey} location credentials`);
    }
    
    Logger.log(`Location credentials resolved for ${locationKey}`);
    return locationCredentials;
    
  } catch (error) {
    Logger.log(`Error getting location credentials for ${locationKey}: ${error.message}`);
    return null;
  }
}

/**
 * Test location-specific credential resolution
 * @param {string} locationKey - Location to test ('humble' or 'baytown')
 */
function testLocationCredentials_(locationKey) {
  try {
    const locationCredentials = getLocationCredentials_(locationKey);
    
    if (locationCredentials) {
      SpreadsheetApp.getUi().alert(
        `✅ Location Test Successful (${locationKey})`,
        `Location-specific credentials resolved:\n\n` +
        `• Location: ${locationCredentials.locationConfig.displayName}\n` +
        `• Clinic ID: ${locationCredentials.locationClinicId}\n` +
        `• Provider: ${locationCredentials.detectedProvider.displayName}\n` +
        `• Location Key: ${locationCredentials.locationKey}\n\n` +
        'Multi-location production sync ready!',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        `❌ Location Test Failed (${locationKey})`,
        `Could not resolve location-specific credentials.\n\n` +
        'Please check the multi-location configuration.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      `❌ Location Test Error (${locationKey})`,
      `Error: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Test the complete multi-provider credential system with database connection
 */
function testSupabaseConnection() {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    SpreadsheetApp.getUi().alert('❌ No credentials found. Please run setup first.');
    return;
  }

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
        `Database connection working for ${credentials.detectedProvider.displayName}:\n\n` +
        `• Table: ${SUPABASE_TABLE_NAME}\n` +
        `• Provider: ${credentials.detectedProvider.displayName}\n` +
        `• Provider Code: ${credentials.detectedProvider.providerCode}\n` +
        `• System: ${credentials.systemName}\n` +
        `• Clinic ID: ${credentials.clinicId}\n` +
        `• Provider ID: ${credentials.providerId}\n` +
        `• Multi-Provider: ${credentials.isMultiProvider}\n\n` +
        `🔄 Sync system ready for ${credentials.detectedProvider.displayName}'s production data!`
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
        `Cannot access table: ${SUPABASE_TABLE_NAME}\\n\\n` +
        `Error: ${errorDetail}\\n\\n` +
        'Possible solutions:\\n' +
        '• Verify table exists in Supabase\\n' +
        '• Check table is in public schema\\n' +
        '• Verify RLS policies allow access\\n' +
        '• Ensure Service Role Key has proper permissions\\n' +
        '• Check if dentist_production table was created'
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '❌ Connection Failed',
        `Response Code: ${responseCode}\\n\\n` +
        `Response: ${responseText}\\n\\n` +
        'Please check your Supabase configuration.'
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ Connection Error',
      `Connection test failed: ${error.toString()}\\n\\n` +
      'Please check your network and try again.'
    );
  }
}

/**
 * Show multi-provider system information and detection status
 */
function showSystemInfo() {
  const ui = SpreadsheetApp.getUi();
  
  let info = '📊 Multi-Provider Dentist Sync System V2.1 Information\\n\\n';
  info += `Version: ${MIGRATION_INFO.VERSION}\\n`;
  info += `Upgraded: ${MIGRATION_INFO.UPGRADE_DATE}\\n`;
  info += `Multi-Provider: ${MIGRATION_INFO.MULTI_PROVIDER}\\n\\n`;
  
  // Try to detect current provider
  try {
    const providerConfig = getCurrentProviderConfig();
    if (providerConfig) {
      info += '🧑‍⚕️ Detected Provider:\\n';
      info += `• Name: ${providerConfig.displayName}\\n`;
      info += `• Code: ${providerConfig.providerCode}\\n`;
      info += `• External ID: ${providerConfig.externalId}\\n`;
      info += `• Primary Clinic: ${providerConfig.primaryClinicConfig.displayName}\\n\\n`;
    } else {
      info += '⚠️ Provider Detection:\\n';
      info += '• Could not detect provider from spreadsheet name\\n';
      info += '• Please ensure spreadsheet name contains provider name\\n\\n';
    }
  } catch (error) {
    info += `❌ Provider Detection Error: ${error.message}\\n\\n`;
  }
  
  info += '🏥 Supported Locations:\\n';
  for (const [key, clinic] of Object.entries(DENTIST_SYNC_CONFIG.CLINICS)) {
    info += `• ${clinic.displayName} (${clinic.clinicCode})\\n`;
  }
  info += '\\n';
  
  info += '🛡️ Resilience Features:\\n';
  info += '• Automatic provider detection\\n';
  info += '• Dynamic ID resolution\\n';
  info += '• External mapping system\\n';
  info += '• Database reseed protection\\n';
  info += '• Multi-location support\\n\\n';
  
  info += 'For more details, see the configuration files.';
  
  ui.alert('Multi-Provider System Information', info, ui.ButtonSet.OK);
}

/**
 * Compatibility check for multi-provider utilities
 */
function checkMultiProviderDependencies() {
  try {
    // Test if shared sync utilities are available
    if (typeof getSyncCredentials !== 'function') {
      throw new Error('shared-sync-utils.gs not found');
    }
    
    // Test if multi-provider utilities are available
    if (typeof getMultiProviderSyncCredentials !== 'function') {
      throw new Error('shared-multi-provider-utils.gs not found');
    }
    
    // Test if provider detection functions are available
    if (typeof detectCurrentProvider !== 'function') {
      throw new Error('Provider detection functions not available');
    }
    
    SpreadsheetApp.getUi().alert(
      '✅ Multi-Provider Dependencies Available',
      'All required dependencies are properly installed:\\n\\n' +
      '• shared-sync-utils.gs: ✓\\n' +
      '• shared-multi-provider-utils.gs: ✓\\n' +
      '• Provider detection functions: ✓\\n\\n' +
      'Your multi-provider dentist sync system is ready for operation.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return true;
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ Missing Dependencies',
      `Required dependencies are not available: ${error.message}\\n\\n` +
      'Please ensure you have copied these files to your Apps Script project:\\n' +
      '1. shared-sync-utils.gs\\n' +
      '2. shared-multi-provider-utils.gs\\n' +
      '3. Save and refresh the project\\n' +
      '4. Try this test again\\n\\n' +
      'The multi-provider sync system will not work without these libraries.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return false;
  }
}