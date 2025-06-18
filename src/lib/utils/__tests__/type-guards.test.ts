/**
 * Type Guards Test Suite
 * 
 * Comprehensive tests for null safety type guards and assertion functions.
 * Demonstrates proper null safety testing patterns.
 */

import { describe, it, expect } from 'vitest';
import {
  isNonNull,
  isNotNull,
  isNotUndefined,
  assertNonNull,
  assertRequired,
  isNonEmptyArray,
  isNonEmptyString,
  filterNonNull,
  safeGet,
  safeArrayGet,
  safeJsonParse,
  safeAsync,
} from '../type-guards';
import { nullSafetyTestCases, testNullSafety } from '@/test-utils/null-safety-helpers';

describe('Type Guards', () => {
  describe('isNonNull', () => {
    it('should return true for non-null values', () => {
      expect(isNonNull('string')).toBe(true);
      expect(isNonNull(0)).toBe(true);
      expect(isNonNull(false)).toBe(true);
      expect(isNonNull([])).toBe(true);
      expect(isNonNull({})).toBe(true);
      expect(isNonNull(new Date())).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isNonNull(null)).toBe(false);
      expect(isNonNull(undefined)).toBe(false);
    });

    // Test with comprehensive null safety cases
    testNullSafety(
      isNonNull,
      nullSafetyTestCases.nullValues,
      'return-default',
      false
    );
  });

  describe('isNotNull', () => {
    it('should return true for non-null values', () => {
      expect(isNotNull('string')).toBe(true);
      expect(isNotNull(0)).toBe(true);
      expect(isNotNull(undefined)).toBe(true); // undefined is not null
    });

    it('should return false for null', () => {
      expect(isNotNull(null)).toBe(false);
    });
  });

  describe('isNotUndefined', () => {
    it('should return true for defined values', () => {
      expect(isNotUndefined('string')).toBe(true);
      expect(isNotUndefined(0)).toBe(true);
      expect(isNotUndefined(null)).toBe(true); // null is not undefined
    });

    it('should return false for undefined', () => {
      expect(isNotUndefined(undefined)).toBe(false);
    });
  });

  describe('assertNonNull', () => {
    it('should not throw for non-null values', () => {
      expect(() => assertNonNull('value')).not.toThrow();
      expect(() => assertNonNull(0)).not.toThrow();
      expect(() => assertNonNull(false)).not.toThrow();
      expect(() => assertNonNull([])).not.toThrow();
      expect(() => assertNonNull({})).not.toThrow();
    });

    it('should throw for null values', () => {
      expect(() => assertNonNull(null)).toThrow('Value cannot be null or undefined');
      expect(() => assertNonNull(undefined)).toThrow('Value cannot be null or undefined');
    });

    it('should throw with custom message', () => {
      expect(() => assertNonNull(null, 'Custom error message')).toThrow('Custom error message');
      expect(() => assertNonNull(undefined, 'Field is required')).toThrow('Field is required');
    });

    it('should preserve type information', () => {
      const value: string | null = 'test';
      assertNonNull(value);
      // TypeScript should now know that value is string, not string | null
      expect(value.length).toBe(4);
    });
  });

  describe('assertRequired', () => {
    it('should not throw for valid values', () => {
      expect(() => assertRequired('value', 'field')).not.toThrow();
      expect(() => assertRequired(0, 'count')).not.toThrow();
      expect(() => assertRequired(false, 'flag')).not.toThrow();
    });

    it('should throw with field name in message', () => {
      expect(() => assertRequired(null, 'email')).toThrow("Required field 'email' is missing");
      expect(() => assertRequired(undefined, 'name')).toThrow("Required field 'name' is missing");
    });

    it('should include context in error message', () => {
      expect(() => assertRequired(null, 'userId', 'user creation'))
        .toThrow("Required field 'userId' is missing in user creation");
    });
  });

  describe('isNonEmptyArray', () => {
    it('should return true for non-empty arrays', () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(['a'])).toBe(true);
      expect(isNonEmptyArray([null])).toBe(true); // Array with null is still non-empty
    });

    it('should return false for empty or invalid arrays', () => {
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
      expect(isNonEmptyArray('not an array')).toBe(false);
      expect(isNonEmptyArray(123)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString(' ')).toBe(true); // Space is not empty
      expect(isNonEmptyString('0')).toBe(true);
    });

    it('should return false for empty or invalid strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
    });
  });

  describe('filterNonNull', () => {
    it('should filter out null and undefined values', () => {
      const input = [1, null, 2, undefined, 3, null];
      const result = filterNonNull(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should preserve other falsy values', () => {
      const input = [0, false, '', null, undefined];
      const result = filterNonNull(input);
      expect(result).toEqual([0, false, '']);
    });

    it('should handle empty array', () => {
      expect(filterNonNull([])).toEqual([]);
    });

    it('should handle array with all null values', () => {
      expect(filterNonNull([null, undefined, null])).toEqual([]);
    });
  });

  describe('safeGet', () => {
    const testObject = {
      user: {
        profile: {
          name: 'John',
          settings: {
            theme: 'dark'
          }
        }
      }
    };

    it('should safely access nested properties', () => {
      expect(safeGet(testObject, 'user.profile.name')).toBe('John');
      expect(safeGet(testObject, 'user.profile.settings.theme')).toBe('dark');
    });

    it('should return undefined for missing properties', () => {
      expect(safeGet(testObject, 'user.profile.age')).toBeUndefined();
      expect(safeGet(testObject, 'user.missing.property')).toBeUndefined();
    });

    it('should return default value when specified', () => {
      expect(safeGet(testObject, 'user.profile.age', 25)).toBe(25);
      expect(safeGet(testObject, 'missing.path', 'default')).toBe('default');
    });

    it('should handle null/undefined objects', () => {
      expect(safeGet(null, 'any.path')).toBeUndefined();
      expect(safeGet(undefined, 'any.path')).toBeUndefined();
      expect(safeGet(null, 'any.path', 'default')).toBe('default');
    });
  });

  describe('safeArrayGet', () => {
    const testArray = ['a', 'b', 'c'];

    it('should safely access array elements', () => {
      expect(safeArrayGet(testArray, 0)).toBe('a');
      expect(safeArrayGet(testArray, 2)).toBe('c');
    });

    it('should return undefined for out-of-bounds indices', () => {
      expect(safeArrayGet(testArray, 5)).toBeUndefined();
      expect(safeArrayGet(testArray, -1)).toBeUndefined();
    });

    it('should return default value when specified', () => {
      expect(safeArrayGet(testArray, 5, 'default')).toBe('default');
    });

    it('should handle null/undefined arrays', () => {
      expect(safeArrayGet(null, 0)).toBeUndefined();
      expect(safeArrayGet(undefined, 0)).toBeUndefined();
      expect(safeArrayGet(null, 0, 'default')).toBe('default');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"name": "John"}')).toEqual({ name: 'John' });
      expect(safeJsonParse('[1, 2, 3]')).toEqual([1, 2, 3]);
      expect(safeJsonParse('"string"')).toBe('string');
    });

    it('should return null for invalid JSON', () => {
      expect(safeJsonParse('invalid json')).toBeNull();
      expect(safeJsonParse('{"incomplete": ')).toBeNull();
      expect(safeJsonParse('')).toBeNull();
    });

    it('should return default value for invalid JSON', () => {
      expect(safeJsonParse('invalid', {})).toEqual({});
      expect(safeJsonParse('invalid', [])).toEqual([]);
    });

    it('should handle null/undefined input', () => {
      expect(safeJsonParse(null)).toBeNull();
      expect(safeJsonParse(undefined)).toBeNull();
      expect(safeJsonParse(null, 'default')).toBe('default');
    });
  });

  describe('safeAsync', () => {
    it('should handle successful async operations', async () => {
      const successFn = async () => 'success';
      const result = await safeAsync(successFn);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should handle async errors', async () => {
      const errorFn = async () => {
        throw new Error('Test error');
      };
      const result = await safeAsync(errorFn);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Test error');
    });

    it('should handle non-Error rejections', async () => {
      const errorFn = async () => {
        throw 'String error';
      };
      const result = await safeAsync(errorFn);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should provide default value on error', async () => {
      const errorFn = async () => {
        throw new Error('Test error');
      };
      const result = await safeAsync(errorFn, 'default');
      
      expect(result.success).toBe(false);
      expect(result.data).toBe('default');
      expect(result.error).toBeInstanceOf(Error);
    });
  });
});
