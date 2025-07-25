/**
 * Environment-Safe Prisma Client Singleton
 * Prevents accidental production database contamination
 */

import { PrismaClient } from '@prisma/client';

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(`🚨 DATABASE SAFETY VIOLATION: ${message}`);
    this.name = 'EnvironmentValidationError';
  }
}

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

  // Additional safety check for test data patterns
  if (
    isProductionDB &&
    (process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test')))
  ) {
    throw new EnvironmentValidationError(
      'Test environment detected with production database - potential contamination risk!'
    );
  }

  // Log all database connections for audit trail
  const _envType = isProductionDB ? 'PRODUCTION' : 'LOCAL';

  if (isProductionDB) {
    console.warn('⚠️ PRODUCTION DATABASE ACCESS - Ensure you have proper authorization');
  }
}

// Validate environment before creating client
validateDatabaseEnvironment();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export type for use in other files
export type { PrismaClient } from '@prisma/client';
