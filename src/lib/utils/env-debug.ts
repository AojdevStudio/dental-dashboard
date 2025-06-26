// Conditional imports for server-side only
const fs = typeof window === 'undefined' ? require('fs') : null;
const path = typeof window === 'undefined' ? require('path') : null;

/**
 * Environment debugging utility to help identify environment loading issues
 * Useful for troubleshooting environment variable problems in worktree setups
 */

interface EnvDebugInfo {
  currentDir: string;
  nodeEnv: string;
  envFilesFound: string[];
  envVariablesStatus: {
    [key: string]: {
      value: string | undefined;
      source: 'process.env' | 'missing';
      truncated?: boolean;
    };
  };
  isClient: boolean;
  isServer: boolean;
}

/**
 * Get detailed information about environment setup for debugging
 */
export function getEnvDebugInfo(): EnvDebugInfo {
  const isClient = typeof window !== 'undefined';
  const isServer = !isClient;
  const currentDir = isServer ? process.cwd() : 'browser-context';

  // Check for common .env file locations
  const envFiles = ['.env', '.env.local', '.env.development', '.env.test'];
  const envFilesFound: string[] = [];

  if (isServer && fs && path) {
    for (const file of envFiles) {
      const filePath = path.join(currentDir, file);
      if (fs.existsSync(filePath)) {
        envFilesFound.push(file);
      }
    }
  }

  // Check critical environment variables
  const criticalVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL',
    'NODE_ENV',
    'VERCEL_ENV',
  ];

  const envVariablesStatus: EnvDebugInfo['envVariablesStatus'] = {};

  for (const varName of criticalVars) {
    const value = process.env[varName];
    const hasValue = value !== undefined && value !== '';

    envVariablesStatus[varName] = {
      value: hasValue ? (value.length > 50 ? `${value.substring(0, 47)}...` : value) : undefined,
      source: hasValue ? 'process.env' : 'missing',
      truncated: hasValue && value.length > 50,
    };
  }

  return {
    currentDir,
    nodeEnv: process.env.NODE_ENV || 'unknown',
    envFilesFound,
    envVariablesStatus,
    isClient,
    isServer,
  };
}

/**
 * Log environment debug information to console
 * Only logs in development or when DEBUG_ENV is set
 */
export function logEnvDebugInfo(): void {
  const shouldDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_ENV === 'true';

  if (!shouldDebug) {
    return;
  }

  const info = getEnvDebugInfo();

  console.log('🔍 Environment Debug Info:');
  console.log(`📁 Current Directory: ${info.currentDir}`);
  console.log(`🌍 Node Environment: ${info.nodeEnv}`);
  console.log(`📋 Context: ${info.isClient ? 'Client' : 'Server'}`);

  if (info.envFilesFound.length > 0) {
    console.log(`📄 Environment Files Found: ${info.envFilesFound.join(', ')}`);
  } else {
    console.log('⚠️  No .env files found in current directory');
  }

  console.log('🔧 Environment Variables Status:');
  for (const [varName, status] of Object.entries(info.envVariablesStatus)) {
    const statusIcon = status.value ? '✅' : '❌';
    const truncatedInfo = status.truncated ? ' (truncated)' : '';
    console.log(`  ${statusIcon} ${varName}: ${status.value || 'MISSING'}${truncatedInfo}`);
  }

  console.log('---');
}

/**
 * Check if required environment variables are available
 * Returns true if all required vars are present, false otherwise
 */
export function checkRequiredEnvVars(requiredVars: string[] = []): boolean {
  const defaultRequired = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const varsToCheck = requiredVars.length > 0 ? requiredVars : defaultRequired;

  return varsToCheck.every((varName) => {
    const value = process.env[varName];
    return value !== undefined && value !== '';
  });
}

/**
 * Get a safe environment variable value with fallback
 */
export function getSafeEnvVar(varName: string, fallback?: string): string | undefined {
  const value = process.env[varName];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined) {
    console.warn(`⚠️  Environment variable ${varName} not found, using fallback`);
    return fallback;
  }

  return undefined;
}

/**
 * Verify .env file can be read from current directory
 */
export function verifyEnvFileAccess(): { canRead: boolean; path?: string; error?: string } {
  if (typeof window !== 'undefined') {
    return { canRead: false, error: 'Cannot read .env files from client-side' };
  }

  if (!fs || !path) {
    return { canRead: false, error: 'File system modules not available' };
  }

  const currentDir = process.cwd();
  const envPath = path.join(currentDir, '.env');

  try {
    if (!fs.existsSync(envPath)) {
      return { canRead: false, error: `.env file not found at ${envPath}` };
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!hasSupabaseUrl || !hasSupabaseKey) {
      return {
        canRead: true,
        path: envPath,
        error: 'Required Supabase variables not found in .env file',
      };
    }

    return { canRead: true, path: envPath };
  } catch (error) {
    return {
      canRead: false,
      error: `Error reading .env file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}