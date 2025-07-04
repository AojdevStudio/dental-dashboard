/**
 * ===== AUTOMATIC PROVIDER DISCOVERY SYSTEM =====
 * 
 * Dynamic provider discovery and registration system for Google Apps Script
 * Eliminates hardcoding by discovering providers from database and registering new ones
 * 
 * Features:
 * - Database-driven provider discovery
 * - Dynamic pattern generation from database data
 * - New provider registration workflow
 * - Pattern validation and confirmation system
 * - Integration with existing multi-provider system
 * 
 * @version 1.0.0
 * @requires shared-sync-utils.gs, shared-multi-provider-utils.gs
 */

// ===== CONFIGURATION =====

/**
 * Configuration for auto-discovery system
 */
const AUTO_DISCOVERY_CONFIG = {
  // Cache settings
  cacheExpiry: 30 * 60 * 1000, // 30 minutes in milliseconds
  maxCacheSize: 100,
  
  // Discovery settings
  minPatternConfidence: 0.7, // Minimum confidence score for pattern matching
  maxSuggestions: 5, // Maximum provider suggestions to show
  
  // Registration settings
  requireConfirmation: true,
  enableAutoRegistration: false, // Set to true to allow automatic registration
  
  // Pattern generation settings
  generateVariations: true,
  includeNicknames: true,
  includeTitles: true
};

/**
 * Cache for discovered providers to avoid repeated database queries
 */
let providerCache = {
  providers: new Map(),
  patterns: new Map(),
  lastUpdated: 0,
  isValid: function() {
    return (Date.now() - this.lastUpdated) < AUTO_DISCOVERY_CONFIG.cacheExpiry;
  },
  clear: function() {
    this.providers.clear();
    this.patterns.clear();
    this.lastUpdated = 0;
  }
};

// ===== CORE DISCOVERY FUNCTIONS =====

/**
 * Discover all providers from the database
 * @param {boolean} forceRefresh - Force refresh from database
 * @return {Array} Array of provider objects with discovery patterns
 */
