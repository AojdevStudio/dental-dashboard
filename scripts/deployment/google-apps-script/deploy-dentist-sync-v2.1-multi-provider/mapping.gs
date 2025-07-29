/**
 * CONSOLIDATED VERSION: Provider Detection Integration
 * 
 * This file contains the unified mapping.gs file that properly integrates 
 * the multi-provider detection system with correct database field names.
 * 
 * FEATURES INCLUDED:
 * 1. Enhanced provider detection with multi-provider system
 * 2. Dynamic external mapping creation
 * 3. Correct database field names (provider_code, first_name, last_name)
 * 4. Comprehensive error handling and validation
 * 5. Auto-creation of missing provider mappings
 */

/**
 * Get headers from a sheet (first row that contains data)
 * @param {Sheet} sheet - The Google Sheet
 * @return {array} Array of header strings
 */
function getSheetHeaders_(sheet) {
  const data = sheet.getDataRange().getValues();
  
  // Find header row (contains "Date", "Verified Production", etc.)
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    const hasDateColumn = row.some(cell => 
      String(cell).toLowerCase().includes('date') || 
      String(cell).toLowerCase().includes('day')
    );
    if (hasDateColumn) {
      return row.map(cell => String(cell).trim());
    }
  }
  
  // Fallback to first row
  return data.length > 0 ? data[0].map(cell => String(cell).trim()) : [];
}

/**
 * Map sheet headers to database columns for dentist production
 * @param {array} headers - Array of header strings from the sheet
 * @return {object} Object mapping field names to column indices
 */
function mapHeaders_(headers) {
  // Add extensive logging to verify column mapping is working:
  console.log('Raw headers:', headers);
  console.log('Clean header 0:', String(headers[0]).toLowerCase().trim());
  // Ensure DENTIST_COLUMN_HEADERS.DATE exists and is an array before calling .some
  if (typeof DENTIST_COLUMN_HEADERS !== 'undefined' && DENTIST_COLUMN_HEADERS && Array.isArray(DENTIST_COLUMN_HEADERS.DATE)) {
    console.log('Date pattern match:', DENTIST_COLUMN_HEADERS.DATE.some(pattern => String(headers[0]).toLowerCase().trim().includes(pattern)));
  } else {
    console.log('DENTIST_COLUMN_HEADERS.DATE is not defined or not an array');
  }

  const mapping = {
    date: -1,
    verifiedProductionHumble: -1,
    verifiedProductionBaytown: -1,
    totalProduction: -1,
    monthlyGoal: -1,
    productionPerHour: -1,
    avgDailyProduction: -1,
    uuid: -1
  };

  headers.forEach((header, index) => {
    const cleanHeader = String(header).toLowerCase().trim();
    
    // Use individual if statements instead of else-if chain to allow multiple matches
    
    // Date column
    if (mapping.date === -1 && DENTIST_COLUMN_HEADERS.DATE.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.date = index;
    }
    // Verified Production Humble - use pattern matching instead of exact match
    if (mapping.verifiedProductionHumble === -1 && cleanHeader.includes('verified production') && cleanHeader.includes('humble')) {
      mapping.verifiedProductionHumble = index;
    }
    // Verified Production Baytown - use pattern matching instead of exact match
    if (mapping.verifiedProductionBaytown === -1 && cleanHeader.includes('verified production') && cleanHeader.includes('baytown')) {
      mapping.verifiedProductionBaytown = index;
    }
    // Total Production
    if (mapping.totalProduction === -1 && DENTIST_COLUMN_HEADERS.TOTAL_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.totalProduction = index;
    }
    // Monthly Goal
    if (mapping.monthlyGoal === -1 && DENTIST_COLUMN_HEADERS.MONTHLY_GOAL.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.monthlyGoal = index;
    }
    // Production Per Hour
    if (mapping.productionPerHour === -1 && DENTIST_COLUMN_HEADERS.PRODUCTION_PER_HOUR.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.productionPerHour = index;
    }
    // Average Daily Production
    if (mapping.avgDailyProduction === -1 && DENTIST_COLUMN_HEADERS.AVG_DAILY_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.avgDailyProduction = index;
    }
    // UUID
    if (mapping.uuid === -1 && DENTIST_COLUMN_HEADERS.UUID.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.uuid = index;
    }
  });

  // Debug logging to help troubleshoot missing columns
  Logger.log('=== DENTIST HEADER MAPPING DEBUG ===');
  Logger.log('Sheet headers: ' + JSON.stringify(headers));
  Logger.log('Final mapping: ' + JSON.stringify(mapping));
  Logger.log('Missing mappings: ' + Object.keys(mapping).filter(key => mapping[key] === -1).join(', '));

  return mapping;
}

