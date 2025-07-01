# Testing Strategy

## Overview

This document outlines the comprehensive testing approach for the Dental Dashboard project. Our testing strategy ensures code quality, prevents regressions, and validates multi-tenant security. The project uses a hybrid testing architecture combining Vitest for unit/integration tests and Playwright for end-to-end tests.

## Quick Reference

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests
pnpm test:e2e          # End-to-end tests

# Development mode
pnpm test:watch        # Watch mode with local database
pnpm test:coverage     # Generate coverage report
```

## Test Architecture

### Test Types and Their Purpose

| Test Type | Tool | Purpose | Location |
|-----------|------|---------|----------|
| Unit | Vitest | Test isolated functions and components | `src/**/__tests__/` |
| Integration | Vitest | Test API routes and database operations | `src/**/__tests__/integration/` |
| E2E | Playwright | Test complete user workflows | `tests/e2e/` |
| Security | Vitest | Test RLS policies and multi-tenant isolation | `src/**/__tests__/security/` |
| Performance | Vitest | Test query optimization and response times | `src/**/__tests__/performance/` |

### Test Environment

```typescript
// Local test database configuration (.env.test)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@localhost:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="test-anon-key"
```

## Test File Organization

### Naming Conventions

```
# Unit tests
src/components/provider-card.tsx
src/components/provider-card.test.tsx

# Integration tests
src/app/api/providers/route.ts
src/app/api/providers/__tests__/integration/providers.test.ts

# E2E tests
tests/e2e/auth/login.test.ts
tests/e2e/providers/provider-management.test.ts
```

### Test Structure

```typescript
// Standard test file structure
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Group related tests
  describe('when user is authenticated', () => {
    it('should display user data', () => {
      // Arrange
      const mockUser = { id: '1', name: 'Test User' }
      
      // Act
      const result = render(<Component user={mockUser} />)
      
      // Assert
      expect(result.getByText('Test User')).toBeInTheDocument()
    })
  })
})
```

## Unit Testing

### Component Testing

```typescript
// src/components/providers/provider-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProviderCard } from './provider-card'

describe('ProviderCard', () => {
  const mockProvider = {
    id: '1',
    name: 'Dr. Smith',
    specialty: 'General Dentistry',
    productionYTD: 150000
  }

  it('should render provider information', () => {
    render(<ProviderCard provider={mockProvider} />)
    
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
    expect(screen.getByText('General Dentistry')).toBeInTheDocument()
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<ProviderCard provider={mockProvider} onSelect={onSelect} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
```

### Utility Function Testing

```typescript
// src/lib/utils/__tests__/format-currency.test.ts
import { formatCurrency } from '../format-currency'

describe('formatCurrency', () => {
  it('should format cents to dollars', () => {
    expect(formatCurrency(15000)).toBe('$150.00')
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(-5000)).toBe('-$50.00')
  })

  it('should handle null values', () => {
    expect(formatCurrency(null)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
  })
})
```

### Hook Testing

```typescript
// src/hooks/__tests__/use-providers.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProviders } from '../use-providers'

describe('useProviders', () => {
  it('should fetch providers for clinic', async () => {
    const { result } = renderHook(() => useProviders('clinic-1'))
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data[0]).toHaveProperty('name')
  })
})
```

## Integration Testing

### API Route Testing

```typescript
// src/app/api/providers/__tests__/integration/providers.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '../../route'
import { prisma } from '@/lib/database/client'

describe('Providers API', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.provider.deleteMany()
  })

  describe('GET /api/providers', () => {
    it('should return providers for authenticated clinic', async () => {
      // Seed test data
      await prisma.provider.createMany({
        data: [
          { id: '1', name: 'Dr. Smith', clinicId: 'clinic-1' },
          { id: '2', name: 'Dr. Jones', clinicId: 'clinic-1' }
        ]
      })

      // Create mock request
      const { req } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      })

      // Call API route
      const response = await GET(req)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    it('should enforce clinic isolation', async () => {
      // Test that clinic-2 cannot see clinic-1 data
      // Implementation here
    })
  })
})
```

### Database Operation Testing

```typescript
// src/lib/database/queries/__tests__/providers.test.ts
import { getProvidersByClinic, createProvider } from '../providers'
import { prisma } from '@/lib/database/client'