function discoverProvidersFromDatabase(forceRefresh = false) {
  const functionName = 'discoverProvidersFromDatabase';
  
  try {
    // Check cache first
    if (!forceRefresh && providerCache.isValid() && providerCache.providers.size > 0) {
      Logger.log('Using cached provider data');
      return Array.from(providerCache.providers.values());
    }
    
    Logger.log('Fetching providers from database...');
    logToDentistSheet_(functionName, 'START', null, null, null, 'Discovering providers from database');
    
    // Get credentials for database access
    const credentials = getSyncCredentials('dentist_sync');
    if (!credentials) {
      throw new Error('Database credentials not available for provider discovery');
    }
    
    // Query database for all providers
    const providers = queryDatabaseProviders_(credentials);
    if (!providers || providers.length === 0) {
      Logger.log('No providers found in database');
      return [];
    }
    
    // Generate discovery patterns for each provider
    const discoveredProviders = providers.map(provider => {
      const patterns = generateProviderPatterns_(provider);
      return {
        ...provider,
        discoveryPatterns: patterns,
        confidence: 1.0, // Database providers have full confidence
        source: 'database',
        lastUpdated: new Date().toISOString()
      };
    });
    
    // Update cache
    providerCache.clear();
    discoveredProviders.forEach(provider => {
      providerCache.providers.set(provider.id, provider);
    });
    providerCache.lastUpdated = Date.now();
    
    Logger.log(`Discovered ${discoveredProviders.length} providers from database`);
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Discovered ${discoveredProviders.length} providers`);
    
    return discoveredProviders;
    
  } catch (error) {
    Logger.log(`Provider discovery failed: ${error.message}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Discovery failed: ${error.message}`);
    
    // Return cached data if available
    if (providerCache.providers.size > 0) {
      Logger.log('Returning cached provider data due to error');
      return Array.from(providerCache.providers.values());
    }
    
    throw error;
  }
}

/**
 * Query database for all providers
 * @param {Object} credentials - Database credentials
 * @return {Array} Array of provider records
 */
function queryDatabaseProviders_(credentials) {
  try {
    const query = `SELECT p.id, p.provider_code as external_id, p.first_name, p.last_name, p.email, p.provider_type as title, p.position as specialization, p.created_at, p.updated_at, array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as clinic_names, array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as clinic_ids FROM providers p LEFT JOIN provider_locations pl ON p.id = pl.provider_id LEFT JOIN locations l ON pl.location_id = l.id LEFT JOIN clinics c ON l.clinic_id = c.id WHERE p.status != 'deleted' OR p.status IS NULL GROUP BY p.id, p.provider_code, p.first_name, p.last_name, p.email, p.provider_type, p.position, p.created_at, p.updated_at ORDER BY p.last_name, p.first_name`;
    
    const response = makeSupabaseRequest_(
      `${credentials.supabaseUrl}/rest/v1/rpc/execute_sql`,
      'POST',
      { query: query },
      credentials.supabaseKey
    );
    
    // The makeSupabaseRequest_ from shared-sync-utils.gs returns parsed JSON directly
    // Handle direct JSON array response format
    let resultData = response;
    
    if (!Array.isArray(resultData)) {
      // Handle edge cases where response might still be wrapped
      if (resultData && resultData.result) {
        if (Array.isArray(resultData.result)) {
          resultData = resultData.result;
        } else if (resultData.result.execute_sql) {
          resultData = resultData.result.execute_sql;
        }
      } else {
        throw new Error(`Invalid response format from database query. Expected array, got: ${typeof resultData}`);
      }
    }
    
    if (!Array.isArray(resultData)) {
      throw new Error(`Database query did not return an array. Response type: ${typeof resultData}, Content: ${JSON.stringify(resultData).substring(0, 200)}`);
    }
    
    Logger.log(`Received ${resultData.length} provider records from database`);
    
    return resultData.map(row => ({
      id: row.id,
      externalId: row.external_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      title: row.title || 'Dr.',
      specialization: row.specialization,
      clinicNames: row.clinic_names || [],
      clinicIds: row.clinic_ids || [],
      fullName: `${row.first_name} ${row.last_name}`,
      displayName: `${row.title || 'Dr.'} ${row.first_name} ${row.last_name}`
    }));
    
  } catch (error) {
    Logger.log(`Database query failed: ${error.message}`);
    throw new Error(`Failed to query providers: ${error.message}`);
  }
}

/**
 * Generate discovery patterns for a provider
 * @param {Object} provider - Provider object from database
 * @return {Object} Generated patterns and metadata
 */
function generateProviderPatterns_(provider) {
  const patterns = {
    namePatterns: [],
    emailPatterns: [],
    externalIdPatterns: [],
    confidenceWeights: {},
    generatedAt: new Date().toISOString()
  };
  
  const firstName = provider.firstName?.toLowerCase() || '';
  const lastName = provider.lastName?.toLowerCase() || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (firstName && lastName) {
    // Core name patterns (highest confidence)
    patterns.namePatterns.push(
      new RegExp(escapeRegExp_(firstName), 'i'),
      new RegExp(escapeRegExp_(lastName), 'i'),
      new RegExp(`${escapeRegExp_(firstName)}.*${escapeRegExp_(lastName)}`, 'i'),
      new RegExp(`${escapeRegExp_(lastName)}.*${escapeRegExp_(firstName)}`, 'i')
    );
    patterns.confidenceWeights[firstName] = 0.9;
    patterns.confidenceWeights[lastName] = 0.9;
    patterns.confidenceWeights[fullName] = 1.0;
    
    // Title patterns
    if (AUTO_DISCOVERY_CONFIG.includeTitles) {
      const title = provider.title || 'dr';
      patterns.namePatterns.push(
        new RegExp(`${escapeRegExp_(title)}\\.?\\s*${escapeRegExp_(firstName)}`, 'i'),
        new RegExp(`${escapeRegExp_(title)}\\.?\\s*${escapeRegExp_(lastName)}`, 'i')
      );
      patterns.confidenceWeights[`${title} ${firstName}`] = 0.8;
      patterns.confidenceWeights[`${title} ${lastName}`] = 0.8;
    }
    
    // Generate nickname variations if enabled
    if (AUTO_DISCOVERY_CONFIG.generateVariations) {
      const nicknames = generateNicknameVariations_(firstName);
      nicknames.forEach(nickname => {
        patterns.namePatterns.push(new RegExp(escapeRegExp_(nickname), 'i'));
        patterns.confidenceWeights[nickname] = 0.6;
      });
    }
  }
  
  // Email patterns
  if (provider.email) {
    const emailParts = provider.email.split('@');
    if (emailParts.length === 2) {
      const localPart = emailParts[0].toLowerCase();
      patterns.emailPatterns.push(new RegExp(escapeRegExp_(localPart), 'i'));
      patterns.confidenceWeights[localPart] = 0.7;
    }
  }
  
  // External ID patterns
  if (provider.externalId) {
    patterns.externalIdPatterns.push(new RegExp(escapeRegExp_(provider.externalId), 'i'));
    patterns.confidenceWeights[provider.externalId] = 0.8;
  }
  
  return patterns;
}

/**
 * Generate nickname variations for a given name
 * @param {string} name - The name to generate variations for
 * @return {Array} Array of nickname variations
 */
function generateNicknameVariations_(name) {
  const variations = [];
  const nameLower = name.toLowerCase();
  
  // Common nickname patterns
  const nicknameMap = {
    'kelechi': ['kamdi', 'kele'],
    'chinyere': ['chi', 'chinye'],
    'obinna': ['obi', 'obichukwu'],
    'chinonso': ['nonso', 'chi'],
    'chukwuemeka': ['emeka', 'chukwu'],
    'ikechukwu': ['ike', 'ikenna'],
    'nnamdi': ['nam', 'nnam']
  };
  
  // Add mapped nicknames
  if (nicknameMap[nameLower]) {
    variations.push(...nicknameMap[nameLower]);
  }
  
  // Generate abbreviated forms
  if (name.length > 4) {
    variations.push(name.substring(0, 4)); // First 4 characters
    variations.push(name.substring(0, 3)); // First 3 characters
  }
  
  return variations;
}

/**
 * Attempt to detect provider using auto-discovery
 * @param {string} spreadsheetId - The spreadsheet to analyze
 * @return {Object|null} Detected provider or null if not found
 */
function autoDetectProvider(spreadsheetId) {
  const functionName = 'autoDetectProvider';
  
  try {
    Logger.log('Starting auto-detection for provider...');
    logToDentistSheet_(functionName, 'START', null, null, null, 'Auto-detecting provider');
    
    // Get spreadsheet information
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const spreadsheetName = ss.getName();
    const spreadsheetUrl = ss.getUrl();
    
    Logger.log(`Analyzing spreadsheet: "${spreadsheetName}"`);
    
    // Discover all providers from database
    const discoveredProviders = discoverProvidersFromDatabase();
    if (discoveredProviders.length === 0) {
      Logger.log('No providers discovered from database');
      return null;
    }
    
    // Try to match against discovered providers
    const matches = [];
    
    for (const provider of discoveredProviders) {
      const matchScore = calculateProviderMatchScore_(spreadsheetName, provider);
      if (matchScore.score >= AUTO_DISCOVERY_CONFIG.minPatternConfidence) {
        matches.push({
          provider: provider,
          matchScore: matchScore,
          confidence: matchScore.score
        });
      }
    }
    
    // Sort matches by confidence score
    matches.sort((a, b) => b.confidence - a.confidence);
    
    if (matches.length === 0) {
      Logger.log('No provider matches found above confidence threshold');
      
      // Offer to register new provider
      if (AUTO_DISCOVERY_CONFIG.enableAutoRegistration) {
        return offerNewProviderRegistration_(spreadsheetName, spreadsheetUrl);
      }
      
      return null;
    }
    
    // Return best match
    const bestMatch = matches[0];
    Logger.log(`Provider detected: ${bestMatch.provider.displayName} (confidence: ${bestMatch.confidence})`);
    
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Detected: ${bestMatch.provider.displayName} (${bestMatch.confidence.toFixed(2)})`);
    
    return {
      providerCode: generateProviderCode_(bestMatch.provider),
      externalId: bestMatch.provider.externalId || generateExternalId_(bestMatch.provider),
      displayName: bestMatch.provider.displayName,
      primaryClinic: determinePrimaryClinic_(bestMatch.provider),
      spreadsheetName: spreadsheetName,
      confidence: bestMatch.confidence,
      matchDetails: bestMatch.matchScore,
      source: 'auto-discovery',
      databaseProvider: bestMatch.provider
    };
    
  } catch (error) {
    Logger.log(`Auto-detection failed: ${error.message}`);
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Auto-detection failed: ${error.message}`);
    return null;
  }
}

/**
 * Calculate match score for a provider against spreadsheet name
 * @param {string} spreadsheetName - Name of the spreadsheet
 * @param {Object} provider - Provider object to match against
 * @return {Object} Match score details
 */
function calculateProviderMatchScore_(spreadsheetName, provider) {
  const nameToMatch = spreadsheetName.toLowerCase();
  const patterns = provider.discoveryPatterns;
  
  let totalScore = 0;
  let matchCount = 0;
  const matches = [];
  
  // Test name patterns
  for (const pattern of patterns.namePatterns) {
    if (pattern.test(spreadsheetName)) {
      const patternStr = pattern.toString();
      const weight = patterns.confidenceWeights[patternStr] || 0.5;
      totalScore += weight;
      matchCount++;
      matches.push({
        type: 'name',
        pattern: patternStr,
        weight: weight
      });
    }
  }
  
  // Test email patterns
  for (const pattern of patterns.emailPatterns) {
    if (pattern.test(spreadsheetName)) {
      const patternStr = pattern.toString();
      const weight = patterns.confidenceWeights[patternStr] || 0.3;
      totalScore += weight;
      matchCount++;
      matches.push({
        type: 'email',
        pattern: patternStr,
        weight: weight
      });
    }
  }
  
  // Test external ID patterns
  for (const pattern of patterns.externalIdPatterns) {
    if (pattern.test(spreadsheetName)) {
      const patternStr = pattern.toString();
      const weight = patterns.confidenceWeights[patternStr] || 0.4;
      totalScore += weight;
      matchCount++;
      matches.push({
        type: 'externalId',
        pattern: patternStr,
        weight: weight
      });
    }
  }
  
  // Calculate final score (normalized)
  const finalScore = matchCount > 0 ? Math.min(totalScore / matchCount, 1.0) : 0;
  
  return {
    score: finalScore,
    matchCount: matchCount,
    matches: matches,
    provider: provider.displayName
  };
}

// ===== PROVIDER REGISTRATION FUNCTIONS =====

/**
 * Offer to register a new provider
 * @param {string} spreadsheetName - Name of the spreadsheet
 * @param {string} spreadsheetUrl - URL of the spreadsheet
 * @return {Object|null} New provider configuration or null if declined
 */
function offerNewProviderRegistration_(spreadsheetName, spreadsheetUrl) {
  if (!AUTO_DISCOVERY_CONFIG.requireConfirmation) {
    return null; // Registration disabled
  }
  
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    '🆕 New Provider Detected',
    `No existing provider found for "${spreadsheetName}".\n\n` +
    'Would you like to register this as a new provider?\n\n' +
    'This will:\n' +
    '• Create provider patterns for future detection\n' +
    '• Set up automatic sync configuration\n' +
    '• Store provider information for reuse',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    return startNewProviderRegistration_(spreadsheetName, spreadsheetUrl);
  }
  
  return null;
}

/**
 * Start new provider registration workflow
 * @param {string} spreadsheetName - Name of the spreadsheet
 * @param {string} spreadsheetUrl - URL of the spreadsheet
 * @return {Object|null} New provider configuration or null if cancelled
 */
function startNewProviderRegistration_(spreadsheetName, spreadsheetUrl) {
  const ui = SpreadsheetApp.getUi();
  
  // Extract potential provider name from spreadsheet
  const extractedName = extractProviderNameFromSpreadsheet_(spreadsheetName);
  
  // Get provider details from user
  const providerDetails = collectProviderDetails_(extractedName);
  if (!providerDetails) {
    return null; // User cancelled
  }
  
  // Generate patterns for new provider
  const patterns = generateProviderPatterns_(providerDetails);
  
  // Show pattern preview and confirmation
  const confirmed = confirmProviderRegistration_(providerDetails, patterns);
  if (!confirmed) {
    return null; // User cancelled
  }
  
  // Register provider in system
  try {
    const registered = registerNewProvider_(providerDetails, patterns, spreadsheetName, spreadsheetUrl);
    if (registered) {
      ui.alert(
        '✅ Provider Registration Successful',
        `Provider "${providerDetails.displayName}" has been registered!\n\n` +
        'This spreadsheet will now be automatically detected in future syncs.',
        ui.ButtonSet.OK
      );
      
      return {
        providerCode: generateProviderCode_(providerDetails),
        externalId: generateExternalId_(providerDetails),
        displayName: providerDetails.displayName,
        primaryClinic: 'KAMDENTAL_DEFAULT', // Default clinic
        spreadsheetName: spreadsheetName,
        confidence: 1.0,
        source: 'user-registration',
        registeredProvider: providerDetails
      };
    }
  } catch (error) {
    ui.alert(
      '❌ Registration Failed',
      `Failed to register provider: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
  
  return null;
}

