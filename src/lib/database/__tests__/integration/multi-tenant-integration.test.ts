/**
 * End-to-End Integration Tests for Multi-Tenant System
 * 
 * These tests verify the complete multi-tenant architecture including:
 * - User authentication and authorization
 * - Multi-tenant data isolation
 * - Role-based access control
 * - Database triggers and functions
 * - API route integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/database/client'
import { getAuthContext, validateClinicAccess, isClinicAdmin } from '@/lib/database/auth-context'
import * as userQueries from '@/lib/database/queries/users'
import * as clinicQueries from '@/lib/database/queries/clinics'
import * as metricQueries from '@/lib/database/queries/metrics'
import * as goalQueries from '@/lib/database/queries/goals'
import { v4 as uuidv4 } from 'uuid'

// Test database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Create clients for different test scenarios
const anonClient = createClient(supabaseUrl, supabaseAnonKey)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

// Test data
const testData = {
  clinics: [
    { id: uuidv4(), name: 'Test Clinic A', location: 'City A' },
    { id: uuidv4(), name: 'Test Clinic B', location: 'City B' },
  ],
  users: [
    {
      email: 'admin@testclinica.com',
      password: 'TestPass123!',
      role: 'clinic_admin',
      clinicId: '', // Will be set to clinic A
    },
    {
      email: 'provider@testclinica.com',
      password: 'TestPass123!',
      role: 'provider',
      clinicId: '', // Will be set to clinic A
    },
    {
      email: 'admin@testclinicb.com',
      password: 'TestPass123!',
      role: 'clinic_admin',
      clinicId: '', // Will be set to clinic B
    },
  ],
  authIds: [] as string[],
}

describe('Multi-Tenant Integration Tests', () => {
  beforeAll(async () => {
    // Set clinic IDs
    testData.users[0].clinicId = testData.clinics[0].id
    testData.users[1].clinicId = testData.clinics[0].id
    testData.users[2].clinicId = testData.clinics[1].id

    // Create test clinics
    for (const clinic of testData.clinics) {
      await prisma.clinic.create({
        data: {
          id: clinic.id,
          name: clinic.name,
          location: clinic.location,
          status: 'active',
        },
      })
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
      })

      if (!error && data.user) {
        testData.authIds.push(data.user.id)
      }
    }

    // Wait for triggers to create user profiles
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  afterAll(async () => {
    // Cleanup test data
    try {
      // Delete auth users
      for (const authId of testData.authIds) {
        await serviceClient.auth.admin.deleteUser(authId)
      }

      // Delete test data
      await prisma.goal.deleteMany({
        where: { clinicId: { in: testData.clinics.map(c => c.id) } },
      })
      await prisma.metricValue.deleteMany({
        where: { clinicId: { in: testData.clinics.map(c => c.id) } },
      })
      await prisma.userClinicRole.deleteMany({
        where: { clinicId: { in: testData.clinics.map(c => c.id) } },
      })
      await prisma.user.deleteMany({
        where: { authId: { in: testData.authIds } },
      })
      await prisma.clinic.deleteMany({
        where: { id: { in: testData.clinics.map(c => c.id) } },
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('User Authentication & Profile Creation', () => {
    it('should automatically create user profiles when auth users are created', async () => {
      // Check that all user profiles were created
      const users = await prisma.user.findMany({
        where: { authId: { in: testData.authIds } },
        include: { clinic: true },
      })

      expect(users).toHaveLength(3)
      
      // Verify user details
      const adminUserA = users.find(u => u.email === 'admin@testclinica.com')
      expect(adminUserA).toBeDefined()
      expect(adminUserA?.role).toBe('clinic_admin')
      expect(adminUserA?.clinicId).toBe(testData.clinics[0].id)
    })

    it('should create user clinic roles automatically', async () => {
      // Get a test user
      const user = await prisma.user.findFirst({
        where: { email: 'admin@testclinica.com' },
      })

      expect(user).toBeDefined()

      // Check clinic roles
      const roles = await prisma.userClinicRole.findMany({
        where: { userId: user!.id },
      })

      expect(roles).toHaveLength(1)
      expect(roles[0].clinicId).toBe(testData.clinics[0].id)
      expect(roles[0].role).toBe('clinic_admin')
      expect(roles[0].isActive).toBe(true)
    })

    it('should handle user authentication correctly', async () => {
      const { data, error } = await anonClient.auth.signInWithPassword({
        email: 'admin@testclinica.com',
        password: 'TestPass123!',
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()

      // Sign out for cleanup
      await anonClient.auth.signOut()
    })
  })

  describe('Multi-Tenant Data Isolation', () => {
    let authContextA: any
    let authContextB: any

    beforeEach(async () => {
      // Get auth contexts for testing
      authContextA = {
        userId: (await prisma.user.findFirst({ where: { email: 'admin@testclinica.com' } }))!.id,
        authId: testData.authIds[0],
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'clinic_admin',
      }

      authContextB = {
        userId: (await prisma.user.findFirst({ where: { email: 'admin@testclinicb.com' } }))!.id,
        authId: testData.authIds[2],
        clinicIds: [testData.clinics[1].id],
        currentClinicId: testData.clinics[1].id,
        role: 'clinic_admin',
      }
    })

    it('should prevent cross-clinic data access for users', async () => {
      // Admin A should only see Clinic A users
      const usersA = await userQueries.getUsers(authContextA)
      expect(usersA.users.every(u => u.clinicId === testData.clinics[0].id)).toBe(true)

      // Admin B should only see Clinic B users
      const usersB = await userQueries.getUsers(authContextB)
      expect(usersB.users.every(u => u.clinicId === testData.clinics[1].id)).toBe(true)

      // Verify isolation
      const adminAInBResults = usersB.users.find(u => u.email === 'admin@testclinica.com')
      expect(adminAInBResults).toBeUndefined()
    })

    it('should prevent cross-clinic goal access', async () => {
      // Create goals for each clinic
      const goalA = await goalQueries.createGoal(authContextA, {
        name: 'Goal for Clinic A',
        clinicId: testData.clinics[0].id,
        targetValue: 1000,
        currentValue: 0,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        frequency: 'monthly',
        status: 'active',
      })

      const goalB = await goalQueries.createGoal(authContextB, {
        name: 'Goal for Clinic B',
        clinicId: testData.clinics[1].id,
        targetValue: 2000,
        currentValue: 0,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        frequency: 'monthly',
        status: 'active',
      })

      // Verify each admin can only see their clinic's goals
      const goalsA = await goalQueries.getGoals(authContextA)
      expect(goalsA.goals.every(g => g.clinicId === testData.clinics[0].id)).toBe(true)
      expect(goalsA.goals.find(g => g.id === goalB.id)).toBeUndefined()

      const goalsB = await goalQueries.getGoals(authContextB)
      expect(goalsB.goals.every(g => g.clinicId === testData.clinics[1].id)).toBe(true)
      expect(goalsB.goals.find(g => g.id === goalA.id)).toBeUndefined()

      // Try to access cross-clinic goal directly
      const unauthorizedAccess = await goalQueries.getGoalById(authContextA, goalB.id)
      expect(unauthorizedAccess).toBeNull()
    })

    it('should enforce clinic boundaries for metrics', async () => {
      // Create test metric definition
      const metricDef = await prisma.metricDefinition.create({
        data: {
          name: 'Test Production',
          category: 'financial',
          unit: 'currency',
          type: 'gauge',
          aggregationMethod: 'sum',
        },
      })

      // Create metrics for each clinic
      await metricQueries.createMetricValue(authContextA, {
        clinicId: testData.clinics[0].id,
        metricDefinitionId: metricDef.id,
        value: 1000,
        date: new Date(),
      })

      await metricQueries.createMetricValue(authContextB, {
        clinicId: testData.clinics[1].id,
        metricDefinitionId: metricDef.id,
        value: 2000,
        date: new Date(),
      })

      // Verify isolation
      const metricsA = await metricQueries.getMetricValues(authContextA, {
        clinicId: testData.clinics[0].id,
      })
      expect(metricsA.metrics.every(m => m.clinicId === testData.clinics[0].id)).toBe(true)
      expect(metricsA.metrics.some(m => m.value === 2000)).toBe(false)

      const metricsB = await metricQueries.getMetricValues(authContextB, {
        clinicId: testData.clinics[1].id,
      })
      expect(metricsB.metrics.every(m => m.clinicId === testData.clinics[1].id)).toBe(true)
      expect(metricsB.metrics.some(m => m.value === 1000)).toBe(false)
    })
  })

  describe('Role-Based Access Control', () => {
    it('should enforce role hierarchy', async () => {
      // Get users with different roles
      const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@testclinica.com' },
      })
      const providerUser = await prisma.user.findFirst({
        where: { email: 'provider@testclinica.com' },
      })

      expect(adminUser).toBeDefined()
      expect(providerUser).toBeDefined()

      // Create auth contexts
      const adminContext = {
        userId: adminUser!.id,
        authId: adminUser!.authId!,
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'clinic_admin',
      }

      const providerContext = {
        userId: providerUser!.id,
        authId: providerUser!.authId!,
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'provider',
      }

      // Test admin capabilities
      const isAdminForClinic = await isClinicAdmin(adminContext, testData.clinics[0].id)
      expect(isAdminForClinic).toBe(true)

      // Test provider limitations
      const isProviderAdmin = await isClinicAdmin(providerContext, testData.clinics[0].id)
      expect(isProviderAdmin).toBe(false)

      // Test clinic access validation
      const adminHasAccess = await validateClinicAccess(adminContext, testData.clinics[0].id)
      expect(adminHasAccess).toBe(true)

      const providerHasAccess = await validateClinicAccess(providerContext, testData.clinics[0].id)
      expect(providerHasAccess).toBe(true)

      // Test cross-clinic access denial
      const adminNoCrossAccess = await validateClinicAccess(adminContext, testData.clinics[1].id)
      expect(adminNoCrossAccess).toBe(false)
    })

    it('should restrict admin-only operations', async () => {
      // Get provider user
      const providerUser = await prisma.user.findFirst({
        where: { email: 'provider@testclinica.com' },
      })

      const providerContext = {
        userId: providerUser!.id,
        authId: providerUser!.authId!,
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'provider',
      }

      // Try to create a user (admin-only operation)
      await expect(
        userQueries.createUser(providerContext, {
          email: 'newuser@test.com',
          name: 'New User',
          role: 'viewer',
          clinicId: testData.clinics[0].id,
        })
      ).rejects.toThrow('Only clinic administrators can create users')
    })
  })

  describe('Database Triggers & Functions', () => {
    it('should track goal progress automatically', async () => {
      const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@testclinica.com' },
      })

      const authContext = {
        userId: adminUser!.id,
        authId: adminUser!.authId!,
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'clinic_admin',
      }

      // Create a goal
      const goal = await goalQueries.createGoal(authContext, {
        name: 'Test Progress Goal',
        clinicId: testData.clinics[0].id,
        targetValue: 100,
        currentValue: 0,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        frequency: 'monthly',
        status: 'active',
      })

      // Add progress that completes the goal
      await prisma.goalProgress.create({
        data: {
          goalId: goal.id,
          date: new Date(),
          currentValue: 100,
          notes: 'Goal completed!',
        },
      })

      // Check if goal was automatically marked as completed
      const updatedGoal = await goalQueries.getGoalById(authContext, goal.id)
      expect(updatedGoal?.status).toBe('completed')
      expect(updatedGoal?.currentValue).toBe(100)
    })

    it('should create audit logs for sensitive operations', async () => {
      // Create a clinic and check audit log
      const testClinicId = uuidv4()
      await prisma.clinic.create({
        data: {
          id: testClinicId,
          name: 'Audit Test Clinic',
          location: 'Test Location',
          status: 'active',
        },
      })

      // Check if audit log was created
      const auditLog = await prisma.$queryRaw`
        SELECT * FROM audit_logs 
        WHERE table_name = 'clinics' 
        AND record_id = ${testClinicId}
        AND action = 'INSERT'
        ORDER BY created_at DESC
        LIMIT 1
      ` as any[]

      expect(auditLog).toHaveLength(1)
      expect(auditLog[0].table_name).toBe('clinics')
      expect(auditLog[0].action).toBe('INSERT')

      // Cleanup
      await prisma.clinic.delete({ where: { id: testClinicId } })
    })

    it('should validate email format', async () => {
      // Try to create a user with invalid email
      await expect(
        prisma.user.create({
          data: {
            authId: uuidv4(),
            email: 'invalid-email',
            name: 'Test User',
            role: 'viewer',
            clinicId: testData.clinics[0].id,
          },
        })
      ).rejects.toThrow(/Invalid email format/)
    })
  })

  describe('Query Performance', () => {
    it('should efficiently query users with clinic filtering', async () => {
      const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@testclinica.com' },
      })

      const authContext = {
        userId: adminUser!.id,
        authId: adminUser!.authId!,
        clinicIds: [testData.clinics[0].id],
        currentClinicId: testData.clinics[0].id,
        role: 'clinic_admin',
      }

      const start = Date.now()
      const result = await userQueries.getUsers(authContext, {
        limit: 10,
        offset: 0,
      })
      const duration = Date.now() - start

      expect(result.users).toBeDefined()
      expect(duration).toBeLessThan(100) // Should complete within 100ms
    })

    it('should efficiently aggregate metrics', async () => {
      const start = Date.now()
      const result = await prisma.$queryRaw`
        SELECT * FROM calculate_clinic_metrics(
          ${testData.clinics[0].id},
          ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)},
          ${new Date()}
        )
      `
      const duration = Date.now() - start

      expect(result).toBeDefined()
      expect(duration).toBeLessThan(200) // Should complete within 200ms
    })
  })

  describe('Helper Functions', () => {
    it('should correctly return user clinics', async () => {
      const result = await prisma.$queryRaw`
        SELECT * FROM get_user_clinics(${testData.authIds[0]})
      ` as any[]

      expect(result).toHaveLength(1)
      expect(result[0].clinic_id).toBe(testData.clinics[0].id)
      expect(result[0].role).toBe('clinic_admin')
      expect(result[0].is_active).toBe(true)
    })

    it('should validate clinic access correctly', async () => {
      // Check valid access
      const hasAccess = await prisma.$queryRaw`
        SELECT check_clinic_access(
          ${testData.authIds[0]},
          ${testData.clinics[0].id},
          NULL
        ) as has_access
      ` as any[]

      expect(hasAccess[0].has_access).toBe(true)

      // Check invalid access
      const noAccess = await prisma.$queryRaw`
        SELECT check_clinic_access(
          ${testData.authIds[0]},
          ${testData.clinics[1].id},
          NULL
        ) as has_access
      ` as any[]

      expect(noAccess[0].has_access).toBe(false)

      // Check role-based access
      const roleAccess = await prisma.$queryRaw`
        SELECT check_clinic_access(
          ${testData.authIds[1]},
          ${testData.clinics[0].id},
          'clinic_admin'
        ) as has_access
      ` as any[]

      expect(roleAccess[0].has_access).toBe(false) // Provider doesn't have clinic_admin role
    })
  })
})