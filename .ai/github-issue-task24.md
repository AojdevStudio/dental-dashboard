# Database Migration & Auth Integration (Task 24)

---

## Relevant Rules & References

- [Prisma Usage Guidelines](mdc:.cursor/rules/.stack/prisma.mdc): Best practices for using Prisma for data access and migrations.
- [Postgres Row Level Security Policies](mdc:.cursor/rules/.stack/rls-policies.mdc): How to write and test RLS policies for secure multi-tenant data access.
- [Safe Schema Updates](mdc:.cursor/rules/.stack/safe-schema-updates.mdc): Procedures for safely updating database schemas in production environments.
- [Task Magic Workflow Diagram](mdc:.cursor/rules/.task-magic/workflow.md): Visual workflow for task creation, execution, and archival in this project.
- [Tasks] individual task files can be found at .ai/tasks/

---

This issue tracks all subtasks for the database migration and authentication integration project. Each phase is critical for a safe, robust migration to a multi-tenant, auth-integrated architecture.

---

## Subtasks Overview

- [x] **24.1:** Schema Analysis & Migration Planning
- [x] **24.2:** Create Backup & Rollback Strategy _(skipped: not needed, see below)_
- [x] **24.3:** Phase 1 - Add New Multi-Tenant Tables
- [x] **24.4:** Phase 2 - Update User Model for Auth Integration
- [x] **24.5:** Phase 3 - Implement Row Level Security Policies
- [x] **24.6:** Phase 4 - Data Migration & Validation
- [x] **24.7:** Phase 5 - Update Database Query Layer
- [x] **24.8:** Phase 6 - Update API Routes & Middleware
- [x] **24.9:** Phase 7 - Implement Database Triggers & Functions
- [x] **24.10:** Phase 8 - End-to-End Integration Testing

---

## 24.1: Schema Analysis & Migration Planning

**Status:** pending  
**Priority:** critical

### Description

Analyze current vs target schema differences, create detailed migration plan addressing ID type changes (String→UUID), auth integration, and multi-tenancy requirements.

### Details

- Analyze current Prisma schema in `prisma/schema.prisma`
- Compare with target schema requirements from `.dev/database-schema-design.md`
- Document all differences and required changes:
  - ID field type changes (String → UUID)
  - Foreign key relationships that need updating
  - New tables required for multi-tenancy
  - Tables that need auth integration
  - Indexes that need to be added/modified
- Create a detailed migration plan document:
  - Phase-by-phase migration approach
  - Rollback procedures for each phase
  - Data transformation requirements
  - Performance impact assessment
  - Downtime requirements (if any)
- Identify high-risk areas:
  - Tables with large amounts of data
  - Complex foreign key relationships
  - Potential data loss scenarios
- Define success criteria for migration
- Document rollback triggers and procedures

### Test Strategy

- Review migration plan with senior engineers
- Validate that all schema differences are documented
- Ensure rollback procedures are clear and tested
- Verify plan addresses all multi-tenant requirements
- Check that auth integration approach is sound

---

## 24.2: Create Backup & Rollback Strategy

**Status:** skipped  
**Priority:** critical

### Description

**Task Skipped:** No backup or rollback strategy is required at this stage because the database is currently empty and contains no data. There is no risk of data loss during migration, so this task is not applicable.

### Details

- This task was reviewed and determined to be unnecessary for the current migration because there is no existing data in the database.
- No backup or rollback procedures are needed until the database contains production or critical data.
- Future migrations should revisit this requirement once data is present.

---

## 24.3: Phase 1 - Add New Multi-Tenant Tables

**Status:** pending  
**Priority:** critical

### Description

Add new tables (user_clinic_roles, goal_templates, financial_metrics, etc.) without breaking existing schema. Use additive approach.

### Details

- Create new Prisma schema additions:
  - `user_clinic_roles` table for multi-tenant user access
  - `goal_templates` table for reusable goal configurations
  - `financial_metrics` table for advanced financial tracking
  - `appointment_metrics` table for appointment analytics
  - `call_metrics` table for call tracking data
  - `patient_metrics` table for patient analytics
  - `metric_aggregations` table for pre-computed metrics
