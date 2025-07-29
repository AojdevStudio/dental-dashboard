/**
 * DEBUG EXTERNAL MAPPINGS FUNCTIONALITY
 * 
 * Provides comprehensive debugging capabilities for the external mapping system
 * Helps troubleshoot provider detection and ID resolution issues
 * 
 * @version 1.0.0
 * @requires shared-sync-utils.gs, shared-multi-provider-utils.gs
 */

/**
 * Debug external mappings for the current system
 * Shows resolved vs unresolved mappings and validates external mapping system integrity
 */
function debugExternalMappings() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    Logger.log('🔍 Starting external mappings debug...');
    
    // Get current provider config
    const providerConfig = getCurrentProviderConfig();
    if (!providerConfig) {
      ui.alert(
        '❌ Provider Detection Required',
        'No provider detected for external mapping debug.\n\n' +
        'Please ensure the spreadsheet name contains the provider name.',
        ui.ButtonSet.OK
      );
      return;
    }
    
    // Get system configuration
    const systemConfig = getDentistSyncConfig();
    
    // Test credential resolution
    let credentials = null;
    try {
      credentials = getSyncCredentials('dentist_sync', { skipCache: true });
    } catch (error) {
      Logger.log(`Failed to resolve credentials: ${error.message}`);
    }
    
    // Build debug report
    let debug = '🔍 External Mappings Debug Report\n\n';
    
    // Provider Information
    debug += '👨‍⚕️ PROVIDER INFORMATION:\n';
    debug += `• Display Name: ${providerConfig.displayName}\n`;
    debug += `• Provider Code: ${providerConfig.providerCode}\n`;
    debug += `• Primary Clinic: ${providerConfig.primaryClinicConfig.displayName}\n`;
    debug += `• Primary Clinic Code: ${providerConfig.primaryClinicConfig.clinicCode}\n`;
    debug += `• Detection Method: ${providerConfig.detectionMethod || 'Auto-detected'}\n\n`;
    
    // System Configuration
    debug += '⚙️ SYSTEM CONFIGURATION:\n';
    debug += `• System Name: ${systemConfig.SYSTEM_NAME}\n`;
    debug += `• Primary Clinic Code: ${systemConfig.PRIMARY_CLINIC_CODE}\n`;
    debug += `• Primary Provider Code: ${systemConfig.PRIMARY_PROVIDER_CODE}\n\n`;
    
    // External Mappings Configuration
    debug += '🗺️ CONFIGURED EXTERNAL MAPPINGS:\n';
    const mappings = systemConfig.EXTERNAL_MAPPINGS || {};
    if (Object.keys(mappings).length > 0) {
      Object.entries(mappings).forEach(([extId, type]) => {
        debug += `• ${extId} → ${type}\n`;
      });
    } else {
      debug += '• No external mappings configured\n';
    }
    debug += '\n';
    
    // Credential Resolution Status
    debug += '🔑 CREDENTIAL RESOLUTION:\n';
    if (credentials && credentials.data) {
      debug += '✅ Credentials successfully resolved:\n';
      Object.entries(credentials.data).forEach(([key, value]) => {
        if (key.includes('ID') || key.includes('_id')) {
          debug += `• ${key}: ${value}\n`;
        }
      });
    } else {
      debug += '❌ Failed to resolve credentials\n';
      debug += '• Check database connection\n';
      debug += '• Verify stable codes exist\n';
      debug += '• Check external mappings\n';
    }
    debug += '\n';
    
    // Test Individual Mappings
    debug += '🧪 MAPPING RESOLUTION TESTS:\n';
    
    // Test clinic mapping
    try {
      const clinicTestResult = testClinicMapping_(providerConfig.primaryClinicConfig.clinicCode);
      debug += `• Clinic Mapping (${providerConfig.primaryClinicConfig.clinicCode}): ${clinicTestResult.success ? '✅' : '❌'}\n`;
      if (!clinicTestResult.success) {
        debug += `  Error: ${clinicTestResult.error}\n`;
      }
    } catch (error) {
      debug += `• Clinic Mapping: ❌ Error: ${error.message}\n`;
    }
    
    // Test provider mapping
    try {
      const providerTestResult = testProviderMapping_(providerConfig.providerCode);
      debug += `• Provider Mapping (${providerConfig.providerCode}): ${providerTestResult.success ? '✅' : '❌'}\n`;
      if (!providerTestResult.success) {
        debug += `  Error: ${providerTestResult.error}\n`;
      }
    } catch (error) {
      debug += `• Provider Mapping: ❌ Error: ${error.message}\n`;
    }
    
    // Test external mappings
    Object.entries(mappings).forEach(([extId, type]) => {
      try {
        const extTestResult = testExternalMapping_(extId, type);
        debug += `• External Mapping (${extId}): ${extTestResult.success ? '✅' : '❌'}\n`;
        if (!extTestResult.success) {
          debug += `  Error: ${extTestResult.error}\n`;
        }
      } catch (error) {
        debug += `• External Mapping (${extId}): ❌ Error: ${error.message}\n`;
      }
    });
    
    debug += '\n';
    
    // Recommendations
    debug += '💡 TROUBLESHOOTING RECOMMENDATIONS:\n';
    if (!credentials || !credentials.data) {
      debug += '• Run "Setup Credentials (V2.1)" to configure connection\n';
      debug += '• Verify database connection with "Test Connection"\n';
      debug += '• Check that stable codes exist in database\n';
    }
    
    if (Object.keys(mappings).length === 0) {
      debug += '• External mappings not configured - this is optional\n';
      debug += '• System will use stable codes for ID resolution\n';
    }
    
    debug += '• Use "Test Provider Detection" to verify provider auto-detection\n';
    debug += '• Use "Test Location Credentials" for multi-location debugging\n';
    debug += '• Check Dentist-Sync-Log tab for detailed error information\n';
    
    // Show the debug report
    ui.alert('External Mappings Debug Report', debug, ui.ButtonSet.OK);
    
    // Log to sync log
    logToDentistSheet_('debugExternalMappings', 'SUCCESS', 0, 0, null, 
      `Debug completed for provider: ${providerConfig.displayName}`);
    
    Logger.log('✅ External mappings debug completed successfully');
    
  } catch (error) {
    const errorMsg = `External mappings debug failed: ${error.message}`;
    Logger.log(`❌ ${errorMsg}`);
    
    ui.alert(
      '❌ Debug Error',
      `Failed to debug external mappings:\n\n${error.message}\n\n` +
      'Check execution logs for more details.',
      ui.ButtonSet.OK
    );
    
    // Log error to sync log
    logToDentistSheet_('debugExternalMappings', 'ERROR', 0, 0, null, errorMsg);
  }
}

