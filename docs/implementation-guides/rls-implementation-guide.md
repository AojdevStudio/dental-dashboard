# Row Level Security (RLS) Implementation Guide

## Overview

This document describes the Row Level Security (RLS) implementation for the KamDental dashboard's multi-tenant architecture. RLS ensures that users can only access data they are authorized to see, providing strong data isolation between clinics.

## Architecture

### Core Principles

1. **Multi-Tenant Isolation**: Each clinic's data is completely isolated from other clinics
2. **Role-Based Access Control**: Different user roles have different permissions within a clinic
3. **Performance Optimized**: Policies use indexes and efficient queries
4. **Fail-Secure**: Default deny approach - access must be explicitly granted

### User Roles

The system supports four primary roles within each clinic:

- **clinic_admin**: Full access to all clinic data and settings
- **provider**: Access to patient data and metrics, can create goals
- **staff**: Can view and update operational data
- **viewer**: Read-only access to reports and dashboards

### Helper Functions

The implementation includes several PostgreSQL functions to simplify policy logic:

```sql
-- Get all clinics a user has access to
auth.get_user_clinics() -> SETOF uuid

-- Check if user has access to a specific clinic
auth.has_clinic_access(clinic_id text) -> boolean

-- Check if user is a clinic admin
auth.is_clinic_admin(clinic_id text) -> boolean

-- Get user's role in a specific clinic
auth.get_user_role(clinic_id text) -> text
```

## Policy Implementation

### 1. Clinic Access

Users can only see clinics they have been explicitly granted access to through the `user_clinic_roles` table.

```sql
-- Users can only see their assigned clinics
CREATE POLICY "Users can view their assigned clinics"
ON clinics FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT clinic_id::text
    FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = (SELECT auth.uid())::text
      AND ucr.is_active = true
  )
);
```

### 2. Data Access Patterns

#### Clinic-Scoped Data
Most tables are scoped to a specific clinic:

```sql
-- Example: Financial metrics
CREATE POLICY "Users can view financial metrics for their clinics"
ON financial_metrics FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);
```

#### User-Owned Data
Some data is owned by specific users:

```sql
-- Example: Dashboards
CREATE POLICY "Users can view their dashboards"
ON dashboards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);
```

#### Hierarchical Access
Some tables require checking parent table permissions:

```sql
-- Example: Widgets on dashboards
CREATE POLICY "Users can view widgets on accessible dashboards"
ON widgets FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);
```

### 3. Write Permissions

Write permissions are typically more restrictive than read permissions:

```sql
-- Only clinic admins can create providers
CREATE POLICY "Clinic admins can create providers"
ON providers FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);
```

## Performance Considerations

### 1. Indexes

Critical indexes for RLS performance:

```sql
-- User lookup by auth ID
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Active user-clinic roles
CREATE INDEX idx_user_clinic_roles_user_auth 
ON user_clinic_roles(user_id) 
WHERE is_active = true;

-- Clinic-scoped data
CREATE INDEX idx_financial_metrics_clinic_date 
ON financial_metrics(clinic_id, date);
```

### 2. Query Optimization

- Use `SELECT` statements to cache function results
- Avoid joins in policies where possible
- Use EXISTS instead of IN for better performance

### 3. Policy Simplification

Keep policies simple and focused:
- One policy per operation (SELECT, INSERT, UPDATE, DELETE)
- Use helper functions to encapsulate complex logic
- Leverage indexes for common access patterns

## Testing RLS Policies

### 1. Unit Tests

Test individual policies in isolation:

```typescript
describe('Clinic Access Policies', () => {
  it('should allow users to see only their assigned clinics', async () => {
    // Set up test data
    // Authenticate as test user
    // Verify only authorized clinics are returned
  })
})
```

### 2. Integration Tests

Test complete workflows:

```typescript
describe('Multi-Tenant Data Isolation', () => {
  it('should prevent data leakage between clinics', async () => {
    // Create data in multiple clinics
    // Authenticate as users from different clinics
    // Verify complete isolation
  })
})
```

### 3. Performance Tests

Ensure policies don't degrade performance:

```typescript
describe('RLS Performance', () => {
  it('should handle large datasets efficiently', async () => {
    // Create large dataset
    // Measure query performance with RLS
    // Verify acceptable response times
  })
})
```

## Security Best Practices

### 1. Default Deny

All tables have RLS enabled by default, requiring explicit policies for access.

### 2. Service Role Usage

The service role bypasses RLS and should only be used for:
- System administration tasks
- Data migrations
- Scheduled jobs and aggregations

### 3. Audit Trail

Consider implementing audit policies for sensitive operations:

```sql
-- Log all modifications to financial data
CREATE TRIGGER audit_financial_metrics
AFTER INSERT OR UPDATE OR DELETE ON financial_metrics
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();
```

## Migration Considerations

### 1. Enabling RLS

When enabling RLS on existing tables:
1. Create policies before enabling RLS
2. Test thoroughly in staging
3. Have rollback plan ready
4. Monitor performance impact

### 2. Policy Updates

When updating policies:
1. Use CREATE OR REPLACE for functions
2. Drop and recreate policies atomically
3. Test all affected operations
4. Update documentation

### 3. Performance Monitoring

Monitor RLS impact:
- Query execution times
- Index usage statistics
- Slow query logs
- Application response times

## Troubleshooting

### Common Issues

1. **No data returned**: Check auth context and user-clinic mappings
2. **Permission denied**: Verify role assignments and policy conditions
3. **Slow queries**: Check index usage and policy complexity
4. **Inconsistent access**: Ensure helper functions are STABLE

### Debug Queries

```sql
-- Check user's clinic access
SELECT * FROM auth.get_user_clinics();

-- Verify role assignment
SELECT auth.get_user_role('clinic-id-here');

-- Test specific policy
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-auth-id';
SELECT * FROM financial_metrics WHERE clinic_id = 'test-clinic-id';
```

## Maintenance

### Regular Tasks

1. **Index Maintenance**: Regularly analyze and vacuum tables
2. **Policy Review**: Audit policies for security and performance
3. **Role Cleanup**: Remove inactive user-clinic mappings
4. **Performance Monitoring**: Track query performance over time

### Policy Documentation

Maintain documentation for each table's policies:
- Purpose of each policy
- Required roles and conditions
- Performance considerations
- Test coverage

## Future Enhancements

1. **Dynamic Role Management**: API for managing custom roles
2. **Policy Templates**: Reusable policy patterns
3. **Audit Logging**: Comprehensive access logging
4. **Performance Dashboard**: Real-time RLS performance metrics