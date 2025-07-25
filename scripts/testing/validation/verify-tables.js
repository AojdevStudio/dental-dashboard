import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMultiTenantTables() {
  try {
    // Verify table existence by attempting to count records
    const tables = [
      { name: 'UserClinicRole', model: prisma.userClinicRole },
      { name: 'GoalTemplate', model: prisma.goalTemplate },
      { name: 'FinancialMetric', model: prisma.financialMetric },
      // biome-ignore lint/nursery/noSecrets: False positive - this is a table name
      { name: 'AppointmentMetric', model: prisma.appointmentMetric },
      { name: 'CallMetric', model: prisma.callMetric },
      { name: 'PatientMetric', model: prisma.patientMetric },
      // biome-ignore lint/nursery/noSecrets: False positive - this is a table name
      { name: 'MetricAggregation', model: prisma.metricAggregation },
      { name: 'GoogleCredential', model: prisma.googleCredential },
      // biome-ignore lint/nursery/noSecrets: False positive - this is a table name
      { name: 'SpreadsheetConnection', model: prisma.spreadsheetConnection },
      { name: 'ColumnMappingV2', model: prisma.columnMappingV2 },
    ];

    for (const { model } of tables) {
      const _count = await model.count();
    }
  } catch (_error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMultiTenantTables();
