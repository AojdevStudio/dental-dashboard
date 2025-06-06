/**
 * Rollback Script for Phase 7: Database Triggers & Functions
 * 
 * This script removes all triggers, functions, and tables created
 * in the 04_triggers_and_functions.sql migration
 */

-- =====================================================
-- 1. DROP TRIGGERS
-- =====================================================

-- User management triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_user_deleted ON users;

-- Data consistency triggers
DROP TRIGGER IF EXISTS validate_clinic_access_goals ON goals;
DROP TRIGGER IF EXISTS on_goal_progress_insert ON goal_progress;

-- Audit logging triggers
DROP TRIGGER IF EXISTS audit_users ON users;
DROP TRIGGER IF EXISTS audit_clinics ON clinics;
DROP TRIGGER IF EXISTS audit_data_sources ON data_sources;

-- Validation triggers
DROP TRIGGER IF EXISTS validate_user_email ON users;
DROP TRIGGER IF EXISTS enforce_goal_rules ON goals;
DROP TRIGGER IF EXISTS enforce_metric_rules ON metric_values;

-- =====================================================
-- 2. DROP FUNCTIONS
-- =====================================================

-- User management functions
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_updated() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_deletion() CASCADE;

-- Data consistency functions
DROP FUNCTION IF EXISTS public.validate_clinic_membership() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_goal_progress() CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_daily_metrics() CASCADE;

-- Audit logging functions
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS public.log_trigger_error() CASCADE;

-- Helper functions
DROP FUNCTION IF EXISTS public.get_user_clinics(text) CASCADE;
DROP FUNCTION IF EXISTS public.check_clinic_access(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_clinic_metrics(text, date, date) CASCADE;
DROP FUNCTION IF EXISTS public.format_export_data(text, text, text) CASCADE;

-- Scheduled functions
DROP FUNCTION IF EXISTS public.scheduled_daily_aggregation() CASCADE;
DROP FUNCTION IF EXISTS public.scheduled_weekly_reports() CASCADE;
DROP FUNCTION IF EXISTS public.scheduled_monthly_cleanup() CASCADE;

-- Validation functions
DROP FUNCTION IF EXISTS public.validate_email() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_business_rules() CASCADE;

-- Performance functions
DROP FUNCTION IF EXISTS public.refresh_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS public.maintain_indexes() CASCADE;

-- =====================================================
-- 3. DROP INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_table_record;
DROP INDEX IF EXISTS idx_audit_logs_created_at;

-- =====================================================
-- 4. DROP TABLES
-- =====================================================

-- Drop audit logs table
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop any other tables created for this migration
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS metric_aggregates CASCADE;

-- =====================================================
-- 5. REVOKE PERMISSIONS
-- =====================================================

-- Revoke permissions that were granted
-- Note: Functions are already dropped, so these might fail silently
DO $$
BEGIN
  -- Attempt to revoke permissions (ignore errors if objects don't exist)
  EXECUTE 'REVOKE ALL ON audit_logs FROM authenticated' ;
EXCEPTION
  WHEN undefined_table THEN
    NULL; -- Ignore if table doesn't exist
END;
$$;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Verify triggers are removed
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname IN ('public', 'auth')
    AND t.tgname IN (
      'on_auth_user_created',
      'on_auth_user_updated',
      'on_user_deleted',
      'validate_clinic_access_goals',
      'on_goal_progress_insert',
      'audit_users',
      'audit_clinics',
      'audit_data_sources',
      'validate_user_email',
      'enforce_goal_rules',
      'enforce_metric_rules'
    );
  
  IF trigger_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All triggers removed';
  ELSE
    RAISE WARNING 'WARNING: % triggers still exist', trigger_count;
  END IF;
END;
$$;

-- Verify functions are removed
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'handle_new_auth_user',
      'handle_auth_user_updated',
      'handle_user_deletion',
      'validate_clinic_membership',
      'calculate_goal_progress',
      'aggregate_daily_metrics',
      'audit_trigger_function',
      'get_user_clinics',
      'check_clinic_access',
      'calculate_clinic_metrics',
      'format_export_data',
      'scheduled_daily_aggregation',
      'scheduled_weekly_reports',
      'scheduled_monthly_cleanup',
      'validate_email',
      'enforce_business_rules',
      'refresh_materialized_views',
      'maintain_indexes'
    );
  
  IF function_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All functions removed';
  ELSE
    RAISE WARNING 'WARNING: % functions still exist', function_count;
  END IF;
END;
$$;

-- Verify audit_logs table is removed
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'audit_logs'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE 'SUCCESS: audit_logs table removed';
  ELSE
    RAISE WARNING 'WARNING: audit_logs table still exists';
  END IF;
END;
$$;

-- =====================================================
-- 7. FINAL CLEANUP
-- =====================================================

-- Log the rollback completion
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 7 triggers and functions have been removed';
  RAISE NOTICE 'Database has been restored to pre-migration state';
  RAISE NOTICE '========================================';
END;
$$;