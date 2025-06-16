// Simple verification script for multi-tenant tables
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMultiTenantTables() {
  try {
    // Verify table existence by attempting to count records
    const tables = [
      { name: 'UserClinicRole', model: prisma.userClinicRole },
      { name: 'GoalTemplate', model: prisma.goalTemplate },
      { name: 'FinancialMetric', model: prisma.financialMetric },
      { name: 'AppointmentMetric', model: prisma.appointmentMetric },
      { name: 'CallMetric', model: prisma.callMetric },
      { name: 'PatientMetric', model: prisma.patientMetric },
      { name: 'MetricAggregation', model: prisma.metricAggregation },
      { name: 'GoogleCredential', model: prisma.googleCredential },
      { name: 'SpreadsheetConnection', model: prisma.spreadsheetConnection },
      { name: 'ColumnMappingV2', model: prisma.columnMappingV2 },
    ];

    for (const { name, model } of tables) {
      const _count = await (model as any).count();
      console.log(`${name}: ${_count} records`);
    }
  } catch (_error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMultiTenantTables();
