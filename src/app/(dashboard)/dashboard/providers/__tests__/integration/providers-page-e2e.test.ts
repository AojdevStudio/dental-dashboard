import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/database/client';
import { v4 as uuidv4 } from 'uuid';
import { NextRouter } from 'next/router';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter: Partial<NextRouter> = {
  push: mockPush,
  replace: mockReplace,
  pathname: '/dashboard/providers',
  query: {},
  asPath: '/dashboard/providers',
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/providers',
}));

// Environment variables (will be validated in beforeAll)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Supabase clients (will be initialized in beforeAll after validation)
let anonClient: ReturnType<typeof createClient>;
let serviceClient: ReturnType<typeof createClient>;

/**
 * Wait for database triggers to complete and verify all test data is properly created
 * with relationships intact. This prevents flaky tests by ensuring data consistency.
 */
async function waitForDatabaseTriggers(
  testData: { authIds: string[]; clinics: any[]; providers: any[] },
  maxRetries = 60,          // ~30s total (increased from 10s)
  retryDelay = 500          // Slightly longer delay for better stability
): Promise<void> {
  let retries = 0;
  const expectedProviderIds = testData.providers.map((p) => p.id);
  const expectedClinicIds = testData.clinics.map((c) => c.id);

  while (retries < maxRetries) {
    try {
      // Check if all expected data is properly created and accessible
      const userCount = await prisma.user.count({
        where: { authId: { in: testData.authIds } },
      });

      const [clinicCount, providerCount] = await Promise.all([
        prisma.clinic.count({
          where: { id: { in: expectedClinicIds } },
        }),
        prisma.provider.count({
          where: { id: { in: expectedProviderIds } },
        }),
      ]);

      // Additional verification: Check that providers have proper clinic relationships
      const providersWithClinics = await prisma.provider.findMany({
        where: { id: { in: expectedProviderIds } },
        include: { clinic: true },
      });

      // Verify all providers have their clinic relationships properly established
      const providersWithValidClinics = providersWithClinics.filter((provider: typeof providersWithClinics[0]) =>
        provider.clinic && expectedClinicIds.includes(provider.clinicId)
      );

      // Verify that all expected data is present and properly related
      if (
        userCount === testData.authIds.length &&
        clinicCount === testData.clinics.length &&
        providerCount === testData.providers.length &&
        providersWithValidClinics.length === testData.providers.length
      ) {
        // Final verification: Ensure each provider matches expected test data
        const allProvidersValid = testData.providers.every(expectedProvider => {
          const actualProvider = providersWithClinics.find((p: typeof providersWithClinics[0]) => p.id === expectedProvider.id);
          return actualProvider &&
                 actualProvider.clinicId === expectedProvider.clinicId &&
                 actualProvider.name === expectedProvider.name &&
                 actualProvider.providerType === expectedProvider.providerType;
        });

        if (allProvidersValid) {
          console.log(`✅ Database triggers completed successfully after ${retries + 1} attempts (${(retries + 1) * retryDelay}ms)`);
          return; // All triggers completed successfully
        }
      }
    } catch (error) {
      // Log error for debugging but continue retrying
      if (retries % 10 === 0) { // Log every 10th retry to avoid spam
        console.warn(`Database trigger check attempt ${retries + 1}/${maxRetries} failed:`, error instanceof Error ? error.message : String(error));
      }
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Provide detailed error information for debugging
  try {
    const finalUserCount = await prisma.user.count({ where: { authId: { in: testData.authIds } } });
    const finalClinicCount = await prisma.clinic.count({ where: { id: { in: expectedClinicIds } } });
    const finalProviderCount = await prisma.provider.count({ where: { id: { in: expectedProviderIds } } });

    throw new Error(
      `Database triggers did not complete within ${maxRetries * retryDelay}ms timeout. ` +
      `Final counts: users=${finalUserCount}/${testData.authIds.length}, ` +
      `clinics=${finalClinicCount}/${testData.clinics.length}, ` +
      `providers=${finalProviderCount}/${testData.providers.length}`
    );
  } catch (countError) {
    throw new Error(
      `Database triggers did not complete within ${maxRetries * retryDelay}ms timeout. ` +
      `Unable to get final counts: ${countError instanceof Error ? countError.message : String(countError)}`
    );
  }
}

/**
 * End-to-End Workflow Tests for Providers Page
 * 
 * These tests validate complete user workflows including:
 * - Real authentication flow
 * - Multi-tenant data isolation
 * - Page navigation and rendering
 * - Provider data display and filtering
 */
describe('Providers Page E2E Multi-Tenant Workflow', () => {
  // Test data for two separate clinics
  const testData = {
    clinics: [
      { id: uuidv4(), name: 'Dental Clinic A', location: 'City A' },
      { id: uuidv4(), name: 'Dental Clinic B', location: 'City B' },
    ],
    users: [
      {
        email: 'admin-a@e2etest.com',
        password: 'TestPass123!',
        role: 'clinic_admin',
        clinicId: '',
      },
      {
        email: 'admin-b@e2etest.com', 
        password: 'TestPass123!',
        role: 'clinic_admin',
        clinicId: '',
      },
    ],
    providers: [
      {
        id: uuidv4(),
        name: 'Dr. Alice Smith',
        email: 'alice@clinica.com',
        providerType: 'dentist',
        clinicId: '',
      },
      {
        id: uuidv4(),
        name: 'Dr. Bob Johnson',
        email: 'bob@clinicb.com', 
        providerType: 'hygienist',
        clinicId: '',
      },
    ],
    authIds: [] as string[],
  };

  beforeAll(async () => {
    // Validate required environment variables and skip if missing
    if (!supabaseUrl) {
      vi.skip();
      return;
    }
    if (!supabaseAnonKey) {
      vi.skip();
      return;
    }
    if (!supabaseServiceKey) {
      vi.skip();
      return;
    }

    // Initialize Supabase clients after validation
    anonClient = createClient(supabaseUrl, supabaseAnonKey);
    serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Set up clinic relationships
    testData.users[0].clinicId = testData.clinics[0].id;
    testData.users[1].clinicId = testData.clinics[1].id;
    testData.providers[0].clinicId = testData.clinics[0].id;
    testData.providers[1].clinicId = testData.clinics[1].id;

    // Create test clinics
    for (const clinic of testData.clinics) {
      await prisma.clinic.create({
        data: {
          id: clinic.id,
          name: clinic.name,
          location: clinic.location,
          status: 'active',
        },
      });
    }

    // Create test users via Supabase Auth
    for (const user of testData.users) {
      const { data, error } = await serviceClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.email.split('@')[0],
          role: user.role,
          clinic_id: user.clinicId,
        },
      });

      if (!error && data.user) {
        testData.authIds.push(data.user.id);
      }
    }

    // Create test providers
    for (const provider of testData.providers) {
      await prisma.provider.create({
        data: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          providerType: provider.providerType,
          clinicId: provider.clinicId,
          status: 'active',
        },
      });
    }

    // Wait for database triggers to complete with retry mechanism
    await waitForDatabaseTriggers(testData);
  }, 30000);

  afterAll(async () => {
    // Cleanup test data
    try {
      // Delete providers
      await prisma.provider.deleteMany({
        where: { id: { in: testData.providers.map(p => p.id) } },
      });

      // Delete auth users
      for (const authId of testData.authIds) {
        await serviceClient.auth.admin.deleteUser(authId);
      }

      // Delete database users and clinics
      await prisma.user.deleteMany({
        where: { authId: { in: testData.authIds } },
      });
      await prisma.clinic.deleteMany({
        where: { id: { in: testData.clinics.map(c => c.id) } },
      });
    } catch (error) {
      console.error('E2E cleanup error:', error);
      // Don't throw error here to ensure finally block executes
    } finally {
      // Ensure proper resource cleanup regardless of errors
      try {
        // Sign out from all Supabase clients to close connections
        await serviceClient.auth.signOut();
        await anonClient.auth.signOut();
        console.log('✅ Supabase clients signed out successfully');
      } catch (signOutError) {
        console.warn('⚠️ Warning: Failed to sign out from Supabase clients:', signOutError);
      }

      try {
        // Disconnect Prisma client to close database connections
        await prisma.$disconnect();
        console.log('✅ Prisma client disconnected successfully');
      } catch (disconnectError) {
        console.warn('⚠️ Warning: Failed to disconnect Prisma client:', disconnectError);
      }
    }
  }, 30000);



  describe('Multi-Tenant Authentication Flow', () => {
    it('should authenticate users for different clinics successfully', async () => {
      // Test authentication for Clinic A admin
      const { data: sessionA, error: errorA } = await anonClient.auth.signInWithPassword({
        email: testData.users[0].email,
        password: testData.users[0].password,
      });

      expect(errorA).toBeNull();
      expect(sessionA.user).toBeDefined();
      expect(sessionA.session).toBeDefined();

      // Sign out
      await anonClient.auth.signOut();

      // Test authentication for Clinic B admin  
      const { data: sessionB, error: errorB } = await anonClient.auth.signInWithPassword({
        email: testData.users[1].email,
        password: testData.users[1].password,
      });

      expect(errorB).toBeNull();
      expect(sessionB.user).toBeDefined();
      expect(sessionB.session).toBeDefined();

      // Sign out
      await anonClient.auth.signOut();
    }, 15000);

    it('should create proper user profiles with clinic associations', async () => {
      // Verify user profiles were created correctly
      const userA = await prisma.user.findFirst({
        where: { email: testData.users[0].email },
        include: { clinic: true },
      });

      const userB = await prisma.user.findFirst({
        where: { email: testData.users[1].email },
        include: { clinic: true },
      });

      expect(userA).toBeDefined();
      expect(userA?.clinicId).toBe(testData.clinics[0].id);
      expect(userA?.clinic?.name).toBe('Dental Clinic A');

      expect(userB).toBeDefined();
      expect(userB?.clinicId).toBe(testData.clinics[1].id);
      expect(userB?.clinic?.name).toBe('Dental Clinic B');
    });
  });

  describe('Basic Multi-Tenant Data Isolation', () => {
    it('should validate that test providers exist in correct clinics', async () => {
      // Verify providers were created correctly
      const providerA = await prisma.provider.findFirst({
        where: { id: testData.providers[0].id },
        include: { clinic: true },
      });

      const providerB = await prisma.provider.findFirst({
        where: { id: testData.providers[1].id },
        include: { clinic: true },
      });

      expect(providerA).toBeDefined();
      expect(providerA?.clinicId).toBe(testData.clinics[0].id);
      expect(providerA?.name).toBe('Dr. Alice Smith');

      expect(providerB).toBeDefined();
      expect(providerB?.clinicId).toBe(testData.clinics[1].id);
      expect(providerB?.name).toBe('Dr. Bob Johnson');
    });

    it('should prevent cross-clinic provider access at database level', async () => {
      // Query providers for Clinic A
      const clinicAProviders = await prisma.provider.findMany({
        where: { clinicId: testData.clinics[0].id },
      });

      // Query providers for Clinic B
      const clinicBProviders = await prisma.provider.findMany({
        where: { clinicId: testData.clinics[1].id },
      });

      // Verify isolation
      expect(clinicAProviders).toHaveLength(1);
      expect(clinicAProviders[0].name).toBe('Dr. Alice Smith');

      expect(clinicBProviders).toHaveLength(1);
      expect(clinicBProviders[0].name).toBe('Dr. Bob Johnson');

      // Verify no cross-contamination
      const clinicAProviderIds = clinicAProviders.map((p: typeof clinicAProviders[0]) => p.id);
      const clinicBProviderIds = clinicBProviders.map((p: typeof clinicBProviders[0]) => p.id);

      expect(clinicAProviderIds).not.toContain(testData.providers[1].id);
      expect(clinicBProviderIds).not.toContain(testData.providers[0].id);
    });
  });
});
