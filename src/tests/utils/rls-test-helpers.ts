/**
 * RLS Test Helpers
 * Utilities for testing Row Level Security policies
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { validateTestEnvironment } from '@/lib/config/environment';

const testEnv = validateTestEnvironment();

// Admin client for setup/teardown
export const supabaseAdmin = createClient(
  testEnv.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'
);

// Anonymous client for testing public access
export const supabaseAnon = createClient(
  testEnv.NEXT_PUBLIC_SUPABASE_URL,
  testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export interface TestUser {
  id: string;
  authId: string;
  email: string;
  clinicId: string;
  role: string;
}

export interface TestClinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
}

/**
 * Create a test clinic
 */
export async function createTestClinic(name: string): Promise<TestClinic> {
  const clinic: TestClinic = {
    id: uuidv4(),
    name,
    address: '123 Test St',
    phone: '555-0123',
    email: `${name.toLowerCase().replace(/\s+/g, '')}@test.com`,
    status: 'active',
  };

  const { error } = await supabaseAdmin
    .from('clinics')
    .insert({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      status: clinic.status,
    });

  if (error) {
    throw new Error(`Failed to create test clinic: ${error.message}`);
  }

  return clinic;
}

/**
 * Create a test user with clinic association
 */
export async function createTestUser(
  clinicId: string,
  role: string,
  email: string
): Promise<TestUser> {
  const authId = uuidv4();
  const userId = uuidv4();

  // Create auth user
  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      name: email.split('@')[0],
      role,
      clinic_id: clinicId,
    },
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  // Create database user
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      auth_id: authId,
      email,
      name: email.split('@')[0],
      role,
      clinic_id: clinicId,
    });

  if (dbError) {
    throw new Error(`Failed to create database user: ${dbError.message}`);
  }

  // Create user clinic role
  const { error: roleError } = await supabaseAdmin
    .from('user_clinic_roles')
    .insert({
      user_id: userId,
      clinic_id: clinicId,
      role,
      is_active: true,
    });

  if (roleError) {
    throw new Error(`Failed to create user clinic role: ${roleError.message}`);
  }

  return {
    id: userId,
    authId,
    email,
    clinicId,
    role,
  };
}

/**
 * Create an authenticated Supabase client for a test user
 */
export function createAuthenticatedClient(user: TestUser) {
  const client = createClient(
    testEnv.NEXT_PUBLIC_SUPABASE_URL,
    testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Mock the session for this client
  const mockUser = {
    id: user.authId,
    email: user.email,
    role: 'authenticated' as const,
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {
      clinic_id: user.clinicId,
      role: user.role,
    },
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer' as const,
    user: mockUser,
  };

  // Override the auth methods for testing
  client.auth.getSession = async () => ({
    data: { session: mockSession },
    error: null,
  });

  client.auth.getUser = async () => ({
    data: { user: mockUser },
    error: null,
  });

  return client;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(
  users: TestUser[],
  clinics: TestClinic[]
): Promise<void> {
  try {
    // Delete user clinic roles
    await supabaseAdmin
      .from('user_clinic_roles')
      .delete()
      .in('user_id', users.map(u => u.id));

    // Delete database users
    await supabaseAdmin
      .from('users')
      .delete()
      .in('id', users.map(u => u.id));

    // Delete auth users
    for (const user of users) {
      await supabaseAdmin.auth.admin.deleteUser(user.authId);
    }

    // Delete clinics
    await supabaseAdmin
      .from('clinics')
      .delete()
      .in('id', clinics.map(c => c.id));
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Test RLS isolation between clinics
 */
export async function testRLSIsolation(
  table: string,
  userA: TestUser,
  userB: TestUser,
  testData: { clinic_a_data: Record<string, unknown>; clinic_b_data: Record<string, unknown> }
): Promise<void> {
  const clientA = createAuthenticatedClient(userA);
  const clientB = createAuthenticatedClient(userB);

  // Insert test data as admin
  await supabaseAdmin.from(table).insert([
    { ...testData.clinic_a_data, clinic_id: userA.clinicId },
    { ...testData.clinic_b_data, clinic_id: userB.clinicId },
  ]);

  // Test that User A can only see their clinic's data
  const { data: dataA } = await clientA.from(table).select('*');
  const userACanSeeOnlyTheirData = dataA?.every(
    (row: Record<string, unknown>) => row.clinic_id === userA.clinicId
  );

  // Test that User B can only see their clinic's data
  const { data: dataB } = await clientB.from(table).select('*');
  const userBCanSeeOnlyTheirData = dataB?.every(
    (row: Record<string, unknown>) => row.clinic_id === userB.clinicId
  );

  if (!userACanSeeOnlyTheirData || !userBCanSeeOnlyTheirData) {
    throw new Error(`RLS isolation failed for table ${table}`);
  }

  // Cleanup test data
  await supabaseAdmin
    .from(table)
    .delete()
    .in('clinic_id', [userA.clinicId, userB.clinicId]);
}

// Service client alias for backward compatibility
export const serviceClient = supabaseAdmin;