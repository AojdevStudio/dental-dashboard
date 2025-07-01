# Coding Standards

## Overview

This document defines the coding conventions and best practices for the Dental Dashboard project. All AI agents and developers must follow these standards to maintain code quality, readability, and consistency across the codebase.

## Quick Reference

```typescript
// ✅ Good: Explicit types, const, meaningful names
const calculateProviderProduction = (providerId: string): number => {
  // Implementation
}

// ❌ Bad: any type, var, unclear names
var calc = (id: any) => {
  // Implementation
}
```

## Language-Specific Guidelines

### TypeScript Standards

#### Type Safety
```typescript
// ✅ ALWAYS use explicit types
interface ProviderMetrics {
  productionAmount: number
  patientCount: number
  averagePerPatient: number
}

// ❌ NEVER use 'any'
// const data: any = fetchData() // FORBIDDEN

// ✅ Use 'unknown' when type is truly unknown
const parseData = (input: unknown): ProviderMetrics => {
  // Validate and transform
}

// ✅ Always handle null/undefined
const getProviderName = (provider: Provider | null): string => {
  return provider?.name ?? 'Unknown Provider'
}
```

#### Variable Declaration
```typescript
// ✅ Use const for values that don't change
const MAX_RETRIES = 3

// ✅ Use let for values that change
let currentAttempt = 0

// ❌ NEVER use var
// var oldStyle = 'bad' // FORBIDDEN
```

### React/Next.js Standards

#### Component Structure
```typescript
// ✅ Functional components with explicit return types
import { FC } from 'react'

interface ProviderCardProps {
  provider: Provider
  onSelect?: (id: string) => void
}

export const ProviderCard: FC<ProviderCardProps> = ({ 
  provider, 
  onSelect 
}) => {
  // Hook usage at the top
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  
  // Event handlers
  const handleClick = useCallback(() => {
    onSelect?.(provider.id)
  }, [provider.id, onSelect])
  
  // Render
  return (
    <Card onClick={handleClick}>
      {/* Component content */}
    </Card>
  )
}
```

#### Server vs Client Components
```typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
const DashboardPage = async () => {
  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}

// ✅ Client Component (only when needed)
// components/interactive-chart.tsx
'use client'

const InteractiveChart = () => {
  const [filter, setFilter] = useState()
  // Interactive logic
}
```

## Naming Conventions

### Files and Directories
```
✅ Components: PascalCase
   ProviderCard.tsx
   DashboardLayout.tsx

✅ Utilities: kebab-case
   format-currency.ts
   parse-date.ts

✅ API Routes: Always route.ts
   app/api/providers/route.ts
   app/api/providers/[id]/route.ts

✅ Test Files: Same name + .test
   ProviderCard.test.tsx
   format-currency.test.ts
```

### Variables and Functions
```typescript
// ✅ camelCase for variables and functions
const providerName = 'Dr. Smith'
const calculateMonthlyProduction = () => {}

// ✅ PascalCase for types and interfaces
interface ProviderData {}
type MetricType = 'production' | 'collection'

// ✅ UPPER_SNAKE_CASE for constants
const MAX_PROVIDERS_PER_PAGE = 20
const API_TIMEOUT = 30000

// ✅ Descriptive boolean names
const isLoading = true
const hasPermission = false
const canEdit = true
```

### Database and API
```typescript
// ✅ snake_case for database fields (Prisma schema)
model provider {
  id            String @id
  display_name  String
  created_at    DateTime
}

// ✅ camelCase for API responses (transformed)
{
  "id": "123",
  "displayName": "Dr. Smith",
  "createdAt": "2024-01-01"
}
```

## Code Organization

### Import Order
```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { format } from 'date-fns'
import { z } from 'zod'

// 3. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 4. Relative imports
import { ProviderCard } from './provider-card'
import { formatCurrency } from './utils'

// 5. Type imports
import type { Provider } from '@/types/provider'
```

### File Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component/Function
// 5. Exports

// Example:
import { FC } from 'react'

interface Props {
  title: string
}

const DEFAULT_TITLE = 'Dashboard'

const PageHeader: FC<Props> = ({ title = DEFAULT_TITLE }) => {
  return <h1>{title}</h1>
}

export { PageHeader }
```

## Comment Standards

### JSDoc for Functions
```typescript
/**
 * Calculates the total production for a provider within a date range
 * @param providerId - The unique identifier of the provider
 * @param startDate - Beginning of the calculation period
 * @param endDate - End of the calculation period
 * @returns Total production amount in cents
 * @throws {Error} If provider not found or dates invalid
 */
export const calculateProviderProduction = async (
  providerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  // Implementation
}
```

### Inline Comments
```typescript
// ✅ Explain WHY, not WHAT
// We need to multiply by 100 because Stripe expects amounts in cents
const amountInCents = amount * 100

// ❌ Avoid obvious comments
// Set loading to true // BAD - obvious from code
setIsLoading(true)

