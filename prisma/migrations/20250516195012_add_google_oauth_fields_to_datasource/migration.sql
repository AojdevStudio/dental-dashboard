-- Add OAuth token fields to the data_sources table
ALTER TABLE "data_sources"
    ADD COLUMN "access_token" text NOT NULL;

ALTER TABLE "data_sources"
    ADD COLUMN "refresh_token" text;

ALTER TABLE "data_sources"
    ADD COLUMN "expiry_date" timestamp(3);

-- Add clinic relation to data_sources table
ALTER TABLE "data_sources"
    ADD COLUMN "clinic_id" text NOT NULL;

-- Add foreign key constraint to connect data_sources to clinics
ALTER TABLE "data_sources"
    ADD CONSTRAINT "data_sources_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

