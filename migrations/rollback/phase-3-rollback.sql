-- Phase 3 Rollback: Remove Foreign Key Migration Changes
-- WARNING: This is a complex rollback - ensure data integrity before running

-- First, drop new UUID-based foreign key constraints
ALTER TABLE "Provider" DROP CONSTRAINT IF EXISTS fk_provider_clinic_uuid;
ALTER TABLE "DataSource" DROP CONSTRAINT IF EXISTS fk_datasource_clinic_uuid;
ALTER TABLE "MetricValue" DROP CONSTRAINT IF EXISTS fk_metricvalue_clinic_uuid;
ALTER TABLE "MetricValue" DROP CONSTRAINT IF EXISTS fk_metricvalue_provider_uuid;
ALTER TABLE "Goal" DROP CONSTRAINT IF EXISTS fk_goal_clinic_uuid;
ALTER TABLE "Dashboard" DROP CONSTRAINT IF EXISTS fk_dashboard_clinic_uuid;
ALTER TABLE "Widget" DROP CONSTRAINT IF EXISTS fk_widget_dashboard_uuid;
ALTER TABLE "ColumnMapping" DROP CONSTRAINT IF EXISTS fk_columnmapping_datasource_uuid;

-- Remove UUID foreign key columns
ALTER TABLE "Provider" DROP COLUMN IF EXISTS clinic_uuid_id;
ALTER TABLE "DataSource" DROP COLUMN IF EXISTS clinic_uuid_id;
ALTER TABLE "MetricValue" DROP COLUMN IF EXISTS clinic_uuid_id;
ALTER TABLE "MetricValue" DROP COLUMN IF EXISTS provider_uuid_id;
ALTER TABLE "Goal" DROP COLUMN IF EXISTS clinic_uuid_id;
ALTER TABLE "Dashboard" DROP COLUMN IF EXISTS clinic_uuid_id;
ALTER TABLE "Widget" DROP COLUMN IF EXISTS dashboard_uuid_id;
ALTER TABLE "ColumnMapping" DROP COLUMN IF EXISTS datasource_uuid_id;

-- Re-enable original foreign key constraints if they were disabled
ALTER TABLE "Provider" 
  ADD CONSTRAINT IF NOT EXISTS "Provider_clinicId_fkey" 
  FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id");

ALTER TABLE "DataSource" 
  ADD CONSTRAINT IF NOT EXISTS "DataSource_clinicId_fkey" 
  FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id");

-- Drop UUID relationship indexes
DROP INDEX IF EXISTS idx_provider_clinic_uuid;
DROP INDEX IF EXISTS idx_datasource_clinic_uuid;
DROP INDEX IF EXISTS idx_metricvalue_clinic_uuid;
DROP INDEX IF EXISTS idx_metricvalue_provider_uuid;

-- Remove any relationship mapping tables
DROP TABLE IF EXISTS fk_migration_mappings;

-- Clear migration tracking for Phase 3
DELETE FROM migration_tracking WHERE phase = 'phase_3';

-- Verify data integrity
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  -- Check for orphaned records
  SELECT COUNT(*) INTO orphaned_count
  FROM "Provider" p
  WHERE NOT EXISTS (SELECT 1 FROM "Clinic" c WHERE c.id = p."clinicId");
  
  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % orphaned Provider records', orphaned_count;
  END IF;
END $$;

-- Log rollback completion
INSERT INTO audit_log (action, status, details, executed_at)
VALUES ('phase_3_rollback', 'completed', 'Foreign key migrations reversed', NOW());