// ✅ TODO comments with context
// TODO: Implement pagination when dataset > 1000 rows
// See: https://linear.app/team/issue/AOJ-123
```

## Error Handling

### Try-Catch Patterns
```typescript
// ✅ Specific error handling
try {
  const data = await fetchProviderData(id)
  return { success: true, data }
} catch (error) {
  // Type guard for error
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return { success: false, error: 'Provider not found' }
    }
  }
  
  // Log unexpected errors
  logger.error('Unexpected error fetching provider:', error)
  return { success: false, error: 'An unexpected error occurred' }
}

// ❌ Avoid empty catches
try {
  // something
} catch (e) {} // BAD - silently swallows errors
```

### Null Safety
```typescript
// ✅ Use optional chaining and nullish coalescing
const providerName = provider?.name ?? 'Unknown'
const clinicId = user?.clinicId

// ✅ Guard clauses for null checks
const updateProvider = (provider: Provider | null) => {
  if (!provider) {
    throw new Error('Provider is required')
  }
  
  // Rest of function
}

// ✅ Type guards
const isProvider = (data: unknown): data is Provider => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}
```

## API Development

### RESTful Conventions
```typescript
// ✅ Standard REST endpoints
GET    /api/providers        // List all
GET    /api/providers/:id    // Get one
POST   /api/providers        // Create
PUT    /api/providers/:id    // Update
DELETE /api/providers/:id    // Delete

// ✅ Consistent response format
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    totalPages?: number
    totalCount?: number
  }
}
```

### API Route Structure
```typescript
// app/api/providers/route.ts
import { withAuth } from '@/lib/auth/middleware'
import { apiSuccess, apiError } from '@/lib/api/utils'

export const GET = withAuth(async (request) => {
  try {
    const providers = await getProviders()
    return apiSuccess(providers)
  } catch (error) {
    return apiError('Failed to fetch providers', 500)
  }
})
```

## Git Commit Conventions

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(providers): add location filter to provider list

fix(auth): resolve session timeout issue

docs(api): update REST endpoint documentation

refactor(dashboard): extract KPI calculations to service layer
```

## Performance Patterns

### Memoization
```typescript
// ✅ Use React.memo for expensive components
export const ExpensiveChart = React.memo(({ data }) => {
  // Complex rendering
})

// ✅ Use useMemo for expensive calculations
const averageProduction = useMemo(() => {
  return calculateAverage(productionData)
}, [productionData])

// ✅ Use useCallback for stable function references
const handleFilter = useCallback((filters) => {
  // Filter logic
}, [dependencies])
```

### Data Fetching
```typescript
// ✅ Use TanStack Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['providers', clinicId],
  queryFn: () => fetchProviders(clinicId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// ❌ Avoid fetch in useEffect
// useEffect(() => {
//   fetch('/api/providers').then(...) // BAD
// }, [])
```

## Security Patterns

### Input Validation
```typescript
// ✅ Always validate input with Zod
const ProviderSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  licenseNumber: z.string().regex(/^[A-Z0-9]{6,}$/)
})

export const POST = async (request: Request) => {
  const body = await request.json()
  
  // Validate input
  const result = ProviderSchema.safeParse(body)
  if (!result.success) {
    return apiError('Invalid input', 400, result.error)
  }
  
  // Process validated data
  const provider = await createProvider(result.data)
}
```

### Authentication Checks
```typescript
// ✅ Always verify auth in API routes
export const GET = withAuth(async (request, { user }) => {
  // User is authenticated and typed
  if (!user.permissions.includes('read:providers')) {
    return apiError('Insufficient permissions', 403)
  }
  
  // Proceed with logic
})
```

## Testing Patterns

### Test Structure
```typescript
// ✅ Descriptive test names
describe('ProviderCard', () => {
  it('should display provider name and specialty', () => {
    // Test implementation
  })
  
  it('should call onSelect when clicked', () => {
    // Test implementation
  })
  
  it('should show loading state while fetching data', () => {
    // Test implementation
  })
})

// ✅ Use beforeEach for setup
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks()
})
```

## Things to Avoid

### Code Smells
```typescript
// ❌ Magic numbers
if (count > 10) {} // BAD

// ✅ Named constants
const MAX_ITEMS_PER_PAGE = 10
if (count > MAX_ITEMS_PER_PAGE) {} // GOOD

// ❌ Nested ternaries
const status = isActive ? isPending ? 'pending' : 'active' : 'inactive' // BAD

// ✅ Early returns or if/else
if (!isActive) return 'inactive'
if (isPending) return 'pending'
return 'active' // GOOD

// ❌ Long parameter lists
function createProvider(name, email, phone, address, specialty) {} // BAD

// ✅ Object parameters
function createProvider({ name, email, phone, address, specialty }: ProviderInput) {} // GOOD
```

### Anti-Patterns
- ❌ Using `any` type
- ❌ Ignoring TypeScript errors with `@ts-ignore`
- ❌ Empty catch blocks
- ❌ Direct DOM manipulation in React
- ❌ Mutating state directly
- ❌ Using `var` instead of `const`/`let`
- ❌ Implicit globals
- ❌ Synchronous operations in async contexts

## Related Resources

- [TypeScript Best Practices](../developer-guidelines/null-safety-guidelines.md)
- [Testing Strategy](./testing-strategy.md)
- [Code Review Checklist](./code-review-checklist.md)

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)