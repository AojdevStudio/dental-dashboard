-- Phase 1 Rollback: Remove Additive Schema Changes
-- This script safely removes all changes made in Phase 1

-- Drop new tables (safe - no data dependencies)
DROP TABLE IF EXISTS google_credentials CASCADE;
DROP TABLE IF EXISTS spreadsheet_connections CASCADE;
DROP TABLE IF EXISTS migration_tracking CASCADE;

-- Remove UUID columns from existing tables
ALTER TABLE "User" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "Clinic" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "Provider" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "DataSource" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "MetricDefinition" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "MetricValue" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "Goal" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "Dashboard" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "Widget" DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE "ColumnMapping" DROP COLUMN IF EXISTS uuid_id;

-- Remove multi-tenancy preparation columns
ALTER TABLE "User" DROP COLUMN IF EXISTS auth_user_id;
ALTER TABLE "DataSource" DROP COLUMN IF EXISTS clinic_id_new;
ALTER TABLE "MetricValue" DROP COLUMN IF EXISTS clinic_id_new;

-- Drop any indexes created for new columns
DROP INDEX IF EXISTS idx_user_uuid_id;
DROP INDEX IF EXISTS idx_clinic_uuid_id;
DROP INDEX IF EXISTS idx_provider_uuid_id;

-- Log rollback completion
INSERT INTO audit_log (action, status, details, executed_at)
VALUES ('phase_1_rollback', 'completed', 'All Phase 1 changes rolled back successfully', NOW());