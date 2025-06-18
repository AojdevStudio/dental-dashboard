# Null Safety Developer Guidelines

## Overview

This document provides comprehensive guidelines for maintaining null safety compliance in the dental-dashboard project. All developers must follow these guidelines to ensure code quality and prevent runtime errors.

## 🚫 Prohibited Patterns

### Non-Null Assertions
**NEVER use the non-null assertion operator (`!`)**

```typescript
// ❌ PROHIBITED - Will cause build failure
const value = getValue()!;
const user = session.user!;
const data = response.data!;
```

### Unsafe Property Access
```typescript
// ❌ PROHIBITED - Can cause runtime errors
const name = user.profile.name;
const count = data.items.length;
```

## ✅ Required Patterns

### 1. Optional Chaining
```typescript
// ✅ REQUIRED - Safe property access
const name = user?.profile?.name;
const count = data?.items?.length ?? 0;
```

### 2. Nullish Coalescing
```typescript
// ✅ REQUIRED - Provide defaults for null/undefined
const title = post?.title ?? 'Untitled';
const items = response?.data ?? [];
```

### 3. Type Guards
```typescript
// ✅ REQUIRED - Use provided type guards
import { isNonNull, assertNonNull } from '@/lib/utils/type-guards';

if (isNonNull(user)) {
  // user is guaranteed to be non-null here
  console.log(user.name);
}

// For cases where you're certain a value exists
assertNonNull(user, 'User must be authenticated');
```

### 4. Environment Variables
```typescript
// ✅ REQUIRED - Use validated environment access
import { env } from '@/lib/config/environment';

const apiUrl = env.NEXT_PUBLIC_API_URL; // Validated at startup
```

## 🛠️ Development Workflow

### Before Writing Code
1. **Review existing patterns** in similar files
2. **Check type definitions** to understand nullable properties
3. **Plan error handling** for null/undefined cases

### While Writing Code
1. **Use TypeScript strict mode** - it's already enabled
2. **Handle optional properties** with optional chaining
3. **Provide meaningful defaults** with nullish coalescing
4. **Add proper error messages** when using assertions

### Before Committing
1. **Run pre-commit hooks** - they will block non-compliant code
2. **Test null scenarios** - ensure your code handles edge cases
3. **Review your changes** for null safety compliance

## 📋 Code Review Checklist

### For Authors
- [ ] No non-null assertions (`!`) in the code
- [ ] Optional chaining used for optional properties
- [ ] Meaningful defaults provided for nullable values
- [ ] Environment variables accessed through validated config
- [ ] Error handling includes null/undefined cases
- [ ] Tests cover null/undefined scenarios

### For Reviewers
- [ ] **Block any PR** containing non-null assertions
- [ ] Verify proper null handling patterns
- [ ] Check for defensive programming practices
- [ ] Ensure error messages are helpful
- [ ] Validate test coverage for edge cases

## 🔧 Common Scenarios

### API Response Handling
```typescript
// ✅ CORRECT
async function fetchUserData(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data?.user) {
      throw new Error('Invalid response: user data missing');
    }
    
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
```

### React Component Props
```typescript
// ✅ CORRECT
interface UserCardProps {
  user?: User;
  loading?: boolean;
}

function UserCard({ user, loading = false }: UserCardProps) {
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>No user data available</div>;
  }
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {user.profile?.bio && <p>{user.profile.bio}</p>}
    </div>
  );
}
```

### Database Queries
```typescript
// ✅ CORRECT
async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true }
  });
  
  if (!user) {
    throw new Error(`User not found: ${id}`);
  }
  
  return user;
}
```

### Array Operations
```typescript
// ✅ CORRECT
function processItems(items?: Item[]) {
  const validItems = items?.filter(isNonNull) ?? [];
  
  return validItems.map(item => ({
    id: item.id,
    name: item.name ?? 'Unnamed',
    description: item.description?.trim() ?? ''
  }));
}
```

## 🚨 Error Handling

### Graceful Degradation
```typescript
// ✅ CORRECT - Graceful handling
function renderUserStats(user?: User) {
  const stats = {
    posts: user?.posts?.length ?? 0,
    followers: user?.followers?.length ?? 0,
    following: user?.following?.length ?? 0
  };
  
  return <StatsDisplay stats={stats} />;
}
```

### Meaningful Error Messages
```typescript
// ✅ CORRECT - Helpful error messages
function validateUserInput(data: unknown) {
  assertNonNull(data, 'User input data is required');
  
  if (typeof data !== 'object') {
    throw new Error('User input must be an object');
  }
  
  const user = data as Record<string, unknown>;
  
  assertNonNull(user.email, 'Email is required for user registration');
  assertNonNull(user.name, 'Name is required for user registration');
}
```

## 🧪 Testing Guidelines

### Test Null Scenarios
```typescript
// ✅ REQUIRED - Test null/undefined cases
describe('UserCard', () => {
  it('should handle undefined user gracefully', () => {
    render(<UserCard user={undefined} />);
    expect(screen.getByText('No user data available')).toBeInTheDocument();
  });
  
  it('should handle missing profile data', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    render(<UserCard user={user} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    // Should not crash when profile is undefined
  });
});
```

## 📚 Resources

### Utility Functions
- `src/lib/utils/type-guards.ts` - Type guards and assertions
- `src/lib/config/environment.ts` - Environment validation
- `docs/null-safety-patterns.md` - Comprehensive patterns guide

### Commands
- `pnpm null-safety:check` - Check for violations
- `pnpm null-safety:report` - Generate compliance report
- `pnpm biome:check` - Full linting check
- `pnpm pre-commit` - Manual pre-commit validation

### Documentation
- `docs/null-safety-patterns.md` - Technical patterns
- `docs/null-safety-technical-guide.md` - Implementation details
- `docs/null-safety-compliance-plan.md` - Project plan

## 🎯 Success Metrics

A successful implementation should have:
- ✅ Zero non-null assertions in the codebase
- ✅ All environment variables properly validated
- ✅ Comprehensive error handling
- ✅ Graceful degradation for missing data
- ✅ Full test coverage for null scenarios
- ✅ Clear, helpful error messages

## 🚀 Getting Help

1. **Check existing patterns** in the codebase
2. **Review documentation** in the `docs/` directory
3. **Use type guards** from the utilities library
4. **Ask for code review** when unsure
5. **Run validation tools** before committing

Remember: **Null safety is not optional** - it's a requirement for code quality and application stability.
