/**
 * @fileoverview Environment-Safe Prisma Client Singleton
 *
 * This module provides a singleton Prisma client with comprehensive safety measures
 * to prevent accidental production database contamination during development and testing.
 *
 * Key Safety Features:
 * - Environment validation before client creation
 * - Production database access blocking in test environments
 * - Audit logging for all production database connections
 * - Singleton pattern to prevent multiple client instances
 * - Development-friendly query logging
 *
 * The client automatically detects database types and applies appropriate safety measures
 * based on connection strings and environment variables.
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Custom error class for database environment validation failures
 *
 * This error is thrown when the system detects potentially unsafe database
 * operations, such as attempting to connect to production databases from
 * test environments or when safety checks fail.
 *
 * @extends Error
 */
class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(`🚨 DATABASE SAFETY VIOLATION: ${message}`);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates database environment safety to prevent production contamination
 *
 * This function implements comprehensive checks to ensure safe database access:
 * - Identifies test vs production databases using known identifiers
 * - Blocks production access unless explicitly allowed
 * - Prevents test environments from accessing production data
 * - Logs all production database connections for audit purposes
 *
 * @throws {EnvironmentValidationError} When unsafe database access is detected
 *
 * @example
 * // Automatically called during module initialization
 * // Will throw if trying to access production DB from test environment
 *
 * @example
 * // Allow production access explicitly
 * process.env.ALLOW_PRODUCTION_DB = 'true';
 * // Now production database access is permitted
 */
function validateDatabaseEnvironment(): void {
  const dbUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Define known test database identifiers
  const testDbIdentifiers = [
    'bxnkocxoacakljbcnulv', // Test Supabase project ID
    'localhost',
  ];

  // Critical: Detect production vs test database
  const isTestDB = testDbIdentifiers.some((id) => dbUrl?.includes(id) || supabaseUrl?.includes(id));
  const isProductionDB =
    (dbUrl?.includes('supabase.com') || supabaseUrl?.includes('supabase.co')) && !isTestDB;
  const _isTestEnvironment = nodeEnv === 'test' || isTestDB;

  // Block production access unless explicitly allowed
  if (isProductionDB && !process.env.ALLOW_PRODUCTION_DB) {
    throw new EnvironmentValidationError(
      `Production database access blocked for safety.\nDatabase URL: ${dbUrl}\nEnvironment: ${nodeEnv}\nTo allow production access, set ALLOW_PRODUCTION_DB=true`
    );
  }

  // Additional safety check for test data patterns - only block if explicitly in test mode
  if (isProductionDB && process.env.NODE_ENV === 'test' && !process.env.ALLOW_PRODUCTION_DB) {
    throw new EnvironmentValidationError(
      'Test environment detected with production database - potential contamination risk!'
    );
  }

  // Log all database connections for audit trail
  const _envType = isProductionDB ? 'PRODUCTION' : 'LOCAL';

  if (isProductionDB) {
    logger.warn('Production database access detected', {
      databaseUrl: `${dbUrl?.substring(0, 50)}...`,
      environment: nodeEnv,
      supabaseUrl: `${supabaseUrl?.substring(0, 50)}...`,
      timestamp: new Date().toISOString(),
    });
  }
}

// Validate environment before creating client - critical safety check
validateDatabaseEnvironment();

/**
 * Global object extension for storing the Prisma client singleton
 *
 * This type extension allows us to attach the Prisma client to the global
 * object in development environments, preventing multiple client instances
 * during hot module reloading.
 *
 * @type {Object}
 * @property {PrismaClient | undefined} prisma - The cached Prisma client instance
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client instance with environment-aware configuration
 *
 * This client provides secure database access with the following features:
 * - Environment validation to prevent production contamination
 * - Singleton pattern to avoid connection pool exhaustion
 * - Development-friendly query logging
 * - Production-optimized error-only logging
 *
 * The client is automatically configured based on the detected environment:
 * - Development: Logs queries, errors, and warnings for debugging
 * - Production: Logs only errors to reduce overhead
 * - Test: Uses cached instance to prevent multiple connections
 *
 * @type {PrismaClient}
 * @example
 * // Import and use the singleton client
 * import { prisma } from '@/lib/database/client';
 *
 * const users = await prisma.user.findMany();
 *
 * @example
 * // Client automatically handles environment safety
 * // Will throw EnvironmentValidationError if unsafe access detected
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

/**
 * Cache the Prisma client instance in non-production environments
 *
 * In development and test environments, we store the client on the global
 * object to prevent creating multiple instances during hot module reloading.
 * This is not necessary in production where the application lifecycle is stable.
 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Re-export PrismaClient type for type safety in consuming modules
 *
 * This allows other modules to import the PrismaClient type without
 * directly depending on @prisma/client, maintaining clean dependencies.
 *
 * @example
 * import type { PrismaClient } from '@/lib/database/client';
 *
 * function useDatabase(client: PrismaClient) {
 *   // Type-safe database operations
 * }
 */
export type { PrismaClient } from '@prisma/client';
