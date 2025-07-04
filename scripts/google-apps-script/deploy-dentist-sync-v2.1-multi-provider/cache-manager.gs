/**
 * ===== PROVIDER CONFIGURATION CACHE MANAGER =====
 * 
 * Intelligent caching system for provider configuration data
 * Provides fallback mechanisms when database queries fail
 * 
 * Features:
 * - Multi-tier caching (temporary, persistent, backup)
 * - Automatic cache invalidation and refresh
 * - Provider-specific configuration caching
 * - Offline capability with cached data
 * - Cache versioning and migration
 * 
 * @version 1.0.0
 * @requires logging.gs
 */

// ===== CACHE CONFIGURATION =====

/**
 * Cache configuration settings
 */
const CACHE_CONFIG = {
  // Cache duration settings (seconds)
  DURATIONS: {
    PROVIDER_CONFIG: 3600,      // 1 hour
    CREDENTIALS: 1800,          // 30 minutes
    DATABASE_FUNCTIONS: 7200,   // 2 hours
    ERROR_RECOVERY: 300,        // 5 minutes
    SYSTEM_MAPPINGS: 3600       // 1 hour
  },
  
  // Cache size limits
  SIZE_LIMITS: {
    MAX_ENTRIES: 100,
    MAX_ENTRY_SIZE: 102400, // 100KB
    CLEANUP_THRESHOLD: 80   // Cleanup when 80% full
  },
  
  // Cache keys
  KEYS: {
    PROVIDER_CONFIG: 'provider_config',
    CREDENTIALS: 'sync_credentials',
    DATABASE_FUNCTIONS: 'db_functions',
    ERROR_RECOVERY: 'error_recovery',
    SYSTEM_MAPPINGS: 'system_mappings',
    LAST_PROVIDER: 'last_provider',
    BACKUP_CONFIG: 'backup_config'
  },
  
  // Cache versioning
  VERSION: '1.0.0',
  VERSION_KEY: 'cache_version'
};

/**
 * Cache tier types for different storage mechanisms
 */
const CACHE_TIERS = {
  TEMPORARY: 'TEMPORARY',     // CacheService (fast, volatile)
  PERSISTENT: 'PERSISTENT',   // PropertiesService (slower, persistent)
  BACKUP: 'BACKUP'           // Script properties as backup
};

// ===== CACHE MANAGER CLASS =====

/**
 * Multi-tier cache manager for provider configuration data
 */
