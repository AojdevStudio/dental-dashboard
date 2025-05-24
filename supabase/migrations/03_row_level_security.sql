-- =============================================
-- Phase 3: Row Level Security (RLS) Implementation
-- =============================================
-- This migration implements comprehensive RLS policies for multi-tenant data isolation
-- Following Supabase best practices and performance recommendations

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clinic_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_mappings_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_mappings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper Functions for RLS
-- =============================================

-- Get user's clinic access list
CREATE OR REPLACE FUNCTION auth.get_user_clinics()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT ucr.clinic_id::uuid
  FROM user_clinic_roles ucr
  INNER JOIN users u ON u.id = ucr.user_id
  WHERE u.auth_id = auth.uid()::text
    AND ucr.is_active = true
$$;

-- Check if user has access to a specific clinic
CREATE OR REPLACE FUNCTION auth.has_clinic_access(clinic_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = auth.uid()::text
      AND ucr.clinic_id = $1
      AND ucr.is_active = true
  )
$$;

-- Check if user is a clinic admin
CREATE OR REPLACE FUNCTION auth.is_clinic_admin(clinic_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = auth.uid()::text
      AND ucr.clinic_id = $1
      AND ucr.role = 'clinic_admin'
      AND ucr.is_active = true
  )
$$;

-- Get user's role in a clinic
CREATE OR REPLACE FUNCTION auth.get_user_role(clinic_id text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ucr.role
  FROM user_clinic_roles ucr
  INNER JOIN users u ON u.id = ucr.user_id
  WHERE u.auth_id = auth.uid()::text
    AND ucr.clinic_id = $1
    AND ucr.is_active = true
  LIMIT 1
$$;

-- =============================================
-- CLINICS Table Policies
-- =============================================

-- SELECT: Users can only see clinics they have access to
CREATE POLICY "Users can view their assigned clinics"
ON clinics FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT clinic_id::text
    FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = (SELECT auth.uid())::text
      AND ucr.is_active = true
  )
);

-- INSERT: Only super admins can create new clinics (handled at application level)
CREATE POLICY "Super admins can create clinics"
ON clinics FOR INSERT
TO authenticated
WITH CHECK (false); -- Disabled by default, enable for super admin role

-- UPDATE: Only clinic admins can update their clinic
CREATE POLICY "Clinic admins can update their clinic"
ON clinics FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(id))
);

-- DELETE: Only super admins can delete clinics (disabled by default)
CREATE POLICY "Super admins can delete clinics"
ON clinics FOR DELETE
TO authenticated
USING (false); -- Disabled by default

-- =============================================
-- USERS Table Policies
-- =============================================

-- SELECT: Users can see other users in their clinics
CREATE POLICY "Users can view users in their clinics"
ON users FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT clinic_id::text
    FROM user_clinic_roles ucr
    INNER JOIN users u ON u.id = ucr.user_id
    WHERE u.auth_id = (SELECT auth.uid())::text
      AND ucr.is_active = true
  )
);

