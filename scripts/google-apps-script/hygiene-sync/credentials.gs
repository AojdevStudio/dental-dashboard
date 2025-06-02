/**
 * Retrieves Supabase credentials from Script Properties.
 * @return {object|null} An object containing { url, key, clinicId, providerId } or null if not set.
 */
function getSupabaseCredentials_() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();

  // Try user properties first, then script properties for URL and Key
  const url = userProperties.getProperty(SUPABASE_URL_PROPERTY_KEY) || scriptProperties.getProperty(SUPABASE_URL_PROPERTY_KEY);
  const key = userProperties.getProperty(SUPABASE_KEY_PROPERTY_KEY) || scriptProperties.getProperty(SUPABASE_KEY_PROPERTY_KEY);
  
  // Clinic ID and Provider ID are expected to be in Script Properties primarily
  const clinicId = scriptProperties.getProperty(CLINIC_ID_PROPERTY_KEY);
  const providerId = scriptProperties.getProperty(HYGIENE_PROVIDER_ID_PROPERTY_KEY);

  if (!url || !key || !clinicId || !providerId) {
    Logger.log('Supabase URL, Key, Clinic ID, or Provider ID is not fully set. URL set: ' + !!url + ', Key set: ' + !!key + ', ClinicID set: ' + !!clinicId + ', ProviderID set: ' + !!providerId);
    SpreadsheetApp.getUi().alert('Configuration Error', 'Supabase URL, Key, Clinic ID, or Provider ID is missing. Please run "Set/Update Supabase Credentials & Clinic ID" from the Hygiene Sync menu or check Script Properties.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
  return { url, key, clinicId, providerId };
}


/**
 * Prompts the user for Supabase credentials and stores them securely.
 * @return {boolean} True if credentials were set successfully, false otherwise.
 */
function setSupabaseCredentials_() {
  const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
  const ui = SpreadsheetApp.getUi();

  // Step 1: Supabase Project URL
  const urlResponse = ui.prompt(
    '🔧 Hygiene Sync Setup - Step 1/4',
    `Enter your Supabase Project URL:\n(e.g., https://your-project.supabase.co)`,
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
    '🔧 Hygiene Sync Setup - Step 2/4',
    'Enter your Supabase Service Role Key:\n(This is SECRET - keep confidential!)',
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

  // Step 3: Clinic ID
  const clinicResponse = ui.prompt(
    '🔧 Hygiene Sync Setup - Step 3/4',
    'Enter your Clinic ID from Supabase:\n(Found in your clinics table)',
    ui.ButtonSet.OK_CANCEL
  );
  if (clinicResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempClinicId = clinicResponse.getResponseText().trim();
  if (!tempClinicId) {
    ui.alert('❌ Clinic ID cannot be empty. Please try setup again.');
    return false;
  }

  // Step 4: Provider ID
  const providerResponse = ui.prompt(
    '🔧 Hygiene Sync Setup - Step 4/4',
    'Enter the Provider ID for this sheet:\n(From your Providers table in Supabase, after seeding)',
    ui.ButtonSet.OK_CANCEL
  );
  if (providerResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempProviderId = providerResponse.getResponseText().trim();
  if (!tempProviderId) {
    ui.alert('❌ Provider ID cannot be empty. Please try setup again.');
    return false;
  }

  // Store credentials
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(SUPABASE_URL_PROPERTY_KEY, tempUrl);
  scriptProperties.setProperty(SUPABASE_KEY_PROPERTY_KEY, tempKey);
  scriptProperties.setProperty(CLINIC_ID_PROPERTY_KEY, tempClinicId);
  scriptProperties.setProperty(HYGIENE_PROVIDER_ID_PROPERTY_KEY, tempProviderId);

  Logger.log('Hygiene sync credentials (including Provider ID) stored successfully.');
  ui.alert('✅ Credentials & IDs stored successfully!\n\nAll necessary information for this sheet (URL, Key, Clinic ID, and Provider ID) has been saved.');
  return true;
}

/**
 * Simple test function to show what provider name will be extracted
 * @return {string} The extracted provider name
 */
function testProviderNameExtraction() {
  const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
  const spreadsheetName = ss.getName();
  
  // Use the same extraction function as the mapping
  const cleanName = spreadsheetName
    .replace(/hygiene/gi, '')
    .replace(/production/gi, '')
    .replace(/tracker/gi, '')
    .replace(/data/gi, '')
    .replace(/sheet/gi, '')
    .replace(/dashboard/gi, '')
    .replace(/dr\./gi, '')
    .replace(/\s*-\s*/g, ' ')
    .trim();
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  const providerName = words.length > 0 ? words[0] : 'Unknown';
  
  SpreadsheetApp.getUi().alert(
    '🧪 Provider Name Test',
    `Spreadsheet: "${spreadsheetName}"\n\nExtracted Provider Name: "${providerName}"\n\nThis name will be included in every hygiene production record.`
  );
  
  return providerName;
}

/**
 * Test function to debug column mapping issues
 */
function testColumnMapping() {
  const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
  const sheets = ss.getSheets();
  
  let debugInfo = '🔍 COLUMN MAPPING DEBUG\n\n';
  
  // Check a few month tabs
  const testTabs = ['Dec-23', 'Jan-24', 'Feb-24'];
  
  for (const tabName of testTabs) {
    const sheet = sheets.find(s => s.getName() === tabName);
    if (sheet) {
      const headers = getSheetHeaders_(sheet);
      const mapping = mapHeaders_(headers);
      
      debugInfo += `📊 TAB: ${tabName}\n`;
      debugInfo += `Headers: ${JSON.stringify(headers)}\n`;
      debugInfo += `Mapping: ${JSON.stringify(mapping)}\n`;
      debugInfo += `Missing: ${Object.keys(mapping).filter(key => mapping[key] === -1).join(', ')}\n\n`;
      
      // Test first data row
      const data = sheet.getDataRange().getValues();
      if (data.length > 2) { // Skip header rows
        const testRow = data[2]; // Third row (usually first data row)
        debugInfo += `Sample Row: ${JSON.stringify(testRow)}\n`;
        
        const parsed = parseHygieneRow_(testRow, mapping, tabName, 'test-clinic-id');
        debugInfo += `Parsed: ${JSON.stringify(parsed, null, 2)}\n\n`;
      }
      break; // Just test first found tab
    }
  }
  
  SpreadsheetApp.getUi().alert(debugInfo);
  Logger.log(debugInfo);
}

/**
 * Test Supabase connection
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
      SpreadsheetApp.getUi().alert('✅ Supabase connection successful!\n\nTable: ' + SUPABASE_TABLE_NAME + '\nClinic ID: ' + credentials.clinicId);
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
        '❌ Table not found!\n\n' +
        'Table name: ' + SUPABASE_TABLE_NAME + '\n\n' +
        'Error: ' + errorDetail + '\n\n' +
        'Possible solutions:\n' +
        '1. Check if the table exists in Supabase\n' +
        '2. Ensure the table is in the public schema\n' +
        '3. Try reloading the Supabase project\n' +
        '4. Check if RLS is blocking access'
      );
    } else {
      SpreadsheetApp.getUi().alert('❌ Connection failed!\n\nResponse code: ' + responseCode + '\n\nResponse: ' + responseText);
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Connection error!\n\n' + error.toString());
  }
}

