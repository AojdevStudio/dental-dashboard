/**
 * Phase 7: Database Triggers & Functions
 * 
 * This migration creates Supabase functions for:
 * - Automatic user profile creation
 * - Data consistency
 * - Audit logging
 * - Helper functions
 * - Scheduled functions
 */

-- =====================================================
-- 1. USER MANAGEMENT TRIGGERS
-- =====================================================

-- Function to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_clinic_id text;
BEGIN
  -- Get the default clinic (first clinic in the system for now)
  SELECT id INTO default_clinic_id FROM clinics LIMIT 1;
  
  -- Create user profile
  INSERT INTO users (
    auth_id,
    email,
    name,
    role,
    clinic_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'clinic_id', default_clinic_id),
    NEW.created_at,
    NEW.created_at
  );
  
  -- Create initial clinic role
  INSERT INTO user_clinic_roles (
    user_id,
    clinic_id,
    role,
    is_active
  ) VALUES (
    (SELECT id FROM users WHERE auth_id = NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'clinic_id', default_clinic_id),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    true
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Function to sync auth user updates to profile
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user profile
  UPDATE users
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
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_updated();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Soft delete by updating status
  UPDATE users
  SET
    status = 'inactive',
    updated_at = NOW()
  WHERE id = OLD.id;
  
  -- Deactivate all clinic roles
  UPDATE user_clinic_roles
  SET
    is_active = false,
    updated_at = NOW()
  WHERE user_id = OLD.id;
  
  -- Cancel active goals
  UPDATE goals
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE 
    (clinic_id IN (SELECT clinic_id FROM user_clinic_roles WHERE user_id = OLD.id))
    AND status = 'active';
  
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
BEGIN
  -- Check if user has access to the clinic
  IF NOT EXISTS (
    SELECT 1 
    FROM user_clinic_roles ucr
    WHERE ucr.user_id = NEW.user_id 
      AND ucr.clinic_id = NEW.clinic_id
      AND ucr.is_active = true
  ) THEN
    RAISE EXCEPTION 'User does not have access to this clinic';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS validate_clinic_access_goals ON goals;
CREATE TRIGGER validate_clinic_access_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION public.validate_clinic_membership();

-- Function to calculate goal progress
CREATE OR REPLACE FUNCTION public.calculate_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  goal_record RECORD;
  progress_pct DECIMAL(5,2);
BEGIN
  -- Get the goal details
  SELECT * INTO goal_record
  FROM goals
  WHERE id = NEW.goal_id;
  
  -- Calculate progress percentage
  IF goal_record.target_value > 0 THEN
    progress_pct := (NEW.current_value / goal_record.target_value) * 100;
  ELSE
    progress_pct := 0;
  END IF;
  
  -- Update goal with latest progress
  UPDATE goals
  SET
    current_value = NEW.current_value,
    updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  -- Check if goal is completed
  IF progress_pct >= 100 AND goal_record.status = 'active' THEN
    UPDATE goals
    SET
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.goal_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for goal progress updates
DROP TRIGGER IF EXISTS on_goal_progress_insert ON goal_progress;
CREATE TRIGGER on_goal_progress_insert
  AFTER INSERT ON goal_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_goal_progress();

-- Function to aggregate metrics
CREATE OR REPLACE FUNCTION public.aggregate_daily_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Aggregate production metrics by day
  INSERT INTO metric_aggregates (
    clinic_id,
    provider_id,
    metric_type,
    aggregation_type,
    date,
    value,
    created_at
  )
  SELECT
    mv.clinic_id,
    mv.provider_id,
    md.name,
    'daily_sum',
    mv.date::date,
    SUM(mv.value),
    NOW()
  FROM metric_values mv
  JOIN metric_definitions md ON md.id = mv.metric_definition_id
  WHERE mv.date::date = CURRENT_DATE - INTERVAL '1 day'
    AND md.aggregation_method = 'sum'
  GROUP BY mv.clinic_id, mv.provider_id, md.name, mv.date::date
  ON CONFLICT (clinic_id, provider_id, metric_type, aggregation_type, date) 
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
  
  -- Aggregate average metrics
  INSERT INTO metric_aggregates (
    clinic_id,
    provider_id,
    metric_type,
    aggregation_type,
    date,
    value,
    created_at
  )
  SELECT
    mv.clinic_id,
    mv.provider_id,
    md.name,
    'daily_avg',
    mv.date::date,
    AVG(mv.value),
    NOW()
  FROM metric_values mv
  JOIN metric_definitions md ON md.id = mv.metric_definition_id
  WHERE mv.date::date = CURRENT_DATE - INTERVAL '1 day'
    AND md.aggregation_method = 'average'
  GROUP BY mv.clinic_id, mv.provider_id, md.name, mv.date::date
  ON CONFLICT (clinic_id, provider_id, metric_type, aggregation_type, date) 
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
END;
$$;

-- =====================================================
-- 3. AUDIT LOGGING SYSTEM
-- =====================================================

-- Create audit log table
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

-- Create index for querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

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
  -- Get user context from app settings
  audit_user_id := current_setting('app.current_user_id', true);
  audit_auth_id := current_setting('app.current_auth_id', true);
  
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
CREATE OR REPLACE FUNCTION public.get_user_clinics(p_auth_id text)
RETURNS TABLE (
  clinic_id text,
  clinic_name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    ucr.role,
    ucr.is_active
  FROM users u
  JOIN user_clinic_roles ucr ON ucr.user_id = u.id
  JOIN clinics c ON c.id = ucr.clinic_id
  WHERE u.auth_id = p_auth_id
    AND ucr.is_active = true
    AND c.status = 'active';
END;
$$;

-- Function to check clinic access
CREATE OR REPLACE FUNCTION public.check_clinic_access(
  p_auth_id text,
  p_clinic_id text,
  p_required_role text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_has_access boolean;
  v_user_role text;
BEGIN
  -- Check basic access
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN user_clinic_roles ucr ON ucr.user_id = u.id
    WHERE u.auth_id = p_auth_id
      AND ucr.clinic_id = p_clinic_id
      AND ucr.is_active = true
  ) INTO v_has_access;
  
  -- If no access, return false
  IF NOT v_has_access THEN
    RETURN false;
  END IF;
  
  -- If no specific role required, return true
  IF p_required_role IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check role hierarchy
  SELECT ucr.role INTO v_user_role
  FROM users u
  JOIN user_clinic_roles ucr ON ucr.user_id = u.id
  WHERE u.auth_id = p_auth_id
    AND ucr.clinic_id = p_clinic_id
    AND ucr.is_active = true;
  
  -- Role hierarchy: admin > clinic_admin > provider > staff > viewer
  RETURN CASE
    WHEN v_user_role = 'admin' THEN true
    WHEN v_user_role = 'clinic_admin' AND p_required_role IN ('clinic_admin', 'provider', 'staff', 'viewer') THEN true
    WHEN v_user_role = 'provider' AND p_required_role IN ('provider', 'staff', 'viewer') THEN true
    WHEN v_user_role = 'staff' AND p_required_role IN ('staff', 'viewer') THEN true
    WHEN v_user_role = 'viewer' AND p_required_role = 'viewer' THEN true
    ELSE false
  END;
END;
$$;

-- Function to calculate metrics for a period
CREATE OR REPLACE FUNCTION public.calculate_clinic_metrics(
  p_clinic_id text,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  metric_name text,
  total_value numeric,
  average_value numeric,
  min_value numeric,
  max_value numeric,
  data_points integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    md.name,
    SUM(mv.value)::numeric,
    AVG(mv.value)::numeric,
    MIN(mv.value)::numeric,
    MAX(mv.value)::numeric,
    COUNT(*)::integer
  FROM metric_values mv
  JOIN metric_definitions md ON md.id = mv.metric_definition_id
  WHERE mv.clinic_id = p_clinic_id
    AND mv.date >= p_start_date
    AND mv.date <= p_end_date
  GROUP BY md.name;
END;
$$;

-- Function to format data for export
CREATE OR REPLACE FUNCTION public.format_export_data(
  p_table_name text,
  p_clinic_id text,
  p_format text DEFAULT 'json'
)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result text;
BEGIN
  -- This is a simplified version - real implementation would be more complex
  CASE p_format
    WHEN 'json' THEN
      EXECUTE format(
        'SELECT json_agg(row_to_json(t)) FROM %I t WHERE clinic_id = %L',
        p_table_name,
        p_clinic_id
      ) INTO v_result;
    WHEN 'csv' THEN
      -- CSV export would require more complex logic
      v_result := 'CSV export not implemented';
    ELSE
      RAISE EXCEPTION 'Unsupported format: %', p_format;
  END CASE;
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- 5. SCHEDULED FUNCTIONS (CRON JOBS)
-- =====================================================

-- These functions are designed to be called by pg_cron or Supabase scheduled functions

-- Daily metric aggregation
CREATE OR REPLACE FUNCTION public.scheduled_daily_aggregation()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Run metric aggregation
  PERFORM public.aggregate_daily_metrics();
  
  -- Clean up old goal progress records (keep last 90 days)
  DELETE FROM goal_progress
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
  
  -- Update clinic statistics
  UPDATE clinics
  SET
    updated_at = NOW()
  WHERE status = 'active';
  
  -- Log execution
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_DAILY_AGGREGATION', 'system', jsonb_build_object('executed_at', NOW()));
END;
$$;

-- Weekly report generation
CREATE OR REPLACE FUNCTION public.scheduled_weekly_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate weekly summary for each active clinic
  INSERT INTO generated_reports (
    clinic_id,
    report_type,
    period_start,
    period_end,
    data,
    created_at
  )
  SELECT
    c.id,
    'weekly_summary',
    date_trunc('week', CURRENT_DATE - INTERVAL '1 week'),
    date_trunc('week', CURRENT_DATE) - INTERVAL '1 day',
    jsonb_build_object(
      'total_production', COALESCE(SUM(mv.value), 0),
      'provider_count', COUNT(DISTINCT mv.provider_id),
      'active_goals', COUNT(DISTINCT g.id)
    ),
    NOW()
  FROM clinics c
  LEFT JOIN metric_values mv ON mv.clinic_id = c.id
    AND mv.date >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week')
    AND mv.date < date_trunc('week', CURRENT_DATE)
  LEFT JOIN goals g ON g.clinic_id = c.id
    AND g.status = 'active'
  WHERE c.status = 'active'
  GROUP BY c.id;
  
  -- Log execution
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_WEEKLY_REPORTS', 'system', jsonb_build_object('executed_at', NOW()));
END;
$$;

-- Monthly cleanup
CREATE OR REPLACE FUNCTION public.scheduled_monthly_cleanup()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive old audit logs (keep last 12 months)
  DELETE FROM audit_logs
  WHERE created_at < CURRENT_DATE - INTERVAL '12 months';
  
  -- Clean up orphaned records
  DELETE FROM user_clinic_roles
  WHERE user_id NOT IN (SELECT id FROM users);
  
  -- Remove expired data source tokens
  UPDATE data_sources
  SET
    access_token = NULL,
    refresh_token = NULL,
    connection_status = 'disconnected'
  WHERE expiry_date < NOW() - INTERVAL '30 days';
  
  -- Log execution
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('SCHEDULED_MONTHLY_CLEANUP', 'system', jsonb_build_object('executed_at', NOW()));
END;
$$;

-- =====================================================
-- 6. DATA VALIDATION TRIGGERS
-- =====================================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION public.validate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply email validation
DROP TRIGGER IF EXISTS validate_user_email ON users;
CREATE TRIGGER validate_user_email
  BEFORE INSERT OR UPDATE OF email ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email();

-- Function to enforce business rules
CREATE OR REPLACE FUNCTION public.enforce_business_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Example: Prevent goal target date in the past
  IF TG_TABLE_NAME = 'goals' AND NEW.target_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Goal target date cannot be in the past';
  END IF;
  
  -- Example: Ensure metric values are positive
  IF TG_TABLE_NAME = 'metric_values' AND NEW.value < 0 THEN
    RAISE EXCEPTION 'Metric values must be positive';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply business rules
DROP TRIGGER IF EXISTS enforce_goal_rules ON goals;
CREATE TRIGGER enforce_goal_rules
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_rules();

DROP TRIGGER IF EXISTS enforce_metric_rules ON metric_values;
CREATE TRIGGER enforce_metric_rules
  BEFORE INSERT OR UPDATE ON metric_values
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_rules();

-- =====================================================
-- 7. PERFORMANCE OPTIMIZATION
-- =====================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh clinic statistics view (if exists)
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_clinic_statistics;
  
  -- Update table statistics
  ANALYZE users;
  ANALYZE clinics;
  ANALYZE metric_values;
  ANALYZE goals;
END;
$$;

-- Function to maintain indexes
CREATE OR REPLACE FUNCTION public.maintain_indexes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reindex tables that get heavy updates
  REINDEX TABLE CONCURRENTLY metric_values;
  REINDEX TABLE CONCURRENTLY goal_progress;
  REINDEX TABLE CONCURRENTLY audit_logs;
END;
$$;

-- =====================================================
-- 8. ERROR HANDLING AND RECOVERY
-- =====================================================

-- Function to log trigger errors
CREATE OR REPLACE FUNCTION public.log_trigger_error()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  error_info record;
BEGIN
  -- Get error details
  FOR error_info IN
    SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    INSERT INTO audit_logs (
      action,
      table_name,
      new_data,
      created_at
    ) VALUES (
      'TRIGGER_ERROR',
      error_info.object_identity,
      jsonb_build_object(
        'error', error_info.command_tag,
        'timestamp', NOW()
      ),
      NOW()
    );
  END LOOP;
END;
$$;

-- Create event trigger for DDL errors (requires superuser)
-- CREATE EVENT TRIGGER log_ddl_errors ON ddl_command_end
-- EXECUTE FUNCTION public.log_trigger_error();

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_clinics(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_clinic_access(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_clinic_metrics(text, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.format_export_data(text, text, text) TO authenticated;

-- Grant permissions on audit_logs table
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- =====================================================
-- 10. COMMENTS
-- =====================================================

-- Add helpful comments
COMMENT ON FUNCTION public.get_user_clinics(text) IS 'Returns all clinics a user has access to with their roles';
COMMENT ON FUNCTION public.check_clinic_access(text, text, text) IS 'Checks if a user has access to a clinic with optional role requirement';
COMMENT ON FUNCTION public.calculate_clinic_metrics(text, date, date) IS 'Calculates aggregated metrics for a clinic over a date range';
COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Automatically creates user profile when auth user is created';
COMMENT ON FUNCTION public.audit_trigger_function() IS 'Generic audit logging function for tracking data changes';
COMMENT ON TABLE audit_logs IS 'Audit trail of all data modifications for compliance and debugging';

-- Migration complete
INSERT INTO audit_logs (action, table_name, new_data)
VALUES ('MIGRATION_COMPLETE', 'system', jsonb_build_object(
  'migration', '04_triggers_and_functions',
  'timestamp', NOW()
));