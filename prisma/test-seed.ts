/**
 * Test Database Seeding Script
 *
 * Seeds the cloud test database with minimal data required for E2E tests.
 * This is separate from the production seed file and designed specifically
 * for the test environment.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test environment validation
function validateTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL;
  const _nodeEnv = process.env.NODE_ENV;

  // Ensure we're running against the test database
  const isTestDB = dbUrl?.includes('bxnkocxoacakljbcnulv'); // Test Supabase project ID

  if (!isTestDB) {
    throw new Error(
      '❌ Test seed script can only run against test database (bxnkocxoacakljbcnulv)!'
    );
  }
}

// Test data factories
const testData = {
  clinic: {
    id: 'test-clinic-id-123',
    name: 'Test Clinic',
    location: 'Test Location, TX',
    status: 'active' as const,
    registrationCode: 'TEST-CLINIC-E2E',
  },

  adminUser: {
    id: 'test-admin-user-id',
    email: 'admin@kamdental.com',
    name: 'Test Admin User',
    authId: 'test-auth-id-admin-123',
  },

  providers: [
    {
      id: 'test-provider-1',
      name: 'Dr. Jane Smith',
      email: 'dr.smith@test.com',
      type: 'dentist' as const,
      status: 'active' as const,
    },
    {
      id: 'test-provider-2',
      name: 'Dr. John Doe',
      email: 'dr.doe@test.com',
      type: 'dentist' as const,
      status: 'active' as const,
    },
    {
      id: 'test-provider-3',
      name: 'Sarah Johnson, RDH',
      email: 'sarah.j@test.com',
      type: 'hygienist' as const,
      status: 'active' as const,
    },
  ],
};

async function seedTestClinic() {
  const clinic = await prisma.clinic.upsert({
    where: { id: testData.clinic.id },
    update: testData.clinic,
    create: testData.clinic,
  });
  return clinic;
}

async function seedTestAdminUser() {
  const user = await prisma.user.upsert({
    where: { id: testData.adminUser.id },
    update: {
      email: testData.adminUser.email,
      name: testData.adminUser.name,
    },
    create: testData.adminUser,
  });
  return user;
}

async function seedTestUserClinicRole(userId: string, clinicId: string) {
  const role = await prisma.userClinicRole.upsert({
    where: {
      userId_clinicId: {
        userId,
        clinicId,
      },
    },
    update: {
      role: 'admin',
    },
    create: {
      userId,
      clinicId,
      role: 'admin',
    },
  });
  return role;
}

async function seedTestProviders(clinicId: string) {
  const providers: { id: string }[] = [];

  for (const providerData of testData.providers) {
    const provider = await prisma.provider.upsert({
      where: { id: providerData.id },
      update: {
        ...providerData,
        clinicId,
      },
      create: {
        ...providerData,
        clinicId,
      },
    });

    providers.push(provider);
  }

  return providers;
}

async function seedTestMetrics(providers: { id: string }[]) {
  // Create some basic metrics for testing
  for (const provider of providers) {
    await prisma.providerMetric.upsert({
      where: {
        providerId_date: {
          providerId: provider.id,
          date: new Date('2024-01-01'),
        },
      },
      update: {},
      create: {
        providerId: provider.id,
        date: new Date('2024-01-01'),
        production: 5000,
        collection: 4500,
        adjustments: 200,
        newPatients: 15,
        activePatients: 120,
        appointmentsScheduled: 45,
        appointmentsCompleted: 42,
        appointmentsNoShow: 3,
      },
    });
  }
}

async function cleanupExistingTestData() {
  try {
    // Delete in reverse dependency order
    await prisma.providerMetric.deleteMany({
      where: {
        provider: {
          clinicId: testData.clinic.id,
        },
      },
    });

    await prisma.provider.deleteMany({
      where: { clinicId: testData.clinic.id },
    });

    await prisma.userClinicRole.deleteMany({
      where: { clinicId: testData.clinic.id },
    });

    await prisma.user.deleteMany({
      where: { email: testData.adminUser.email },
    });

    await prisma.clinic.deleteMany({
      where: { id: testData.clinic.id },
    });
  } catch (_error) {}
}

async function main() {
  try {
    // Validate environment
    validateTestEnvironment();

    // Clean up existing test data first
    await cleanupExistingTestData();

    // Seed core data
    const clinic = await seedTestClinic();
    const adminUser = await seedTestAdminUser();
    await seedTestUserClinicRole(adminUser.id, clinic.id);
    const providers = await seedTestProviders(clinic.id);
    await seedTestMetrics(providers);
  } catch (error) {
    console.error('❌ Test seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('💥 Fatal error during test seeding:', e);
    process.exit(1);
  });
}

export { main as seedTestDatabase, testData };
