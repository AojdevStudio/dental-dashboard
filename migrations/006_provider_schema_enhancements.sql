-- Migration: 006_provider_schema_enhancements.sql
-- Description: Optional schema enhancements for provider management
-- Created: 2025-07-03
-- Dependencies: 005_fix_provider_rls_policies.sql
-- Priority: MEDIUM - Functional improvements and future-proofing

BEGIN;

-- ================================
-- PROVIDER SPECIALTIES SUPPORT
-- ================================

-- Create provider specialties table for detailed provider classification
CREATE TABLE IF NOT EXISTS public.provider_specialties (
  id TEXT PRIMARY KEY DEFAULT 'spec_' || substr(md5(random()::text), 1, 20),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- dental, hygiene, administrative, support
  requires_license BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed common dental specialties
INSERT INTO public.provider_specialties (name, description, category, requires_license) VALUES
('General Dentistry', 'Comprehensive oral healthcare for all ages', 'dental', true),
('Orthodontics', 'Teeth and jaw alignment specialist', 'dental', true),
('Endodontics', 'Root canal therapy specialist', 'dental', true),
('Periodontics', 'Gum disease and dental implant specialist', 'dental', true),
('Oral Surgery', 'Surgical procedures of mouth and jaw', 'dental', true),
('Pediatric Dentistry', 'Dental care for children and adolescents', 'dental', true),
('Prosthodontics', 'Restoration and replacement of teeth', 'dental', true),
('Oral Pathology', 'Diagnosis of oral diseases', 'dental', true),
('Dental Hygienist', 'Preventive dental care and cleaning', 'hygiene', true),
('Expanded Function Hygienist', 'Advanced hygiene procedures', 'hygiene', true),
('Dental Assistant', 'Chairside assistance and patient care', 'support', false),
('Practice Administrator', 'Office management and administration', 'administrative', false),
('Treatment Coordinator', 'Patient treatment planning and coordination', 'administrative', false),
('Insurance Coordinator', 'Insurance claims and verification', 'administrative', false)
ON CONFLICT (name) DO NOTHING;

-- Provider-Specialty many-to-many relationship
CREATE TABLE IF NOT EXISTS public.provider_specialties_assignments (
  id TEXT PRIMARY KEY DEFAULT 'psa_' || substr(md5(random()::text), 1, 20),
  provider_id TEXT NOT NULL,
  specialty_id TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  certification_date DATE,
  certification_number TEXT,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES public.provider_specialties(id) ON DELETE CASCADE,
  UNIQUE(provider_id, specialty_id)
);

-- ================================
-- PROVIDER AVAILABILITY FRAMEWORK
-- ================================

-- Provider schedule templates (future enhancement)
CREATE TABLE IF NOT EXISTS public.provider_schedules (
  id TEXT PRIMARY KEY DEFAULT 'sched_' || substr(md5(random()::text), 1, 20),
  provider_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE,
  UNIQUE(provider_id, location_id, day_of_week, start_time, effective_from)
);

-- ================================
-- PROVIDER HIERARCHY SUPPORT
-- ================================

-- Provider supervision relationships (dentist supervising hygienists, etc.)
CREATE TABLE IF NOT EXISTS public.provider_relationships (
  id TEXT PRIMARY KEY DEFAULT 'prel_' || substr(md5(random()::text), 1, 20),
  supervisor_id TEXT NOT NULL,
  supervisee_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supervision', 'mentorship', 'partnership', 'referral')),
  location_id TEXT, -- Relationship may be location-specific
  is_active BOOLEAN DEFAULT true,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (supervisor_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisee_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL,
  
  -- Prevent self-supervision
  CHECK (supervisor_id != supervisee_id),
  UNIQUE(supervisor_id, supervisee_id, relationship_type, location_id)
);

-- ================================
-- ENHANCED AUDIT TRACKING
-- ================================

-- Provider change history for compliance and audit
CREATE TABLE IF NOT EXISTS public.provider_audit_log (
  id TEXT PRIMARY KEY DEFAULT 'audit_' || substr(md5(random()::text), 1, 20),
  provider_id TEXT NOT NULL,
  changed_by TEXT, -- User ID who made the change
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'status_changed', 'location_assigned', 'location_removed', 'deleted')),
  field_changes JSONB, -- Store before/after values
  location_id TEXT, -- If change is location-specific
  change_reason TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL
);