-- INSERT: Clinic admins can create users in their clinic
CREATE POLICY "Clinic admins can create users"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Users can update their own profile, clinic admins can update users in their clinic
CREATE POLICY "Users can update profiles based on permissions"
ON users FOR UPDATE
TO authenticated
USING (
  auth_id = (SELECT auth.uid())::text
  OR (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  auth_id = (SELECT auth.uid())::text
  OR (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Only clinic admins can delete users in their clinic
CREATE POLICY "Clinic admins can delete users"
ON users FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- PROVIDERS Table Policies
-- =============================================

-- SELECT: Users can see providers in their clinics
CREATE POLICY "Users can view providers in their clinics"
ON providers FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins can create providers
CREATE POLICY "Clinic admins can create providers"
ON providers FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update providers
CREATE POLICY "Clinic admins can update providers"
ON providers FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete providers
CREATE POLICY "Clinic admins can delete providers"
ON providers FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- METRIC_DEFINITIONS Table Policies
-- =============================================

-- SELECT: All authenticated users can view metric definitions (they're shared)
CREATE POLICY "All users can view metric definitions"
ON metric_definitions FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only super admins can create metric definitions
CREATE POLICY "Super admins can create metric definitions"
ON metric_definitions FOR INSERT
TO authenticated
WITH CHECK (false); -- Managed at application level

-- UPDATE: Only super admins can update metric definitions
CREATE POLICY "Super admins can update metric definitions"
ON metric_definitions FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- DELETE: Only super admins can delete metric definitions
CREATE POLICY "Super admins can delete metric definitions"
ON metric_definitions FOR DELETE
TO authenticated
USING (false);

-- =============================================
-- DATA_SOURCES Table Policies
-- =============================================

-- SELECT: Users can see data sources for their clinics
CREATE POLICY "Users can view data sources in their clinics"
ON data_sources FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins can create data sources
CREATE POLICY "Clinic admins can create data sources"
ON data_sources FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update data sources
CREATE POLICY "Clinic admins can update data sources"
ON data_sources FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete data sources
CREATE POLICY "Clinic admins can delete data sources"
ON data_sources FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- COLUMN_MAPPINGS Table Policies
-- =============================================

-- SELECT: Users can see column mappings for data sources in their clinics
CREATE POLICY "Users can view column mappings for their clinic data sources"
ON column_mappings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM data_sources ds
    WHERE ds.id = column_mappings.data_source_id
      AND (SELECT auth.has_clinic_access(ds.clinic_id))
  )
);

-- INSERT: Clinic admins can create column mappings for their data sources
CREATE POLICY "Clinic admins can create column mappings"
ON column_mappings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM data_sources ds
    WHERE ds.id = column_mappings.data_source_id
      AND (SELECT auth.is_clinic_admin(ds.clinic_id))
  )
);

-- UPDATE: Clinic admins can update column mappings for their data sources
CREATE POLICY "Clinic admins can update column mappings"
ON column_mappings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM data_sources ds
    WHERE ds.id = column_mappings.data_source_id
      AND (SELECT auth.is_clinic_admin(ds.clinic_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM data_sources ds
    WHERE ds.id = column_mappings.data_source_id
      AND (SELECT auth.is_clinic_admin(ds.clinic_id))
  )
);

-- DELETE: Clinic admins can delete column mappings for their data sources
CREATE POLICY "Clinic admins can delete column mappings"
ON column_mappings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM data_sources ds
    WHERE ds.id = column_mappings.data_source_id
      AND (SELECT auth.is_clinic_admin(ds.clinic_id))
  )
);

-- =============================================
-- METRIC_VALUES Table Policies
-- =============================================

