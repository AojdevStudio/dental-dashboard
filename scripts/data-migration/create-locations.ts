import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

async function createInitialLocations() {
  console.log('🏥 Creating initial location records...');

  try {
    // Get the two clinics
    const humbleClinic = await prisma.clinic.findFirst({
      where: { name: 'KamDental Humble' },
    });

    const baytownClinic = await prisma.clinic.findFirst({
      where: { name: 'KamDental Baytown' },
    });

    if (!humbleClinic || !baytownClinic) {
      throw new Error('Required clinics not found. Please run the main seed script first.');
    }

    // Create Humble location
    const humbleLocation = await prisma.location.upsert({
      where: {
        clinicId_name: {
          clinicId: humbleClinic.id,
          name: 'Humble',
        },
      },
      update: {
        address: 'Humble, TX',
        isActive: true,
      },
      create: {
        clinicId: humbleClinic.id,
        name: 'Humble',
        address: 'Humble, TX',
        isActive: true,
      },
    });

    // Create Baytown location
    const baytownLocation = await prisma.location.upsert({
      where: {
        clinicId_name: {
          clinicId: baytownClinic.id,
          name: 'Baytown',
        },
      },
      update: {
        address: 'Baytown, TX',
        isActive: true,
      },
      create: {
        clinicId: baytownClinic.id,
        name: 'Baytown',
        address: 'Baytown, TX',
        isActive: true,
      },
    });

    console.log('✅ Created locations:');
    console.log(`  - ${humbleLocation.name} (${humbleLocation.id})`);
    console.log(`  - ${baytownLocation.name} (${baytownLocation.id})`);

    // Now create provider-location relationships
    console.log('🔗 Creating provider-location relationships...');

    const providers = await prisma.provider.findMany({
      include: { clinic: true },
    });

    for (const provider of providers) {
      // Determine which location(s) this provider works at
      const locations: { id: string; name: string; isPrimary: boolean }[] = [];

      if (provider.clinic.name === 'KamDental Humble') {
        locations.push({ id: humbleLocation.id, name: 'Humble', isPrimary: true });

        // Dr. Kamdi Irondi works at both locations (primary at Humble)
        if (provider.name === 'Kamdi Irondi') {
          locations.push({ id: baytownLocation.id, name: 'Baytown', isPrimary: false });
        }
      } else if (provider.clinic.name === 'KamDental Baytown') {
        locations.push({ id: baytownLocation.id, name: 'Baytown', isPrimary: true });
      }

      // Create provider-location relationships
      for (const location of locations) {
        const providerLocation = await prisma.providerLocation.upsert({
          where: {
            providerId_locationId: {
              providerId: provider.id,
              locationId: location.id,
            },
          },
          update: {
            isPrimary: location.isPrimary,
            isActive: true,
          },
          create: {
            providerId: provider.id,
            locationId: location.id,
            isPrimary: location.isPrimary,
            isActive: true,
            startDate: new Date('2024-01-01'), // Assume all started at beginning of year
          },
        });

        console.log(
          `  ✅ ${provider.name} ↔ ${location.name} ${location.isPrimary ? '(Primary)' : ''}`
        );
      }
    }

    console.log('🎉 Location setup completed successfully!');

    return {
      humbleLocation,
      baytownLocation,
      providersProcessed: providers.length,
    };
  } catch (error) {
    console.error('❌ Error creating locations:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await createInitialLocations();
    console.log('\n📊 Summary:');
    console.log(`  - Locations created: 2`);
    console.log(`  - Providers processed: ${result.providersProcessed}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main();

export { createInitialLocations };