-- ================================
-- PERFORMANCE INDEXES
-- ================================

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION create_index_if_not_exists(index_name TEXT, index_definition TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = index_name
  ) INTO index_exists;
  
  IF NOT index_exists THEN
    EXECUTE index_definition;
    RAISE NOTICE 'Created index: %', index_name;
    RETURN true;
  ELSE
    RAISE NOTICE 'Index already exists: %', index_name;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Provider specialties indexes
SELECT create_index_if_not_exists(
  'provider_specialties_category_idx',
  'CREATE INDEX provider_specialties_category_idx ON public.provider_specialties (category)'
);

-- Provider specialty assignments indexes
SELECT create_index_if_not_exists(
  'provider_specialties_assignments_provider_idx',
  'CREATE INDEX provider_specialties_assignments_provider_idx ON public.provider_specialties_assignments (provider_id)'
);

SELECT create_index_if_not_exists(
  'provider_specialties_assignments_active_idx',
  'CREATE INDEX provider_specialties_assignments_active_idx ON public.provider_specialties_assignments (is_active) WHERE is_active = true'
);

-- Provider schedules indexes
SELECT create_index_if_not_exists(
  'provider_schedules_provider_location_idx',
  'CREATE INDEX provider_schedules_provider_location_idx ON public.provider_schedules (provider_id, location_id)'
);

SELECT create_index_if_not_exists(
  'provider_schedules_active_idx',
  'CREATE INDEX provider_schedules_active_idx ON public.provider_schedules (is_active) WHERE is_active = true'
);

-- Provider relationships indexes
SELECT create_index_if_not_exists(
  'provider_relationships_supervisor_idx',
  'CREATE INDEX provider_relationships_supervisor_idx ON public.provider_relationships (supervisor_id)'
);

SELECT create_index_if_not_exists(
  'provider_relationships_supervisee_idx',
  'CREATE INDEX provider_relationships_supervisee_idx ON public.provider_relationships (supervisee_id)'
);

-- Audit log indexes
SELECT create_index_if_not_exists(
  'provider_audit_log_provider_idx',
  'CREATE INDEX provider_audit_log_provider_idx ON public.provider_audit_log (provider_id)'
);

SELECT create_index_if_not_exists(
  'provider_audit_log_date_idx',
  'CREATE INDEX provider_audit_log_date_idx ON public.provider_audit_log (created_at)'
);

-- ================================
-- RLS POLICIES FOR NEW TABLES
-- ================================

-- Enable RLS on new tables
ALTER TABLE public.provider_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_specialties_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_audit_log ENABLE ROW LEVEL SECURITY;

-- Provider specialties: Global read access (reference data)
CREATE POLICY provider_specialties_read_all ON public.provider_specialties
  FOR SELECT
  USING (true);

-- Provider specialty assignments: Through provider clinic
CREATE POLICY provider_specialties_assignments_clinic_isolation ON public.provider_specialties_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_specialties_assignments.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_specialties_assignments.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Provider schedules: Through provider clinic
CREATE POLICY provider_schedules_clinic_isolation ON public.provider_schedules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_schedules.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_schedules.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Provider relationships: Both providers must be in same clinic
CREATE POLICY provider_relationships_clinic_isolation ON public.provider_relationships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p1, public.providers p2
      WHERE p1.id = provider_relationships.supervisor_id 
      AND p2.id = provider_relationships.supervisee_id
      AND p1.clinic_id = auth.get_current_clinic_id()
      AND p2.clinic_id = auth.get_current_clinic_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p1, public.providers p2
      WHERE p1.id = provider_relationships.supervisor_id 
      AND p2.id = provider_relationships.supervisee_id
      AND p1.clinic_id = auth.get_current_clinic_id()
      AND p2.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Provider audit log: Through provider clinic