/**
 * Extract provider name from spreadsheet name - DENTIST VERSION (LEGACY - FOR FALLBACK ONLY)
 * @param {string} sheetName - The spreadsheet name
 * @return {string} The provider name (e.g., "Obinna Ezeji")
 */
function extractProviderNameFromSheet_(sheetName) {
  // Look for "Dr. [FirstName LastName]" pattern first
  const drMatch = sheetName.match(/Dr\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (drMatch) {
    return drMatch[1].trim(); // Return just the name part without "Dr."
  }
  
  // Fallback: Extract first and last name before common words
  const cleanName = sheetName
    .replace(/\s*-\s*(associate|production|tracker|data|sheet|dashboard).*$/gi, '') // Remove everything after dash + common words
    .replace(/(associate|production|tracker|data|sheet|dashboard)/gi, '') // Remove common words
    .trim();
  
  // Extract first two words as provider name (First Last)
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  if (words.length >= 2) {
    return `${words[0]} ${words[1]}`;
  } else if (words.length === 1) {
    return words[0];
  }
  
  return 'Unknown';
}

/**
 * Enhanced provider detection using multi-provider system
 * @param {string} spreadsheetId - The spreadsheet ID
 * @return {object} Provider detection result with confidence level
 */
function detectProviderEnhanced_(spreadsheetId) {
  try {
    // Step 1: Try the advanced multi-provider detection system
    const multiProviderResult = detectCurrentProvider(spreadsheetId);
    if (multiProviderResult) {
      Logger.log(`✅ Multi-provider detection successful: ${multiProviderResult.displayName}`);
      return {
        success: true,
        method: 'multi-provider',
        providerCode: multiProviderResult.providerCode,
        displayName: multiProviderResult.displayName,
        externalId: multiProviderResult.externalId,
        primaryClinic: multiProviderResult.primaryClinic,
        confidence: 'high',
        spreadsheetName: multiProviderResult.spreadsheetName
      };
    }

    // Step 2: Fallback to legacy name extraction
    Logger.log('⚠️ Multi-provider detection failed, falling back to legacy extraction');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    const legacyName = extractProviderNameFromSheet_(spreadsheetName);
    
    if (legacyName && legacyName !== 'Unknown') {
      Logger.log(`⚠️ Legacy extraction result: ${legacyName}`);
      return {
        success: true,
        method: 'legacy',
        providerCode: null,
        displayName: legacyName,
        externalId: null,
        primaryClinic: null,
        confidence: 'low',
        spreadsheetName: spreadsheetName
      };
    }

    // Step 3: Complete failure
    Logger.log(`❌ All provider detection methods failed for: ${spreadsheetName}`);
    return {
      success: false,
      method: 'none',
      providerCode: null,
      displayName: 'Unknown Provider',
      externalId: null,
      primaryClinic: null,
      confidence: 'none',
      spreadsheetName: spreadsheetName,
      error: 'No provider detection method succeeded'
    };

  } catch (error) {
    Logger.log(`❌ Provider detection error: ${error.message}`);
    return {
      success: false,
      method: 'error',
      providerCode: null,
      displayName: 'Detection Error',
      externalId: null,
      primaryClinic: null,
      confidence: 'none',
      spreadsheetName: 'Unknown',
      error: error.message
    };
  }
}

/**
 * Lookup provider ID from database using enhanced detection
 * @param {object} providerDetection - Result from detectProviderEnhanced_
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Provider ID or null if not found
 */
function lookupProviderId_(providerDetection, credentials) {
  if (!providerDetection.success || !credentials) {
    Logger.log('Cannot lookup provider ID: detection failed or no credentials');
    return null;
  }

  try {
    // Method 1: Use provider code for direct lookup (most reliable)
    if (providerDetection.providerCode) {
      const providerCodeId = lookupProviderByCode_(providerDetection.providerCode, credentials);
      if (providerCodeId) {
        Logger.log(`✅ Provider ID found by code: ${providerCodeId}`);
        return providerCodeId;
      }
    }

    // Method 2: Use external ID mapping
    if (providerDetection.externalId) {
      const externalId = lookupProviderByExternalId_(providerDetection.externalId, credentials);
      if (externalId) {
        Logger.log(`✅ Provider ID found by external ID: ${externalId}`);
        return externalId;
      }
    }

    // Method 3: Use display name for fuzzy matching
    if (providerDetection.displayName) {
      const nameId = lookupProviderByName_(providerDetection.displayName, credentials);
      if (nameId) {
        Logger.log(`✅ Provider ID found by name: ${nameId}`);
        return nameId;
      }
    }

    // Method 4: AUTO-CREATE MISSING MAPPING (Dynamic Self-Configuration)
    Logger.log(`⚠️ Provider ID lookup failed for: ${providerDetection.displayName} - Attempting auto-creation`);
    const createdProviderId = createProviderMapping_(providerDetection, credentials);
    if (createdProviderId) {
      Logger.log(`✅ Provider ID auto-created: ${createdProviderId}`);
      return createdProviderId;
    }

    Logger.log(`❌ Complete failure: Cannot find or create provider mapping for: ${providerDetection.displayName}`);
    return null;

  } catch (error) {
    Logger.log(`❌ Provider ID lookup error: ${error.message}`);
    return null;
  }
}

/**
 * Lookup provider by provider code in database
 * @param {string} providerCode - Provider code (e.g., 'chinyere_enih')
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Provider ID or null
 */
function lookupProviderByCode_(providerCode, credentials) {
  try {
    const url = `${credentials.url}/rest/v1/providers?provider_code=eq.${encodeURIComponent(providerCode)}&select=id`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      if (data && data.length > 0) {
        return data[0].id;
      }
    }

    Logger.log(`Provider not found by code: ${providerCode}`);
    return null;

  } catch (error) {
    Logger.log(`Error looking up provider by code: ${error.message}`);
    return null;
  }
}

