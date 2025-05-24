-- CreateTable
CREATE TABLE "user_clinic_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_clinic_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "metric_definition_id" TEXT NOT NULL,
    "target_formula" TEXT,
    "time_period" TEXT NOT NULL,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "clinic_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_metrics" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metric_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "provider_id" TEXT,
    "insurance_carrier" TEXT,
    "payment_method" TEXT,
    "procedure_code" TEXT,
    "notes" TEXT,
    "source_reference" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_metrics" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "provider_id" TEXT,
    "appointment_type" TEXT NOT NULL,
    "scheduled_count" INTEGER NOT NULL,
    "completed_count" INTEGER NOT NULL,
    "cancelled_count" INTEGER NOT NULL,
    "no_show_count" INTEGER NOT NULL,
    "average_duration" INTEGER,
    "production_amount" DECIMAL(10,2),
    "utilization_rate" DECIMAL(5,2),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_metrics" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "call_type" TEXT NOT NULL,
    "total_calls" INTEGER NOT NULL,
    "connected_calls" INTEGER NOT NULL,
    "voicemails" INTEGER NOT NULL,
    "appointments_scheduled" INTEGER NOT NULL,
    "conversion_rate" DECIMAL(5,2) NOT NULL,
    "average_call_duration" INTEGER,
    "staff_member_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_metrics" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "active_patients" INTEGER NOT NULL,
    "new_patients" INTEGER NOT NULL,
    "reactivated_patients" INTEGER NOT NULL,
    "lost_patients" INTEGER NOT NULL,
    "patient_retention_rate" DECIMAL(5,2) NOT NULL,
    "average_patient_value" DECIMAL(10,2),
    "recare_compliance_rate" DECIMAL(5,2),
    "treatment_acceptance_rate" DECIMAL(5,2),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_aggregations" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "metric_definition_id" TEXT NOT NULL,
    "aggregation_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(20,4) NOT NULL,
    "count" INTEGER NOT NULL,
    "minimum" DECIMAL(20,4),
    "maximum" DECIMAL(20,4),
    "average" DECIMAL(20,4),
    "standard_deviation" DECIMAL(20,4),
    "provider_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metric_aggregations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_credentials" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "scope" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spreadsheet_connections" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "spreadsheet_id" TEXT NOT NULL,
    "spreadsheet_name" TEXT NOT NULL,
    "sheet_names" TEXT[],
    "last_sync_at" TIMESTAMP(3),
    "sync_status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spreadsheet_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "column_mappings_v2" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "sheet_name" TEXT NOT NULL,
    "mapping_config" JSONB NOT NULL,
    "template_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "column_mappings_v2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_clinic_roles_clinic_id_idx" ON "user_clinic_roles"("clinic_id");

-- CreateIndex
CREATE INDEX "user_clinic_roles_user_id_idx" ON "user_clinic_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_clinic_roles_user_id_clinic_id_key" ON "user_clinic_roles"("user_id", "clinic_id");

-- CreateIndex
CREATE INDEX "goal_templates_clinic_id_idx" ON "goal_templates"("clinic_id");

-- CreateIndex
CREATE INDEX "goal_templates_metric_definition_id_idx" ON "goal_templates"("metric_definition_id");

-- CreateIndex
CREATE INDEX "financial_metrics_clinic_id_date_idx" ON "financial_metrics"("clinic_id", "date");

-- CreateIndex
CREATE INDEX "financial_metrics_provider_id_idx" ON "financial_metrics"("provider_id");

-- CreateIndex
CREATE INDEX "financial_metrics_metric_type_date_idx" ON "financial_metrics"("metric_type", "date");

-- CreateIndex
CREATE INDEX "appointment_metrics_clinic_id_date_idx" ON "appointment_metrics"("clinic_id", "date");

-- CreateIndex
CREATE INDEX "appointment_metrics_provider_id_idx" ON "appointment_metrics"("provider_id");

-- CreateIndex
CREATE INDEX "call_metrics_clinic_id_date_idx" ON "call_metrics"("clinic_id", "date");

-- CreateIndex
CREATE INDEX "call_metrics_staff_member_id_idx" ON "call_metrics"("staff_member_id");

-- CreateIndex
CREATE INDEX "patient_metrics_clinic_id_date_idx" ON "patient_metrics"("clinic_id", "date");

-- CreateIndex
CREATE INDEX "metric_aggregations_clinic_id_period_start_idx" ON "metric_aggregations"("clinic_id", "period_start");

-- CreateIndex
CREATE INDEX "metric_aggregations_metric_definition_id_idx" ON "metric_aggregations"("metric_definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "metric_aggregations_clinic_id_metric_definition_id_aggregat_key" ON "metric_aggregations"("clinic_id", "metric_definition_id", "aggregation_type", "period_start", "provider_id");

-- CreateIndex
CREATE INDEX "google_credentials_clinic_id_idx" ON "google_credentials"("clinic_id");

-- CreateIndex
CREATE INDEX "google_credentials_user_id_idx" ON "google_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_credentials_clinic_id_user_id_key" ON "google_credentials"("clinic_id", "user_id");

-- CreateIndex
CREATE INDEX "spreadsheet_connections_clinic_id_idx" ON "spreadsheet_connections"("clinic_id");

-- CreateIndex
CREATE INDEX "spreadsheet_connections_credential_id_idx" ON "spreadsheet_connections"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "spreadsheet_connections_clinic_id_spreadsheet_id_key" ON "spreadsheet_connections"("clinic_id", "spreadsheet_id");

-- CreateIndex
CREATE INDEX "column_mappings_v2_connection_id_idx" ON "column_mappings_v2"("connection_id");
