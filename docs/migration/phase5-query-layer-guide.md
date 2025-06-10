# Phase 5: Database Query Layer Update Guide

## Overview

This guide documents the updated database query layer that implements multi-tenant support, auth integration, and RLS-aware data access patterns. All queries now require an AuthContext and enforce proper access controls.

## Architecture

### Core Components

1. **Auth Context** (`auth-context.ts`): Provides user and clinic context
2. **Prisma Client** (`client.ts`): Singleton instance for database access
3. **Query Modules**: Domain-specific query functions
   - `users.ts`: User management queries
   - `clinics.ts`: Clinic operations
   - `metrics.ts`: Metrics and aggregations
   - `goals.ts`: Goal management
   - `google-sheets.ts`: Google Sheets integration

### Key Principles

- **Auth Context Required**: Every query function requires AuthContext as first parameter
- **Multi-Tenant Filtering**: Queries automatically filter by accessible clinics
- **Role-Based Permissions**: Operations restricted based on user roles
- **Fail-Safe Design**: Access denied by default unless explicitly granted

## Auth Context

The AuthContext provides essential information for query filtering:

```typescript
interface AuthContext {
  userId: string          // Database user ID
  authId: string         // Supabase auth ID
  clinicIds: string[]    // Accessible clinic IDs
  currentClinicId?: string // Primary clinic
  role?: string          // User's system role
}
```

## Query Patterns

### 1. Basic Multi-Tenant Query

```typescript
// Get resources filtered by accessible clinics
export async function getResources(
  authContext: AuthContext,
  options?: QueryOptions
) {
  const where: Prisma.ResourceWhereInput = {
    clinicId: {
      in: authContext.clinicIds // Only accessible clinics
    }
  }
  
  return prisma.resource.findMany({ where })
}
```

### 2. Single Resource with Access Validation

```typescript
// Get a specific resource with access check
export async function getResourceById(
  authContext: AuthContext,
  resourceId: string
) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  })
  
  if (!resource) {
    return null
  }
  
  // Validate clinic access
  const hasAccess = await validateClinicAccess(
    authContext, 
    resource.clinicId
  )
  
  if (!hasAccess) {
    throw new Error('Access denied')
  }
  
  return resource
}
```

### 3. Role-Based Creation

```typescript
// Create resource with role validation
export async function createResource(
  authContext: AuthContext,
  input: CreateInput
) {
  // Check user role in clinic
  const userRole = await getUserClinicRole(
    authContext,
    input.clinicId
  )
  
  if (!['clinic_admin', 'provider'].includes(userRole)) {
    throw new Error('Insufficient permissions')
  }
  
  return prisma.resource.create({ data: input })
}
```

### 4. Admin-Only Operations

```typescript
// Delete resource (admin only)
export async function deleteResource(
  authContext: AuthContext,
  resourceId: string
) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  })
  
  if (!resource) {
    throw new Error('Resource not found')
  }
  
  const isAdmin = await isClinicAdmin(
    authContext,
    resource.clinicId
  )
  
  if (!isAdmin) {
    throw new Error('Only administrators can delete')
  }
  
  return prisma.resource.delete({
    where: { id: resourceId }
  })
}
```

## Usage Examples

### User Management

```typescript
import { getAuthContext } from '@/lib/database/auth-context'
import { getUsers, createUser } from '@/lib/database/queries/users'

// In an API route or server action
export async function handleGetUsers() {
  const authContext = await getAuthContext()
  if (!authContext) {
    throw new Error('Unauthorized')
  }
  
  // Get all users in accessible clinics
  const { users, total } = await getUsers(authContext, {
    limit: 20,
    offset: 0
  })
  
  return { users, total }
}
```

### Clinic Dashboard

```typescript
import { getClinicDashboardData } from '@/lib/database/queries/clinics'

export async function loadDashboard(clinicId: string) {
  const authContext = await getAuthContext()
  if (!authContext) {
    throw new Error('Unauthorized')
  }
  
  const dashboardData = await getClinicDashboardData(
    authContext,
    clinicId,
    {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    }
  )
  
  return dashboardData
}
```

### Metrics with Aggregation

```typescript
import { getAggregatedMetrics } from '@/lib/database/queries/metrics'

export async function getMonthlyRevenue(clinicId: string) {
  const authContext = await getAuthContext()
  if (!authContext) {
    throw new Error('Unauthorized')
  }
  
  const aggregations = await getAggregatedMetrics(
    authContext,
    clinicId,
    {
      metricDefinitionId: 'revenue-metric-id',
      aggregationType: 'monthly',
      dateRange: {
        start: startOfYear(new Date()),
        end: endOfYear(new Date())
      }
    }
  )
  
  return aggregations
}
```

### Goal Progress Tracking