/**
 * Lookup provider by external ID mapping
 * @param {string} externalId - External ID (e.g., 'CHINYERE_PROVIDER')
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Provider ID or null
 */
function lookupProviderByExternalId_(externalId, credentials) {
  try {
    // Use RPC function instead of direct table access
    const url = `${credentials.url}/rest/v1/rpc/get_entity_id_by_external_mapping`;
    
    const payload = {
      system_name: 'dentist_sync',
      external_id_input: externalId,
      entity_type_input: 'provider'
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

    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      // PostgreSQL functions return the result directly
      if (result && typeof result === 'string') {
        return result;
      } else if (result && result.length > 0) {
        return result[0];
      }
    }

    Logger.log(`External ID mapping not found: ${externalId}`);
    return null;

  } catch (error) {
    Logger.log(`Error looking up provider by external ID: ${error.message}`);
    return null;
  }
}

/**
 * Lookup provider by name (fuzzy matching)
 * @param {string} providerName - Provider display name
 * @param {object} credentials - Supabase credentials  
 * @return {string|null} Provider ID or null
 */
function lookupProviderByName_(providerName, credentials) {
  try {
    // First try exact name match
    const exactUrl = `${credentials.url}/rest/v1/providers?name=eq.${encodeURIComponent(providerName)}&select=id`;
    
    let response = UrlFetchApp.fetch(exactUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      if (data && data.length > 0) {
        return data[0].id;
      }
    }

    // Try fuzzy matching by getting all providers and checking manually
    const allUrl = `${credentials.url}/rest/v1/providers?select=id,name,first_name,last_name`;
    
    response = UrlFetchApp.fetch(allUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const providers = JSON.parse(response.getContentText());
      const searchName = providerName.toLowerCase().trim();
      
      for (const provider of providers) {
        const fullName = `${provider.first_name || ''} ${provider.last_name || ''}`.toLowerCase().trim();
        const name = (provider.name || '').toLowerCase().trim();
        
        if (fullName.includes(searchName) || searchName.includes(fullName) || 
            name.includes(searchName) || searchName.includes(name)) {
          Logger.log(`Fuzzy match found: "${providerName}" → "${provider.name}"`);
          return provider.id;
        }
      }
    }

    Logger.log(`Provider not found by name: ${providerName}`);
    return null;

  } catch (error) {
    Logger.log(`Error looking up provider by name: ${error.message}`);
    return null;
  }
}

