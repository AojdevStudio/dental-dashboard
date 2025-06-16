-- Phase 2 Rollback: Remove Data Population & Dual-Write Changes
-- This script removes UUID data and mapping tables

-- Remove data from new tables (if any was inserted)
TRUNCATE TABLE google_credentials CASCADE;
TRUNCATE TABLE spreadsheet_connections CASCADE;

-- Drop the ID mapping table
DROP TABLE IF EXISTS id_mappings CASCADE;

-- Clear UUID values (set back to NULL)
UPDATE "User" SET uuid_id = NULL;
UPDATE "Clinic" SET uuid_id = NULL;
UPDATE "Provider" SET uuid_id = NULL;
UPDATE "DataSource" SET uuid_id = NULL;
UPDATE "MetricDefinition" SET uuid_id = NULL;
UPDATE "MetricValue" SET uuid_id = NULL;
UPDATE "Goal" SET uuid_id = NULL;
UPDATE "Dashboard" SET uuid_id = NULL;
UPDATE "Widget" SET uuid_id = NULL;
UPDATE "ColumnMapping" SET uuid_id = NULL;

-- Remove any dual-write triggers
DROP TRIGGER IF EXISTS sync_uuid_on_insert ON "User";
DROP TRIGGER IF EXISTS sync_uuid_on_insert ON "Clinic";
DROP TRIGGER IF EXISTS sync_uuid_on_insert ON "Provider";

-- Drop dual-write functions
DROP FUNCTION IF EXISTS generate_uuid_for_record();
DROP FUNCTION IF EXISTS sync_id_mapping();

-- Reset any sequences that might have been created
-- (None in this phase, but included for completeness)

-- Clear migration tracking for Phase 2
DELETE FROM migration_tracking WHERE phase = 'phase_2';

-- Log rollback completion
INSERT INTO audit_log (action, status, details, executed_at)
VALUES ('phase_2_rollback', 'completed', 'UUID population and mappings removed', NOW());