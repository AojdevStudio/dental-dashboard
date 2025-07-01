# Code Review Checklist

## Overview

This document provides a comprehensive checklist for code reviews in the Dental Dashboard project. It ensures consistent quality standards, security best practices, and maintainability across all code contributions.

## Quick Reference

```bash
# Before submitting for review
pnpm biome:check      # Check all code quality issues
pnpm typecheck        # Verify TypeScript types
pnpm test            # Run all tests
pnpm build           # Ensure build succeeds
```

## Pre-Review Developer Checklist

### Self-Review Requirements

Before requesting a review, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass (unit, integration, E2E)
- [ ] No linting or formatting issues
- [ ] TypeScript strict mode compliance
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated

### Code Quality Verification

```bash
# Run full quality check
pnpm code-quality

# This runs:
# 1. Biome formatting and linting
# 2. TypeScript type checking
# 3. All test suites
# 4. Production build
```

## General Review Criteria

### 1. Code Structure and Design

#### Architecture Compliance
- [ ] Follows established architectural patterns
- [ ] Maintains separation of concerns
- [ ] Uses appropriate design patterns
- [ ] No circular dependencies
- [ ] Proper module organization

#### Component Design
- [ ] Single responsibility principle
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] YAGNI (You Aren't Gonna Need It)
- [ ] Appropriate abstraction levels

### 2. Code Quality

#### Readability
- [ ] Clear, descriptive variable names
- [ ] Functions have single, clear purpose
- [ ] Complex logic is well-commented
- [ ] No magic numbers or strings
- [ ] Consistent naming conventions

```typescript
// ❌ Poor readability
const d = new Date();
const x = u.filter(i => i.a > 5);

// ✅ Good readability
const currentDate = new Date();
const activeUsers = users.filter(user => user.loginCount > 5);
```

#### Maintainability
- [ ] Functions are small and focused (<50 lines)
- [ ] Classes have clear responsibilities
- [ ] Code is testable
- [ ] No deep nesting (max 3 levels)
- [ ] Clear error messages

### 3. TypeScript Standards

#### Type Safety
- [ ] No `any` types (use `unknown` if needed)
- [ ] Strict null checks handled
- [ ] Proper type inference used
- [ ] Interfaces over type aliases for objects
- [ ] Enums for fixed sets of values

```typescript
// ❌ Avoid
function processData(data: any): any {
  return data.value;
}

// ✅ Preferred
interface ProcessedData {
  value: string;
  timestamp: Date;
}

function processData(data: RawData): ProcessedData {
  return {
    value: data.value ?? '',
    timestamp: new Date()
  };
}
```

#### Type Organization
- [ ] Types co-located with usage
- [ ] Shared types in `types/` directory
- [ ] Proper type exports
- [ ] No duplicate type definitions

## Frontend-Specific Checklist

### React Components

#### Component Structure
- [ ] Functional components with hooks
- [ ] Proper component composition
- [ ] Props interface defined
- [ ] Default props where appropriate
- [ ] Memoization for expensive operations

```typescript
// Component checklist example
interface DashboardCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const DashboardCard = memo<DashboardCardProps>(({ 
  title, 
  value, 
  trend = 'neutral',
  className 
}) => {
  // Component implementation
});
```

#### State Management
- [ ] Minimal component state
- [ ] Proper state lifting
- [ ] Server state via React Query
- [ ] Form state via React Hook Form
- [ ] Global state via Zustand (sparingly)

#### Performance
- [ ] Unnecessary re-renders avoided
- [ ] Large lists virtualized
- [ ] Images optimized with Next.js Image
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components

### Styling and UI

#### CSS/Tailwind
- [ ] Utility-first approach
- [ ] No inline styles
- [ ] Consistent spacing (8px grid)
- [ ] Responsive design implemented
- [ ] Dark mode support

#### Accessibility
- [ ] Semantic HTML used
- [ ] ARIA labels for icons
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA

## Backend-Specific Checklist

### API Design

#### RESTful Principles
- [ ] Proper HTTP verbs used
- [ ] Resource-based URLs
- [ ] Consistent naming conventions
- [ ] Proper status codes returned
- [ ] Pagination implemented for lists

```typescript
// API endpoint checklist
// GET /api/providers - List providers
// GET /api/providers/:id - Get single provider
// POST /api/providers - Create provider
// PATCH /api/providers/:id - Update provider
// DELETE /api/providers/:id - Delete provider
```

#### Request/Response
- [ ] Input validation with Zod
- [ ] Consistent response format
- [ ] Error responses standardized
- [ ] Proper content-type headers
- [ ] CORS configured correctly

### Database Operations

#### Query Optimization
- [ ] N+1 queries avoided
- [ ] Proper indexes used
- [ ] Select only needed fields
- [ ] Transactions for data integrity
- [ ] Connection pooling configured

```typescript
// ❌ N+1 query problem
const providers = await prisma.provider.findMany();
for (const provider of providers) {
  const appointments = await prisma.appointment.findMany({
    where: { providerId: provider.id }
  });
}

// ✅ Optimized query
const providers = await prisma.provider.findMany({
  include: {
    appointments: {
      where: { status: 'active' }
    }
  }
});
```

#### Data Security
- [ ] SQL injection prevented (Prisma)
- [ ] Sensitive data encrypted
- [ ] PII properly handled
- [ ] Multi-tenant isolation enforced
- [ ] RLS policies applied

## Security Checklist

### Authentication & Authorization

- [ ] Routes protected with middleware
- [ ] Permissions checked properly
- [ ] Session management secure
- [ ] Token expiration handled
- [ ] Multi-factor auth supported

### Input Validation

- [ ] All inputs validated
- [ ] XSS prevention implemented
- [ ] File upload restrictions
- [ ] Rate limiting applied
- [ ] CSRF protection enabled

```typescript
// Input validation example
const providerSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  type: z.enum(['dentist', 'hygienist', 'assistant']),
  npi: z.string().regex(/^\d{10}$/).optional()
});

// Use in API route
const validated = providerSchema.parse(req.body);
```

### Data Protection

- [ ] No sensitive data in logs
- [ ] Encryption at rest for PII
- [ ] Secure communication (HTTPS)
- [ ] Proper error messages (no stack traces)
- [ ] Security headers configured

## Testing Checklist

### Test Coverage

- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] Component tests for complex UI
- [ ] E2E tests for critical paths
- [ ] Edge cases covered