-- SELECT: Users can see metric values for their clinics
CREATE POLICY "Users can view metric values for their clinics"
ON metric_values FOR SELECT
TO authenticated
USING (
  clinic_id IS NULL -- System metrics
  OR (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Users with appropriate role can create metric values
CREATE POLICY "Authorized users can create metric values"
ON metric_values FOR INSERT
TO authenticated
WITH CHECK (
  clinic_id IS NULL -- System metrics (restricted at app level)
  OR (
    (SELECT auth.has_clinic_access(clinic_id))
    AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
  )
);

-- UPDATE: Clinic admins and staff can update metric values
CREATE POLICY "Authorized users can update metric values"
ON metric_values FOR UPDATE
TO authenticated
USING (
  clinic_id IS NOT NULL
  AND (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
)
WITH CHECK (
  clinic_id IS NOT NULL
  AND (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
);

-- DELETE: Only clinic admins can delete metric values
CREATE POLICY "Clinic admins can delete metric values"
ON metric_values FOR DELETE
TO authenticated
USING (
  clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- GOALS Table Policies
-- =============================================

-- SELECT: Users can see goals for their clinics
CREATE POLICY "Users can view goals for their clinics"
ON goals FOR SELECT
TO authenticated
USING (
  clinic_id IS NULL -- System goals
  OR (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins and providers can create goals
CREATE POLICY "Authorized users can create goals"
ON goals FOR INSERT
TO authenticated
WITH CHECK (
  clinic_id IS NOT NULL
  AND (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider')
);

-- UPDATE: Clinic admins and goal owners can update goals
CREATE POLICY "Authorized users can update goals"
ON goals FOR UPDATE
TO authenticated
USING (
  clinic_id IS NOT NULL
  AND (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider')
)
WITH CHECK (
  clinic_id IS NOT NULL
  AND (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider')
);

-- DELETE: Clinic admins can delete goals
CREATE POLICY "Clinic admins can delete goals"
ON goals FOR DELETE
TO authenticated
USING (
  clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- DASHBOARDS Table Policies
-- =============================================

-- SELECT: Users can see their own dashboards and shared dashboards in their clinics
CREATE POLICY "Users can view their dashboards and shared clinic dashboards"
ON dashboards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND (
        u.auth_id = (SELECT auth.uid())::text -- Own dashboards
        OR (SELECT auth.has_clinic_access(u.clinic_id)) -- Clinic dashboards
      )
  )
);

-- INSERT: Users can create their own dashboards
CREATE POLICY "Users can create their own dashboards"
ON dashboards FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- UPDATE: Users can update their own dashboards
CREATE POLICY "Users can update their own dashboards"
ON dashboards FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- DELETE: Users can delete their own dashboards
CREATE POLICY "Users can delete their own dashboards"
ON dashboards FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = dashboards.user_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- =============================================
-- WIDGETS Table Policies
-- =============================================

-- SELECT: Users can see widgets on dashboards they have access to
CREATE POLICY "Users can view widgets on accessible dashboards"
ON widgets FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND (
        u.auth_id = (SELECT auth.uid())::text
        OR (SELECT auth.has_clinic_access(u.clinic_id))
      )
  )
);

-- INSERT: Users can create widgets on their own dashboards
CREATE POLICY "Users can create widgets on their dashboards"
ON widgets FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- UPDATE: Users can update widgets on their own dashboards
CREATE POLICY "Users can update widgets on their dashboards"
ON widgets FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- DELETE: Users can delete widgets on their own dashboards
CREATE POLICY "Users can delete widgets on their dashboards"
ON widgets FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM dashboards d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = widgets.dashboard_id
      AND u.auth_id = (SELECT auth.uid())::text
  )
);

-- =============================================
-- USER_CLINIC_ROLES Table Policies
-- =============================================

-- SELECT: Users can see roles for clinics they have access to
CREATE POLICY "Users can view roles in their clinics"
ON user_clinic_roles FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins can create roles
CREATE POLICY "Clinic admins can create roles"
ON user_clinic_roles FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update roles
CREATE POLICY "Clinic admins can update roles"
ON user_clinic_roles FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete roles
CREATE POLICY "Clinic admins can delete roles"
ON user_clinic_roles FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- GOAL_TEMPLATES Table Policies
-- =============================================

-- SELECT: Users can see system templates and clinic-specific templates
CREATE POLICY "Users can view system and clinic goal templates"
ON goal_templates FOR SELECT
TO authenticated
USING (
  is_system_template = true
  OR clinic_id IS NULL
  OR (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins can create clinic-specific templates
CREATE POLICY "Clinic admins can create goal templates"
ON goal_templates FOR INSERT
TO authenticated
WITH CHECK (
  is_system_template = false
  AND clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update their clinic templates
CREATE POLICY "Clinic admins can update their goal templates"
ON goal_templates FOR UPDATE
TO authenticated
USING (
  is_system_template = false
  AND clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  is_system_template = false
  AND clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete their clinic templates
CREATE POLICY "Clinic admins can delete their goal templates"
ON goal_templates FOR DELETE
TO authenticated
USING (
  is_system_template = false
  AND clinic_id IS NOT NULL
  AND (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- FINANCIAL_METRICS Table Policies
-- =============================================

-- SELECT: Users can see financial metrics for their clinics
CREATE POLICY "Users can view financial metrics for their clinics"
ON financial_metrics FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Authorized users can create financial metrics
CREATE POLICY "Authorized users can create financial metrics"
ON financial_metrics FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
);

-- UPDATE: Clinic admins and staff can update financial metrics
CREATE POLICY "Authorized users can update financial metrics"
ON financial_metrics FOR UPDATE
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
)
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
);

-- DELETE: Only clinic admins can delete financial metrics
CREATE POLICY "Clinic admins can delete financial metrics"
ON financial_metrics FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- APPOINTMENT_METRICS Table Policies
-- =============================================

-- SELECT: Users can see appointment metrics for their clinics
CREATE POLICY "Users can view appointment metrics for their clinics"
ON appointment_metrics FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Authorized users can create appointment metrics
CREATE POLICY "Authorized users can create appointment metrics"
ON appointment_metrics FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
);

-- UPDATE: Clinic admins and staff can update appointment metrics
CREATE POLICY "Authorized users can update appointment metrics"
ON appointment_metrics FOR UPDATE
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
)
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
);

-- DELETE: Only clinic admins can delete appointment metrics
CREATE POLICY "Clinic admins can delete appointment metrics"
ON appointment_metrics FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- CALL_METRICS Table Policies
-- =============================================

-- SELECT: Users can see call metrics for their clinics
CREATE POLICY "Users can view call metrics for their clinics"
ON call_metrics FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Authorized users can create call metrics
CREATE POLICY "Authorized users can create call metrics"
ON call_metrics FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
);

-- UPDATE: Clinic admins and staff can update call metrics
CREATE POLICY "Authorized users can update call metrics"
ON call_metrics FOR UPDATE
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
)
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
);

-- DELETE: Only clinic admins can delete call metrics
CREATE POLICY "Clinic admins can delete call metrics"
ON call_metrics FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- PATIENT_METRICS Table Policies
-- =============================================

-- SELECT: Users can see patient metrics for their clinics
CREATE POLICY "Users can view patient metrics for their clinics"
ON patient_metrics FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Authorized users can create patient metrics
CREATE POLICY "Authorized users can create patient metrics"
ON patient_metrics FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'provider', 'staff')
);

