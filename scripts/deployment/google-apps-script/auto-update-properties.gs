/**
 * AUTOMATED GOOGLE APPS SCRIPT PROPERTY UPDATE SYSTEM
 * 
 * Automatically updates Google Apps Script properties with current database IDs
 * Prevents sync failures after database reseeds by maintaining ID synchronization
 * 
 * @version 1.0.0
 * @requires shared-sync-utils.gs
 */

/**
 * Configuration for automatic property updates
 */
const AUTO_UPDATE_CONFIG = {
  // Systems to update
  SYSTEMS: {
    DENTIST_SYNC: 'dentist_sync',
    HYGIENIST_SYNC: 'hygienist_sync'
  },
  
  // Update frequency (in hours)
  UPDATE_FREQUENCY_HOURS: 24,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  
  // Notification settings
  NOTIFY_ON_SUCCESS: false,
  NOTIFY_ON_FAILURE: true,
  
  // Backup settings
  BACKUP_OLD_PROPERTIES: true
};

/**
 * Property mapping definitions for each system
 */
const PROPERTY_MAPPINGS = {
  dentist_sync: {
    'HUMBLE_CLINIC_ID': { type: 'clinic', code: 'KAMDENTAL_HUMBLE' },
    'BAYTOWN_CLINIC_ID': { type: 'clinic', code: 'KAMDENTAL_BAYTOWN' },
    'OBINNA_PROVIDER_ID': { type: 'provider', code: 'obinna_ezeji' },
    'KAMDI_PROVIDER_ID': { type: 'provider', code: 'kamdi_irondi' }
  },
  
  hygienist_sync: {
    'ADRIANE_CLINIC_ID': { type: 'clinic', code: 'KAMDENTAL_BAYTOWN' },
    'ADRIANE_PROVIDER_ID': { type: 'provider', code: 'adriane_fontenot' }
  }
};

/**
 * Main function to update all system properties
 */
function updateAllSystemProperties() {
  const functionName = 'updateAllSystemProperties';
  const ui = SpreadsheetApp.getUi();
  
  try {
    Logger.log('🔄 Starting automatic property update process...');
    
    const results = {
      systems: [],
      totalUpdated: 0,
      totalErrors: 0,
      startTime: new Date(),
      endTime: null
    };
    
    // Update each system
    for (const [systemName, systemKey] of Object.entries(AUTO_UPDATE_CONFIG.SYSTEMS)) {
      try {
        const systemResult = updateSystemProperties(systemKey);
        results.systems.push({
          system: systemName,
          ...systemResult
        });
        
        results.totalUpdated += systemResult.propertiesUpdated;
        if (!systemResult.success) {
          results.totalErrors++;
        }
        
      } catch (error) {
        Logger.log(`❌ Failed to update ${systemName}: ${error.message}`);
        results.systems.push({
          system: systemName,
          success: false,
          propertiesUpdated: 0,
          errors: [error.message]
        });
        results.totalErrors++;
      }
    }
    
    results.endTime = new Date();
    const duration = Math.round((results.endTime.getTime() - results.startTime.getTime()) / 1000);
    
    // Log comprehensive results
    logUpdateResults_(results, duration);
    
    // Show notification if configured
    if (AUTO_UPDATE_CONFIG.NOTIFY_ON_SUCCESS && results.totalErrors === 0) {
      showUpdateNotification_(results, duration, true);
    } else if (AUTO_UPDATE_CONFIG.NOTIFY_ON_FAILURE && results.totalErrors > 0) {
      showUpdateNotification_(results, duration, false);
    }
    
    return results;
    
  } catch (error) {
    const errorMsg = `${functionName} failed: ${error.message}`;
    Logger.log(errorMsg);
    
    if (AUTO_UPDATE_CONFIG.NOTIFY_ON_FAILURE) {
      ui.alert('🚨 Property Update Failed', errorMsg, ui.ButtonSet.OK);
    }
    
    throw error;
  }
}

/**
 * Update properties for a specific system
 * @param {string} systemKey - System identifier (dentist_sync, hygienist_sync)
 * @return {object} Update results
 */
