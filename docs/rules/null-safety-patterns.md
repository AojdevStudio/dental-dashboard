# Null Safety Patterns & Best Practices

## Overview

This document outlines null safety patterns and best practices for the dental-dashboard project. These patterns replace non-null assertions (`!`) with safe, explicit null handling.

## Core Principles

1. **Explicit over Implicit**: Make null handling explicit and visible
2. **Fail Fast**: Validate inputs at boundaries and fail early with clear errors
3. **Type Safety**: Use TypeScript's type system to prevent null reference errors
4. **Graceful Degradation**: Handle null values gracefully in UI components

## Environment Variables

### ❌ Unsafe Pattern
```typescript
// DON'T: Using non-null assertion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

### ✅ Safe Pattern
```typescript
// DO: Use validated environment configuration
import { env } from '@/lib/config/environment';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

## Optional Property Access

### ❌ Unsafe Pattern
```typescript
// DON'T: Force unwrapping optional properties
const userName = user.profile!.name;
const address = user.profile!.address!.street;
```

### ✅ Safe Pattern
```typescript
// DO: Use optional chaining and nullish coalescing
const userName = user.profile?.name ?? 'Unknown User';
const address = user.profile?.address?.street ?? 'No address provided';

// Or with explicit checks for complex logic
if (user.profile?.name) {
  // Safe to use user.profile.name here
  console.log(`Welcome, ${user.profile.name}!`);
}
```

## Array Access

### ❌ Unsafe Pattern
```typescript
// DON'T: Assume array has elements
const firstItem = items[0]!;
const lastItem = items[items.length - 1]!;
```

### ✅ Safe Pattern
```typescript
// DO: Check array bounds or use safe access
const firstItem = items[0] ?? defaultItem;
const lastItem = items.at(-1) ?? defaultItem;

// Or with explicit checks
if (items.length > 0) {
  const firstItem = items[0];
  // Safe to use firstItem here
}

// Using utility function
import { safeArrayGet } from '@/lib/utils/type-guards';
const firstItem = safeArrayGet(items, 0, defaultItem);
```

## Database Record Access

### ❌ Unsafe Pattern
```typescript
// DON'T: Assume database records exist
const user = await prisma.user.findUnique({ where: { id } });
return user!.name;
```

### ✅ Safe Pattern
```typescript
// DO: Validate database results
import { assertDatabaseRecord } from '@/lib/utils/type-guards';

const user = await prisma.user.findUnique({ where: { id } });
assertDatabaseRecord(user, 'User');
return user.name;

// Or with explicit null handling
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new Error('User not found');
}
return user.name;

// Or return optional result
const user = await prisma.user.findUnique({ where: { id } });
return user?.name ?? null;
```

## API Response Handling

### ❌ Unsafe Pattern
```typescript
// DON'T: Assume API responses have expected structure
const response = await fetch('/api/data');
const data = await response.json();
return data.result!;
```

### ✅ Safe Pattern
```typescript
// DO: Validate API responses
import { z } from 'zod';

const ResponseSchema = z.object({
  result: z.string(),
  success: z.boolean(),
});

const response = await fetch('/api/data');
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}

const data = await response.json();
const validatedData = ResponseSchema.parse(data);
return validatedData.result;

// Or using safe fetch utility
import { safeFetch } from '@/lib/utils/api-helpers';

const response = await safeFetch('/api/data', undefined, ResponseSchema);
if (!response.success) {
  throw new Error(response.error);
}
return response.data.result;
```

## Form Data Handling

### ❌ Unsafe Pattern
```typescript
// DON'T: Assume form fields exist
const email = formData.get('email')! as string;
const password = formData.get('password')! as string;
```

### ✅ Safe Pattern
```typescript
// DO: Validate form data
import { assertNonEmptyString } from '@/lib/utils/type-guards';

const email = formData.get('email');
const password = formData.get('password');

assertNonEmptyString(email, 'email');
assertNonEmptyString(password, 'password');

// Now email and password are guaranteed to be non-empty strings

// Or with explicit validation
const email = formData.get('email');
const password = formData.get('password');

if (typeof email !== 'string' || !email.trim()) {
  throw new Error('Email is required');
}
if (typeof password !== 'string' || !password.trim()) {
  throw new Error('Password is required');
}
```

