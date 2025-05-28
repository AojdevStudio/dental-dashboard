-- Phase 2 Rollback: Remove UUID Support Changes
-- This script removes UUID fields and mapping tables

-- Drop constraints first
ALTER TABLE "users" 
DROP CONSTRAINT IF EXISTS "users_auth_id_key",
DROP CONSTRAINT IF EXISTS "users_uuid_id_key";

ALTER TABLE "clinics" 
DROP CONSTRAINT IF EXISTS "clinics_uuid_id_key";

ALTER TABLE "dashboards" 
DROP CONSTRAINT IF EXISTS "dashboards_uuid_id_key";

-- Drop the ID mapping table
DROP TABLE IF EXISTS "id_mappings" CASCADE;

-- Remove UUID columns from users
ALTER TABLE "users" 
DROP COLUMN IF EXISTS "auth_id",
DROP COLUMN IF EXISTS "uuid_id";

-- Remove UUID column from clinics
ALTER TABLE "clinics" 
DROP COLUMN IF EXISTS "uuid_id";

-- Remove UUID columns from dashboards
ALTER TABLE "dashboards" 
DROP COLUMN IF EXISTS "uuid_id",
DROP COLUMN IF EXISTS "user_uuid_id";

-- Drop UUID generation function
DROP FUNCTION IF EXISTS generate_uuid_for_existing_records();

-- Log rollback completion
-- Note: Only if audit_log table exists
-- INSERT INTO audit_log (action, status, details, executed_at)
-- VALUES ('phase_2_rollback', 'completed', 'UUID support removed', NOW());