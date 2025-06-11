/**
 * Performance Tests for Multi-Tenant System
 *
 * Tests system performance under various loads including:
 * - Query performance with RLS
 * - Concurrent user operations
 * - Large dataset handling
 * - Trigger and function performance
 */

import { prisma } from '@/lib/database/client';
import * as goalQueries from '@/lib/database/queries/goals';
import * as metricQueries from '@/lib/database/queries/metrics';
import * as userQueries from '@/lib/database/queries/users';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  singleQuery: 50,
  complexQuery: 200,
  bulkInsert: 1000,
  aggregation: 500,
  concurrent: 1000,
};

// Test data
const perfTestData = {
  clinics: [] as unknown[],
  users: [] as unknown[],
  authContexts: [] as unknown[],
  metricDefinition: null as unknown,
};

describe('Performance Tests', () => {
  beforeAll(async () => {
    // Create test clinics
    for (let i = 0; i < 5; i++) {
      const clinic = await prisma.clinic.create({
        data: {
          id: uuidv4(),
          name: `Perf Test Clinic ${i}`,
          location: `City ${i}`,
          status: 'active',
        },
      });
      perfTestData.clinics.push(clinic);
    }

    // Create metric definition
    perfTestData.metricDefinition = await prisma.metricDefinition.create({
      data: {
        name: 'Performance Test Metric',
        category: 'test',
        unit: 'count',
        type: 'gauge',
        aggregationMethod: 'sum',
      },
    });

    // Create users for each clinic (10 users per clinic)
    for (const clinic of perfTestData.clinics) {
      for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
          data: {
            id: uuidv4(),
            authId: uuidv4(),
            email: `perf.user${i}@${clinic.id}.com`,
            name: `Perf User ${i}`,
            role: i === 0 ? 'clinic_admin' : 'provider',
            clinicId: clinic.id,
          },
        });

        await prisma.userClinicRole.create({
          data: {
            userId: user.id,
            clinicId: clinic.id,
            role: user.role,
            isActive: true,
          },
        });

        perfTestData.users.push(user);
      }
    }

    // Create auth contexts for testing
    for (const clinic of perfTestData.clinics) {
      const adminUser = perfTestData.users.find(
        (u) => u.clinicId === clinic.id && u.role === 'clinic_admin'
      );

      perfTestData.authContexts.push({
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [clinic.id],
        currentClinicId: clinic.id,
        role: 'clinic_admin',
      });
    }

    // Create 1000 metric values per clinic
    const metricBulkData = [];
    for (const clinic of perfTestData.clinics) {
      for (let i = 0; i < 1000; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));

        metricBulkData.push({
          id: uuidv4(),
          clinicId: clinic.id,
          metricDefinitionId: perfTestData.metricDefinition.id,
          value: Math.random() * 10000,
          date,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await prisma.metricValue.createMany({
      data: metricBulkData,
    });

    // Create goals
    for (const clinic of perfTestData.clinics) {
      for (let i = 0; i < 20; i++) {
        await prisma.goal.create({
          data: {
            id: uuidv4(),
            name: `Perf Goal ${i}`,
            clinicId: clinic.id,
            targetValue: 10000,
            currentValue: Math.random() * 10000,
            targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            frequency: 'monthly',
            status: 'active',
          },
        });
      }
    }
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    // Clean up in reverse order of dependencies
    await prisma.goalProgress.deleteMany({
      where: { goal: { clinicId: { in: perfTestData.clinics.map((c) => c.id) } } },
    });
    await prisma.goal.deleteMany({
      where: { clinicId: { in: perfTestData.clinics.map((c) => c.id) } },
    });
    await prisma.metricValue.deleteMany({
      where: { clinicId: { in: perfTestData.clinics.map((c) => c.id) } },
    });
    await prisma.userClinicRole.deleteMany({
      where: { clinicId: { in: perfTestData.clinics.map((c) => c.id) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: perfTestData.users.map((u) => u.id) } },
    });
    await prisma.clinic.deleteMany({
      where: { id: { in: perfTestData.clinics.map((c) => c.id) } },
    });

    if (perfTestData.metricDefinition) {
      await prisma.metricDefinition.delete({
        where: { id: perfTestData.metricDefinition.id },
      });
    }
  }, 60000);

  describe('Query Performance with RLS', () => {
    it('should execute single user query within threshold', async () => {
      const authContext = perfTestData.authContexts[0];

      const start = Date.now();
      const result = await userQueries.getUsers(authContext, {
        limit: 10,
        offset: 0,
      });
      const duration = Date.now() - start;

      expect(result.users).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.singleQuery);
    });

    it('should execute filtered queries efficiently', async () => {
      const authContext = perfTestData.authContexts[0];

      const start = Date.now();
      const result = await userQueries.getUsers(authContext, {
        role: 'provider',
        limit: 20,
        offset: 0,
      });
      const duration = Date.now() - start;

      expect(result.users.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(THRESHOLDS.singleQuery * 2);
    });

    it('should handle large metric queries efficiently', async () => {
      const authContext = perfTestData.authContexts[0];

      const start = Date.now();
      const result = await metricQueries.getMetricValues(authContext, {
        clinicId: perfTestData.clinics[0].id,
        limit: 100,
        offset: 0,
      });
      const duration = Date.now() - start;

      expect(result.metrics).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.complexQuery);
    });

    it('should execute aggregation queries within threshold', async () => {
      const clinicId = perfTestData.clinics[0].id;
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const start = Date.now();
      const result = await prisma.$queryRaw`
        SELECT * FROM calculate_clinic_metrics(
          ${clinicId}::text,
          ${startDate}::date,
          ${endDate}::date
        )
      `;
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.aggregation);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent reads efficiently', async () => {
      const promises = [];
      const authContext = perfTestData.authContexts[0];

      const start = Date.now();

      // Execute 10 concurrent queries
      for (let i = 0; i < 10; i++) {
        promises.push(
          userQueries.getUsers(authContext, {
            limit: 10,
            offset: i * 10,
          })
        );
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(THRESHOLDS.concurrent);
    });

    it('should handle mixed read/write operations', async () => {
      const authContext = perfTestData.authContexts[0];
      const promises = [];

      const start = Date.now();

      // Mix of reads and writes
      for (let i = 0; i < 5; i++) {
        // Read operation
        promises.push(
          metricQueries.getMetricValues(authContext, {
            limit: 10,
            offset: 0,
          })
        );

        // Write operation
        promises.push(
          metricQueries.createMetricValue(authContext, {
            clinicId: perfTestData.clinics[0].id,
            metricDefinitionId: perfTestData.metricDefinition.id,
            value: Math.random() * 1000,
            date: new Date(),
          })
        );
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(THRESHOLDS.concurrent * 1.5);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk inserts efficiently', async () => {
      const authContext = perfTestData.authContexts[0];
      const bulkData = [];

      // Prepare 100 metric values
      for (let i = 0; i < 100; i++) {
        bulkData.push({
          clinicId: perfTestData.clinics[0].id,
          metricDefinitionId: perfTestData.metricDefinition.id,
          value: Math.random() * 1000,
          date: new Date(),
        });
      }

      const start = Date.now();

      // Insert in batches
      const batchSize = 10;
      for (let i = 0; i < bulkData.length; i += batchSize) {
        const batch = bulkData.slice(i, i + batchSize);
        await Promise.all(batch.map((data) => metricQueries.createMetricValue(authContext, data)));
      }

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(THRESHOLDS.bulkInsert);
    });

    it('should handle bulk updates efficiently', async () => {
      const authContext = perfTestData.authContexts[0];

      // Get goals to update
      const goals = await goalQueries.getGoals(authContext, {
        status: 'active',
        limit: 20,
      });

      const start = Date.now();

      // Update all goals
      await Promise.all(
        goals.goals.map((goal) =>
          goalQueries.updateGoal(authContext, goal.id, {
            currentValue: goal.currentValue + 100,
          })
        )
      );

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(THRESHOLDS.bulkInsert);
    });
  });

  describe('Database Function Performance', () => {
    it('should execute helper functions efficiently', async () => {
      const authId = perfTestData.users[0].authId;

      const start = Date.now();
      const result = await prisma.$queryRaw`
        SELECT * FROM get_user_clinics(${authId}::text)
      `;
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.singleQuery);
    });

    it('should check clinic access quickly', async () => {
      const authId = perfTestData.users[0].authId;
      const clinicId = perfTestData.clinics[0].id;

      const start = Date.now();
      const result = await prisma.$queryRaw`
        SELECT check_clinic_access(
          ${authId}::text,
          ${clinicId}::text,
          NULL
        ) as has_access
      `;
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.singleQuery);
    });

    it('should handle trigger execution efficiently', async () => {
      const goalId = uuidv4();

      // Create goal and measure trigger execution
      const start = Date.now();

      const goal = await prisma.goal.create({
        data: {
          id: goalId,
          name: 'Trigger Performance Test',
          clinicId: perfTestData.clinics[0].id,
          targetValue: 100,
          currentValue: 0,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          frequency: 'monthly',
          status: 'active',
        },
      });

      // Add progress that should trigger completion
      await prisma.goalProgress.create({
        data: {
          goalId: goal.id,
          date: new Date(),
          currentValue: 100,
          notes: 'Completed',
        },
      });

      const duration = Date.now() - start;

      // Verify trigger worked
      const updatedGoal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      expect(updatedGoal?.status).toBe('completed');
      expect(duration).toBeLessThan(THRESHOLDS.complexQuery);

      // Cleanup
      await prisma.goal.delete({ where: { id: goalId } });
    });
  });

  describe('Pagination Performance', () => {
    it('should maintain consistent performance across pages', async () => {
      const authContext = perfTestData.authContexts[0];
      const pageTimes = [];

      // Test first 5 pages
      for (let page = 0; page < 5; page++) {
        const start = Date.now();
        await metricQueries.getMetricValues(authContext, {
          limit: 50,
          offset: page * 50,
        });
        const duration = Date.now() - start;
        pageTimes.push(duration);
      }

      // Check that all pages load within threshold
      pageTimes.forEach((time, _index) => {
        expect(time).toBeLessThan(THRESHOLDS.complexQuery);
      });

      // Check that performance doesn't degrade significantly
      const avgTime = pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length;
      const maxDeviation = Math.max(...pageTimes.map((t) => Math.abs(t - avgTime)));

      expect(maxDeviation).toBeLessThan(avgTime * 0.5); // Max 50% deviation
    });
  });

  describe('Complex Query Performance', () => {
    it('should execute multi-join queries efficiently', async () => {
      const authContext = perfTestData.authContexts[0];

      const start = Date.now();

      // Complex query with multiple joins
      const result = await prisma.goal.findMany({
        where: {
          clinicId: { in: authContext.clinicIds },
          status: 'active',
        },
        include: {
          clinic: true,
          provider: true,
          metric: true,
          goalProgress: {
            orderBy: { date: 'desc' },
            take: 5,
          },
        },
        take: 10,
      });

      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.complexQuery);
    });

    it('should execute date range queries efficiently', async () => {
      const authContext = perfTestData.authContexts[0];
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const start = Date.now();

      const result = await metricQueries.getMetricValues(authContext, {
        startDate,
        endDate,
        limit: 100,
      });

      const duration = Date.now() - start;

      expect(result.metrics).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.complexQuery);
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with large dataset', async () => {
      const authContext = perfTestData.authContexts[0];

      // Count total metrics for the clinic
      const _totalCount = await prisma.metricValue.count({
        where: { clinicId: perfTestData.clinics[0].id },
      });

      // Query with large limit
      const start = Date.now();
      const result = await metricQueries.getMetricValues(authContext, {
        limit: 500,
        offset: 0,
      });
      const duration = Date.now() - start;

      expect(result.metrics.length).toBeLessThanOrEqual(500);
      expect(duration).toBeLessThan(THRESHOLDS.complexQuery * 2);
    });

    it('should handle aggregations on large datasets', async () => {
      const clinicId = perfTestData.clinics[0].id;

      const start = Date.now();

      // Aggregate metrics for the entire year
      const result = await prisma.metricValue.groupBy({
        by: ['metricDefinitionId'],
        where: {
          clinicId,
          date: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: {
          value: true,
        },
        _avg: {
          value: true,
        },
        _count: true,
      });

      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(THRESHOLDS.aggregation);
    });
  });
});
