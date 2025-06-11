import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

interface LocationMapping {
  humble: string;
  baytown: string;
}

async function migrateHistoricalFinancialData() {
  console.log('📊 Migrating historical financial data from DentistProduction...');

  try {
    // Get location mappings
    const [humbleLocation, baytownLocation] = await Promise.all([
      prisma.location.findFirst({
        where: { name: 'Humble' },
      }),
      prisma.location.findFirst({
        where: { name: 'Baytown' },
      }),
    ]);

    if (!humbleLocation || !baytownLocation) {
      throw new Error('Locations not found. Please create locations first.');
    }

    const locationMapping: LocationMapping = {
      humble: humbleLocation.id,
      baytown: baytownLocation.id,
    };

    console.log('✅ Found locations:');
    console.log(`  - Humble: ${humbleLocation.id}`);
    console.log(`  - Baytown: ${baytownLocation.id}`);

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

    console.log(
      `📋 Found ${dentistProduction.length} dentist production records with location data`
    );

    let recordsCreated = 0;
    let recordsSkipped = 0;
    const errors: string[] = [];

    for (const record of dentistProduction) {
      try {
        const recordDate = record.date.toISOString().split('T')[0];

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
            console.log(`  ⏭️  Skipped Humble record for ${recordDate} (already exists)`);
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
            console.log(
              `  ✅ Created Humble record for ${recordDate}: $${record.verifiedProductionHumble}`
            );
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
            console.log(`  ⏭️  Skipped Baytown record for ${recordDate} (already exists)`);
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
            console.log(
              `  ✅ Created Baytown record for ${recordDate}: $${record.verifiedProductionBaytown}`
            );
          }
        }
      } catch (error) {
        const errorMsg = `Failed to migrate record for ${record.date}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }

    // Get summary statistics
    const locationFinancialCount = await prisma.locationFinancial.count();

    console.log('\n📊 Migration Summary:');
    console.log(`  - Records processed: ${dentistProduction.length}`);
    console.log(`  - Records created: ${recordsCreated}`);
    console.log(`  - Records skipped: ${recordsSkipped}`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Total LocationFinancial records: ${locationFinancialCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Validate migration
    console.log('\n🔍 Validating migration...');
    const [humbleCount, baytownCount] = await Promise.all([
      prisma.locationFinancial.count({
        where: { locationId: locationMapping.humble },
      }),
      prisma.locationFinancial.count({
        where: { locationId: locationMapping.baytown },
      }),
    ]);

    console.log(`  - Humble location records: ${humbleCount}`);
    console.log(`  - Baytown location records: ${baytownCount}`);

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

    console.log('\n📋 Sample migrated records:');
    sampleRecords.forEach((record) => {
      console.log(
        `  - ${record.location.name} ${record.date.toISOString().split('T')[0]}: $${record.production}`
      );
    });

    console.log('\n🎉 Historical data migration completed!');

    return {
      processed: dentistProduction.length,
      created: recordsCreated,
      skipped: recordsSkipped,
      errors: errors.length,
      total: locationFinancialCount,
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await migrateHistoricalFinancialData();
    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main();

export { migrateHistoricalFinancialData };