/**
 * Extract potential provider name from spreadsheet name
 * @param {string} spreadsheetName - Name of the spreadsheet
 * @return {Object} Extracted name components
 */
function extractProviderNameFromSpreadsheet_(spreadsheetName) {
  const name = spreadsheetName.toLowerCase();
  
  // Look for common name patterns
  const namePatterns = [
    /dr\.?\s*([a-z]+)\s+([a-z]+)/i,
    /([a-z]+)\s+([a-z]+)\s+dr/i,
    /([a-z]+)\s+([a-z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = name.match(pattern);
    if (match) {
      return {
        firstName: match[1],
        lastName: match[2],
        fullName: `${match[1]} ${match[2]}`
      };
    }
  }
  
  // Fallback: try to extract any meaningful words
  const words = name.split(/[^a-z]+/i).filter(word => 
    word.length > 2 && !['the', 'and', 'for', 'data', 'sheet', 'sync'].includes(word.toLowerCase())
  );
  
  if (words.length >= 2) {
    return {
      firstName: words[0],
      lastName: words[1],
      fullName: words.slice(0, 2).join(' ')
    };
  }
  
  return {
    firstName: '',
    lastName: '',
    fullName: ''
  };
}

/**
 * Collect provider details from user
 * @param {Object} extractedName - Pre-extracted name information
 * @return {Object|null} Provider details or null if cancelled
 */
function collectProviderDetails_(extractedName) {
  const ui = SpreadsheetApp.getUi();
  
  // Get first name
  const firstNameResponse = ui.prompt(
    'Provider Registration - First Name',
    `Enter the provider's first name:`,
    extractedName.firstName || '',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (firstNameResponse.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const firstName = firstNameResponse.getResponseText().trim();
  if (!firstName) {
    ui.alert('First name is required for registration.');
    return null;
  }
  
  // Get last name
  const lastNameResponse = ui.prompt(
    'Provider Registration - Last Name',
    `Enter the provider's last name:`,
    extractedName.lastName || '',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (lastNameResponse.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const lastName = lastNameResponse.getResponseText().trim();
  if (!lastName) {
    ui.alert('Last name is required for registration.');
    return null;
  }
  
  // Get email (optional)
  const emailResponse = ui.prompt(
    'Provider Registration - Email (Optional)',
    'Enter the provider\'s email address (optional):',
    '',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (emailResponse.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const email = emailResponse.getResponseText().trim();
  
  return {
    firstName: firstName,
    lastName: lastName,
    email: email || null,
    title: 'Dr.',
    fullName: `${firstName} ${lastName}`,
    displayName: `Dr. ${firstName} ${lastName}`,
    specialization: 'General Dentistry' // Default
  };
}

/**
 * Confirm provider registration with pattern preview
 * @param {Object} providerDetails - Provider details to register
 * @param {Object} patterns - Generated patterns
 * @return {boolean} True if confirmed
 */
function confirmProviderRegistration_(providerDetails, patterns) {
  const ui = SpreadsheetApp.getUi();
  
  let preview = `Provider: ${providerDetails.displayName}\n`;
  preview += `Email: ${providerDetails.email || 'Not provided'}\n\n`;
  preview += 'Detection Patterns:\n';
  
  const samplePatterns = patterns.namePatterns.slice(0, 3);
  samplePatterns.forEach((pattern, index) => {
    preview += `• ${pattern.toString()}\n`;
  });
  
  if (patterns.namePatterns.length > 3) {
    preview += `... and ${patterns.namePatterns.length - 3} more patterns\n`;
  }
  
  preview += '\nThis provider will be automatically detected in future spreadsheets.';
  
  const response = ui.alert(
    'Confirm Provider Registration',
    preview,
    ui.ButtonSet.OK_CANCEL
  );
  
  return response === ui.Button.OK;
}

/**
 * Register new provider in the system
 * @param {Object} providerDetails - Provider details
 * @param {Object} patterns - Generated patterns
 * @param {string} spreadsheetName - Original spreadsheet name
 * @param {string} spreadsheetUrl - Spreadsheet URL
 * @return {boolean} True if successful
 */
function registerNewProvider_(providerDetails, patterns, spreadsheetName, spreadsheetUrl) {
  const functionName = 'registerNewProvider';
  
  try {
    logToDentistSheet_(functionName, 'START', null, null, null, 
      `Registering provider: ${providerDetails.displayName}`);
    
    // Store provider in properties for future detection
    const propertyKey = `AUTO_DISCOVERY_PROVIDER_${generateProviderCode_(providerDetails)}`;
    const providerData = {
      ...providerDetails,
      patterns: patterns,
      registeredAt: new Date().toISOString(),
      registeredFrom: {
        spreadsheetName: spreadsheetName,
        spreadsheetUrl: spreadsheetUrl
      }
    };
    
    PropertiesService.getScriptProperties().setProperty(
      propertyKey,
      JSON.stringify(providerData)
    );
    
    // Add to runtime cache
    const cacheKey = generateProviderCode_(providerDetails);
    providerCache.providers.set(cacheKey, {
      ...providerDetails,
      discoveryPatterns: patterns,
      confidence: 1.0,
      source: 'user-registration'
    });
    
    logToDentistSheet_(functionName, 'SUCCESS', null, null, null, 
      `Provider registered: ${providerDetails.displayName}`);
    
    return true;
    
  } catch (error) {
    logToDentistSheet_(functionName, 'ERROR', null, null, null, 
      `Registration failed: ${error.message}`);
    throw error;
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate provider code from provider details
 * @param {Object} provider - Provider object
 * @return {string} Provider code
 */
function generateProviderCode_(provider) {
  const firstName = (provider.firstName || '').toLowerCase().replace(/[^a-z]/g, '');
  const lastName = (provider.lastName || '').toLowerCase().replace(/[^a-z]/g, '');
  return `${firstName}_${lastName}`;
}

/**
 * Generate external ID for provider
 * @param {Object} provider - Provider object
 * @return {string} External ID
 */
function generateExternalId_(provider) {
  const firstName = (provider.firstName || '').toUpperCase().replace(/[^A-Z]/g, '');
  const lastName = (provider.lastName || '').toUpperCase().replace(/[^A-Z]/g, '');
  return `${firstName}_${lastName}_PROVIDER`;
}

/**
 * Determine primary clinic for provider
 * @param {Object} provider - Provider object
 * @return {string} Primary clinic code
 */
function determinePrimaryClinic_(provider) {
  // Logic to determine primary clinic based on provider data
  if (provider.clinicNames && provider.clinicNames.length > 0) {
    const firstClinic = provider.clinicNames[0].toLowerCase();
    if (firstClinic.includes('baytown')) {
      return 'KAMDENTAL_BAYTOWN';
    } else if (firstClinic.includes('humble')) {
      return 'KAMDENTAL_HUMBLE';
    }
  }
  
  // Default clinic
  return 'KAMDENTAL_BAYTOWN';
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @return {string} Escaped string
 */
function escapeRegExp_(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== TESTING AND DEBUG FUNCTIONS =====

/**
 * Test auto-discovery system with current spreadsheet
 */
function testAutoDiscovery() {
  try {
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    
    console.log('🧪 Testing Auto-Discovery System');
    console.log(`Spreadsheet ID: ${spreadsheetId}`);
    
    // Test provider discovery
    const discovered = discoverProvidersFromDatabase(true); // Force refresh
    console.log(`✅ Discovered ${discovered.length} providers from database`);
    
    // Test auto-detection
    const detected = autoDetectProvider(spreadsheetId);
    if (detected) {
      console.log('✅ Auto-detection successful:');
      console.log(`  Provider: ${detected.displayName}`);
      console.log(`  Confidence: ${detected.confidence}`);
      console.log(`  Source: ${detected.source}`);
    } else {
      console.log('❌ No provider auto-detected');
    }
    
    return detected;
    
  } catch (error) {
    console.log(`❌ Auto-discovery test failed: ${error.message}`);
    return null;
  }
}

/**
 * Show discovered provider information
 */
function showDiscoveredProviders() {
  try {
    const providers = discoverProvidersFromDatabase();
    const ui = SpreadsheetApp.getUi();
    
    let info = `🔍 Discovered Providers (${providers.length})\n\n`;
    
    providers.forEach((provider, index) => {
      info += `${index + 1}. ${provider.displayName}\n`;
      info += `   ID: ${provider.id}\n`;
      info += `   External ID: ${provider.externalId || 'Not set'}\n`;
      info += `   Patterns: ${provider.discoveryPatterns.namePatterns.length} generated\n`;
      info += `   Clinics: ${provider.clinicNames.join(', ')}\n\n`;
    });
    
    if (providers.length === 0) {
      info += 'No providers found in database.\n';
      info += 'Please check database connection and provider data.';
    }
    
    ui.alert('Discovered Providers', info, ui.ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      'Discovery Error',
      `Failed to discover providers: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Clear auto-discovery cache
 */
function clearAutoDiscoveryCache() {
  providerCache.clear();
  SpreadsheetApp.getUi().alert(
    'Cache Cleared',
    'Auto-discovery cache has been cleared.\nNext discovery will fetch fresh data from database.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

