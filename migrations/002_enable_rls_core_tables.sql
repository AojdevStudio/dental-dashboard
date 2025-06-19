-- Migration: 002_enable_rls_core_tables.sql
-- Description: Enable Row-Level Security on Core Multi-tenant Tables
-- Created: 2025-06-18
-- Dependencies: 001_rls_context_functions.sql

BEGIN;

-- Function to safely enable RLS on a table if it exists
CREATE OR REPLACE FUNCTION enable_rls_if_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = enable_rls_if_exists.table_name
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Enable RLS on the table
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    RAISE NOTICE 'Enabled RLS on table: %', table_name;
    RETURN true;
  ELSE
    RAISE WARNING 'Table % does not exist, skipping RLS enablement', table_name;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on core multi-tenant tables
-- Order matters for dependencies

-- Core tables for provider management
SELECT enable_rls_if_exists('providers');

-- Production tracking tables
SELECT enable_rls_if_exists('dentist_production');
SELECT enable_rls_if_exists('hygiene_production');

-- Financial data tables
SELECT enable_rls_if_exists('location_financials');

-- Metrics and analytics tables
SELECT enable_rls_if_exists('metric_values');

-- Additional core tables that require tenant isolation
SELECT enable_rls_if_exists('users');
SELECT enable_rls_if_exists('clinics');
SELECT enable_rls_if_exists('user_clinic_roles');
SELECT enable_rls_if_exists('locations');
SELECT enable_rls_if_exists('dashboard_configs');
SELECT enable_rls_if_exists('dashboard_widgets');

-- Clean up helper function
DROP FUNCTION enable_rls_if_exists(TEXT);

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('002_enable_rls_core_tables', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();

COMMIT;