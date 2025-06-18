# Null Safety Testing Patterns

## Overview

This document outlines comprehensive testing patterns for ensuring null safety compliance in the dental-dashboard project. All tests must validate proper handling of null, undefined, and edge cases.

## 🎯 Testing Principles

### Core Requirements
1. **Test null/undefined scenarios** for all functions and components
2. **Validate error handling** for missing data
3. **Ensure graceful degradation** when data is unavailable
4. **Test type guard functions** thoroughly
5. **Verify API error responses** are properly handled

### Testing Hierarchy
1. **Unit Tests** - Individual functions and utilities
2. **Component Tests** - React components with various props
3. **Integration Tests** - API routes and database operations
4. **E2E Tests** - Full user workflows with error scenarios

## 🧪 Unit Testing Patterns

### Type Guard Testing
```typescript
// src/lib/utils/__tests__/type-guards.test.ts
import { describe, it, expect } from 'vitest';
import { isNonNull, assertNonNull, isNonEmptyArray } from '../type-guards';

describe('Type Guards', () => {
  describe('isNonNull', () => {
    it('should return true for non-null values', () => {
      expect(isNonNull('string')).toBe(true);
      expect(isNonNull(0)).toBe(true);
      expect(isNonNull(false)).toBe(true);
      expect(isNonNull([])).toBe(true);
      expect(isNonNull({})).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isNonNull(null)).toBe(false);
      expect(isNonNull(undefined)).toBe(false);
    });
  });

  describe('assertNonNull', () => {
    it('should not throw for non-null values', () => {
      expect(() => assertNonNull('value')).not.toThrow();
      expect(() => assertNonNull(0)).not.toThrow();
      expect(() => assertNonNull(false)).not.toThrow();
    });

    it('should throw for null values', () => {
      expect(() => assertNonNull(null)).toThrow('Value cannot be null or undefined');
      expect(() => assertNonNull(undefined)).toThrow('Value cannot be null or undefined');
    });

    it('should throw with custom message', () => {
      expect(() => assertNonNull(null, 'Custom error')).toThrow('Custom error');
    });
  });

  describe('isNonEmptyArray', () => {
    it('should return true for non-empty arrays', () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(['a'])).toBe(true);
    });

    it('should return false for empty or invalid arrays', () => {
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
      expect(isNonEmptyArray('not an array')).toBe(false);
    });
  });
});
```

### API Utility Testing
```typescript
// src/lib/utils/__tests__/api-error-handler.test.ts
import { describe, it, expect } from 'vitest';
import { ApiErrorHandler, validateRequiredFields, ValidationError } from '../api-error-handler';

describe('API Error Handler', () => {
  describe('validateRequiredFields', () => {
    it('should not throw for valid data', () => {
      const data = { name: 'John', email: 'john@example.com' };
      expect(() => validateRequiredFields(data, ['name', 'email'])).not.toThrow();
    });

    it('should throw for missing fields', () => {
      const data = { name: 'John' };
      expect(() => validateRequiredFields(data, ['name', 'email']))
        .toThrow('Missing required fields: email');
    });

    it('should throw for null values', () => {
      const data = { name: 'John', email: null };
      expect(() => validateRequiredFields(data, ['name', 'email']))
        .toThrow('Missing required fields: email');
    });

    it('should throw for undefined values', () => {
      const data = { name: 'John', email: undefined };
      expect(() => validateRequiredFields(data, ['name', 'email']))
        .toThrow('Missing required fields: email');
    });

    it('should throw for empty strings', () => {
      const data = { name: 'John', email: '' };
      expect(() => validateRequiredFields(data, ['name', 'email']))
        .toThrow('Missing required fields: email');
    });
  });

  describe('ApiErrorHandler.validation', () => {
    it('should create validation error response', () => {
      const response = ApiErrorHandler.validation('Invalid input');
      expect(response.status).toBe(400);
    });
  });
});
```

## ⚛️ React Component Testing

### Component with Optional Props
```typescript
// src/components/__tests__/user-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserCard } from '../user-card';

describe('UserCard', () => {
  it('should render user information when user is provided', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      profile: { bio: 'Software developer' }
    };

    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
  });

  it('should handle undefined user gracefully', () => {
    render(<UserCard user={undefined} />);
    expect(screen.getByText('No user data available')).toBeInTheDocument();
  });

  it('should handle null user gracefully', () => {
    render(<UserCard user={null} />);
    expect(screen.getByText('No user data available')).toBeInTheDocument();
  });

  it('should handle user without profile', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
      // profile is undefined
    };

    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    // Should not crash when profile is undefined
    expect(screen.queryByText('Software developer')).not.toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<UserCard user={undefined} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const error = new Error('Failed to load user');
    render(<UserCard user={undefined} error={error} />);
    expect(screen.getByText('Error loading user')).toBeInTheDocument();
  });
});
```

