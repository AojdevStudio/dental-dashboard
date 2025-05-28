-- =============================================
-- Rollback Script for Phase 3: Row Level Security
-- =============================================
-- This script removes all RLS policies and helper functions
-- Use with caution - this will disable all access controls

-- Drop all policies on each table
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop policies on all tables
    FOR r IN (
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE column_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE metric_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE widgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_clinic_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE metric_aggregations DISABLE ROW LEVEL SECURITY;
ALTER TABLE google_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE column_mappings_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE id_mappings DISABLE ROW LEVEL SECURITY;

-- Drop helper functions
DROP FUNCTION IF EXISTS auth.get_user_clinics();
DROP FUNCTION IF EXISTS auth.has_clinic_access(text);
DROP FUNCTION IF EXISTS auth.is_clinic_admin(text);
DROP FUNCTION IF EXISTS auth.get_user_role(text);

-- Drop performance indexes created for RLS
DROP INDEX IF EXISTS idx_user_clinic_roles_user_auth;
DROP INDEX IF EXISTS idx_user_clinic_roles_clinic_active;
DROP INDEX IF EXISTS idx_users_auth_id;
DROP INDEX IF EXISTS idx_data_sources_clinic;
DROP INDEX IF EXISTS idx_providers_clinic;
DROP INDEX IF EXISTS idx_metric_values_clinic;
DROP INDEX IF EXISTS idx_goals_clinic;
DROP INDEX IF EXISTS idx_financial_metrics_clinic_date;
DROP INDEX IF EXISTS idx_appointment_metrics_clinic_date;
DROP INDEX IF EXISTS idx_call_metrics_clinic_date;
DROP INDEX IF EXISTS idx_patient_metrics_clinic_date;
DROP INDEX IF EXISTS idx_metric_aggregations_clinic_period;

-- Revoke permissions (optional - depends on your security model)
-- REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
-- REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
-- REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
-- REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA auth FROM authenticated;

-- Update schema comment
COMMENT ON SCHEMA public IS 'Phase 3 rollback: Row Level Security removed';