- Implement proper relationships:
  - Foreign keys to existing tables where applicable
  - Ensure nullable references during transition
  - Add appropriate indexes for query performance
- Add multi-tenant fields:
  - `clinic_id` on all new tables
  - `created_by` and `updated_by` audit fields
  - `created_at` and `updated_at` timestamps
- Create Prisma migrations:
  - Generate migration files
  - Review SQL for correctness
  - Add any custom SQL for constraints
- Update Prisma client:
  - Regenerate Prisma client
  - Verify type definitions are correct
  - Test basic CRUD operations
- Document new table purposes and relationships

### Test Strategy

- Verify new tables are created successfully
- Test that existing functionality is not broken
- Validate foreign key constraints work correctly
- Ensure indexes are created and used by queries
- Test multi-tenant data isolation

---

## 24.4: Phase 2 - Update User Model for Auth Integration

**Status:** pending  
**Priority:** critical

### Description

Carefully migrate User model to reference Supabase auth.users. Handle ID type conversion and foreign key constraints.

### Details

- Analyze current User model:
  - Document all foreign key relationships
  - Identify all queries using User.id
  - List all tables referencing User
- Create migration strategy for ID change:
  - Add new `auth_id` UUID field to User table
  - Populate `auth_id` with Supabase auth user IDs
  - Create mapping table for old ID to new UUID
  - Update foreign key constraints incrementally
- Implement dual-ID support phase:
  - Keep both old String ID and new UUID temporarily
  - Update queries to handle both ID types
  - Add database triggers for consistency
- Update Prisma schema:
  - Modify User model to reference auth.users
  - Update ID field type from String to UUID
  - Adjust all relationships accordingly
- Handle edge cases:
  - Users without Supabase accounts
  - Orphaned records
  - Data integrity violations
- Create data migration scripts:
  - Batch processing for large datasets
  - Progress tracking and resumability
  - Error handling and logging
- Update application code:
  - Auth context integration
  - Session management updates
  - User lookup modifications

### Test Strategy

- Test ID migration on subset of users first
- Verify all foreign key relationships maintain integrity
- Ensure no data loss during conversion
- Test application functionality with both ID types
- Validate auth integration works correctly

---

## 24.5: Phase 3 - Implement Row Level Security Policies

**Status:** pending  
**Priority:** critical

### Description

Create comprehensive RLS policies for all tables ensuring multi-tenant data isolation and proper auth context.

### Details

- Enable RLS on all tables:
  - User-related tables
  - Clinic-related tables
  - Metric tables
  - Goal tables
  - Integration tables
- Create RLS policies for each table:
  - SELECT policies for data visibility
  - INSERT policies for data creation
  - UPDATE policies for data modification
  - DELETE policies for data removal
- Implement multi-tenant isolation:
  - Users can only see data from their clinics
  - Clinic admins have broader access within clinic
  - Super admins have cross-clinic access
  - Public data handling (if any)
- Create auth context functions:
  - `auth.uid()` integration
  - `get_user_clinics()` helper function
  - `has_clinic_access()` validation function
  - `is_clinic_admin()` role check
- Handle special cases:
  - Shared resources between clinics
  - System-wide configurations
  - Audit log access
  - Report generation access
- Performance optimization:
  - Index optimization for RLS queries
  - Policy simplification where possible
  - Caching strategies for auth context
- Create bypass mechanisms:
  - Service role for admin operations
  - Migration scripts access
  - Backup procedures access
- Document policy logic:
  - Decision trees for each table
  - Access matrix documentation
  - Testing scenarios

### Test Strategy

- Test each RLS policy individually
- Verify multi-tenant isolation is enforced
- Ensure no data leakage between clinics
- Performance test with RLS enabled
- Test edge cases and bypass scenarios

---

## 24.6: Phase 4 - Data Migration & Validation

**Status:** pending  
**Priority:** high

### Description

