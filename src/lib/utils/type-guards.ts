/**
 * Type guards and assertion functions
 * These replace non-null assertions with safe type checking
 */

/**
 * Type guard to check if value is not null or undefined
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if value is not null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard to check if value is not undefined
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Assertion function that throws if value is null or undefined
 * Use this when you're certain a value should exist
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
 * Assertion function for required values
 * Provides context about what was expected
 */
export function assertRequired<T>(
  value: T | null | undefined,
  fieldName: string,
  context?: string
): asserts value is T {
  if (value === null || value === undefined) {
    const contextInfo = context ? ` in ${context}` : '';
    throw new Error(`Required field '${fieldName}' is missing${contextInfo}`);
  }
}

/**
 * Type guard for checking if object has a specific property
 */
export function hasProperty<T extends object, K extends string | number | symbol>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Type guard for checking if object has a non-null property
 */
export function hasNonNullProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): obj is T & Required<Pick<T, K>> {
  return obj[key] !== null && obj[key] !== undefined;
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
 * Safe nested property access
 */
export function safeGetNested<T>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue?: T
): T | undefined {
  try {
    const value = path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);

    return value !== null && value !== undefined ? (value as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Type guard for arrays
 */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for strings
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for numbers
 */
export function isValidNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Filter function that removes null/undefined values from arrays
 */
export function filterNonNull<T>(items: (T | null | undefined)[]): T[] {
  return items.filter(isNonNull);
}

/**
 * Map function that safely transforms values, skipping null/undefined
 */
export function mapNonNull<T, U>(items: (T | null | undefined)[], transform: (item: T) => U): U[] {
  return items.filter(isNonNull).map(transform);
}

/**
 * Type guard for checking if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Type guard for checking if value is a valid Date
 */
export function isValidDate(value: Date | null | undefined): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Type guard for checking if value is a valid URL string
 */
export function isValidUrl(value: string | null | undefined): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Email validation regex - defined at module level for performance
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Type guard for checking if value is a valid email string
 */
export function isValidEmail(value: string | null | undefined): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  return EMAIL_REGEX.test(value);
}

/**
 * Result type for operations that might fail
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await operation();
    return success(data);
  } catch (error) {
    return failure(isError(error) ? error : new Error(getErrorMessage(error)));
  }
}