-- UPDATE: Clinic admins and staff can update patient metrics
CREATE POLICY "Authorized users can update patient metrics"
ON patient_metrics FOR UPDATE
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
)
WITH CHECK (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin', 'staff')
);

-- DELETE: Only clinic admins can delete patient metrics
CREATE POLICY "Clinic admins can delete patient metrics"
ON patient_metrics FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- METRIC_AGGREGATIONS Table Policies
-- =============================================

-- SELECT: Users can see metric aggregations for their clinics
CREATE POLICY "Users can view metric aggregations for their clinics"
ON metric_aggregations FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: System process creates aggregations (service role)
CREATE POLICY "System can create metric aggregations"
ON metric_aggregations FOR INSERT
TO authenticated
WITH CHECK (false); -- Only service role

-- UPDATE: System process updates aggregations (service role)
CREATE POLICY "System can update metric aggregations"
ON metric_aggregations FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false); -- Only service role

-- DELETE: System process manages aggregations (service role)
CREATE POLICY "System can delete metric aggregations"
ON metric_aggregations FOR DELETE
TO authenticated
USING (false); -- Only service role

-- =============================================
-- GOOGLE_CREDENTIALS Table Policies
-- =============================================

-- SELECT: Users can see credentials for their clinics
CREATE POLICY "Users can view Google credentials for their clinics"
ON google_credentials FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
  AND (SELECT auth.get_user_role(clinic_id)) IN ('clinic_admin')
);

-- INSERT: Clinic admins can create credentials
CREATE POLICY "Clinic admins can create Google credentials"
ON google_credentials FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update credentials
CREATE POLICY "Clinic admins can update Google credentials"
ON google_credentials FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete credentials
CREATE POLICY "Clinic admins can delete Google credentials"
ON google_credentials FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- SPREADSHEET_CONNECTIONS Table Policies
-- =============================================

-- SELECT: Users can see spreadsheet connections for their clinics
CREATE POLICY "Users can view spreadsheet connections for their clinics"
ON spreadsheet_connections FOR SELECT
TO authenticated
USING (
  (SELECT auth.has_clinic_access(clinic_id))
);

-- INSERT: Clinic admins can create connections
CREATE POLICY "Clinic admins can create spreadsheet connections"
ON spreadsheet_connections FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- UPDATE: Clinic admins can update connections
CREATE POLICY "Clinic admins can update spreadsheet connections"
ON spreadsheet_connections FOR UPDATE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
)
WITH CHECK (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- DELETE: Clinic admins can delete connections
CREATE POLICY "Clinic admins can delete spreadsheet connections"
ON spreadsheet_connections FOR DELETE
TO authenticated
USING (
  (SELECT auth.is_clinic_admin(clinic_id))
);

-- =============================================
-- COLUMN_MAPPINGS_V2 Table Policies
-- =============================================

-- SELECT: Users can see column mappings for connections in their clinics
CREATE POLICY "Users can view column mappings for their clinic connections"
ON column_mappings_v2 FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM spreadsheet_connections sc
    WHERE sc.id = column_mappings_v2.connection_id
      AND (SELECT auth.has_clinic_access(sc.clinic_id))
  )
);

