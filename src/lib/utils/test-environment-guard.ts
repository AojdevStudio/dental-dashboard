/**
 * Test Environment Guard
 *
 * Critical safety utility to prevent test data from contaminating production databases.
 * This module provides validation functions that MUST be called before any test data operations.
 */

export class TestEnvironmentError extends Error {
  constructor(message: string) {
    super(`🛡️ TEST ENVIRONMENT GUARD: ${message}`);
    this.name = 'TestEnvironmentError';
  }
}

/**
 * Validates that we're running in a safe test environment
 * Throws TestEnvironmentError if production environment is detected
 */
export function validateTestEnvironment(): void {
  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    throw new TestEnvironmentError('Cannot run test operations in production environment!');
  }

  // Check database URL for production indicators
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl?.includes('supabase.co')) {
    throw new TestEnvironmentError(
      'Production Supabase database detected! Use local test database only.'
    );
  }

  if (dbUrl && !dbUrl.includes('localhost')) {
    throw new TestEnvironmentError(`Non-localhost database detected: ${dbUrl.substring(0, 50)}...`);
  }

  // Check Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl?.includes('supabase.co')) {
    throw new TestEnvironmentError(
      'Production Supabase URL detected! Use local test instance only.'
    );
  }

  if (supabaseUrl && !supabaseUrl.includes('localhost')) {
    throw new TestEnvironmentError(`Non-localhost Supabase URL detected: ${supabaseUrl}`);
  }
}

/**
 * Validates that the current database connection is pointing to a test database
 */
export function validateTestDatabase(): void {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new TestEnvironmentError('No DATABASE_URL found in environment');
  }

  // Must be localhost and on test port
  if (!dbUrl.includes('localhost:54322')) {
    throw new TestEnvironmentError('Test database must use localhost:54322 (local Supabase)');
  }
}

/**
 * Validates that test operations are using the correct environment file
 */
export function validateTestEnvFile(): void {
  // Check if .env.test is being used
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbUrl = process.env.DATABASE_URL;

  if (supabaseUrl !== 'http://localhost:54321') {
    throw new TestEnvironmentError(
      'NEXT_PUBLIC_SUPABASE_URL must be http://localhost:54321 for tests'
    );
  }

  if (!dbUrl?.includes('localhost:54322')) {
    throw new TestEnvironmentError('DATABASE_URL must use localhost:54322 for tests');
  }
}

/**
 * Safe wrapper for test operations that automatically validates environment
 */
export function withTestEnvironmentValidation<T>(operation: () => T | Promise<T>): T | Promise<T> {
  validateTestEnvironment();
  validateTestDatabase();
  validateTestEnvFile();

  // This console.info is intentional for test environment validation logging
  console.info('✅ Test environment validation passed - proceeding with test operation');

  return operation();
}

/**
 * Environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: `${process.env.DATABASE_URL?.substring(0, 50)}...`,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    isTestEnvironment:
      process.env.NODE_ENV !== 'production' &&
      process.env.DATABASE_URL?.includes('localhost:54322'),
  };
}
