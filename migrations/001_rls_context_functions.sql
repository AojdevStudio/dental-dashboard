-- Migration: 001_rls_context_functions.sql
-- Description: Create PostgreSQL RLS Context Management Functions
-- Created: 2025-06-18

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Function to set clinic context for the current session
CREATE OR REPLACE FUNCTION auth.set_clinic_context(clinic_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Validate that clinic_id is not null
  IF clinic_id IS NULL THEN
    RAISE EXCEPTION 'Clinic ID cannot be null';
  END IF;
  
  -- Set the clinic context in session-scoped variable
  PERFORM set_config('app.current_clinic_id', clinic_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current clinic context from session
CREATE OR REPLACE FUNCTION auth.get_current_clinic_id()
RETURNS UUID AS $$
DECLARE
  clinic_id_text TEXT;
  clinic_id UUID;
BEGIN
  -- Get the clinic context from session variable
  -- Use true parameter for graceful fallback when not set
  clinic_id_text := current_setting('app.current_clinic_id', true);
  
  -- Handle case where no context is set
  IF clinic_id_text IS NULL OR clinic_id_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Convert text to UUID with error handling
  BEGIN
    clinic_id := clinic_id_text::UUID;
    RETURN clinic_id;
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- Handle invalid UUID format gracefully
      RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION auth.set_clinic_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_current_clinic_id() TO authenticated;

-- Grant execute permissions to service role for administrative operations
GRANT EXECUTE ON FUNCTION auth.set_clinic_context(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION auth.get_current_clinic_id() TO service_role;

-- Add comments for documentation
COMMENT ON FUNCTION auth.set_clinic_context(UUID) IS 'Set clinic context for the current session to enable RLS filtering';
COMMENT ON FUNCTION auth.get_current_clinic_id() IS 'Get the current clinic context for RLS policy evaluation';

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('001_rls_context_functions', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();