function updateSystemProperties(systemKey) {
  const result = {
    success: false,
    propertiesUpdated: 0,
    errors: [],
    backupCreated: false
  };
  
  try {
    Logger.log(`📋 Updating properties for system: ${systemKey}`);
    
    // Get property mappings for this system
    const mappings = PROPERTY_MAPPINGS[systemKey];
    if (!mappings) {
      throw new Error(`No property mappings found for system: ${systemKey}`);
    }
    
    // Backup existing properties if configured
    if (AUTO_UPDATE_CONFIG.BACKUP_OLD_PROPERTIES) {
      result.backupCreated = backupSystemProperties_(systemKey, mappings);
    }
    
    // Get current credentials (this will resolve IDs using stable codes)
    const credentials = getSyncCredentials(systemKey, { skipCache: true });
    if (!credentials || !credentials.data) {
      throw new Error(`Failed to resolve credentials for system: ${systemKey}`);
    }
    
    // Update each property
    for (const [propertyName, mapping] of Object.entries(mappings)) {
      try {
        let newValue = null;
        
        // Resolve ID based on mapping type
        if (mapping.type === 'clinic') {
          newValue = credentials.data.clinicId || credentials.data[`${mapping.code}_CLINIC_ID`];
        } else if (mapping.type === 'provider') {
          newValue = credentials.data.providerId || credentials.data[`${mapping.code}_PROVIDER_ID`];
        }
        
        if (!newValue) {
          throw new Error(`Could not resolve ${mapping.type} ID for code: ${mapping.code}`);
        }
        
        // Update the property
        PropertiesService.getScriptProperties().setProperty(propertyName, newValue);
        result.propertiesUpdated++;
        
        Logger.log(`✅ Updated ${propertyName}: ${newValue}`);
        
      } catch (error) {
        const errorMsg = `Failed to update property ${propertyName}: ${error.message}`;
        result.errors.push(errorMsg);
        Logger.log(`❌ ${errorMsg}`);
      }
    }
    
    // Determine success
    result.success = result.errors.length === 0;
    
    Logger.log(`📊 System ${systemKey} update complete: ${result.propertiesUpdated} properties updated, ${result.errors.length} errors`);
    
    return result;
    
  } catch (error) {
    result.errors.push(error.message);
    Logger.log(`❌ System ${systemKey} update failed: ${error.message}`);
    return result;
  }
}

/**
 * Backup existing properties before updating
 * @param {string} systemKey - System identifier
 * @param {object} mappings - Property mappings
 * @return {boolean} Success status
 */
function backupSystemProperties_(systemKey, mappings) {
  try {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    const properties = PropertiesService.getScriptProperties();
    
    for (const propertyName of Object.keys(mappings)) {
      const currentValue = properties.getProperty(propertyName);
      if (currentValue) {
        const backupKey = `BACKUP_${timestamp}_${propertyName}`;
        properties.setProperty(backupKey, currentValue);
      }
    }
    
    Logger.log(`💾 Created property backup for ${systemKey} with timestamp: ${timestamp}`);
    return true;
    
  } catch (error) {
    Logger.log(`⚠️ Failed to backup properties for ${systemKey}: ${error.message}`);
    return false;
  }
}

/**
 * Log comprehensive update results
 * @param {object} results - Update results
 * @param {number} duration - Duration in seconds
 */
function logUpdateResults_(results, duration) {
  Logger.log('📊 === PROPERTY UPDATE RESULTS ===');
  Logger.log(`⏱️ Duration: ${duration} seconds`);
  Logger.log(`✅ Total Properties Updated: ${results.totalUpdated}`);
  Logger.log(`❌ Total Systems with Errors: ${results.totalErrors}`);
  Logger.log('');
  
  results.systems.forEach(system => {
    Logger.log(`🔧 ${system.system}:`);
    Logger.log(`   Success: ${system.success ? '✅' : '❌'}`);
    Logger.log(`   Properties Updated: ${system.propertiesUpdated}`);
    if (system.errors && system.errors.length > 0) {
      Logger.log(`   Errors: ${system.errors.join(', ')}`);
    }
    Logger.log('');
  });
  
  Logger.log('='.repeat(40));
}

/**
 * Show update notification to user
 * @param {object} results - Update results
 * @param {number} duration - Duration in seconds
 * @param {boolean} success - Overall success status
 */
function showUpdateNotification_(results, duration, success) {
  const ui = SpreadsheetApp.getUi();
  
  if (success) {
    const message = `✅ Property Update Successful!\n\n` +
                   `• Properties Updated: ${results.totalUpdated}\n` +
                   `• Duration: ${duration} seconds\n` +
                   `• Systems: ${results.systems.map(s => s.system).join(', ')}\n\n` +
                   `All Google Apps Script properties are now synchronized with current database IDs.`;
    
    ui.alert('🔄 Auto-Update Complete', message, ui.ButtonSet.OK);
    
  } else {
    const message = `❌ Property Update Issues Detected!\n\n` +
                   `• Properties Updated: ${results.totalUpdated}\n` +
                   `• Systems with Errors: ${results.totalErrors}\n` +
                   `• Duration: ${duration} seconds\n\n` +
                   `Check execution logs for detailed error information.\n` +
                   `Some sync operations may fail until properties are corrected.`;
    
    ui.alert('🚨 Auto-Update Issues', message, ui.ButtonSet.OK);
  }
}

/**
 * Setup automatic property update trigger
 */