```typescript
import { getGoals } from '@/lib/database/queries/goals'

export async function getActiveGoalsWithProgress(clinicId: string) {
  const authContext = await getAuthContext()
  if (!authContext) {
    throw new Error('Unauthorized')
  }
  
  const { goals } = await getGoals(
    authContext,
    {
      clinicId,
      active: true
    },
    {
      includeProgress: true,
      limit: 10
    }
  )
  
  return goals
}
```

## Security Considerations

### 1. Token Protection

Google Sheets tokens are automatically sanitized in responses:

```typescript
// Tokens replaced with '***' unless explicitly requested
const dataSources = await getDataSources(authContext)
// dataSources[0].accessToken === '***'

// Only clinic admins can request actual tokens
const dataSource = await getDataSourceById(
  authContext,
  'ds-id',
  { includeToken: true } // Requires admin role
)
```

### 2. Cross-Clinic Access Prevention

All queries validate clinic access:

```typescript
// This will throw if user doesn't have access to clinic3
await getClinicById(authContext, 'clinic3')
```

### 3. Cascading Permissions

Child resources inherit parent permissions:

```typescript
// Widget access requires dashboard access
// Dashboard access requires user/clinic access
const widget = await getWidgetById(authContext, widgetId)
```

## Performance Optimization

### 1. Batch Operations

Use Promise.all for parallel queries:

```typescript
const [users, providers, metrics] = await Promise.all([
  getUsers(authContext, { clinicId }),
  getProviders(authContext, { clinicId }),
  getRecentMetrics(authContext, { clinicId })
])
```

### 2. Selective Includes

Only include relations when needed:

```typescript
// Don't include by default
const clinic = await getClinicById(authContext, clinicId)

// Include when specifically needed
const clinicWithData = await getClinicById(
  authContext,
  clinicId,
  {
    includeProviders: true,
    includeMetrics: true
  }
)
```

### 3. Pagination

Always paginate large datasets:

```typescript
const { metrics, total } = await getMetrics(
  authContext,
  { clinicId },
  {
    limit: 50,
    offset: page * 50,
    orderBy: 'date',
    orderDir: 'desc'
  }
)
```

## Testing

### Unit Testing

Mock auth context and Prisma:

```typescript
const mockAuthContext: AuthContext = {
  userId: 'test-user',
  authId: 'test-auth',
  clinicIds: ['clinic1', 'clinic2'],
  role: 'office_manager'
}

vi.mocked(validateClinicAccess).mockResolvedValue(true)
vi.mocked(prisma.user.findMany).mockResolvedValue([...])

const result = await getUsers(mockAuthContext)
```

### Integration Testing

Test with real database:

```typescript
// Create test data with proper relationships
const testClinic = await createTestClinic()
const testUser = await createTestUser(testClinic.id)
const authContext = await createTestAuthContext(testUser)

// Test actual queries
const users = await getUsers(authContext)
expect(users).toContainEqual(testUser)
```

## Migration from Old Queries

### Before (Direct Prisma)

```typescript
// Old: Direct Prisma access
const users = await prisma.user.findMany({
  where: { clinicId: req.body.clinicId }
})
```

### After (Query Layer)

```typescript
// New: Auth-aware query layer
const authContext = await getAuthContext()
const { users } = await getUsers(authContext, {
  clinicId: req.body.clinicId
})
```

## Error Handling

All queries throw descriptive errors:

```typescript
try {
  const user = await createUser(authContext, input)
} catch (error) {
  if (error.message === 'Access denied to this clinic') {
    // Handle authorization error
  } else if (error.message === 'Only clinic admins can create users') {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Always Get Fresh Auth Context**: Don't cache or reuse auth context
2. **Handle Null Returns**: Many queries return null for not found
3. **Use TypeScript**: Leverage types for better DX
4. **Log Access Attempts**: Consider logging for audit trails
5. **Test Edge Cases**: Empty results, invalid IDs, cross-clinic access

## Troubleshooting

### Common Issues

1. **"Access denied" errors**
   - Check user's clinic access in user_clinic_roles
   - Verify auth context has correct clinic IDs
   - Ensure RLS policies are enabled

2. **Empty results**
   - Verify data exists in accessible clinics
   - Check filters aren't too restrictive
   - Ensure auth context is populated

3. **Performance issues**
   - Add pagination to large queries
   - Check for missing indexes
   - Review include depth

### Debug Helpers

```typescript
// Log auth context
console.log('Auth Context:', JSON.stringify(authContext, null, 2))

// Check specific access
const hasAccess = await validateClinicAccess(authContext, clinicId)
console.log(`Access to ${clinicId}:`, hasAccess)

// List user's roles
const roles = await getUserClinicRoles(authContext)
console.log('User roles:', roles)
```