/**
 * Test clinic mapping resolution
 * @param {string} clinicCode - Clinic code to test
 * @return {object} Test result with success status and error
 */
function testClinicMapping_(clinicCode) {
  try {
    const credentials = getBasicSupabaseCredentials_();
    if (!credentials || !credentials.url || !credentials.key) {
      return { success: false, error: 'No valid credentials available' };
    }
    
    // Test the PostgreSQL function
    const testUrl = `${credentials.url}/rest/v1/rpc/get_clinic_id_by_code`;
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key
      },
      payload: JSON.stringify({ clinic_code_input: clinicCode }),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200) {
      const result = JSON.parse(response.getContentText());
      if (result && result !== null && result !== '') {
        return { success: true, resolvedId: result };
      } else {
        return { success: false, error: 'Clinic code not found in database' };
      }
    } else {
      return { success: false, error: `HTTP ${responseCode}: ${response.getContentText()}` };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test provider mapping resolution
 * @param {string} providerCode - Provider code to test
 * @return {object} Test result with success status and error
 */
function testProviderMapping_(providerCode) {
  try {
    const credentials = getBasicSupabaseCredentials_();
    if (!credentials || !credentials.url || !credentials.key) {
      return { success: false, error: 'No valid credentials available' };
    }
    
    // Test the PostgreSQL function
    const testUrl = `${credentials.url}/rest/v1/rpc/get_provider_id_by_code`;
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key
      },
      payload: JSON.stringify({ provider_code_input: providerCode }),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200) {
      const result = JSON.parse(response.getContentText());
      if (result && result !== null && result !== '') {
        return { success: true, resolvedId: result };
      } else {
        return { success: false, error: 'Provider code not found in database' };
      }
    } else {
      return { success: false, error: `HTTP ${responseCode}: ${response.getContentText()}` };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test external mapping resolution
 * @param {string} externalId - External ID to test
 * @param {string} entityType - Entity type (clinic, provider, location)
 * @return {object} Test result with success status and error
 */
function testExternalMapping_(externalId, entityType) {
  try {
    const credentials = getBasicSupabaseCredentials_();
    if (!credentials || !credentials.url || !credentials.key) {
      return { success: false, error: 'No valid credentials available' };
    }
    
    // Test the PostgreSQL function
    const testUrl = `${credentials.url}/rest/v1/rpc/get_entity_id_by_external_mapping`;
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key
      },
      payload: JSON.stringify({ 
        system_name: 'dentist_sync',
        external_id_input: externalId,
        entity_type_input: entityType
      }),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200) {
      const result = JSON.parse(response.getContentText());
      if (result && result !== null && result !== '') {
        return { success: true, resolvedId: result };
      } else {
        return { success: false, error: 'External mapping not found in database' };
      }
    } else {
      return { success: false, error: `HTTP ${responseCode}: ${response.getContentText()}` };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}