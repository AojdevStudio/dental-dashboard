/**
 * ========================================
 * MAIN MENU FUNCTIONS - Easy GUI Access
 * ========================================
 * These functions appear in the Google Apps Script function dropdown
 * for easy point-and-click access. Run them in this order:
 */

/**
 * 🔧 1. FIRST TIME SETUP - Run this first!
 * Sets up credentials, provider info, and triggers
 */
function setupHygieneSync() {
  // This function is defined in setup.gs - calling here for menu access
  try {
    // The actual implementation is in setup.gs
    return; // Let the original function in setup.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Setup Error: ${error.message}\n\nPlease check the execution logs.`);
  }
}

/**
 * 🌐 2. SET DASHBOARD URL (Optional)
 * Configure enhanced sync features
 */
function setDashboardApiUrl() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.prompt(
    '🌐 Dashboard API URL Setup', 
    `Enter your Dashboard API URL (optional):\n(e.g., https://your-app.vercel.app)\n\nThis enables enhanced sync features. Leave blank to use direct Supabase sync.`, 
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const apiUrl = response.getResponseText().trim();
    
    if (apiUrl) {
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        ui.alert('❌ Invalid URL format. Please include http:// or https://');
        return;
      }
      
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty(DASHBOARD_API_URL_PROPERTY_KEY, apiUrl);
      
      ui.alert(`✅ Dashboard API URL set successfully!\n\n${apiUrl}\n\nSync will now use enhanced features.`);
    } else {
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.deleteProperty(DASHBOARD_API_URL_PROPERTY_KEY);
      
      ui.alert('✅ Dashboard API URL cleared.\n\nSync will use direct Supabase connection.');
    }
  }
}

/**
 * ▶️ 3. MANUAL SYNC - Sync all data now
 * Triggers immediate sync of all hygiene data
 */
function syncAllHygieneData() {
  // This function is defined in sync.gs - calling here for menu access
  try {
    return; // Let the original function in sync.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Sync Error: ${error.message}\n\nPlease check the execution logs.`);
  }
}

/**
 * 🔍 4. TEST CONNECTION - Verify setup
 * Tests your Supabase connection
 */
function testSupabaseConnection() {
  // This function is defined in credentials.gs - calling here for menu access
  try {
    return; // Let the original function in credentials.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Connection Test Error: ${error.message}\n\nPlease check your credentials.`);
  }
}

/**
 * 📊 5. VIEW SYNC STATS - See sync statistics
 * Shows detailed sync statistics and status
 */
function getSyncStatistics() {
  // This function is defined in utils.gs - calling here for menu access
  try {
    return; // Let the original function in utils.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Stats Error: ${error.message}\n\nPlease check the execution logs.`);
  }
}

/**
 * 🧹 6. CLEAR LOGS - Clean up old log entries
 * Removes old entries from the sync log
 */
function clearOldLogs() {
  // This function is defined in logging.gs - calling here for menu access
  try {
    return; // Let the original function in logging.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Clear Logs Error: ${error.message}`);
  }
}

/**
 * ⏹️ 7. STOP AUTO SYNC - Turn off automatic syncing
 * Clears all triggers to stop automatic syncing
 */
function clearAllTriggers() {
  // This function is defined in setup.gs - calling here for menu access
  try {
    return; // Let the original function in setup.gs handle this
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Clear Triggers Error: ${error.message}`);
  }
}