Migrate existing data to new schema structure, validate data integrity, and ensure no data loss during transition.

### Details

- Create migration scripts:
  - User data migration to auth-integrated model
  - Clinic data restructuring for multi-tenancy
  - Historical metrics data transformation
  - Goal data migration with new relationships
  - Integration settings migration
- Implement data transformation logic:
  - ID type conversions (String to UUID)
  - Timestamp standardization
  - Null value handling
  - Default value population
  - Data normalization
- Build validation framework:
  - Pre-migration data counts
  - Post-migration data counts
  - Data integrity checks
  - Relationship validation
  - Business rule verification
- Handle data quality issues:
  - Duplicate record detection
  - Orphaned record handling
  - Invalid data correction
  - Missing required fields
- Create migration batching:
  - Chunk large tables for processing
  - Progress tracking implementation
  - Resumable migration support
  - Parallel processing where safe
- Implement rollback data tracking:
  - Change log for all migrations
  - Original value storage
  - Reversal script generation
- Performance optimization:
  - Bulk insert operations
  - Index management during migration
  - Transaction size optimization
  - Resource usage monitoring
- Generate migration reports:
  - Success/failure statistics
  - Data quality report
  - Performance metrics
  - Issues encountered

### Test Strategy

- Run migration on test dataset first
- Validate row counts match pre/post migration
- Verify all relationships are preserved
- Test data access through application
- Validate business logic still works correctly

---

## 24.7: Phase 5 - Update Database Query Layer

**Status:** pending  
**Priority:** high

### Description

Refactor all database queries in lib/database/queries/ to work with new auth-integrated schema and multi-tenant structure.

### Details

- Update query files in lib/database/queries/:
  - `metrics.ts` - Add clinic context filtering
  - `users.ts` - Integrate auth.users references
  - `clinics.ts` - Implement multi-tenant access
  - `goals.ts` - Update for new relationships
  - `google-sheets.ts` - Add tenant isolation
- Implement auth context in queries:
  - Add user context parameter to all functions
  - Implement clinic-based filtering
  - Add RLS-aware query patterns
  - Handle service-level queries
- Update query patterns:
  - Replace String IDs with UUID types
  - Add proper TypeScript types
  - Implement proper error handling
  - Add query logging/debugging
- Optimize query performance:
  - Review and update indexes usage
  - Implement query result caching
  - Add pagination where needed
  - Optimize complex joins
- Handle backward compatibility:
  - Support both old and new ID formats temporarily
  - Graceful fallbacks for missing data
  - Migration period query variants
- Create query utilities:
  - Common auth context helpers
  - Clinic access validators
  - ID format converters
  - Error standardization
- Update query tests:
  - Multi-tenant test scenarios
  - Auth context mocking
  - Performance benchmarks
  - Edge case coverage
- Document query changes:
  - Migration guide for developers
  - New query pattern examples
  - Performance considerations
  - Security best practices

### Test Strategy

- Unit test each updated query function
- Integration test with real database
- Verify multi-tenant isolation works
- Performance test critical queries
- Test backward compatibility scenarios

---

## 24.8: Phase 6 - Update API Routes & Middleware

**Status:** pending  
**Priority:** high

### Description

Modify all API routes to use updated database queries, ensure proper auth context, and implement RLS-aware data access.

### Details

- Update API route handlers:
  - `/api/auth/*` - Full auth integration
  - `/api/metrics/*` - Multi-tenant metrics access
  - `/api/goals/*` - Clinic-scoped goal management
  - `/api/clinics/*` - Access control updates
  - `/api/users/*` - Auth user integration
  - `/api/google-sheets/*` - Tenant-isolated sync
  - `/api/export/*` - Filtered data exports
- Implement auth middleware enhancements:
  - Extract user context from session
  - Validate clinic access permissions
  - Add request context enrichment
  - Implement role-based access
- Update request/response handling:
  - UUID parameter validation
  - Proper error responses
  - Consistent status codes
  - Enhanced error messages
- Add security layers:
  - Rate limiting per tenant
  - Request validation
  - Input sanitization
  - Output filtering
