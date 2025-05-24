# Phase 4: Data Migration Guide

## Overview

This guide covers the data migration process from the current String-based IDs to UUID-based IDs, implementing multi-tenant support and auth integration. The migration is designed to be safe, resumable, and reversible.

## Migration Architecture

### Key Components

1. **Migration Script** (`migrate-to-uuid.ts`): Handles the actual data transformation
2. **Validation Script** (`validate-migration.ts`): Verifies data integrity post-migration
3. **Rollback Script** (`rollback-uuid-migration.ts`): Reverts changes if needed
4. **ID Mapping Table**: Tracks old-to-new ID relationships for reference

### Migration Strategy

- **Additive Approach**: UUIDs are added alongside existing IDs
- **Batch Processing**: Large datasets processed in configurable chunks
- **Checkpoint System**: Migration can be resumed from last successful point
- **Transaction Safety**: Each batch is wrapped in a database transaction
- **Comprehensive Logging**: Detailed reports for audit trail

## Pre-Migration Checklist

- [ ] Database backup completed
- [ ] All tests passing on current codebase
- [ ] Migration scripts reviewed and tested in staging
- [ ] Rollback procedure tested
- [ ] Team notified of maintenance window
- [ ] Monitoring alerts configured

## Running the Migration

### Step 1: Initial Validation

```bash
# Check current database state
pnpm migrate:validate
```

This will generate a baseline report of the current data state.

### Step 2: Run Migration

```bash
# Execute the migration
pnpm migrate:uuid
```

The migration will:
1. Process users first (foundation for other relationships)
2. Then clinics
3. Finally dashboards and related entities

### Step 3: Post-Migration Validation

```bash
# Validate the migration succeeded
pnpm migrate:validate
```

Review the validation report for any issues.

### Step 4: Application Testing

1. Test user authentication flows
2. Verify clinic data access
3. Check dashboard functionality
4. Validate API endpoints

## Migration Details

### User Migration

```typescript
// Users are migrated with:
- uuidId: New UUID identifier
- authId: Placeholder for Supabase auth integration
- ID mapping record created
```

### Clinic Migration

```typescript
// Clinics receive:
- uuidId: New UUID identifier
- ID mapping record created
- All relationships preserved
```

### Dashboard Migration

```typescript
// Dashboards are updated with:
- uuidId: New UUID identifier
- userUuidId: Reference to user's UUID
- ID mapping record created
```

## Checkpoint System

The migration uses a checkpoint system to track progress:

```json
{
  "phase": "uuid_migration",
  "table": "users",
  "lastProcessedId": "user123",
  "processedCount": 1500,
  "totalCount": 3000,
  "status": "in_progress",
  "errors": []
}
```

If the migration is interrupted, it will resume from the last checkpoint.

## Error Handling

### Common Issues

1. **Missing User UUID for Dashboard**
   - Cause: Dashboard references user not yet migrated
   - Solution: Ensure users are migrated before dashboards

2. **Duplicate UUID**
   - Cause: UUID generation collision (extremely rare)
   - Solution: Script will retry with new UUID

3. **Transaction Timeout**
   - Cause: Batch size too large
   - Solution: Reduce BATCH_SIZE in script

### Error Recovery

All errors are logged with context:
```json
{
  "table": "users",
  "id": "user123",
  "error": "Database connection lost",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Rollback Procedure

If issues are discovered post-migration:

```bash
# Rollback all UUID changes
pnpm migrate:rollback
```

The rollback will:
1. Remove all UUID fields
2. Clear auth integration fields
3. Delete ID mapping records
4. Validate complete rollback

## Performance Considerations

### Batch Size

Default: 1000 records per batch

Adjust based on:
- Database performance
- Available memory
- Network latency
- Transaction timeout settings

### Indexes

The migration relies on these indexes for performance:
- Primary key indexes (id)
- UUID field indexes (created during migration)
- ID mapping composite index

### Resource Usage

Monitor during migration:
- Database CPU usage
- Memory consumption
- Disk I/O
- Network throughput

## Validation Reports

### Pre-Migration Report
```json
{
  "timestamp": "2024-01-20T10:00:00Z",
  "overallStatus": "passed",
  "summary": {
    "totalChecks": 15,
    "passed": 15,
    "failed": 0
  }
}
```

### Post-Migration Report
```json
{
  "timestamp": "2024-01-20T11:00:00Z",
  "tables": {
    "users": {
      "total": 1000,
      "migrated": 1000,
      "failed": 0,
      "duration": 5234
    }
  }
}
```

## Monitoring

### During Migration

Watch for:
- Script progress output
- Database connection stability
- Error rate trends
- Memory usage patterns

### Post-Migration

Monitor:
- Application error rates
- API response times
- Database query performance
- User-reported issues

## Next Steps

After successful migration:

1. **Phase 5**: Update database query layer
2. **Phase 6**: Update API routes
3. **Phase 7**: Implement triggers
4. **Phase 8**: End-to-end testing

## Troubleshooting

### Script Won't Start
- Check database connection
- Verify environment variables
- Ensure proper permissions

### Slow Performance
- Reduce batch size
- Check database indexes
- Monitor concurrent connections

### Validation Failures
- Review specific check details
- Run targeted queries
- Check data consistency

### Rollback Issues
- Verify ID mappings exist
- Check transaction logs
- Review error reports

## Emergency Contacts

- Database Admin: [Contact]
- DevOps Lead: [Contact]
- Product Owner: [Contact]

## Appendix

### Environment Variables

```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
BATCH_SIZE=1000
```

### SQL Queries for Manual Verification

```sql
-- Check UUID population
SELECT COUNT(*) FROM users WHERE uuid_id IS NOT NULL;
SELECT COUNT(*) FROM clinics WHERE uuid_id IS NOT NULL;
SELECT COUNT(*) FROM dashboards WHERE uuid_id IS NOT NULL;

-- Verify ID mappings
SELECT table_name, COUNT(*) 
FROM id_mappings 
GROUP BY table_name;

-- Check for orphaned records
SELECT COUNT(*) FROM providers p
LEFT JOIN clinics c ON p.clinic_id = c.id
WHERE c.id IS NULL;
```