/**
 * Retrieves Supabase URL and Service Role Key from Script Properties.
 * @return {object|null} An object containing { url, key } or null if not set.
 */
function getSupabaseCredentials_() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const url = scriptProperties.getProperty(SUPABASE_URL_PROPERTY_KEY);
  const key = scriptProperties.getProperty(SUPABASE_KEY_PROPERTY_KEY);

  if (!url || !key) {
    Logger.log('Supabase URL or Service Key not found in Script Properties. Run Setup.');
    return null;
  }
  return { url: url, key: key };
}

/**
 * Prompts the user for Supabase credentials and stores them securely.
 * Uses the UI of the *specific* Master Sheet.
 * @return {boolean} True if credentials were set successfully, false otherwise.
 */
function setSupabaseCredentials_() {
  // Explicitly get UI from the master sheet
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const ui = SpreadsheetApp.getUi(); // Using getUi() is generally fine, but shows prompt in active context.

  // Use const for responses since they are assigned once from the prompt
  const urlResponse = ui.prompt('Supabase Setup', `Enter Supabase Project URL for sheet ID ${MASTER_SHEET_ID}:\n(e.g., https://<project-ref>.supabase.co)`, ui.ButtonSet.OK_CANCEL);
  if (urlResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempUrl = urlResponse.getResponseText().trim();
  if (!tempUrl.startsWith('https://') || !tempUrl.endsWith('.supabase.co')) {
     ui.alert('Invalid Supabase URL format. Please try setup again.');
     return false;
  }

  const keyResponse = ui.prompt('Supabase Setup', 'Enter Supabase Service Role Key (SECRET - keep confidential):', ui.ButtonSet.OK_CANCEL);
   if (keyResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Setup cancelled.');
    return false;
  }
  const tempKey = keyResponse.getResponseText().trim();
   if (!tempKey) {
     ui.alert('Service Role Key cannot be empty. Please try setup again.');
     return false;
   }

  // Store credentials
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(SUPABASE_URL_PROPERTY_KEY, tempUrl);
  scriptProperties.setProperty(SUPABASE_KEY_PROPERTY_KEY, tempKey);

  Logger.log('Supabase credentials stored successfully.');
  ui.alert('Supabase credentials stored successfully!');
  return true;
} 