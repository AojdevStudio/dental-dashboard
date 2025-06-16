# Database Migration Plan: Multi-Tenant Auth Integration

## Executive Summary

This document outlines the comprehensive migration plan for transitioning the Kamdental database from a single-tenant structure with string-based IDs to a multi-tenant architecture integrated with Supabase Auth using UUID identifiers.

## Current State Analysis

### Existing Schema Structure
- **ID Type**: String (CUID) for all primary keys
- **Authentication**: Custom User table with basic fields
- **Multi-tenancy**: Not implemented
- **Data Sources**: Single DataSource model with embedded OAuth tokens

### Target Schema Structure
- **ID Type**: UUID for all primary keys
- **Authentication**: Supabase auth.users integration
- **Multi-tenancy**: Full clinic-based isolation
- **Data Sources**: Separated google_credentials and spreadsheet_connections

## Migration Phases

### Phase 0: Pre-Migration Preparation
**Timeline**: 1 day
**Risk Level**: Low

1. Create comprehensive database backup
2. Set up staging environment for testing
3. Document current data volumes and relationships
4. Create rollback scripts for each phase

### Phase 1: Additive Schema Changes
**Timeline**: 2 days
**Risk Level**: Low
**Rollback**: Simple - just drop new tables

#### Changes:
1. Add new tables without modifying existing ones:
   - `google_credentials` (encrypted OAuth storage)
   - `spreadsheet_connections` (Sheets mapping)
   - Migration tracking tables

2. Add new columns to existing tables:
   - `uuid_id` columns alongside existing string IDs
   - `clinic_id` for future multi-tenancy
   - `auth_user_id` for Supabase integration

#### SQL Migration:
```sql
-- Add UUID columns to existing tables
ALTER TABLE "User" ADD COLUMN uuid_id UUID;
ALTER TABLE "Clinic" ADD COLUMN uuid_id UUID;
ALTER TABLE "Provider" ADD COLUMN uuid_id UUID;
ALTER TABLE "DataSource" ADD COLUMN uuid_id UUID;

-- Create new multi-tenant tables
CREATE TABLE google_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  user_id UUID,
  encrypted_token TEXT NOT NULL,
  token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE spreadsheet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  spreadsheet_id VARCHAR(255) NOT NULL,
  spreadsheet_name VARCHAR(255),
  mapping_config JSONB,
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMP
);
```

### Phase 2: Data Population & Dual-Write
**Timeline**: 3 days
**Risk Level**: Medium
**Rollback**: Remove UUID columns and mappings

#### Steps:
1. Generate UUIDs for all existing records
2. Create ID mapping table for reference
3. Implement dual-write logic in application
4. Migrate OAuth tokens to google_credentials
5. Transform DataSource to spreadsheet_connections

#### Migration Script:
```sql
-- Populate UUIDs
UPDATE "User" SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
UPDATE "Clinic" SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;
UPDATE "Provider" SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;

-- Create mapping table
CREATE TABLE id_mappings (
  table_name VARCHAR(50),
  old_id VARCHAR(255),
  new_id UUID,
  PRIMARY KEY (table_name, old_id)
);

-- Store mappings
INSERT INTO id_mappings (table_name, old_id, new_id)
SELECT 'User', id, uuid_id FROM "User";
```

### Phase 3: Foreign Key Migration
**Timeline**: 2 days
**Risk Level**: High
**Rollback**: Complex - requires data restoration

#### Steps:
1. Add new UUID foreign key columns
2. Populate using mapping table
3. Create new constraints with DEFERRABLE
4. Update application to use UUID relationships

#### Critical Relationships:
- Provider.clinicId → Clinic.uuid_id
- DataSource.clinicId → Clinic.uuid_id
- MetricValue.clinicId → Clinic.uuid_id
- All userId references → User.uuid_id

### Phase 4: Supabase Auth Integration
**Timeline**: 3 days
**Risk Level**: High
**Rollback**: Restore User table and update references

#### Steps:
1. Create Supabase auth users for existing users
2. Map internal user IDs to auth.users.id
3. Update all user references to use auth IDs
4. Implement auth triggers for profile sync

#### Migration Process:
```sql
-- Create auth trigger for user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile entry when new auth user is created
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Phase 5: Enable Row Level Security
**Timeline**: 2 days
**Risk Level**: Medium
**Rollback**: Disable RLS policies

#### RLS Implementation:
1. Enable RLS on all tables
2. Create policies for multi-tenant isolation
3. Implement role-based access policies
4. Test data isolation thoroughly

### Phase 6: Cutover & Cleanup
**Timeline**: 1 day
**Risk Level**: High
**Rollback**: Full database restore

#### Steps:
1. Final data validation
2. Switch application to use UUIDs exclusively
3. Drop old string ID columns
4. Remove dual-write logic
5. Archive mapping tables

## Risk Mitigation

### High-Risk Areas:
1. **Foreign Key Conversion**: Complex relationships may break
   - Mitigation: Extensive testing, gradual rollout
2. **Auth Integration**: User access disruption
   - Mitigation: Parallel auth systems during transition
3. **Data Loss**: Potential for orphaned records
   - Mitigation: Comprehensive validation scripts

### Rollback Procedures:
Each phase includes specific rollback SQL scripts stored in:
- `/migrations/rollback/phase-1-rollback.sql`
- `/migrations/rollback/phase-2-rollback.sql`
- etc.

## Success Criteria

1. **Data Integrity**:
   - Zero data loss
   - All relationships preserved
   - Row counts match pre/post migration

2. **Functionality**:
   - All features working as before
   - Auth flow seamless
   - Multi-tenant isolation verified

3. **Performance**:
   - Query performance within 10% of baseline
   - No significant latency increase
   - RLS overhead acceptable

## Timeline Summary

- **Total Duration**: 14 days
- **Critical Path**: Phases 3-6 (9 days)
- **Buffer Time**: 3 days for issues
- **Rollback Window**: 24 hours per phase

## Post-Migration Tasks

1. Performance optimization
2. Monitor error rates
3. Update documentation
4. Train team on new structure
5. Deprecate old code paths