## React Component Patterns

### ❌ Unsafe Pattern
```typescript
// DON'T: Force unwrap props or state
function UserProfile({ user }: { user: User | null }) {
  return (
    <div>
      <h1>{user!.name}</h1>
      <p>{user!.email}</p>
    </div>
  );
}
```

### ✅ Safe Pattern
```typescript
// DO: Handle null states explicitly
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Or with optional rendering
function UserProfile({ user }: { user: User | null }) {
  return (
    <div>
      {user ? (
        <>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </>
      ) : (
        <div>No user data available</div>
      )}
    </div>
  );
}
```

## Error Handling Patterns

### ❌ Unsafe Pattern
```typescript
// DON'T: Ignore potential null values in error scenarios
try {
  const result = await riskyOperation();
  return result.data!;
} catch (error) {
  return error.message!;
}
```

### ✅ Safe Pattern
```typescript
// DO: Handle errors and null values explicitly
import { getErrorMessage } from '@/lib/utils/type-guards';

try {
  const result = await riskyOperation();
  if (!result.data) {
    throw new Error('Operation succeeded but returned no data');
  }
  return result.data;
} catch (error) {
  return getErrorMessage(error);
}

// Or using Result pattern
import { safeAsync } from '@/lib/utils/type-guards';

const result = await safeAsync(() => riskyOperation());
if (!result.success) {
  return { error: result.error.message };
}

if (!result.data.data) {
  return { error: 'No data returned' };
}

return { data: result.data.data };
```

## Migration Checklist

When refactoring code to eliminate non-null assertions:

### 1. Identify the Assertion
- [ ] Find the `!` operator usage
- [ ] Understand why the assertion was used
- [ ] Determine the expected type and behavior

### 2. Choose the Right Pattern
- [ ] **Environment variables**: Use validated config
- [ ] **Optional properties**: Use optional chaining
- [ ] **Array access**: Check bounds or use safe access
- [ ] **Database records**: Validate existence
- [ ] **API responses**: Validate structure
- [ ] **Form data**: Validate input

### 3. Implement Safe Alternative
- [ ] Add proper null checks
- [ ] Use type guards where appropriate
- [ ] Add meaningful error messages
- [ ] Handle edge cases gracefully

### 4. Test the Changes
- [ ] Test with null/undefined values
- [ ] Test error scenarios
- [ ] Verify type safety
- [ ] Check runtime behavior

## Common Utilities

### Type Guards
```typescript
import {
  isNonNull,
  assertNonNull,
  assertRequired,
  isNonEmptyArray,
  isNonEmptyString,
  filterNonNull
} from '@/lib/utils/type-guards';
```

### Environment Access
```typescript
import { env, requireEnvVar } from '@/lib/config/environment';
```

### Safe Operations
```typescript
import {
  safeGet,
  safeArrayGet,
  safeJsonParse,
  safeAsync
} from '@/lib/utils/type-guards';
```

## Code Review Guidelines

When reviewing code, check for:

- [ ] No non-null assertions (`!`) in new code
- [ ] Environment variables accessed through validated config
- [ ] Optional properties accessed with optional chaining
- [ ] Database results validated before use
- [ ] API responses properly typed and validated
- [ ] Form data validated before processing
- [ ] Error handling includes null/undefined cases
- [ ] React components handle loading/null states

## Performance Considerations

- **Validation Overhead**: Minimal - validation only at boundaries
- **Type Checking**: Zero runtime cost - compile-time only
- **Error Handling**: Better user experience with clear error messages
- **Memory Usage**: Negligible impact from additional checks

## Benefits

1. **Runtime Safety**: Eliminates null reference errors
2. **Better Error Messages**: Clear, actionable error information
3. **Type Safety**: Full TypeScript null safety compliance
4. **Maintainability**: Explicit null handling makes code easier to understand
5. **Debugging**: Easier to trace null-related issues
6. **User Experience**: Graceful handling of edge cases

This guide provides the foundation for maintaining null safety throughout the dental-dashboard codebase.
