import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateClinicAccess, getServiceContext } from '../auth-context';
import { getClinicFilter } from '../queries/utils';
import type { AuthContext } from '../auth-context';

// Mock the prisma client
vi.mock('../client', () => ({
  prisma: {
    clinic: {
      findUnique: vi.fn(),
    },
    metricValue: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
    },
  },
}));

describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateClinicAccess', () => {
    it('should return true for specific clinic access', () => {
      const authContext: AuthContext = {
        userId: 'user123',
        authId: 'auth123',
        clinicIds: ['clinic1', 'clinic2'],
        currentClinicId: 'clinic1',
        role: 'provider',
      };

      expect(validateClinicAccess(authContext, 'clinic1')).toBe(true);
      expect(validateClinicAccess(authContext, 'clinic2')).toBe(true);
    });

    it('should return false for clinic without access', () => {
      const authContext: AuthContext = {
        userId: 'user123',
        authId: 'auth123',
        clinicIds: ['clinic1', 'clinic2'],
        currentClinicId: 'clinic1',
        role: 'provider',
      };

      expect(validateClinicAccess(authContext, 'clinic3')).toBe(false);
      expect(validateClinicAccess(authContext, 'nonexistent')).toBe(false);
    });

    it('should return true for wildcard access', () => {
      const authContext: AuthContext = {
        userId: 'system',
        authId: 'system',
        clinicIds: ['*'],
        role: 'system',
        isSystemAdmin: true,
      };

      expect(validateClinicAccess(authContext, 'clinic1')).toBe(true);
      expect(validateClinicAccess(authContext, 'clinic2')).toBe(true);
      expect(validateClinicAccess(authContext, 'any-clinic-id')).toBe(true);
      expect(validateClinicAccess(authContext, 'nonexistent')).toBe(true);
    });

    it('should return true for wildcard access even with other clinic IDs', () => {
      const authContext: AuthContext = {
        userId: 'system',
        authId: 'system',
        clinicIds: ['*', 'clinic1', 'clinic2'],
        role: 'system',
        isSystemAdmin: true,
      };

      expect(validateClinicAccess(authContext, 'clinic1')).toBe(true);
      expect(validateClinicAccess(authContext, 'clinic3')).toBe(true);
      expect(validateClinicAccess(authContext, 'any-clinic-id')).toBe(true);
    });

    it('should handle empty clinic IDs array', () => {
      const authContext: AuthContext = {
        userId: 'user123',
        authId: 'auth123',
        clinicIds: [],
        currentClinicId: undefined,
        role: 'provider',
      };

      expect(validateClinicAccess(authContext, 'clinic1')).toBe(false);
      expect(validateClinicAccess(authContext, 'any-clinic')).toBe(false);
    });
  });

  describe('getServiceContext', () => {
    it('should return service context with wildcard access', () => {
      const serviceContext = getServiceContext();

      expect(serviceContext.userId).toBe('system');
      expect(serviceContext.authId).toBe('system');
      expect(serviceContext.clinicIds).toEqual(['*']);
      expect(serviceContext.role).toBe('system');
      expect(serviceContext.isSystemAdmin).toBe(true);
    });

    it('should allow access to any clinic through validateClinicAccess', () => {
      const serviceContext = getServiceContext();

      expect(validateClinicAccess(serviceContext, 'clinic1')).toBe(true);
      expect(validateClinicAccess(serviceContext, 'clinic2')).toBe(true);
      expect(validateClinicAccess(serviceContext, 'any-clinic-id')).toBe(true);
    });
  });

  describe('getClinicFilter', () => {
    it('should return specific clinic for regular users with access', () => {
      const authContext: AuthContext = {
        userId: 'user123',
        authId: 'auth123',
        clinicIds: ['clinic1', 'clinic2'],
        currentClinicId: 'clinic1',
        role: 'provider',
      };

      expect(getClinicFilter(authContext, 'clinic1')).toBe('clinic1');
      expect(getClinicFilter(authContext, 'clinic2')).toBe('clinic2');
    });

    it('should throw error for regular users without access', () => {
      const authContext: AuthContext = {
        userId: 'user123',
        authId: 'auth123',
        clinicIds: ['clinic1', 'clinic2'],
        currentClinicId: 'clinic1',
        role: 'provider',
      };

      expect(() => getClinicFilter(authContext, 'clinic3')).toThrow('Access denied to requested clinic');
    });

    it('should allow wildcard access to any clinic', () => {
      const authContext: AuthContext = {
        userId: 'system',
        authId: 'system',
        clinicIds: ['*'],
        role: 'system',
        isSystemAdmin: true,
      };

      expect(getClinicFilter(authContext, 'clinic1')).toBe('clinic1');
      expect(getClinicFilter(authContext, 'clinic2')).toBe('clinic2');
      expect(getClinicFilter(authContext, 'any-clinic-id')).toBe('any-clinic-id');
    });

    it('should allow system admin access to any clinic', () => {
      const authContext: AuthContext = {
        userId: 'admin',
        authId: 'admin',
        clinicIds: ['clinic1'],
        role: 'system_admin',
        isSystemAdmin: true,
      };

      expect(getClinicFilter(authContext, 'clinic1')).toBe('clinic1');
      expect(getClinicFilter(authContext, 'clinic2')).toBe('clinic2');
      expect(getClinicFilter(authContext, 'any-clinic-id')).toBe('any-clinic-id');
    });
  });

  describe('Integration with Query Functions', () => {
    it('should allow service context to access any clinic through getClinicFilter', async () => {
      const serviceContext = getServiceContext();

      // Test that service context can access any clinic
      expect(() => getClinicFilter(serviceContext, 'clinic1')).not.toThrow();
      expect(() => getClinicFilter(serviceContext, 'clinic2')).not.toThrow();
      expect(() => getClinicFilter(serviceContext, 'any-clinic-id')).not.toThrow();

      expect(getClinicFilter(serviceContext, 'clinic1')).toBe('clinic1');
      expect(getClinicFilter(serviceContext, 'clinic2')).toBe('clinic2');
      expect(getClinicFilter(serviceContext, 'any-clinic-id')).toBe('any-clinic-id');
    });

    it('should work with actual query functions', async () => {
      const { prisma } = await import('../client');
      const clinicQueries = await import('../queries/clinics');

      const serviceContext = getServiceContext();

      // Mock the database response
      vi.mocked(prisma.clinic.findUnique).mockResolvedValue({
        id: 'test-clinic',
        name: 'Test Clinic',
        status: 'active',
      } as any);

      // This should not throw an error with wildcard access
      await expect(clinicQueries.getClinicById(serviceContext, 'test-clinic')).resolves.toBeDefined();

      // Verify the clinic was queried
      expect(prisma.clinic.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-clinic' },
        include: expect.any(Object),
      });
    });
  });
});
