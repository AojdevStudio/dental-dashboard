# Dual-ID Support Guide

## Overview

During Phase 2 of the migration, the system maintains both String (CUID) and UUID identifiers to ensure a smooth transition without breaking existing functionality.

## Current State

### Tables with Dual-ID Support

1. **User Table**
   - `id` (String) - Current primary key
   - `uuidId` (String) - Future primary key
   - `authId` (String) - Supabase auth.users reference

2. **Clinic Table**
   - `id` (String) - Current primary key
   - `uuidId` (String) - Future primary key

3. **Dashboard Table**
   - `id` (String) - Current primary key
   - `uuidId` (String) - Future primary key
   - `userId` (String) - Current FK to User.id
   - `userUuidId` (String) - Future FK to User.uuidId

## ID Mapping Table

The `id_mappings` table tracks the relationship between old and new IDs:
```prisma
model IdMapping {
  id         String   @id @default(cuid())
  tableName  String   @map("table_name")
  oldId      String   @map("old_id")
  newId      String   @map("new_id")
  createdAt  DateTime @default(now()) @map("created_at")
  
  @@unique([tableName, oldId])
  @@index([tableName])
  @@map("id_mappings")
}
```

## Query Patterns

### Reading Data (Support Both IDs)

```typescript
// Find user by either ID type
async function findUser(id: string) {
  // Try UUID first
  let user = await prisma.user.findUnique({
    where: { uuidId: id }
  });
  
  // Fall back to CUID
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: id }
    });
  }
  
  return user;
}
```

### Creating Relationships

```typescript
// When creating a dashboard, support both ID types
async function createDashboard(userId: string, data: DashboardData) {
  // Look up the user to get both IDs
  const user = await findUser(userId);
  
  return prisma.dashboard.create({
    data: {
      ...data,
      userId: user.id,        // Keep for backward compatibility
      userUuidId: user.uuidId // Set for forward compatibility
    }
  });
}
```

### Updating References

```typescript
// Helper to get UUID from CUID
async function getUuidFromCuid(tableName: string, cuid: string) {
  const mapping = await prisma.idMapping.findUnique({
    where: {
      tableName_oldId: {
        tableName,
        oldId: cuid
      }
    }
  });
  
  return mapping?.newId;
}
```

## Migration Utilities

### Populate UUIDs Script

Run the population script to generate UUIDs for existing records:
```bash
pnpm tsx scripts/populate-uuids.ts
```

### Verify Migration Status

```typescript
async function getMigrationStatus() {
  const users = await prisma.user.count();
  const usersWithUuid = await prisma.user.count({
    where: { uuidId: { not: null } }
  });
  
  const clinics = await prisma.clinic.count();
  const clinicsWithUuid = await prisma.clinic.count({
    where: { uuidId: { not: null } }
  });
  
  return {
    users: { total: users, migrated: usersWithUuid },
    clinics: { total: clinics, migrated: clinicsWithUuid }
  };
}
```

## API Response Handling

### Include Both IDs in Responses

```typescript
// API response should include both IDs during transition
app.get('/api/users/:id', async (req, res) => {
  const user = await findUser(req.params.id);
  
  res.json({
    id: user.uuidId || user.id,  // Prefer UUID if available
    legacyId: user.id,            // Always include CUID
    ...user
  });
});
```

### Accept Both ID Formats

```typescript
// Middleware to normalize IDs
function normalizeId(req, res, next) {
  const id = req.params.id;
  
  // UUID format check
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  req.idType = isUuid ? 'uuid' : 'cuid';
  next();
}
```

## Frontend Handling

### ID Type Detection

```typescript
// Utility to detect ID type
export function getIdType(id: string): 'uuid' | 'cuid' {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? 'uuid' : 'cuid';
}

// Store both IDs in frontend state
interface User {
  id: string;        // Primary ID (UUID when available)
  legacyId: string;  // CUID for backward compatibility
  // ... other fields
}
```

## Testing Strategy

### Test Both ID Types

```typescript
describe('Dual ID Support', () => {
  it('should find user by CUID', async () => {
    const user = await findUser(testUser.id);
    expect(user).toBeDefined();
  });
  
  it('should find user by UUID', async () => {
    const user = await findUser(testUser.uuidId);
    expect(user).toBeDefined();
  });
  
  it('should handle relationships with both IDs', async () => {
    const dashboard = await createDashboard(testUser.id, data);
    expect(dashboard.userId).toBe(testUser.id);
    expect(dashboard.userUuidId).toBe(testUser.uuidId);
  });
});
```

## Monitoring

### Track ID Usage

```typescript
// Log which ID type is being used
function logIdUsage(idType: 'uuid' | 'cuid', table: string) {
  logger.info('ID usage', {
    idType,
    table,
    timestamp: new Date()
  });
}
```

### Migration Progress Dashboard

Monitor the migration progress:
- Percentage of records with UUIDs
- API calls using UUID vs CUID
- Failed ID lookups
- Performance metrics

## Phase 3 Preparation

Once all records have UUIDs and the application is tested:

1. **Update Foreign Keys**: Add UUID-based foreign keys alongside existing ones
2. **Switch Primary Keys**: Make UUID the primary key in a coordinated update
3. **Remove Legacy IDs**: Drop CUID columns after full migration

## Best Practices

1. **Always populate both IDs** when creating new records
2. **Test with both ID types** in all queries
3. **Log ID type usage** to track migration progress
4. **Handle missing UUIDs gracefully** with fallbacks
5. **Keep ID mapping table updated** for audit trail

## Troubleshooting

### Common Issues

1. **Missing UUID**: Record created before migration
   - Solution: Run populate-uuids script
   
2. **Duplicate UUID**: Constraint violation
   - Solution: Check id_mappings for conflicts
   
3. **Performance degradation**: Double lookups
   - Solution: Add indexes, implement caching

### Emergency Rollback

If issues arise, use the rollback script:
```bash
psql $DATABASE_URL < migrations/rollback/phase-2-uuid-rollback.sql
```