/**
 * Create external provider mapping dynamically
 * @param {object} providerDetection - Result from detectProviderEnhanced_
 * @param {object} credentials - Supabase credentials
 * @return {string|null} Provider ID or null if creation fails
 */
function createProviderMapping_(providerDetection, credentials) {
  if (!providerDetection.success || !credentials) {
    Logger.log('Cannot create provider mapping: detection failed or no credentials');
    return null;
  }

  try {
    // Step 1: Get the provider ID from the providers table
    let providerId = null;
    
    // Try lookup by provider code first (most reliable)
    if (providerDetection.providerCode) {
      providerId = lookupProviderByCode_(providerDetection.providerCode, credentials);
    }
    
    // Fallback to name lookup if code lookup fails
    if (!providerId && providerDetection.displayName) {
      providerId = lookupProviderByName_(providerDetection.displayName, credentials);
    }
    
    if (!providerId) {
      Logger.log(`Cannot create mapping: Provider not found in database for ${providerDetection.displayName}`);
      return null;
    }

    // Step 2: Create the external mapping entry
    const externalId = generateExternalId_(providerDetection);
    if (!externalId) {
      Logger.log('Cannot create mapping: Failed to generate external ID');
      return null;
    }

    // Use RPC function to upsert external mapping
    const url = `${credentials.url}/rest/v1/rpc/upsert_external_mapping`;
    
    const payload = {
      system_name: 'dentist_sync',
      external_id_input: externalId,
      entity_type_input: 'provider',
      entity_id_input: providerId,
      notes_input: `Auto-created mapping for ${providerDetection.displayName} (${providerDetection.method} detection)`
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

    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      if (result === true || result === 'true' || result === 't') {
        Logger.log(`✅ Successfully created external mapping: ${externalId} → ${providerId}`);
        return providerId;
      }
    }
    
    Logger.log(`❌ Failed to create external mapping. Status: ${response.getResponseCode()}, Response: ${response.getContentText()}`);
    return null;

  } catch (error) {
    Logger.log(`❌ Error creating provider mapping: ${error.message}`);
    return null;
  }
}

/**
 * Generate external identifier for provider
 * @param {object} providerDetection - Result from detectProviderEnhanced_
 * @return {string|null} External identifier or null
 */
function generateExternalId_(providerDetection) {
  try {
    // Use provider code if available (preferred)
    if (providerDetection.providerCode) {
      const code = providerDetection.providerCode.toUpperCase();
      // Convert chinyere_enih → CHINYERE_PROVIDER
      const providerPart = code.split('_')[0];
      return `${providerPart}_PROVIDER`;
    }
    
    // Fallback: Generate from display name
    if (providerDetection.displayName) {
      const name = providerDetection.displayName
        .replace(/^Dr\.?\s+/i, '') // Remove "Dr." prefix
        .split(' ')[0] // Take first name
        .toUpperCase();
      return `${name}_PROVIDER`;
    }
    
    Logger.log('Cannot generate external ID: No provider code or display name');
    return null;
    
  } catch (error) {
    Logger.log(`Error generating external ID: ${error.message}`);
    return null;
  }
}

/**
 * Parse a row of dentist data into multiple location-specific records
 * @param {array} row - Array of cell values from the sheet
 * @param {object} mapping - Column mapping from mapHeaders_
 * @param {string} monthTab - Name of the month tab (e.g., "Nov-24")
 * @param {object} credentials - Supabase credentials for provider lookup
 * @param {object} providerDetection - Pre-detected provider info (optional)
 * @return {array} Array of dentist record objects (one per location with production)
 */