function setupAutoUpdateTrigger() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'updateAllSystemProperties') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger
    ScriptApp.newTrigger('updateAllSystemProperties')
      .timeBased()
      .everyHours(AUTO_UPDATE_CONFIG.UPDATE_FREQUENCY_HOURS)
      .create();
    
    const message = `✅ Auto-Update Trigger Created!\n\n` +
                   `• Function: updateAllSystemProperties\n` +
                   `• Frequency: Every ${AUTO_UPDATE_CONFIG.UPDATE_FREQUENCY_HOURS} hours\n` +
                   `• Next Run: ~${AUTO_UPDATE_CONFIG.UPDATE_FREQUENCY_HOURS} hours from now\n\n` +
                   `Google Apps Script properties will be automatically synchronized with database IDs.`;
    
    ui.alert('🔧 Auto-Update Setup Complete', message, ui.ButtonSet.OK);
    Logger.log('✅ Auto-update trigger created successfully');
    
  } catch (error) {
    const errorMsg = `Failed to setup auto-update trigger: ${error.message}`;
    Logger.log(`❌ ${errorMsg}`);
    ui.alert('🚨 Trigger Setup Failed', errorMsg, ui.ButtonSet.OK);
  }
}

/**
 * Remove automatic property update trigger
 */
function removeAutoUpdateTrigger() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '⚠️ Remove Auto-Update Trigger',
    'This will stop automatic property updates.\n\n' +
    'You will need to manually update properties after database reseeds.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      let deletedCount = 0;
      
      const triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(trigger => {
        if (trigger.getHandlerFunction() === 'updateAllSystemProperties') {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
        }
      });
      
      const message = deletedCount > 0 
        ? `✅ Auto-update trigger removed.\n\nDeleted ${deletedCount} trigger(s).`
        : '✅ No auto-update triggers found to remove.';
      
      ui.alert('🔧 Trigger Removal Complete', message, ui.ButtonSet.OK);
      Logger.log(`✅ Removed ${deletedCount} auto-update triggers`);
      
    } catch (error) {
      const errorMsg = `Failed to remove auto-update trigger: ${error.message}`;
      Logger.log(`❌ ${errorMsg}`);
      ui.alert('🚨 Trigger Removal Failed', errorMsg, ui.ButtonSet.OK);
    }
  }
}

/**
 * Test the property update system without making changes
 */
function testPropertyUpdateSystem() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    Logger.log('🧪 Testing property update system...');
    
    let testResults = '🧪 Property Update System Test\n\n';
    let allTestsPassed = true;
    
    // Test each system
    for (const [systemName, systemKey] of Object.entries(AUTO_UPDATE_CONFIG.SYSTEMS)) {
      testResults += `📋 Testing ${systemName}:\n`;
      
      try {
        // Test credential resolution
        const credentials = getSyncCredentials(systemKey, { skipCache: true, testMode: true });
        
        if (credentials && credentials.data) {
          testResults += `  ✅ Credential resolution: SUCCESS\n`;
          testResults += `  📊 Available IDs: ${Object.keys(credentials.data).length}\n`;
          
          // Test property mappings
          const mappings = PROPERTY_MAPPINGS[systemKey];
          if (mappings) {
            testResults += `  ✅ Property mappings: ${Object.keys(mappings).length} properties\n`;
            
            // Test each mapping
            for (const [propertyName, mapping] of Object.entries(mappings)) {
              const hasRequiredData = credentials.data[`${mapping.code}_${mapping.type.toUpperCase()}_ID`] || 
                                    (mapping.type === 'clinic' && credentials.data.clinicId) ||
                                    (mapping.type === 'provider' && credentials.data.providerId);
              
              if (hasRequiredData) {
                testResults += `    ✅ ${propertyName}: Can be resolved\n`;
              } else {
                testResults += `    ❌ ${propertyName}: Missing data for ${mapping.code}\n`;
                allTestsPassed = false;
              }
            }
          } else {
            testResults += `  ❌ Property mappings: NOT FOUND\n`;
            allTestsPassed = false;
          }
          
        } else {
          testResults += `  ❌ Credential resolution: FAILED\n`;
          allTestsPassed = false;
        }
        
      } catch (error) {
        testResults += `  ❌ Test error: ${error.message}\n`;
        allTestsPassed = false;
      }
      
      testResults += '\n';
    }
    
    // Overall result
    testResults += allTestsPassed 
      ? '✅ All tests passed! Property update system is ready.\n\nRun "Update All Properties Now" to perform actual updates.'
      : '❌ Some tests failed. Check configuration and database setup.\n\nResolve issues before enabling automatic updates.';
    
    ui.alert('🧪 Property Update Test Results', testResults, ui.ButtonSet.OK);
    Logger.log('🧪 Property update system test completed');
    
  } catch (error) {
    const errorMsg = `Property update test failed: ${error.message}`;
    Logger.log(`❌ ${errorMsg}`);
    ui.alert('🚨 Test Failed', errorMsg, ui.ButtonSet.OK);
  }
}

/**
 * Manual trigger to update properties immediately
 */
function updatePropertiesNow() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '🔄 Update Properties Now',
    'This will update all Google Apps Script properties with current database IDs.\n\n' +
    'This is safe to run and will resolve any sync issues caused by database reseeds.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      const results = updateAllSystemProperties();
      Logger.log('✅ Manual property update completed');
      
    } catch (error) {
      const errorMsg = `Manual property update failed: ${error.message}`;
      Logger.log(`❌ ${errorMsg}`);
      ui.alert('🚨 Update Failed', errorMsg, ui.ButtonSet.OK);
    }
  }
}