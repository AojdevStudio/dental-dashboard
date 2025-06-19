/**
 * API Route Integration Tests
 *
 * Tests the complete API flow including:
 * - Authentication middleware
 * - Multi-tenant data filtering
 * - Error handling
 * - Response formats
 */

import { GET as getClinicsRoute } from '../clinics/route';
import { POST as createGoalRoute, GET as getGoalsRoute } from '../goals/route';
import { POST as createMetricRoute, GET as getMetricsRoute } from '../metrics/route';
import { POST as createUserRoute, GET as getUsersRoute } from '../users/route';
import { prisma } from '@/lib/database/prisma';
import type { MetricDefinition, User } from '@prisma/client';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock auth context for testing
vi.mock('@/lib/database/auth-context', () => ({
  getAuthContext: vi.fn(),
  validateClinicAccess: vi.fn(),
  isClinicAdmin: vi.fn(),
}));

// Import mocked functions
import {
  type AuthContext,
  getAuthContext,
  isClinicAdmin,
  validateClinicAccess,
} from '@/lib/database/auth-context';

// Test data
const testData = {
  clinics: [
    { id: uuidv4(), name: 'API Test Clinic A', location: 'API City A' },
    { id: uuidv4(), name: 'API Test Clinic B', location: 'API City B' },
  ],
  users: [
    {
      id: uuidv4(),
      authId: uuidv4(),
      email: 'api.admin@testclinica.com',
      name: 'API Admin A',
      role: 'clinic_admin',
      clinicId: '', // Will be set to clinic A
    },
    {
      id: uuidv4(),
      authId: uuidv4(),
      email: 'api.provider@testclinica.com',
      name: 'API Provider A',
      role: 'provider',
      clinicId: '', // Will be set to clinic A
    },
  ],
  authContexts: {} as Record<string, AuthContext>,
};