describe('Provider Queries', () => {
  it('should create provider with proper validation', async () => {
    const providerData = {
      name: 'Dr. New',
      email: 'dr.new@example.com',
      clinicId: 'clinic-1'
    }

    const provider = await createProvider(providerData)

    expect(provider).toMatchObject({
      id: expect.any(String),
      name: 'Dr. New',
      email: 'dr.new@example.com'
    })

    // Verify in database
    const dbProvider = await prisma.provider.findUnique({
      where: { id: provider.id }
    })
    expect(dbProvider).toBeTruthy()
  })
})
```

## E2E Testing

### User Workflow Testing

```typescript
// tests/e2e/providers/provider-management.test.ts
import { test, expect } from '@playwright/test'
import { loginAs } from '../utils/auth-helpers'

test.describe('Provider Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'office-manager')
  })

  test('should create new provider', async ({ page }) => {
    // Navigate to providers page
    await page.goto('/providers')
    
    // Click add provider button
    await page.click('button:has-text("Add Provider")')
    
    // Fill form
    await page.fill('input[name="name"]', 'Dr. Test')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.selectOption('select[name="specialty"]', 'general')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=Provider created successfully')).toBeVisible()
    await expect(page.locator('text=Dr. Test')).toBeVisible()
  })

  test('should filter providers by location', async ({ page }) => {
    await page.goto('/providers')
    
    // Apply filter
    await page.selectOption('select[name="location"]', 'location-1')
    
    // Verify filtered results
    const providers = page.locator('[data-testid="provider-card"]')
    await expect(providers).toHaveCount(2)
  })
})
```

### Cross-Browser Testing

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    }
  ]
})
```

## Security Testing

### RLS Policy Testing

```typescript
// src/lib/database/__tests__/security/rls-policies.test.ts
import { testRLSPolicy } from '@/tests/utils/rls-test-helpers'

describe('RLS Policies', () => {
  it('should prevent cross-clinic data access', async () => {
    await testRLSPolicy({
      setupData: async (tx) => {
        // Create providers in different clinics
        await tx.provider.create({
          data: { id: '1', name: 'Dr. A', clinicId: 'clinic-1' }
        })
        await tx.provider.create({
          data: { id: '2', name: 'Dr. B', clinicId: 'clinic-2' }
        })
      },
      
      testAccess: async (tx, setContext) => {
        // Set context to clinic-1
        await setContext({ clinicId: 'clinic-1' })
        
        // Should only see clinic-1 providers
        const providers = await tx.provider.findMany()
        expect(providers).toHaveLength(1)
        expect(providers[0].clinicId).toBe('clinic-1')
      }
    })
  })
})
```

### Authentication Testing

```typescript
// tests/e2e/auth/authentication.test.ts
test.describe('Authentication Security', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('should prevent access with invalid token', async ({ page }) => {
    await page.goto('/dashboard', {
      extraHTTPHeaders: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    await expect(page).toHaveURL('/login')
  })
})
```

## Performance Testing

### Query Performance

```typescript
// src/lib/database/__tests__/performance/provider-queries.test.ts
describe('Provider Query Performance', () => {
  it('should fetch paginated providers within 100ms', async () => {
    // Seed 1000 providers
    await seedProviders(1000)
    
    const start = Date.now()
    const result = await getProvidersPaginated({
      page: 1,
      limit: 20,
      clinicId: 'clinic-1'
    })
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(100)
    expect(result.data).toHaveLength(20)
    expect(result.meta.totalCount).toBe(1000)
  })
})
```

### Load Testing

