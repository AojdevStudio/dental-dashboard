import { PrismaClient } from "../src/generated/prisma";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function populateUUIDs() {
  console.log("🔄 Starting UUID population for Phase 2...\n");

  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Populate UUIDs for Users
      console.log("📝 Populating UUIDs for Users...");
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
            tableName: "users",
            oldId: user.id,
            newId: uuid,
          },
        });
      }
      console.log(`✅ Updated ${users.length} users with UUIDs`);

      // 2. Populate UUIDs for Clinics
      console.log("\n📝 Populating UUIDs for Clinics...");
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
            tableName: "clinics",
            oldId: clinic.id,
            newId: uuid,
          },
        });
      }
      console.log(`✅ Updated ${clinics.length} clinics with UUIDs`);

      // 3. Populate UUIDs for Dashboards
      console.log("\n📝 Populating UUIDs for Dashboards...");
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
              tableName: "users",
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
            tableName: "dashboards",
            oldId: dashboard.id,
            newId: uuid,
          },
        });
      }
      console.log(`✅ Updated ${dashboards.length} dashboards with UUIDs`);

      // 4. Verify mappings
      console.log("\n📊 Verification:");
      const mappingCounts = await tx.idMapping.groupBy({
        by: ["tableName"],
        _count: true,
      });

      mappingCounts.forEach(({ tableName, _count }) => {
        console.log(`   - ${tableName}: ${_count} mappings created`);
      });
    });

    console.log("\n✨ UUID population completed successfully!");

    // Display sample mappings
    console.log("\n📋 Sample ID mappings:");
    const sampleMappings = await prisma.idMapping.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    sampleMappings.forEach((mapping) => {
      console.log(`   ${mapping.tableName}: ${mapping.oldId} → ${mapping.newId}`);
    });
  } catch (error) {
    console.error("❌ Error populating UUIDs:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if there's existing data
async function checkExistingData() {
  const userCount = await prisma.user.count();
  const clinicCount = await prisma.clinic.count();
  const dashboardCount = await prisma.dashboard.count();

  console.log("📈 Current data status:");
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Clinics: ${clinicCount}`);
  console.log(`   - Dashboards: ${dashboardCount}`);

  if (userCount === 0 && clinicCount === 0) {
    console.log("\n⚠️  No existing data found. Creating sample data for testing...");

    // Create sample clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: "Sample Dental Clinic",
        location: "New York, NY",
        status: "active",
      },
    });

    // Create sample user
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        clinicId: clinic.id,
      },
    });

    // Create sample dashboard
    await prisma.dashboard.create({
      data: {
        name: "Main Dashboard",
        isDefault: true,
        userId: user.id,
      },
    });

    console.log("✅ Sample data created");
  }
}

// Run the migration
async function main() {
  console.log("====================================");
  console.log("Phase 2: UUID Population Script");
  console.log("====================================\n");

  await checkExistingData();
  console.log("\n");
  await populateUUIDs();
}

main().catch(console.error);
