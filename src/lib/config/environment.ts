import { z } from 'zod';

/**
 * Environment variable validation schema
 * This replaces non-null assertions with proper runtime validation
 */
const EnvironmentSchema = z.object({
  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Database Configuration (Optional for some environments)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),

  // Service Keys (Server-side only)
  SUPABASE_SERVICE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_KEY is required for server operations')
    .optional(),

  // Environment Type
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Next.js Configuration
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required in production').optional(),

  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env with non-null assertions
 */
export const env = (() => {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
})();

/**
 * Type-safe environment access with runtime validation
 * Use this for conditional environment variable access
 */
export function getEnvVar(key: keyof typeof env): string | undefined {
  return env[key];
}

/**
 * Require environment variable with descriptive error
 * Use this when you need to assert a variable exists
 */
export function requireEnvVar(key: keyof typeof env): string {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not set. Please check your .env file or environment configuration.`
    );
  }
  return value;
}

/**
 * Check if we're in a specific environment
 */
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/**
 * Validate environment for specific contexts
 */
export function validateClientEnvironment() {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  if (!(clientEnv.NEXT_PUBLIC_SUPABASE_URL && clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error(
      'Client environment validation failed. Required Supabase configuration is missing.'
    );
  }

  return clientEnv;
}

export function validateServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error('validateServerEnvironment should only be called server-side');
  }

  const serverEnv = {
    ...validateClientEnvironment(),
    SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY,
    DATABASE_URL: env.DATABASE_URL,
  };

  return serverEnv;
}

export function validateTestEnvironment() {
  if (!isTest) {
    throw new Error('validateTestEnvironment should only be called in test environment');
  }

  const testEnv = {
    ...validateClientEnvironment(),
    DATABASE_URL: requireEnvVar('DATABASE_URL'),
  };

  // Ensure test database URL contains 'test' or 'localhost' for safety
  if (
    testEnv.DATABASE_URL &&
    !(testEnv.DATABASE_URL.includes('test') || testEnv.DATABASE_URL.includes('localhost'))
  ) {
    throw new Error(
      `Test database URL must contain "test" or "localhost" for safety. Got: ${testEnv.DATABASE_URL}`
    );
  }

  return testEnv;
}
