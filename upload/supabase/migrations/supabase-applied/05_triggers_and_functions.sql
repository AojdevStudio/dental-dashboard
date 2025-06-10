-- =====================================================
-- Phase 4: Database Triggers and Functions
-- =====================================================
-- This migration sets up automated triggers and helper functions
-- Handles auth sync, data validation, and audit logging

-- =====================================================
-- 1. AUTH SYNC FUNCTIONS
-- =====================================================

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  default_clinic_id text;
BEGIN
  -- Get default clinic if exists
  SELECT id INTO default_clinic_id
  FROM clinics
  WHERE is_default = true
  LIMIT 1;

  -- Insert the new user
  INSERT INTO public.users (
    id,
    auth_id,
    email,
    full_name,
    clinic_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid()::text,
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    default_clinic_id,
    NEW.created_at,
    NEW.created_at
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, update instead
    UPDATE public.users
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE auth_id = NEW.id::text;
    RETURN NEW;
END;
$$;

-- Trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to sync user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    updated_at = NOW()
  WHERE auth_id = NEW.id::text;
  
  RETURN NEW;
END;
$$;

-- Trigger for auth user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, updated_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Soft delete by setting deleted_at
  UPDATE public.users
  SET
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = OLD.id;
  
  -- Deactivate all clinic roles
  UPDATE user_clinic_roles
  SET
    is_active = false,
    updated_at = NOW()
  WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Trigger for user deletion
DROP TRIGGER IF EXISTS on_user_deleted ON users;
CREATE TRIGGER on_user_deleted
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- =====================================================
-- 2. DATA CONSISTENCY FUNCTIONS
-- =====================================================

-- Function to validate clinic membership before insert/update
CREATE OR REPLACE FUNCTION public.validate_clinic_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id text;
BEGIN
  -- Different tables have different ways to identify the user
  -- For goals table, we need to check based on the current user context
  IF TG_TABLE_NAME = 'goals' THEN
    -- For goals, validate that the current user has access to the clinic
    IF NEW.clinic_id IS NOT NULL AND NOT public.has_clinic_access(NEW.clinic_id) THEN
      RAISE EXCEPTION 'User does not have access to this clinic';
    END IF;
  ELSE
    -- For other tables that have user_id column
    IF NOT EXISTS (
      SELECT 1 
      FROM user_clinic_roles ucr
      WHERE ucr.user_id = NEW.user_id 
        AND ucr.clinic_id = NEW.clinic_id
        AND ucr.is_active = true
    ) THEN
      RAISE EXCEPTION 'User does not have access to this clinic';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS validate_clinic_access_goals ON goals;
CREATE TRIGGER validate_clinic_access_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW
  WHEN (NEW.clinic_id IS NOT NULL)
  EXECUTE FUNCTION public.validate_clinic_membership();

-- Function to aggregate metrics
CREATE OR REPLACE FUNCTION public.aggregate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Aggregate production metrics by day
  INSERT INTO metric_aggregations (
    clinic_id,
    provider_id,
    period_type,
    period_start,
    period_end,
    metric_type,
    metric_values,
    created_at,
    updated_at
  )
  SELECT
    mv.clinic_id,
    mv.provider_id,
    'daily',
    mv.date::date,
    mv.date::date + INTERVAL '1 day',
    md.name,
    jsonb_build_object(
      'sum', SUM(mv.value::numeric),
      'avg', AVG(mv.value::numeric),
      'count', COUNT(*),
      'min', MIN(mv.value::numeric),
      'max', MAX(mv.value::numeric)
    ),
    NOW(),
    NOW()
  FROM metric_values mv
  JOIN metric_definitions md ON md.id = mv.metric_definition_id
  WHERE mv.date::date = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY mv.clinic_id, mv.provider_id, md.name, mv.date::date
  ON CONFLICT (clinic_id, provider_id, period_type, period_start, metric_type) 
  DO UPDATE SET
    metric_values = EXCLUDED.metric_values,
    updated_at = NOW();
END;
$$;

-- =====================================================
-- 3. AUDIT LOGGING SYSTEM
-- =====================================================

-- Create audit log table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text,
  auth_id text,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  auth_id = (SELECT auth.uid())::text
  OR EXISTS (
    SELECT 1 FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = (SELECT auth.uid())::text
    AND ucr.role = 'clinic_admin'
    AND ucr.is_active = true
  )
);

-- Generic audit logging function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_user_id text;
  audit_auth_id text;
BEGIN
  -- Try to get user context
  BEGIN
    audit_auth_id := (SELECT auth.uid())::text;
    SELECT id INTO audit_user_id FROM users WHERE auth_id = audit_auth_id;
  EXCEPTION WHEN OTHERS THEN
    -- If no user context, these will be null
    audit_user_id := NULL;
    audit_auth_id := NULL;
  END;
  
  -- Insert audit record
  INSERT INTO audit_logs (
    user_id,
    auth_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    audit_user_id,
    audit_auth_id,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE 
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
      ELSE NULL
    END,
    NOW()
  );
  
  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Apply audit logging to sensitive tables
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_clinics ON clinics;
CREATE TRIGGER audit_clinics
  AFTER INSERT OR UPDATE OR DELETE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_data_sources ON data_sources;
