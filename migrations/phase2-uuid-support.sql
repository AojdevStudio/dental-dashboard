-- Phase 2: Add UUID Support to Existing Tables

-- Add UUID fields to User table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "auth_id" TEXT,
ADD COLUMN IF NOT EXISTS "uuid_id" TEXT;

-- Add unique constraints for User UUID fields
ALTER TABLE "users" 
ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id"),
ADD CONSTRAINT "users_uuid_id_key" UNIQUE ("uuid_id");

-- Add UUID field to Clinic table
ALTER TABLE "clinics" 
ADD COLUMN IF NOT EXISTS "uuid_id" TEXT;

-- Add unique constraint for Clinic UUID
ALTER TABLE "clinics" 
ADD CONSTRAINT "clinics_uuid_id_key" UNIQUE ("uuid_id");

-- Add UUID fields to Dashboard table
ALTER TABLE "dashboards" 
ADD COLUMN IF NOT EXISTS "uuid_id" TEXT,
ADD COLUMN IF NOT EXISTS "user_uuid_id" TEXT;

-- Add unique constraint for Dashboard UUID
ALTER TABLE "dashboards" 
ADD CONSTRAINT "dashboards_uuid_id_key" UNIQUE ("uuid_id");

-- Create ID Mapping table
CREATE TABLE IF NOT EXISTS "id_mappings" (
    "id" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "old_id" TEXT NOT NULL,
    "new_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "id_mappings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "id_mappings_table_name_old_id_key" UNIQUE ("table_name", "old_id")
);

-- Create index on id_mappings
CREATE INDEX IF NOT EXISTS "id_mappings_table_name_idx" ON "id_mappings"("table_name");

-- Add trigger to auto-generate UUIDs on insert (optional, can be done in application)
CREATE OR REPLACE FUNCTION generate_uuid_for_existing_records()
RETURNS void AS $$
BEGIN
    -- Generate UUIDs for users without them
    UPDATE "users" 
    SET "uuid_id" = gen_random_uuid()::text 
    WHERE "uuid_id" IS NULL;
    
    -- Generate UUIDs for clinics without them
    UPDATE "clinics" 
    SET "uuid_id" = gen_random_uuid()::text 
    WHERE "uuid_id" IS NULL;
    
    -- Generate UUIDs for dashboards without them
    UPDATE "dashboards" 
    SET "uuid_id" = gen_random_uuid()::text 
    WHERE "uuid_id" IS NULL;
    
    -- Insert mappings for users
    INSERT INTO "id_mappings" ("id", "table_name", "old_id", "new_id")
    SELECT gen_random_uuid()::text, 'users', "id", "uuid_id"
    FROM "users"
    WHERE "uuid_id" IS NOT NULL
    ON CONFLICT ("table_name", "old_id") DO NOTHING;
    
    -- Insert mappings for clinics
    INSERT INTO "id_mappings" ("id", "table_name", "old_id", "new_id")
    SELECT gen_random_uuid()::text, 'clinics', "id", "uuid_id"
    FROM "clinics"
    WHERE "uuid_id" IS NOT NULL
    ON CONFLICT ("table_name", "old_id") DO NOTHING;
    
    -- Insert mappings for dashboards
    INSERT INTO "id_mappings" ("id", "table_name", "old_id", "new_id")
    SELECT gen_random_uuid()::text, 'dashboards', "id", "uuid_id"
    FROM "dashboards"
    WHERE "uuid_id" IS NOT NULL
    ON CONFLICT ("table_name", "old_id") DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute the UUID generation
SELECT generate_uuid_for_existing_records();

-- Update dashboard user_uuid_id based on mapping
UPDATE "dashboards" d
SET "user_uuid_id" = (
    SELECT im."new_id" 
    FROM "id_mappings" im 
    WHERE im."table_name" = 'users' 
    AND im."old_id" = d."user_id"
)
WHERE d."user_uuid_id" IS NULL 
AND EXISTS (
    SELECT 1 
    FROM "id_mappings" im 
    WHERE im."table_name" = 'users' 
    AND im."old_id" = d."user_id"
);