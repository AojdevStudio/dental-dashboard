import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateUUIDs() {
  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { uuidId: null },
      });

      for (const user of users) {
        const uuid = randomUUID();
        await tx.user.update({
          where: { id: user.id },
          data: { uuidId: uuid },
        });

        // Create ID mapping
        await tx.idMapping.create({
          data: {
            tableName: 'users',
            oldId: user.id,
            newId: uuid,
          },
        });
      }
      const clinics = await tx.clinic.findMany({
        where: { uuidId: null },
      });

      for (const clinic of clinics) {
        const uuid = randomUUID();
        await tx.clinic.update({
          where: { id: clinic.id },
          data: { uuidId: uuid },
        });

        // Create ID mapping
        await tx.idMapping.create({
          data: {
            tableName: 'clinics',
            oldId: clinic.id,
            newId: uuid,
          },
        });
      }
      const dashboards = await tx.dashboard.findMany({
        where: { uuidId: null },
        include: { user: true },
      });

      for (const dashboard of dashboards) {
        const uuid = randomUUID();

        // Get user's UUID from mapping
        const userMapping = await tx.idMapping.findUnique({
          where: {
            tableName_oldId: {
              tableName: 'users',
              oldId: dashboard.userId,
            },
          },
        });

        await tx.dashboard.update({
          where: { id: dashboard.id },
          data: {
            uuidId: uuid,
            userUuidId: userMapping?.newId || null,
          },
        });

        // Create ID mapping
        await tx.idMapping.create({
          data: {
            tableName: 'dashboards',
            oldId: dashboard.id,
            newId: uuid,
          },
        });
      }
      const _mappingCounts = await tx.idMapping.groupBy({
        by: ['tableName'],
        _count: true,
      });

      // mappingCounts contains the count of UUID mappings per table
    });
    const _sampleMappings = await prisma.idMapping.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Sample mappings retrieved for verification
  } finally {
    await prisma.$disconnect();
  }
}

// Check if there's existing data
async function checkExistingData() {
  const userCount = await prisma.user.count();
  const clinicCount = await prisma.clinic.count();
  const _dashboardCount = await prisma.dashboard.count();

  if (userCount === 0 && clinicCount === 0) {
    // Create sample clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: 'Sample Dental Clinic',
        location: 'New York, NY',
        status: 'active',
      },
    });

    // Create sample user
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        clinicId: clinic.id,
      },
    });

    // Create sample dashboard
    await prisma.dashboard.create({
      data: {
        name: 'Main Dashboard',
        isDefault: true,
        userId: user.id,
      },
    });
  }
}

// Run the migration
async function main() {
  await checkExistingData();
  await populateUUIDs();
}

main().catch(console.error);
