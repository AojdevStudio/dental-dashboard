# TypeScript Null Safety Technical Implementation Guide

## Overview

This guide provides detailed technical instructions for implementing null safety patterns and eliminating non-null assertions in the dental-dashboard project.

## Core Utilities Implementation

### 1. Environment Validation Utility

Create `src/lib/config/environment.ts`:

```typescript
import { z } from 'zod';

/**
 * Environment variable validation schema
 * Replaces non-null assertions with runtime validation
 */
const EnvironmentSchema = z.object({
  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Database Configuration (Optional for client-side)
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .optional(),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Client-side environment variables (safe for browser)
 */
const ClientEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: EnvironmentSchema.shape.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: EnvironmentSchema.shape.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Test environment validation
 */
const TestEnvironmentSchema = EnvironmentSchema.extend({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (url) => url.includes('test') || url.includes('localhost'),
      'Test DATABASE_URL must contain "test" or "localhost" for safety'
    ),
});

/**
 * Validated environment variables
 * Use this instead of process.env with non-null assertions
 */
export const env = EnvironmentSchema.parse(process.env);

/**
 * Client-safe environment variables
 * Use in browser-side code
 */
export const clientEnv = ClientEnvironmentSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Test environment validation
 * Use in test configuration files
 */
export const testEnv = TestEnvironmentSchema.parse(process.env);

/**
 * Environment validation error handler
 */
export function validateEnvironment() {
  try {
    EnvironmentSchema.parse(process.env);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
      return {
        success: false,
        error: `Missing or invalid environment variables: ${missingVars}`,
      };
    }
    return {
      success: false,
      error: 'Unknown environment validation error',
    };
  }
}
```

### 2. Type Guards & Assertion Utilities

Create `src/lib/utils/type-guards.ts`:

```typescript
/**
 * Type guard utilities for safe null checking
 * Replaces non-null assertions with explicit validation
 */

/**
 * Asserts that a value is not null or undefined
 * Throws an error if the value is nullish
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value cannot be null or undefined');
  }
}

/**
 * Type guard to check if a value is not null or undefined
 * Returns true if the value is defined
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is defined (not undefined)
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard to check if a value is not null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Safe property access with default value
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue;
}

/**
 * Safe array access with bounds checking
 */
export function safeArrayGet<T>(
  array: T[] | null | undefined,
  index: number,
  defaultValue: T
): T {
  return array?.[index] ?? defaultValue;
}

/**
 * Filter out null and undefined values from an array
 */
export function filterNonNull<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isNonNull);
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse<T>(
  json: string,
  defaultValue: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Assert that an environment variable exists
 */
export function assertEnvVar(
  name: string,
  value: string | undefined
): asserts value is string {
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
}

/**
 * Validate that a user has required properties
 */
export function assertValidUser(
  user: unknown
): asserts user is { id: string; email: string } {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user object');
  }
  
  const userObj = user as Record<string, unknown>;
  
  if (typeof userObj.id !== 'string' || !userObj.id) {
    throw new Error('User must have a valid ID');
  }
  
  if (typeof userObj.email !== 'string' || !userObj.email) {
    throw new Error('User must have a valid email');
  }
}

/**
 * Safe database record access
 */
export function assertDatabaseRecord<T extends { id: string }>(
  record: T | null,
  entityName: string
): asserts record is T {
  if (!record) {
    throw new Error(`${entityName} not found`);
  }
}

/**
 * Validate API response structure
 */
export function assertApiResponse<T>(
  response: unknown,
  validator: (data: unknown) => data is T
): asserts response is T {
  if (!validator(response)) {
    throw new Error('Invalid API response structure');
  }
}
```

### 3. Safe API Response Handlers

Create `src/lib/utils/api-helpers.ts`:

```typescript
import { z } from 'zod';

/**
 * Safe API response handling utilities
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    success: true,
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse<T>(error: string): ApiResponse<T> {
  return {
    data: null,
    error,
    success: false,
  };
}

/**
 * Safe fetch with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  validator?: z.ZodSchema<T>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      return createErrorResponse(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    const data = await response.json();
    
    if (validator) {
      const validationResult = validator.safeParse(data);
      if (!validationResult.success) {
        return createErrorResponse('Invalid response format');
      }
      return createSuccessResponse(validationResult.data);
    }
    
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Safe form data extraction
 */
export function safeFormData(
  formData: FormData,
  key: string,
  defaultValue: string = ''
): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Safe URL search params extraction
 */
export function safeSearchParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = ''
): string {
  return searchParams.get(key) ?? defaultValue;
}
```

## Migration Patterns

### 1. Environment Variable Access

**Before**:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
```

**After**:
```typescript
import { clientEnv } from '@/lib/config/environment';
const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
```

### 2. Optional Property Access

**Before**:
```typescript
const userName = user.profile!.name;
```

**After**:
```typescript
const userName = user.profile?.name ?? 'Unknown User';
```

### 3. Array Access

**Before**:
```typescript
const firstItem = items[0]!;
```

**After**:
```typescript
import { safeArrayGet } from '@/lib/utils/type-guards';
const firstItem = safeArrayGet(items, 0, defaultItem);
```

### 4. Database Record Access

**Before**:
```typescript
const record = await prisma.user.findUnique({ where: { id } });
return record!.name;
```

**After**:
```typescript
import { assertDatabaseRecord } from '@/lib/utils/type-guards';
const record = await prisma.user.findUnique({ where: { id } });
assertDatabaseRecord(record, 'User');
return record.name;
```

### 5. API Response Handling

**Before**:
```typescript
const response = await fetch('/api/data');
const data = await response.json();
return data.result!;
```

**After**:
```typescript
import { safeFetch } from '@/lib/utils/api-helpers';
const response = await safeFetch('/api/data', undefined, DataSchema);
if (!response.success) {
  throw new Error(response.error);
}
return response.data.result;
```

## Testing Patterns

### 1. Environment Variable Testing

```typescript
// test-utils/environment.ts
export function mockEnvironment(overrides: Record<string, string>) {
  const originalEnv = process.env;
  process.env = { ...originalEnv, ...overrides };
  
  return () => {
    process.env = originalEnv;
  };
}
```

### 2. Null Safety Testing

```typescript
// Example test
describe('null safety', () => {
  it('should handle null user gracefully', () => {
    const result = getUserName(null);
    expect(result).toBe('Anonymous');
  });
  
  it('should throw on invalid environment', () => {
    const restore = mockEnvironment({ NEXT_PUBLIC_SUPABASE_URL: '' });
    expect(() => validateEnvironment()).toThrow();
    restore();
  });
});
```

## Implementation Checklist

- [ ] Create environment validation utility
- [ ] Create type guard utilities  
- [ ] Create API helper utilities
- [ ] Update Supabase configuration
- [ ] Update authentication context
- [ ] Fix financial services
- [ ] Fix database queries
- [ ] Fix React components
- [ ] Add comprehensive tests
- [ ] Update documentation

This guide provides the foundation for systematic null safety implementation across the dental-dashboard codebase.