### Hook Testing with Null Safety
```typescript
// src/hooks/__tests__/use-users.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUsers } from '../use-users';

// Mock fetch
global.fetch = vi.fn();

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful API response', async () => {
    const mockUsers = [
      { id: '1', name: 'John', email: 'john@example.com' }
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle API response with null users', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: null })
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle API response with undefined users', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}) // users property is undefined
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle network error', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  it('should handle 404 response', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
```

## 🔌 API Route Testing

### API Route with Error Handling
```typescript
// src/app/api/users/__tests__/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock Prisma
vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    }
  }
}));

describe('/api/users POST', () => {
  it('should create user with valid data', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    (prisma.user.create as any).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockUser);
  });

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John'
        // email is missing
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('email');
  });

  it('should return 400 for null values', async () => {
    const request = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: null
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    (prisma.user.create as any).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});
```

## 🔄 Integration Testing

### Database Query Testing
```typescript
// src/lib/database/queries/__tests__/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getUserById, createUser } from '../users';
import { prisma } from '@/lib/database/prisma';

describe('User Queries', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const createdUser = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });

      const user = await getUserById(createdUser.id);
      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
    });

    it('should return null when user not found', async () => {
      const user = await getUserById('non-existent-id');
      expect(user).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      await expect(getUserById('')).rejects.toThrow();
      await expect(getUserById(null as any)).rejects.toThrow();
      await expect(getUserById(undefined as any)).rejects.toThrow();
    });
  });
});
```

## 📋 Testing Checklist

### For Every Function
- [ ] Test with valid inputs
- [ ] Test with null inputs
- [ ] Test with undefined inputs
- [ ] Test with empty strings/arrays
- [ ] Test error conditions
- [ ] Test edge cases

### For Every Component
- [ ] Test with all required props
- [ ] Test with optional props missing
- [ ] Test with null/undefined props
- [ ] Test loading states
- [ ] Test error states
- [ ] Test user interactions

### For Every API Route
- [ ] Test successful requests
- [ ] Test missing required fields
- [ ] Test invalid data types
- [ ] Test authentication/authorization
- [ ] Test database errors
- [ ] Test network errors

### For Every Hook
- [ ] Test successful data fetching
- [ ] Test loading states
- [ ] Test error states
- [ ] Test with null/undefined responses
- [ ] Test cleanup on unmount

## 🚀 Test Utilities

### Custom Test Utilities
```typescript
// src/test-utils/null-safety-helpers.ts
export const nullSafetyTestCases = {
  nullValues: [null, undefined, '', 0, false, [], {}],
  invalidIds: ['', null, undefined, 'invalid-uuid'],
  emptyResponses: [null, undefined, {}, { data: null }, { data: undefined }],
};

export function testNullSafety<T>(
  fn: (input: any) => T,
  validInput: any,
  expectedBehavior: 'throw' | 'return-null' | 'return-default'
) {
  nullSafetyTestCases.nullValues.forEach(nullValue => {
    it(`should handle ${nullValue} safely`, () => {
      if (expectedBehavior === 'throw') {
        expect(() => fn(nullValue)).toThrow();
      } else if (expectedBehavior === 'return-null') {
        expect(fn(nullValue)).toBeNull();
      } else {
        expect(fn(nullValue)).toBeDefined();
      }
    });
  });
}
```

## 🎯 Test Coverage Goals

### Minimum Requirements
- **95% line coverage** for utility functions
- **90% branch coverage** for components
- **100% coverage** for type guards and assertions
- **All null/undefined paths** must be tested

### Quality Metrics
- **Zero non-null assertions** in test files
- **All async operations** properly awaited
- **Error scenarios** comprehensively tested
- **Edge cases** documented and tested

## 📚 Resources

### Test Setup Files
- `src/test-utils/null-safety-helpers.ts` - Testing utilities
- `vitest.config.ts` - Test configuration
- `src/vitest-setup.ts` - Global test setup

### Example Test Files
- `src/lib/utils/__tests__/type-guards.test.ts`
- `src/components/__tests__/user-card.test.tsx`
- `src/hooks/__tests__/use-users.test.ts`
- `src/app/api/users/__tests__/route.test.ts`

### Commands
- `pnpm test` - Run all tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:watch` - Run tests in watch mode

Remember: **Comprehensive testing is essential** for maintaining null safety compliance and preventing runtime errors.
