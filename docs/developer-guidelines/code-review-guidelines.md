# Code Review Guidelines

## Overview

This document outlines the code review process and standards for the dental-dashboard project, with special emphasis on null safety compliance and code quality.

## 🎯 Review Objectives

### Primary Goals
1. **Ensure null safety compliance** - Zero tolerance for non-null assertions
2. **Maintain code quality** - Follow established patterns and best practices
3. **Prevent security issues** - No hardcoded secrets or vulnerabilities
4. **Ensure testability** - Code must be testable and well-tested
5. **Maintain consistency** - Follow project conventions and standards

## 🚫 Automatic Rejection Criteria

### Critical Issues (Must Block PR)
1. **Non-null assertions (`!`)** - Immediate rejection
2. **Hardcoded secrets** - Security violation
3. **Breaking changes** without proper migration
4. **Failing tests** - Must be fixed before merge
5. **TypeScript errors** - Must compile cleanly

### Example Violations
```typescript
// ❌ AUTOMATIC REJECTION - Non-null assertion
const user = session.user!;

// ❌ AUTOMATIC REJECTION - Hardcoded secret
const apiKey = "sk-1234567890abcdef";

// ❌ AUTOMATIC REJECTION - Unsafe property access
const name = user.profile.name; // Could throw if profile is null
```

## ✅ Required Review Checklist

### Null Safety Compliance
- [ ] **No non-null assertions** (`!`) anywhere in the code
- [ ] **Optional chaining** used for optional properties (`obj?.prop`)
- [ ] **Nullish coalescing** used for defaults (`value ?? default`)
- [ ] **Type guards** used from `src/lib/utils/type-guards.ts`
- [ ] **Environment variables** accessed through validated config
- [ ] **Error handling** includes null/undefined cases

### Code Quality
- [ ] **Follows TypeScript strict mode** requirements
- [ ] **Proper error messages** with context
- [ ] **Consistent naming** conventions
- [ ] **No unused imports** or variables
- [ ] **Proper component structure** for React components
- [ ] **Database queries** use proper error handling

### Security
- [ ] **No hardcoded secrets** or API keys
- [ ] **Environment variables** used for sensitive data
- [ ] **Input validation** for user data
- [ ] **SQL injection** prevention (using Prisma properly)
- [ ] **XSS prevention** (proper React patterns)

### Testing
- [ ] **New features** have corresponding tests
- [ ] **Edge cases** are tested (null/undefined scenarios)
- [ ] **Error conditions** are tested
- [ ] **Tests are meaningful** and not just for coverage
- [ ] **Integration tests** for API changes

### Documentation
- [ ] **Complex logic** is commented
- [ ] **API changes** are documented
- [ ] **Breaking changes** are noted in PR description
- [ ] **README updates** if needed

## 📝 Review Process

### For Authors

#### Before Creating PR
1. **Run pre-commit hooks** - `pnpm pre-commit`
2. **Run null safety check** - `pnpm null-safety:check`
3. **Run full test suite** - `pnpm test`
4. **Build application** - `pnpm build`
5. **Self-review changes** using this checklist

#### PR Description Template
```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Null Safety Compliance
- [ ] No non-null assertions used
- [ ] Proper error handling implemented
- [ ] Type guards used where appropriate

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Edge cases covered

## Security
- [ ] No hardcoded secrets
- [ ] Input validation added
- [ ] Security implications considered

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

### For Reviewers

#### Review Priority Order
1. **Security issues** - Highest priority
2. **Null safety violations** - Must be fixed
3. **Breaking changes** - Require careful review
4. **Logic errors** - Could cause bugs
5. **Style and consistency** - Important but lower priority

#### Review Comments Guidelines

##### Blocking Comments (Must Fix)
```markdown
🚫 **BLOCKING**: Non-null assertion detected
This violates our null safety policy. Please use optional chaining or type guards instead.

🚫 **BLOCKING**: Hardcoded secret detected
Please move this to environment variables for security.

🚫 **BLOCKING**: Missing error handling
This code path could throw an unhandled error. Please add proper error handling.
```

##### Suggestion Comments (Should Fix)
```markdown
💡 **SUGGESTION**: Consider using optional chaining
This would be safer: `user?.profile?.name ?? 'Unknown'`

💡 **SUGGESTION**: Add test for edge case
Consider testing what happens when `data` is null or undefined.

💡 **SUGGESTION**: Extract complex logic
This function is getting complex. Consider extracting helper functions.
```

##### Nitpick Comments (Nice to Have)
```markdown
🔧 **NITPICK**: Consistent naming
Consider using `userId` instead of `user_id` for consistency.

🔧 **NITPICK**: Add JSDoc comment
This function would benefit from documentation.
```

## 🔍 Common Review Scenarios

### API Route Changes
```typescript
// ✅ GOOD - Proper validation and error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body?.email || !body?.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    const user = await createUser(body);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### React Component Changes
```typescript
// ✅ GOOD - Proper null handling and loading states
function UserProfile({ userId }: { userId?: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage error={error} />;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {user.profile?.bio && <p>{user.profile.bio}</p>}
    </div>
  );
}
```

### Database Query Changes
```typescript
// ✅ GOOD - Proper error handling and validation
async function getUserWithPosts(userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  });
  
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  
  return user;
}
```

## 🚀 Advanced Review Techniques

### Performance Considerations
- Check for unnecessary re-renders in React components
- Validate database query efficiency
- Review bundle size impact for new dependencies

### Accessibility Review
- Ensure proper ARIA labels
- Check keyboard navigation
- Validate color contrast and screen reader compatibility

### Mobile Responsiveness
- Test responsive design patterns
- Validate touch interactions
- Check mobile performance implications

## 📊 Review Metrics

### Quality Indicators
- **Zero non-null assertions** in approved PRs
- **All tests passing** before merge
- **No security vulnerabilities** introduced
- **Consistent code style** maintained
- **Proper documentation** for complex changes

### Review Efficiency
- **First review within 24 hours** for urgent changes
- **Complete review within 48 hours** for standard changes
- **Clear, actionable feedback** in all comments
- **Collaborative discussion** for complex decisions

## 🎓 Training Resources

### For New Reviewers
1. Read all null safety documentation
2. Review recent PRs for examples
3. Practice with low-risk changes first
4. Ask questions when unsure

### Continuous Learning
- Stay updated on TypeScript best practices
- Learn new security patterns
- Understand performance implications
- Keep up with React/Next.js updates

## 🔧 Tools and Automation

### Automated Checks
- **Pre-commit hooks** prevent basic violations
- **CI/CD pipeline** validates all changes
- **Biome linting** enforces code style
- **Security scanning** detects vulnerabilities

### Manual Review Focus
- **Business logic correctness**
- **User experience implications**
- **Architecture decisions**
- **Complex error scenarios**

Remember: **Code review is a collaborative process** aimed at improving code quality and sharing knowledge, not finding fault.
