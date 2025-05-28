/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthContext } from '../auth-context'
import * as userQueries from '../queries/users'
import * as clinicQueries from '../queries/clinics'
import * as metricQueries from '../queries/metrics'
import * as goalQueries from '../queries/goals'
import * as googleSheetsQueries from '../queries/google-sheets'

// Mock Prisma client
vi.mock('../client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    clinic: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userClinicRole: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    metricValue: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    metricDefinition: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    dataSource: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    columnMapping: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    provider: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    goalTemplate: {
      findUnique: vi.fn(),
    },
    metricAggregation: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Mock auth context functions
vi.mock('../auth-context', async () => {
  const actual = await vi.importActual('../auth-context')
  return {
    ...actual,
    validateClinicAccess: vi.fn(),
    getUserClinicRole: vi.fn(),
    isClinicAdmin: vi.fn(),
  }
})

describe('Query Layer - Multi-Tenant Support', () => {
  const mockAuthContext: AuthContext = {
    userId: 'user123',
    authId: 'auth123',
    clinicIds: ['clinic1', 'clinic2'],
    currentClinicId: 'clinic1',
    role: 'office_manager',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Queries', () => {
    it('should filter users by accessible clinics', async () => {
      const { prisma } = await import('../client')
      vi.mocked(prisma.user.findMany).mockResolvedValue([])
      vi.mocked(prisma.user.count).mockResolvedValue(0)

      await userQueries.getUsers(mockAuthContext)

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clinicId: {
              in: ['clinic1', 'clinic2'],
            },
          },
        })
      )
    })

    it('should validate clinic access when getting specific user', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess } = await import('../auth-context')
      
      const mockUser = {
        id: 'user456',
        email: 'test@example.com',
        name: 'Test User',
        clinicId: 'clinic1',
      }
      
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(validateClinicAccess).mockResolvedValue(true)

      await userQueries.getUserById(mockAuthContext, 'user456')

      expect(validateClinicAccess).toHaveBeenCalledWith(mockAuthContext, 'clinic1')
    })

    it('should restrict user creation to clinic admins', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess } = await import('../auth-context')
      
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(prisma.userClinicRole.findFirst).mockResolvedValue(null)

      await expect(
        userQueries.createUser(mockAuthContext, {
          email: 'new@example.com',
          name: 'New User',
          role: 'staff',
          clinicId: 'clinic1',
        })
      ).rejects.toThrow('Only clinic admins can create users')
    })
  })

  describe('Clinic Queries', () => {
    it('should only return clinics user has access to', async () => {
      const { prisma } = await import('../client')
      vi.mocked(prisma.clinic.findMany).mockResolvedValue([])
      vi.mocked(prisma.clinic.count).mockResolvedValue(2)

      await clinicQueries.getClinics(mockAuthContext)

      expect(prisma.clinic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: {
              in: ['clinic1', 'clinic2'],
            },
            status: 'active',
          },
        })
      )
    })

    it('should validate admin role for clinic updates', async () => {
      const { isClinicAdmin } = await import('../auth-context')
      vi.mocked(isClinicAdmin).mockResolvedValue(false)

      await expect(
        clinicQueries.updateClinic(mockAuthContext, 'clinic1', {
          name: 'Updated Clinic',
        })
      ).rejects.toThrow('Only clinic administrators can update clinic information')
    })
  })

  describe('Metric Queries', () => {
    it('should filter metrics by accessible clinics', async () => {
      const { prisma } = await import('../client')
      vi.mocked(prisma.metricValue.findMany).mockResolvedValue([])
      vi.mocked(prisma.metricValue.count).mockResolvedValue(0)

      await metricQueries.getMetrics(mockAuthContext, {})

      expect(prisma.metricValue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clinicId: {
              in: ['clinic1', 'clinic2'],
            },
          },
        })
      )
    })

    it('should validate role for metric creation', async () => {
      const { validateClinicAccess, getUserClinicRole } = await import('../auth-context')
      const { prisma } = await import('../client')
      
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(getUserClinicRole).mockResolvedValue('viewer')
      vi.mocked(prisma.metricDefinition.findUnique).mockResolvedValue({
        id: 'def1',
        name: 'Test Metric',
      } as any)

      await expect(
        metricQueries.createMetric(mockAuthContext, {
          metricDefinitionId: 'def1',
          date: new Date(),
          value: '100',
          clinicId: 'clinic1',
          sourceType: 'manual',
        })
      ).rejects.toThrow('Insufficient permissions to create metrics')
    })

    it('should compute aggregations when not pre-computed', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess } = await import('../auth-context')
      
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(prisma.metricAggregation.findMany).mockResolvedValue([])
      vi.mocked(prisma.metricValue.findMany).mockResolvedValue([
        {
          date: new Date('2024-01-01'),
          value: '100',
          metricDefinition: { id: 'def1', name: 'Revenue' },
        },
        {
          date: new Date('2024-01-02'),
          value: '150',
          metricDefinition: { id: 'def1', name: 'Revenue' },
        },
      ] as any)

      const result = await metricQueries.getAggregatedMetrics(mockAuthContext, 'clinic1', {
        aggregationType: 'daily',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      })

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('value')
      expect(result[0]).toHaveProperty('count')
    })
  })

  describe('Goal Queries', () => {
    it('should include progress calculation when requested', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess } = await import('../auth-context')
      
      const mockGoal = {
        id: 'goal1',
        clinicId: 'clinic1',
        metricDefinitionId: 'def1',
        targetValue: '1000',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      }
      
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(prisma.goal.findMany).mockResolvedValue([mockGoal] as any)
      vi.mocked(prisma.goal.count).mockResolvedValue(1)
      vi.mocked(prisma.metricValue.findMany).mockResolvedValue([
        { value: '250', date: new Date('2024-01-15') },
        { value: '300', date: new Date('2024-02-15') },
      ] as any)

      const result = await goalQueries.getGoals(mockAuthContext, {}, {
        includeProgress: true,
      })

      expect(result.goals[0]).toHaveProperty('progress')
      expect(result.goals[0].progress).toMatchObject({
        currentValue: 550,
        targetValue: 1000,
        percentage: 55,
      })
    })

    it('should validate provider belongs to clinic', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess, getUserClinicRole } = await import('../auth-context')
      
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(getUserClinicRole).mockResolvedValue('clinic_admin')
      vi.mocked(prisma.metricDefinition.findUnique).mockResolvedValue({
        id: 'def1',
      } as any)
      vi.mocked(prisma.provider.findFirst).mockResolvedValue(null)

      await expect(
        goalQueries.createGoal(mockAuthContext, {
          metricDefinitionId: 'def1',
          timePeriod: 'monthly',
          startDate: new Date(),
          endDate: new Date(),
          targetValue: '1000',
          clinicId: 'clinic1',
          providerId: 'provider999',
        })
      ).rejects.toThrow('Invalid provider for this clinic')
    })
  })

  describe('Google Sheets Queries', () => {
    it('should sanitize tokens in data source responses', async () => {
      const { prisma } = await import('../client')
      
      vi.mocked(prisma.dataSource.findMany).mockResolvedValue([
        {
          id: 'ds1',
          name: 'Test Sheet',
          accessToken: 'secret-token',
          refreshToken: 'secret-refresh',
          clinicId: 'clinic1',
        },
      ] as any)
      vi.mocked(prisma.dataSource.count).mockResolvedValue(1)

      const result = await googleSheetsQueries.getDataSources(mockAuthContext)

      expect(result.dataSources[0].accessToken).toBe('***')
      expect(result.dataSources[0].refreshToken).toBe('***')
    })

    it('should only allow admins to see actual tokens', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess, isClinicAdmin } = await import('../auth-context')
      
      const mockDataSource = {
        id: 'ds1',
        name: 'Test Sheet',
        accessToken: 'secret-token',
        refreshToken: 'secret-refresh',
        clinicId: 'clinic1',
      }
      
      vi.mocked(prisma.dataSource.findUnique).mockResolvedValue(mockDataSource as any)
      vi.mocked(validateClinicAccess).mockResolvedValue(true)
      vi.mocked(isClinicAdmin).mockResolvedValue(true)

      const result = await googleSheetsQueries.getDataSourceById(
        mockAuthContext,
        'ds1',
        { includeToken: true }
      )

      expect(result?.accessToken).toBe('secret-token')
    })

    it('should validate access when creating column mappings', async () => {
      const { prisma } = await import('../client')
      const { validateClinicAccess, isClinicAdmin } = await import('../auth-context')
      
      vi.mocked(prisma.dataSource.findUnique).mockResolvedValue({
        clinicId: 'clinic3', // Different clinic
      } as any)
      vi.mocked(validateClinicAccess).mockResolvedValue(false)

      await expect(
        googleSheetsQueries.createColumnMapping(mockAuthContext, {
          dataSourceId: 'ds1',
          metricDefinitionId: 'def1',
          columnName: 'Revenue',
        })
      ).rejects.toThrow('Access denied to this data source')
    })
  })

  describe('Cross-Clinic Access Prevention', () => {
    it('should prevent access to resources from other clinics', async () => {
      const { validateClinicAccess } = await import('../auth-context')
      vi.mocked(validateClinicAccess).mockResolvedValue(false)

      // Test various queries that should fail
      await expect(
        clinicQueries.getClinicById(mockAuthContext, 'clinic3')
      ).rejects.toThrow('Access denied to this clinic')

      await expect(
        metricQueries.getMetrics(mockAuthContext, { clinicId: 'clinic3' })
      ).rejects.toThrow('Access denied to this clinic')

      await expect(
        goalQueries.getGoals(mockAuthContext, { clinicId: 'clinic3' })
      ).rejects.toThrow('Access denied to this clinic')
    })
  })
})