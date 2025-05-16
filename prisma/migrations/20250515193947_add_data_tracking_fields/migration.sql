-- AlterTable
ALTER TABLE "data_sources" ADD COLUMN     "app_script_id" TEXT;

-- AlterTable
ALTER TABLE "metric_values" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source_sheet" TEXT;