### Test Quality

- [ ] Tests are readable
- [ ] Tests are maintainable
- [ ] Tests are reliable (no flaky tests)
- [ ] Tests follow AAA pattern
- [ ] Mocks used appropriately

```typescript
// Test structure example
describe('ProviderService', () => {
  describe('createProvider', () => {
    it('should create a provider with valid data', async () => {
      // Arrange
      const providerData = createMockProvider();
      
      // Act
      const result = await providerService.create(providerData);
      
      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        ...providerData
      });
    });
    
    it('should throw error for duplicate email', async () => {
      // Test implementation
    });
  });
});
```

## Performance Checklist

### Frontend Performance

- [ ] Bundle size optimized
- [ ] Images lazy loaded
- [ ] Fonts optimized
- [ ] Critical CSS inlined
- [ ] Service worker caching

### Backend Performance

- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Response compression enabled
- [ ] Connection pooling configured
- [ ] Memory leaks checked

### Monitoring

- [ ] Performance metrics tracked
- [ ] Error tracking configured
- [ ] Logging implemented properly
- [ ] Alerts configured
- [ ] Health checks implemented

## Documentation Checklist

### Code Documentation

- [ ] JSDoc for public APIs
- [ ] Complex logic explained
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Architecture decisions documented

```typescript
/**
 * Calculates the provider's production variance from their goal
 * @param actual - Actual production amount in cents
 * @param goal - Goal amount in cents
 * @returns Percentage variance (-100 to +∞)
 * @example
 * calculateVariance(150000, 100000) // returns 50 (50% over goal)
 * calculateVariance(80000, 100000) // returns -20 (20% under goal)
 */
export function calculateVariance(actual: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.round(((actual - goal) / goal) * 100);
}
```

### User Documentation

- [ ] Feature documentation updated
- [ ] Screenshots current
- [ ] Changelog updated
- [ ] Migration guide (if needed)
- [ ] Known issues documented

## Reviewer Guidelines

### Review Process

1. **Understand the Context**
   - Read the PR description
   - Check linked issues
   - Understand the business requirement

2. **Run the Code**
   - Check out the branch
   - Run tests locally
   - Test the functionality

3. **Review Systematically**
   - Start with high-level design
   - Check implementation details
   - Verify tests
   - Review documentation

### Feedback Guidelines

#### Constructive Feedback
```
// ❌ Poor feedback
"This is wrong"

// ✅ Good feedback
"Consider using a Set here instead of an array for O(1) lookups.
This would improve performance when checking provider availability."
```

#### Categorize Comments
- **Must Fix**: Bugs, security issues, broken functionality
- **Should Fix**: Performance issues, maintainability concerns
- **Consider**: Suggestions, alternative approaches
- **Nitpick**: Style preferences, minor improvements

### Approval Criteria

Before approving:
- [ ] All "Must Fix" items addressed
- [ ] Most "Should Fix" items resolved
- [ ] Tests pass
- [ ] No security vulnerabilities
- [ ] Code meets project standards

## Automated Checks

### Pre-commit Hooks

Automatically runs via Husky:
```bash
# .husky/pre-commit
pnpm biome:fix
pnpm test --run
git add -A
```

### CI/CD Pipeline

GitHub Actions checks:
- [ ] TypeScript compilation
- [ ] Linting passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Coverage thresholds met

## Common Issues to Check

### Memory Leaks
- [ ] Event listeners cleaned up
- [ ] Intervals/timeouts cleared
- [ ] Subscriptions unsubscribed
- [ ] Large objects dereferenced

### Race Conditions
- [ ] Async operations properly handled
- [ ] State updates batched
- [ ] Debouncing/throttling used
- [ ] Optimistic updates safe

### Error Handling
- [ ] All promises have catch blocks
- [ ] Network errors handled
- [ ] User-friendly error messages
- [ ] Errors logged appropriately

## Post-Review Actions

### After Approval

1. **Merge Strategy**
   - Squash commits for features
   - Preserve commits for large changes
   - Update branch before merging

2. **Deployment**
   - Monitor deployment
   - Check error rates
   - Verify functionality
   - Update documentation

3. **Follow-up**
   - Create issues for deferred work
   - Schedule technical debt review
   - Update team knowledge base

## Related Resources

- [Coding Standards](./coding-standards.md)
- [Testing Strategy](./testing-strategy.md)
- [Security Considerations](./security-considerations.md)
- [Git Workflow Guide](./git-workflow.md)

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)