-- INSERT: Clinic admins can create column mappings
CREATE POLICY "Clinic admins can create column mappings"
ON column_mappings_v2 FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM spreadsheet_connections sc
    WHERE sc.id = column_mappings_v2.connection_id
      AND (SELECT auth.is_clinic_admin(sc.clinic_id))
  )
);

-- UPDATE: Clinic admins can update column mappings
CREATE POLICY "Clinic admins can update column mappings"
ON column_mappings_v2 FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM spreadsheet_connections sc
    WHERE sc.id = column_mappings_v2.connection_id
      AND (SELECT auth.is_clinic_admin(sc.clinic_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM spreadsheet_connections sc
    WHERE sc.id = column_mappings_v2.connection_id
      AND (SELECT auth.is_clinic_admin(sc.clinic_id))
  )
);

-- DELETE: Clinic admins can delete column mappings
CREATE POLICY "Clinic admins can delete column mappings"
ON column_mappings_v2 FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM spreadsheet_connections sc
    WHERE sc.id = column_mappings_v2.connection_id
      AND (SELECT auth.is_clinic_admin(sc.clinic_id))
  )
);

-- =============================================
-- ID_MAPPINGS Table Policies
-- =============================================

-- SELECT: Only service role can view ID mappings
CREATE POLICY "Service role can view ID mappings"
ON id_mappings FOR SELECT
TO authenticated
USING (false); -- Only service role

-- INSERT: Only service role can create ID mappings
CREATE POLICY "Service role can create ID mappings"
ON id_mappings FOR INSERT
TO authenticated
WITH CHECK (false); -- Only service role

-- UPDATE: ID mappings are immutable
CREATE POLICY "ID mappings are immutable"
ON id_mappings FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- DELETE: Only service role can delete ID mappings
CREATE POLICY "Service role can delete ID mappings"
ON id_mappings FOR DELETE
TO authenticated
USING (false); -- Only service role

-- =============================================
-- Create Indexes for RLS Performance
-- =============================================

-- Indexes for user_clinic_roles (most frequently queried in RLS)
CREATE INDEX IF NOT EXISTS idx_user_clinic_roles_user_auth 
ON user_clinic_roles(user_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_clinic_roles_clinic_active 
ON user_clinic_roles(clinic_id, is_active);

-- Index for users auth_id lookup
CREATE INDEX IF NOT EXISTS idx_users_auth_id 
ON users(auth_id);

-- Indexes for common foreign key relationships used in RLS
CREATE INDEX IF NOT EXISTS idx_data_sources_clinic 
ON data_sources(clinic_id);

CREATE INDEX IF NOT EXISTS idx_providers_clinic 
ON providers(clinic_id);

CREATE INDEX IF NOT EXISTS idx_metric_values_clinic 
ON metric_values(clinic_id);

CREATE INDEX IF NOT EXISTS idx_goals_clinic 
ON goals(clinic_id);

CREATE INDEX IF NOT EXISTS idx_financial_metrics_clinic_date 
ON financial_metrics(clinic_id, date);

CREATE INDEX IF NOT EXISTS idx_appointment_metrics_clinic_date 
ON appointment_metrics(clinic_id, date);

CREATE INDEX IF NOT EXISTS idx_call_metrics_clinic_date 
ON call_metrics(clinic_id, date);

CREATE INDEX IF NOT EXISTS idx_patient_metrics_clinic_date 
ON patient_metrics(clinic_id, date);

CREATE INDEX IF NOT EXISTS idx_metric_aggregations_clinic_period 
ON metric_aggregations(clinic_id, period_start);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;

-- Comment on the migration
COMMENT ON SCHEMA public IS 'Phase 3: Row Level Security implementation complete with multi-tenant isolation';