- Implement API versioning:
  - Support both old and new patterns
  - Deprecation warnings
  - Migration period headers
  - Version negotiation
- Update API documentation:
  - New parameter formats
  - Auth requirements
  - Multi-tenant behavior
  - Breaking changes
- Add monitoring/logging:
  - Request tracking
  - Performance metrics
  - Error logging
  - Audit trail
- Handle edge cases:
  - Missing auth context
  - Invalid clinic access
  - Legacy API calls
  - Service-level access

### Test Strategy

- Test each API endpoint individually
- Verify auth context is properly enforced
- Test multi-tenant data isolation
- Load test with new auth layer
- Test API version compatibility

---

## 24.9: Phase 7 - Implement Database Triggers & Functions

**Status:** pending  
**Priority:** medium

### Description

Create Supabase functions for automatic user profile creation, data consistency, and audit logging.

### Details

- Create user management triggers:
  - Auto-create user profile on auth.users insert
  - Sync user updates between auth and profile
  - Handle user deletion cascades
  - Email verification status sync
- Implement data consistency functions:
  - Clinic membership validation
  - Goal progress calculations
  - Metric aggregation triggers
  - Cache invalidation triggers
- Build audit logging system:
  - User action tracking
  - Data modification logs
  - Access attempt logging
  - Compliance audit trail
- Create helper functions:
  - `get_user_clinics()` - Return user's clinic access
  - `check_clinic_access()` - Validate clinic permissions
  - `calculate_metrics()` - Compute derived metrics
  - `format_export_data()` - Prepare data for export
- Implement scheduled functions:
  - Daily metric aggregations
  - Weekly report generation
  - Monthly data cleanup
  - Periodic sync validation
- Add data validation triggers:
  - Business rule enforcement
  - Data format validation
  - Relationship integrity checks
  - Constraint enforcement
- Performance optimization:
  - Materialized view refresh
  - Index maintenance
  - Statistics updates
  - Query plan optimization
- Error handling and recovery:
  - Trigger failure logging
  - Automatic retry logic
  - Alert notifications
  - Fallback procedures

### Test Strategy

- Test each trigger individually
- Verify data consistency is maintained
- Test cascade operations
- Validate audit logs are complete
- Performance test under load

---

## 24.10: Phase 8 - End-to-End Integration Testing

**Status:** pending  
**Priority:** medium

### Description

Comprehensive testing of auth + database integration across all user flows, including multi-tenant scenarios and edge cases.

### Details

- Create comprehensive test suites:
  - User registration and login flows
  - Multi-clinic user access scenarios
  - Data isolation verification
  - Permission boundary testing
- Test user journey scenarios:
  - New user onboarding
  - Clinic administrator workflows
  - Provider data access patterns
  - Report generation flows
  - Google Sheets sync operations
- Verify multi-tenant isolation:
  - Cross-clinic data access attempts
  - Shared resource handling
  - User switching between clinics
  - Admin override scenarios
- Performance testing:
  - Load test with multiple concurrent users
  - Large dataset query performance
  - RLS performance impact measurement
  - Auth session handling at scale
- Security testing:
  - SQL injection attempts
  - Authorization bypass attempts
  - Session hijacking scenarios
  - Data leakage testing
- Integration testing:
  - External service connections
  - Email notification flows
  - Export functionality
  - Scheduled job execution
- Edge case testing:
  - Network interruption handling
  - Partial migration scenarios
  - Concurrent update conflicts
  - Data corruption recovery
- Regression testing:
  - All existing features still work
  - No performance degradation
  - UI/UX consistency
  - API compatibility
- Documentation validation:
  - API documentation accuracy
  - Migration guide completeness
  - Runbook effectiveness
  - Training material updates

### Test Strategy

- Execute full test suite in staging environment
- Run automated regression tests
- Perform manual exploratory testing
- Conduct user acceptance testing
- Document all issues found and resolved

---

_This issue was auto-generated from the project's internal task system to ensure all migration phases are tracked and executed with full context and rigor._
