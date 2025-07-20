/**
 * Sets up dentist sync: stores credentials, ensures log sheet, creates triggers.
 */
function setupDentistSync() {
  const functionName = 'setupDentistSync';
  const ss = SpreadsheetApp.openById(getDentistSheetId());
  const ui = SpreadsheetApp.getUi();

  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Setup process initiated.');
    Logger.log(`Starting ${functionName} for Sheet ID: ${getDentistSheetId()}...`);

    // Sheet ID is now dynamic - getDentistSheetId() gets the current active spreadsheet

    // Ensure Log Sheet exists
    ensureLogSheet_();

    // Ensure credentials are set
    const credentials = getSupabaseCredentials_();
    if (!credentials) {
      Logger.log('Credentials not found, attempting to set them...');
      if (!setSupabaseCredentials_()) {
        Logger.log('Credential setup cancelled or failed.');
        logToDentistSheet_(functionName, 'ERROR', null, null, null, 'Credential setup cancelled or failed.');
        return;
      }
      // Re-fetch credentials if they were just set
      if (!getSupabaseCredentials_()) {
        const errMsg = '❌ Setup failed: Could not retrieve credentials after setting them.';
        Logger.log(errMsg);
        logToDentistSheet_(functionName, 'ERROR', null, null, null, errMsg);
        ui.alert(errMsg);
        return;
      }
      Logger.log('Credentials successfully set.');
    }

    // Ensure provider information is set - now with auto-discovery
    let providerInfo = getProviderInfo_();
    if (!providerInfo) {
      Logger.log('Provider information not found, attempting auto-discovery...');
      
      // Try auto-discovery first
      try {
        const autoDetected = autoDetectProvider(getDentistSheetId());
        if (autoDetected && autoDetected.confidence >= 0.7) {
          Logger.log(`Auto-discovery successful: ${autoDetected.displayName}`);
          
          // Store auto-discovered provider info
          const discovered = {
            providerId: autoDetected.databaseProvider?.id || 'auto-generated',
            providerCode: autoDetected.providerCode,
            displayName: autoDetected.displayName,
            externalId: autoDetected.externalId,
            primaryClinic: autoDetected.primaryClinic,
            source: autoDetected.source,
            confidence: autoDetected.confidence
          };
          
          // Store in properties for future use
          PropertiesService.getScriptProperties().setProperty(
            'AUTO_DETECTED_PROVIDER',
            JSON.stringify(discovered)
          );
          
          providerInfo = discovered;
          Logger.log('Auto-detected provider information stored.');
        }
      } catch (autoError) {
        Logger.log(`Auto-discovery failed: ${autoError.message}`);
      }
      
      // Fallback to manual setup if auto-discovery didn't work
      if (!providerInfo) {
        Logger.log('Auto-discovery failed, falling back to manual setup...');
        if (!setProviderInfo_()) {
          Logger.log('Provider setup cancelled or failed.');
          logToDentistSheet_(functionName, 'ERROR', null, null, null, 'Provider setup cancelled or failed.');
          return;
        }
        Logger.log('Provider information successfully set manually.');
      }
    }

    // Test connection
    try {
      testSupabaseConnection();
    } catch (testErr) {
      Logger.log(`Warning: Connection test failed: ${testErr.message}`);
      // Continue with setup - user will see the test results
    }

    // Setup triggers
    Logger.log('Setting up triggers...');
    
    // 1. Time-Driven Trigger (runs every 6 hours)
    deleteTriggersByHandler_(SYNC_FUNCTION_NAME, ss);
    ScriptApp.newTrigger(SYNC_FUNCTION_NAME)
      .timeBased()
      .everyHours(6)
      .create();
    Logger.log('Time-driven trigger created.');

    // 2. onEdit Trigger
    deleteTriggersByHandler_(ON_EDIT_FUNCTION_NAME, ss);
    ScriptApp.newTrigger(ON_EDIT_FUNCTION_NAME)
      .forSpreadsheet(ss)
      .onEdit()
      .create();
    Logger.log('onEdit trigger created.');

    // Setup auto-discovery system
    Logger.log('Setting up auto-discovery system...');
    const discoverySetup = setupAutoDiscoverySystem();
    
    // Seed Missing UUIDs
    seedMissingUuids();

    Logger.log(`${functionName} completed successfully. Triggers created for Sheet ID: ${getDentistSheetId()}.`);
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 'Setup complete. Triggers created.');
    
    // Enhanced success message with auto-discovery info
    let successMessage = '🎉 Dentist Sync Setup Successful!\n\n✅ Credentials stored\n✅ Log sheet created\n✅ Triggers set up\n✅ UUIDs seeded\n';
    
    if (discoverySetup.success) {
      successMessage += `✅ Auto-discovery configured (${discoverySetup.providersDiscovered} providers)\n`;
      if (discoverySetup.currentProviderDetected) {
        successMessage += `✅ Current provider detected: ${discoverySetup.detectedProvider}\n`;
      } else {
        successMessage += `⚠️ Current provider not auto-detected - may need registration\n`;
      }
    } else {
      successMessage += `⚠️ Auto-discovery setup had issues (check logs)\n`;
    }
    
    successMessage += '\nYour dentist production data will now sync automatically!';
    
    ui.alert(successMessage);

  } catch (err) {
    const errorMsg = `${functionName} failed: ${err.message}`;
    Logger.log(`${errorMsg}\n${err.stack}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, errorMsg);
    ui.alert('❌ Dentist Sync Setup FAILED!\n\nCheck Execution Logs and Dentist-Sync-Log tab for details.');
  }
}

/**
 * Clear all triggers (utility function)
 */
function clearAllTriggers() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('⚠️ Clear All Triggers', 
    'Are you sure you want to delete ALL triggers for this script?\n\nThis will stop automatic syncing.', 
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    ui.alert('✅ All triggers cleared.\n\nTo re-enable automatic sync, run "1. Setup Sync" again.');
    logToDentistSheet_('clearAllTriggers', 'SUCCESS', null, null, null, `Cleared ${triggers.length} triggers.`);
  }
}

/**
 * Get provider information from the current detection system
 * @return {Object|null} Provider information or null if not detected
 */
function getProviderInfo_() {
  try {
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const detected = detectCurrentProvider(spreadsheetId);
    
    if (detected && detected.providerCode) {
      return {
        providerCode: detected.providerCode,
        externalId: detected.externalId || detected.providerCode.toUpperCase() + '_PROVIDER',
        displayName: detected.displayName,
        primaryClinic: detected.primaryClinic || detected.preferredClinic,
        confidence: detected.confidence || 1.0,
        source: detected.source || 'static-pattern'
      };
    }
    
    return null;
    
  } catch (error) {
    Logger.log(`getProviderInfo_ failed: ${error.message}`);
    return null;
  }
}

/**
 * Delete triggers by function name
 * @param {string} functionName - Name of the function to delete triggers for
 * @param {Spreadsheet} ss - The spreadsheet object
 */
function deleteTriggersByHandler_(functionName, ss) {
  const triggers = ScriptApp.getProjectTriggers();
  let deletedCount = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === functionName) {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      } catch (err) {
        Logger.log(`Warning: Could not delete trigger for ${functionName}: ${err.message}`);
      }
    }
  });
  
  if (deletedCount > 0) {
    Logger.log(`Deleted ${deletedCount} existing triggers for ${functionName}`);
  }
}

/**
 * Setup auto-discovery system as part of initial setup
 */
function setupAutoDiscoverySystem() {
  const functionName = 'setupAutoDiscoverySystem';
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 'Setting up auto-discovery system');
    
    // Initialize discovery cache
    clearAutoDiscoveryCache();
    
    // Discover providers from database and cache them
    const discovered = discoverProvidersFromDatabase(true); // Force refresh
    Logger.log(`Auto-discovery setup: discovered ${discovered.length} providers`);
    
    // Update provider patterns from database
    const updatedPatterns = updateProviderPatternsFromDatabase();
    const patternCount = Object.keys(updatedPatterns).length;
    Logger.log(`Auto-discovery setup: ${patternCount} provider patterns available`);
    
    // Test auto-discovery with current spreadsheet
    const spreadsheetId = getDentistSheetId();
    const autoDetected = autoDetectProvider(spreadsheetId);
    
    if (autoDetected) {
      Logger.log(`Auto-discovery setup: successfully detected ${autoDetected.displayName} for current spreadsheet`);
    } else {
      Logger.log('Auto-discovery setup: no provider auto-detected for current spreadsheet (may require registration)');
    }
    
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Auto-discovery setup complete: ${discovered.length} providers, ${patternCount} patterns`);
    
    return {
      success: true,
      providersDiscovered: discovered.length,
      patternsAvailable: patternCount,
      currentProviderDetected: !!autoDetected,
      detectedProvider: autoDetected?.displayName || null
    };
    
  } catch (error) {
    Logger.log(`Auto-discovery setup failed: ${error.message}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Auto-discovery setup failed: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate auto-discovery system configuration
 * @return {Object} Validation results
 */
function validateAutoDiscoverySetup() {
  const validation = {
    isValid: true,
    issues: [],
    recommendations: [],
    systemStatus: {}
  };
  
  try {
    // Check database connection
    try {
      const credentials = getSyncCredentials('dentist_sync');
      if (!credentials) {
        validation.issues.push('Database credentials not configured');
        validation.isValid = false;
      } else {
        validation.systemStatus.databaseConnection = 'Available';
      }
    } catch (error) {
      validation.issues.push(`Database connection issue: ${error.message}`);
      validation.isValid = false;
    }
    
    // Check provider discovery
    try {
      const discovered = discoverProvidersFromDatabase();
      validation.systemStatus.providersDiscovered = discovered.length;
      
      if (discovered.length === 0) {
        validation.issues.push('No providers found in database');
        validation.recommendations.push('Ensure providers are properly configured in database');
      }
    } catch (error) {
      validation.issues.push(`Provider discovery failed: ${error.message}`);
      validation.isValid = false;
    }
    
    // Check pattern generation
    try {
      const patterns = getAllProviderPatterns();
      validation.systemStatus.patternsAvailable = Object.keys(patterns).length;
    } catch (error) {
      validation.issues.push(`Pattern generation failed: ${error.message}`);
      validation.isValid = false;
    }
    
    // Check current spreadsheet detection
    try {
      const spreadsheetId = getDentistSheetId();
      const detected = autoDetectProvider(spreadsheetId);
      validation.systemStatus.currentSpreadsheetDetected = !!detected;
      
      if (detected) {
        validation.systemStatus.detectedProvider = detected.displayName;
        validation.systemStatus.detectionConfidence = detected.confidence;
      } else {
        validation.recommendations.push('Current spreadsheet provider not detected - consider registration');
      }
    } catch (error) {
      validation.issues.push(`Current spreadsheet detection failed: ${error.message}`);
    }
    
    // Check cache status
    if (providerCache.isValid()) {
      validation.systemStatus.cacheStatus = 'Valid';
    } else {
      validation.systemStatus.cacheStatus = 'Expired';
      validation.recommendations.push('Consider refreshing provider cache');
    }
    
  } catch (error) {
    validation.issues.push(`Validation process failed: ${error.message}`);
    validation.isValid = false;
  }
  
  return validation;
}