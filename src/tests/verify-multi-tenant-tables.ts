// Simple verification script for multi-tenant tables
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function verifyMultiTenantTables() {
  console.log("🔍 Verifying multi-tenant tables...\n");

  try {
    // Verify table existence by attempting to count records
    const tables = [
      { name: "UserClinicRole", model: prisma.userClinicRole },
      { name: "GoalTemplate", model: prisma.goalTemplate },
      { name: "FinancialMetric", model: prisma.financialMetric },
      { name: "AppointmentMetric", model: prisma.appointmentMetric },
      { name: "CallMetric", model: prisma.callMetric },
      { name: "PatientMetric", model: prisma.patientMetric },
      { name: "MetricAggregation", model: prisma.metricAggregation },
      { name: "GoogleCredential", model: prisma.googleCredential },
      { name: "SpreadsheetConnection", model: prisma.spreadsheetConnection },
      { name: "ColumnMappingV2", model: prisma.columnMappingV2 },
    ];

    for (const { name, model } of tables) {
      try {
        const count = await model.count();
        console.log(`✅ ${name}: Table exists (${count} records)`);
      } catch (error) {
        console.log(`❌ ${name}: Table verification failed`);
        throw error;
      }
    }

    console.log("\n✨ All multi-tenant tables verified successfully!");
    console.log("📋 Phase 1 migration completed successfully.");
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMultiTenantTables();