function parseDentistRowMultiLocation_(row, mapping, monthTab, credentials = null, providerDetection = null) {
  const records = [];
  
  try {
    // Extract date
    const dateValue = mapping.date !== -1 ? row[mapping.date] : null;
    if (!dateValue) return records;

    const date = parseDateForSupabase_(dateValue, Session.getScriptTimeZone());
    if (!date) return records;

    // Validate date is not in the future
    const today = new Date();
    const recordDate = new Date(date);
    if (recordDate > today) {
      Logger.log(`Skipping future date: ${date}`);
      return records;
    }

    // Extract production values for each location
    const humbleProduction = mapping.verifiedProductionHumble !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionHumble])) || 0 : 0;
    
    const baytownProduction = mapping.verifiedProductionBaytown !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionBaytown])) || 0 : 0;

    // Extract other numeric values
    const totalProduction = mapping.totalProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.totalProduction])) || null : null;
    
    const monthlyGoal = mapping.monthlyGoal !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.monthlyGoal])) || null : null;
    
    const productionPerHour = mapping.productionPerHour !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.productionPerHour])) || null : null;
    
    const avgDailyProduction = mapping.avgDailyProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.avgDailyProduction])) || null : null;

    // If providerDetection is not passed in, detect it
    if (!providerDetection) {
      providerDetection = detectProviderEnhanced_(getDentistSheetId());
    }
    
    // Use enhanced provider ID lookup
    let providerId = null;
    if (credentials && providerDetection.success) {
      providerId = lookupProviderId_(providerDetection, credentials);
    }

    // Common data for both records
    const baseRecord = {
      month_tab: monthTab,
      date: date,
      monthly_goal: monthlyGoal,
      production_per_hour: productionPerHour,
      avg_daily_production: avgDailyProduction,
      provider_name: providerDetection.displayName,
      provider_id: providerId,
      provider_code: providerDetection.providerCode,
      provider_confidence: providerDetection.confidence,
      detection_method: providerDetection.method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create Humble record if has production
    if (humbleProduction > 0 || (humbleProduction === 0 && baytownProduction === 0)) {
      records.push({
        ...baseRecord,
        id: Utilities.getUuid(),
        clinic_id: PRODUCTION_CLINIC_IDS.HUMBLE,
        verified_production_humble: humbleProduction,
        verified_production_baytown: 0,
        total_production: humbleProduction
      });
    }

    // Create Baytown record if has production
    if (baytownProduction > 0) {
      records.push({
        ...baseRecord,
        id: Utilities.getUuid(),
        clinic_id: PRODUCTION_CLINIC_IDS.BAYTOWN,
        verified_production_humble: 0,
        verified_production_baytown: baytownProduction,
        total_production: baytownProduction
      });
    }

    // Log provider detection results
    if (records.length > 0) {
      Logger.log(`🔍 Created ${records.length} location-specific records for ${date}`);
      Logger.log(`  Humble: $${humbleProduction}, Baytown: $${baytownProduction}`);
      Logger.log(`  Provider: ${providerDetection.displayName} (${providerId || 'Not found'})`);
    }

    return records;

  } catch (error) {
    Logger.log(`Error parsing dentist row: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return records;
  }
}

/**
 * Parse a row of dentist data into a record object
 * @param {array} row - Array of cell values from the sheet
 * @param {object} mapping - Column mapping from mapHeaders_
 * @param {string} monthTab - Name of the month tab (e.g., "Nov-24")
 * @param {string} clinicId - Clinic ID
 * @param {object} credentials - Supabase credentials for provider lookup
 * @param {object} providerDetection - Pre-detected provider info (optional)
 * @return {object|null} Dentist record object or null if invalid
 */
function parseDentistRow_(row, mapping, monthTab, clinicId, credentials = null, providerDetection = null) {
  try {
    // Extract date
    const dateValue = mapping.date !== -1 ? row[mapping.date] : null;
    if (!dateValue) return null;

    const date = parseDateForSupabase_(dateValue, Session.getScriptTimeZone());
    if (!date) return null;

    // Validate date is not in the future
    const today = new Date();
    const recordDate = new Date(date);
    if (recordDate > today) {
      Logger.log(`Skipping future date: ${date}`);
      return null;
    }

    // Extract production values - dual locations
    const verifiedProductionHumble = mapping.verifiedProductionHumble !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionHumble])) || 0 : 0;
    
    const verifiedProductionBaytown = mapping.verifiedProductionBaytown !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionBaytown])) || 0 : 0;

    // Extract other numeric values
    const totalProduction = mapping.totalProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.totalProduction])) || null : null;
    
    const monthlyGoal = mapping.monthlyGoal !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.monthlyGoal])) || null : null;
    
    const productionPerHour = mapping.productionPerHour !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.productionPerHour])) || null : null;
    
    const avgDailyProduction = mapping.avgDailyProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.avgDailyProduction])) || null : null;

    // Extract UUID or generate one
    let uuid = mapping.uuid !== -1 ? row[mapping.uuid] : null;
    if (!uuid || String(uuid).trim() === '') {
      uuid = Utilities.getUuid();
    }

    // If providerDetection is not passed in, detect it (for backwards compatibility/other uses)
    if (!providerDetection) {
      providerDetection = detectProviderEnhanced_(getDentistSheetId());
    }
    
    // Use enhanced provider ID lookup
    let providerId = null;
    if (credentials && providerDetection.success) {
      providerId = lookupProviderId_(providerDetection, credentials);
    }

    // Log provider detection results for debugging
    Logger.log(`🔍 Provider Detection Results:`);
    Logger.log(`  Method: ${providerDetection.method}`);
    Logger.log(`  Success: ${providerDetection.success}`);
    Logger.log(`  Display Name: ${providerDetection.displayName}`);
    Logger.log(`  Provider Code: ${providerDetection.providerCode}`);
    Logger.log(`  Confidence: ${providerDetection.confidence}`);
    Logger.log(`  Provider ID: ${providerId || 'Not found'}`);

    return {
      id: String(uuid),
      clinic_id: clinicId,
      date: date,
      month_tab: monthTab,
      verified_production_humble: verifiedProductionHumble,
      verified_production_baytown: verifiedProductionBaytown,
      total_production: totalProduction,
      monthly_goal: monthlyGoal,
      production_per_hour: productionPerHour,
      avg_daily_production: avgDailyProduction,
      provider_name: providerDetection.displayName, // Use detection result
      provider_id: providerId, // Use enhanced lookup result
      provider_code: providerDetection.providerCode, // Enhanced provider detection field
      provider_confidence: providerDetection.confidence, // Enhanced provider detection field
      detection_method: providerDetection.method, // Enhanced provider detection field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

  } catch (error) {
    Logger.log(`Error parsing dentist row: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return null;
  }
}