```typescript
// tests/load/concurrent-users.test.ts
test('should handle 50 concurrent users', async () => {
  const requests = Array(50).fill(null).map(() => 
    fetch('/api/providers', {
      headers: { Authorization: 'Bearer token' }
    })
  )
  
  const responses = await Promise.all(requests)
  const successCount = responses.filter(r => r.ok).length
  
  expect(successCount).toBe(50)
})
```

## Test Data Management

### Test Factories

```typescript
// tests/factories/provider.factory.ts
export const createMockProvider = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  email: faker.internet.email(),
  specialty: 'general',
  isActive: true,
  clinicId: 'clinic-1',
  ...overrides
})

// Usage
const provider = createMockProvider({ specialty: 'orthodontics' })
```

### Database Seeding

```typescript
// tests/utils/seed-helpers.ts
export async function seedTestDatabase() {
  // Clear existing data
  await prisma.$transaction([
    prisma.provider.deleteMany(),
    prisma.clinic.deleteMany(),
    prisma.user.deleteMany()
  ])
  
  // Seed test data
  const clinic = await prisma.clinic.create({
    data: {
      id: 'test-clinic',
      name: 'Test Dental Clinic',
      providers: {
        create: [
          { name: 'Dr. Test 1' },
          { name: 'Dr. Test 2' }
        ]
      }
    }
  })
  
  return { clinic }
}
```

## Mocking Strategies

### External Services

```typescript
// Mock Google Sheets API
vi.mock('@googleapis/sheets', () => ({
  google: {
    sheets: () => ({
      spreadsheets: {
        values: {
          get: vi.fn().mockResolvedValue({
            data: { values: [['A1', 'B1'], ['A2', 'B2']] }
          })
        }
      }
    })
  }
}))
```

### Supabase Auth

```typescript
// tests/mocks/supabase-auth.ts
export const mockSupabaseAuth = {
  getUser: vi.fn().mockResolvedValue({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { clinicId: 'clinic-1' }
      }
    }
  }),
  signOut: vi.fn().mockResolvedValue({ error: null })
}
```

## Coverage Requirements

### Target Coverage

```json
{
  "coverage": {
    "statements": 80,
    "branches": 75,
    "functions": 80,
    "lines": 80
  }
}
```

### Coverage Exceptions

```typescript
// Files excluded from coverage
export default {
  coveragePathIgnorePatterns: [
    'node_modules',
    '.next',
    'tests',
    '*.config.js',
    '*.config.ts',
    'src/app/layout.tsx', // Next.js boilerplate
    'src/app/page.tsx'    // Landing page
  ]
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Run E2E tests
        run: pnpm test:e2e
```

## Best Practices

### Test Writing Guidelines

1. **Descriptive Names**: Use clear, behavior-focused test names
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **Isolation**: Each test should be independent
4. **Mock External Dependencies**: Don't make real API calls
5. **Test User Journeys**: Not just code coverage

### Common Patterns

```typescript
// ✅ Good test
it('should display error message when login fails', async () => {
  // Clear description of behavior
})

// ❌ Bad test
it('test login', () => {
  // Vague description
})

// ✅ Test edge cases
it('should handle empty provider list gracefully', () => {})
it('should show loading state during data fetch', () => {})
it('should retry failed requests up to 3 times', () => {})
```

## Debugging Tests

### Debug Commands

```bash
# Run single test file
pnpm test src/components/provider-card.test.tsx

# Run tests matching pattern
pnpm test -t "should create provider"

# Debug mode
pnpm test:debug

# UI mode for Playwright
pnpm test:ui
```

### Common Issues

1. **Database Connection**: Ensure local Supabase is running
2. **Flaky Tests**: Add proper waits and assertions
3. **Import Errors**: Check module resolution in `vitest.config.ts`
4. **Type Errors**: Ensure test types are included in `tsconfig.json`

## Related Resources

- [Null Safety Testing Patterns](../testing/null-safety-testing-patterns.md)
- [E2E Test Guide](../tests/google-sheets-test-guide.md)
- [CI/CD Pipeline](../bmad-integration/quality-standards-reference.md)

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)