describe('API Route Integration Tests', () => {
  beforeAll(async () => {
    // Set clinic IDs
    testData.users[0].clinicId = testData.clinics[0].id;
    testData.users[1].clinicId = testData.clinics[0].id;

    // Create test data
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

    for (const user of testData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          authId: user.authId,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinicId,
        },
      });

      // Create clinic role
      await prisma.userClinicRole.create({
        data: {
          userId: user.id,
          clinicId: user.clinicId,
          role: user.role,
          isActive: true,
        },
      });
    }

    // Setup auth contexts
    testData.authContexts.admin = {
      userId: testData.users[0].id,
      authId: testData.users[0].authId,
      clinicIds: [testData.clinics[0].id],
      currentClinicId: testData.clinics[0].id,
      role: 'clinic_admin',
    };

    testData.authContexts.provider = {
      userId: testData.users[1].id,
      authId: testData.users[1].authId,
      clinicIds: [testData.clinics[0].id],
      currentClinicId: testData.clinics[0].id,
      role: 'provider',
    };
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.goalProgress.deleteMany({
      where: { goal: { clinicId: { in: testData.clinics.map((c) => c.id) } } },
    });
    await prisma.goal.deleteMany({
      where: { clinicId: { in: testData.clinics.map((c) => c.id) } },
    });
    await prisma.metricValue.deleteMany({
      where: { clinicId: { in: testData.clinics.map((c) => c.id) } },
    });
    await prisma.userClinicRole.deleteMany({
      where: { clinicId: { in: testData.clinics.map((c) => c.id) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: testData.users.map((u) => u.id) } },
    });
    await prisma.clinic.deleteMany({
      where: { id: { in: testData.clinics.map((c) => c.id) } },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Users API', () => {
    it('should return users filtered by clinic access', async () => {
      // Mock auth context
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/users');

      // Call route
      const response = await getUsersRoute(request, {});

      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.every((u: User) => u.clinicId === testData.clinics[0].id)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=1');
      const response = await getUsersRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(1);
      expect(data.pagination.limit).toBe(1);
      expect(data.pagination.page).toBe(1);
    });

    it('should create user with clinic admin permission', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);
      vi.mocked(isClinicAdmin).mockResolvedValue(true);

      const newUser = {
        email: 'newuser@api.test',
        name: 'New API User',
        role: 'viewer',
        clinicId: testData.clinics[0].id,
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });

      const response = await createUserRoute(request, {});

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.email).toBe(newUser.email);

      // Cleanup
      await prisma.user.delete({ where: { email: newUser.email } });
    });

    it('should reject user creation without admin permission', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.provider);
      vi.mocked(isClinicAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'rejected@api.test',
          name: 'Rejected User',
          role: 'viewer',
          clinicId: testData.clinics[0].id,
        }),
      });

      const response = await createUserRoute(request, {});

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Only clinic administrators');
    });

    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await getUsersRoute(request, {});

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Clinics API', () => {
    it('should return only accessible clinics', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/clinics');
      const response = await getClinicsRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe(testData.clinics[0].id);
    });

    it('should include statistics when requested', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/clinics?includeStats=true');
      const response = await getClinicsRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data[0]._count).toBeDefined();
    });
  });

  describe('Metrics API', () => {
    let metricDefinition: MetricDefinition;

    beforeAll(async () => {
      // Create metric definition
      metricDefinition = await prisma.metricDefinition.create({
        data: {
          name: 'API Test Metric',
          category: 'test',
          unit: 'count',
          type: 'gauge',
          aggregationMethod: 'sum',
        },
      });
    });

    afterAll(async () => {
      await prisma.metricDefinition.delete({
        where: { id: metricDefinition.id },
      });
    });

    it('should filter metrics by clinic access', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      // Create metrics for both clinics
      await prisma.metricValue.create({
        data: {
          clinicId: testData.clinics[0].id,
          metricDefinitionId: metricDefinition.id,
          value: 100,
          date: new Date(),
        },
      });

      await prisma.metricValue.create({
        data: {
          clinicId: testData.clinics[1].id,
          metricDefinitionId: metricDefinition.id,
          value: 200,
          date: new Date(),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/metrics');
      const response = await getMetricsRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(
        data.data.every((m: { clinicId: string }) => m.clinicId === testData.clinics[0].id)
      ).toBe(true);
      expect(data.data.some((m: { value: number }) => m.value === 200)).toBe(false);
    });

    it('should create metric with valid data', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);
      vi.mocked(validateClinicAccess).mockResolvedValue(true);

      const newMetric = {
        clinicId: testData.clinics[0].id,
        metricDefinitionId: metricDefinition.id,
        value: 150,
        date: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/metrics', {
        method: 'POST',
        body: JSON.stringify(newMetric),
      });

      const response = await createMetricRoute(request, {});

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.value).toBe(150);
    });

    it('should filter metrics by date range', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const request = new NextRequest(
        `http://localhost:3000/api/metrics?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await getMetricsRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
    });
  });

  describe('Goals API', () => {
    it('should create and retrieve goals with proper filtering', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);
      vi.mocked(isClinicAdmin).mockResolvedValue(true);

      // Create a goal
      const newGoal = {
        name: 'API Test Goal',
        clinicId: testData.clinics[0].id,
        targetValue: 1000,
        currentValue: 0,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'monthly',
        status: 'active',
      };

      const createRequest = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(newGoal),
      });

      const createResponse = await createGoalRoute(createRequest, {});
      expect(createResponse.status).toBe(201);
      const createdGoal = await createResponse.json();

      // Retrieve goals
      const getRequest = new NextRequest('http://localhost:3000/api/goals');
      const getResponse = await getGoalsRoute(getRequest, {});

      expect(getResponse.status).toBe(200);
      const data = await getResponse.json();
      expect(data.data.some((g: { id: string }) => g.id === createdGoal.id)).toBe(true);
    });

    it('should filter goals by status', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/goals?status=active');
      const response = await getGoalsRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.every((g: { status: string }) => g.status === 'active')).toBe(true);
    });

    it('should reject goal creation for non-admin users', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.provider);
      vi.mocked(isClinicAdmin).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Rejected Goal',
          clinicId: testData.clinics[0].id,
          targetValue: 500,
          currentValue: 0,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          frequency: 'monthly',
          status: 'active',
        }),
      });

      const response = await createGoalRoute(request, {});

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Clinic admin access required');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: 'invalid json',
      });

      // Mock JSON parsing error
      request.json = vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON'));

      const response = await createUserRoute(request, {});

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });

    it('should handle database errors', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      // Mock prisma error
      const originalFindMany = prisma.user.findMany;
      prisma.user.findMany = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await getUsersRoute(request, {});

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Failed to fetch users');

      // Restore original function
      prisma.user.findMany = originalFindMany;
    });

    it('should validate request data with Zod', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);
      vi.mocked(isClinicAdmin).mockResolvedValue(true);

      const invalidUser = {
        email: 'not-an-email',
        name: 'A', // Too short
        role: 'invalid_role',
        clinicId: 'not-a-uuid',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidUser),
      });

      const response = await createUserRoute(request, {});

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('Pagination & Filtering', () => {
    it('should handle complex query parameters', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest(
        'http://localhost:3000/api/users?page=1&limit=5&role=provider&sortBy=name&sortOrder=desc'
      );
      const response = await getUsersRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.limit).toBe(5);
      expect(data.data.every((u: { role: string }) => u.role === 'provider')).toBe(true);
    });

    it('should enforce maximum pagination limit', async () => {
      vi.mocked(getAuthContext).mockResolvedValue(testData.authContexts.admin);

      const request = new NextRequest('http://localhost:3000/api/users?limit=1000');
      const response = await getUsersRoute(request, {});

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.limit).toBeLessThanOrEqual(100);
    });
  });
});