class CacheManager {
  constructor() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      errors: 0
    };
    
    this.initializeCache_();
  }
  
  /**
   * Initialize cache system and check version compatibility
   */
  initializeCache_() {
    try {
      // Check cache version compatibility
      const currentVersion = this.get(CACHE_CONFIG.VERSION_KEY, CACHE_TIERS.PERSISTENT);
      if (currentVersion !== CACHE_CONFIG.VERSION) {
        Logger.log(`Cache version mismatch. Clearing cache. Old: ${currentVersion}, New: ${CACHE_CONFIG.VERSION}`);
        this.clearAllCaches();
        this.set(CACHE_CONFIG.VERSION_KEY, CACHE_CONFIG.VERSION, CACHE_TIERS.PERSISTENT);
      }
      
      // Initialize cache statistics if not present
      if (!this.get('cache_stats', CACHE_TIERS.PERSISTENT)) {
        this.set('cache_stats', this.cacheStats, CACHE_TIERS.PERSISTENT);
      }
      
      Logger.log('Cache manager initialized successfully');
    } catch (error) {
      Logger.log(`Cache initialization error: ${error.message}`);
    }
  }
  
  /**
   * Get value from cache with tier fallback
   * @param {string} key - Cache key
   * @param {string} preferredTier - Preferred cache tier
   * @return {*} Cached value or null if not found
   */
  get(key, preferredTier = CACHE_TIERS.TEMPORARY) {
    const startTime = Date.now();
    
    try {
      // Try preferred tier first
      let value = this.getTierValue_(key, preferredTier);
      if (value !== null) {
        this.cacheStats.hits++;
        this.logCacheOperation_('HIT', key, preferredTier, Date.now() - startTime);
        return this.deserializeValue_(value);
      }
      
      // Fallback to other tiers
      const tierOrder = this.getTierFallbackOrder_(preferredTier);
      for (const tier of tierOrder) {
        value = this.getTierValue_(key, tier);
        if (value !== null) {
          this.cacheStats.hits++;
          this.logCacheOperation_('HIT_FALLBACK', key, tier, Date.now() - startTime);
          
          // Promote to preferred tier for faster future access
          this.set(key, this.deserializeValue_(value), preferredTier);
          
          return this.deserializeValue_(value);
        }
      }
      
      this.cacheStats.misses++;
      this.logCacheOperation_('MISS', key, 'ALL_TIERS', Date.now() - startTime);
      return null;
      
    } catch (error) {
      this.cacheStats.errors++;
      Logger.log(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {string} tier - Cache tier
   * @param {number} duration - Cache duration in seconds (optional)
   * @return {boolean} Success status
   */
  set(key, value, tier = CACHE_TIERS.TEMPORARY, duration = null) {
    const startTime = Date.now();
    
    try {
      const serializedValue = this.serializeValue_(value);
      
      // Check size limits
      if (serializedValue.length > CACHE_CONFIG.SIZE_LIMITS.MAX_ENTRY_SIZE) {
        Logger.log(`Cache entry too large for key ${key}: ${serializedValue.length} bytes`);
        return false;
      }
      
      const success = this.setTierValue_(key, serializedValue, tier, duration);
      
      if (success) {
        this.cacheStats.sets++;
        this.logCacheOperation_('SET', key, tier, Date.now() - startTime);
        
        // Check if cleanup is needed
        this.checkCleanupNeeded_();
      }
      
      return success;
      
    } catch (error) {
      this.cacheStats.errors++;
      Logger.log(`Cache set error for key ${key}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get value from specific cache tier
   * @param {string} key - Cache key
   * @param {string} tier - Cache tier
   * @return {string|null} Raw cached value or null
   */
  getTierValue_(key, tier) {
    try {
      switch (tier) {
        case CACHE_TIERS.TEMPORARY:
          const cache = CacheService.getScriptCache();
          return cache.get(key);
          
        case CACHE_TIERS.PERSISTENT:
          const userProps = PropertiesService.getUserProperties();
          return userProps.getProperty(key);
          
        case CACHE_TIERS.BACKUP:
          const scriptProps = PropertiesService.getScriptProperties();
          return scriptProps.getProperty(key);
          
        default:
          Logger.log(`Unknown cache tier: ${tier}`);
          return null;
      }
    } catch (error) {
      Logger.log(`Error getting value from tier ${tier}: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Set value in specific cache tier
   * @param {string} key - Cache key
   * @param {string} value - Serialized value
   * @param {string} tier - Cache tier
   * @param {number} duration - Duration in seconds
   * @return {boolean} Success status
   */
  setTierValue_(key, value, tier, duration) {
    try {
      switch (tier) {
        case CACHE_TIERS.TEMPORARY:
          const cache = CacheService.getScriptCache();
          const cacheDuration = duration || CACHE_CONFIG.DURATIONS.PROVIDER_CONFIG;
          cache.put(key, value, cacheDuration);
          return true;
          
        case CACHE_TIERS.PERSISTENT:
          const userProps = PropertiesService.getUserProperties();
          // Add expiration timestamp for persistent cache
          const expirationTime = Date.now() + ((duration || CACHE_CONFIG.DURATIONS.PROVIDER_CONFIG) * 1000);
          const valueWithExpiration = JSON.stringify({
            value: value,
            expires: expirationTime
          });
          userProps.setProperty(key, valueWithExpiration);
          return true;
          
        case CACHE_TIERS.BACKUP:
          const scriptProps = PropertiesService.getScriptProperties();
          const backupExpirationTime = Date.now() + ((duration || CACHE_CONFIG.DURATIONS.PROVIDER_CONFIG) * 1000);
          const backupValueWithExpiration = JSON.stringify({
            value: value,
            expires: backupExpirationTime
          });
          scriptProps.setProperty(key, backupValueWithExpiration);
          return true;
          
        default:
          Logger.log(`Unknown cache tier: ${tier}`);
          return false;
      }
    } catch (error) {
      Logger.log(`Error setting value in tier ${tier}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get tier fallback order based on preferred tier
   * @param {string} preferredTier - Preferred cache tier
   * @return {Array} Array of tier names in fallback order
   */
  getTierFallbackOrder_(preferredTier) {
    const allTiers = [CACHE_TIERS.TEMPORARY, CACHE_TIERS.PERSISTENT, CACHE_TIERS.BACKUP];
    return allTiers.filter(tier => tier !== preferredTier);
  }
  
  /**
   * Serialize value for caching
   * @param {*} value - Value to serialize
   * @return {string} Serialized value
   */
  serializeValue_(value) {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return JSON.stringify({
      type: typeof value,
      value: value,
      timestamp: Date.now()
    });
  }
  
  /**
   * Deserialize cached value
   * @param {string} serializedValue - Serialized value
   * @return {*} Deserialized value
   */
  deserializeValue_(serializedValue) {
    if (serializedValue === 'null') {
      return null;
    }
    
    try {
      // Check if it's a persistent cache entry with expiration
      if (serializedValue.startsWith('{"value":')) {
        const wrapper = JSON.parse(serializedValue);
        if (wrapper.expires && Date.now() > wrapper.expires) {
          return null; // Expired
        }
        serializedValue = wrapper.value;
      }
      
      // Try to parse as complex object
      const parsed = JSON.parse(serializedValue);
      if (parsed.type && parsed.value !== undefined && parsed.timestamp) {
        return parsed.value;
      }
      
      // Return as-is if not our format
      return parsed;
    } catch (error) {
      // Return as string if not JSON
      return serializedValue;
    }
  }
  
  /**
   * Check if cache cleanup is needed
   */
  checkCleanupNeeded_() {
    try {
      // Simple check - could be enhanced with actual size calculation
      if (this.cacheStats.sets % 20 === 0) { // Check every 20 sets
        this.performCleanup_();
      }
    } catch (error) {
      Logger.log(`Cache cleanup check error: ${error.message}`);
    }
  }
  
  /**
   * Perform cache cleanup
   */
  performCleanup_() {
    try {
      Logger.log('Performing cache cleanup...');
      
      // Clear expired entries from persistent caches
      const userProps = PropertiesService.getUserProperties();
      const allProps = userProps.getProperties();
      
      let cleanedCount = 0;
      for (const [key, value] of Object.entries(allProps)) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.expires && Date.now() > parsed.expires) {
            userProps.deleteProperty(key);
            cleanedCount++;
          }
        } catch (error) {
          // Not our format, skip
          continue;
        }
      }
      
      Logger.log(`Cache cleanup completed. Removed ${cleanedCount} expired entries.`);
    } catch (error) {
      Logger.log(`Cache cleanup error: ${error.message}`);
    }
  }
  
  /**
   * Log cache operation for monitoring
   * @param {string} operation - Operation type
   * @param {string} key - Cache key
   * @param {string} tier - Cache tier
   * @param {number} duration - Operation duration in ms
   */
  logCacheOperation_(operation, key, tier, duration) {
    const logEntry = {
      operation: operation,
      key: key,
      tier: tier,
      duration: duration,
      timestamp: new Date().toISOString()
    };
    
    // Use the logging system if available
    if (typeof logMessage === 'function') {
      logMessage('CACHE_MANAGER', JSON.stringify(logEntry), 'DEBUG');
    }
  }
  
  /**
   * Remove item from all cache tiers
   * @param {string} key - Cache key
   * @return {boolean} Success status
   */
  remove(key) {
    try {
      // Remove from all tiers
      const cache = CacheService.getScriptCache();
      cache.remove(key);
      
      const userProps = PropertiesService.getUserProperties();
      userProps.deleteProperty(key);
      
      const scriptProps = PropertiesService.getScriptProperties();
      scriptProps.deleteProperty(key);
      
      this.cacheStats.invalidations++;
      Logger.log(`Removed cache key: ${key}`);
      return true;
      
    } catch (error) {
      Logger.log(`Error removing cache key ${key}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Clear all caches
   * @return {boolean} Success status
   */
  clearAllCaches() {
    try {
      // Clear temporary cache
      const cache = CacheService.getScriptCache();
      cache.removeAll(['provider_config', 'sync_credentials', 'db_functions']);
      
      // Clear persistent cache (our keys only)
      const userProps = PropertiesService.getUserProperties();
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        userProps.deleteProperty(key);
      });
      
      // Reset statistics
      this.cacheStats = {
        hits: 0,
        misses: 0,
        sets: 0,
        invalidations: 0,
        errors: 0
      };
      
      Logger.log('All caches cleared');
      return true;
      
    } catch (error) {
      Logger.log(`Error clearing caches: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get cache statistics
   * @return {Object} Cache statistics
   */
  getStatistics() {
    return {
      ...this.cacheStats,
      hitRatio: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
      version: CACHE_CONFIG.VERSION
    };
  }
}

// ===== GLOBAL CACHE MANAGER INSTANCE =====

/**
 * Global cache manager instance
 * @type {CacheManager}
 */
const globalCacheManager = new CacheManager();

// ===== PROVIDER-SPECIFIC CACHE FUNCTIONS =====

/**
 * Cache provider configuration
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {Object} providerConfig - Provider configuration to cache
 * @return {boolean} Success status
 */
function cacheProviderConfig(spreadsheetId, providerConfig) {
  const key = `${CACHE_CONFIG.KEYS.PROVIDER_CONFIG}_${spreadsheetId}`;
  
  const configWithMetadata = {
    ...providerConfig,
    cachedAt: new Date().toISOString(),
    spreadsheetId: spreadsheetId
  };
  
  // Cache in multiple tiers for redundancy
  const success1 = globalCacheManager.set(key, configWithMetadata, CACHE_TIERS.TEMPORARY, CACHE_CONFIG.DURATIONS.PROVIDER_CONFIG);
  const success2 = globalCacheManager.set(key, configWithMetadata, CACHE_TIERS.PERSISTENT, CACHE_CONFIG.DURATIONS.PROVIDER_CONFIG);
  
  // Also cache as "last provider" for fallback
  globalCacheManager.set(CACHE_CONFIG.KEYS.LAST_PROVIDER, configWithMetadata, CACHE_TIERS.PERSISTENT);
  
  return success1 || success2;
}

/**
 * Get cached provider configuration
 * @param {string} spreadsheetId - Spreadsheet ID
 * @return {Object|null} Cached provider configuration or null
 */
function getCachedProviderConfig(spreadsheetId) {
  const key = `${CACHE_CONFIG.KEYS.PROVIDER_CONFIG}_${spreadsheetId}`;
  
  let config = globalCacheManager.get(key, CACHE_TIERS.TEMPORARY);
  
  if (!config) {
    // Try last known provider as fallback
    config = globalCacheManager.get(CACHE_CONFIG.KEYS.LAST_PROVIDER, CACHE_TIERS.PERSISTENT);
    if (config) {
      Logger.log('Using last known provider configuration as fallback');
    }
  }
  
  return config;
}

/**
 * Cache sync credentials
 * @param {string} systemName - System name
 * @param {Object} credentials - Credentials to cache
 * @return {boolean} Success status
 */
function cacheSyncCredentials(systemName, credentials) {
  const key = `${CACHE_CONFIG.KEYS.CREDENTIALS}_${systemName}`;
  
  const credentialsWithMetadata = {
    ...credentials,
    cachedAt: new Date().toISOString(),
    systemName: systemName
  };
  
  return globalCacheManager.set(key, credentialsWithMetadata, CACHE_TIERS.TEMPORARY, CACHE_CONFIG.DURATIONS.CREDENTIALS);
}

/**
 * Get cached sync credentials
 * @param {string} systemName - System name
 * @return {Object|null} Cached credentials or null
 */
function getCachedCredentials(systemName = 'dentist_sync') {
  const key = `${CACHE_CONFIG.KEYS.CREDENTIALS}_${systemName}`;
  return globalCacheManager.get(key, CACHE_TIERS.TEMPORARY);
}

/**
 * Cache database function result
 * @param {string} functionName - Database function name
 * @param {Object} params - Function parameters
 * @param {*} result - Function result
 * @return {boolean} Success status
 */
function cacheDatabaseFunction(functionName, params, result) {
  const key = `${CACHE_CONFIG.KEYS.DATABASE_FUNCTIONS}_${functionName}_${JSON.stringify(params)}`;
  
  const cachedResult = {
    result: result,
    cachedAt: new Date().toISOString(),
    functionName: functionName,
    params: params
  };
  
  return globalCacheManager.set(key, cachedResult, CACHE_TIERS.TEMPORARY, CACHE_CONFIG.DURATIONS.DATABASE_FUNCTIONS);
}

/**
 * Get cached database function result
 * @param {string} functionName - Database function name
 * @param {Object} params - Function parameters
 * @return {*} Cached result or null
 */
function getCachedDatabaseFunction(functionName, params) {
  const key = `${CACHE_CONFIG.KEYS.DATABASE_FUNCTIONS}_${functionName}_${JSON.stringify(params)}`;
  const cached = globalCacheManager.get(key, CACHE_TIERS.TEMPORARY);
  
  return cached ? cached.result : null;
}

/**
 * Cache error recovery data
 * @param {string} errorKey - Error identification key
 * @param {Object} recoveryData - Recovery data
 * @return {boolean} Success status
 */
function cacheErrorRecovery(errorKey, recoveryData) {
  const key = `${CACHE_CONFIG.KEYS.ERROR_RECOVERY}_${errorKey}`;
  
  const recoveryWithMetadata = {
    ...recoveryData,
    cachedAt: new Date().toISOString(),
    errorKey: errorKey
  };
  
  return globalCacheManager.set(key, recoveryWithMetadata, CACHE_TIERS.PERSISTENT, CACHE_CONFIG.DURATIONS.ERROR_RECOVERY);
}

/**
 * Get cached error recovery data
 * @param {string} errorKey - Error identification key
 * @return {Object|null} Cached recovery data or null
 */
function getCachedErrorRecovery(errorKey) {
  const key = `${CACHE_CONFIG.KEYS.ERROR_RECOVERY}_${errorKey}`;
  return globalCacheManager.get(key, CACHE_TIERS.PERSISTENT);
}

/**
 * Create backup configuration for offline use
 * @param {Object} fullConfig - Complete configuration to backup
 * @return {boolean} Success status
 */
function createBackupConfig(fullConfig) {
  const backupConfig = {
    ...fullConfig,
    isBackup: true,
    createdAt: new Date().toISOString()
  };
  
  return globalCacheManager.set(CACHE_CONFIG.KEYS.BACKUP_CONFIG, backupConfig, CACHE_TIERS.BACKUP);
}

/**
 * Get backup configuration
 * @return {Object|null} Backup configuration or null
 */
function getBackupConfig() {
  const config = globalCacheManager.get(CACHE_CONFIG.KEYS.BACKUP_CONFIG, CACHE_TIERS.BACKUP);
  if (config) {
    Logger.log('Using backup configuration for offline operation');
  }
  return config;
}

/**
 * Invalidate provider-related caches
 * @param {string} spreadsheetId - Spreadsheet ID (optional)
 */
function invalidateProviderCaches(spreadsheetId = null) {
  if (spreadsheetId) {
    const key = `${CACHE_CONFIG.KEYS.PROVIDER_CONFIG}_${spreadsheetId}`;
    globalCacheManager.remove(key);
  } else {
    // Clear all provider configs
    globalCacheManager.remove(CACHE_CONFIG.KEYS.LAST_PROVIDER);
    // Could iterate through all keys, but this is a simple approach
  }
  
  Logger.log('Provider caches invalidated');
}

/**
 * Get cache manager statistics
 * @return {Object} Cache statistics
 */
function getCacheStatistics() {
  return globalCacheManager.getStatistics();
}

/**
 * Clear all cache data
 */
function clearAllCacheData() {
  globalCacheManager.clearAllCaches();
}

/**
 * Show cache status report
 */
function showCacheReport() {
  const stats = getCacheStatistics();
  
  console.log('📦 Cache Manager Report');
  console.log(`Version: ${stats.version}`);
  console.log(`Cache Hits: ${stats.hits}`);
  console.log(`Cache Misses: ${stats.misses}`);
  console.log(`Hit Ratio: ${(stats.hitRatio * 100).toFixed(2)}%`);
  console.log(`Sets: ${stats.sets}`);
  console.log(`Invalidations: ${stats.invalidations}`);
  console.log(`Errors: ${stats.errors}`);
  
  // Test cache functionality
  console.log('\n🧪 Testing Cache Functionality...');
  
  const testKey = 'cache_test';
  const testValue = { test: true, timestamp: Date.now() };
  
  const setSuccess = globalCacheManager.set(testKey, testValue);
  const getValue = globalCacheManager.get(testKey);
  const removeSuccess = globalCacheManager.remove(testKey);
  
  console.log(`Set Test: ${setSuccess ? '✅' : '❌'}`);
  console.log(`Get Test: ${getValue ? '✅' : '❌'}`);
  console.log(`Remove Test: ${removeSuccess ? '✅' : '❌'}`);
}