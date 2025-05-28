# User Model Migration Analysis

## Current State

### User Model Structure
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   // office_manager, dentist, front_desk, admin
  lastLogin DateTime? @map("last_login")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  clinicId  String   @map("clinic_id")
  clinic    Clinic   @relation(fields: [clinicId], references: [id])
  dashboards Dashboard[]

  @@map("users")
}
```

### Direct Foreign Key Dependencies
1. **Dashboard** → User (via userId)
   - Relationship: One User to Many Dashboards
   - No cascade rules defined

### Indirect Dependencies (No FK Constraints)
1. **UserClinicRole** → User (via userId)
2. **GoogleCredential** → User (via userId)
3. Multiple tables with `createdBy` fields

## Migration Strategy

### Phase 2.1: Add UUID Support
1. Add `auth_id` UUID field to User table
2. Add `uuid_id` UUID field for future primary key
3. Create id_mappings table for tracking

### Phase 2.2: Dual-ID Implementation
1. Maintain both String and UUID IDs
2. Create database triggers for consistency
3. Update application to handle both formats

### Phase 2.3: Supabase Auth Integration
1. Create Supabase auth users
2. Populate auth_id field
3. Update authentication flow

### Phase 2.4: Foreign Key Migration
1. Add UUID foreign key columns to dependent tables
2. Populate using mapping table
3. Update constraints incrementally

## Risk Assessment

### High Risk Areas
1. **Dashboard** table - Direct FK dependency
2. **Authentication flow** - User login disruption
3. **Session management** - Active user sessions

### Medium Risk Areas
1. **UserClinicRole** - New table, no data yet
2. **GoogleCredential** - OAuth token access

### Low Risk Areas
1. **Audit fields** - No FK constraints
2. **New metric tables** - No user data yet

## Data Integrity Checks

### Pre-Migration
- Count all User records
- Verify email uniqueness
- Check for orphaned Dashboard records
- Document active sessions

### Post-Migration
- Verify UUID generation for all users
- Confirm FK relationships intact
- Test authentication flow
- Validate dashboard access

## Edge Cases

### Users Without Supabase Accounts
- Create placeholder auth records
- Flag for manual review
- Maintain login capability

### Orphaned Records
- Dashboards without valid userId
- Soft delete or reassign
- Log for audit trail

### Active Sessions
- Grace period for migration
- Dual auth support temporarily
- Session migration strategy

## Implementation Timeline

### Day 1: Preparation
- Backup current data
- Add new columns
- Create mapping infrastructure

### Day 2: UUID Population
- Generate UUIDs for all users
- Create id mappings
- Verify data integrity

### Day 3: Supabase Integration
- Create auth users
- Link via auth_id
- Test authentication

### Day 4: Foreign Key Updates
- Migrate Dashboard references
- Update UserClinicRole
- Update GoogleCredential

### Day 5: Validation & Cutover
- Complete testing
- Switch to UUID primary keys
- Remove old columns

## Rollback Plan

### Phase 2.1 Rollback
```sql
ALTER TABLE users DROP COLUMN IF EXISTS auth_id;
ALTER TABLE users DROP COLUMN IF EXISTS uuid_id;
DROP TABLE IF EXISTS id_mappings;
```

### Phase 2.2 Rollback
- Remove triggers
- Revert application code
- Drop UUID columns from dependent tables

### Phase 2.3 Rollback
- Disconnect Supabase auth
- Restore original auth flow
- Clear auth_id values

### Phase 2.4 Rollback
- Restore original FK constraints
- Remove UUID columns
- Revert to String IDs