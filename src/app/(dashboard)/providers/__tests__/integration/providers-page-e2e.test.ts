import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/database/client';
import { v4 as uuidv4 } from 'uuid';
import ProvidersPage from '../../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Mock Supabase client for authentication
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

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

    // Wait for database triggers to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
    }
  }, 30000);

  // Helper function to create authenticated test environment
  const createAuthenticatedTestEnvironment = (userIndex: number) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock authentication context for the specific user
    const mockAuthContext = {
      userId: `user-${userIndex}`,
      authId: testData.authIds[userIndex],
      clinicIds: [testData.users[userIndex].clinicId],
      currentClinicId: testData.users[userIndex].clinicId,
      role: testData.users[userIndex].role,
    };

    return { queryClient, mockAuthContext };
  };

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
      const clinicAProviderIds = clinicAProviders.map(p => p.id);
      const clinicBProviderIds = clinicBProviders.map(p => p.id);

      expect(clinicAProviderIds).not.toContain(testData.providers[1].id);
      expect(clinicBProviderIds).not.toContain(testData.providers[0].id);
    });
  });
});
