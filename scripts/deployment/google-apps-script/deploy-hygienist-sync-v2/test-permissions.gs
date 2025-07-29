/**
 * Test permissions for external_id_mappings table and RPC functions
 */
function testExternalMappingPermissions() {
  const ui = SpreadsheetApp.getUi();
  const credentials = getBasicSupabaseCredentials_();
  
  if (!credentials) {
    ui.alert('❌ No credentials found. Please run setup first.');
    return;
  }
  
  let results = '🔍 Testing External Mapping Permissions\n\n';
  
  // Test 1: Direct table access (this is what's failing)
  try {
    const url = `${credentials.url}/rest/v1/external_id_mappings?external_identifier=eq.ADRIANE_CLINIC&entity_type=eq.clinic&is_active=eq.true&select=entity_id`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    results += `1. Direct Table Access:\n`;
    results += `   Status: ${code}\n`;
    results += `   Response: ${text.substring(0, 200)}...\n\n`;
    
  } catch (error) {
    results += `1. Direct Table Access Error: ${error.message}\n\n`;
  }
  
  // Test 2: RPC function access (this should work)
  try {
    const url = `${credentials.url}/rest/v1/rpc/get_entity_id_by_external_mapping`;
    
    const payload = {
      system_name: 'hygienist_sync',
      external_id_input: 'ADRIANE_CLINIC',
      entity_type_input: 'clinic'
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    results += `2. RPC Function Access:\n`;
    results += `   Status: ${code}\n`;
    results += `   Response: ${text}\n\n`;
    
  } catch (error) {
    results += `2. RPC Function Error: ${error.message}\n\n`;
  }
  
  // Test 3: Check if RLS is enabled
  try {
    const url = `${credentials.url}/rest/v1/external_id_mappings?select=*&limit=1`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Prefer': 'count=exact'
      },
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    const headers = response.getHeaders();
    
    results += `3. RLS Check (HEAD request):\n`;
    results += `   Status: ${code}\n`;
    results += `   Content-Range: ${headers['content-range'] || 'Not available'}\n\n`;
    
  } catch (error) {
    results += `3. RLS Check Error: ${error.message}\n\n`;
  }
  
  ui.alert('Permission Test Results', results, ui.ButtonSet.OK);
}

// The onOpen function is defined in menu.gs
// This test function will be added to the menu via menu.gs