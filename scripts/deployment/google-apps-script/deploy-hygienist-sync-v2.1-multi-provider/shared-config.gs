/**
 * ===== SHARED CONFIGURATION FOR HYGIENIST SYNC V2.1 =====
 * 
 * Centralized configuration to reduce hardcoded values
 * and improve maintainability across the sync system
 * 
 * @version 2.1.0
 */

// ===== CLINIC CONFIGURATION =====
const CLINIC_CONFIG = {
  // Primary clinic mappings
  clinics: {
    HUMBLE: {
      code: 'KAMDENTAL_HUMBLE',
      externalId: 'HUMBLE_CLINIC',
      fallbackId: 'cmc3jcrhe0000i2ht9ymqtmzb', // Only used as last resort
      name: 'Humble Clinic'
    },
    BAYTOWN: {
      code: 'KAMDENTAL_BAYTOWN',
      externalId: 'BAYTOWN_CLINIC',
      fallbackId: 'cmc3jcrs20001i2ht5sn89v66', // Only used as last resort
      name: 'Baytown Clinic'
    }
  },
  
  // Get clinic by code
  getByCode: function(code) {
    for (const key in this.clinics) {
      if (this.clinics[key].code === code) {
        return this.clinics[key];
      }
    }
    return null;
  },
  
  // Get clinic by external ID
  getByExternalId: function(externalId) {
    for (const key in this.clinics) {
      if (this.clinics[key].externalId === externalId) {
        return this.clinics[key];
      }
    }
    return null;
  }
};

// ===== PROVIDER CONFIGURATION =====
const PROVIDER_CONFIG = {
  // Hygienist providers
  providers: {
    ADRIANE: {
      code: 'adriane_fontenot',
      externalId: 'ADRIANE_PROVIDER',
      fallbackId: 'cmc3jcsqe0009i2ht8bpxexyi', // Only used as last resort
      name: 'Adriane Fontenot',
      type: 'hygienist',
      primaryClinic: 'KAMDENTAL_BAYTOWN'
    },
    KIA: {
      code: 'kia_redfearn',
      externalId: 'KIA_PROVIDER',
      fallbackId: 'cmc3jctyd000gi2htj0ggsxei', // Only used as last resort
      name: 'Kia Redfearn',
      type: 'hygienist',
      primaryClinic: 'KAMDENTAL_HUMBLE'
    }
  },
  
  // Get provider by code
  getByCode: function(code) {
    for (const key in this.providers) {
      if (this.providers[key].code === code) {
        return this.providers[key];
      }
    }
    return null;
  },
  
  // Get provider by external ID
  getByExternalId: function(externalId) {
    for (const key in this.providers) {
      if (this.providers[key].externalId === externalId) {
        return this.providers[key];
      }
    }
    return null;
  }
};

// ===== SYNC SYSTEM CONFIGURATION =====
const SYNC_CONFIG = {
  // Batch processing
  BATCH_SIZE: 500,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Cache settings
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  // Validation settings
  VARIANCE_PERCENTAGE_MAX: 9.9999,
  VARIANCE_PERCENTAGE_MIN: -9.9999,
  
  // Date validation
  MAX_FUTURE_DAYS: 0, // Don't allow future dates
  
  // Logging
  LOG_SHEET_NAME: 'Sync Log',
  MAX_LOG_ENTRIES: 1000,
  
  // Table names
  HYGIENE_PRODUCTION_TABLE: 'hygiene_production',
  EXTERNAL_MAPPINGS_TABLE: 'external_id_mappings'
};

// ===== ERROR MESSAGES =====
const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Supabase credentials not set. Please run "Setup Sync" first.',
  MISSING_CLINIC_ID: 'Cannot resolve clinic ID. Database sync cannot proceed without clinic_id.',
  MISSING_PROVIDER_ID: 'Provider ID not resolved. Sync will proceed with null provider_id.',
  INVALID_DATE: 'Invalid or missing date value.',
  FUTURE_DATE: 'Date cannot be in the future.',
  NO_ESSENTIAL_DATA: 'No essential financial data found.',
  VALIDATION_FAILED: 'Data validation failed. Please check the logs for details.',
  CONNECTION_ERROR: 'Failed to connect to database. Please check your network and credentials.',
  TABLE_NOT_FOUND: 'Database table not found. Please ensure the table exists and has proper permissions.'
};

// ===== SUCCESS MESSAGES =====
const SUCCESS_MESSAGES = {
  SYNC_COMPLETE: 'Sync completed successfully.',
  CREDENTIALS_STORED: 'Credentials stored successfully.',
  CONNECTION_TEST_PASSED: 'Database connection test successful.',
  VALIDATION_PASSED: 'All records validated successfully.'
};

// ===== HELPER FUNCTIONS =====

/**
 * Get all fallback mappings for quick lookup
 * @return {object} Map of external IDs to database IDs
 */
function getAllFallbackMappings() {
  const mappings = {};
  
  // Add clinic mappings
  for (const key in CLINIC_CONFIG.clinics) {
    const clinic = CLINIC_CONFIG.clinics[key];
    mappings[clinic.externalId] = clinic.fallbackId;
  }
  
  // Add provider mappings
  for (const key in PROVIDER_CONFIG.providers) {
    const provider = PROVIDER_CONFIG.providers[key];
    mappings[provider.externalId] = provider.fallbackId;
  }
  
  return mappings;
}

/**
 * Get configuration value with fallback
 * @param {string} path - Dot-separated path to config value
 * @param {any} defaultValue - Default value if not found
 * @return {any} Configuration value or default
 */
function getConfigValue(path, defaultValue) {
  const parts = path.split('.');
  let current = { SYNC_CONFIG, CLINIC_CONFIG, PROVIDER_CONFIG };
  
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}