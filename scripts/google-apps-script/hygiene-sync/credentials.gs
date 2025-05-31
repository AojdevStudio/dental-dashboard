/**
 * Retrieves Supabase credentials from Script Properties.
 * @return {object|null} An object containing { url, key, clinicId } or null if not set.
 */
function getSupabaseCredentials_() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const url = scriptProperties.getProperty(SUPABASE_URL_PROPERTY_KEY);
  const key = scriptProperties.getProperty(SUPABASE_KEY_PROPERTY_KEY);
  const clinicId = scriptProperties.getProperty(CLINIC_ID_PROPERTY_KEY);

  if (!url || !key || !clinicId) {
    Logger.log('Supabase credentials not complete in Script Properties. Run Setup.');
    return null;
  }
  return { url: url, key: key, clinicId: clinicId };
}

/**
 * Prompts the user for Supabase credentials and stores them securely.
 * @return {boolean} True if credentials were set successfully, false otherwise.
 */
function setSupabaseCredentials_() {
  const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
  const ui = SpreadsheetApp.getUi();

  // Step 1: Dashboard API URL (optional, preferred)
  const dashboardResponse = ui.prompt(
    '🔧 Hygiene Sync Setup - Step 1/4', 
    `Enter your Dashboard API URL (optional but recommended):\n(e.g., https://your-app.vercel.app)\n\nThis allows better provider creation. Leave blank to use Supabase direct.`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (dashboardResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const dashboardApiUrl = dashboardResponse.getResponseText().trim();

  // Step 2: Supabase Project URL
  const urlResponse = ui.prompt(
    '🔧 Hygiene Sync Setup - Step 2/4', 
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
    '🔧 Hygiene Sync Setup - Step 2/3', 
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
    '🔧 Hygiene Sync Setup - Step 3/3', 
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

  // Store credentials
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(SUPABASE_URL_PROPERTY_KEY, tempUrl);
  scriptProperties.setProperty(SUPABASE_KEY_PROPERTY_KEY, tempKey);
  scriptProperties.setProperty(CLINIC_ID_PROPERTY_KEY, tempClinicId);

  Logger.log('Hygiene sync credentials stored successfully.');
  ui.alert('✅ Credentials stored successfully!\n\nNext: Provider information will be collected.');
  return true;
}

/**
 * Retrieves provider information from Script Properties.
 * @return {object|null} An object containing provider info or null if not set.
 */
function getProviderInfo_() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const providerId = scriptProperties.getProperty(PROVIDER_ID_PROPERTY_KEY);
  const dataSourceId = scriptProperties.getProperty(DATA_SOURCE_ID_PROPERTY_KEY);

  // Provider ID is optional during initial setup - we can create one later
  return { 
    providerId: providerId || null, 
    dataSourceId: dataSourceId || null 
  };
}

/**
 * Prompts the user for provider information and stores it.
 * @return {boolean} True if provider info was set successfully, false otherwise.
 */
function setProviderInfo_() {
  const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
  const ui = SpreadsheetApp.getUi();

  // Get clinic info for context
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    ui.alert('❌ Please set up credentials first.');
    return false;
  }

  // Step 1: Provider Information
  const providerResponse = ui.prompt(
    '👩‍⚕️ Provider Setup - Step 1/4', 
    `Hi! Let's set up your provider information.\n\nWhat's your FIRST NAME?\n(This will be used to identify your hygiene production data)`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (providerResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const firstName = providerResponse.getResponseText().trim();
  if (!firstName) {
    ui.alert('❌ First name cannot be empty. Please try setup again.');
    return false;
  }

  // Step 2: Last Name
  const lastNameResponse = ui.prompt(
    '👩‍⚕️ Provider Setup - Step 2/4', 
    `What's your LAST NAME?`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (lastNameResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const lastName = lastNameResponse.getResponseText().trim();
  if (!lastName) {
    ui.alert('❌ Last name cannot be empty. Please try setup again.');
    return false;
  }

  // Step 3: Position
  const positionResponse = ui.prompt(
    '👩‍⚕️ Provider Setup - Step 3/4', 
    `What's your position/role?\n(e.g., "hygienist", "dentist", "assistant")`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (positionResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const position = positionResponse.getResponseText().trim();
  if (!position) {
    ui.alert('❌ Position cannot be empty. Please try setup again.');
    return false;
  }

  // Step 4: Email (optional)
  const emailResponse = ui.prompt(
    '👩‍⚕️ Provider Setup - Step 4/4', 
    `What's your email? (Optional)\n(Leave blank if you prefer not to provide it)`, 
    ui.ButtonSet.OK_CANCEL
  );
  if (emailResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const email = emailResponse.getResponseText().trim();

  // Now create the provider in the database
  try {
    const providerData = {
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`,
      position: position,
      email: email || null,
      providerType: position.toLowerCase().includes('hygienist') ? 'hygienist' : 
                   position.toLowerCase().includes('dentist') ? 'dentist' : 'other',
      clinicId: credentials.clinicId
    };

    // Try to create provider via API
    const providerId = createProviderInDatabase_(providerData, credentials);
    
    if (providerId) {
      // Store the provider ID
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty(PROVIDER_ID_PROPERTY_KEY, providerId);
      
      Logger.log(`Provider created successfully with ID: ${providerId}`);
      ui.alert(`✅ Provider setup complete!\n\nWelcome ${firstName} ${lastName}!\nYour data will now be tracked under your name.`);
      return true;
    } else {
      // Provider creation failed - offer alternatives
      const response = ui.alert(
        '⚠️ Provider Creation Failed',
        `Could not create provider in database.\n\nWould you like to:\n• Continue without provider tracking (sync will still work)\n• Try manual provider ID entry\n• Cancel setup`,
        ui.ButtonSet.YES_NO_CANCEL
      );
      
      if (response === ui.Button.YES) {
        // Continue without provider tracking
        Logger.log('User chose to continue without provider tracking');
        ui.alert(`✅ Setup complete without provider tracking!\n\nWelcome ${firstName} ${lastName}!\nSync will work but won't track specific provider data.`);
        return true;
      } else if (response === ui.Button.NO) {
        // Try manual provider ID entry
        const manualIdResponse = ui.prompt(
          '🔧 Manual Provider ID',
          'Enter your existing Provider ID from the database\n(or leave blank to skip provider tracking):',
          ui.ButtonSet.OK_CANCEL
        );
        
        if (manualIdResponse.getSelectedButton() === ui.Button.OK) {
          const manualId = manualIdResponse.getResponseText().trim();
          if (manualId) {
            const scriptProperties = PropertiesService.getScriptProperties();
            scriptProperties.setProperty(PROVIDER_ID_PROPERTY_KEY, manualId);
            Logger.log(`Manual provider ID set: ${manualId}`);
            ui.alert(`✅ Manual provider ID set!\n\nProvider ID: ${manualId}\nSync will now track your provider data.`);
          } else {
            Logger.log('User skipped provider tracking');
            ui.alert(`✅ Setup complete without provider tracking!\nSync will work but won't track specific provider data.`);
          }
          return true;
        } else {
          Logger.log('User cancelled manual provider ID entry');
          return false;
        }
      } else {
        // Cancel setup
        Logger.log('User cancelled provider setup');
        return false;
      }
    }

  } catch (error) {
    Logger.log(`Error creating provider: ${error.message}`);
    
    // Offer to continue without provider tracking
    const response = ui.alert(
      '❌ Provider Setup Error',
      `Error: ${error.message}\n\nWould you like to continue without provider tracking?\n(Sync will still work)`,
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      Logger.log('User chose to continue despite provider setup error');
      ui.alert(`✅ Setup complete without provider tracking!\nSync will work but won't track specific provider data.`);
      return true;
    } else {
      return false;
    }
  }
}

/**
 * Creates a provider in the database via API call
 * @param {object} providerData - The provider information
 * @param {object} credentials - Supabase credentials
 * @return {string|null} The provider ID if successful, null otherwise
 */
function createProviderInDatabase_(providerData, credentials) {
  try {
    // Get dashboard API URL (Next.js API) instead of Supabase direct access
    const scriptProperties = PropertiesService.getScriptProperties();
    const dashboardApiUrl = scriptProperties.getProperty(DASHBOARD_API_URL_PROPERTY_KEY);
    
    // Use Dashboard API if configured, otherwise fall back to Supabase direct
    const url = dashboardApiUrl ? `${dashboardApiUrl}/api/providers` : `${credentials.url}/rest/v1/providers`;
    const options = {
      method: 'POST',
      headers: {
        'apikey': credentials.key,
        'Authorization': `Bearer ${credentials.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      payload: JSON.stringify({
        name: providerData.name,
        first_name: providerData.firstName,
        last_name: providerData.lastName,
        email: providerData.email,
        provider_type: providerData.providerType,
        position: providerData.position,
        status: 'active',
        clinic_id: providerData.clinicId
      }),
      muteHttpExceptions: true // Get full error details
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseText = response.getContentText();
    const responseCode = response.getResponseCode();
    
    Logger.log(`Provider creation attempt: ${responseCode} - ${responseText}`);
    
    if (responseCode === 201) {
      const result = JSON.parse(responseText);
      const providerId = result[0] ? result[0].id : result.id;
      Logger.log(`Provider created successfully with ID: ${providerId}`);
      return providerId;
    } else {
      Logger.log(`Provider creation failed: ${responseCode} - ${responseText}`);
      
      // Try to provide more helpful error messages
      if (responseCode === 401) {
        SpreadsheetApp.getUi().alert('❌ Authentication Error\n\nYour Supabase credentials may be incorrect or expired. Please run setup again.');
      } else if (responseCode === 403) {
        SpreadsheetApp.getUi().alert('❌ Permission Error\n\nYour Supabase key may not have permission to create providers. Please check your RLS policies.');
      } else if (responseCode === 409) {
        SpreadsheetApp.getUi().alert('❌ Provider Already Exists\n\nA provider with this information may already exist.');
      } else {
        SpreadsheetApp.getUi().alert(`❌ Provider Creation Failed\n\nError ${responseCode}: ${responseText.substring(0, 200)}`);
      }
      
      return null;
    }
  } catch (error) {
    Logger.log(`Error in createProviderInDatabase_: ${error.message}`);
    SpreadsheetApp.getUi().alert(`❌ Provider Creation Error\n\n${error.message}`);
    return null;
  }
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