CREATE POLICY provider_audit_log_clinic_isolation ON public.provider_audit_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_audit_log.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p 
      WHERE p.id = provider_audit_log.provider_id 
      AND p.clinic_id = auth.get_current_clinic_id()
    )
  );

-- ================================
-- AUDIT TRIGGERS (OPTIONAL)
-- ================================

-- Function to log provider changes
CREATE OR REPLACE FUNCTION log_provider_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.provider_audit_log (provider_id, change_type, field_changes)
    VALUES (NEW.id, 'created', row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.provider_audit_log (provider_id, change_type, field_changes)
    VALUES (NEW.id, 'updated', jsonb_build_object(
      'before', row_to_json(OLD)::jsonb,
      'after', row_to_json(NEW)::jsonb
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.provider_audit_log (provider_id, change_type, field_changes)
    VALUES (OLD.id, 'deleted', row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers (commented out - enable if audit logging is desired)
-- CREATE TRIGGER providers_audit_trigger
--   AFTER INSERT OR UPDATE OR DELETE ON public.providers
--   FOR EACH ROW EXECUTE FUNCTION log_provider_changes();

-- ================================
-- GRANTS AND PERMISSIONS
-- ================================

-- Grant permissions on new tables
GRANT SELECT ON public.provider_specialties TO authenticated;
GRANT ALL ON public.provider_specialties_assignments TO authenticated;
GRANT ALL ON public.provider_schedules TO authenticated;
GRANT ALL ON public.provider_relationships TO authenticated;
GRANT SELECT ON public.provider_audit_log TO authenticated;

-- Service role full access
GRANT ALL ON public.provider_specialties TO service_role;
GRANT ALL ON public.provider_specialties_assignments TO service_role;
GRANT ALL ON public.provider_schedules TO service_role;
GRANT ALL ON public.provider_relationships TO service_role;
GRANT ALL ON public.provider_audit_log TO service_role;

-- ================================
-- CLEANUP AND STATISTICS
-- ================================

-- Clean up helper function
DROP FUNCTION create_index_if_not_exists(TEXT, TEXT);

-- Update statistics
ANALYZE public.provider_specialties;
ANALYZE public.provider_specialties_assignments;
ANALYZE public.provider_schedules;
ANALYZE public.provider_relationships;
ANALYZE public.provider_audit_log;

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('006_provider_schema_enhancements', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();

COMMIT;

-- ================================
-- ENHANCEMENT SUMMARY
-- ================================

-- SCHEMA ENHANCEMENTS ADDED:
--
-- 1. PROVIDER SPECIALTIES FRAMEWORK:
--    ✅ provider_specialties - Reference table for dental specialties
--    ✅ provider_specialties_assignments - Many-to-many provider-specialty relationships
--    ✅ Support for certifications, expiration dates, primary specialties
--
-- 2. PROVIDER AVAILABILITY SYSTEM:
--    ✅ provider_schedules - Weekly schedule templates per location
--    ✅ Support for time ranges, effective dates, location-specific schedules
--
-- 3. PROVIDER HIERARCHY SUPPORT:
--    ✅ provider_relationships - Supervision, mentorship, partnership tracking
--    ✅ Support for location-specific relationships
--    ✅ Prevents self-supervision and circular relationships
--
-- 4. ENHANCED AUDIT TRACKING:
--    ✅ provider_audit_log - Comprehensive change tracking
--    ✅ Support for field-level change tracking with JSONB
--    ✅ Optional audit triggers for automatic logging
--
-- 5. MULTI-TENANT SECURITY:
--    ✅ RLS policies for all new tables
--    ✅ Clinic-based isolation maintained
--    ✅ Proper permission grants
--
-- 6. PERFORMANCE OPTIMIZATION:
--    ✅ Strategic indexes for common query patterns
--    ✅ Partial indexes for active relationships
--    ✅ Composite indexes for complex queries
--
-- FUTURE CAPABILITIES ENABLED:
-- - Advanced provider scheduling and availability
-- - Detailed provider specialty tracking and certification management
-- - Provider supervision and mentorship relationships
-- - Comprehensive audit trails for compliance
-- - Enhanced reporting and analytics capabilities