CREATE TRIGGER audit_data_sources
  AFTER INSERT OR UPDATE OR DELETE ON data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's clinics with roles
CREATE OR REPLACE FUNCTION public.get_user_clinics_with_roles(p_user_id text)
RETURNS TABLE (
  clinic_id text,
  clinic_name text,
  role text,
  is_active boolean
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    ucr.role,
    ucr.is_active
  FROM user_clinic_roles ucr
  JOIN clinics c ON c.id = ucr.clinic_id
  WHERE ucr.user_id = p_user_id
  ORDER BY c.name;
$$;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION public.can_user_perform_action(
  p_user_id text,
  p_clinic_id text,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user's role in the clinic
  SELECT role INTO user_role
  FROM user_clinic_roles
  WHERE user_id = p_user_id
    AND clinic_id = p_clinic_id
    AND is_active = true
  LIMIT 1;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Define permissions based on role
  CASE p_action
    WHEN 'view_metrics' THEN
      RETURN user_role IN ('clinic_admin', 'provider', 'staff', 'read_only');
    WHEN 'edit_metrics' THEN
      RETURN user_role IN ('clinic_admin', 'provider', 'staff');
    WHEN 'manage_users' THEN
      RETURN user_role = 'clinic_admin';
    WHEN 'manage_clinic' THEN
      RETURN user_role = 'clinic_admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- =====================================================
-- 5. SCHEDULED FUNCTION PLACEHOLDERS
-- =====================================================

-- These are called by the scheduled jobs if enabled

CREATE OR REPLACE FUNCTION public.scheduled_daily_aggregation()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Run daily metric aggregation
  PERFORM public.aggregate_daily_metrics();
  
  -- Log completion
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_JOB', 'system', jsonb_build_object(
    'job', 'daily_aggregation',
    'status', 'completed',
    'timestamp', NOW()
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.scheduled_weekly_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for weekly report generation
  -- Add your report generation logic here
  
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_JOB', 'system', jsonb_build_object(
    'job', 'weekly_reports',
    'status', 'completed',
    'timestamp', NOW()
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.scheduled_monthly_cleanup()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up old audit logs (keep 90 days)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old metric values (keep 1 year)
  DELETE FROM metric_values
  WHERE date < NOW() - INTERVAL '1 year';
  
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_JOB', 'system', jsonb_build_object(
    'job', 'monthly_cleanup',
    'status', 'completed',
    'timestamp', NOW()
  ));
END;
$$;

-- =====================================================
-- 6. MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  view_name text;
BEGIN
  -- Refresh any materialized views
  FOR view_name IN 
    SELECT matviewname 
    FROM pg_matviews 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_name);
  END LOOP;
END;
$$;

-- Function to analyze tables for performance
CREATE OR REPLACE FUNCTION public.analyze_all_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  table_name text;
BEGIN
  -- Analyze all user tables
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ANALYZE %I', table_name);
  END LOOP;
END;
$$;

-- Function to reindex tables safely
CREATE OR REPLACE FUNCTION public.reindex_tables_concurrently()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  idx RECORD;
BEGIN
  -- Reindex all non-system indexes
  FOR idx IN 
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname NOT LIKE 'pg_%'
  LOOP
    BEGIN
      EXECUTE format('REINDEX INDEX CONCURRENTLY %I', idx.indexname);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not reindex %: %', idx.indexname, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_clinics_with_roles(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_perform_action(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views() TO authenticated;

-- Audit logs permissions are handled by RLS

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Syncs new auth users to public.users table';
COMMENT ON FUNCTION public.handle_user_update() IS 'Syncs auth user updates to public.users table';
COMMENT ON FUNCTION public.validate_clinic_membership() IS 'Validates user has access to clinic before data modifications';
COMMENT ON FUNCTION public.aggregate_daily_metrics() IS 'Aggregates daily metrics into summary tables';
COMMENT ON FUNCTION public.audit_trigger_function() IS 'Generic audit logging function for table changes';
COMMENT ON FUNCTION public.get_user_clinics_with_roles(text) IS 'Returns all clinics and roles for a user';
COMMENT ON FUNCTION public.can_user_perform_action(text, text, text) IS 'Checks if user can perform specific action in clinic';

-- Log completion
INSERT INTO audit_logs (action, table_name, new_data)
VALUES ('MIGRATION_COMPLETED', 'system', jsonb_build_object(
  'migration', '05_triggers_and_functions',
  'timestamp', NOW()
));