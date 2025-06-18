/**
 * Null Safety Testing Utilities
 *
 * Provides utilities for testing null safety compliance
 * and ensuring proper error handling.
 */

import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Regex patterns for error boundary testing
const SOMETHING_WENT_WRONG_REGEX = /something went wrong/i;

/**
 * Common null/undefined test cases
 */
export const nullSafetyTestCases = {
  nullValues: [null, undefined],
  emptyValues: ['', 0, false, [], {}],
  invalidIds: ['', null, undefined, 'invalid-uuid', 123, true],
  emptyResponses: [
    null,
    undefined,
    {},
    { data: null },
    { data: undefined },
    { users: null },
    { users: undefined },
  ],
  invalidEmails: ['', null, undefined, 'invalid-email', '@example.com', 'user@', 'user@.com'],
  invalidDates: ['', null, undefined, 'invalid-date', '2023-13-45', 'not-a-date'],
};

/**
 * Test a function's null safety behavior
 */
export function testNullSafety<T>(
  fn: (input: unknown) => T,
  testCases: unknown[],
  expectedBehavior: 'throw' | 'return-null' | 'return-default' | 'return-empty-array',
  defaultValue?: T
) {
  for (const testCase of testCases) {
    const testName = `should handle ${JSON.stringify(testCase)} safely`;

    it(testName, () => {
      if (expectedBehavior === 'throw') {
        expect(() => fn(testCase)).toThrow();
      } else if (expectedBehavior === 'return-null') {
        expect(fn(testCase)).toBeNull();
      } else if (expectedBehavior === 'return-empty-array') {
        expect(fn(testCase)).toEqual([]);
      } else if (expectedBehavior === 'return-default') {
        expect(fn(testCase)).toEqual(defaultValue);
      }
    });
  }
}

/**
 * Test async function's null safety behavior
 */
export function testAsyncNullSafety<T>(
  fn: (input: unknown) => Promise<T>,
  testCases: unknown[],
  expectedBehavior: 'throw' | 'return-null' | 'return-default' | 'return-empty-array',
  defaultValue?: T
) {
  for (const testCase of testCases) {
    const testName = `should handle ${JSON.stringify(testCase)} safely (async)`;

    it(testName, async () => {
      if (expectedBehavior === 'throw') {
        await expect(fn(testCase)).rejects.toThrow();
      } else if (expectedBehavior === 'return-null') {
        const result = await fn(testCase);
        expect(result).toBeNull();
      } else if (expectedBehavior === 'return-empty-array') {
        const result = await fn(testCase);
        expect(result).toEqual([]);
      } else if (expectedBehavior === 'return-default') {
        const result = await fn(testCase);
        expect(result).toEqual(defaultValue);
      }
    });
  }
}

/**
 * Test component's null safety with various prop combinations
 */
export function testComponentNullSafety<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  requiredProps: T,
  optionalProps: string[]
) {
  describe('Null Safety', () => {
    it('should render with all props provided', () => {
      const allProps = { ...requiredProps };
      for (const prop of optionalProps) {
        (allProps as Record<string, unknown>)[prop] = `test-${prop}`;
      }

      expect(() => render(<Component {...allProps} />)).not.toThrow();
    });

    it('should render with only required props', () => {
      expect(() => render(<Component {...requiredProps} />)).not.toThrow();
    });

    for (const prop of optionalProps) {
      it(`should handle missing ${prop} prop`, () => {
        expect(() => render(<Component {...requiredProps} />)).not.toThrow();
      });

      it(`should handle null ${prop} prop`, () => {
        const props = { ...requiredProps, [prop]: null };
        expect(() => render(<Component {...props} />)).not.toThrow();
      });

      it(`should handle undefined ${prop} prop`, () => {
        const props = { ...requiredProps, [prop]: undefined };
        expect(() => render(<Component {...props} />)).not.toThrow();
      });
    }
  });
}

/**
 * Test API response handling
 */
export function testApiResponseHandling<T, R>(handler: (response: T) => R, validResponse: T) {
  describe('API Response Handling', () => {
    it('should handle valid response', () => {
      expect(() => handler(validResponse)).not.toThrow();
    });

    for (const emptyResponse of nullSafetyTestCases.emptyResponses) {
      it(`should handle empty response: ${JSON.stringify(emptyResponse)}`, () => {
        expect(() => handler(emptyResponse as T)).not.toThrow();
      });
    }

    it('should handle malformed response', () => {
      const malformedResponses = ['not-json', 123, true, [], { error: 'Something went wrong' }];

      for (const response of malformedResponses) {
        expect(() => handler(response as T)).not.toThrow();
      }
    });
  });
}

/**
 * Test form validation
 */
export function testFormValidation<T extends Record<string, unknown>>(
  validator: (data: T) => boolean | string[],
  validData: T,
  requiredFields: string[]
) {
  describe('Form Validation', () => {
    it('should validate correct data', () => {
      const result = validator(validData);
      expect(result).toBe(true);
    });

    for (const field of requiredFields) {
      it(`should reject missing ${field}`, () => {
        const invalidData = { ...validData };
        delete invalidData[field];

        const result = validator(invalidData);
        expect(result).not.toBe(true);
      });

      it(`should reject null ${field}`, () => {
        const invalidData = { ...validData, [field]: null };

        const result = validator(invalidData);
        expect(result).not.toBe(true);
      });

      it(`should reject undefined ${field}`, () => {
        const invalidData = { ...validData, [field]: undefined };

        const result = validator(invalidData);
        expect(result).not.toBe(true);
      });

      it(`should reject empty ${field}`, () => {
        const invalidData = { ...validData, [field]: '' };

        const result = validator(invalidData);
        expect(result).not.toBe(true);
      });
    }
  });
}

/**
 * Test database query error handling
 */
export function testDatabaseErrorHandling<T, R>(query: (params: T) => Promise<R>, validParams: T) {
  describe('Database Error Handling', () => {
    it('should handle valid parameters', async () => {
      await expect(query(validParams)).resolves.toBeDefined();
    });

    it('should handle null parameters', async () => {
      await expect(query(null as T)).rejects.toThrow();
    });

    it('should handle undefined parameters', async () => {
      await expect(query(undefined as T)).rejects.toThrow();
    });

    it('should handle empty object parameters', async () => {
      await expect(query({} as T)).rejects.toThrow();
    });
  });
}

/**
 * Mock fetch for testing API calls
 */
export function mockFetch(response: unknown, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

/**
 * Mock fetch error
 */
export function mockFetchError(error: Error) {
  global.fetch = vi.fn().mockRejectedValue(error);
}

/**
 * Create test user data
 */
export function createTestUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    clinicId: 'test-clinic-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create test clinic data
 */
export function createTestClinic(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-clinic-id',
    name: 'Test Clinic',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Assert that a value is null-safe
 */
export function assertNullSafe<T>(
  value: T,
  message = 'Value should be null-safe'
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`${message}: Value is ${value}`);
  }
}

/**
 * Test error boundary behavior
 */
export function testErrorBoundary(
  ErrorBoundaryComponent: React.ComponentType<{ children: React.ReactNode }>,
  ThrowingComponent: React.ComponentType
) {
  describe('Error Boundary', () => {
    it('should catch and display error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundaryComponent>
          <ThrowingComponent />
        </ErrorBoundaryComponent>
      );

      expect(screen.getByText(SOMETHING_WENT_WRONG_REGEX)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should render children when no error', () => {
      render(
        <ErrorBoundaryComponent>
          <div>Normal content</div>
        </ErrorBoundaryComponent>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });
}
