import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LocationMapping {
  humble: string;
  baytown: string;
}

async function migrateHistoricalFinancialData() {
  // Get location mappings
  const [humbleLocation, baytownLocation] = await Promise.all([
    prisma.location.findFirst({
      where: { name: 'Humble' },
    }),
    prisma.location.findFirst({
      where: { name: 'Baytown' },
    }),
  ]);

  if (!(humbleLocation && baytownLocation)) {
    throw new Error('Locations not found. Please create locations first.');
  }

  const locationMapping: LocationMapping = {
    humble: humbleLocation.id,
    baytown: baytownLocation.id,
  };

  // Get all dentist production records that have location-specific data
  const dentistProduction = await prisma.dentistProduction.findMany({
    where: {
      OR: [
        { verifiedProductionHumble: { not: null } },
        { verifiedProductionBaytown: { not: null } },
      ],
    },
    include: {
      clinic: true,
      dataSource: true,
    },
    orderBy: { date: 'asc' },
  });

  let recordsCreated = 0;
  let recordsSkipped = 0;
  const errors: string[] = [];

  for (const record of dentistProduction) {
    try {
      const _recordDate = record.date.toISOString().split('T')[0];

      // Process Humble location data
      if (
        record.verifiedProductionHumble &&
        Number.parseFloat(record.verifiedProductionHumble.toString()) > 0
      ) {
        const existingHumble = await prisma.locationFinancial.findFirst({
          where: {
            clinicId: record.clinicId,
            locationId: locationMapping.humble,
            date: record.date,
          },
        });

        if (existingHumble) {
          recordsSkipped++;
        } else {
          await prisma.locationFinancial.create({
            data: {
              clinicId: record.clinicId,
              locationId: locationMapping.humble,
              date: record.date,
              production: record.verifiedProductionHumble,
              adjustments: 0, // Not available in legacy data
              writeOffs: 0, // Not available in legacy data
              netProduction: record.verifiedProductionHumble,
              patientIncome: 0, // Not available in legacy data
              insuranceIncome: 0, // Not available in legacy data
              totalCollections: 0, // Not available in legacy data
              dataSourceId: record.dataSourceId,
              createdBy: 'migration-script',
            },
          });
          recordsCreated++;
        }
      }

      // Process Baytown location data
      if (
        record.verifiedProductionBaytown &&
        Number.parseFloat(record.verifiedProductionBaytown.toString()) > 0
      ) {
        const existingBaytown = await prisma.locationFinancial.findFirst({
          where: {
            clinicId: record.clinicId,
            locationId: locationMapping.baytown,
            date: record.date,
          },
        });

        if (existingBaytown) {
          recordsSkipped++;
        } else {
          await prisma.locationFinancial.create({
            data: {
              clinicId: record.clinicId,
              locationId: locationMapping.baytown,
              date: record.date,
              production: record.verifiedProductionBaytown,
              adjustments: 0, // Not available in legacy data
              writeOffs: 0, // Not available in legacy data
              netProduction: record.verifiedProductionBaytown,
              patientIncome: 0, // Not available in legacy data
              insuranceIncome: 0, // Not available in legacy data
              totalCollections: 0, // Not available in legacy data
              dataSourceId: record.dataSourceId,
              createdBy: 'migration-script',
            },
          });
          recordsCreated++;
        }
      }
    } catch (error) {
      const errorMsg = `Failed to migrate record for ${record.date}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
    }
  }

  // Get summary statistics
  const locationFinancialCount = await prisma.locationFinancial.count();

  if (errors.length > 0) {
    errors.forEach((_error) => {});
  }
  const [_humbleCount, _baytownCount] = await Promise.all([
    prisma.locationFinancial.count({
      where: { locationId: locationMapping.humble },
    }),
    prisma.locationFinancial.count({
      where: { locationId: locationMapping.baytown },
    }),
  ]);

  // Sample some data for verification
  const sampleRecords = await prisma.locationFinancial.findMany({
    take: 5,
    include: {
      location: {
        select: { name: true },
      },
    },
    orderBy: { date: 'desc' },
  });
  sampleRecords.forEach((_record) => {});

  return {
    processed: dentistProduction.length,
    created: recordsCreated,
    skipped: recordsSkipped,
    errors: errors.length,
    total: locationFinancialCount,
  };
}

async function main() {
  try {
    const _result = await migrateHistoricalFinancialData();
  } catch (_error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main();

export { migrateHistoricalFinancialData };