/**
 * Clean numeric values (remove $, commas, spaces, %, parentheses for negatives)
 * @param {any} value - Value to clean
 * @return {string} Cleaned numeric string
 */
function cleanNumeric_(value) {
  if (!value) return '0';
  
  let cleanValue = String(value).replace(/[\$,\s%]/g, '');
  
  // Handle negative values in quotes like "-1,296.00"
  if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
    cleanValue = cleanValue.slice(1, -1);
  }
  
  return cleanValue;
}

/**
 * Parse date value into Supabase-compatible format
 * @param {any} dateValue - The date value to parse
 * @param {string} timeZone - The timezone to use for formatting
 * @return {string|null} A formatted date string in YYYY-MM-DD format or null if invalid
 */
function parseDateForSupabase_(dateValue, timeZone) {
  // If already a Date object and valid
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    try {
      return Utilities.formatDate(dateValue, timeZone, "yyyy-MM-dd");
    } catch (err) {
      Logger.log(`Error formatting date: ${err.message}`);
      return null;
    }
  }

  // For string dates or other formats
  if (dateValue) {
    try {
      let dateObj;

      if (typeof dateValue === 'string') {
        // Try JavaScript parsing first
        dateObj = new Date(dateValue);

        // If that failed, try manual parsing for common formats
        if (Number.isNaN(dateObj.getTime())) {
          // Try US format MM/DD/YYYY
          const usParts = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (usParts) {
            dateObj = new Date(usParts[3], usParts[1] - 1, usParts[2]);
          } else {
            Logger.log(`Could not parse date string: ${dateValue}`);
            return null;
          }
        }
      } else {
        // For other types, try direct conversion
        dateObj = new Date(dateValue);
      }

      // Ensure the date is valid before formatting
      if (!Number.isNaN(dateObj.getTime())) {
        return Utilities.formatDate(dateObj, timeZone, "yyyy-MM-dd");
      } else {
        Logger.log(`Invalid date object: ${dateValue}`);
        return null;
      }

    } catch (err) {
      Logger.log(`Error parsing date: ${err.message}`);
      return null;
    }
  }

  return null;
}