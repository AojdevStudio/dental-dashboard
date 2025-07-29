-- ===== SYNC RESILIENCE DATABASE FUNCTIONS =====
-- Functions for stable ID lookup across external systems
-- Prevents sync failures during database reseeds

-- Function: Get clinic ID by stable clinic code
-- Usage: SELECT get_clinic_id_by_code('KAMDENTAL_MAIN');
CREATE OR REPLACE FUNCTION get_clinic_id_by_code(clinic_code_input TEXT)
RETURNS TEXT AS $$
DECLARE
    clinic_id_result TEXT;
BEGIN
    SELECT id INTO clinic_id_result 
    FROM clinics 
    WHERE clinic_code = clinic_code_input 
    LIMIT 1;
    
    RETURN clinic_id_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get provider ID by stable provider code
-- Usage: SELECT get_provider_id_by_code('obinna_ezeji');
CREATE OR REPLACE FUNCTION get_provider_id_by_code(provider_code_input TEXT)
RETURNS TEXT AS $$
DECLARE
    provider_id_result TEXT;
BEGIN
    SELECT id INTO provider_id_result 
    FROM providers 
    WHERE provider_code = provider_code_input 
    LIMIT 1;
    
    RETURN provider_id_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get location ID by stable location code
-- Usage: SELECT get_location_id_by_code('BAYTOWN_MAIN');
CREATE OR REPLACE FUNCTION get_location_id_by_code(location_code_input TEXT)
RETURNS TEXT AS $$
DECLARE
    location_id_result TEXT;
BEGIN
    SELECT id INTO location_id_result 
    FROM locations 
    WHERE location_code = location_code_input 
    LIMIT 1;
    
    RETURN location_id_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get entity ID by external mapping (most flexible)
-- Usage: SELECT get_entity_id_by_external_mapping('dentist_sync', 'MAIN_CLINIC', 'clinic');
CREATE OR REPLACE FUNCTION get_entity_id_by_external_mapping(
    system_name TEXT, 
    external_id_input TEXT, 
    entity_type_input TEXT
)
RETURNS TEXT AS $$
DECLARE
    entity_id_result TEXT;
BEGIN
    SELECT entity_id INTO entity_id_result
    FROM external_id_mappings 
    WHERE external_system = system_name 
      AND external_identifier = external_id_input 
      AND entity_type = entity_type_input 
      AND is_active = true 
    LIMIT 1;
    
    RETURN entity_id_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Upsert external ID mapping (create or update)
-- Usage: SELECT upsert_external_mapping('dentist_sync', 'MAIN_CLINIC', 'clinic', 'cm123456');
CREATE OR REPLACE FUNCTION upsert_external_mapping(
    system_name TEXT,
    external_id_input TEXT,
    entity_type_input TEXT,
    entity_id_input TEXT,
    notes_input TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO external_id_mappings (
        external_system, 
        external_identifier, 
        entity_type, 
        entity_id, 
        is_active, 
        notes,
        created_at,
        updated_at
    )
    VALUES (
        system_name, 
        external_id_input, 
        entity_type_input, 
        entity_id_input, 
        true, 
        notes_input,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_system, external_identifier, entity_type) 
    DO UPDATE SET 
        entity_id = EXCLUDED.entity_id,
        is_active = EXCLUDED.is_active,
        notes = EXCLUDED.notes,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get all mappings for a system (for debugging)
-- Usage: SELECT * FROM get_system_mappings('dentist_sync');
CREATE OR REPLACE FUNCTION get_system_mappings(system_name TEXT)
RETURNS TABLE(
    external_identifier TEXT,
    entity_type TEXT,
    entity_id TEXT,
    is_active BOOLEAN,
    notes TEXT,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.external_identifier,
        e.entity_type,
        e.entity_id,
        e.is_active,
        e.notes,
        e.updated_at
    FROM external_id_mappings e
    WHERE e.external_system = system_name
    ORDER BY e.entity_type, e.external_identifier;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate entity exists and return details
-- Usage: SELECT * FROM validate_entity_mapping('clinic', 'cm123456');
CREATE OR REPLACE FUNCTION validate_entity_mapping(
    entity_type_input TEXT,
    entity_id_input TEXT
)
RETURNS TABLE(
    entity_id TEXT,
    entity_name TEXT,
    entity_code TEXT,
    exists_in_db BOOLEAN
) AS $$
BEGIN
    IF entity_type_input = 'clinic' THEN
        RETURN QUERY
        SELECT 
            c.id::TEXT,
            c.name,
            COALESCE(c.clinic_code, 'NOT_SET')::TEXT,
            TRUE
        FROM clinics c
        WHERE c.id = entity_id_input;
        
    ELSIF entity_type_input = 'provider' THEN
        RETURN QUERY
        SELECT 
            p.id::TEXT,
            p.name,
            COALESCE(p.provider_code, 'NOT_SET')::TEXT,
            TRUE
        FROM providers p
        WHERE p.id = entity_id_input;
        
    ELSIF entity_type_input = 'location' THEN
        RETURN QUERY
        SELECT 
            l.id::TEXT,
            l.name,
            COALESCE(l.location_code, 'NOT_SET')::TEXT,
            TRUE
        FROM locations l
        WHERE l.id = entity_id_input;
    END IF;
    
    -- If no rows returned above, entity doesn't exist
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            entity_id_input,
            'NOT_FOUND'::TEXT,
            'NOT_FOUND'::TEXT,
            FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate stable codes from names (utility for seeding)
-- Usage: SELECT generate_stable_code('Dr. Obinna Ezeji');
CREATE OR REPLACE FUNCTION generate_stable_code(name_input TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Convert to lowercase, replace spaces with underscores, remove special chars
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(name_input, '[^a-zA-Z0-9\s]', '', 'g'),
            '\s+', '_', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Example of how to use these functions:
-- 
-- 1. Get clinic ID for Google Apps Script:
--    SELECT get_clinic_id_by_code('KAMDENTAL_MAIN');
--
-- 2. Get provider ID by external mapping:
--    SELECT get_entity_id_by_external_mapping('hygienist_sync', 'ADRIANE_PROVIDER', 'provider');
--
-- 3. Create a new mapping:
--    SELECT upsert_external_mapping('dentist_sync', 'OBI_PROVIDER', 'provider', 'cm789012');
--
-- 4. Debug all mappings for a system:
--    SELECT * FROM get_system_mappings('dentist_sync');
--
-- 5. Validate an entity exists:
--    SELECT * FROM validate_entity_mapping('clinic', 'cm123456');