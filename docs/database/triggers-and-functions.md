# Database Triggers & Functions Documentation

## Overview

This document describes the database triggers and functions implemented in Phase 7 of the multi-tenant migration. These automations ensure data consistency, provide helper utilities, and maintain audit trails.

## Table of Contents

1. [User Management Triggers](#user-management-triggers)
2. [Data Consistency Functions](#data-consistency-functions)
3. [Audit Logging System](#audit-logging-system)
4. [Helper Functions](#helper-functions)
5. [Scheduled Functions](#scheduled-functions)
6. [Data Validation Triggers](#data-validation-triggers)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)

## User Management Triggers

### handle_new_auth_user()
**Trigger:** `on_auth_user_created`  
**Purpose:** Automatically creates a user profile when a new auth user is registered

```sql
-- Example: When a user signs up via Supabase Auth
-- This trigger automatically:
-- 1. Creates a user record in the users table
-- 2. Assigns them to a default clinic
-- 3. Creates their initial clinic role
```

**Features:**
- Extracts user metadata from auth record
- Assigns default role if not specified
- Creates initial clinic membership
- Sets up user profile with email and name

### handle_auth_user_updated()
**Trigger:** `on_auth_user_updated`  
**Purpose:** Syncs email changes from auth to user profile

```sql
-- When user updates email in Supabase Auth
-- The change is automatically reflected in the users table
```

### handle_user_deletion()
**Trigger:** `on_user_deleted`  
**Purpose:** Handles cascading effects of user deletion

**Actions:**
- Soft deletes user (sets status to 'inactive')
- Deactivates all clinic roles
- Cancels active goals assigned to user
- Maintains referential integrity

## Data Consistency Functions

### validate_clinic_membership()
**Purpose:** Ensures users can only access clinics they're assigned to

```sql
-- Applied to tables: goals, metric_values, etc.
-- Prevents unauthorized cross-clinic data access
```

### calculate_goal_progress()
**Trigger:** `on_goal_progress_insert`  
**Purpose:** Automatically updates goal status based on progress

**Features:**
- Calculates progress percentage
- Updates goal's current_value
- Marks goal as completed when target reached
- Timestamps completion

### aggregate_daily_metrics()
**Purpose:** Aggregates metric data for reporting

```sql
-- Aggregates by:
-- - Clinic
-- - Provider
-- - Metric type
-- - Date
-- Supports both SUM and AVERAGE aggregations
```

## Audit Logging System

### audit_logs Table
Stores comprehensive audit trail of all data modifications

**Schema:**
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  user_id text,
  auth_id text,
  action text,        -- INSERT, UPDATE, DELETE
  table_name text,
  record_id text,
  old_data jsonb,     -- Previous values
  new_data jsonb,     -- New values
  ip_address inet,
  user_agent text,
  created_at timestamptz
);
```

### audit_trigger_function()
Generic audit logging function applied to sensitive tables

**Monitored Tables:**
- users
- clinics
- data_sources
- (easily extensible to other tables)

**Usage:**
```sql
-- To add audit logging to a new table:
CREATE TRIGGER audit_[table_name]
  AFTER INSERT OR UPDATE OR DELETE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();
```

## Helper Functions

### get_user_clinics(auth_id)
Returns all clinics a user has access to

**Returns:**
- clinic_id
- clinic_name
- role
- is_active

**Example:**
```sql
SELECT * FROM get_user_clinics('auth-id-here');
```

### check_clinic_access(auth_id, clinic_id, required_role)
Validates user access to a specific clinic

**Parameters:**
- `auth_id`: User's auth ID
- `clinic_id`: Clinic to check
- `required_role` (optional): Minimum role required

**Role Hierarchy:**
```
admin > clinic_admin > provider > staff > viewer
```

**Example:**
```sql
-- Check if user can access clinic
SELECT check_clinic_access('auth-id', 'clinic-id');

-- Check if user is at least a provider
SELECT check_clinic_access('auth-id', 'clinic-id', 'provider');
```

### calculate_clinic_metrics(clinic_id, start_date, end_date)
Calculates aggregated metrics for a clinic

**Returns:**
- metric_name
- total_value
- average_value
- min_value
- max_value
- data_points

**Example:**
```sql
SELECT * FROM calculate_clinic_metrics(
  'clinic-id',
  '2024-01-01'::date,
  '2024-01-31'::date
);
```

### format_export_data(table_name, clinic_id, format)
Formats data for export (JSON/CSV)

**Note:** CSV export requires additional implementation

## Scheduled Functions

These functions are designed to be called by pg_cron or Supabase scheduled functions.

### scheduled_daily_aggregation()
**Frequency:** Daily  
**Actions:**
- Aggregates daily metrics
- Cleans up old goal progress (>90 days)
- Updates clinic statistics
- Logs execution

### scheduled_weekly_reports()
**Frequency:** Weekly  
**Actions:**
- Generates weekly summaries per clinic
- Calculates total production
- Counts active providers
- Tracks active goals

### scheduled_monthly_cleanup()
**Frequency:** Monthly  
**Actions:**
- Archives old audit logs (>12 months)
- Removes orphaned records
- Cleans expired OAuth tokens
- Maintains database health

## Data Validation Triggers

### validate_email()
Ensures email addresses follow proper format

**Pattern:** `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

### enforce_business_rules()
Enforces domain-specific business logic

**Rules:**
- Goal target dates must be in the future
- Metric values must be positive
- (Easily extensible for new rules)

## Performance Optimization

### refresh_materialized_views()
Refreshes materialized views for better query performance

### maintain_indexes()
Performs concurrent reindexing on high-traffic tables:
- metric_values
- goal_progress
- audit_logs

## Error Handling

### log_trigger_error()
Event trigger for capturing and logging DDL errors

**Note:** Requires superuser privileges to create event triggers

## Security Considerations

1. **Function Security:**
   - Most functions use `SECURITY DEFINER` for consistent permissions
   - Helper functions are granted to `authenticated` role
   - System functions restricted to admin use

2. **Data Access:**
   - All functions respect multi-tenant boundaries
   - Clinic access validated before operations
   - Role-based permissions enforced

3. **Audit Trail:**
   - All sensitive operations logged
   - User context captured when available
   - Immutable audit records

## Testing

Run the test suite with:
```sql
\i 04_triggers_and_functions.test.sql
```

Tests cover:
- User management triggers
- Data consistency validations
- Audit logging functionality
- Helper function operations
- Business rule enforcement
- Scheduled function execution

## Monitoring

Monitor function performance with:
```sql
-- Check function execution stats
SELECT 
  schemaname,
  funcname,
  calls,
  total_time,
  mean_time
FROM pg_stat_user_functions
WHERE schemaname = 'public'
ORDER BY total_time DESC;

-- Review recent audit logs
SELECT 
  action,
  table_name,
  COUNT(*) as count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY action, table_name
ORDER BY count DESC;
```

## Troubleshooting

### Common Issues

1. **Trigger Not Firing:**
   - Check trigger is enabled: `SELECT tgname, tgenabled FROM pg_trigger`
   - Verify function exists and has correct permissions

2. **Performance Degradation:**
   - Review function execution times
   - Consider adding indexes
   - Check for recursive triggers

3. **Audit Log Growth:**
   - Ensure monthly cleanup is running
   - Consider partitioning for large datasets
   - Archive old logs to cold storage

## Future Enhancements

1. **Additional Scheduled Jobs:**
   - Automated backups
   - Data quality checks
   - Performance reports

2. **Enhanced Validation:**
   - Custom validation rules per clinic
   - Complex business logic enforcement
   - Data quality scoring

3. **Advanced Auditing:**
   - Read access logging
   - Query performance tracking
   - Compliance reporting