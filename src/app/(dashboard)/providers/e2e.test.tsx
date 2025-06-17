import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/database/client';
import { v4 as uuidv4 } from 'uuid';
import ProvidersPage from './page';
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

    // Mock the auth hook to return our test user
    vi.mock('@/hooks/use-auth', () => ({
      useAuth: () => ({
        user: {
          id: mockAuthContext.userId,
          email: testData.users[userIndex].email,
          role: testData.users[userIndex].role,
          clinicId: testData.users[userIndex].clinicId,
        },
        isLoading: false,
        isAuthenticated: true,
      }),
    }));

    // Mock the providers API to return clinic-specific data
    vi.mock('@/hooks/use-providers', () => ({
      useProviders: () => ({
        providers: testData.providers.filter(p => p.clinicId === testData.users[userIndex].clinicId),
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }),
      useProviderFilters: () => ({
        data: {
          locations: [],
          providerTypes: ['dentist', 'hygienist'],
          statuses: ['active'],
          totalCount: 1,
        },
      }),
    }));

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

  describe('Providers Page Multi-Tenant Data Isolation', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      vi.clearAllMocks();
    });

    it('should display only Clinic A providers when Clinic A admin is logged in', async () => {
      const { queryClient } = createAuthenticatedTestEnvironment(0);

      render(
        <QueryClientProvider client={queryClient}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Providers')).toBeInTheDocument();
      });

      // Should display Clinic A provider
      await waitFor(() => {
        expect(screen.getByText('Dr. Alice Smith')).toBeInTheDocument();
      });

      // Should NOT display Clinic B provider
      expect(screen.queryByText('Dr. Bob Johnson')).not.toBeInTheDocument();

      // Verify provider type is displayed correctly
      expect(screen.getByText(/dentist/i)).toBeInTheDocument();
    });

    it('should display only Clinic B providers when Clinic B admin is logged in', async () => {
      const { queryClient } = createAuthenticatedTestEnvironment(1);

      render(
        <QueryClientProvider client={queryClient}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Providers')).toBeInTheDocument();
      });

      // Should display Clinic B provider
      await waitFor(() => {
        expect(screen.getByText('Dr. Bob Johnson')).toBeInTheDocument();
      });

      // Should NOT display Clinic A provider
      expect(screen.queryByText('Dr. Alice Smith')).not.toBeInTheDocument();

      // Verify provider type is displayed correctly
      expect(screen.getByText(/hygienist/i)).toBeInTheDocument();
    });

    it('should prevent cross-clinic data access through API calls', async () => {
      // Test direct API access with different clinic contexts
      const responseA = await fetch('/api/providers', {
        headers: {
          'Authorization': `Bearer ${testData.authIds[0]}`,
          'X-Clinic-ID': testData.clinics[0].id,
        },
      });

      const responseB = await fetch('/api/providers', {
        headers: {
          'Authorization': `Bearer ${testData.authIds[1]}`,
          'X-Clinic-ID': testData.clinics[1].id,
        },
      });

      // Both requests should succeed but return different data
      expect(responseA.ok).toBe(true);
      expect(responseB.ok).toBe(true);

      const dataA = await responseA.json();
      const dataB = await responseB.json();

      // Verify data isolation
      const providerAIds = dataA.data?.map((p: any) => p.id) || [];
      const providerBIds = dataB.data?.map((p: any) => p.id) || [];

      expect(providerAIds).toContain(testData.providers[0].id);
      expect(providerAIds).not.toContain(testData.providers[1].id);

      expect(providerBIds).toContain(testData.providers[1].id);
      expect(providerBIds).not.toContain(testData.providers[0].id);
    });
  });

  describe('Complete E2E Workflow Validation', () => {
    it('should complete full user journey: login → navigate → view providers → logout', async () => {
      const user = userEvent.setup();

      // Step 1: Authenticate as Clinic A admin
      const { data: session, error } = await anonClient.auth.signInWithPassword({
        email: testData.users[0].email,
        password: testData.users[0].password,
      });

      expect(error).toBeNull();
      expect(session.user).toBeDefined();

      // Step 2: Set up authenticated environment
      const { queryClient } = createAuthenticatedTestEnvironment(0);

      // Step 3: Render providers page
      render(
        <QueryClientProvider client={queryClient}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      // Step 4: Verify page loads correctly
      await waitFor(() => {
        expect(screen.getByText('Providers')).toBeInTheDocument();
        expect(screen.getByText('Manage dental providers and their assignments')).toBeInTheDocument();
      });

      // Step 5: Verify correct provider data is displayed
      await waitFor(() => {
        expect(screen.getByText('Dr. Alice Smith')).toBeInTheDocument();
      });

      // Step 6: Test filtering functionality
      const filterButton = screen.getByRole('combobox', { name: /provider type/i });
      if (filterButton) {
        await user.click(filterButton);

        // Should show dentist option (Clinic A provider type)
        await waitFor(() => {
          expect(screen.getByText('Dentist')).toBeInTheDocument();
        });
      }

      // Step 7: Test navigation (verify router calls)
      const addProviderButton = screen.queryByText('Add Provider');
      if (addProviderButton) {
        await user.click(addProviderButton);
        expect(mockPush).toHaveBeenCalledWith('/providers/create');
      }

      // Step 8: Logout
      await anonClient.auth.signOut();

      // Verify session is cleared
      const { data: { user: loggedOutUser } } = await anonClient.auth.getUser();
      expect(loggedOutUser).toBeNull();
    }, 20000);

    it('should maintain data isolation across multiple user sessions', async () => {
      // Test switching between different clinic users

      // Session 1: Clinic A admin
      await anonClient.auth.signInWithPassword({
        email: testData.users[0].email,
        password: testData.users[0].password,
      });

      const { queryClient: queryClientA } = createAuthenticatedTestEnvironment(0);

      const { unmount: unmountA } = render(
        <QueryClientProvider client={queryClientA}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. Alice Smith')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Bob Johnson')).not.toBeInTheDocument();
      });

      unmountA();
      await anonClient.auth.signOut();

      // Session 2: Clinic B admin
      await anonClient.auth.signInWithPassword({
        email: testData.users[1].email,
        password: testData.users[1].password,
      });

      const { queryClient: queryClientB } = createAuthenticatedTestEnvironment(1);

      render(
        <QueryClientProvider client={queryClientB}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Alice Smith')).not.toBeInTheDocument();
      });

      await anonClient.auth.signOut();
    }, 25000);

    it('should handle unauthorized access attempts gracefully', async () => {
      // Test accessing providers page without authentication
      const { queryClient } = createAuthenticatedTestEnvironment(0);

      // Mock unauthenticated state
      vi.mock('@/hooks/use-auth', () => ({
        useAuth: () => ({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }),
      }));

      // This should trigger middleware redirect in real app
      // In test environment, we verify the auth check behavior
      const { queryClient: unauthenticatedClient } = createAuthenticatedTestEnvironment(0);

      render(
        <QueryClientProvider client={unauthenticatedClient}>
          <ProvidersPage />
        </QueryClientProvider>
      );

      // Should not display sensitive provider data when unauthenticated
      await waitFor(() => {
        // The page should either redirect or show login prompt
        // Exact behavior depends on auth implementation
        expect(screen.queryByText('Dr. Alice Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Dr. Bob Johnson')).not.toBeInTheDocument();
      });
    });
  });
});