# Schema Differences Analysis

## Overview
This document provides a detailed comparison between the current Prisma schema and the target Supabase-integrated schema for the Kamdental application.

## ID Type Changes

### Current Schema (String-based)
All tables use: `id String @id @default(cuid())`

### Target Schema (UUID-based)
All tables use: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`

### Migration Impact
- Every table requires ID type conversion
- All foreign key relationships must be updated
- Application code must handle UUID format
- URL parameters and API endpoints affected

## Table-by-Table Analysis

### User Management

#### Current: User Table
```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  passwordHash  String?
  role          String      @default("USER")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  clinics       Clinic[]
}
```

#### Target: Supabase auth.users
- No custom User table
- Uses Supabase's built-in auth.users table
- Profile data stored separately
- Role management via RLS policies

**Migration Requirements:**
1. Export user data
2. Create Supabase auth accounts
3. Migrate profile information
4. Update all user references

### Data Source Management

#### Current: DataSource Model
```prisma
model DataSource {
  id                  String   @id @default(cuid())
  name               String
  type               String
  clinicId           String
  googleSheetsId     String?
  googleRefreshToken String?
  googleAccessToken  String?
  tokenExpiresAt     DateTime?
}
```

#### Target: Split Architecture
1. **google_credentials** table:
   - Encrypted token storage
   - User-specific credentials
   - Expiration tracking

2. **spreadsheet_connections** table:
   - Clinic-specific connections
   - Flexible mapping configuration
   - Sync status tracking

**Migration Requirements:**
1. Decrypt existing tokens
2. Re-encrypt with new schema
3. Split data into two tables
4. Update access patterns

### Multi-Tenancy Additions

#### New Tables Required:
1. **user_clinic_roles**
   - Maps users to clinics with roles
   - Enables multi-clinic access
   - Role-based permissions

2. **clinic_invitations**
   - Pending clinic access invites
   - Email-based invitation flow
   - Expiration handling

### Column Mapping Changes

#### Current: ColumnMapping
```prisma
model ColumnMapping {
  id               String    @id @default(cuid())
  dataSourceId     String
  sourceColumn     String
  targetField      String
  transformType    String?
  transformConfig  Json?
}
```

#### Target: JSONB Configuration
- Single `mapping_config` JSONB column
- More flexible transformation rules
- Version tracking for configs

## Foreign Key Relationship Changes

### Current Relationships
- String-based foreign keys
- Direct User references
- Simple clinic associations

### Target Relationships
- UUID-based foreign keys
- auth.users references
- Multi-tenant aware joins

### Affected Relationships:
1. `Provider.clinicId` → UUID
2. `MetricValue.providerId` → UUID
3. `Goal.clinicId` → UUID
4. All `userId` fields → `auth.users.id`

## Index Changes

### New Indexes Required:
```sql
-- Multi-tenant query optimization
CREATE INDEX idx_clinic_id ON ALL_TABLES (clinic_id);

-- Auth lookups
CREATE INDEX idx_auth_user_id ON relevant_tables (auth_user_id);

-- Performance indexes
CREATE INDEX idx_sync_status ON spreadsheet_connections (sync_status, last_synced_at);
```

### Removed Indexes:
- String-based ID indexes
- Custom user email index (handled by Supabase)

## Security Enhancements

### Current: Application-Level Security
- Basic role checks in code
- No database-level isolation

### Target: Row Level Security
- Database-enforced multi-tenancy
- Policy-based access control
- Automatic user context

### RLS Policies Required:
1. Clinic data isolation
2. User-specific resource access
3. Admin override capabilities
4. Public data handling

## Data Type Changes

### Timestamp Handling
- Current: DateTime with Prisma
- Target: TIMESTAMP WITH TIME ZONE

### JSON Storage
- Current: Json type for configs
- Target: JSONB for better performance

### Enum Changes
- Current: String-based enums
- Target: PostgreSQL native enums

## Missing from Target Schema

The following tables exist in current but not explicitly in target:
1. MetricDefinition
2. MetricValue
3. Goal
4. Dashboard
5. Widget

**Analysis:** These appear to be handled differently in the microservices architecture or may be part of a separate schema not shown.

## Performance Considerations

### UUID vs CUID Performance
- UUIDs: Slightly larger, random distribution
- Index implications for large datasets
- Consider sequential UUIDs for insert performance

### RLS Overhead
- Additional query complexity
- Proper indexing critical
- Monitor query plans

## Application Code Impact

### Required Updates:
1. ID parsing and validation
2. Foreign key assignments
3. Query builders
4. URL routing
5. API responses
6. Frontend ID handling

### TypeScript Changes:
```typescript
// Before
type UserId = string;

// After
type UserId = UUID;
```

## Migration Complexity Score

Based on analysis:
- **Overall Complexity**: 8/10
- **Data Risk**: 7/10
- **Downtime Required**: Minimal with phased approach
- **Rollback Difficulty**: 6/10

## Recommendations

1. **Phased Migration**: Essential due to complexity
2. **Extensive Testing**: Each phase needs validation
3. **Monitoring**: Track performance impacts
4. **Documentation**: Update all technical docs
5. **Training**: Team needs UUID/RLS knowledge